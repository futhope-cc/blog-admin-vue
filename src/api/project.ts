import request from './request'
import type { PageResult, Project, ProjectQuery, ProjectRequest } from './types'

export function getProjectPage(params: ProjectQuery) {
  return request<PageResult<Project>>({
    method: 'get',
    url: '/project/page',
    params,
  })
}

export function addProject(data: ProjectRequest) {
  return request<Project>({
    method: 'post',
    url: '/project',
    data,
  })
}

export function updateProject(id: string, data: ProjectRequest) {
  return request<Project>({
    method: 'put',
    url: `/project/${id}`,
    data,
  })
}

export function deleteProject(id: string) {
  return request<null>({
    method: 'delete',
    url: `/project/${id}`,
  })
}
