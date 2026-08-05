import { registerMock } from '@/api/request'
import { files } from './db'
import { fail, genId, ok, pageData } from './helpers'
import type { FileItem, PageResult } from '@/api/types'

const MOCK_IMG = 'data:image/svg+xml;utf8,'

registerMock('get', '/admin/file/list', (config) => {
  const page = Number(config.params?.page) || 1
  const pageSize = Number(config.params?.pageSize) || 12
  const type = config.params?.type || ''
  const keyword = (config.params?.keyword || '').toString().toLowerCase()

  let list = [...files]
  if (type) list = list.filter((f) => f.type === type)
  if (keyword) list = list.filter((f) => f.name.toLowerCase().includes(keyword))
  list.sort((a, b) => b.id - a.id)
  const { total, list: slice } = pageData(list, page, pageSize)
  return ok<PageResult<FileItem>>({ total, list: slice })
})

registerMock('post', '/admin/file/upload', (config) => {
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
    uploadTime: new Date().toLocaleString('zh-CN', { hour12: false }).replaceAll('/', '-'),
  }
  files.unshift(item)
  return ok(item)
})

registerMock('delete', /^\/admin\/file\/\d+$/, (config) => {
  const id = Number((config.url as string).split('/').pop())
  const idx = files.findIndex((f) => f.id === id)
  if (idx === -1) return fail('文件不存在')
  files.splice(idx, 1)
  return ok(null)
})
