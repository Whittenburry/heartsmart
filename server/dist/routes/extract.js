"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio = __importStar(require("cheerio"));
const extractRoutes = async (server) => {
    server.post('/api/extract-recipe', async (request, reply) => {
        const { url } = request.body;
        if (!url) {
            return reply.code(400).send({ error: 'URL is required' });
        }
        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch URL: ${response.statusText}`);
            }
            const html = await response.text();
            const $ = cheerio.load(html);
            let recipeData = null;
            // Look for JSON-LD scripts
            $('script[type="application/ld+json"]').each((_, el) => {
                try {
                    const content = $(el).html();
                    if (content) {
                        const parsed = JSON.parse(content);
                        // Handle arrays of JSON-LD items
                        const items = Array.isArray(parsed) ? parsed : [parsed];
                        for (const item of items) {
                            if (item['@graph']) {
                                const recipeGraph = item['@graph'].find((g) => g['@type'] === 'Recipe');
                                if (recipeGraph) {
                                    recipeData = recipeGraph;
                                    break;
                                }
                            }
                            if (item['@type'] === 'Recipe' || (Array.isArray(item['@type']) && item['@type'].includes('Recipe'))) {
                                recipeData = item;
                                break;
                            }
                        }
                    }
                }
                catch (e) {
                    // Ignore parsing errors for individual scripts
                }
            });
            if (recipeData) {
                const ingredients = Array.isArray(recipeData.recipeIngredient)
                    ? recipeData.recipeIngredient
                    : [recipeData.recipeIngredient].filter(Boolean);
                let instructions = [];
                if (Array.isArray(recipeData.recipeInstructions)) {
                    instructions = recipeData.recipeInstructions.map((step) => typeof step === 'string' ? step : step.text).filter(Boolean);
                }
                else if (typeof recipeData.recipeInstructions === 'string') {
                    instructions = [recipeData.recipeInstructions];
                }
                const image = Array.isArray(recipeData.image)
                    ? recipeData.image[0]
                    : typeof recipeData.image === 'object' && recipeData.image?.url
                        ? recipeData.image.url
                        : typeof recipeData.image === 'string'
                            ? recipeData.image
                            : undefined;
                const author = Array.isArray(recipeData.author)
                    ? recipeData.author[0]?.name
                    : typeof recipeData.author === 'object'
                        ? recipeData.author?.name
                        : recipeData.author;
                const extracted = {
                    title: recipeData.name || $('title').text() || 'Unknown Recipe',
                    author,
                    image,
                    description: recipeData.description,
                    sourceUrl: url,
                    servings: recipeData.recipeYield ? String(recipeData.recipeYield) : undefined,
                    prepTime: recipeData.prepTime,
                    cookTime: recipeData.cookTime,
                    totalTime: recipeData.totalTime,
                    ingredients,
                    instructions
                };
                return extracted;
            }
            // Fallback: Extremely basic DOM extraction if JSON-LD fails
            return reply.code(422).send({
                error: 'Could not find schema.org Recipe data on this page.',
                details: 'For MVP, we only support pages with standard Recipe JSON-LD.'
            });
        }
        catch (error) {
            server.log.error(error);
            return reply.code(500).send({ error: 'Extraction failed: ' + error.message });
        }
    });
};
exports.default = extractRoutes;
