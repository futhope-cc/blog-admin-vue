import { registerMock } from '@/api/request'
import { articles, categories, tags } from './db'
import { fail, genId, now, ok, pageResult } from './helpers'
import type {
  Article,
  ArticleAddParams,
  ArticleQuery,
  ArticleStatus,
  ArticleUpdateParams,
  PageResult,
} from '@/api/types'

function withRelations(list: Article[]): Article[] {
  return list.map((a) => {
    const cat = categories.find((c) => c.id === a.categoryId)
    const tagNames = a.tagIds
      .map((id) => tags.find((t) => t.id === id)?.name)
      .filter(Boolean) as string[]
    return {
      ...a,
      categoryName: cat?.name,
      tagNames,
    }
  })
}

registerMock('get', '/article/page', (config) => {
  const query = config.params as ArticleQuery
  const current = Number(query.current) || 1
  const size = Number(query.size) || 10

  let list = [...articles]
  if (query.keyword) {
    const kw = query.keyword.toLowerCase()
    list = list.filter(
      (a) => a.title.toLowerCase().includes(kw) || a.summary.toLowerCase().includes(kw),
    )
  }
  if (query.categoryId) {
    list = list.filter((a) => a.categoryId === query.categoryId)
  }
  if (query.tagId) {
    list = list.filter((a) => a.tagIds.includes(query.tagId!))
  }
  if (query.status !== undefined) {
    list = list.filter((a) => a.status === Number(query.status))
  }
  list.sort((a, b) => Number(b.id) - Number(a.id))

  const { records, total, current: c, size: s } = pageResult(list, current, size)
  return ok<PageResult<Article>>({ records: withRelations(records), total, current: c, size: s })
})

registerMock('post', '/article', (config) => {
  const body = config.data as ArticleAddParams
  if (!body.title.trim()) return fail('标题不能为空')
  if (!body.content.trim()) return fail('正文不能为空')
  if (!body.categoryId) return fail('请选择分类')

  const article: Article = {
    id: genId(articles),
    title: body.title,
    summary: body.summary,
    content: body.content,
    cover: body.cover,
    categoryId: body.categoryId,
    tagIds: body.tagIds,
    viewCount: 0,
    status: body.status,
    createTime: now(),
    publishTime: body.status === 1 ? now() : undefined,
  }
  articles.unshift(article)
  return ok<Article>(article)
})

registerMock('put', /^\/article\/.+$/, (config) => {
  const id = (config.url as string).split('/').pop()!
  const body = config.data as ArticleUpdateParams
  if (!body.title.trim()) return fail('标题不能为空')
  if (!body.content.trim()) return fail('正文不能为空')
  if (!body.categoryId) return fail('请选择分类')

  const idx = articles.findIndex((a) => a.id === id)
  if (idx === -1) return fail('文章不存在')
  articles[idx] = {
    ...articles[idx],
    title: body.title,
    summary: body.summary,
    content: body.content,
    cover: body.cover,
    categoryId: body.categoryId,
    tagIds: body.tagIds,
  }
  return ok<Article>(articles[idx])
})

registerMock('delete', /^\/article\/.+$/, (config) => {
  const id = (config.url as string).split('/').pop()!
  const idx = articles.findIndex((a) => a.id === id)
  if (idx === -1) return fail('文章不存在')
  articles.splice(idx, 1)
  return ok(null)
})

registerMock('patch', /^\/article\/.+\/status$/, (config) => {
  const segments = (config.url as string).split('/')
  const id = segments[segments.length - 2]
  const status = Number(config.data?.status) as ArticleStatus
  const article = articles.find((a) => a.id === id)
  if (!article) return fail('文章不存在')
  article.status = status
  article.publishTime = status === 1 ? now() : article.publishTime
  return ok(article)
})
