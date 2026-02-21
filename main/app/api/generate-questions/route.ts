import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { category, difficulty, count } = await request.json();

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    const prompt = `Generate ${count} ${difficulty} level ${category} questions that can be solved by drawing on a canvas or creating diagrams/circuits/graphs.

Each question should be suitable for visual problem-solving where the user can draw their answer.

Return the response as a JSON array with this exact structure:
[
  {
    "question": "Brief question title",
    "description": "Detailed question description explaining what needs to be drawn/solved",
    "difficulty": "${difficulty}",
    "category": "${category}",
    "canvasType": "circuit|diagram|graph|sketch",
    "hints": ["hint1", "hint2"]
  }
]

Examples based on category:
- Electronics: "Draw a full adder circuit", "Design a voltage divider circuit"
- Physics: "Draw free body diagram for...", "Sketch the trajectory of..."
- ML: "Draw a neural network architecture for...", "Sketch decision boundaries for..."
- Mathematics: "Plot the function...", "Draw the geometric proof..."
- Programming: "Draw the flowchart for...", "Sketch the algorithm visualization..."
- Chemistry: "Draw the molecular structure of...", "Sketch the reaction mechanism..."

Make questions creative, educational, and suitable for canvas drawing. Return ONLY valid JSON, no additional text.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    let generatedText = data.candidates[0]?.content?.parts[0]?.text || "";
    
    // Clean up the response - remove markdown code blocks if present
    generatedText = generatedText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    // Try to parse the JSON
    let questions;
    try {
      questions = JSON.parse(generatedText);
    } catch (parseError) {
      // If parsing fails, try to extract JSON from the text
      const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse generated questions");
      }
    }

    // Validate and ensure we have the right number of questions
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("No questions generated");
    }

    // Ensure each question has required fields
    const validatedQuestions = questions.slice(0, count).map((q, index) => ({
      question: q.question || `Question ${index + 1}`,
      description: q.description || "",
      difficulty: q.difficulty || difficulty,
      category: q.category || category,
      canvasType: q.canvasType || "sketch",
      hints: q.hints || []
    }));

    return NextResponse.json({
      success: true,
      questions: validatedQuestions,
    });
  } catch (error: any) {
    console.error("Error generating questions:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate questions" },
      { status: 500 }
    );
  }
}
