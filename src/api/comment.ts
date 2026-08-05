import request from './request'
import type { Comment, PageResult } from './types'

export function getCommentList(params: {
  page: number
  pageSize: number
  status?: string
  keyword?: string
}) {
  return request<PageResult<Comment>>({
    method: 'get',
    url: '/admin/comment/list',
    params,
  })
}

export function updateCommentStatus(id: number, status: Comment['status']) {
  return request<Comment>({
    method: 'patch',
    url: `/admin/comment/${id}/status`,
    data: { status },
  })
}

export function deleteComment(id: number) {
  return request<null>({
    method: 'delete',
    url: `/admin/comment/${id}`,
  })
}
