import { registerMock } from '@/api/request'
import { articles, categories } from './db'
import { fail, genId, now, ok } from './helpers'
import type { Category } from '@/api/types'

function listWithCount() {
  return categories
    .map((c) => ({
      ...c,
      articleCount: articles.filter((a) => a.categoryId === c.id).length,
    }))
    .sort((a, b) => a.sort - b.sort)
}

registerMock('get', '/admin/category/list', () => {
  return ok(listWithCount())
})

registerMock('get', '/admin/category/all', () => {
  return ok([...categories].sort((a, b) => a.sort - b.sort))
})

registerMock('post', '/admin/category', (config) => {
  const body = config.data as Partial<Category>
  const name = body.name?.trim()
  if (!name) return fail('分类名称不能为空')
  if (categories.some((c) => c.name === name)) return fail('分类已存在')
  const category: Category = {
    id: genId(categories),
    name,
    sort: body.sort ?? categories.length + 1,
    createTime: now(),
  }
  categories.push(category)
  return ok(category)
})

registerMock('put', /^\/admin\/category\/\d+$/, (config) => {
  const id = Number((config.url as string).split('/').pop())
  const body = config.data as Partial<Category>
  const category = categories.find((c) => c.id === id)
  if (!category) return fail('分类不存在')
  if (body.name && body.name.trim() && body.name !== category.name) {
    if (categories.some((c) => c.name === body.name)) return fail('分类已存在')
    category.name = body.name.trim()
  }
  if (body.sort != null) category.sort = body.sort
  return ok(category)
})

registerMock('delete', /^\/admin\/category\/\d+$/, (config) => {
  const id = Number((config.url as string).split('/').pop())
  if (articles.some((a) => a.categoryId === id)) {
    return fail('该分类下存在文章，无法删除')
  }
  const idx = categories.findIndex((c) => c.id === id)
  if (idx === -1) return fail('分类不存在')
  categories.splice(idx, 1)
  return ok(null)
})
