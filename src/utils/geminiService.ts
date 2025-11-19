import { GoogleGenerativeAI } from '@google/generative-ai';
import { ExperimentJSON } from '../types';

export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;

  setApiKey(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async analyzeExperiment(experimentJSON: ExperimentJSON): Promise<string> {
    if (!this.genAI) {
      throw new Error('API key not set. Please configure your Gemini API key.');
    }

    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

    const prompt = `
You are an expert science and engineering simulation AI. Analyze the following experiment setup and predict the outcome.

The experiment is represented as a node-based graph where:
- Each node represents a component (electronic, chemical, physical, or code block)
- Edges represent connections and flow between components
- Conditions on edges determine when connections are active

Experiment JSON:
${JSON.stringify(experimentJSON, null, 2)}

Please analyze this experiment and provide:
1. A detailed explanation of what this experiment does
2. The expected output or result
3. Any important observations or warnings
4. Step-by-step process of what happens
5. If applicable, calculate numerical results

Provide your response in a clear, structured format with markdown formatting.
`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      throw new Error(`Failed to analyze experiment: ${error}`);
    }
  }

  async generateVisualization(experimentJSON: ExperimentJSON): Promise<string> {
    if (!this.genAI) {
      throw new Error('API key not set. Please configure your Gemini API key.');
    }

    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

    const prompt = `
Based on this experiment setup, generate Python code using matplotlib or similar libraries to visualize the expected output.

Experiment JSON:
${JSON.stringify(experimentJSON, null, 2)}

Generate complete, runnable Python code that creates a visualization of the experiment results.
Only return the code, no explanations.
`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      throw new Error(`Failed to generate visualization: ${error}`);
    }
  }
}

export const geminiService = new GeminiService();
