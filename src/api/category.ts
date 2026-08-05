import request from './request'
import type { Category } from './types'

export function getCategoryList() {
  return request<Category[]>({
    method: 'get',
    url: '/admin/category/list',
  })
}

export function getAllCategories() {
  return request<Category[]>({
    method: 'get',
    url: '/admin/category/all',
  })
}

export function saveCategory(data: Partial<Category>) {
  return request<Category>({
    method: data.id ? 'put' : 'post',
    url: data.id ? `/admin/category/${data.id}` : '/admin/category',
    data,
  })
}

export function deleteCategory(id: number) {
  return request<null>({
    method: 'delete',
    url: `/admin/category/${id}`,
  })
}
