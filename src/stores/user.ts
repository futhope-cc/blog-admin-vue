import { defineStore } from 'pinia'
import { login as loginApi, logout as logoutApi, getUserInfo } from '@/api/auth'
import type { LoginParams, UserInfo } from '@/api/types'

interface UserState {
  token: string
  userInfo: UserInfo | null
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: localStorage.getItem('blog_admin_token') || '',
    userInfo: null,
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
    nickname: (state) => state.userInfo?.nickname || '管理员',
    avatar: (state) => state.userInfo?.avatar || '',
  },
  actions: {
    async login(params: LoginParams) {
      const res = await loginApi(params)
      this.token = res.tokenValue
      this.userInfo = res.userInfo
      localStorage.setItem('blog_admin_token', res.tokenValue)
    },
    async fetchUserInfo() {
      if (!this.token) return
      this.userInfo = await getUserInfo()
    },
    async logout() {
      try {
        await logoutApi()
      } catch {
        // ignore
      }
      this.reset()
    },
    reset() {
      this.token = ''
      this.userInfo = null
      localStorage.removeItem('blog_admin_token')
    },
  },
})
