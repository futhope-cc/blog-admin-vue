<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getProfile, updateProfile } from '@/api/profile'
import { uploadFile } from '@/api/file'

interface DirectionItem {
  title: string
  icon: string
  desc: string
}

interface WorkItem {
  company: string
  position: string
  period: string
  desc: string
}

const DIRECTION_ICONS = [
  'Film', 'VideoCamera', 'Headset', 'Cpu', 'Connection', 'Monitor', 'DataAnalysis',
  'Platform', 'SetUp', 'Tools', 'Guide', 'Promotion', 'TrendCharts', 'DataBoard', 'FolderOpened', 'Service',
]

const loading = ref(false)
const saving = ref(false)
const updateTime = ref('')

const formRef = ref()
const form = reactive({
  nickname: '',
  avatar: '',
  bio: '',
  techStack: '',
  socialLinks: '',
  email: '',
  gitee: '',
  copyright: '',
  directions: [] as DirectionItem[],
  workExperience: [] as WorkItem[],
})

const rules = {
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
}

function parseJsonArray<T>(value?: string | null): T[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

async function load() {
  loading.value = true
  try {
    const data = await getProfile()
    form.nickname = data.nickname ?? ''
    form.avatar = data.avatar ?? ''
    form.bio = data.bio ?? ''
    form.techStack = data.techStack ?? ''
    form.socialLinks = data.socialLinks ?? ''
    form.email = data.email ?? ''
    form.gitee = data.gitee ?? ''
    form.copyright = data.copyright ?? ''
    form.directions = parseJsonArray<DirectionItem>(data.directions)
    form.workExperience = parseJsonArray<WorkItem>(data.workExperience)
    updateTime.value = data.updateTime ?? ''
  } finally {
    loading.value = false
  }
}

async function handleAvatarUpload(options: any) {
  try {
    const item = await uploadFile(options.file)
    form.avatar = item.url || ''
    ElMessage.success('头像上传成功')
  } catch {
    // handled by request layer
  }
}

function addDirection() {
  form.directions.push({ title: '', icon: '', desc: '' })
}

function removeDirection(index: number) {
  form.directions.splice(index, 1)
}

function addWork() {
  form.workExperience.push({ company: '', position: '', period: '', desc: '' })
}

function removeWork(index: number) {
  form.workExperience.splice(index, 1)
}

async function submit() {
  await formRef.value.validate()
  saving.value = true
  try {
    await updateProfile({
      nickname: form.nickname,
      avatar: form.avatar,
      bio: form.bio,
      techStack: form.techStack,
      socialLinks: form.socialLinks,
      email: form.email,
      gitee: form.gitee,
      copyright: form.copyright,
      directions: form.directions.length ? JSON.stringify(form.directions) : '',
      workExperience: form.workExperience.length ? JSON.stringify(form.workExperience) : '',
    })
    ElMessage.success('站长信息已保存')
    load()
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<template>
  <el-card v-loading="loading" shadow="never">
    <div class="mb-4 flex items-center justify-between">
      <span class="text-sm text-[#909399]">
        站长信息（前台"关于我"页面展示）
        <span v-if="updateTime" class="ml-2">上次更新：{{ updateTime }}</span>
      </span>
    </div>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="110px"
      class="max-w-3xl"
    >
      <el-form-item label="昵称" prop="nickname">
        <el-input v-model="form.nickname" maxlength="50" show-word-limit />
      </el-form-item>

      <el-form-item label="头像">
        <div class="flex items-start gap-4">
          <el-upload
            :show-file-list="false"
            accept="image/*"
            :http-request="handleAvatarUpload"
          >
            <div
              v-if="form.avatar"
              class="h-20 w-20 cursor-pointer overflow-hidden rounded-full border border-[#dcdfe6]"
            >
              <img :src="form.avatar" class="h-full w-full object-cover" alt="头像" />
            </div>
            <div
              v-else
              class="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-full border border-dashed border-[#dcdfe6] text-[#909399] hover:border-[#409eff] hover:text-[#409eff]"
            >
              <el-icon :size="22"><Plus /></el-icon>
              <span class="text-xs">上传头像</span>
            </div>
          </el-upload>
          <div class="text-sm leading-6 text-[#909399]">
            <p>支持 JPG / PNG / WebP</p>
            <p v-if="form.avatar">
              <el-button link type="danger" @click="form.avatar = ''">
                移除头像
              </el-button>
            </p>
          </div>
        </div>
      </el-form-item>

      <el-form-item label="个人简介" prop="bio">
        <el-input
          v-model="form.bio"
          type="textarea"
          :rows="4"
          maxlength="1000"
          show-word-limit
          placeholder="简单介绍自己，展示在前台关于我页面"
        />
      </el-form-item>

      <el-form-item label="技术栈">
        <el-input
          v-model="form.techStack"
          placeholder="多个技术用英文逗号分隔，如：Vue3,SpringBoot,MySQL"
        />
      </el-form-item>

      <el-form-item label="邮箱">
        <el-input v-model="form.email" placeholder="请输入邮箱" />
      </el-form-item>

      <el-form-item label="Gitee">
        <el-input v-model="form.gitee" placeholder="https://gitee.com/用户名" />
      </el-form-item>

      <el-form-item label="社交链接">
        <el-input
          v-model="form.socialLinks"
          type="textarea"
          :rows="3"
          placeholder='JSON 数组格式，如：[{"name":"Gitee","url":"https://gitee.com/用户名"}]'
        />
      </el-form-item>

      <el-form-item label="备案号">
        <el-input
          v-model="form.copyright"
          placeholder="如：粤ICP备XXXXXXXX号，为空则前台不展示"
        />
      </el-form-item>

      <el-form-item label="技术方向">
        <div class="w-full space-y-2">
          <div
            v-for="(item, index) in form.directions"
            :key="index"
            class="rounded-lg border border-[#e4e7ed] p-3"
          >
            <div class="flex items-center gap-2">
              <el-input v-model="item.title" placeholder="方向标题，如：音视频技术" class="flex-1" />
              <el-select
                v-model="item.icon"
                filterable
                allow-create
                clearable
                placeholder="图标(可选)"
                style="width: 180px"
              >
                <el-option v-for="icon in DIRECTION_ICONS" :key="icon" :label="icon" :value="icon">
                  <span class="inline-flex items-center gap-2">
                    <el-icon><component :is="icon" /></el-icon>
                    {{ icon }}
                  </span>
                </el-option>
              </el-select>
              <el-button type="danger" text @click="removeDirection(index)">删除</el-button>
            </div>
            <el-input
              v-model="item.desc"
              class="mt-2"
              type="textarea"
              :rows="2"
              placeholder="方向描述"
            />
          </div>
          <el-button type="primary" plain @click="addDirection">添加技术方向</el-button>
        </div>
      </el-form-item>

      <el-form-item label="工作经历">
        <div class="w-full space-y-2">
          <div
            v-for="(item, index) in form.workExperience"
            :key="index"
            class="rounded-lg border border-[#e4e7ed] p-3"
          >
            <div class="flex items-center gap-2">
              <el-input v-model="item.position" placeholder="职位，如：高级后端工程师" class="flex-1" />
              <el-input v-model="item.period" placeholder="时间，如：2022 - 至今" style="width: 160px" />
              <el-button type="danger" text @click="removeWork(index)">删除</el-button>
            </div>
            <el-input v-model="item.company" class="mt-2" placeholder="公司名称" />
            <el-input
              v-model="item.desc"
              class="mt-2"
              type="textarea"
              :rows="2"
              placeholder="工作内容描述"
            />
          </div>
          <el-button type="primary" plain @click="addWork">添加工作经历</el-button>
        </div>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" :loading="saving" @click="submit">保存</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>
