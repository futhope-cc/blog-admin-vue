import request from './request'
import type { PageResult, UserAddParams, UserInfo, UserUpdateParams } from './types'

export function getUserPage(params: {
  current: number
  size: number
  username?: string
  status?: number
}) {
  return request<PageResult<UserInfo>>({
    method: 'get',
    url: '/user/page',
    params,
  })
}

export function addUser(data: UserAddParams) {
  return request<number>({
    method: 'post',
    url: '/user/add',
    data,
  })
}

export function updateUser(id: string, data: UserUpdateParams) {
  return request<null>({
    method: 'put',
    url: `/user/update/${id}`,
    data,
  })
}

export function deleteUser(id: string) {
  return request<null>({
    method: 'delete',
    url: `/user/delete/${id}`,
  })
}

export function resetUserPassword(id: string, newPassword: string) {
  return request<null>({
    method: 'put',
    url: `/user/password/reset/${id}`,
    data: { newPassword },
  })
}
