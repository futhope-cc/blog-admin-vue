import { registerMock } from '@/api/request'
import { articles, comments } from './db'
import { fail, genId, now, ok, pageData } from './helpers'
import type { Comment, PageResult } from '@/api/types'

function withArticle(list: Comment[]): Comment[] {
  return list.map((c) => {
    const article = articles.find((a) => a.id === c.articleId)
    return { ...c, articleTitle: article?.title }
  })
}

registerMock('get', '/admin/comment/list', (config) => {
  const page = Number(config.params?.page) || 1
  const pageSize = Number(config.params?.pageSize) || 10
  const status = config.params?.status || ''
  const keyword = (config.params?.keyword || '').toString().toLowerCase()

  let list = [...comments]
  if (status) list = list.filter((c) => c.status === status)
  if (keyword) {
    list = list.filter(
      (c) =>
        c.username.toLowerCase().includes(keyword) ||
        c.content.toLowerCase().includes(keyword),
    )
  }
  list.sort((a, b) => b.id - a.id)
  const { total, list: slice } = pageData(list, page, pageSize)
  return ok<PageResult<Comment>>({ total, list: withArticle(slice) })
})

registerMock('patch', /^\/admin\/comment\/\d+\/status$/, (config) => {
  const segments = (config.url as string).split('/')
  const id = Number(segments[3])
  const status = config.data?.status as Comment['status']
  const comment = comments.find((c) => c.id === id)
  if (!comment) return fail('评论不存在')
  comment.status = status
  return ok(comment)
})

registerMock('delete', /^\/admin\/comment\/\d+$/, (config) => {
  const id = Number((config.url as string).split('/').pop())
  const idx = comments.findIndex((c) => c.id === id)
  if (idx === -1) return fail('评论不存在')
  comments.splice(idx, 1)
  return ok(null)
})

registerMock('post', '/admin/comment', (config) => {
  const body = config.data as Partial<Comment>
  const articleId = Number(body.articleId)
  if (!articles.some((a) => a.id === articleId)) return fail('文章不存在')
  const comment: Comment = {
    id: genId(comments),
    articleId,
    username: '测试用户',
    content: body.content?.trim() || '这是一条测试评论',
    parentId: null,
    status: 'pending',
    createTime: now(),
  }
  comments.unshift(comment)
  return ok(comment)
})
