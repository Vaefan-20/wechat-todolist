/** 存储格式：YYYY-MM-DD HH:mm */

export function splitDue(str: string | undefined): { date: string; time: string } {
  if (!str?.trim()) {
    return { date: '', time: '00:00' }
  }
  const m = str.trim().match(/^(\d{4}-\d{2}-\d{2})(?: (\d{2}:\d{2}))?$/)
  if (m) {
    return { date: m[1], time: m[2] || '00:00' }
  }
  return { date: '', time: '00:00' }
}

export function joinDue(date: string, time: string): string | undefined {
  const d = date.trim()
  if (!d) {
    return undefined
  }
  const t = (time || '00:00').trim() || '00:00'
  return `${d} ${t}`
}

export function migrateLegacyDue(str: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return `${str} 00:00`
  }
  return str
}
