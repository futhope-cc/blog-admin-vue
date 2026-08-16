<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { addArticle, updateArticle } from '@/api/article'
import { getCategoryList } from '@/api/category'
import { getTagList } from '@/api/tag'
import { uploadFile } from '@/api/file'
import { ARTICLE_STATUS, type Article, type ArticleStatus, type Category, type Tag } from '@/api/types'
import { getArticleEditCache } from '@/stores/articleEditCache'
import MarkdownEditor from '@/components/MarkdownEditor.vue'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)
const articleId = computed(() => route.params.id as string)

const loading = ref(false)
const saving = ref(false)
const categories = ref<Category[]>([])
const tags = ref<Tag[]>([])

const form = reactive({
  title: '',
  summary: '',
  content: '',
  cover: '',
  categoryId: undefined as string | undefined,
  tagIds: [] as string[],
  status: ARTICLE_STATUS.DRAFT as ArticleStatus,
})

const formRef = ref()

const rules = {
  title: [{ required: true, message: '请输入文章标题', trigger: 'blur' }],
  summary: [{ required: true, message: '请输入文章摘要', trigger: 'blur' }],
  content: [{ required: true, message: '请输入文章正文', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
}

async function loadDetail() {
  if (!isEdit.value) return
  if (!articleId.value || articleId.value === 'undefined') {
    ElMessage.warning('文章参数不合法，请从文章列表进入编辑')
    router.push('/article/list')
    return
  }
  const record =
    (history.state as { article?: Article })?.article ?? getArticleEditCache(articleId.value)
  if (!record || record.id !== articleId.value) {
    ElMessage.warning('请从文章列表进入编辑')
    router.push('/article/list')
    return
  }
  form.title = record.title
  form.summary = record.summary
  form.content = record.content
  form.cover = record.cover
  form.categoryId = record.categoryId
  form.tagIds = record.tagIds
}

async function handleCoverUpload(options: any) {
  try {
    const item = await uploadFile(options.file)
    form.cover = item.url || ''
    ElMessage.success('封面上传成功')
  } catch {
    // handled by request layer
  }
}

async function submit(status: ArticleStatus) {
  form.status = status
  await formRef.value.validate()
  saving.value = true
  try {
    const payload = {
      title: form.title,
      summary: form.summary,
      content: form.content,
      cover: form.cover,
      categoryId: form.categoryId!,
      tagIds: form.tagIds,
    }
    if (isEdit.value) {
      await updateArticle(articleId.value, payload)
    } else {
      await addArticle({ ...payload, status })
    }
    ElMessage.success(status === ARTICLE_STATUS.PUBLISHED ? '文章已发布' : '已保存为草稿')
    router.push('/article/list')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  const [catRes, tagRes] = await Promise.all([
    getCategoryList().catch(() => []),
    getTagList().catch(() => []),
  ])
  categories.value = catRes
  tags.value = tagRes
  loadDetail()
})
</script>

<template>
  <div v-loading="loading">
    <el-card shadow="never" class="mb-4">
      <div class="flex flex-wrap items-center gap-4">
        <el-input
          v-model="form.title"
          placeholder="请输入文章标题"
          class="min-w-[320px] flex-1"
          size="large"
        />
        <el-select
          v-model="form.categoryId"
          placeholder="选择分类"
          class="w-40"
          size="large"
        >
          <el-option
            v-for="c in categories"
            :key="c.id"
            :label="c.name"
            :value="c.id"
          />
        </el-select>
        <el-select
          v-model="form.tagIds"
          placeholder="选择标签"
          multiple
          collapse-tags
          collapse-tags-tooltip
          class="w-56"
          size="large"
        >
          <el-option v-for="t in tags" :key="t.id" :label="t.name" :value="t.id" />
        </el-select>
        <div class="ml-auto flex gap-3">
          <el-button
            size="large"
            :loading="saving"
            @click="submit(ARTICLE_STATUS.DRAFT)"
          >
            存草稿
          </el-button>
          <el-button
            type="primary"
            size="large"
            :loading="saving"
            @click="submit(ARTICLE_STATUS.PUBLISHED)"
          >
            发布文章
          </el-button>
          <el-button size="large" @click="router.back()">取消</el-button>
        </div>
      </div>
    </el-card>

    <el-card shadow="never" class="mb-4">
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="封面图" prop="cover">
          <div class="flex items-start gap-4">
            <el-upload
              :show-file-list="false"
              accept="image/*"
              :http-request="handleCoverUpload"
            >
              <div
                v-if="form.cover"
                class="h-32 w-52 cursor-pointer overflow-hidden rounded border border-[#dcdfe6]"
              >
                <img :src="form.cover" class="h-full w-full object-cover" alt="封面" />
              </div>
              <div
                v-else
                class="flex h-32 w-52 cursor-pointer flex-col items-center justify-center gap-1 rounded border border-dashed border-[#dcdfe6] text-[#909399] hover:border-[#409eff] hover:text-[#409eff]"
              >
                <el-icon :size="26"><Picture /></el-icon>
                <span class="text-sm">点击上传封面</span>
              </div>
            </el-upload>
            <div class="text-sm leading-6 text-[#909399]">
              <p>支持 JPG / PNG / WebP，建议尺寸 16:9</p>
              <p v-if="form.cover">
                <el-button link type="danger" @click="form.cover = ''">
                  移除封面
                </el-button>
              </p>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="摘要" prop="summary">
          <el-input
            v-model="form.summary"
            type="textarea"
            :rows="3"
            maxlength="200"
            show-word-limit
            placeholder="请输入文章摘要"
          />
        </el-form-item>

        <el-form-item label="正文 (Markdown)" prop="content">
          <div class="w-full">
            <MarkdownEditor v-model="form.content" />
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
