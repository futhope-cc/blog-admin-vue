import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { useUserStore } from '@/stores/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/admin/Login.vue'),
    meta: { title: '登录' },
  },
  {
    path: '/',
    component: AdminLayout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/admin/Dashboard.vue'),
        meta: { title: '仪表盘' },
      },
      {
        path: 'user',
        name: 'UserManage',
        component: () => import('@/views/admin/UserManage.vue'),
        meta: { title: '用户管理' },
      },
      {
        path: 'article/list',
        name: 'ArticleManage',
        component: () => import('@/views/admin/ArticleManage.vue'),
        meta: { title: '文章管理' },
      },
      {
        path: 'article/create',
        name: 'ArticleCreate',
        component: () => import('@/views/admin/ArticleEditor.vue'),
        meta: { title: '写文章', activeMenu: '/article/list' },
      },
      {
        path: 'article/edit/:id',
        name: 'ArticleEdit',
        component: () => import('@/views/admin/ArticleEditor.vue'),
        meta: { title: '编辑文章', activeMenu: '/article/list' },
      },
      {
        path: 'category',
        name: 'CategoryManage',
        component: () => import('@/views/admin/CategoryManage.vue'),
        meta: { title: '分类管理' },
      },
      {
        path: 'tag',
        name: 'TagManage',
        component: () => import('@/views/admin/TagManage.vue'),
        meta: { title: '标签管理' },
      },
      {
        path: 'project',
        name: 'ProjectManage',
        component: () => import('@/views/admin/ProjectManage.vue'),
        meta: { title: '项目管理' },
      },
      {
        path: 'file',
        name: 'FileManage',
        component: () => import('@/views/admin/FileManage.vue'),
        meta: { title: '文件管理' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const userStore = useUserStore()
  document.title = to.meta.title
    ? `${to.meta.title} - 个人博客管理后台`
    : '个人博客管理后台'
  if (to.path !== '/login' && !userStore.isLoggedIn) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  if (to.path === '/login' && userStore.isLoggedIn) {
    return { path: '/dashboard' }
  }
  return true
})

export default router
