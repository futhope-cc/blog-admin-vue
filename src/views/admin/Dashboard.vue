<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { EChartsOption } from 'echarts'
import { getDashboardStats } from '@/api/stats'
import type { DashboardStats, HotArticle } from '@/api/types'
import EChart from '@/components/EChart.vue'

const router = useRouter()
const loading = ref(true)
const stats = ref<DashboardStats | null>(null)

function goEdit(id: string) {
  if (!id) {
    ElMessage.warning('热门文章缺少 id，无法直接编辑')
    return
  }
  router.push(`/article/edit/${id}`)
}

const cards = computed(() => {
  const o = stats.value?.overview
  return [
    { label: '文章总数', value: o?.articleCount ?? 0, icon: 'Document', color: '#409eff' },
    { label: '项目总数', value: o?.projectCount ?? 0, icon: 'FolderOpened', color: '#67c23a' },
    { label: '分类总数', value: o?.categoryCount ?? 0, icon: 'Folder', color: '#e6a23c' },
    { label: '标签总数', value: o?.tagCount ?? 0, icon: 'CollectionTag', color: '#909399' },
    { label: '总浏览量', value: o?.viewCount ?? 0, icon: 'View', color: '#f56c6c' },
  ]
})

const trendOption = computed<EChartsOption>(() => {
  const trend = stats.value?.trend ?? []
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: 16, right: 16, top: 36, bottom: 16, containLabel: true },
    xAxis: {
      type: 'category',
      data: trend.map((t) => t.week),
    },
    yAxis: [{ type: 'value', name: '文章数' }],
    series: [
      {
        name: '新增文章',
        type: 'bar',
        barWidth: 18,
        itemStyle: { color: '#409eff', borderRadius: [3, 3, 0, 0] },
        data: trend.map((t) => t.count),
      },
    ],
  }
})

const categoryOption = computed<EChartsOption>(() => {
  const dist = stats.value?.categoryDist ?? []
  return {
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [
      {
        name: '文章分布',
        type: 'pie',
        radius: ['40%', '65%'],
        center: ['50%', '44%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
        label: { formatter: '{b}: {c}' },
        data: dist.map((d) => ({ name: d.name, value: d.count })),
      },
    ],
  }
})

async function load() {
  loading.value = true
  try {
    stats.value = await getDashboardStats()
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div v-loading="loading">
    <el-row :gutter="16">
      <el-col v-for="c in cards" :key="c.label" :xs="12" :sm="12" :md="6">
        <el-card shadow="hover" class="mb-4">
          <div class="flex items-center gap-4">
            <div
              class="flex h-12 w-12 items-center justify-center rounded-lg"
              :style="{ backgroundColor: c.color + '1a', color: c.color }"
            >
              <el-icon :size="26"><component :is="c.icon" /></el-icon>
            </div>
            <div>
              <div class="text-2xl font-semibold text-[#1f2d3d]">{{ c.value }}</div>
              <div class="text-sm text-[#909399]">{{ c.label }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <el-col :xs="24" :md="16">
        <el-card shadow="hover" class="mb-4" header="访问趋势">
          <EChart :option="trendOption" />
        </el-card>
      </el-col>
      <el-col :xs="24" :md="8">
        <el-card shadow="hover" class="mb-4" header="文章分类分布">
          <EChart :option="categoryOption" :height="'320px'" />
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="hover" header="热门文章">
      <el-table
        :data="stats?.hotArticles ?? []"
        v-loading="loading"
        @row-click="(row: HotArticle) => goEdit(row.id)"
      >
        <el-table-column type="index" label="排名" width="70" />
        <el-table-column prop="title" label="文章标题" min-width="220" />
        <el-table-column prop="viewCount" label="浏览量" width="120" align="center">
          <template #default="{ row }">
            <el-tag type="warning" effect="light">{{ row.viewCount }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click.stop="goEdit(row.id)">
              编辑
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>
