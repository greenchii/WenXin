import { createApp } from 'vue'
import { createPinia } from 'pinia'
import persist from 'pinia-plugin-persistedstate'

import App from './App.vue'
import router from './router'

// 创建 Pinia 实例一次，并注册持久化插件
const pinia = createPinia()
pinia.use(persist)

import './utils/request'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)

app.use(pinia) //  只 use 一次
app.use(router)
app.use(ElementPlus)

app.mount('#app')
