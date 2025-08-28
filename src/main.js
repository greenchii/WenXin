import { createApp } from 'vue'
import { createPinia } from 'pinia'
import persist from 'pinia-plugin-persistedstate'

import App from './App.vue'
import router from './router'

// utils/request 里通常会设置 axios 拦截器
// 先导入 utils/request（以确保拦截器可用）
import './utils/request'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import { useUserStore } from '@/stores/user' 

// 创建 Pinia 并注册持久化插件
const pinia = createPinia()
pinia.use(persist)

const app = createApp(App)
app.use(pinia)

// ===== 在挂载 router 之前，显式恢复 userStore 的 token =====
try {
  const userStore = useUserStore()
  // 如果需要调用 store 的 hydrate 方法，调用它
  if (typeof userStore.hydrateFromLocalStorage === 'function') {
    userStore.hydrateFromLocalStorage()
  } else {
    // 直接从 localStorage 取 token 并写入
    const saved = localStorage.getItem('token') || ''
    if (saved && !userStore.token) {
      userStore.setToken(saved)
    }
  }
} catch (e) {
  // 使用 useUserStore 可能在某些构建工具或环境下抛错，捕获避免阻塞
  console.warn('failed to hydrate user store before router', e)
}
// ============================================================

app.use(router)
app.use(ElementPlus)

// 等 router 准备好再挂载，能进一步避免守卫在 store 恢复前触发问题
router.isReady().then(() => {
  app.mount('#app')
})
