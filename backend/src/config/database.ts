import pg from 'pg'
import { logger } from './logger'

const { Pool } = pg

const connectionString =
  process.env.DATABASE_URL || 'postgres://postgres:Tencent2025@localhost:5432/mathland'

export const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
})

pool.on('error', (err) => {
  logger.error({ err }, 'Unexpected postgres pool error')
})

export const query = async <T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<pg.QueryResult<T>> => {
  const start = Date.now()
  const result = await pool.query<T>(text, params)
  const duration = Date.now() - start
  if (duration > 500) {
    logger.warn({ duration, text: text.slice(0, 120) }, 'Slow query detected')
  }
  return result
}

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(40) NOT NULL,
  avatar     VARCHAR(24) NOT NULL DEFAULT 'panda',
  color      VARCHAR(24) NOT NULL DEFAULT 'indigo',
  grade      INT         NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS game_results (
  id          SERIAL PRIMARY KEY,
  user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  grade       INT NOT NULL,
  topic_id    VARCHAR(64) NOT NULL,
  topic_name  VARCHAR(80) NOT NULL DEFAULT '',
  level       INT NOT NULL,
  correct     INT NOT NULL,
  total       INT NOT NULL,
  score       INT NOT NULL,
  stars       INT NOT NULL,
  duration_ms INT NOT NULL DEFAULT 0,
  timed       BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_results_user ON game_results(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_results_topic ON game_results(user_id, topic_id);
`

export const initDatabase = async (): Promise<boolean> => {
  try {
    await pool.query(SCHEMA_SQL)
    logger.info('Database schema ready')
    return true
  } catch (error) {
    logger.error({ err: error }, 'Database init failed - running in degraded mode')
    return false
  }
}

export const isDatabaseHealthy = async (): Promise<boolean> => {
  try {
    await pool.query('SELECT 1')
    return true
  } catch {
    return false
  }
}
