import { registerMock } from '@/api/request'
import { articles, categories, projects, tags } from './db'
import { ok } from './helpers'
import type { DashboardStats } from '@/api/types'

const TREND = [
  { week: '2026-W26', count: 1 },
  { week: '2026-W27', count: 2 },
  { week: '2026-W28', count: 1 },
  { week: '2026-W29', count: 2 },
  { week: '2026-W30', count: 1 },
  { week: '2026-W31', count: 1 },
  { week: '2026-W32', count: 2 },
]

registerMock('get', '/stats/dashboard', () => {
  const hot = [...articles]
    .filter((a) => a.status === 1)
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 5)
    .map((a) => ({ id: a.id, title: a.title, viewCount: a.viewCount }))

  const categoryDist = categories
    .map((c) => ({
      name: c.name,
      count: articles.filter((a) => a.categoryId === c.id).length,
    }))
    .filter((c) => c.count > 0)

  const data: DashboardStats = {
    overview: {
      articleCount: articles.length,
      projectCount: projects.length,
      viewCount: articles.reduce((sum, a) => sum + a.viewCount, 0),
      categoryCount: categories.length,
      tagCount: tags.length,
    },
    trend: TREND,
    categoryDist,
    hotArticles: hot,
  }
  return ok<DashboardStats>(data)
})
