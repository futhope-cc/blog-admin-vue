import request from './request'
import type { FileItem, FileQuery, PageResult } from './types'

export function getFilePage(params: FileQuery) {
  return request<PageResult<FileItem>>({
    method: 'get',
    url: '/file/page',
    params,
  })
}

export function uploadFile(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return request<FileItem>({
    method: 'post',
    url: '/file/upload',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export function deleteFile(id: string) {
  return request<null>({
    method: 'delete',
    url: `/file/${id}`,
  })
}
