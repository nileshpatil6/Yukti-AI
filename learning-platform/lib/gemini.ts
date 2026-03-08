// Bedrock API Configuration (OpenAI-compatible endpoint)
const BEDROCK_API_KEY = process.env.OPENAI_API_KEY || ''
const BEDROCK_BASE_URL = process.env.OPENAI_BASE_URL || 'https://bedrock-mantle.eu-north-1.api.aws/v1'
const BEDROCK_MODEL = process.env.OPENAI_MODEL_NAME || 'deepseek.v3.2'

async function bedrockChat(messages: Array<{ role: string; content: string }>, model?: string): Promise<string> {
  const response = await fetch(`${BEDROCK_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${BEDROCK_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model || BEDROCK_MODEL,
      messages,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Bedrock API error (${response.status}): ${errorText}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || ''
}

// Legacy exports kept for backward compatibility (no-op, Bedrock doesn't use these)
export const genAI = null
export const genAIWithFileSearch = null

// File Search Store Management - Bedrock doesn't support file search stores natively
// These functions are kept as stubs for backward compatibility
export async function createFileSearchStore(displayName: string) {
  console.warn("File search stores are not supported with Bedrock API. Using plain text context instead.")
  return `bedrock-store-${Date.now()}`
}

export async function uploadToFileSearchStore(
  filePath: string,
  fileSearchStoreName: string,
  displayName: string,
  metadata?: Record<string, any>
) {
  console.warn("File search store upload is not supported with Bedrock API. Files should be processed as text context.")
  return {
    done: true,
    documentId: `bedrock-doc-${Date.now()}`,
    fileName: displayName,
  }
}

// RAG Query using Bedrock
export async function queryWithRAG(
  question: string,
  context: string,
  userProfile?: any
) {
  try {
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

    return await bedrockChat([{ role: 'user', content: prompt }])
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
    const prompt = `You are an expert educator creating engaging slides${userProfile
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
4. realWorldExample: A concrete example${userProfile?.interests?.length
        ? ` relating to: ${userProfile.interests.join(", ")}`
        : ""
      }
5. practiceQuestion: A thought-provoking question

Format your response as a valid JSON array of slide objects. Return ONLY the JSON, no other text.`

    const response = await bedrockChat([{ role: 'user', content: prompt }])

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

    const response = await bedrockChat([{ role: 'user', content: prompt }])

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

    return await bedrockChat([{ role: 'user', content: prompt }])
  } catch (error) {
    console.error("Error generating game:", error)
    throw error
  }
}

// Generate Flashcards
export async function generateFlashcards(topic: string, context: string) {
  try {
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

    const response = await bedrockChat([{ role: 'user', content: prompt }])

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

    const response = await bedrockChat([{ role: 'user', content: prompt }])

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
// Note: Bedrock doesn't have native file search. These functions use plain chat
// and rely on context being passed in or previously uploaded content.

export async function generateSlidesWithFileSearch(
  topic: string,
  fileSearchStoreName: string,
  userProfile?: any
) {
  try {
    const prompt = `You are an expert educator creating engaging slides${userProfile
      ? ` for a ${userProfile.learningStyle} learner interested in ${userProfile.interests?.join(", ")}`
      : ""
      }.

Topic: ${topic}

Create a comprehensive slide deck with 8-12 slides. For each slide, provide:
1. title: Concise, engaging title
2. mainPoints: 3-5 key bullet points
3. visualDescription: Detailed description of what image/diagram should be shown
4. realWorldExample: A concrete example${userProfile?.interests?.length
        ? ` relating to: ${userProfile.interests.join(", ")}`
        : ""
      }
5. practiceQuestion: A thought-provoking question

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

    const text = await bedrockChat([{ role: 'user', content: prompt }])

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
    console.error("Error generating slides:", error)
    throw error
  }
}

export async function generateQuizWithFileSearch(
  topic: string,
  difficulty: string,
  fileSearchStoreName: string
) {
  try {
    const prompt = `Create a ${difficulty} level quiz about "${topic}".

Generate 10 questions:
- 5 multiple choice questions
- 3 true/false questions  
- 2 short answer questions

For each question, provide:
{
  "question": "The question text",
  "type": "multiple_choice" | "true_false" | "short_answer",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": "The correct answer",
  "explanation": "Brief explanation"
}

Appropriate difficulty: ${difficulty}.

Return ONLY a valid JSON array of question objects. No markdown, no code blocks.`

    const text = await bedrockChat([{ role: 'user', content: prompt }])

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
    console.error("Error generating quiz:", error)
    throw error
  }
}

export async function generateGameWithFileSearch(
  topic: string,
  gameType: string,
  fileSearchStoreName: string
) {
  try {
    const gameTypePrompts: Record<string, string> = {
      "interactive-quiz": `Create an engaging quiz game with:
- Colorful, animated UI with progress bars
- Timer for each question
- Visual feedback for correct/wrong answers with animations
- Score multipliers for speed
- Celebration confetti on correct answers
- Final score screen with performance stats`,

      "matching": `Create a drag-and-drop matching game with:
- Beautiful card designs that flip and animate
- Smooth drag-and-drop functionality
- Visual connections when matched correctly
- Timer and score system
- Celebration animations on completion
- Shuffle and restart options`,

      "memory-cards": `Create a memory card matching game with:
- Smooth flip card animations
- Grid layout (4x4 or 4x5)
- Match pairs of related concepts
- Move counter and timer
- Star rating based on performance (3 stars = excellent)
- Smooth animations and particle effects`,

      "word-scramble": `Create a word scramble game with:
- Scrambled key terms
- Drag letters or click to form words
- Hint system using definitions
- Multiple difficulty levels
- Timer and scoring with combos
- Visual feedback and celebrations`,

      "fill-blank": `Create a fill-in-the-blanks game with:
- Sentences with missing words
- Word bank to choose from or type answers
- Drag-and-drop or click to fill
- Immediate visual feedback
- Score tracking with streaks
- Progressive difficulty levels`
    }

    const gameInstructions = gameTypePrompts[gameType] || gameTypePrompts["interactive-quiz"]

    const prompt = `Create a FUN, INTERACTIVE, and VISUALLY STUNNING HTML5 game about "${topic}".

GAME TYPE: ${gameType}
${gameInstructions}

CRITICAL REQUIREMENTS:
1. Make it visually amazing with:
   - Modern, colorful design with gradients (blues, purples, greens)
   - Smooth CSS animations and transitions
   - Responsive layout (mobile-friendly)
   - Beautiful fonts (use Google Fonts: Inter, Poppins, or Outfit)
   - Icons and emojis for visual appeal
   - Card shadows and depth effects

2. Include engaging game mechanics:
   - Score system with large, animated numbers
   - Timer with visual countdown (if applicable)
   - Progress bar showing completion
   - Particle effects or confetti on success (use canvas or CSS)
   - Smooth state transitions

3. User experience:
   - Clear, animated instructions at start
   - Easy-to-use, touch-friendly controls
   - Immediate visual feedback (green for correct, red for wrong)
   - Restart/Play Again button with icon
   - Results screen with final score and performance message

4. Technical requirements:
   - Single HTML file with inline CSS and JavaScript
   - No external dependencies
   - Semantic HTML5
   - Modern CSS (flexbox, grid, keyframe animations)
   - Vanilla JavaScript (ES6+)
   - Mobile-responsive (use media queries)

IMPORTANT: Make it look like a modern mobile game, not a basic quiz!

Return ONLY the complete HTML code. No explanations, no markdown code blocks, just pure HTML starting with <!DOCTYPE html>.`

    let html = await bedrockChat([{ role: 'user', content: prompt }])

    console.log("Game generation response length:", html.length)

    // Remove markdown code blocks if present
    html = html.replace(/```html\n?/g, "").replace(/```\n?/g, "")

    return html
  } catch (error) {
    console.error("Error generating game:", error)
    throw error
  }
}

export async function generateFlashcardsWithFileSearch(
  topic: string,
  fileSearchStoreName: string
) {
  try {
    const prompt = `Create flashcards about "${topic}".

Generate 15-20 flashcards with key concepts, terms, definitions, and facts.

For each flashcard:
{
  "front": "Question, term, or concept",
  "back": "Answer, definition, or explanation",
  "difficulty": "easy" | "medium" | "hard"
}

Return ONLY a valid JSON array of flashcard objects. No markdown, no code blocks.`

    const text = await bedrockChat([{ role: 'user', content: prompt }])

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
    console.error("Error generating flashcards:", error)
    throw error
  }
}

export async function queryWithFileSearch(
  question: string,
  fileSearchStoreName: string,
  userProfile?: any
) {
  try {
    const systemPrompt = userProfile
      ? `You are an AI tutor with the following personality: ${userProfile.aiPersona}.
         The student learns best through: ${userProfile.learningStyle}.
         Their learning pace is: ${userProfile.pace}.
         Their interests are: ${userProfile.interests?.join(", ")}.
         Use these to personalize your teaching style and examples.`
      : "You are a helpful AI tutor."

    const prompt = `${systemPrompt}

Student's question: ${question}

Provide a clear, helpful answer. Use specific examples and references from known material. If the answer isn't clear, say so and provide general guidance.`

    const text = await bedrockChat([{ role: 'user', content: prompt }])

    console.log("AI chat response:", text)

    return {
      answer: text || "I couldn't generate an answer.",
      citations: null,
    }
  } catch (error) {
    console.error("Error querying with Bedrock:", error)
    throw error
  }
}
