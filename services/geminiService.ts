
import { GoogleGenAI } from "@google/genai";

export async function testApiKey(key: string): Promise<boolean> {
  try {
    const ai = new GoogleGenAI({ apiKey: key });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: 'Say "OK"',
    });
    return response.text?.includes("OK") || false;
  } catch (error) {
    console.error("API Key validation failed:", error);
    return false;
  }
}

export async function getGeminiHint(
  key: string,
  targetNumber: number,
  currentGuess: number,
  history: { guess: number; hint: string }[]
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: key });
  const prompt = `
    당신은 "숫자 맞추기(1-100)" 게임의 친절하고 재치 있는 게임 마스터입니다.
    정답은 ${targetNumber}입니다.
    사용자가 입력한 숫자: ${currentGuess}.
    이전 기록: ${history.map(h => `입력: ${h.guess}, 힌트: ${h.hint}`).join(' | ')}
    
    정답을 맞췄다면 열정적으로 축하해주세요.
    입력값이 정답보다 크다면, 더 낮은 숫자라는 것을 창의적인 방식으로 알려주세요.
    입력값이 정답보다 작다면, 더 높은 숫자라는 것을 창의적인 방식으로 알려주세요.
    힌트는 짧고 재미있게(2문장 이내) 한국어로 작성하세요.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || (currentGuess > targetNumber ? "너무 높아요!" : "너무 낮아요!");
  } catch (error) {
    console.error("Gemini Error:", error);
    return currentGuess > targetNumber ? "너무 높아요!" : "너무 낮아요!";
  }
}
