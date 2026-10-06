import request from 'supertest'
import { randomUUID } from 'crypto'
import { createApp } from '../app'
import { env } from '../config/env'
import { initDatabase, pool } from '../config/database'

const app = createApp()
const api = (path: string) => `${env.API_PREFIX}${path}`

const post = (path: string, deviceId: string | null, body: object = {}) => {
  const req = request(app).post(api(path))
  if (deviceId) req.set('X-Device-Id', deviceId)
  return req.send(body)
}

const resultBody = (userId: number) => ({
  userId,
  grade: 3,
  topicId: 'g3-multable',
  topicName: 'Multiplication Tables',
  level: 1,
  correct: 7,
  total: 8,
  score: 88,
  stars: 2,
  durationMs: 65000,
  timed: true,
})

describe('Profiles are private to the browser that created them', () => {
  const deviceA = randomUUID()
  const deviceB = randomUUID()
  let profileId: number
  let resultId: number

  beforeAll(async () => {
    expect(await initDatabase()).toBe(true)
    const created = await post('/profiles/create', deviceA, { name: 'Alex', grade: 3 }).expect(201)
    profileId = created.body.data.profile.id
    const result = await post('/results/create', deviceA, resultBody(profileId)).expect(201)
    resultId = result.body.data.result.id
  })

  afterAll(async () => {
    await pool.query('DELETE FROM users WHERE device_id = ANY($1)', [[deviceA, deviceB]])
    await pool.end()
  })

  it('rejects requests without a valid device id', async () => {
    await post('/profiles/list', null).expect(400)
    await post('/profiles/list', 'short').expect(400)
    await post('/results/list', null, { userId: profileId }).expect(400)
  })

  it('lists only the profiles of the calling device', async () => {
    const mine = await post('/profiles/list', deviceA).expect(200)
    expect(mine.body.data.profiles.map((p: { id: number }) => p.id)).toContain(profileId)

    const theirs = await post('/profiles/list', deviceB).expect(200)
    expect(theirs.body.data.profiles).toEqual([])
  })

  it('does not let another device read, change or delete a profile', async () => {
    await post('/profiles/get', deviceB, { id: profileId }).expect(404)
    await post('/profiles/update', deviceB, { id: profileId, name: 'Hacked' }).expect(404)
    await post('/profiles/delete', deviceB, { id: profileId }).expect(200)

    const still = await post('/profiles/get', deviceA, { id: profileId }).expect(200)
    expect(still.body.data.profile.name).toBe('Alex')
  })

  it('does not expose results to another device', async () => {
    await post('/results/create', deviceB, resultBody(profileId)).expect(404)
    await post('/results/list', deviceB, { userId: profileId }).expect(404)
    await post('/results/stats', deviceB, { userId: profileId }).expect(404)
    await post('/results/topic-progress', deviceB, { userId: profileId }).expect(404)
    await post('/results/level-progress', deviceB, { userId: profileId }).expect(404)
    await post('/results/get', deviceB, { id: resultId }).expect(404)
    await post('/results/delete', deviceB, { id: resultId }).expect(200)

    const list = await post('/results/list', deviceA, { userId: profileId }).expect(200)
    expect(list.body.data.results).toHaveLength(1)
  })

  it('still lets the owner use their own profile and results', async () => {
    await post('/profiles/update', deviceA, { id: profileId, name: 'Alexa' }).expect(200)
    const stats = await post('/results/stats', deviceA, { userId: profileId }).expect(200)
    expect(stats.body.data.stats.totalGames).toBe(1)
    await post('/results/get', deviceA, { id: resultId }).expect(200)
    await post('/results/delete', deviceA, { id: resultId }).expect(200)
    await post('/profiles/delete', deviceA, { id: profileId }).expect(200)
    await post('/profiles/get', deviceA, { id: profileId }).expect(404)
  })
})
