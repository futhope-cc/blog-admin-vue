export interface PageResult<T> {
  records: T[]
  total: number
  current: number
  size: number
}

export type UserStatus = 0 | 1

export interface UserInfo {
  id: string
  username: string
  nickname: string
  avatar: string
  email: string
  status: UserStatus
  createTime: string
}

export interface LoginParams {
  username: string
  password: string
}

export interface LoginResult {
  tokenName: string
  tokenValue: string
  userInfo: UserInfo
}

export interface UserQuery {
  current: number
  size: number
  username?: string
  status?: number
}

export interface UserAddParams {
  username: string
  password: string
  nickname?: string
  email?: string
  status?: UserStatus
}

export interface UserUpdateParams {
  nickname?: string
  email?: string
  status?: UserStatus
}

export interface Category {
  id: string
  name: string
  sort: number
  articleCount?: number
  createTime: string
}

export interface CategoryRequest {
  name: string
  sort: number
}

export interface Tag {
  id: string
  name: string
  articleCount?: number
}

export interface TagRequest {
  name: string
}

export const ARTICLE_STATUS = {
  DRAFT: 0,
  PUBLISHED: 1,
  OFFLINE: 2,
} as const

export type ArticleStatus = (typeof ARTICLE_STATUS)[keyof typeof ARTICLE_STATUS]

export interface Article {
  id: string
  title: string
  summary: string
  content: string
  cover: string
  categoryId: string
  categoryName?: string
  tagIds: string[]
  tagNames?: string[]
  viewCount: number
  status: ArticleStatus
  createTime: string
  publishTime?: string
}

export interface ArticleQuery {
  current: number
  size: number
  keyword?: string
  categoryId?: string
  tagId?: string
  status?: ArticleStatus
}

export interface ArticleAddParams {
  title: string
  summary: string
  content: string
  cover: string
  categoryId: string
  tagIds: string[]
  status: ArticleStatus
}

export interface ArticleUpdateParams {
  title: string
  summary: string
  content: string
  cover: string
  categoryId: string
  tagIds: string[]
}

export interface SiteProfile {
  id: string
  nickname: string
  avatar: string
  bio: string
  techStack: string
  socialLinks: string
  email: string
  gitee: string
  copyright?: string
  directions?: string
  workExperience?: string
  updateTime: string
}

export interface SiteProfileUpdateParams {
  nickname: string
  avatar: string
  bio: string
  techStack: string
  socialLinks: string
  email: string
  gitee: string
  copyright?: string
  directions?: string
  workExperience?: string
}

export interface Project {
  id: string
  name: string
  description: string
  technology: string
  giteeUrl: string
  image: string
  deployment: string
  featured: 0 | 1
  createTime: string
}

export interface ProjectQuery {
  current: number
  size: number
  keyword?: string
  featured?: 0 | 1
}

export interface ProjectRequest {
  name: string
  description: string
  technology: string
  giteeUrl: string
  image: string
  deployment: string
  featured: 0 | 1
}

export interface FileItem {
  id: string
  name: string
  url: string
  type: 'image' | 'file'
  size: number
  uploadTime: string
}

export interface FileQuery {
  current: number
  size: number
  type?: string
  keyword?: string
}

export interface StatsOverview {
  articleCount: number
  projectCount: number
  viewCount: number
  categoryCount: number
  tagCount: number
}

export interface TrendPoint {
  week: string
  count: number
}

export interface CategoryDist {
  name: string
  count: number
}

export interface HotArticle {
  id: string
  title: string
  viewCount: number
}

export interface DashboardStats {
  overview: StatsOverview
  trend: TrendPoint[]
  categoryDist: CategoryDist[]
  hotArticles: HotArticle[]
}
