import request from './request'
import type { LoginParams, UserInfo } from './types'

export interface LoginResult {
  token: string
  user: UserInfo
}

export function login(data: LoginParams) {
  return request<LoginResult>({
    method: 'post',
    url: '/admin/login',
    data,
  })
}

export function getUserInfo() {
  return request<UserInfo>({
    method: 'get',
    url: '/admin/user/info',
  })
}

export function logout() {
  return request<null>({
    method: 'post',
    url: '/admin/logout',
  })
}

export function changePassword(data: {
  oldPassword: string
  newPassword: string
}) {
  return request<null>({
    method: 'post',
    url: '/admin/password',
    data,
  })
}
