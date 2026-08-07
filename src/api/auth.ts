import request from './request'
import type { LoginParams, LoginResult, UserInfo } from './types'

export function login(data: LoginParams) {
  return request<LoginResult>({
    method: 'post',
    url: '/user/login',
    data,
  })
}

export function getUserInfo() {
  return request<UserInfo>({
    method: 'get',
    url: '/user/info',
  })
}

export function logout() {
  return request<null>({
    method: 'post',
    url: '/user/logout',
  })
}

export function changePassword(data: {
  oldPassword: string
  newPassword: string
}) {
  return request<null>({
    method: 'put',
    url: '/user/password',
    data,
  })
}
