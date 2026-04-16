import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export interface AlcoholInfo {
  name: string;
  type: string;
  abv: number;
  description: string;
}

export async function analyzeAlcoholLabel(base64Image: string): Promise<AlcoholInfo> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: "Analyze this alcohol bottle label image and extract the product name, alcohol type (Soju, Beer, Wine, Whiskey, Makgeolli, etc.), and ABV (alcohol by volume percentage). Return the result as a strictly formatted JSON object with keys: name, type, abv, description." },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    const result = JSON.parse(response.text || "{}");
    return {
      name: result.name || "Unknown Alcohol",
      type: result.type || "Other",
      abv: parseFloat(result.abv) || 0,
      description: result.description || ""
    };
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      name: "Scan Failed",
      type: "Other",
      abv: 0,
      description: "Could not identify the image."
    };
  }
}

export async function getPairingRecommendation(drinkName: string, drinkType: string): Promise<string[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Suggest 3 food pairings (anju) that go well with ${drinkName} (${drinkType}). Return as a JSON array of strings in Korean.` ,
      config: {
        responseMimeType: "application/json"
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini Pairing Error:", error);
    return ["삼겹살", "치킨", "피자"]; // Fallback
  }
}
