/**
 * Stickers are unlocked automatically from the total stars a profile has earned,
 * so no extra data needs to be stored. Order matters: each sticker needs more stars.
 */
export interface Sticker {
  id: string
  emoji: string
  name: string
  /** Total stars needed to unlock this sticker */
  stars: number
  /** Key of the playful palette (see COLOR_VAR in the curriculum) */
  color: string
}

export const STICKERS: Sticker[] = [
  { id: 'apple', emoji: '🍎', name: 'Red apple', stars: 3, color: 'orange' },
  { id: 'rocket', emoji: '🚀', name: 'Rocket', stars: 8, color: 'yellow' },
  { id: 'turtle', emoji: '🐢', name: 'Turtle', stars: 15, color: 'green' },
  { id: 'rainbow', emoji: '🌈', name: 'Rainbow', stars: 25, color: 'indigo' },
  { id: 'unicorn', emoji: '🦄', name: 'Unicorn', stars: 40, color: 'purple' },
  { id: 'balloon', emoji: '🎈', name: 'Balloon', stars: 55, color: 'pink' },
  { id: 'robot', emoji: '🤖', name: 'Robot', stars: 75, color: 'blue' },
  { id: 'pizza', emoji: '🍕', name: 'Pizza', stars: 100, color: 'orange' },
  { id: 'dino', emoji: '🦖', name: 'Dino', stars: 130, color: 'green' },
  { id: 'castle', emoji: '🏰', name: 'Castle', stars: 165, color: 'purple' },
  { id: 'trophy', emoji: '🏆', name: 'Trophy', stars: 205, color: 'yellow' },
  { id: 'crown', emoji: '👑', name: 'Crown', stars: 250, color: 'pink' },
]

export const unlockedStickers = (totalStars: number): Sticker[] =>
  STICKERS.filter((s) => totalStars >= s.stars)

/** Stickers unlocked by going from `before` to `after` total stars */
export const newlyUnlocked = (before: number, after: number): Sticker[] =>
  STICKERS.filter((s) => before < s.stars && after >= s.stars)

export const nextSticker = (totalStars: number): Sticker | undefined =>
  STICKERS.find((s) => totalStars < s.stars)
