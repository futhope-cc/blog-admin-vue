<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { deleteComment, getCommentList, updateCommentStatus } from '@/api/comment'
import type { Comment } from '@/api/types'

const loading = ref(false)
const list = ref<Comment[]>([])
const total = ref(0)
const query = reactive({ page: 1, pageSize: 10, status: '', keyword: '' })

const statusMap: Record<Comment['status'], { text: string; type: 'info' | 'success' | 'danger' }> = {
  pending: { text: '待审核', type: 'info' },
  approved: { text: '已通过', type: 'success' },
  rejected: { text: '已拒绝', type: 'danger' },
}

async function load() {
  loading.value = true
  try {
    const res = await getCommentList({
      page: query.page,
      pageSize: query.pageSize,
      status: query.status,
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
  query.status = ''
  query.keyword = ''
  search()
}

function handlePageChange(page: number) {
  query.page = page
  load()
}

async function setStatus(row: Comment, status: Comment['status']) {
  const actionText = status === 'approved' ? '通过' : '拒绝'
  await updateCommentStatus(row.id, status)
  ElMessage.success(`已${actionText}该评论`)
  load()
}

async function handleDelete(row: Comment) {
  await ElMessageBox.confirm('确定删除该评论吗？删除后不可恢复。', '删除确认', {
    type: 'warning',
    confirmButtonText: '删除',
  })
  await deleteComment(row.id)
  ElMessage.success('删除成功')
  load()
}

onMounted(load)
</script>

<template>
  <el-card shadow="never">
    <el-form :inline="true" @submit.prevent>
      <el-form-item label="状态">
        <el-select
          v-model="query.status"
          placeholder="全部状态"
          clearable
          class="w-36"
          @change="search"
        >
          <el-option label="待审核" value="pending" />
          <el-option label="已通过" value="approved" />
          <el-option label="已拒绝" value="rejected" />
        </el-select>
      </el-form-item>
      <el-form-item label="关键词">
        <el-input
          v-model="query.keyword"
          placeholder="昵称 / 评论内容"
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
    </el-form>
  </el-card>

  <el-card shadow="never" class="mt-4">
    <el-table v-loading="loading" :data="list">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column label="评论内容" min-width="260">
        <template #default="{ row }">
          <div>
            <div class="mb-1 flex items-center gap-2">
              <el-avatar :size="22">{{ row.username.slice(0, 1) }}</el-avatar>
              <span class="text-sm font-medium">{{ row.username }}</span>
              <span class="text-xs text-[#c0c4cc]">{{ row.createTime }}</span>
            </div>
            <div class="text-sm leading-6 text-[#606266]">{{ row.content }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="所属文章" min-width="160" show-overflow-tooltip>
        <template #default="{ row }">
          <span class="text-[#409eff]">{{ row.articleTitle }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="90" align="center">
        <template #default="{ row }">
          <el-tag :type="statusMap[row.status as Comment['status']].type">
            {{ statusMap[row.status as Comment['status']].text }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" align="center">
        <template #default="{ row }">
          <template v-if="row.status === 'pending'">
            <el-button link type="success" @click="setStatus(row, 'approved')">
              通过
            </el-button>
            <el-button link type="warning" @click="setStatus(row, 'rejected')">
              拒绝
            </el-button>
          </template>
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
</template>
