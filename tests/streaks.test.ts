import { describe, it, expect } from 'vitest'
import { calculateStreaks } from '../src/lib/dates/streaks'

describe('Streak Calculation Engine', () => {
  it('should calculate streak of 0 when no check-ins exist', () => {
    const streaks = calculateStreaks([], '2026-03-12')
    expect(streaks.currentStreak).toBe(0)
    expect(streaks.longestStreak).toBe(0)
  })

  it('should compute current streak when today is completed', () => {
    // today: completed, yesterday: completed, 2 days ago: completed
    const dates = ['2026-03-12', '2026-03-11', '2026-03-10']
    const streaks = calculateStreaks(dates, '2026-03-12')
    expect(streaks.currentStreak).toBe(3)
    expect(streaks.longestStreak).toBe(3)
  })

  it('should compute current streak when today is not completed but yesterday is', () => {
    // today: not completed (2026-03-12), yesterday: completed (2026-03-11), 2 days ago: completed (2026-03-10)
    const dates = ['2026-03-11', '2026-03-10']
    const streaks = calculateStreaks(dates, '2026-03-12')
    expect(streaks.currentStreak).toBe(2)
    expect(streaks.longestStreak).toBe(2)
  })

  it('should compute current streak as 0 when both today and yesterday are missing', () => {
    // today: 2026-03-12, yesterday: 2026-03-11. Checked in: 2 days ago (2026-03-10)
    const dates = ['2026-03-10']
    const streaks = calculateStreaks(dates, '2026-03-12')
    expect(streaks.currentStreak).toBe(0)
    expect(streaks.longestStreak).toBe(1)
  })

  it('should verify the assignment worked example (and filter duplicates)', () => {
    const dates = ['2026-03-10', '2026-03-11', '2026-03-12', '2026-03-12']
    const streaks = calculateStreaks(dates, '2026-03-12')
    expect(streaks.currentStreak).toBe(3)
    expect(streaks.longestStreak).toBe(3)
  })

  it('should correctly join two streak segments when a historical gap is backfilled', () => {
    // Segment A: March 1-2. Gap: March 3. Segment B: March 4-5.
    const beforeBackfill = ['2026-03-01', '2026-03-02', '2026-03-04', '2026-03-05']

    // Streaks before backfilling March 3 (today is March 5)
    let streaks = calculateStreaks(beforeBackfill, '2026-03-05')
    expect(streaks.currentStreak).toBe(2) // only March 4-5
    expect(streaks.longestStreak).toBe(2) // maximum of segment A (2) or B (2)

    // After backfilling March 3
    const afterBackfill = [...beforeBackfill, '2026-03-03']
    streaks = calculateStreaks(afterBackfill, '2026-03-05')
    expect(streaks.currentStreak).toBe(5) // March 1, 2, 3, 4, 5
    expect(streaks.longestStreak).toBe(5) // joined streak of 5
  })
})
