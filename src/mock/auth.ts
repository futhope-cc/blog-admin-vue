import { registerMock } from '@/api/request'
import { users } from './db'
import { fail, ok } from './helpers'
import type { LoginParams, UserInfo } from '@/api/types'

const TOKEN = 'mock-token-2026'

registerMock('post', '/admin/login', (config) => {
  const { username, password } = config.data as LoginParams
  const user = users.find((u) => u.username === username)
  if (!user || password !== '123456') {
    return fail('用户名或密码错误')
  }
  return ok({ token: TOKEN, user })
})

registerMock('get', '/admin/user/info', () => {
  return ok<UserInfo>(users[0])
})

registerMock('post', '/admin/logout', () => {
  return ok(null)
})

registerMock('post', '/admin/password', (config) => {
  const { oldPassword, newPassword } = config.data as {
    oldPassword: string
    newPassword: string
  }
  if (oldPassword !== '123456') {
    return fail('原密码错误')
  }
  if (!newPassword || newPassword.length < 6) {
    return fail('新密码至少 6 位')
  }
  return ok(null)
})
