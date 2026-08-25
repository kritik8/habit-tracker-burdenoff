/**
 * Returns whether a timezone string is a valid IANA timezone name.
 */
export function isValidTimeZone(timeZone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone })
    return true
  } catch {
    return false
  }
}

/**
 * Resolves the local calendar date string (YYYY-MM-DD) for a given UTC instant and timezone.
 * Handles offsets and DST transitions authoritatively.
 */
export function getLocalCalendarDate(utcInstant: Date, timeZone: string): string {
  if (!isValidTimeZone(timeZone)) {
    throw new Error(`Invalid timezone: ${timeZone}`)
  }

  // Use Intl.DateTimeFormat to format the date in the target timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  // Returns "MM/DD/YYYY"
  const formatted = formatter.format(utcInstant)
  const [month, day, year] = formatted.split('/')
  return `${year}-${month}-${day}`
}

/**
 * Returns the next consecutive calendar date string (YYYY-MM-DD).
 * Performed in UTC noon to completely bypass local DST changes.
 */
export function getNextLocalDate(dateStr: string): string {
  const date = new Date(`${dateStr}T12:00:00Z`)
  date.setUTCDate(date.getUTCDate() + 1)
  return date.toISOString().split('T')[0]
}

/**
 * Returns the previous consecutive calendar date string (YYYY-MM-DD).
 * Performed in UTC noon to completely bypass local DST changes.
 */
export function getPreviousLocalDate(dateStr: string): string {
  const date = new Date(`${dateStr}T12:00:00Z`)
  date.setUTCDate(date.getUTCDate() - 1)
  return date.toISOString().split('T')[0]
}

/**
 * Returns the number of calendar days between two date strings (date2 - date1).
 */
export function getCalendarDaysDiff(date1: string, date2: string): number {
  const d1 = new Date(`${date1}T12:00:00Z`)
  const d2 = new Date(`${date2}T12:00:00Z`)
  const diffTime = d2.getTime() - d1.getTime()
  return Math.round(diffTime / (1000 * 60 * 60 * 24))
}
