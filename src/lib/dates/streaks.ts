import { getPreviousLocalDate } from './engine'

export type StreakInfo = {
  currentStreak: number
  longestStreak: number
}

/**
 * Calculates current and longest streak values from a set of local date strings (YYYY-MM-DD).
 */
export function calculateStreaks(checkInDates: string[], todayLocalDate: string): StreakInfo {
  // Sort and remove any duplicates
  const uniqueDates = Array.from(new Set(checkInDates)).sort()

  if (uniqueDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 }
  }

  // 1. Calculate the Longest Streak
  let longestStreak = 1
  let currentRun = 1

  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = uniqueDates[i - 1]
    const currDate = uniqueDates[i]
    const expectedPrev = getPreviousLocalDate(currDate)

    if (prevDate === expectedPrev) {
      currentRun++
      if (currentRun > longestStreak) {
        longestStreak = currentRun
      }
    } else {
      currentRun = 1
    }
  }

  // 2. Calculate the Current Streak
  const checkInSet = new Set(uniqueDates)
  const yesterdayLocalDate = getPreviousLocalDate(todayLocalDate)
  let currentStreak = 0

  if (checkInSet.has(todayLocalDate)) {
    let dateToCheck = todayLocalDate
    while (checkInSet.has(dateToCheck)) {
      currentStreak++
      dateToCheck = getPreviousLocalDate(dateToCheck)
    }
  } else if (checkInSet.has(yesterdayLocalDate)) {
    let dateToCheck = yesterdayLocalDate
    while (checkInSet.has(dateToCheck)) {
      currentStreak++
      dateToCheck = getPreviousLocalDate(dateToCheck)
    }
  } else {
    currentStreak = 0
  }

  return {
    currentStreak,
    longestStreak,
  }
}
