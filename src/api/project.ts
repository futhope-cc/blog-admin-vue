import request from './request'
import type { PageResult, Project } from './types'

export function getProjectList(params: {
  page: number
  pageSize: number
  keyword?: string
}) {
  return request<PageResult<Project>>({
    method: 'get',
    url: '/admin/project/list',
    params,
  })
}

export function saveProject(data: Partial<Project>) {
  return request<Project>({
    method: data.id ? 'put' : 'post',
    url: data.id ? `/admin/project/${data.id}` : '/admin/project',
    data,
  })
}

export function deleteProject(id: number) {
  return request<null>({
    method: 'delete',
    url: `/admin/project/${id}`,
  })
}
