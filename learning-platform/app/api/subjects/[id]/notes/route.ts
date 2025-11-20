import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/prisma"
import { createFileSearchStore, uploadToFileSearchStore } from "@/lib/gemini"
import { writeFile, unlink } from "fs/promises"
import { join } from "path"
import { tmpdir } from "os"

// POST - Upload a note
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { id } = await params

    // Verify subject belongs to user
    let subject = await prisma.subject.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
    })

    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    if (!file.type.includes("pdf")) {
      return NextResponse.json(
        { error: "Only PDF files are supported for AI features" },
        { status: 400 }
      )
    }

    // Create File Search store if it doesn't exist
    let fileSearchStoreName = subject.fileSearchStoreId
    
    if (!fileSearchStoreName) {
      try {
        fileSearchStoreName = await createFileSearchStore(
          `${subject.displayName}-${subject.id}`
        )
        
        subject = await prisma.subject.update({
          where: { id: subject.id },
          data: { fileSearchStoreId: fileSearchStoreName },
        })
        
        console.log(`Created File Search store: ${fileSearchStoreName}`)
      } catch (error) {
        console.error("Error creating File Search store:", error)
        // Continue without File Search for now
      }
    }

    // Save file temporarily
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const timestamp = Date.now()
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const tempPath = join(tmpdir(), `${timestamp}-${sanitizedFileName}`)
    
    await writeFile(tempPath, buffer)

    let geminiFileName = null
    let documentId = null

    try {
      // Try to upload to File Search store if available
      if (fileSearchStoreName) {
        try {
          const uploadResult = await uploadToFileSearchStore(
            tempPath,
            fileSearchStoreName,
            file.name,
            {
              subjectId: subject.id,
              uploadedBy: user.email,
              uploadedAt: new Date().toISOString(),
            }
          )
          
          geminiFileName = uploadResult.fileName
          documentId = uploadResult.documentId
          console.log(`File uploaded to File Search: ${geminiFileName}`)
        } catch (uploadError) {
          console.error("File Search upload failed, storing metadata only:", uploadError)
        }
      }

      // Create note record
      const note = await prisma.note.create({
        data: {
          subjectId: subject.id,
          displayName: file.name,
          fileName: file.name,
          fileUrl: geminiFileName || `/uploads/${subject.id}/${sanitizedFileName}`,
          fileType: file.type,
          fileSize: file.size,
          fileSearchDocId: documentId,
          metadata: {
            uploadedBy: user.email,
            originalName: file.name,
            geminiFileName: geminiFileName,
            fileSearchEnabled: !!geminiFileName,
          },
        },
      })

      return NextResponse.json({ 
        note,
        message: geminiFileName 
          ? "File uploaded and indexed for AI features" 
          : "File uploaded (AI indexing pending)"
      })
    } finally {
      // Clean up temporary file
      try {
        await unlink(tempPath)
      } catch (error) {
        console.error("Error deleting temp file:", error)
      }
    }
  } catch (error) {
    console.error("Error uploading note:", error)
    return NextResponse.json(
      { error: "Failed to upload note" },
      { status: 500 }
    )
  }
}

// GET - List all notes for a subject
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const notes = await prisma.note.findMany({
      where: {
        subject: {
          id: params.id,
          userId: user.id,
        },
      },
      orderBy: { uploadedAt: "desc" },
    })

    return NextResponse.json({ notes })
  } catch (error) {
    console.error("Error fetching notes:", error)
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    )
  }
}
