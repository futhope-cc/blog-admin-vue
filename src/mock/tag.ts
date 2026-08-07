import { registerMock } from '@/api/request'
import { articles, tags } from './db'
import { fail, genId, ok } from './helpers'
import type { Tag, TagRequest } from '@/api/types'

function listWithCount() {
  return tags.map((t) => ({
    ...t,
    articleCount: articles.filter((a) => a.tagIds.includes(t.id)).length,
  }))
}

registerMock('get', '/tag/list', () => {
  return ok(listWithCount())
})

registerMock('post', '/tag', (config) => {
  const body = config.data as TagRequest
  const name = body.name?.trim()
  if (!name) return fail('标签名称不能为空')
  if (tags.some((t) => t.name === name)) return fail('标签已存在')
  const tag: Tag = { id: genId(tags), name }
  tags.push(tag)
  return ok(tag)
})

registerMock('put', /^\/tag\/.+$/, (config) => {
  const id = (config.url as string).split('/').pop()!
  const body = config.data as TagRequest
  const name = body.name?.trim()
  const tag = tags.find((t) => t.id === id)
  if (!tag) return fail('标签不存在')
  if (!name) return fail('标签名称不能为空')
  if (tags.some((t) => t.name === name && t.id !== id)) return fail('标签已存在')
  tag.name = name
  return ok(tag)
})

registerMock('delete', /^\/tag\/.+$/, (config) => {
  const id = (config.url as string).split('/').pop()!
  const idx = tags.findIndex((t) => t.id === id)
  if (idx === -1) return fail('标签不存在')
  tags.splice(idx, 1)
  articles.forEach((a) => {
    a.tagIds = a.tagIds.filter((tid) => tid !== id)
  })
  return ok(null)
})
