import { GoogleGenAI } from "@google/genai";
import { MetricPoint, RunConfig } from "../types";

export const analyzeRunPerformance = async (
  metrics: MetricPoint[],
  config: RunConfig
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Downsample metrics to avoid token limits if necessary
  const sampledMetrics = metrics.filter((_, i) => i % 5 === 0);

  const prompt = `
    You are an expert Reinforcement Learning Engineer acting as a mentor in a dojo. 
    Analyze the following training run data for a 'StickFight' agent.
    
    Configuration:
    ${JSON.stringify(config, null, 2)}
    
    Training Metrics (Sampled):
    ${JSON.stringify(sampledMetrics, null, 2)}
    
    Please write a short analysis in the style of Paul Graham: simple, direct, and clear. 
    Use short sentences. Avoid jargon where possible. 
    Use bullet points. 
    
    Structure the report with these bold section titles:
    1. **What the Agent Learned**
    2. **Behavior Patterns**
    3. **Weaknesses**
    4. **Next Steps**

    Keep the tone encouraging but objective. Max 200 words.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to analyze run with Gemini.");
  }
};