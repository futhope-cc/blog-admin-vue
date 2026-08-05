<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  deleteArticle,
  getArticleList,
  updateArticleStatus,
} from '@/api/article'
import { getAllCategories } from '@/api/category'
import { getAllTags } from '@/api/tag'
import type { Article, ArticleStatus, Category, Tag } from '@/api/types'

const router = useRouter()
const loading = ref(false)
const list = ref<Article[]>([])
const total = ref(0)
const categories = ref<Category[]>([])
const tags = ref<Tag[]>([])

const query = reactive({
  page: 1,
  pageSize: 10,
  keyword: '',
  categoryId: undefined as number | undefined,
  tagId: undefined as number | undefined,
  status: '' as ArticleStatus | '',
})

const statusMap: Record<ArticleStatus, { text: string; type: 'info' | 'success' | 'warning' }> = {
  draft: { text: '草稿', type: 'info' },
  published: { text: '已发布', type: 'success' },
  offline: { text: '已下线', type: 'warning' },
}

async function load() {
  loading.value = true
  try {
    const res = await getArticleList({
      page: query.page,
      pageSize: query.pageSize,
      keyword: query.keyword || undefined,
      categoryId: query.categoryId,
      tagId: query.tagId,
      status: query.status,
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
  query.keyword = ''
  query.categoryId = undefined
  query.tagId = undefined
  query.status = ''
  search()
}

function handlePageChange(page: number) {
  query.page = page
  load()
}

function goCreate() {
  router.push('/article/create')
}

function goEdit(row: Article) {
  router.push(`/article/edit/${row.id}`)
}

async function toggleStatus(row: Article) {
  const target: ArticleStatus = row.status === 'published' ? 'offline' : 'published'
  await ElMessageBox.confirm(
    target === 'published' ? '确定发布该文章吗？' : '确定下线该文章吗？',
    '提示',
    { type: 'warning' },
  )
  await updateArticleStatus(row.id, target)
  ElMessage.success('操作成功')
  load()
}

async function handleDelete(row: Article) {
  await ElMessageBox.confirm(
    `确定删除文章「${row.title}」吗？删除后不可恢复。`,
    '删除确认',
    { type: 'error', confirmButtonText: '删除' },
  )
  await deleteArticle(row.id)
  ElMessage.success('删除成功')
  if (list.value.length === 1 && query.page > 1) query.page -= 1
  load()
}

onMounted(async () => {
  load()
  const [catRes, tagRes] = await Promise.all([
    getAllCategories(),
    getAllTags(),
  ])
  categories.value = catRes
  tags.value = tagRes
})
</script>

<template>
  <div>
    <el-card shadow="never">
      <el-form :inline="true" @submit.prevent>
        <el-form-item label="关键词">
          <el-input
            v-model="query.keyword"
            placeholder="标题 / 摘要"
            clearable
            class="w-48"
            @keyup.enter="search"
            @clear="search"
          />
        </el-form-item>
        <el-form-item label="分类">
          <el-select
            v-model="query.categoryId"
            placeholder="全部分类"
            clearable
            class="w-40"
            @change="search"
          >
            <el-option
              v-for="c in categories"
              :key="c.id"
              :label="c.name"
              :value="c.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="标签">
          <el-select
            v-model="query.tagId"
            placeholder="全部标签"
            clearable
            class="w-40"
            @change="search"
          >
            <el-option v-for="t in tags" :key="t.id" :label="t.name" :value="t.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="query.status"
            placeholder="全部状态"
            clearable
            class="w-36"
            @change="search"
          >
            <el-option label="草稿" value="draft" />
            <el-option label="已发布" value="published" />
            <el-option label="已下线" value="offline" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="'Search'" @click="search">查询</el-button>
          <el-button :icon="'Refresh'" @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="mt-4">
      <div class="mb-4 flex items-center justify-between">
        <span class="text-sm text-[#909399]">共 {{ total }} 篇文章</span>
        <el-button type="primary" :icon="'EditPen'" @click="goCreate">
          写文章
        </el-button>
      </div>

      <el-table v-loading="loading" :data="list">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column label="标题" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="cursor-pointer font-medium hover:text-[#409eff]" @click="goEdit(row)">
              {{ row.title }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="分类" width="100">
          <template #default="{ row }">
            <el-tag type="primary" effect="plain">{{ row.categoryName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="标签" min-width="160">
          <template #default="{ row }">
            <el-tag
              v-for="t in row.tagNames"
              :key="t"
              class="mr-1"
              size="small"
              effect="light"
            >
              {{ t }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="statusMap[row.status as ArticleStatus].type">
              {{ statusMap[row.status as ArticleStatus].text }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="viewCount" label="浏览量" width="90" align="center" />
        <el-table-column label="发布时间" width="160">
          <template #default="{ row }">{{ row.publishTime || row.createTime }}</template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="goEdit(row)">编辑</el-button>
            <el-button
              link
              :type="row.status === 'published' ? 'warning' : 'success'"
              @click="toggleStatus(row)"
            >
              {{ row.status === 'published' ? '下线' : '发布' }}
            </el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt-4 flex justify-end">
        <el-pagination
          v-model:current-page="query.page"
          v-model:page-size="query.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @current-change="handlePageChange"
          @size-change="search"
        />
      </div>
    </el-card>
  </div>
</template>
