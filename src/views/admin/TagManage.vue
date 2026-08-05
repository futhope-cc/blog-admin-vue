<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { deleteTag, getTagList, saveTag } from '@/api/tag'
import type { Tag } from '@/api/types'

const loading = ref(false)
const list = ref<Tag[]>([])

const dialogVisible = ref(false)
const saving = ref(false)
const editingId = ref<number | null>(null)
const formRef = ref()
const form = reactive({ name: '' })

const rules = {
  name: [{ required: true, message: '请输入标签名称', trigger: 'blur' }],
}

async function load() {
  loading.value = true
  try {
    list.value = await getTagList()
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingId.value = null
  form.name = ''
  dialogVisible.value = true
}

function openEdit(row: Tag) {
  editingId.value = row.id
  form.name = row.name
  dialogVisible.value = true
}

async function submit() {
  await formRef.value.validate()
  saving.value = true
  try {
    await saveTag({
      id: editingId.value ?? undefined,
      name: form.name,
    })
    ElMessage.success(editingId.value ? '标签已更新' : '标签已创建')
    dialogVisible.value = false
    load()
  } finally {
    saving.value = false
  }
}

async function handleDelete(row: Tag) {
  await ElMessageBox.confirm(
    `确定删除标签「${row.name}」吗？相关文章的该标签关联也会被移除。`,
    '删除确认',
    { type: 'warning', confirmButtonText: '删除' },
  )
  await deleteTag(row.id)
  ElMessage.success('删除成功')
  load()
}

onMounted(load)
</script>

<template>
  <el-card shadow="never">
    <div class="mb-4 flex items-center justify-between">
      <span class="text-sm text-[#909399]">共 {{ list.length }} 个标签</span>
      <el-button type="primary" :icon="'Plus'" @click="openCreate">
        新增标签
      </el-button>
    </div>

    <div v-loading="loading" class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      <div
        v-for="t in list"
        :key="t.id"
        class="group flex cursor-pointer items-center gap-2 rounded-lg border border-[#e4e7ed] bg-white px-3 py-3 transition hover:border-[#409eff] hover:shadow"
        @click="openEdit(t)"
      >
        <el-icon color="#409eff"><CollectionTag /></el-icon>
        <div class="min-w-0 flex-1">
          <div class="truncate text-sm font-medium">{{ t.name }}</div>
          <div class="text-xs text-[#909399]">{{ t.articleCount ?? 0 }} 篇文章</div>
        </div>
        <el-icon
          class="hidden text-[#c0c4cc] group-hover:inline hover:text-[#f56c6c]"
          @click.stop="handleDelete(t)"
        >
          <Delete />
        </el-icon>
      </div>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="editingId ? '编辑标签' : '新增标签'"
      width="420px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="如：FFmpeg、OpenCV、YOLO" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submit">确定</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>
