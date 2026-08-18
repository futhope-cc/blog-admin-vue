<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import MarkdownPreview from './MarkdownPreview.vue'
import { uploadFile } from '@/api/file'

const props = defineProps<{ modelValue: string; height?: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()

const mode = ref<'edit' | 'split' | 'preview'>('split')

const content = computed({
  get: () => props.modelValue,
  set: (v: string) => emit('update:modelValue', v),
})

const textareaRef = ref<HTMLTextAreaElement>()
const fileInputRef = ref<HTMLInputElement>()

function wrapText(prefix: string, suffix = '') {
  const ta = textareaRef.value
  if (!ta) return
  const start = ta.selectionStart
  const end = ta.selectionEnd
  const selected = content.value.slice(start, end)
  const replaced = prefix + selected + suffix
  const next = content.value.slice(0, start) + replaced + content.value.slice(end)
  content.value = next
  requestAnimationFrame(() => {
    ta.focus()
    ta.setSelectionRange(start + prefix.length, start + prefix.length + selected.length)
  })
}

function insertText(text: string) {
  const ta = textareaRef.value
  if (!ta) return
  const start = ta.selectionStart
  const next = content.value.slice(0, start) + text + content.value.slice(start)
  content.value = next
  requestAnimationFrame(() => {
    ta.focus()
    ta.setSelectionRange(start + text.length, start + text.length)
  })
}

async function handleImageUpload(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    const item = await uploadFile(file)
    insertText(`![${file.name}](${item.url})`)
  } catch {
    // handled by request layer
  }
  input.value = ''
}

const actions = [
  { label: 'H1', icon: 'Heading', handler: () => wrapText('# ') },
  { label: 'H2', icon: 'Sunny', handler: () => wrapText('## ') },
  { label: '粗体', icon: 'Bold', handler: () => wrapText('**', '**') },
  { label: '斜体', icon: 'Italic', handler: () => wrapText('*', '*') },
  { label: '删除线', icon: 'Delete', handler: () => wrapText('~~', '~~') },
  { label: '引用', icon: 'ChatLineRound', handler: () => wrapText('> ') },
  { label: '无序列表', icon: 'List', handler: () => wrapText('- ') },
  { label: '有序列表', icon: 'ListFilled', handler: () => wrapText('1. ') },
  { label: '链接', icon: 'Link', handler: () => wrapText('[', '](https://)') },
  { label: '图片', icon: 'Picture', handler: () => fileInputRef.value?.click() },
  { label: '行内代码', icon: 'Cpu', handler: () => wrapText('`', '`') },
  {
    label: '代码块',
    icon: 'Document',
    handler: () => wrapText('```\n', '\n```'),
  },
  { label: '表格', icon: 'Grid', handler: () => wrapText('| 列1 | 列2 |\n| --- | --- |\n| ', ' |') },
]

const textIcons: Record<string, string> = { Heading: 'H', Sunny: 'H₂', Bold: 'B', Italic: 'I', ListFilled: '1.' }
</script>

<template>
  <div class="flex flex-col overflow-hidden rounded border border-[#dcdfe6]">
    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleImageUpload"
    />
    <div class="flex items-center justify-between border-b border-[#e4e7ed] bg-white px-2 py-1">
      <div class="flex flex-wrap items-center gap-1">
        <el-tooltip
          v-for="a in actions"
          :key="a.label"
          :content="a.label"
          placement="top"
        >
          <button
            type="button"
            class="flex h-7 w-7 cursor-pointer items-center justify-center rounded hover:bg-[#ecf5ff] hover:text-[#409eff]"
            @click="a.handler"
          >
            <span v-if="textIcons[a.icon]" class="text-sm font-bold">{{ textIcons[a.icon] }}</span>
            <el-icon v-else><component :is="a.icon" /></el-icon>
          </button>
        </el-tooltip>
      </div>
      <el-radio-group v-model="mode" size="small">
        <el-radio-button value="edit">编辑</el-radio-button>
        <el-radio-button value="split">分屏</el-radio-button>
        <el-radio-button value="preview">预览</el-radio-button>
      </el-radio-group>
    </div>

    <div
      class="flex shrink-0"
      :style="{ height: height || '560px' }"
    >
      <div
        v-show="mode === 'edit' || mode === 'split'"
        class="h-full flex-1"
      >
        <textarea
          ref="textareaRef"
          v-model="content"
          class="h-full w-full resize-none p-3 font-mono text-sm leading-relaxed outline-none"
          placeholder="在这里输入 Markdown 正文..."
        ></textarea>
      </div>
      <div
        v-if="mode === 'split'"
        class="h-full w-px shrink-0 bg-[#e4e7ed]"
      ></div>
      <div
        v-show="mode === 'preview' || mode === 'split'"
        class="h-full flex-1 overflow-auto border-l border-[#e4e7ed] p-3"
        :class="{ 'border-l-0': mode === 'preview' }"
      >
        <MarkdownPreview :content="content" />
      </div>
    </div>
  </div>
</template>
