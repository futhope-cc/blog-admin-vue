import type { ApiResponse } from '@/api/request'

export function ok<T>(data: T): ApiResponse<T> {
  return { code: 0, message: 'success', data }
}

export function fail(message: string, code = 500): ApiResponse<null> {
  return { code, message, data: null }
}

export function pageResult<T>(list: T[], current: number, size: number) {
  const start = (current - 1) * size
  return {
    records: list.slice(start, start + size),
    total: list.length,
    current,
    size,
  }
}

export function genId(list: Array<{ id: string }>): string {
  return String(list.reduce((m, i) => Math.max(m, Number(i.id)), 0) + 1)
}

export function now(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}
