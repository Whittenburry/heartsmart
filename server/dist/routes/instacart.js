"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const instacartRoutes = async (server) => {
    server.post('/api/create-shopping-link', async (request, reply) => {
        const { ingredients } = request.body;
        if (!ingredients || !Array.isArray(ingredients)) {
            return reply.code(400).send({ error: 'Valid ingredients array is required' });
        }
        // A real integration would POST to Instacart API to generate an OAuth token 
        // and cart URL. Since this is an MVP without an official partner key, 
        // we simply construct a search query. Multiple items can be added 
        // sequentially or searched via an aggregator link in normal consumer mode.
        // For MVP, we provide a basic store search link for demonstration.
        const sampleSearchQuery = ingredients.length > 0
            ? encodeURIComponent(ingredients[0].split(/[0-9]/)[0] || ingredients[0]) // Strip out numbers to get basic ingredient name roughly
            : 'groceries';
        const mockUrl = `https://www.instacart.com/store/s?k=${sampleSearchQuery}`;
        return {
            shoppingUrl: mockUrl,
            message: 'Generated Instacart search link.'
        };
    });
};
exports.default = instacartRoutes;
