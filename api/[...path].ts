import type { IncomingMessage, ServerResponse } from 'http'
import { createApp } from '../backend/src/app'
import { initDatabase } from '../backend/src/config/database'

/**
 * Vercel serverless entry point.
 *
 * Every request to /api/* is handled by this single function, which reuses the
 * same Express app as the local dev server (backend/src/app.ts). The database
 * schema is created lazily on the first request of each cold start, and is
 * retried on the next request if it fails.
 */
const app = createApp()
let schemaReady: Promise<boolean> | undefined

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  schemaReady ??= initDatabase()
  const ok = await schemaReady
  if (!ok) schemaReady = undefined
  app(req, res)
}
