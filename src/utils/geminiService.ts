import { ExperimentJSON, AnalysisResult } from '../types';

// In development, requests go through Vite proxy at /api/bedrock
// In production, configure your own backend proxy
const BEDROCK_PROXY_URL = '/api/bedrock';

async function bedrockChat(messages: Array<{ role: string; content: string }>, model: string = 'deepseek.v3.2'): Promise<string> {
  const response = await fetch(`${BEDROCK_PROXY_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Bedrock API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

export class GeminiService {
  // setApiKey is kept for backward compatibility but is no longer needed
  setApiKey(_apiKey: string) {
    // No-op: Bedrock uses a fixed API key
  }

  async getHint(experimentJSON: ExperimentJSON, userQuestion: string): Promise<string> {
    const nodeCount = experimentJSON.nodes.length;
    const edgeCount = experimentJSON.edges.length;
    const categories = [...new Set(experimentJSON.nodes.map(n => n.data.component.category))];
    const componentLabels = experimentJSON.nodes.map(n => n.data.label).join(', ');

    const prompt = `
You are a friendly lab assistant robot 🤖 helping a student with their experiment.

CURRENT EXPERIMENT CONTEXT:
- Total Components: ${nodeCount}
- Total Connections: ${edgeCount}
- Categories Used: ${categories.join(', ')}
- Components on Canvas: ${componentLabels}

DETAILED EXPERIMENT STRUCTURE:
${JSON.stringify(experimentJSON, null, 2)}

STUDENT'S QUESTION: "${userQuestion}"

INSTRUCTIONS:
Analyze the current experiment setup and the student's question. Provide a helpful hint to guide them in the right direction.

DO NOT:
- Give the direct solution or complete answer
- Tell them exactly what to add or how to fix it
- Provide step-by-step instructions

DO:
- Ask guiding questions about their current components
- Point out relationships they might have missed
- Suggest what to think about regarding specific components they already have
- Encourage exploration of connections between existing components
- Reference specific components they've added by name
- Help them think critically about what's missing or incorrect

Keep your response conversational, encouraging, friendly, and under 120 words. Use emojis occasionally! 🔬✨
`;

    try {
      return await bedrockChat([{ role: 'user', content: prompt }]);
    } catch (error) {
      throw new Error(`Failed to get hint: ${error}`);
    }
  }

  async analyzeExperiment(experimentJSON: ExperimentJSON): Promise<AnalysisResult> {
    const prompt = `
You are an expert science and engineering simulation AI. Analyze the following experiment setup and predict the outcome.

The experiment is represented as a node-based graph where:
- Each node represents a component (electronic, chemical, physical, or code block)
- Edges represent connections and flow between components
- Conditions on edges determine when connections are active

Experiment JSON:
${JSON.stringify(experimentJSON, null, 2)}

Please analyze this experiment and provide a JSON response with the following structure:
{
  "success": boolean, // true if the experiment is valid and produces a result, false if it fails or is incomplete
  "title": string, // "Experiment Success!" or "Experiment Failed"
  "message": string, // A short, concise summary of the result (1-2 sentences)
  "mistake": string | null, // If failed, describe the mistake clearly. DO NOT provide the solution. If success, null.
  "explanation": string, // A detailed explanation of what happened and why.
  "svg": string | null // If success, generate a simple SVG string (starting with <svg... and ending with </svg>) that visualizes the output (e.g., a graph, a chemical reaction, a circuit diagram, or a visual representation of the result). Make it colorful, modern, and self-contained. If failed, null.
}

Ensure the response is valid JSON. Do not include any markdown formatting or code blocks outside the JSON.
`;

    try {
      const text = await bedrockChat([{ role: 'user', content: prompt }], 'deepseek.v3.2');

      // Clean up potential markdown code blocks
      const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();

      return JSON.parse(cleanText) as AnalysisResult;
    } catch (error) {
      console.error("Bedrock Analysis Error:", error);
      return {
        success: false,
        title: "Analysis Error",
        message: "Failed to analyze the experiment.",
        mistake: "There was an error communicating with the AI service.",
        explanation: `Error details: ${error}`
      };
    }
  }

  async generateVisualization(experimentJSON: ExperimentJSON): Promise<string> {
    const prompt = `
Based on this experiment setup, generate Python code using matplotlib or similar libraries to visualize the expected output.

Experiment JSON:
${JSON.stringify(experimentJSON, null, 2)}

Generate complete, runnable Python code that creates a visualization of the experiment results.
Only return the code, no explanations.
`;

    try {
      return await bedrockChat([{ role: 'user', content: prompt }]);
    } catch (error) {
      throw new Error(`Failed to generate visualization: ${error}`);
    }
  }
}


export const geminiService = new GeminiService();

export const getTheme = () => {
  if (typeof window !== 'undefined') {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  }
  return 'light';
};

// Wrapper functions for App_Challenge.tsx
export const analyzeExperiment = async (
  nodes: any[],
  edges: any[]
): Promise<AnalysisResult> => {
  const experimentJSON: ExperimentJSON = {
    nodes: nodes.map(node => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: {
        label: node.data.label,
        component: {
          id: node.id,
          label: node.data.label,
          category: node.data.category || 'General',
          icon: '',
          description: '',
          inputs: 1,
          outputs: 1,
          properties: {}
        }
      }
    })),
    edges: edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      condition: edge.data?.condition
    })),
    metadata: {
      title: 'Challenge Experiment',
      description: 'User submitted challenge solution',
      created: new Date().toISOString()
    }
  };

  return geminiService.analyzeExperiment(experimentJSON);
};

export const getHint = async (
  userMessage: string,
  experimentContext: any
): Promise<string> => {
  const experimentJSON: ExperimentJSON = {
    nodes: experimentContext.nodes.map((node: any) => ({
      id: node.id,
      type: 'custom',
      position: { x: 0, y: 0 },
      data: {
        label: node.label,
        component: {
          id: node.id,
          label: node.label,
          category: node.category || 'General',
          icon: '',
          description: '',
          inputs: 1,
          outputs: 1,
          properties: {}
        }
      }
    })),
    edges: experimentContext.edges.map((edge: any) => ({
      id: `${edge.source}-${edge.target}`,
      source: edge.source,
      target: edge.target
    })),
    metadata: {
      title: 'Current Experiment',
      description: 'User experiment context for hint',
      created: new Date().toISOString()
    }
  };

  return geminiService.getHint(experimentJSON, userMessage);
};
