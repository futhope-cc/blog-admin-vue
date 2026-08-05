export interface PageResult<T> {
  total: number
  list: T[]
}

export interface UserInfo {
  id: number
  username: string
  nickname: string
  avatar: string
}

export interface LoginParams {
  username: string
  password: string
}

export interface Category {
  id: number
  name: string
  sort: number
  articleCount?: number
  createTime: string
}

export interface Tag {
  id: number
  name: string
  articleCount?: number
}

export type ArticleStatus = 'draft' | 'published' | 'offline'

export interface Article {
  id: number
  title: string
  summary: string
  content: string
  cover: string
  categoryId: number
  categoryName?: string
  tagIds: number[]
  tagNames?: string[]
  viewCount: number
  status: ArticleStatus
  createTime: string
  publishTime?: string
}

export interface ArticleQuery {
  page: number
  pageSize: number
  keyword?: string
  categoryId?: number
  tagId?: number
  status?: ArticleStatus | ''
}

export interface ArticleSaveParams {
  id?: number
  title: string
  summary: string
  content: string
  cover: string
  categoryId: number
  tagIds: number[]
  status: ArticleStatus
}

export interface Project {
  id: number
  name: string
  description: string
  technology: string
  githubUrl: string
  image: string
  createTime: string
}

export interface Comment {
  id: number
  articleId: number
  articleTitle?: string
  username: string
  content: string
  parentId: number | null
  status: 'pending' | 'approved' | 'rejected'
  createTime: string
}

export interface FileItem {
  id: number
  name: string
  url: string
  type: 'image' | 'file'
  size: number
  uploadTime: string
}

export interface StatsOverview {
  articleCount: number
  projectCount: number
  viewCount: number
  commentCount: number
}

export interface TrendPoint {
  date: string
  views: number
  articles: number
}

export interface CategoryDist {
  name: string
  value: number
}

export interface HotArticle {
  id: number
  title: string
  viewCount: number
}

export interface DashboardStats {
  overview: StatsOverview
  trend: TrendPoint[]
  categoryDist: CategoryDist[]
  hotArticles: HotArticle[]
}
