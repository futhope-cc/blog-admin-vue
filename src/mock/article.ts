import { registerMock } from '@/api/request'
import { articles, categories, tags } from './db'
import { fail, genId, now, ok, pageData } from './helpers'
import type {
  Article,
  ArticleQuery,
  ArticleSaveParams,
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

function toId(n: number | string | undefined): number | undefined {
  const v = Number(n)
  return Number.isNaN(v) ? undefined : v
}

registerMock('get', '/admin/article/list', (config) => {
  const query = config.params as ArticleQuery
  const page = query.page || 1
  const pageSize = query.pageSize || 10

  let list = [...articles]
  if (query.keyword) {
    const kw = query.keyword.toLowerCase()
    list = list.filter(
      (a) => a.title.toLowerCase().includes(kw) || a.summary.toLowerCase().includes(kw),
    )
  }
  if (query.categoryId) {
    list = list.filter((a) => a.categoryId === toId(query.categoryId))
  }
  if (query.tagId) {
    list = list.filter((a) => a.tagIds.includes(toId(query.tagId)!))
  }
  if (query.status) {
    list = list.filter((a) => a.status === query.status)
  }
  list.sort((a, b) => b.id - a.id)

  const { total, list: slice } = pageData(list, page, pageSize)
  return ok<PageResult<Article>>({ total, list: withRelations(slice) })
})

registerMock('get', /^\/admin\/article\/\d+$/, (config) => {
  const id = Number((config.url as string).split('/').pop())
  const article = articles.find((a) => a.id === id)
  if (!article) return fail('文章不存在')
  return ok<Article>(withRelations([article])[0])
})

registerMock('post', '/admin/article', (config) => {
  const body = config.data as ArticleSaveParams
  if (!body.title.trim()) return fail('标题不能为空')
  if (!body.content.trim()) return fail('正文不能为空')
  if (!body.categoryId) return fail('请选择分类')

  if (body.id) {
    const idx = articles.findIndex((a) => a.id === body.id)
    if (idx === -1) return fail('文章不存在')
    articles[idx] = {
      ...articles[idx],
      title: body.title,
      summary: body.summary,
      content: body.content,
      cover: body.cover,
      categoryId: body.categoryId,
      tagIds: body.tagIds,
      status: body.status,
      publishTime: body.status === 'published' ? now() : articles[idx].publishTime,
    }
    return ok<Article>(articles[idx])
  }

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
    publishTime: body.status === 'published' ? now() : undefined,
  }
  articles.unshift(article)
  return ok<Article>(article)
})

registerMock('delete', /^\/admin\/article\/\d+$/, (config) => {
  const id = Number((config.url as string).split('/').pop())
  const idx = articles.findIndex((a) => a.id === id)
  if (idx === -1) return fail('文章不存在')
  articles.splice(idx, 1)
  return ok(null)
})

registerMock('patch', /^\/admin\/article\/\d+\/status$/, (config) => {
  const segments = (config.url as string).split('/')
  const id = Number(segments[3])
  const status = config.data?.status
  const article = articles.find((a) => a.id === id)
  if (!article) return fail('文章不存在')
  article.status = status
  article.publishTime = status === 'published' ? now() : article.publishTime
  return ok(article)
})
