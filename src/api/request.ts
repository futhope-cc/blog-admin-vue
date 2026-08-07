import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

const SUCCESS_CODE = 0

const appConfig = window.__APP_CONFIG__ ?? {}

const service = axios.create({
  baseURL: appConfig.apiBaseUrl ?? '/api',
  timeout: appConfig.requestTimeout ?? 15000,
})

service.interceptors.request.use((config) => {
  const userStore = useUserStore()
  if (userStore.token) {
    config.headers['satoken'] = userStore.token
  }
  return config
})

function handleUnauthorized() {
  const userStore = useUserStore()
  userStore.reset()
  if (window.location.pathname !== '/login') {
    ElMessage.warning('登录已过期，请重新登录')
    window.location.href = '/login'
  }
}

service.interceptors.response.use(
  (response): any => {
    const res = response.data as ApiResponse
    if (res.code !== SUCCESS_CODE) {
      if (res.code === 401) {
        handleUnauthorized()
      } else {
        ElMessage.error(res.message || '请求失败')
      }
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return res.data
  },
  (error) => {
    if (error.response?.status === 401) {
      handleUnauthorized()
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

const MOCK_ENABLED = false

export function request<T = unknown>(config: AxiosRequestConfig): Promise<T> {
  const mock = matchMock(config)
  if (MOCK_ENABLED && mock) {
    return new Promise<T>((resolve, reject) => {
      setTimeout(() => {
        const res = mock.handler(config)
        if (res.code !== SUCCESS_CODE) {
          if (res.code === 401) {
            handleUnauthorized()
          } else {
            ElMessage.error(res.message || '请求失败')
          }
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
