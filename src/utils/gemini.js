// Gemini API helper for prompt enhancement

const apiKey = ""; // The execution environment provides this key

export const enhancePromptWithGemini = async (input, contextType) => {
    if (!apiKey) {
        console.warn("Gemini API Key is missing.");
        // Fallback for demo without key
        return input + " (Enhanced: cinematic lighting, 8k resolution, highly detailed texture, photorealistic)";
    }

    const systemPrompt = `You are an expert AI Fashion Director. Your goal is to take simple user descriptions and expand them into highly detailed, professional prompts suitable for generative AI (Text-to-3D or Text-to-Video).
  
  Context: The user is generating a ${contextType}.
  Instructions:
  1. Enhance the description with specific fabrics, lighting, camera angles, and textures.
  2. Keep it under 50 words.
  3. Do not add conversational filler. Just output the enhanced prompt.
  `;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `User Input: ${input}` }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] }
            })
        });

        if (!response.ok) throw new Error('Gemini API request failed');

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || input;
    } catch (error) {
        console.error("Gemini Error:", error);
        return input; // Return original on error
    }
};
