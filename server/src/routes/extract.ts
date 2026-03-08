import { FastifyInstance, FastifyPluginAsync } from 'fastify'
import * as cheerio from 'cheerio'

export interface ExtractedRecipe {
  title: string
  author?: string
  image?: string
  description?: string
  sourceUrl: string
  servings?: string
  prepTime?: string
  cookTime?: string
  totalTime?: string
  ingredients: string[]
  instructions: string[]
  notes?: string[]
}

const extractRoutes: FastifyPluginAsync = async (server: FastifyInstance) => {
  server.post<{ Body: { url: string } }>('/api/extract-recipe', async (request, reply) => {
    const { url } = request.body
    if (!url) {
      return reply.code(400).send({ error: 'URL is required' })
    }

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.statusText}`)
      }

      const html = await response.text()
      const $ = cheerio.load(html)
      
      let recipeData: any = null

      // Look for JSON-LD scripts
      $('script[type="application/ld+json"]').each((_, el) => {
        try {
          const content = $(el).html()
          if (content) {
            const parsed = JSON.parse(content)
            
            // Handle arrays of JSON-LD items
            const items = Array.isArray(parsed) ? parsed : [parsed]
            
            for (const item of items) {
              if (item['@graph']) {
                const recipeGraph = item['@graph'].find((g: any) => g['@type'] === 'Recipe')
                if (recipeGraph) {
                  recipeData = recipeGraph
                  break
                }
              }
              if (item['@type'] === 'Recipe' || (Array.isArray(item['@type']) && item['@type'].includes('Recipe'))) {
                recipeData = item
                break
              }
            }
          }
        } catch (e) {
          // Ignore parsing errors for individual scripts
        }
      })

      if (recipeData) {
        const ingredients = Array.isArray(recipeData.recipeIngredient) 
          ? recipeData.recipeIngredient 
          : [recipeData.recipeIngredient].filter(Boolean)
          
        let instructions: string[] = []
        if (Array.isArray(recipeData.recipeInstructions)) {
          instructions = recipeData.recipeInstructions.map((step: any) => 
            typeof step === 'string' ? step : step.text
          ).filter(Boolean)
        } else if (typeof recipeData.recipeInstructions === 'string') {
          instructions = [recipeData.recipeInstructions]
        }

        const image = Array.isArray(recipeData.image) 
          ? recipeData.image[0] 
          : typeof recipeData.image === 'object' && recipeData.image?.url 
            ? recipeData.image.url 
            : typeof recipeData.image === 'string'
              ? recipeData.image
              : undefined

        const author = Array.isArray(recipeData.author)
          ? recipeData.author[0]?.name
          : typeof recipeData.author === 'object'
            ? recipeData.author?.name
            : recipeData.author

        const extracted: ExtractedRecipe = {
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
        }
        
        return extracted
      }

      // Fallback: Extremely basic DOM extraction if JSON-LD fails
      return reply.code(422).send({ 
        error: 'Could not find schema.org Recipe data on this page.',
        details: 'For MVP, we only support pages with standard Recipe JSON-LD.'
      })

    } catch (error: any) {
      server.log.error(error)
      return reply.code(500).send({ error: 'Extraction failed: ' + error.message })
    }
  })
}

export default extractRoutes
