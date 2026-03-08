import Fastify from 'fastify'
import cors from '@fastify/cors'
import * as dotenv from 'dotenv'

dotenv.config()

const server = Fastify({
  logger: true
})

server.register(cors, {
  origin: '*' // In production, restrict this
})

import extractRoutes from './routes/extract'
import optimizeRoutes from './routes/optimize'
import instacartRoutes from './routes/instacart'

server.register(extractRoutes)
server.register(optimizeRoutes)
server.register(instacartRoutes)

server.get('/health', async () => {
  return { status: 'ok' }
})

const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3000', 10)
    await server.listen({ port, host: '0.0.0.0' })
    server.log.info(`Server listening on port ${port}`)
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()
