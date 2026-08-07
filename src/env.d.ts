/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface AppConfig {
  apiBaseUrl?: string
  requestTimeout?: number
}

interface Window {
  __APP_CONFIG__?: AppConfig
}
