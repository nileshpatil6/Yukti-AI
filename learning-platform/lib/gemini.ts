import { GoogleGenerativeAI } from "@google/generative-ai"
import { GoogleGenAI } from "@google/genai"

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ""

export const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null
export const genAIWithFileSearch = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null

// File Search Store Management
export async function createFileSearchStore(displayName: string) {
  try {
    if (!genAIWithFileSearch) {
      throw new Error("Gemini API key not configured")
    }

    // Create File Search store
    const fileSearchStore = await genAIWithFileSearch.fileSearchStores.create({
      config: { displayName }
    })

    console.log(`Created File Search store: ${fileSearchStore.name}`)
    return fileSearchStore.name
  } catch (error) {
    console.error("Error creating file search store:", error)
    throw error
  }
}

export async function uploadToFileSearchStore(
  filePath: string,
  fileSearchStoreName: string,
  displayName: string,
  metadata?: Record<string, any>
) {
  try {
    if (!genAIWithFileSearch) {
      throw new Error("Gemini API not configured")
    }

    console.log(`Uploading ${displayName} to File Search store ${fileSearchStoreName}...`)

    // Upload and import file directly to File Search store
    const operation = await genAIWithFileSearch.fileSearchStores.uploadToFileSearchStore({
      fileSearchStoreName: fileSearchStoreName,
      file: filePath,
      config: {
        displayName: displayName,
        ...(metadata && {
          customMetadata: Object.entries(metadata).map(([key, value]) => ({
            key,
            stringValue: String(value)
          }))
        })
      }
    })

    // Poll for completion
    let currentOperation = operation
    let attempts = 0
    const maxAttempts = 60 // 3 minutes max
    
    while (!currentOperation.done && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 3000))
      currentOperation = await genAIWithFileSearch.operations.get({ operation: currentOperation.name })
      attempts++
    }

    if (!currentOperation.done) {
      throw new Error("Upload operation timed out")
    }

    console.log(`Upload complete: ${displayName}`)

    return {
      done: true,
      documentId: currentOperation.name,
      fileName: displayName,
    }
  } catch (error) {
    console.error("Error uploading to file search store:", error)
    throw error
  }
}

// RAG Query using Gemini
export async function queryWithRAG(
  question: string,
  context: string,
  userProfile?: any
) {
  try {
    if (!genAI) {
      throw new Error("Gemini API not configured")
    }
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    const systemPrompt = userProfile
      ? `You are an AI tutor with the following personality: ${userProfile.aiPersona}.
         The student learns best through: ${userProfile.learningStyle}.
         Their learning pace is: ${userProfile.pace}.
         Their interests are: ${userProfile.interests?.join(", ")}.
         Use these to personalize your teaching style and examples.`
      : "You are a helpful AI tutor."

    const prompt = `${systemPrompt}

Context from student's notes:
${context}

Student's question: ${question}

Provide a clear, helpful answer based on the context provided. If the answer isn't in the context, say so and provide general guidance.`

    const result = await model.generateContent(prompt)
    const response = result.response
    return response.text()
  } catch (error) {
    console.error("Error querying with RAG:", error)
    throw error
  }
}

// Generate Slides
export async function generateSlides(
  topic: string,
  context: string,
  userProfile?: any
) {
  try {
    if (!genAI) {
      throw new Error("Gemini API not configured")
    }
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    const prompt = `You are an expert educator creating engaging slides${
      userProfile
        ? ` for a ${userProfile.learningStyle} learner interested in ${userProfile.interests?.join(", ")}`
        : ""
    }.

Topic: ${topic}

Reference Material:
${context}

Create a comprehensive slide deck with 8-12 slides. For each slide, provide:
1. title: Concise, engaging title
2. mainPoints: 3-5 key bullet points (keep brief)
3. visualDescription: Detailed description of what image/diagram should be shown
4. realWorldExample: A concrete example${
      userProfile?.interests?.length
        ? ` relating to: ${userProfile.interests.join(", ")}`
        : ""
    }
5. practiceQuestion: A thought-provoking question

Format your response as a valid JSON array of slide objects. Return ONLY the JSON, no other text.`

    const result = await model.generateContent(prompt)
    const response = result.response.text()

    // Extract JSON from response
    const jsonMatch = response.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }

    throw new Error("Failed to parse slides JSON")
  } catch (error) {
    console.error("Error generating slides:", error)
    throw error
  }
}

// Generate Quiz
export async function generateQuiz(
  topic: string,
  difficulty: string,
  context: string
) {
  try {
    if (!genAI) {
      throw new Error("Gemini API not configured")
    }
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    const prompt = `Generate a ${difficulty} level quiz about "${topic}" with 10 questions based on this content:

${context}

Include:
- 6 Multiple Choice Questions (4 options each)
- 2 True/False questions
- 2 Short answer questions

For each question provide:
{
  "type": "mcq" | "true-false" | "short-answer",
  "question": "question text",
  "options": ["A", "B", "C", "D"], // Only for MCQ
  "correctAnswer": "the correct answer",
  "explanation": "why this is correct",
  "points": 10
}

Return ONLY a valid JSON array of question objects, no other text.`

    const result = await model.generateContent(prompt)
    const response = result.response.text()

    const jsonMatch = response.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }

    throw new Error("Failed to parse quiz JSON")
  } catch (error) {
    console.error("Error generating quiz:", error)
    throw error
  }
}

// Generate Interactive Game
export async function generateGame(
  topic: string,
  gameType: string,
  context: string
) {
  try {
    if (!genAI) {
      throw new Error("Gemini API not configured")
    }
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    const prompt = `Create an engaging HTML5 game about "${topic}".

Game Type: ${gameType}

Reference Content:
${context}

Requirements:
- Complete HTML file with inline CSS and JavaScript
- Interactive and educational
- Score tracking
- Multiple difficulty levels
- Visual feedback for correct/incorrect actions
- Mobile-friendly controls
- No external dependencies (self-contained)

The game should reinforce key concepts from the topic.

Output ONLY the complete HTML code, nothing else. Start with <!DOCTYPE html>.`

    const result = await model.generateContent(prompt)
    return result.response.text()
  } catch (error) {
    console.error("Error generating game:", error)
    throw error
  }
}

// Generate Flashcards
export async function generateFlashcards(topic: string, context: string) {
  try {
    if (!genAI) {
      throw new Error("Gemini API not configured")
    }
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    const prompt = `Create 20 flashcards for the topic "${topic}" based on this content:

${context}

Each flashcard should have:
{
  "front": "question or term",
  "back": "answer or definition",
  "category": "category name",
  "difficulty": "easy" | "medium" | "hard"
}

Return ONLY a valid JSON array of flashcard objects, no other text.`

    const result = await model.generateContent(prompt)
    const response = result.response.text()

    const jsonMatch = response.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }

    throw new Error("Failed to parse flashcards JSON")
  } catch (error) {
    console.error("Error generating flashcards:", error)
    throw error
  }
}

// Generate Study Plan
export async function generateStudyPlan(
  subjects: Array<{ id: string; name: string; priority: string }>,
  goals: string,
  availableHours: number,
  userProfile?: any
) {
  try {
    if (!genAI) {
      throw new Error("Gemini API not configured")
    }
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    const personalization = userProfile
      ? `
User Profile:
- Learning Style: ${userProfile.learningStyle}
- Pace: ${userProfile.pace}
- Interests: ${userProfile.interests?.join(", ")}

Optimize the study plan for their learning style and pace.`
      : ""

    const subjectsList = subjects
      .map((s) => `- ${s.name} (Priority: ${s.priority})`)
      .join("\n")

    const prompt = `Create a personalized study plan with the following parameters:

Subjects to study:
${subjectsList}

Learning Goals: ${goals}
Available Study Hours per Week: ${availableHours}
${personalization}

Generate a structured study plan in JSON format with:
{
  "weeklySchedule": [
    {
      "day": "Monday",
      "sessions": [
        {
          "subjectId": "subject-id",
          "subjectName": "Subject Name",
          "topic": "Specific topic to study",
          "duration": 60,
          "timeSlot": "Morning",
          "activities": ["Review notes", "Practice problems"]
        }
      ]
    }
  ],
  "milestones": [
    {
      "title": "Milestone name",
      "description": "What to accomplish",
      "dueDate": "2024-12-31",
      "subjectId": "subject-id"
    }
  ],
  "tips": ["Study tip 1", "Study tip 2", ...]
}

Distribute ${availableHours} hours across the week intelligently, prioritizing high-priority subjects.
Include breaks and variety to prevent burnout.

Return ONLY valid JSON. No markdown formatting, no code blocks.`

    const result = await model.generateContent(prompt)
    const response = result.response.text()

    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }

    throw new Error("Failed to parse study plan JSON")
  } catch (error) {
    console.error("Error generating study plan:", error)
    throw error
  }
}

// ============ FILE SEARCH-BASED GENERATION FUNCTIONS ============

export async function generateSlidesWithFileSearch(
  topic: string,
  fileSearchStoreName: string,
  userProfile?: any
) {
  try {
    if (!genAIWithFileSearch) {
      throw new Error("Gemini API not configured")
    }

    const prompt = `You are an expert educator creating engaging slides${
      userProfile
        ? ` for a ${userProfile.learningStyle} learner interested in ${userProfile.interests?.join(", ")}`
        : ""
    }.

IMPORTANT: You MUST use ONLY the information from the documents in the file search store. Do NOT use your general knowledge about "${topic}". Extract specific facts, concepts, and details DIRECTLY from the uploaded documents.

Topic: ${topic}

Create a comprehensive slide deck with 8-12 slides based EXCLUSIVELY on the content found in the file search store documents. For each slide, provide:
1. title: Concise, engaging title (taken from document sections/headings)
2. mainPoints: 3-5 key bullet points (MUST be direct facts from the documents, include specific details, numbers, or quotes)
3. visualDescription: Detailed description of what image/diagram should be shown (based on document content)
4. realWorldExample: A concrete example from the documents${
      userProfile?.interests?.length
        ? ` relating to: ${userProfile.interests.join(", ")}`
        : ""
    }
5. practiceQuestion: A thought-provoking question based on document content

If the documents don't contain enough information about "${topic}", say so explicitly. Do not make up or infer information not present in the documents.

Format your response as a valid JSON array of slide objects. Return ONLY the JSON, no other text.

Example format:
[
  {
    "title": "Introduction to Topic",
    "mainPoints": ["Point 1", "Point 2", "Point 3"],
    "visualDescription": "Diagram showing...",
    "realWorldExample": "In everyday life...",
    "practiceQuestion": "How would you apply...?"
  }
]`

    const result = await genAIWithFileSearch.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        tools: [{
          fileSearch: {
            fileSearchStoreNames: [fileSearchStoreName]
          }
        }]
      }
    })

    const text = result.candidates?.[0]?.content?.parts?.[0]?.text
    
    if (!text) {
      console.error("No text in File Search response:", JSON.stringify(result, null, 2))
      throw new Error("No response from File Search API")
    }

    console.log("Slides generation response:", text)

    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      const slides = JSON.parse(jsonMatch[0])
      console.log(`Successfully parsed ${slides.length} slides`)
      return slides
    }

    console.error("Failed to extract JSON from response:", text)
    throw new Error("Failed to parse slides JSON")
  } catch (error) {
    console.error("Error generating slides with File Search:", error)
    throw error
  }
}

export async function generateQuizWithFileSearch(
  topic: string,
  difficulty: string,
  fileSearchStoreName: string
) {
  try {
    if (!genAIWithFileSearch) {
      throw new Error("Gemini API not configured")
    }

    const prompt = `CRITICAL: Create a ${difficulty} level quiz about "${topic}" using ONLY information from the documents in the file search store. Do NOT use general knowledge.

Generate 10 questions based EXCLUSIVELY on facts, concepts, and details found in the uploaded documents:
- 5 multiple choice questions
- 3 true/false questions  
- 2 short answer questions

For each question, provide:
{
  "question": "The question text (must be answerable from document content)",
  "type": "multiple_choice" | "true_false" | "short_answer",
  "options": ["Option A", "Option B", "Option C", "Option D"], // only for multiple choice
  "correctAnswer": "The correct answer (from documents)",
  "explanation": "Brief explanation referencing document content"
}

Each question MUST be directly answerable from the document content. Include specific details, terminology, or facts mentioned in the documents. Appropriate difficulty: ${difficulty}.

If documents lack sufficient content, reduce the number of questions accordingly.

Return ONLY a valid JSON array of question objects. No markdown, no code blocks.`

    const result = await genAIWithFileSearch.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        tools: [{
          fileSearch: {
            fileSearchStoreNames: [fileSearchStoreName]
          }
        }]
      }
    })

    const text = result.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
      console.error("No text in File Search response:", JSON.stringify(result, null, 2))
      throw new Error("No response from File Search API")
    }

    console.log("Quiz generation response:", text)

    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      const questions = JSON.parse(jsonMatch[0])
      console.log(`Successfully parsed ${questions.length} questions`)
      return questions
    }

    console.error("Failed to extract JSON from response:", text)
    throw new Error("Failed to parse quiz JSON")
  } catch (error) {
    console.error("Error generating quiz with File Search:", error)
    throw error
  }
}

export async function generateGameWithFileSearch(
  topic: string,
  gameType: string,
  fileSearchStoreName: string
) {
  try {
    if (!genAIWithFileSearch) {
      throw new Error("Gemini API not configured")
    }

    const prompt = `IMPORTANT: Create an interactive HTML5 game about "${topic}" of type "${gameType}" using ONLY information extracted from the documents in the file search store.

The game MUST use specific facts, terms, concepts, and details found in the uploaded documents. Do NOT use generic knowledge about "${topic}".

The game should be engaging, educational, and fully self-contained in a single HTML file.

Requirements:
- Extract specific information from the provided documents (facts, terms, definitions, concepts)
- Use ONLY document content for game questions/challenges
- Include inline CSS for styling (colorful, modern design)
- Include inline JavaScript for interactivity
- Make it mobile-friendly
- Include a score system
- Add clear instructions
- Use semantic HTML5

Game types and implementations:
- "interactive-quiz": Multiple choice questions using document facts
- "matching": Match terms/concepts from documents
- "fill-blank": Fill blanks with specific terms from documents
- "word-search": Use key terms and vocabulary from documents

Return ONLY the complete HTML code, no explanation, no markdown code blocks.`

    const result = await genAIWithFileSearch.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        tools: [{
          fileSearch: {
            fileSearchStoreNames: [fileSearchStoreName]
          }
        }]
      }
    })

    let html = result.candidates?.[0]?.content?.parts?.[0]?.text

    if (!html) {
      console.error("No text in File Search response:", JSON.stringify(result, null, 2))
      throw new Error("No response from File Search API")
    }

    console.log("Game generation response length:", html.length)

    // Remove markdown code blocks if present
    html = html.replace(/```html\n?/g, "").replace(/```\n?/g, "")

    return html
  } catch (error) {
    console.error("Error generating game with File Search:", error)
    throw error
  }
}

export async function generateFlashcardsWithFileSearch(
  topic: string,
  fileSearchStoreName: string
) {
  try {
    if (!genAIWithFileSearch) {
      throw new Error("Gemini API not configured")
    }

    const prompt = `CRITICAL: Create flashcards about "${topic}" using ONLY information from the documents in the file search store. Do NOT use general knowledge.

Generate 15-20 flashcards using EXCLUSIVELY key concepts, terms, definitions, and facts found in the uploaded documents.

For each flashcard:
{
  "front": "Question, term, or concept (from documents)",
  "back": "Answer, definition, or explanation (directly from documents)",
  "difficulty": "easy" | "medium" | "hard"
}

Each flashcard MUST be based on specific content from the documents. Include terminology, definitions, facts, and concepts explicitly mentioned in the source material.

If documents contain insufficient content, create fewer flashcards rather than inventing information.

Return ONLY a valid JSON array of flashcard objects. No markdown, no code blocks.`

    const result = await genAIWithFileSearch.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        tools: [{
          fileSearch: {
            fileSearchStoreNames: [fileSearchStoreName]
          }
        }]
      }
    })

    const text = result.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
      console.error("No text in File Search response:", JSON.stringify(result, null, 2))
      throw new Error("No response from File Search API")
    }

    console.log("Flashcards generation response:", text)

    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      const flashcards = JSON.parse(jsonMatch[0])
      console.log(`Successfully parsed ${flashcards.length} flashcards`)
      return flashcards
    }

    console.error("Failed to extract JSON from response:", text)
    throw new Error("Failed to parse flashcards JSON")
  } catch (error) {
    console.error("Error generating flashcards with File Search:", error)
    throw error
  }
}

export async function queryWithFileSearch(
  question: string,
  fileSearchStoreName: string,
  userProfile?: any
) {
  try {
    if (!genAIWithFileSearch) {
      throw new Error("Gemini API not configured")
    }

    const systemPrompt = userProfile
      ? `You are an AI tutor with the following personality: ${userProfile.aiPersona}.
         The student learns best through: ${userProfile.learningStyle}.
         Their learning pace is: ${userProfile.pace}.
         Their interests are: ${userProfile.interests?.join(", ")}.
         Use these to personalize your teaching style and examples.`
      : "You are a helpful AI tutor."

    const prompt = `${systemPrompt}

Student's question: ${question}

Provide a clear, helpful answer based on the documents in the file search store. Use specific examples and references from the material. If the answer isn't in the documents, say so and provide general guidance.`

    const result = await genAIWithFileSearch.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        tools: [{
          fileSearch: {
            fileSearchStoreNames: [fileSearchStoreName]
          }
        }]
      }
    })

    const text = result.candidates?.[0]?.content?.parts?.[0]?.text
    const groundingMetadata = result.candidates?.[0]?.groundingMetadata

    console.log("AI chat response:", text)
    console.log("Grounding metadata:", JSON.stringify(groundingMetadata, null, 2))

    return {
      answer: text || "I couldn't generate an answer.",
      citations: groundingMetadata?.searchEntryPoint?.renderedContent || null,
    }
  } catch (error) {
    console.error("Error querying with File Search:", error)
    throw error
  }
}
