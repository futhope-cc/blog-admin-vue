<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { changePassword } from '@/api/auth'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()

const menus = [
  { path: '/dashboard', title: '仪表盘', icon: 'Odometer' },
  { path: '/article/list', title: '文章管理', icon: 'Document' },
  { path: '/category', title: '分类管理', icon: 'Files' },
  { path: '/tag', title: '标签管理', icon: 'CollectionTag' },
  { path: '/project', title: '项目管理', icon: 'FolderOpened' },
  { path: '/file', title: '文件管理', icon: 'Folder' },
]

const activeMenu = computed(() => {
  const active = route.meta.activeMenu as string | undefined
  return active || route.path
})

const pageTitle = computed(() => (route.meta.title as string) || '')

function handleLogout() {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '退出',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      await userStore.logout()
      ElMessage.success('已退出登录')
      router.push('/login')
    })
    .catch(() => {})
}

const pwdDialog = ref(false)
const pwdForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})
const pwdFormRef = ref()

const rules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '新密码至少 6 位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (_rule: unknown, value: string, callback: (e?: Error) => void) => {
        if (value !== pwdForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
}

function openPwdDialog() {
  pwdForm.oldPassword = ''
  pwdForm.newPassword = ''
  pwdForm.confirmPassword = ''
  pwdDialog.value = true
}

async function submitPwd() {
  await pwdFormRef.value.validate()
  await changePassword({
    oldPassword: pwdForm.oldPassword,
    newPassword: pwdForm.newPassword,
  })
  ElMessage.success('密码修改成功')
  pwdDialog.value = false
  await userStore.logout()
  router.push('/login')
}

onMounted(() => {
  userStore.fetchUserInfo()
})
</script>

<template>
  <el-container class="h-screen">
    <el-aside
      :width="appStore.sidebarCollapsed ? '64px' : '220px'"
      class="transition-all duration-200"
    >
      <div class="flex h-full flex-col bg-[#001529]">
        <div
          class="flex h-16 shrink-0 items-center gap-2 overflow-hidden px-4 text-white"
        >
          <el-icon :size="26" color="#409eff"><Platform /></el-icon>
          <span
            v-show="!appStore.sidebarCollapsed"
            class="whitespace-nowrap text-lg font-semibold"
          >
            博客管理后台
          </span>
        </div>
        <el-menu
          :default-active="activeMenu"
          :collapse="appStore.sidebarCollapsed"
          :collapse-transition="false"
          router
          background-color="#001529"
          text-color="rgba(255,255,255,0.65)"
          active-text-color="#ffffff"
          class="flex-1 border-none"
        >
          <el-menu-item v-for="m in menus" :key="m.path" :index="m.path">
            <el-icon><component :is="m.icon" /></el-icon>
            <template #title>{{ m.title }}</template>
          </el-menu-item>
        </el-menu>
      </div>
    </el-aside>

    <el-container>
      <el-header class="flex h-16 items-center border-b border-[#e4e7ed] bg-white px-4">
        <div class="flex items-center gap-3">
          <el-icon
            class="cursor-pointer text-xl hover:text-[#409eff]"
            @click="appStore.toggleSidebar()"
          >
            <Fold v-if="!appStore.sidebarCollapsed" />
            <Expand v-else />
          </el-icon>
          <span class="text-base font-medium">{{ pageTitle }}</span>
        </div>
        <div class="ml-auto flex items-center gap-4">
          <el-dropdown trigger="click">
            <div class="flex cursor-pointer items-center gap-2 outline-none">
              <el-avatar :size="32" :src="userStore.avatar || undefined">
                {{ userStore.nickname.slice(0, 1) }}
              </el-avatar>
              <span class="text-sm">{{ userStore.nickname }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="openPwdDialog">
                  <el-icon><Lock /></el-icon>修改密码
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="overflow-auto p-4">
        <router-view />
      </el-main>
    </el-container>
  </el-container>

  <el-dialog v-model="pwdDialog" title="修改密码" width="420px">
    <el-form
      ref="pwdFormRef"
      :model="pwdForm"
      :rules="rules"
      label-width="90px"
    >
      <el-form-item label="原密码" prop="oldPassword">
        <el-input
          v-model="pwdForm.oldPassword"
          type="password"
          show-password
          placeholder="请输入原密码"
        />
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input
          v-model="pwdForm.newPassword"
          type="password"
          show-password
          placeholder="请输入新密码（至少 6 位）"
        />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input
          v-model="pwdForm.confirmPassword"
          type="password"
          show-password
          placeholder="请再次输入新密码"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="pwdDialog = false">取消</el-button>
      <el-button type="primary" @click="submitPwd">确定</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.el-menu:not(.el-menu--collapse) {
  width: 220px;
}

:deep(.el-menu-item.is-active) {
  background-color: #409eff !important;
}
</style>
