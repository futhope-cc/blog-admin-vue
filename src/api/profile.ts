import request from './request'
import type { SiteProfile, SiteProfileUpdateParams } from './types'

export function getProfile() {
  return request<SiteProfile>({
    method: 'get',
    url: '/profile',
  })
}

export function updateProfile(data: SiteProfileUpdateParams) {
  return request<null>({
    method: 'put',
    url: '/profile',
    data,
  })
}
