/**
 * A random id that identifies this browser. It is created the first time the
 * site is opened, kept in localStorage, and sent with every profile and result
 * request, so each browser only ever sees the profiles it created itself.
 *
 * Treat it like a password: never put it in a URL or share it.
 */
const STORAGE_KEY = 'mathland.deviceId'

let memoryId: string | null = null

const generate = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}-${Math.random().toString(16).slice(2)}`

export function getDeviceId(): string {
  if (memoryId) return memoryId
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && /^[A-Za-z0-9-]{16,64}$/.test(stored)) {
      memoryId = stored
      return stored
    }
  } catch {
    // Storage is blocked (private mode): fall back to an id that lasts until the tab closes
  }
  memoryId = generate()
  try {
    localStorage.setItem(STORAGE_KEY, memoryId)
  } catch {
    // Ignore: the in-memory id is still used for this visit
  }
  return memoryId
}
