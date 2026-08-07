import { registerMock } from '@/api/request'
import { users } from './db'
import type { MockUser } from './db'
import { fail, ok } from './helpers'
import type { LoginParams, LoginResult, UserInfo } from '@/api/types'

const MOCK_SESSION_KEY = 'blog_admin_mock_user'

function toUserInfo(user: MockUser): UserInfo {
  const { password: _password, ...info } = user
  return info
}

function readSession(): UserInfo | null {
  const raw = localStorage.getItem(MOCK_SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as UserInfo
  } catch {
    return null
  }
}

let currentUser: UserInfo | null = readSession()

export function getCurrentUser(): UserInfo | null {
  return currentUser
}

export function getCurrentUserId(): string | null {
  return currentUser?.id ?? null
}

registerMock('post', '/user/login', (config) => {
  const { username, password } = config.data as LoginParams
  const user = users.find((u) => u.username === username)
  if (!user || user.password !== password) {
    return fail('用户名或密码错误', 1001)
  }
  if (user.status === 0) {
    return fail('用户已被禁用', 1003)
  }
  currentUser = toUserInfo(user)
  localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(currentUser))
  const data: LoginResult = {
    tokenName: 'satoken',
    tokenValue: `mock-token-${user.id}`,
    userInfo: currentUser,
  }
  return ok(data)
})

registerMock('get', '/user/info', () => {
  if (!currentUser) return fail('未登录', 401)
  return ok<UserInfo>(currentUser)
})

registerMock('post', '/user/logout', () => {
  currentUser = null
  localStorage.removeItem(MOCK_SESSION_KEY)
  return ok(null)
})

registerMock('put', '/user/password', (config) => {
  if (!currentUser) return fail('未登录', 401)
  const { oldPassword, newPassword } = config.data as {
    oldPassword: string
    newPassword: string
  }
  if (!oldPassword) return fail('原密码不能为空', 400)
  if (!newPassword || newPassword.length < 6 || newPassword.length > 50) {
    return fail('新密码需为 6-50 位', 400)
  }
  const user = users.find((u) => u.id === currentUser!.id)
  if (!user) return fail('用户不存在', 1002)
  if (user.password !== oldPassword) return fail('原密码错误', 1005)
  user.password = newPassword
  return ok(null)
})
