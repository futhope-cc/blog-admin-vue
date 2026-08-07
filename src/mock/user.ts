import { registerMock } from '@/api/request'
import { users } from './db'
import type { MockUser } from './db'
import { fail, now, ok, pageResult } from './helpers'
import { getCurrentUserId } from './auth'
import type { UserAddParams, UserInfo, UserUpdateParams } from '@/api/types'

function toUserInfo(user: MockUser): UserInfo {
  const { password: _password, ...info } = user
  return info
}

function genUserId(): string {
  const max = users.reduce((m, u) => Math.max(m, Number(u.id)), 0)
  return String(max + 1)
}

function findUser(id: string): MockUser | undefined {
  return users.find((u) => u.id === id)
}

registerMock('get', '/user/page', (config) => {
  const current = Number(config.params?.current) || 1
  const size = Number(config.params?.size) || 10
  const username = (config.params?.username || '').toString().toLowerCase()
  const statusRaw = config.params?.status
  const status =
    statusRaw === undefined || statusRaw === '' ? undefined : Number(statusRaw)

  let list = [...users]
  if (username) {
    list = list.filter((u) => u.username.toLowerCase().includes(username))
  }
  if (status !== undefined) {
    list = list.filter((u) => u.status === status)
  }
  list.sort((a, b) => Number(a.id) - Number(b.id))

  const { records, total } = pageResult(list, current, size)
  return ok({ records: records.map(toUserInfo), total, current, size })
})

registerMock('post', '/user/add', (config) => {
  const body = config.data as UserAddParams
  const username = body.username?.trim()
  if (!username || username.length < 2 || username.length > 50) {
    return fail('用户名需为 2-50 个字符', 400)
  }
  if (!body.password || body.password.length < 6 || body.password.length > 50) {
    return fail('密码需为 6-50 位', 400)
  }
  if (users.some((u) => u.username === username)) {
    return fail('用户名已存在', 1004)
  }
  const user: MockUser = {
    id: genUserId(),
    username,
    password: body.password,
    nickname: body.nickname?.trim() || username,
    avatar: '',
    email: body.email?.trim() || '',
    status: body.status ?? 1,
    createTime: now(),
  }
  users.push(user)
  return ok(Number(user.id))
})

registerMock('put', /^\/user\/update\/.+$/, (config) => {
  const id = (config.url as string).split('/').pop()!
  const body = config.data as UserUpdateParams
  const user = findUser(id)
  if (!user) return fail('用户不存在', 1002)
  if (body.nickname !== undefined) {
    user.nickname = body.nickname.trim() || user.nickname
  }
  if (body.email !== undefined) {
    user.email = body.email.trim()
  }
  if (body.status !== undefined) {
    user.status = body.status
  }
  return ok(null)
})

registerMock('delete', /^\/user\/delete\/.+$/, (config) => {
  const id = (config.url as string).split('/').pop()!
  const user = findUser(id)
  if (!user) return fail('用户不存在', 1002)
  if (id === getCurrentUserId()) {
    return fail('不能删除自己', 1006)
  }
  const normalCount = users.filter((u) => u.status === 1).length
  if (user.status === 1 && normalCount <= 1) {
    return fail('不能删除最后一个管理员', 1007)
  }
  const idx = users.findIndex((u) => u.id === id)
  users.splice(idx, 1)
  return ok(null)
})

registerMock('put', /^\/user\/password\/reset\/.+$/, (config) => {
  const id = (config.url as string).split('/').pop()!
  const newPassword = config.data?.newPassword as string | undefined
  const user = findUser(id)
  if (!user) return fail('用户不存在', 1002)
  if (!newPassword || newPassword.length < 6 || newPassword.length > 50) {
    return fail('密码需为 6-50 位', 400)
  }
  user.password = newPassword
  return ok(null)
})
