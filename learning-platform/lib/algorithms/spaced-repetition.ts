// Spaced Repetition Algorithm (SM-2 Algorithm)
// https://en.wikipedia.org/wiki/SuperMemo#Description_of_SM-2_algorithm

export type ReviewDifficulty = "easy" | "medium" | "hard" | "again"

export interface ReviewResult {
  nextReviewDate: Date
  repetition: number
  easeFactor: number
  interval: number
}

export function calculateNextReview(
  difficulty: ReviewDifficulty,
  currentRepetition: number = 0,
  currentEaseFactor: number = 2.5,
  currentInterval: number = 1
): ReviewResult {
  let repetition = currentRepetition
  let easeFactor = currentEaseFactor
  let interval = currentInterval

  // Update ease factor based on difficulty
  if (difficulty === "again") {
    // Reset card
    repetition = 0
    interval = 1
    easeFactor = Math.max(1.3, currentEaseFactor - 0.2)
  } else if (difficulty === "hard") {
    repetition += 1
    easeFactor = Math.max(1.3, currentEaseFactor - 0.15)
    interval = Math.max(1, currentInterval * 1.2)
  } else if (difficulty === "medium") {
    repetition += 1
    interval = currentInterval * easeFactor
  } else if (difficulty === "easy") {
    repetition += 1
    easeFactor = currentEaseFactor + 0.15
    interval = currentInterval * easeFactor * 1.3
  }

  // Calculate next review date
  const nextReviewDate = new Date()
  nextReviewDate.setDate(nextReviewDate.getDate() + Math.round(interval))

  return {
    nextReviewDate,
    repetition,
    easeFactor,
    interval: Math.round(interval),
  }
}

export function getDueCards(cards: any[]): any[] {
  const now = new Date()
  return cards.filter((card) => {
    if (!card.nextReviewAt) return true // New cards
    return new Date(card.nextReviewAt) <= now
  })
}

export function getReviewSchedule(cards: any[]): {
  dueNow: number
  dueToday: number
  dueTomorrow: number
  dueThisWeek: number
} {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const endOfWeek = new Date(today)
  endOfWeek.setDate(endOfWeek.getDate() + 7)

  return {
    dueNow: cards.filter((c) => !c.nextReviewAt || new Date(c.nextReviewAt) <= now).length,
    dueToday: cards.filter((c) => !c.nextReviewAt || new Date(c.nextReviewAt) <= tomorrow).length,
    dueTomorrow: cards.filter(
      (c) => c.nextReviewAt && new Date(c.nextReviewAt) > tomorrow && new Date(c.nextReviewAt) <= endOfWeek
    ).length,
    dueThisWeek: cards.filter(
      (c) => c.nextReviewAt && new Date(c.nextReviewAt) > tomorrow && new Date(c.nextReviewAt) <= endOfWeek
    ).length,
  }
}
