import express, { Application } from 'express'
import cors from 'cors'
import compression from 'compression'
import 'express-async-errors'
import { env } from './config/env'
import { errorHandler } from './middleware/errorHandler'
import { httpLogger } from './middleware/logger'
import { systemRouter } from './modules/system'
import { profileRouter } from './modules/profiles'
import { resultRouter } from './modules/results'
import { isDatabaseHealthy } from './config/database'

export const createApp = (): Application => {
  const app = express()

  // HTTP request logging
  app.use(httpLogger)

  app.use(
    cors({
      origin: env.CORS_ORIGIN === '*' ? '*' : env.CORS_ORIGIN,
      credentials: env.CORS_ORIGIN !== '*',
    })
  )

  // Body parsing and compression
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(compression())

  // Readiness check with real database status (must precede systemRouter)
  app.get(`${env.API_PREFIX}/health/ready`, async (_req, res) => {
    const healthy = await isDatabaseHealthy()
    res.status(healthy ? 200 : 503).json({
      status: healthy ? 'ready' : 'degraded',
      timestamp: new Date().toISOString(),
      checks: { database: healthy ? 'up' : 'down' },
    })
  })

  // API routes - System & Health
  app.use(env.API_PREFIX, systemRouter)

  // Domain routes
  app.use(`${env.API_PREFIX}/profiles`, profileRouter)
  app.use(`${env.API_PREFIX}/results`, resultRouter)

  // Error handling
  app.use(errorHandler)

  return app
}
