<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { deleteProject, getProjectPage, addProject, updateProject } from '@/api/project'
import { uploadFile } from '@/api/file'
import type { Project } from '@/api/types'

const loading = ref(false)
const list = ref<Project[]>([])
const total = ref(0)
const query = reactive({ current: 1, size: 10, keyword: '', featured: undefined as 0 | 1 | undefined })

const dialogVisible = ref(false)
const saving = ref(false)
const editingId = ref<string | null>(null)
const formRef = ref()
const form = reactive({
  name: '',
  description: '',
  technology: '',
  githubUrl: '',
  image: '',
  deployment: '',
  featured: 0 as 0 | 1,
})

const rules = {
  name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入项目介绍', trigger: 'blur' }],
}

async function load() {
  loading.value = true
  try {
    const res = await getProjectPage({
      current: query.current,
      size: query.size,
      keyword: query.keyword || undefined,
      featured: query.featured,
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

function handlePageChange(page: number) {
  query.current = page
  load()
}

function resetForm() {
  form.name = ''
  form.description = ''
  form.technology = ''
  form.githubUrl = ''
  form.image = ''
  form.deployment = ''
  form.featured = 0
}

function openCreate() {
  editingId.value = null
  resetForm()
  dialogVisible.value = true
}

function openEdit(row: Project) {
  editingId.value = row.id
  form.name = row.name
  form.description = row.description
  form.technology = row.technology
  form.githubUrl = row.githubUrl
  form.image = row.image
  form.deployment = row.deployment
  form.featured = row.featured
  dialogVisible.value = true
}

async function handleCoverUpload(options: any) {
  try {
    const item = await uploadFile(options.file)
    form.image = item.url || ''
    ElMessage.success('图片上传成功')
  } catch {
    // handled by request layer
  }
}

async function submit() {
  await formRef.value.validate()
  saving.value = true
  try {
    const payload = {
      name: form.name,
      description: form.description,
      technology: form.technology,
      githubUrl: form.githubUrl,
      image: form.image,
      deployment: form.deployment,
      featured: form.featured,
    }
    if (editingId.value) {
      await updateProject(editingId.value, payload)
    } else {
      await addProject(payload)
    }
    ElMessage.success(editingId.value ? '项目已更新' : '项目已创建')
    dialogVisible.value = false
    load()
  } finally {
    saving.value = false
  }
}

async function handleDelete(row: Project) {
  await ElMessageBox.confirm(
    `确定删除项目「${row.name}」吗？`,
    '删除确认',
    { type: 'warning', confirmButtonText: '删除' },
  )
  await deleteProject(row.id)
  ElMessage.success('删除成功')
  load()
}

onMounted(load)
</script>

<template>
  <div>
    <el-card shadow="never">
      <el-form :inline="true" @submit.prevent>
        <el-form-item label="关键词">
          <el-input
            v-model="query.keyword"
            placeholder="项目名称 / 介绍"
            clearable
            class="w-60"
            @keyup.enter="search"
            @clear="search"
          />
        </el-form-item>
        <el-form-item label="精选">
          <el-select
            v-model="query.featured"
            placeholder="全部项目"
            clearable
            class="w-32"
            @change="search"
          >
            <el-option label="首页精选" :value="1" />
            <el-option label="普通项目" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="'Search'" @click="search">查询</el-button>
        </el-form-item>
        <el-form-item class="float-right">
          <el-button type="primary" :icon="'Plus'" @click="openCreate">
            新增项目
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="mt-4">
      <el-table v-loading="loading" :data="list">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column label="项目" min-width="220">
          <template #default="{ row }">
            <div class="flex items-center gap-3">
              <div
                v-if="row.image"
                class="h-10 w-16 shrink-0 overflow-hidden rounded"
              >
                <img :src="row.image" class="h-full w-full object-cover" />
              </div>
              <div
                v-else
                class="flex h-10 w-16 shrink-0 items-center justify-center rounded bg-[#ecf5ff] text-[#409eff]"
              >
                <el-icon><FolderOpened /></el-icon>
              </div>
              <div>
                <div class="font-medium">{{ row.name }}</div>
                <div class="line-clamp-1 text-xs text-[#909399]">
                  {{ row.description }}
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="technology" label="技术栈" min-width="160">
          <template #default="{ row }">
            <div class="flex flex-wrap gap-1">
              <el-tag
                v-for="t in row.technology.split(',').map((s: string) => s.trim())"
                :key="t"
                size="small"
                effect="light"
              >
                {{ t }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Github" width="140">
          <template #default="{ row }">
            <a
              v-if="row.githubUrl"
              :href="row.githubUrl"
              target="_blank"
              class="text-[#409eff] hover:underline"
            >
              查看仓库
            </a>
            <span v-else class="text-[#c0c4cc]">-</span>
          </template>
        </el-table-column>
        <el-table-column label="精选" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.featured === 1 ? 'success' : 'info'" effect="plain">
              {{ row.featured === 1 ? '精选' : '普通' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="deployment" label="部署方式" width="120">
          <template #default="{ row }">
            <span v-if="row.deployment">{{ row.deployment }}</span>
            <span v-else class="text-[#c0c4cc]">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="150" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
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

    <el-dialog
      v-model="dialogVisible"
      :title="editingId ? '编辑项目' : '新增项目'"
      width="560px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="项目介绍" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="简要介绍项目功能与亮点"
          />
        </el-form-item>
        <el-form-item label="技术栈">
          <el-input
            v-model="form.technology"
            placeholder="用逗号分隔，如：Vue3, Spring Boot, MySQL"
          />
        </el-form-item>
        <el-form-item label="Github 地址">
          <el-input v-model="form.githubUrl" placeholder="https://github.com/..." />
        </el-form-item>
        <el-form-item label="部署方式">
          <el-input v-model="form.deployment" placeholder="如：Docker Compose、裸机部署" />
        </el-form-item>
        <el-form-item label="首页精选">
          <el-switch
            v-model="form.featured"
            :active-value="1"
            :inactive-value="0"
            active-text="是"
            inactive-text="否"
          />
        </el-form-item>
        <el-form-item label="项目截图">
          <div class="flex items-start gap-3">
            <el-upload
              :show-file-list="false"
              accept="image/*"
              :http-request="handleCoverUpload"
            >
              <div
                v-if="form.image"
                class="h-24 w-40 cursor-pointer overflow-hidden rounded border border-[#dcdfe6]"
              >
                <img :src="form.image" class="h-full w-full object-cover" />
              </div>
              <div
                v-else
                class="flex h-24 w-40 cursor-pointer flex-col items-center justify-center gap-1 rounded border border-dashed border-[#dcdfe6] text-[#909399] hover:border-[#409eff] hover:text-[#409eff]"
              >
                <el-icon :size="22"><Picture /></el-icon>
                <span class="text-xs">点击上传截图</span>
              </div>
            </el-upload>
            <el-button v-if="form.image" link type="danger" @click="form.image = ''">
              移除
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
