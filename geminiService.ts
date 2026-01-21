import { GoogleGenAI, Type } from "@google/genai";
import { DruckerEntry, DailyAnalysis } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelName = "gemini-2.0-flash";

// Retry helper for handling 503 errors
const withRetry = async <T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const isRetryable = error?.status === 503 || error?.message?.includes('503') || error?.message?.includes('overloaded');
      if (isRetryable && attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
};

export const getDruckerInsight = async (entry: DruckerEntry, userQuery: string): Promise<string> => {
  try {
    const prompt = `
    You are a wise and insightful management consultant, deeply energetic about the works of Peter Drucker.
    
    Here is today's excerpt from "The Daily Drucker":
    Title: ${entry.title}
    Subheading: ${entry.subheading}
    Body: ${entry.body}
    Action Point: ${entry.actionPoint}
    
    The user has spoken the following query/thought via voice input:
    "${userQuery}"
    
    Please provide a response that:
    1. Directly answers the user's query.
    2. Relates the user's query specifically to the provided Drucker excerpt.
    3. Uses relevant examples from history or current events to illustrate the connection between Drucker's wisdom and the user's situation.
    4. Keep the tone professional yet conversational.
    `;

    const response = await withRetry(() => ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    }));

    return response.text || "I apologize, I couldn't generate an insight at this moment.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting to my knowledge base right now. Please try again later.";
  }
};

export const getDailyBriefing = async (entry: DruckerEntry): Promise<DailyAnalysis | null> => {
  try {
    const prompt = `
      Analyze this Peter Drucker excerpt and provide a modern executive briefing.

      Title: ${entry.title}
      Text: ${entry.body}
      Action: ${entry.actionPoint}

      I need:
      1. Modern Relevance: 2 sentences on why this specific advice is critical for leaders today (2025+).
      2. Key Takeaways: 3 short, punchy bullet points extracting the core value.
      3. Challenge Question: One provocative question to ask oneself based on this text.
    `;

    const response = await withRetry(() => ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            modernRelevance: { type: Type.STRING },
            keyTakeaways: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            challengeQuestion: { type: Type.STRING }
          },
          required: ["modernRelevance", "keyTakeaways", "challengeQuestion"]
        }
      }
    }));

    if (response.text) {
      return JSON.parse(response.text) as DailyAnalysis;
    }
    return null;
  } catch (error) {
    console.error("Briefing Generation Error:", error);
    return null;
  }
};
