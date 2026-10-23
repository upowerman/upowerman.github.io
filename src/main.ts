import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import ToolPage from './ToolPage.vue'
import './style.css'
import { toolIdFromPath, legacyToolRedirect } from './utils/tool-routes'

const legacy = legacyToolRedirect(window.location.search)
if (legacy) {
  // 兼容旧版 /?tool=json 参数直达
  window.location.replace(legacy)
} else {
  const toolId = toolIdFromPath(window.location.pathname)
  const app = toolId ? createApp(ToolPage, { toolId }) : createApp(App)
  app.use(createPinia())
  app.mount('#app')
}
