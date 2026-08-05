import request from './request'
import type { FileItem, PageResult } from './types'

export function getFileList(params: {
  page: number
  pageSize: number
  type?: string
  keyword?: string
}) {
  return request<PageResult<FileItem>>({
    method: 'get',
    url: '/admin/file/list',
    params,
  })
}

export function uploadFile(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return request<FileItem>({
    method: 'post',
    url: '/admin/file/upload',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export function deleteFile(id: number) {
  return request<null>({
    method: 'delete',
    url: `/admin/file/${id}`,
  })
}
