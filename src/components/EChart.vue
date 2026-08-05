<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps<{
  option: echarts.EChartsOption
  height?: string
}>()

const el = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null

function init() {
  if (!el.value) return
  chart = echarts.init(el.value)
  chart.setOption(props.option)
}

function resize() {
  chart?.resize()
}

onMounted(() => {
  init()
  window.addEventListener('resize', resize)
})

watch(
  () => props.option,
  (val) => {
    chart?.setOption(val)
  },
  { deep: true },
)

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  chart?.dispose()
  chart = null
})
</script>

<template>
  <div ref="el" :style="{ height: height || '320px', width: '100%' }"></div>
</template>
