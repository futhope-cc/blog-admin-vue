<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { deleteCategory, getCategoryList, addCategory, updateCategory } from '@/api/category'
import type { Category } from '@/api/types'

const loading = ref(false)
const list = ref<Category[]>([])

const dialogVisible = ref(false)
const saving = ref(false)
const editingId = ref<string | null>(null)
const formRef = ref()
const form = reactive({ name: '', sort: 0 })

const rules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
  sort: [{ required: true, message: '请输入排序值', trigger: 'blur' }],
}

async function load() {
  loading.value = true
  try {
    list.value = await getCategoryList()
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingId.value = null
  form.name = ''
  form.sort = list.value.length + 1
  dialogVisible.value = true
}

function openEdit(row: Category) {
  editingId.value = row.id
  form.name = row.name
  form.sort = row.sort
  dialogVisible.value = true
}

async function submit() {
  await formRef.value.validate()
  saving.value = true
  try {
    const payload = { name: form.name, sort: form.sort }
    if (editingId.value) {
      await updateCategory(editingId.value, payload)
    } else {
      await addCategory(payload)
    }
    ElMessage.success(editingId.value ? '分类已更新' : '分类已创建')
    dialogVisible.value = false
    load()
  } finally {
    saving.value = false
  }
}

async function handleDelete(row: Category) {
  await ElMessageBox.confirm(
    `确定删除分类「${row.name}」吗？`,
    '删除确认',
    { type: 'warning', confirmButtonText: '删除' },
  )
  await deleteCategory(row.id)
  ElMessage.success('删除成功')
  load()
}

onMounted(load)
</script>

<template>
  <el-card shadow="never">
    <div class="mb-4 flex items-center justify-between">
      <span class="text-sm text-[#909399]">共 {{ list.length }} 个分类</span>
      <el-button type="primary" :icon="'Plus'" @click="openCreate">
        新增分类
      </el-button>
    </div>

    <el-table v-loading="loading" :data="list">
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column label="分类名称" min-width="180">
        <template #default="{ row }">
          <div class="flex items-center gap-2">
            <el-icon color="#409eff"><Folder /></el-icon>
            <span class="font-medium">{{ row.name }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="sort" label="排序" width="100" align="center" />
      <el-table-column label="文章数" width="100" align="center">
        <template #default="{ row }">
          <el-tag type="info" effect="plain">{{ row.articleCount ?? 0 }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" min-width="160" />
      <el-table-column label="操作" width="150" align="center">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="dialogVisible"
      :title="editingId ? '编辑分类' : '新增分类'"
      width="420px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="如：C++、Java、AI" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="1" :max="999" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submit">确定</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>
