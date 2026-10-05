/**
 * Vercel serverless entry point.
 *
 * Every request to /api/* is rewritten to this single function (see vercel.json).
 * It loads the compiled backend (backend/dist, built by `pnpm --dir backend build`
 * during the Vercel build) and reuses the same Express app as the local dev
 * server. The database schema is created lazily on the first request of each
 * cold start, and retried on the next request if that fails.
 */
const { createApp } = require('../backend/dist/app')
const { initDatabase } = require('../backend/dist/config/database')

const app = createApp()
let schemaReady

module.exports = async function handler(req, res) {
  schemaReady = schemaReady || initDatabase()
  const ok = await schemaReady
  if (!ok) schemaReady = undefined
  app(req, res)
}
