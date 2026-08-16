import type { Article } from '@/api/types'

const cache = new Map<string, Article>()

export function setArticleEditCache(article: Article) {
  cache.set(String(article.id), article)
}

export function getArticleEditCache(id: string) {
  return cache.get(id)
}
