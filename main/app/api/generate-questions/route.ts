import { NextRequest, NextResponse } from "next/server";

const BEDROCK_API_KEY = process.env.OPENAI_API_KEY || '';
const BEDROCK_BASE_URL = process.env.OPENAI_BASE_URL || 'https://bedrock-mantle.eu-north-1.api.aws/v1';
const BEDROCK_MODEL = process.env.OPENAI_MODEL_NAME || 'deepseek.v3.2';

export async function POST(request: NextRequest) {
  try {
    const { category, difficulty, count } = await request.json();
    const normalizedCount = Number(count);

    if (!BEDROCK_API_KEY) {
      return NextResponse.json(
        { error: "Bedrock API key not configured" },
        { status: 500 }
      );
    }
    if (!category || !difficulty || !Number.isFinite(normalizedCount)) {
      return NextResponse.json(
        { error: "Invalid request payload. category, difficulty and count are required." },
        { status: 400 }
      );
    }
    if (normalizedCount < 1 || normalizedCount > 20) {
      return NextResponse.json(
        { error: "Count must be between 1 and 20." },
        { status: 400 }
      );
    }

    const prompt = `Generate ${normalizedCount} ${difficulty} level ${category} questions that can be solved by drawing on a canvas or creating diagrams/circuits/graphs.

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

    const response = await fetch(`${BEDROCK_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${BEDROCK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: BEDROCK_MODEL,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Bedrock API error (${response.status} ${response.statusText}): ${errorBody}`);
    }

    const data = await response.json();
    let generatedText = data.choices?.[0]?.message?.content || "";

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
    const validatedQuestions = questions.slice(0, normalizedCount).map((q, index) => ({
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
