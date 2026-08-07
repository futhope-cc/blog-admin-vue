import request from './request'
import type { Tag, TagRequest } from './types'

export function getTagList() {
  return request<Tag[]>({
    method: 'get',
    url: '/tag/list',
  })
}

export function addTag(data: TagRequest) {
  return request<Tag>({
    method: 'post',
    url: '/tag',
    data,
  })
}

export function updateTag(id: string, data: TagRequest) {
  return request<Tag>({
    method: 'put',
    url: `/tag/${id}`,
    data,
  })
}

export function deleteTag(id: string) {
  return request<null>({
    method: 'delete',
    url: `/tag/${id}`,
  })
}
