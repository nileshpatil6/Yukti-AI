import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { NextRequest } from "next/server"

const handler = async (req: NextRequest, res: any) => {
    // Fix AWS Amplify localhost:3000 issue by dynamically setting NEXTAUTH_URL 
    if (!process.env.NEXTAUTH_URL) {
        const proto = req.headers.get("x-forwarded-proto") || "https"
        const host = req.headers.get("x-forwarded-host") || req.headers.get("host")
        if (host) {
            process.env.NEXTAUTH_URL = `${proto}://${host}`
        }
    }
    return NextAuth(authOptions)(req, res)
}

export { handler as GET, handler as POST }
