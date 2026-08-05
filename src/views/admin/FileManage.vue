<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { deleteFile, getFileList, uploadFile } from '@/api/file'
import type { FileItem } from '@/api/types'

const loading = ref(false)
const uploading = ref(false)
const list = ref<FileItem[]>([])
const total = ref(0)
const query = reactive({ page: 1, pageSize: 12, type: '', keyword: '' })

const previewVisible = ref(false)
const previewUrl = ref('')

function formatSize(size: number): string {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

async function load() {
  loading.value = true
  try {
    const res = await getFileList({
      page: query.page,
      pageSize: query.pageSize,
      type: query.type,
      keyword: query.keyword || undefined,
    })
    list.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function search() {
  query.page = 1
  load()
}

function reset() {
  query.type = ''
  query.keyword = ''
  search()
}

function handlePageChange(page: number) {
  query.page = page
  load()
}

async function handleUpload(options: any) {
  uploading.value = true
  try {
    const item = await uploadFile(options.file)
    ElMessage.success(`「${item.name}」上传成功`)
    load()
  } catch {
    // handled by request layer
  } finally {
    uploading.value = false
  }
}

function preview(item: FileItem) {
  if (item.type !== 'image' || !item.url) return
  previewUrl.value = item.url
  previewVisible.value = true
}

async function handleDelete(item: FileItem) {
  await ElMessageBox.confirm(`确定删除文件「${item.name}」吗？`, '删除确认', {
    type: 'warning',
    confirmButtonText: '删除',
  })
  await deleteFile(item.id)
  ElMessage.success('删除成功')
  load()
}

onMounted(load)
</script>

<template>
  <div>
    <el-card shadow="never">
      <el-form :inline="true" @submit.prevent>
        <el-form-item label="类型">
          <el-select
            v-model="query.type"
            placeholder="全部类型"
            clearable
            class="w-36"
            @change="search"
          >
            <el-option label="图片" value="image" />
            <el-option label="附件" value="file" />
          </el-select>
        </el-form-item>
        <el-form-item label="文件名">
          <el-input
            v-model="query.keyword"
            placeholder="文件名关键词"
            clearable
            class="w-52"
            @keyup.enter="search"
            @clear="search"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="'Search'" @click="search">查询</el-button>
          <el-button :icon="'Refresh'" @click="reset">重置</el-button>
        </el-form-item>
        <el-form-item class="float-right">
          <el-upload
            :show-file-list="false"
            multiple
            :http-request="handleUpload"
          >
            <el-button
              type="primary"
              :icon="'Upload'"
              :loading="uploading"
            >
              上传文件
            </el-button>
          </el-upload>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="mt-4">
      <div class="mb-4 text-sm text-[#909399]">共 {{ total }} 个文件</div>

      <div v-loading="loading" class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        <div
          v-for="item in list"
          :key="item.id"
          class="group cursor-pointer rounded-lg border border-[#e4e7ed] bg-white p-3 transition hover:border-[#409eff] hover:shadow"
        >
          <div
            class="relative mb-2 flex h-28 items-center justify-center overflow-hidden rounded bg-[#f5f7fa]"
            @click="preview(item)"
          >
            <img
              v-if="item.type === 'image' && item.url"
              :src="item.url"
              class="h-full w-full object-cover"
              :alt="item.name"
            />
            <el-icon
              v-else
              :size="36"
              class="text-[#c0c4cc]"
            >
              <Files />
            </el-icon>
            <el-icon
              class="absolute right-1 top-1 hidden rounded bg-[#f56c6c]/80 p-1 text-white hover:bg-[#f56c6c] group-hover:block"
              @click.stop="handleDelete(item)"
            >
              <Delete />
            </el-icon>
          </div>
          <div class="truncate text-sm" :title="item.name">{{ item.name }}</div>
          <div class="mt-1 flex items-center justify-between text-xs text-[#909399]">
            <span>{{ formatSize(item.size) }}</span>
            <span>{{ item.uploadTime }}</span>
          </div>
        </div>
      </div>

      <el-empty v-if="!loading && list.length === 0" description="暂无文件" />

      <div class="mt-4 flex justify-end">
        <el-pagination
          v-model:current-page="query.page"
          v-model:page-size="query.pageSize"
          :total="total"
          :page-sizes="[12, 24, 48]"
          layout="total, sizes, prev, pager, next"
          @current-change="handlePageChange"
          @size-change="search"
        />
      </div>
    </el-card>

    <el-dialog v-model="previewVisible" title="图片预览" width="640px">
      <img :src="previewUrl" class="w-full rounded" alt="预览" />
    </el-dialog>
  </div>
</template>
