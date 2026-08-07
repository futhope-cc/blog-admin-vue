<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { addUser, deleteUser, getUserPage, resetUserPassword, updateUser } from '@/api/user'
import { useUserStore } from '@/stores/user'
import type { UserInfo, UserStatus } from '@/api/types'

const userStore = useUserStore()

const loading = ref(false)
const list = ref<UserInfo[]>([])
const total = ref(0)
const query = reactive({ current: 1, size: 10, username: '', status: undefined as number | undefined })

const currentUserId = computed(() => userStore.userInfo?.id)

async function load() {
  loading.value = true
  try {
    const res = await getUserPage({
      current: query.current,
      size: query.size,
      username: query.username || undefined,
      status: query.status,
    })
    list.value = res.records
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function search() {
  query.current = 1
  load()
}

function reset() {
  query.username = ''
  query.status = undefined
  search()
}

function handlePageChange(page: number) {
  query.current = page
  load()
}

function statusText(status: UserStatus) {
  return status === 1 ? '正常' : '禁用'
}

function statusType(status: UserStatus) {
  return status === 1 ? 'success' : 'danger'
}

const addDialog = ref(false)
const editDialog = ref(false)
const resetDialog = ref(false)
const saving = ref(false)
const editingUser = ref<UserInfo | null>(null)

const addFormRef = ref()
const addForm = reactive({
  username: '',
  password: '',
  nickname: '',
  email: '',
  status: 1 as UserStatus,
})

const editFormRef = ref()
const editForm = reactive({
  nickname: '',
  email: '',
  status: 1 as UserStatus,
})

const resetFormRef = ref()
const resetForm = reactive({ newPassword: '' })

const addRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 50, message: '用户名需为 2-50 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入初始密码', trigger: 'blur' },
    { min: 6, max: 50, message: '密码需为 6-50 位', trigger: 'blur' },
  ],
  email: [{ type: 'email', message: '邮箱格式不正确', trigger: 'blur' }],
}

const editRules = {
  email: [{ type: 'email', message: '邮箱格式不正确', trigger: 'blur' }],
}

const resetRules = {
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 50, message: '密码需为 6-50 位', trigger: 'blur' },
  ],
}

function openAdd() {
  addForm.username = ''
  addForm.password = ''
  addForm.nickname = ''
  addForm.email = ''
  addForm.status = 1
  addDialog.value = true
}

function openEdit(row: UserInfo) {
  editingUser.value = row
  editForm.nickname = row.nickname
  editForm.email = row.email
  editForm.status = row.status
  editDialog.value = true
}

function openReset(row: UserInfo) {
  editingUser.value = row
  resetForm.newPassword = ''
  resetDialog.value = true
}

async function submitAdd() {
  await addFormRef.value.validate()
  saving.value = true
  try {
    await addUser({
      username: addForm.username,
      password: addForm.password,
      nickname: addForm.nickname,
      email: addForm.email,
      status: addForm.status,
    })
    ElMessage.success('用户已创建')
    addDialog.value = false
    load()
  } finally {
    saving.value = false
  }
}

async function submitEdit() {
  if (!editingUser.value) return
  await editFormRef.value.validate()
  saving.value = true
  try {
    await updateUser(editingUser.value.id, {
      nickname: editForm.nickname,
      email: editForm.email,
      status: editForm.status,
    })
    ElMessage.success('用户已更新')
    editDialog.value = false
    load()
  } finally {
    saving.value = false
  }
}

async function submitReset() {
  if (!editingUser.value) return
  await resetFormRef.value.validate()
  saving.value = true
  try {
    await resetUserPassword(editingUser.value.id, resetForm.newPassword)
    ElMessage.success('密码已重置')
    resetDialog.value = false
  } finally {
    saving.value = false
  }
}

async function handleDelete(row: UserInfo) {
  await ElMessageBox.confirm(
    `确定删除用户「${row.username}」吗？删除后不可恢复。`,
    '删除确认',
    { type: 'warning', confirmButtonText: '删除' },
  )
  await deleteUser(row.id)
  ElMessage.success('删除成功')
  if (list.value.length === 1 && query.current > 1) query.current -= 1
  load()
}

onMounted(load)
</script>

<template>
  <div>
    <el-card shadow="never">
      <el-form :inline="true" @submit.prevent>
        <el-form-item label="用户名">
          <el-input
            v-model="query.username"
            placeholder="用户名模糊搜索"
            clearable
            class="w-52"
            @keyup.enter="search"
            @clear="search"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="query.status"
            placeholder="全部状态"
            clearable
            class="w-32"
            @change="search"
          >
            <el-option label="正常" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="'Search'" @click="search">查询</el-button>
          <el-button :icon="'Refresh'" @click="reset">重置</el-button>
        </el-form-item>
        <el-form-item class="float-right">
          <el-button type="primary" :icon="'Plus'" @click="openAdd">
            新增用户
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="mt-4">
      <el-table v-loading="loading" :data="list">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="用户名" min-width="120">
          <template #default="{ row }">
            <span class="font-medium">{{ row.username }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="nickname" label="昵称" min-width="120" />
        <el-table-column prop="email" label="邮箱" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row.email">{{ row.email }}</span>
            <span v-else class="text-[#c0c4cc]">-</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">
              {{ statusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button link type="warning" @click="openReset(row)">重置密码</el-button>
            <el-button
              link
              type="danger"
              :disabled="row.id === currentUserId"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt-4 flex justify-end">
        <el-pagination
          v-model:current-page="query.current"
          v-model:page-size="query.size"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @current-change="handlePageChange"
          @size-change="search"
        />
      </div>
    </el-card>

    <el-dialog v-model="addDialog" title="新增用户" width="480px">
      <el-form ref="addFormRef" :model="addForm" :rules="addRules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username" placeholder="2-50 个字符，唯一" />
        </el-form-item>
        <el-form-item label="初始密码" prop="password">
          <el-input
            v-model="addForm.password"
            type="password"
            show-password
            placeholder="6-50 位"
          />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="addForm.nickname" placeholder="选填，默认为用户名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email" placeholder="选填" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="addForm.status">
            <el-radio :value="1">正常</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialog = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submitAdd">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="editDialog"
      title="编辑用户"
      width="480px"
      @open="editFormRef?.clearValidate()"
    >
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="80px">
        <el-form-item label="用户名">
          <el-input :model-value="editingUser?.username" disabled />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="editForm.nickname" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="editForm.status">
            <el-radio :value="1">正常</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialog = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submitEdit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="resetDialog"
      :title="`重置密码 - ${editingUser?.username ?? ''}`"
      width="420px"
      @open="resetFormRef?.clearValidate()"
    >
      <el-form ref="resetFormRef" :model="resetForm" :rules="resetRules" label-width="80px">
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="resetForm.newPassword"
            type="password"
            show-password
            placeholder="6-50 位，无需原密码"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="resetDialog = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submitReset">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
