import { registerMock } from '@/api/request'
import { files } from './db'
import { fail, genId, now, ok, pageResult } from './helpers'
import type { FileItem, FileQuery, PageResult } from '@/api/types'

const MOCK_IMG = 'data:image/svg+xml;utf8,'

registerMock('get', '/file/page', (config) => {
  const query = config.params as FileQuery
  const current = Number(query.current) || 1
  const size = Number(query.size) || 12
  const type = query.type || ''
  const keyword = (query.keyword || '').toString().toLowerCase()

  let list = [...files]
  if (type) list = list.filter((f) => f.type === type)
  if (keyword) list = list.filter((f) => f.name.toLowerCase().includes(keyword))
  list.sort((a, b) => Number(b.id) - Number(a.id))
  const { records, total, current: c, size: s } = pageResult(list, current, size)
  return ok<PageResult<FileItem>>({ records, total, current: c, size: s })
})

registerMock('post', '/file/upload', (config) => {
  const raw = config.data
  const file =
    raw instanceof FormData ? (raw.get('file') as File | null) : raw?.file
  if (!file) return fail('未获取到文件')
  const isImage = file.type.startsWith('image/')
  const item: FileItem = {
    id: genId(files),
    name: file.name,
    url: isImage
      ? `${MOCK_IMG}${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><rect width="300" height="200" fill="#409eff"/><text x="150" y="110" font-size="18" fill="#fff" text-anchor="middle">${file.name}</text></svg>`)}`
      : '',
    type: isImage ? 'image' : 'file',
    size: file.size,
    uploadTime: now(),
  }
  files.unshift(item)
  return ok(item)
})

registerMock('delete', /^\/file\/.+$/, (config) => {
  const id = (config.url as string).split('/').pop()!
  const idx = files.findIndex((f) => f.id === id)
  if (idx === -1) return fail('文件不存在')
  files.splice(idx, 1)
  return ok(null)
})
