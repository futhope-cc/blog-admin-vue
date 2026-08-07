import request from './request'
import type { Category, CategoryRequest } from './types'

export function getCategoryList() {
  return request<Category[]>({
    method: 'get',
    url: '/category/list',
  })
}

export function addCategory(data: CategoryRequest) {
  return request<Category>({
    method: 'post',
    url: '/category',
    data,
  })
}

export function updateCategory(id: string, data: CategoryRequest) {
  return request<Category>({
    method: 'put',
    url: `/category/${id}`,
    data,
  })
}

export function deleteCategory(id: string) {
  return request<null>({
    method: 'delete',
    url: `/category/${id}`,
  })
}
