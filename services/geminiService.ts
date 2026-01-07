
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
    You are a helpful and witty game master for a "Guess the Number (1-100)" game.
    The secret number is ${targetNumber}.
    The user just guessed: ${currentGuess}.
    Previous history: ${history.map(h => `Guess: ${h.guess}, Hint: ${h.hint}`).join(' | ')}
    
    If the guess is correct, congratulate them enthusiastically.
    If the guess is too high, give a creative hint that it's lower.
    If the guess is too low, give a creative hint that it's higher.
    Keep the hint short (under 2 sentences) and fun.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || (currentGuess > targetNumber ? "Too high!" : "Too low!");
  } catch (error) {
    console.error("Gemini Error:", error);
    return currentGuess > targetNumber ? "Too high!" : "Too low!";
  }
}
