import type { Context } from "@netlify/functions";

const MODEL_NAME = "gemini-3-flash-preview";

interface DruckerEntry {
  date: string;
  title: string;
  subheading: string;
  body: string;
  actionPoint: string;
  source: string;
}

interface RequestBody {
  action: "briefing" | "insight";
  entry: DruckerEntry;
  userQuery?: string;
}

// Retry helper for handling 503 errors
const withRetry = async <T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const isRetryable = error?.status === 503 || error?.message?.includes('503') || error?.message?.includes('overloaded');
      if (isRetryable && attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
};

async function callGemini(prompt: string, jsonSchema?: object): Promise<string> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY not configured");
  }

  const requestBody: any = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {}
  };

  if (jsonSchema) {
    requestBody.generationConfig.responseMimeType = "application/json";
    requestBody.generationConfig.responseSchema = jsonSchema;
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${error}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function getBriefing(entry: DruckerEntry): Promise<object | null> {
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

  const schema = {
    type: "OBJECT",
    properties: {
      modernRelevance: { type: "STRING" },
      keyTakeaways: { type: "ARRAY", items: { type: "STRING" } },
      challengeQuestion: { type: "STRING" }
    },
    required: ["modernRelevance", "keyTakeaways", "challengeQuestion"]
  };

  const text = await withRetry(() => callGemini(prompt, schema));
  return text ? JSON.parse(text) : null;
}

async function getInsight(entry: DruckerEntry, userQuery: string): Promise<string> {
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

  return await withRetry(() => callGemini(prompt));
}

export default async (req: Request, context: Context) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body: RequestBody = await req.json();
    let result: any;

    if (body.action === "briefing") {
      result = await getBriefing(body.entry);
    } else if (body.action === "insight" && body.userQuery) {
      result = await getInsight(body.entry, body.userQuery);
    } else {
      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ result }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: any) {
    console.error("Gemini function error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
};
