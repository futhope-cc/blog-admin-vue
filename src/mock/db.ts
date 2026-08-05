import type {
  Article,
  Category,
  FileItem,
  Project,
  Tag,
  UserInfo,
} from '@/api/types'

export const users: UserInfo[] = [
  {
    id: 1,
    username: 'admin',
    nickname: '站长',
    avatar: '',
  },
]

export const categories: Category[] = [
  { id: 1, name: 'C++', sort: 1, createTime: '2026-01-05 09:12:00' },
  { id: 2, name: 'Java', sort: 2, createTime: '2026-01-06 10:00:00' },
  { id: 3, name: 'AI', sort: 3, createTime: '2026-01-08 14:20:00' },
  { id: 4, name: '音视频', sort: 4, createTime: '2026-02-12 16:30:00' },
  { id: 5, name: 'Linux', sort: 5, createTime: '2026-03-02 11:05:00' },
  { id: 6, name: '架构设计', sort: 6, createTime: '2026-03-20 09:45:00' },
]

export const tags: Tag[] = [
  { id: 1, name: 'FFmpeg' },
  { id: 2, name: 'OpenCV' },
  { id: 3, name: 'YOLO' },
  { id: 4, name: 'TensorRT' },
  { id: 5, name: 'GB28181' },
  { id: 6, name: 'Spring Boot' },
  { id: 7, name: 'MySQL' },
  { id: 8, name: 'Docker' },
  { id: 9, name: 'Vue3' },
]

const md = (title: string) => `# ${title}

## 引言

本文介绍 \`${title}\` 的核心概念与实践经验。

## 为什么需要它

在真实项目中，性能与可维护性同样重要。下面是一段示例代码：

\`\`\`javascript
function hello(name) {
  return \`Hello, \${name}!\`
}

console.log(hello('Blog'))
\`\`\`

## 实现细节

> 提示：合理的设计往往比炫技的代码更重要。

1. 第一步，梳理业务场景
2. 第二步，抽象公共能力
3. 第三步，落地与测试

### 注意事项

- 注意边界条件处理
- 注意性能瓶颈定位
- 注意团队协作规范

## 总结

通过本文，我们了解了 \`${title}\` 的基本用法。欢迎留言交流。
`

export const articles: Article[] = [
  {
    id: 1,
    title: 'FFmpeg 音视频转码实战',
    summary: '介绍 FFmpeg 在音视频转码中的常用命令与性能优化技巧。',
    content: md('FFmpeg 音视频转码实战'),
    cover: '',
    categoryId: 4,
    tagIds: [1, 5],
    viewCount: 1286,
    status: 'published',
    createTime: '2026-07-12 09:30:00',
    publishTime: '2026-07-12 09:30:00',
  },
  {
    id: 2,
    title: '基于 YOLO 的实时目标检测实践',
    summary: '从数据标注到模型部署，分享基于 YOLOv8 的端侧目标检测完整流程。',
    content: md('基于 YOLO 的实时目标检测实践'),
    cover: '',
    categoryId: 3,
    tagIds: [3, 2],
    viewCount: 983,
    status: 'published',
    createTime: '2026-07-08 14:00:00',
    publishTime: '2026-07-08 14:00:00',
  },
  {
    id: 3,
    title: 'Spring Boot 集成 MyBatis Plus 最佳实践',
    summary: '统一封装分页查询、自动填充、逻辑删除等能力，提升开发效率。',
    content: md('Spring Boot 集成 MyBatis Plus 最佳实践'),
    cover: '',
    categoryId: 2,
    tagIds: [6, 7],
    viewCount: 754,
    status: 'published',
    createTime: '2026-06-30 10:20:00',
    publishTime: '2026-06-30 10:20:00',
  },
  {
    id: 4,
    title: 'TensorRT 模型推理加速指南',
    summary: '在 NVIDIA 平台上通过 TensorRT 将模型推理速度提升数倍。',
    content: md('TensorRT 模型推理加速指南'),
    cover: '',
    categoryId: 3,
    tagIds: [4],
    viewCount: 432,
    status: 'published',
    createTime: '2026-06-18 16:40:00',
    publishTime: '2026-06-18 16:40:00',
  },
  {
    id: 5,
    title: 'Docker 部署个人博客全流程',
    summary: '使用 Docker Compose 一键编排 MySQL、Redis、Nginx 与后端服务。',
    content: md('Docker 部署个人博客全流程'),
    cover: '',
    categoryId: 5,
    tagIds: [8],
    viewCount: 356,
    status: 'published',
    createTime: '2026-06-05 11:10:00',
    publishTime: '2026-06-05 11:10:00',
  },
  {
    id: 6,
    title: 'Vue3 组合式 API 设计思考',
    summary: '聊聊 Composition API 的封装边界与状态管理的演进。',
    content: md('Vue3 组合式 API 设计思考'),
    cover: '',
    categoryId: 6,
    tagIds: [9],
    viewCount: 267,
    status: 'draft',
    createTime: '2026-07-20 15:30:00',
  },
  {
    id: 7,
    title: 'C++ 内存管理与性能优化',
    summary: '从 RAII 到移动语义，整理 C++ 高性能开发的常用手段。',
    content: md('C++ 内存管理与性能优化'),
    cover: '',
    categoryId: 1,
    tagIds: [],
    viewCount: 0,
    status: 'draft',
    createTime: '2026-07-25 09:00:00',
  },
]

export const projects: Project[] = [
  {
    id: 1,
    name: 'BlogHub 个人博客系统',
    description: '基于 Vue3 + Spring Boot 的个人博客与项目展示平台，支持 Markdown 写作与数据统计。',
    technology: 'Vue3, TypeScript, Spring Boot, MySQL, Redis',
    githubUrl: 'https://github.com/example/blog-hub',
    image: '',
    createTime: '2026-03-15 10:00:00',
  },
  {
    id: 2,
    name: 'StreamSight 视频流分析平台',
    description: '接入 GB28181 国标设备的视频流分析平台，内置 YOLO 实时检测与告警能力。',
    technology: 'C++, FFmpeg, TensorRT, OpenCV',
    githubUrl: 'https://github.com/example/stream-sight',
    image: '',
    createTime: '2026-04-02 14:20:00',
  },
  {
    id: 3,
    name: 'CodeGenius 代码智能助手',
    description: '面向开发者的代码补全与问答助手，基于大模型实现上下文理解。',
    technology: 'Python, LLM, FastAPI, Vector DB',
    githubUrl: 'https://github.com/example/code-genius',
    image: '',
    createTime: '2026-05-21 09:40:00',
  },
]

export const files: FileItem[] = [
  {
    id: 1,
    name: 'ffmpeg-cover.png',
    url: '',
    type: 'image',
    size: 245_760,
    uploadTime: '2026-07-12 09:00:00',
  },
  {
    id: 2,
    name: 'yolo-demo.mp4',
    url: '',
    type: 'file',
    size: 52_428_800,
    uploadTime: '2026-07-08 13:30:00',
  },
  {
    id: 3,
    name: 'blog-architecture.png',
    url: '',
    type: 'image',
    size: 131_072,
    uploadTime: '2026-07-05 16:00:00',
  },
]
