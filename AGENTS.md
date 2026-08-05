# AGENTS.md

个人博客后台管理界面（Vue3 + TS + Vite）。界面文案一律使用中文。

## 命令

Windows 上 PowerShell 执行策略禁止 `npm.ps1`，一律用 `npm.cmd`（Bash 工具内同样如此）。

- `npm.cmd run dev` — 开发服务器（端口 5173）
- `npm.cmd run typecheck` — `vue-tsc -b --noEmit`，提交前必跑
- `npm.cmd run build` — `vue-tsc -b && vite build`（已含类型检查）

无 lint、无测试框架、无 CI。

## 架构要点

- 页面在 `src/views/admin/`，公共组件在 `src/components/`，布局在 `src/layouts/AdminLayout.vue`。
- **Mock 数据先行**：`src/api/request.ts:75` 的 `MOCK_ENABLED = true`。接真实后端时改为 `false` 并按 `/api` 对齐路径。mock 处理器按 `src/mock/*.ts` 注册。
- 接口响应格式固定为 `{ code, message, data }`，`code !== 200` 会弹 ElMessage 报错并 reject。mock 与真实后端共用此约定。
- 新增接口的固定三步：`src/api/types.ts` 定义类型 → `src/api/xxx.ts` 封装 `request` → `src/mock/xxx.ts` 用 `registerMock` 注册（url 支持 RegExp 匹配路径参数，如 `/^\/admin\/article\/\d+$/`）。
- 新增页面需要**手动**改两处：`src/router/index.ts` children（懒加载 `() => import(...)`）+ `AdminLayout.vue` 的 `menus` 数组，二者无自动关联。
- Element Plus 图标已在 `main.ts` 全局注册，模板中直接用字符串名（如 `icon="Search"`）。
- `vite.config.ts` 中 `manualChunks` 固定分包 echarts / element-plus / markdown，改动依赖后留意 chunk 体积。
- mock 登录账号 `admin / 123456`（仅 mock，真实后端在 `src/mock/auth.ts` 中体现）。

## 约定

- 不写代码注释（除非用户要求）。
- 评论模块已移除，前台无登录注册、不做游客评论，不要重新引入评论相关代码/文案。
- 后台每页都接 `request` 而非直接调用 axios；错误处理由 `request.ts` 拦截器统一完成。
- `.tsbuildinfo`、`dist/`、`node_modules/` 已 gitignore，勿提交。
