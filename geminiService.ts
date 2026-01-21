import { DruckerEntry, DailyAnalysis } from "./types";

const API_ENDPOINT = "/.netlify/functions/gemini";

export const getDruckerInsight = async (entry: DruckerEntry, userQuery: string): Promise<string> => {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "insight", entry, userQuery }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "API request failed");
    }

    const data = await response.json();
    return data.result || "I apologize, I couldn't generate an insight at this moment.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting to my knowledge base right now. Please try again later.";
  }
};

export const getDailyBriefing = async (entry: DruckerEntry): Promise<DailyAnalysis | null> => {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "briefing", entry }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "API request failed");
    }

    const data = await response.json();
    return data.result as DailyAnalysis;
  } catch (error) {
    console.error("Briefing Generation Error:", error);
    return null;
  }
};
