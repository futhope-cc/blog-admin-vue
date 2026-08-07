import request from './request'
import type {
  Article,
  ArticleAddParams,
  ArticleQuery,
  ArticleStatus,
  ArticleUpdateParams,
  PageResult,
} from './types'

export function getArticlePage(params: ArticleQuery) {
  return request<PageResult<Article>>({
    method: 'get',
    url: '/article/page',
    params,
  })
}

export function addArticle(data: ArticleAddParams) {
  return request<Article>({
    method: 'post',
    url: '/article',
    data,
  })
}

export function updateArticle(id: string, data: ArticleUpdateParams) {
  return request<Article>({
    method: 'put',
    url: `/article/${id}`,
    data,
  })
}

export function deleteArticle(id: string) {
  return request<null>({
    method: 'delete',
    url: `/article/${id}`,
  })
}

export function updateArticleStatus(id: string, status: ArticleStatus) {
  return request<Article>({
    method: 'patch',
    url: `/article/${id}/status`,
    data: { status },
  })
}
