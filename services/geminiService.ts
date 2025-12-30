import { GoogleGenAI, Modality } from "@google/genai";

export const generateSvgFromPrompt = async (userPrompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: `You are a world-class Computational Design expert and Generative Artist. 
        Your task is to generate highly aesthetic, clean, and optimized SVG code based on the user's design prompt.
        
        Key Requirements:
        1. Return ONLY the raw <svg>...</svg> code. No markdown, no JSON, no text explanations.
        2. The SVG must have viewBox="0 0 500 500" and preserveAspectRatio="xMidYMid meet".
        3. Design Style: Use sophisticated geometry, parametric patterns, organic wireframes, or isometric structures.
        4. Color Palette: Use a "Light Mode" friendly palette (Deep Cyan #0e7490, Purple #7e22ce, Emerald #047857, Slate #334155). Avoid white or very light lines. Background should be transparent.
        5. Complexity: Ensure the design is detailed enough to look "computational" but efficient enough to render instantly.
        6. If the user asks for a specific object (e.g., "chair"), interpret it through a computational/wireframe lens.
        `,
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) return '<svg viewBox="0 0 500 500"><text x="50%" y="50%" fill="#ef4444" text-anchor="middle">Error generating</text></svg>';

    // Cleanup if model accidentally included markdown
    let cleanSvg = text.trim();
    if (cleanSvg.startsWith('```xml')) cleanSvg = cleanSvg.replace(/^```xml/, '').replace(/```$/, '');
    if (cleanSvg.startsWith('```svg')) cleanSvg = cleanSvg.replace(/^```svg/, '').replace(/```$/, '');
    if (cleanSvg.startsWith('```')) cleanSvg = cleanSvg.replace(/^```/, '').replace(/```$/, '');

    return cleanSvg;
  } catch (error) {
    console.error("Gemini generation error:", error);
    return `<svg viewBox="0 0 500 500"><text x="50%" y="50%" fill="#ef4444" text-anchor="middle" font-family="monospace">Generation Failed</text></svg>`;
  }
};

export const editImage = async (imageBase64: string, imageMimeType: string, prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: imageBase64,
              mimeType: imageMimeType,
            },
          },
          {
            text: `Edit this image: ${prompt}. Return the edited image.`,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];
    if (part && part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("No image generated");
  } catch (error) {
    console.error("Gemini image edit error:", error);
    throw error;
  }
};