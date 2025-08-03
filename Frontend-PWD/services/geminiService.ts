
import { GoogleGenAI } from "@google/genai";

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const generateSalesAnalysis = async (salesData: any): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API key is not configured. Please set the API_KEY environment variable.");
  }
  
  const prompt = `
    You are an expert business analyst for a pharmaceutical distributor.
    Analyze the following sales data and provide a concise, insightful summary.
    Highlight key trends, top-performing categories, and suggest one actionable area for potential growth or improvement.
    Format your output in clear, easy-to-read markdown.

    Data:
    ${JSON.stringify(salesData, null, 2)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error generating sales analysis:", error);
    throw new Error("Failed to get analysis from AI. Please check the console for details.");
  }
};
