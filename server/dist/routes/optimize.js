"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const genai_1 = require("@google/genai");
const ai = new genai_1.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
/**
 * Expected strict output structure for JSON response
 */
const schemaFields = {
    type: genai_1.Type.OBJECT,
    properties: {
        healthGoal: { type: genai_1.Type.STRING },
        optimizedTitle: { type: genai_1.Type.STRING },
        summary: { type: genai_1.Type.STRING },
        optimizedIngredients: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING } },
        optimizedInstructions: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING } },
        substitutions: {
            type: genai_1.Type.ARRAY,
            items: {
                type: genai_1.Type.OBJECT,
                properties: {
                    original: { type: genai_1.Type.STRING },
                    replacement: { type: genai_1.Type.STRING },
                    reason: { type: genai_1.Type.STRING }
                },
                required: ["original", "replacement", "reason"]
            }
        },
        healthRationale: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING } },
        cautions: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING } },
        estimatedNutritionNotes: { type: genai_1.Type.ARRAY, items: { type: genai_1.Type.STRING } }
    },
    required: [
        "healthGoal", "optimizedTitle", "summary",
        "optimizedIngredients", "optimizedInstructions",
        "substitutions", "healthRationale"
    ]
};
const optimizeRoutes = async (server) => {
    server.post('/api/optimize-recipe', async (request, reply) => {
        const { recipe, healthGoal } = request.body;
        if (!recipe || !healthGoal) {
            return reply.code(400).send({ error: 'Recipe and health goal are required' });
        }
        if (!process.env.GEMINI_API_KEY) {
            // Mock mode if no key
            return {
                healthGoal,
                optimizedTitle: "Heart-Healthy " + recipe.title,
                summary: "This is a mock optimization since no Gemini API key is configured.",
                optimizedIngredients: recipe.ingredients.map(i => i.replace('butter', 'olive oil')),
                optimizedInstructions: recipe.instructions,
                substitutions: [{ original: "Butter", replacement: "Olive Oil", reason: "Lower saturated fat" }],
                healthRationale: ["Replaced saturated fats with unsaturated fats where possible."],
                cautions: []
            };
        }
        try {
            const prompt = `You are a culinary expert specializing in heart-healthy modifications.
Transform the following recipe to align with the health goal: "${healthGoal}".

Original Recipe:
Title: ${recipe.title}
Ingredients:
${recipe.ingredients.map(i => '- ' + i).join('\n')}
Instructions:
${recipe.instructions.map(i => '- ' + i).join('\n')}

Rules for "Heart healthy":
- Reduce sodium (e.g., use low-sodium broth, less added salt).
- Reduce saturated fat (e.g., olive oil instead of butter, leaner proteins).
- Increase fiber naturally if appropriate.
- Maintain flavor and original identity of the dish.
- Do NOT provide medical advice, just culinary modifications.
- Keep output completely realistic.

Provide exactly a valid JSON output matching the required schema.`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: schemaFields,
                    temperature: 0.2
                }
            });
            if (response.text == null) {
                throw new Error('Gemini returned an empty response.');
            }
            const parsed = JSON.parse(response.text);
            return parsed;
        }
        catch (error) {
            server.log.error(error);
            return reply.code(500).send({ error: 'Failed to optimize recipe with Gemini: ' + error.message });
        }
    });
};
exports.default = optimizeRoutes;
