import request from './request'
import type { DashboardStats } from './types'

export function getDashboardStats() {
  return request<DashboardStats>({
    method: 'get',
    url: '/stats/dashboard',
  })
}
