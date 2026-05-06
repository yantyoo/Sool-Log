import { GoogleGenAI } from "@google/genai";
import { emitToast } from './toast';

let ai: GoogleGenAI | null = null;

function getGeminiApiKey() {
  const viteEnv = (import.meta as ImportMeta & { env?: { VITE_GEMINI_API_KEY?: string } }).env;
  const apiKey = viteEnv?.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      'VITE_GEMINI_API_KEY가 없습니다. .env.local 또는 Vite 환경변수에 키를 설정하세요.'
    );
  }

  return apiKey;
}

function getGeminiClient() {
  ai ??= new GoogleGenAI({ apiKey: getGeminiApiKey() });
  return ai;
}

export interface AlcoholInfo {
  name: string;
  type: string;
  abv: number;
  description: string;
}

function normalizeAlcoholInfo(value: unknown): AlcoholInfo {
  const record = typeof value === 'object' && value !== null ? value as Record<string, unknown> : {};
  const parsedAbv = typeof record.abv === 'number' ? record.abv : Number.parseFloat(String(record.abv ?? ''));

  return {
    name: typeof record.name === 'string' && record.name.trim() ? record.name : "Unknown Alcohol",
    type: typeof record.type === 'string' && record.type.trim() ? record.type : "Other",
    abv: Number.isFinite(parsedAbv) && parsedAbv >= 0 ? parsedAbv : 0,
    description: typeof record.description === 'string' ? record.description : "",
  };
}

function normalizePairingRecommendations(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .map((item) => item.trim())
    .slice(0, 3);
}

export async function analyzeAlcoholLabel(base64Image: string): Promise<AlcoholInfo> {
  try {
    const response = await getGeminiClient().models.generateContent({
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

    return normalizeAlcoholInfo(JSON.parse(response.text || "{}"));
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    emitToast({
      tone: 'error',
      title: '이미지 분석에 실패했습니다.',
      description: '사진을 다시 찍거나 수동 기록을 사용해 주세요.',
    });
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
    const response = await getGeminiClient().models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Suggest 3 food pairings (anju) that go well with ${drinkName} (${drinkType}). Return as a JSON array of strings in Korean.` ,
      config: {
        responseMimeType: "application/json"
      }
    });
    const recommendations = normalizePairingRecommendations(JSON.parse(response.text || "[]"));
    return recommendations.length > 0 ? recommendations : ["삼겹살", "치킨", "피자"];
  } catch (error) {
    console.error("Gemini Pairing Error:", error);
    emitToast({
      tone: 'warning',
      title: '안주 추천을 불러오지 못했습니다.',
      description: '기본 추천 안주를 대신 보여드립니다.',
    });
    return ["삼겹살", "치킨", "피자"];
  }
}
