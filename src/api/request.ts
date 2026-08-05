import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

const service = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

service.interceptors.request.use((config) => {
  const userStore = useUserStore()
  if (userStore.token) {
    config.headers.Authorization = `Bearer ${userStore.token}`
  }
  return config
})

service.interceptors.response.use(
  (response): any => {
    const res = response.data as ApiResponse
    if (res.code !== 200) {
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return res.data
  },
  (error) => {
    if (error.response?.status === 401) {
      const userStore = useUserStore()
      userStore.logout()
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    ElMessage.error(error.response?.data?.message || error.message || '网络错误')
    return Promise.reject(error)
  },
)

type MockUrl = string | RegExp

export interface MockHandler {
  method: string
  url: MockUrl
  handler: (config: AxiosRequestConfig) => ApiResponse<any>
}

const mockHandlers: MockHandler[] = []

export function registerMock(
  method: string,
  url: MockUrl,
  handler: (config: AxiosRequestConfig) => ApiResponse<any>,
) {
  mockHandlers.push({ method: method.toUpperCase(), url, handler })
}

function matchMock(config: AxiosRequestConfig): MockHandler | undefined {
  const method = (config.method || 'get').toUpperCase()
  const url = (config.url || '').split('?')[0]
  return mockHandlers.find((m) => {
    if (m.method !== method) return false
    if (m.url instanceof RegExp) return m.url.test(url)
    return m.url === url
  })
}

const MOCK_ENABLED = true

export function request<T = unknown>(config: AxiosRequestConfig): Promise<T> {
  const mock = matchMock(config)
  if (MOCK_ENABLED && mock) {
    return new Promise<T>((resolve, reject) => {
      setTimeout(() => {
        const res = mock.handler(config)
        if (res.code !== 200) {
          ElMessage.error(res.message || '请求失败')
          reject(new Error(res.message))
          return
        }
        resolve(res.data as T)
      }, 150 + Math.random() * 250)
    })
  }
  return service.request(config) as Promise<T>
}

export default request
