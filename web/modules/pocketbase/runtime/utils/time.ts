import { parseDateTime } from '@internationalized/date'

export function parseDate(date: string) {
  return parseDateTime(`${new Date(date).toISOString().split('.')[0]}`)
}
