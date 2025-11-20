// Achievement definitions
export const ACHIEVEMENTS = [
  // Getting Started
  {
    id: "first_login",
    type: "first_login",
    title: "Welcome Aboard!",
    description: "Complete your first login",
    icon: "👋",
    xp: 10,
    condition: (stats: any) => true, // Auto-unlock on first session
  },
  {
    id: "onboarding_complete",
    type: "onboarding_complete",
    title: "Ready to Learn",
    description: "Complete the onboarding process",
    icon: "✅",
    xp: 25,
    condition: (stats: any) => stats.onboardingComplete,
  },
  {
    id: "first_subject",
    type: "first_subject",
    title: "Subject Creator",
    description: "Create your first subject",
    icon: "📚",
    xp: 50,
    condition: (stats: any) => stats.subjectsCreated >= 1,
  },

  // Note Management
  {
    id: "first_note",
    type: "first_note",
    title: "Note Taker",
    description: "Upload your first note",
    icon: "📝",
    xp: 75,
    condition: (stats: any) => stats.notesUploaded >= 1,
  },
  {
    id: "notes_10",
    type: "notes_milestone",
    title: "Organized Learner",
    description: "Upload 10 notes",
    icon: "📑",
    xp: 200,
    condition: (stats: any) => stats.notesUploaded >= 10,
  },
  {
    id: "notes_50",
    type: "notes_milestone",
    title: "Knowledge Collector",
    description: "Upload 50 notes",
    icon: "📚",
    xp: 500,
    condition: (stats: any) => stats.notesUploaded >= 50,
  },

  // Streaks
  {
    id: "streak_3",
    type: "streak",
    title: "On Fire!",
    description: "Maintain a 3-day learning streak",
    icon: "🔥",
    xp: 100,
    condition: (stats: any) => stats.currentStreak >= 3,
  },
  {
    id: "streak_7",
    type: "streak",
    title: "Week Warrior",
    description: "Maintain a 7-day learning streak",
    icon: "🔥",
    xp: 250,
    condition: (stats: any) => stats.currentStreak >= 7,
  },
  {
    id: "streak_30",
    type: "streak",
    title: "Month Master",
    description: "Maintain a 30-day learning streak",
    icon: "🏆",
    xp: 1000,
    condition: (stats: any) => stats.currentStreak >= 30,
  },
  {
    id: "streak_100",
    type: "streak",
    title: "Century Champion",
    description: "Maintain a 100-day learning streak",
    icon: "👑",
    xp: 5000,
    condition: (stats: any) => stats.currentStreak >= 100,
  },

  // Quizzes
  {
    id: "first_quiz",
    type: "first_quiz",
    title: "Quiz Taker",
    description: "Complete your first quiz",
    icon: "🧠",
    xp: 100,
    condition: (stats: any) => stats.quizzesCompleted >= 1,
  },
  {
    id: "quiz_10",
    type: "quiz_milestone",
    title: "Quiz Enthusiast",
    description: "Complete 10 quizzes",
    icon: "🎯",
    xp: 300,
    condition: (stats: any) => stats.quizzesCompleted >= 10,
  },
  {
    id: "quiz_50",
    type: "quiz_milestone",
    title: "Quiz Master",
    description: "Complete 50 quizzes",
    icon: "🏅",
    xp: 1000,
    condition: (stats: any) => stats.quizzesCompleted >= 50,
  },
  {
    id: "perfect_quiz",
    type: "perfect_quiz",
    title: "Perfect Score",
    description: "Get 100% on a quiz",
    icon: "⭐",
    xp: 200,
    condition: (stats: any) => stats.perfectQuizzes >= 1,
  },
  {
    id: "perfect_10",
    type: "perfect_quiz",
    title: "Perfectionist",
    description: "Get 100% on 10 quizzes",
    icon: "✨",
    xp: 1000,
    condition: (stats: any) => stats.perfectQuizzes >= 10,
  },

  // Games
  {
    id: "first_game",
    type: "first_game",
    title: "Game Player",
    description: "Play your first learning game",
    icon: "🎮",
    xp: 100,
    condition: (stats: any) => stats.gamesPlayed >= 1,
  },
  {
    id: "games_10",
    type: "game_milestone",
    title: "Game Enthusiast",
    description: "Play 10 learning games",
    icon: "🕹️",
    xp: 300,
    condition: (stats: any) => stats.gamesPlayed >= 10,
  },

  // Slides
  {
    id: "first_slides",
    type: "first_slides",
    title: "Slide Master",
    description: "Generate your first slide deck",
    icon: "📊",
    xp: 150,
    condition: (stats: any) => stats.slidesGenerated >= 1,
  },

  // Flashcards
  {
    id: "first_flashcards",
    type: "first_flashcards",
    title: "Memory Builder",
    description: "Create your first flashcard set",
    icon: "🎴",
    xp: 100,
    condition: (stats: any) => stats.flashcardsCreated >= 1,
  },
  {
    id: "flashcard_reviews_100",
    type: "flashcard_milestone",
    title: "Review Champion",
    description: "Review 100 flashcards",
    icon: "💪",
    xp: 500,
    condition: (stats: any) => stats.flashcardsReviewed >= 100,
  },

  // AI Interactions
  {
    id: "ai_questions_10",
    type: "ai_milestone",
    title: "Curious Mind",
    description: "Ask the AI Teacher 10 questions",
    icon: "🤔",
    xp: 250,
    condition: (stats: any) => stats.aiQuestionsAsked >= 10,
  },
  {
    id: "ai_questions_50",
    type: "ai_milestone",
    title: "Knowledge Seeker",
    description: "Ask the AI Teacher 50 questions",
    icon: "🔍",
    xp: 750,
    condition: (stats: any) => stats.aiQuestionsAsked >= 50,
  },

  // Overall Progress
  {
    id: "xp_1000",
    type: "xp_milestone",
    title: "Rising Star",
    description: "Earn 1,000 XP",
    icon: "⭐",
    xp: 0, // No XP reward (meta achievement)
    condition: (stats: any) => stats.totalXP >= 1000,
  },
  {
    id: "xp_5000",
    type: "xp_milestone",
    title: "Elite Learner",
    description: "Earn 5,000 XP",
    icon: "🌟",
    xp: 0,
    condition: (stats: any) => stats.totalXP >= 5000,
  },
  {
    id: "xp_10000",
    type: "xp_milestone",
    title: "Learning Legend",
    description: "Earn 10,000 XP",
    icon: "👑",
    xp: 0,
    condition: (stats: any) => stats.totalXP >= 10000,
  },
] as const

// Level thresholds
export const LEVELS = [
  { level: 1, xpRequired: 0, title: "Beginner" },
  { level: 2, xpRequired: 100, title: "Learner" },
  { level: 3, xpRequired: 300, title: "Student" },
  { level: 4, xpRequired: 600, title: "Scholar" },
  { level: 5, xpRequired: 1000, title: "Expert" },
  { level: 6, xpRequired: 1500, title: "Master" },
  { level: 7, xpRequired: 2100, title: "Guru" },
  { level: 8, xpRequired: 2800, title: "Sage" },
  { level: 9, xpRequired: 3600, title: "Legend" },
  { level: 10, xpRequired: 5000, title: "Grandmaster" },
  { level: 11, xpRequired: 7000, title: "Elite" },
  { level: 12, xpRequired: 10000, title: "Champion" },
  { level: 13, xpRequired: 15000, title: "Hero" },
  { level: 14, xpRequired: 20000, title: "Titan" },
  { level: 15, xpRequired: 30000, title: "God" },
]

// Calculate level from XP
export function calculateLevel(xp: number): { level: number; title: string; progress: number; nextLevelXP: number } {
  let currentLevel = LEVELS[0]
  let nextLevel = LEVELS[1]

  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].xpRequired) {
      currentLevel = LEVELS[i]
      nextLevel = LEVELS[i + 1] || LEVELS[i]
    } else {
      break
    }
  }

  const progressXP = xp - currentLevel.xpRequired
  const requiredXP = nextLevel.xpRequired - currentLevel.xpRequired
  const progress = requiredXP > 0 ? (progressXP / requiredXP) * 100 : 100

  return {
    level: currentLevel.level,
    title: currentLevel.title,
    progress: Math.min(progress, 100),
    nextLevelXP: nextLevel.xpRequired,
  }
}

// Check which achievements should be unlocked
export function checkAchievements(stats: any, existingAchievements: string[]): typeof ACHIEVEMENTS[number][] {
  return ACHIEVEMENTS.filter(
    (achievement) =>
      !existingAchievements.includes(achievement.id) &&
      achievement.condition(stats)
  )
}

// Calculate XP rewards
export const XP_REWARDS = {
  LOGIN_DAILY: 10,
  SUBJECT_CREATED: 50,
  NOTE_UPLOADED: 25,
  QUIZ_COMPLETED: 50,
  QUIZ_PERFECT: 100,
  GAME_PLAYED: 30,
  SLIDES_GENERATED: 75,
  FLASHCARDS_CREATED: 40,
  FLASHCARD_REVIEWED: 5,
  AI_QUESTION_ASKED: 10,
  TOPIC_COMPLETED: 100,
}
