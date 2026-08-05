import type { ApiResponse } from '@/api/request'

export function ok<T>(data: T): ApiResponse<T> {
  return { code: 200, message: 'ok', data }
}

export function fail(message: string): ApiResponse<null> {
  return { code: 500, message, data: null }
}

export function pageData<T>(list: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize
  return {
    total: list.length,
    list: list.slice(start, start + pageSize),
  }
}

export function genId(list: Array<{ id: number }>): number {
  return list.length ? Math.max(...list.map((i) => i.id)) + 1 : 1
}

export function now(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}
