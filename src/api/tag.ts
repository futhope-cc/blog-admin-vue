import request from './request'
import type { Tag } from './types'

export function getTagList() {
  return request<Tag[]>({
    method: 'get',
    url: '/admin/tag/list',
  })
}

export function getAllTags() {
  return request<Tag[]>({
    method: 'get',
    url: '/admin/tag/all',
  })
}

export function saveTag(data: Partial<Tag>) {
  return request<Tag>({
    method: data.id ? 'put' : 'post',
    url: data.id ? `/admin/tag/${data.id}` : '/admin/tag',
    data,
  })
}

export function deleteTag(id: number) {
  return request<null>({
    method: 'delete',
    url: `/admin/tag/${id}`,
  })
}
