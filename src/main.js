import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './utils/request'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

//pinia持久化
import persist from 'pinia-plugin-persistedstate'
app.use(createPinia().use(persist))

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
app.use(ElementPlus)
