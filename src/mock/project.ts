import { registerMock } from '@/api/request'
import { projects } from './db'
import { fail, genId, now, ok, pageData } from './helpers'
import type { PageResult, Project } from '@/api/types'

registerMock('get', '/admin/project/list', (config) => {
  const page = Number(config.params?.page) || 1
  const pageSize = Number(config.params?.pageSize) || 10
  const keyword = (config.params?.keyword || '').toString().toLowerCase()

  let list = [...projects]
  if (keyword) {
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(keyword) ||
        p.description.toLowerCase().includes(keyword),
    )
  }
  list.sort((a, b) => b.id - a.id)
  const { total, list: slice } = pageData(list, page, pageSize)
  return ok<PageResult<Project>>({ total, list: slice })
})

registerMock('post', '/admin/project', (config) => {
  const body = config.data as Partial<Project>
  if (!body.name?.trim()) return fail('项目名称不能为空')
  const project: Project = {
    id: genId(projects),
    name: body.name!.trim(),
    description: body.description?.trim() || '',
    technology: body.technology?.trim() || '',
    githubUrl: body.githubUrl?.trim() || '',
    image: body.image || '',
    createTime: now(),
  }
  projects.unshift(project)
  return ok(project)
})

registerMock('put', /^\/admin\/project\/\d+$/, (config) => {
  const id = Number((config.url as string).split('/').pop())
  const body = config.data as Partial<Project>
  const project = projects.find((p) => p.id === id)
  if (!project) return fail('项目不存在')
  if (!body.name?.trim()) return fail('项目名称不能为空')
  Object.assign(project, {
    name: body.name.trim(),
    description: body.description?.trim() || '',
    technology: body.technology?.trim() || '',
    githubUrl: body.githubUrl?.trim() || '',
    image: body.image || '',
  })
  return ok(project)
})

registerMock('delete', /^\/admin\/project\/\d+$/, (config) => {
  const id = Number((config.url as string).split('/').pop())
  const idx = projects.findIndex((p) => p.id === id)
  if (idx === -1) return fail('项目不存在')
  projects.splice(idx, 1)
  return ok(null)
})
