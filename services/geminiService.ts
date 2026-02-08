import { GoogleGenAI, Type } from "@google/genai";
import { LessonQuestion, ImageSize } from "../types";

// Helper to get the AI client. 
// Note: We create a new instance each time to ensure we pick up the latest selected key.
const getAiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const checkApiKey = async (): Promise<boolean> => {
  if (typeof window !== 'undefined' && (window as any).aistudio) {
    return await (window as any).aistudio.hasSelectedApiKey();
  }
  return true; // Fallback for dev envs without the wrapper, assuming env var exists
};

export const promptApiKeySelection = async (): Promise<void> => {
   if (typeof window !== 'undefined' && (window as any).aistudio) {
    await (window as any).aistudio.openSelectKey();
  }
};

export const generateLessonPlan = async (language: string): Promise<LessonQuestion[]> => {
  const ai = getAiClient();
  
  // Use gemini-3-flash-preview for text generation tasks as per guidelines
  const modelId = "gemini-3-flash-preview"; 

  const prompt = `Create a beginner vocabulary lesson for learning ${language}. 
  Generate 5 distinct multiple-choice questions. 
  Each question should present a simple word or short phrase in ${language}.
  The user needs to select the correct English translation.
  
  For each question, provide:
  1. The target phrase in ${language}.
  2. The correct English translation.
  3. 3 incorrect English options (distractors).
  4. A visual description of the phrase (imagePrompt) to generate an illustration (e.g., "A cute vector illustration of a red apple").
  
  Return valid JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING, description: `The phrase in ${language}` },
              translation: { type: Type.STRING, description: "The correct English translation" },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "List of 4 total options (1 correct, 3 incorrect), shuffled" 
              },
              correctAnswerIndex: { type: Type.INTEGER, description: "Index (0-3) of the correct option in the options array" },
              imagePrompt: { type: Type.STRING, description: "A detailed description for an image generator" }
            },
            required: ["question", "translation", "options", "correctAnswerIndex", "imagePrompt"]
          }
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      return data.map((item: any, index: number) => ({
        id: index,
        ...item
      }));
    }
    throw new Error("No data returned");
  } catch (error) {
    console.error("Failed to generate lesson:", error);
    throw error;
  }
};

export const generateLessonImage = async (prompt: string, size: ImageSize = '1K'): Promise<string | null> => {
  const ai = getAiClient();
  
  const generate = async (model: string, config: any) => {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [{ text: `A fun, vibrant, flat vector style illustration suitable for a language learning app. ${prompt}` }]
      },
      config: config
    });
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  };

  try {
    // Try the Pro model first as it supports resolution
    return await generate("gemini-3-pro-image-preview", {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: size
      }
    });
  } catch (error: any) {
    // If permission denied or other error, fallback to standard Flash image model
    console.warn("Primary image model failed, falling back to Flash Image.", error);
    try {
      // Flash image model does not support imageSize, only aspectRatio
      return await generate("gemini-2.5-flash-image", {
        imageConfig: {
          aspectRatio: "1:1"
        }
      });
    } catch (fallbackError) {
      console.error("Failed to generate image with fallback model:", fallbackError);
      return null;
    }
  }
};
