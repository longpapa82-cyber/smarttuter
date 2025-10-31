/**
 * XP (Experience Points) calculation system
 * Based on Duolingo's gamification model with educational focus
 */

export interface XPEarnedResult {
  baseXP: number
  bonusXP: number
  totalXP: number
  breakdown: {
    category: string
    amount: number
    reason: string
  }[]
}

export interface ProblemCompletionData {
  isCorrect: boolean
  isFirstTry: boolean
  hintsUsed: number
  timeSpent: number // seconds
  difficulty: number // 0.0 - 1.0
  streakActive: boolean
  streakLength: number
  isDailyGoalComplete: boolean
  isPerfectSession?: boolean // 10 correct in a row
}

/**
 * Calculate XP earned from completing a problem
 */
export function calculateProblemXP(data: ProblemCompletionData): XPEarnedResult {
  const breakdown: { category: string; amount: number; reason: string }[] = []

  // Base XP (10-30 based on difficulty)
  const baseXP = Math.round(10 + (data.difficulty * 20))
  breakdown.push({
    category: 'Base',
    amount: baseXP,
    reason: `Problem difficulty: ${(data.difficulty * 100).toFixed(0)}%`,
  })

  let bonusXP = 0

  // Correct answer bonus
  if (data.isCorrect) {
    const correctBonus = 5
    bonusXP += correctBonus
    breakdown.push({
      category: 'Correct',
      amount: correctBonus,
      reason: 'Solved correctly',
    })

    // First try bonus
    if (data.isFirstTry) {
      const firstTryBonus = 5
      bonusXP += firstTryBonus
      breakdown.push({
        category: 'First Try',
        amount: firstTryBonus,
        reason: 'Solved on first attempt',
      })
    }

    // No hints bonus
    if (data.hintsUsed === 0) {
      const noHintsBonus = 3
      bonusXP += noHintsBonus
      breakdown.push({
        category: 'No Hints',
        amount: noHintsBonus,
        reason: 'Solved without hints',
      })
    }

    // Speed bonus (under 2 minutes)
    if (data.timeSpent < 120) {
      const speedBonus = 2
      bonusXP += speedBonus
      breakdown.push({
        category: 'Speed',
        amount: speedBonus,
        reason: 'Solved quickly',
      })
    }

    // Perfect session bonus
    if (data.isPerfectSession) {
      const perfectBonus = 20
      bonusXP += perfectBonus
      breakdown.push({
        category: 'Perfect Session',
        amount: perfectBonus,
        reason: '10 correct answers in a row!',
      })
    }
  }

  // Streak milestones
  if (data.streakActive) {
    const streakMilestones = [7, 14, 30, 50, 100]
    const milestone = streakMilestones.find(m => m === data.streakLength)

    if (milestone) {
      const streakBonus = milestone === 7 ? 10 : milestone === 14 ? 20 : milestone === 30 ? 50 : 100
      bonusXP += streakBonus
      breakdown.push({
        category: 'Streak Milestone',
        amount: streakBonus,
        reason: `${milestone}-day streak achieved!`,
      })
    }
  }

  // Daily goal completion
  if (data.isDailyGoalComplete) {
    const dailyGoalBonus = 10
    bonusXP += dailyGoalBonus
    breakdown.push({
      category: 'Daily Goal',
      amount: dailyGoalBonus,
      reason: 'Daily goal completed',
    })
  }

  return {
    baseXP,
    bonusXP,
    totalXP: baseXP + bonusXP,
    breakdown,
  }
}

/**
 * Calculate level from total XP
 * Uses exponential curve: Level = floor(sqrt(XP / 100))
 */
export function calculateLevel(totalXP: number): number {
  return Math.floor(Math.sqrt(totalXP / 100))
}

/**
 * Calculate XP required for a specific level
 */
export function xpForLevel(level: number): number {
  return level * level * 100
}

/**
 * Calculate XP needed to reach next level
 */
export function xpToNextLevel(currentXP: number): number {
  const currentLevel = calculateLevel(currentXP)
  const nextLevelXP = xpForLevel(currentLevel + 1)
  return nextLevelXP - currentXP
}

/**
 * Calculate XP earned from session completion
 */
export function calculateSessionXP(
  problemsCompleted: number,
  sessionDuration: number, // minutes
  avgDifficulty: number
): XPEarnedResult {
  const breakdown: { category: string; amount: number; reason: string }[] = []

  // Base session XP
  const baseXP = problemsCompleted * 5
  breakdown.push({
    category: 'Session Base',
    amount: baseXP,
    reason: `Completed ${problemsCompleted} problems`,
  })

  let bonusXP = 0

  // Focus time bonus (15+ minutes)
  if (sessionDuration >= 15) {
    const focusBonus = 10
    bonusXP += focusBonus
    breakdown.push({
      category: 'Focus Time',
      amount: focusBonus,
      reason: 'Studied for 15+ minutes',
    })
  }

  // High difficulty bonus
  if (avgDifficulty >= 0.7) {
    const difficultyBonus = 15
    bonusXP += difficultyBonus
    breakdown.push({
      category: 'Challenge',
      amount: difficultyBonus,
      reason: 'Tackled difficult problems',
    })
  }

  return {
    baseXP,
    bonusXP,
    totalXP: baseXP + bonusXP,
    breakdown,
  }
}

/**
 * XP multipliers for special events
 */
export function applyEventMultiplier(
  xp: number,
  eventType?: 'weekend' | 'challenge' | 'special'
): number {
  const multipliers = {
    weekend: 1.5,
    challenge: 2.0,
    special: 3.0,
  }

  if (!eventType) return xp

  return Math.round(xp * multipliers[eventType])
}

/**
 * Calculate daily XP goal based on user level and history
 */
export function calculateDailyGoal(
  userLevel: number,
  avgDailyXP: number,
  targetGrowth = 1.1
): number {
  // Base goal increases with level
  const baseGoal = 50 + (userLevel * 10)

  // Adjust based on recent performance
  const performanceAdjusted = Math.max(baseGoal, avgDailyXP * targetGrowth)

  // Round to nearest 10
  return Math.round(performanceAdjusted / 10) * 10
}
