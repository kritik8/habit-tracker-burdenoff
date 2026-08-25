import { describe, it, expect } from 'vitest'
import { getLocalCalendarDate, isValidTimeZone, getNextLocalDate, getPreviousLocalDate } from '../src/lib/dates/engine'

describe('Timezone & Date Engine', () => {
  describe('isValidTimeZone', () => {
    it('should validate IANA timezones', () => {
      expect(isValidTimeZone('Asia/Kolkata')).toBe(true)
      expect(isValidTimeZone('America/New_York')).toBe(true)
      expect(isValidTimeZone('UTC')).toBe(true)
      expect(isValidTimeZone('Invalid/Timezone')).toBe(false)
    })
  })

  describe('getLocalCalendarDate', () => {
    it('should correctly format date strings for Asia/Kolkata (UTC+5.5)', () => {
      const timezone = 'Asia/Kolkata'

      // Instants around midnight
      // 2026-03-11T18:29Z -> 23:59 local (still March 11)
      const instantBeforeMidnight = new Date('2026-03-11T18:29:00Z')
      expect(getLocalCalendarDate(instantBeforeMidnight, timezone)).toBe('2026-03-11')

      // 2026-03-11T18:31Z -> 00:01 local (next day, March 12)
      const instantAfterMidnight = new Date('2026-03-11T18:31:00Z')
      expect(getLocalCalendarDate(instantAfterMidnight, timezone)).toBe('2026-03-12')
    })

    it('should verify the assignment worked example in Asia/Kolkata', () => {
      const timezone = 'Asia/Kolkata'

      // 2026-03-10T14:30Z → 2026-03-10 local
      expect(getLocalCalendarDate(new Date('2026-03-10T14:30:00Z'), timezone)).toBe('2026-03-10')

      // 2026-03-11T10:30Z → 2026-03-11 local
      expect(getLocalCalendarDate(new Date('2026-03-11T10:30:00Z'), timezone)).toBe('2026-03-11')

      // 2026-03-11T21:30Z → 2026-03-12 local
      expect(getLocalCalendarDate(new Date('2026-03-11T21:30:00Z'), timezone)).toBe('2026-03-12')

      // 2026-03-12T17:30Z → 2026-03-12 local
      expect(getLocalCalendarDate(new Date('2026-03-12T17:30:00Z'), timezone)).toBe('2026-03-12')
    })

    it('should correctly handle America/New_York DST transitions (March 2026)', () => {
      const timezone = 'America/New_York'

      // DST Start: March 8, 2026. Clock jumps from 02:00 (EST, -5) to 03:00 (EDT, -4)
      // 06:59:00Z -> 01:59:00 EST. Local date: 2026-03-08
      const estInstant = new Date('2026-03-08T06:59:00Z')
      expect(getLocalCalendarDate(estInstant, timezone)).toBe('2026-03-08')

      // 07:01:00Z -> 03:01:00 EDT. Local date: 2026-03-08
      const edtInstant = new Date('2026-03-08T07:01:00Z')
      expect(getLocalCalendarDate(edtInstant, timezone)).toBe('2026-03-08')

      // Midnight boundary transition on New York DST transition day
      // 2026-03-08T04:59Z -> 23:59:00 local on March 7
      expect(getLocalCalendarDate(new Date('2026-03-08T04:59:00Z'), timezone)).toBe('2026-03-07')

      // 2026-03-08T05:01Z -> 00:01:00 local on March 8
      expect(getLocalCalendarDate(new Date('2026-03-08T05:01:00Z'), timezone)).toBe('2026-03-08')
    })
  })

  describe('Calendar Day Arithmetic', () => {
    it('should get next local calendar date correctly', () => {
      expect(getNextLocalDate('2026-03-10')).toBe('2026-03-11')
      expect(getNextLocalDate('2026-12-31')).toBe('2027-01-01')
      expect(getNextLocalDate('2026-02-28')).toBe('2026-03-01') // non-leap year
    })

    it('should get previous local calendar date correctly', () => {
      expect(getPreviousLocalDate('2026-03-11')).toBe('2026-03-10')
      expect(getPreviousLocalDate('2027-01-01')).toBe('2026-12-31')
      expect(getPreviousLocalDate('2026-03-01')).toBe('2026-02-28')
    })
  })
})
