import { registerMock } from '@/api/request'
import { projects } from './db'
import { fail, genId, now, ok, pageResult } from './helpers'
import type { PageResult, Project, ProjectQuery, ProjectRequest } from '@/api/types'

registerMock('get', '/project/page', (config) => {
  const query = config.params as ProjectQuery
  const current = Number(query.current) || 1
  const size = Number(query.size) || 10
  const keyword = (query.keyword || '').toString().toLowerCase()
  const featuredRaw = config.params?.featured

  let list = [...projects]
  if (keyword) {
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(keyword) ||
        p.description.toLowerCase().includes(keyword),
    )
  }
  if (featuredRaw !== undefined && featuredRaw !== '') {
    list = list.filter((p) => p.featured === Number(featuredRaw))
  }
  list.sort((a, b) => Number(b.id) - Number(a.id))
  const { records, total, current: c, size: s } = pageResult(list, current, size)
  return ok<PageResult<Project>>({ records, total, current: c, size: s })
})

registerMock('post', '/project', (config) => {
  const body = config.data as ProjectRequest
  if (!body.name?.trim()) return fail('项目名称不能为空')
  const project: Project = {
    id: genId(projects),
    name: body.name.trim(),
    description: body.description?.trim() || '',
    technology: body.technology?.trim() || '',
    giteeUrl: body.giteeUrl?.trim() || '',
    image: body.image || '',
    deployment: body.deployment?.trim() || '',
    featured: body.featured ?? 0,
    createTime: now(),
  }
  projects.unshift(project)
  return ok(project)
})

registerMock('put', /^\/project\/.+$/, (config) => {
  const id = (config.url as string).split('/').pop()!
  const body = config.data as ProjectRequest
  const project = projects.find((p) => p.id === id)
  if (!project) return fail('项目不存在')
  if (!body.name?.trim()) return fail('项目名称不能为空')
  Object.assign(project, {
    name: body.name.trim(),
    description: body.description?.trim() || '',
    technology: body.technology?.trim() || '',
    giteeUrl: body.giteeUrl?.trim() || '',
    image: body.image || '',
    deployment: body.deployment?.trim() || '',
    featured: body.featured ?? 0,
  })
  return ok(project)
})

registerMock('delete', /^\/project\/.+$/, (config) => {
  const id = (config.url as string).split('/').pop()!
  const idx = projects.findIndex((p) => p.id === id)
  if (idx === -1) return fail('项目不存在')
  projects.splice(idx, 1)
  return ok(null)
})
