import { registerMock } from '@/api/request'
import { articles, categories, projects } from './db'
import { ok } from './helpers'
import type { DashboardStats } from '@/api/types'

const TREND = [
  { date: '2026-06-16', views: 320, articles: 1 },
  { date: '2026-06-23', views: 568, articles: 2 },
  { date: '2026-06-30', views: 749, articles: 1 },
  { date: '2026-07-07', views: 1032, articles: 2 },
  { date: '2026-07-14', views: 1584, articles: 1 },
  { date: '2026-07-21', views: 1723, articles: 1 },
  { date: '2026-07-28', views: 2087, articles: 2 },
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
      value: articles.filter((a) => a.categoryId === c.id).length,
    }))
    .filter((c) => c.value > 0)

  const data: DashboardStats = {
    overview: {
      articleCount: articles.length,
      projectCount: projects.length,
      viewCount: articles.reduce((sum, a) => sum + a.viewCount, 0),
    },
    trend: TREND,
    categoryDist,
    hotArticles: hot,
  }
  return ok<DashboardStats>(data)
})
