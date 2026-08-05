import request from './request'
import type {
  Article,
  ArticleQuery,
  ArticleSaveParams,
  ArticleStatus,
  PageResult,
} from './types'

export function getArticleList(params: ArticleQuery) {
  return request<PageResult<Article>>({
    method: 'get',
    url: '/admin/article/list',
    params,
  })
}

export function getArticleDetail(id: number) {
  return request<Article>({
    method: 'get',
    url: `/admin/article/${id}`,
  })
}

export function saveArticle(data: ArticleSaveParams) {
  return request<Article>({
    method: 'post',
    url: '/admin/article',
    data,
  })
}

export function deleteArticle(id: number) {
  return request<null>({
    method: 'delete',
    url: `/admin/article/${id}`,
  })
}

export function updateArticleStatus(id: number, status: ArticleStatus) {
  return request<Article>({
    method: 'patch',
    url: `/admin/article/${id}/status`,
    data: { status },
  })
}
