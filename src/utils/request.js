import { useUserStore } from '@/stores/user'
import axios from 'axios'
import router from '@/router'
import { ElMessage } from 'element-plus'

const baseURL = 'http://106.15.230.86:80/api'

const instance = axios.create({
  baseURL,
  timeout: 5000,
})

// 请求拦截器：添加 JWT 认证头
instance.interceptors.request.use(
  (config) => {
     const userStore = useUserStore()
     if (userStore.token) {
       config.headers.Authorization = `Bearer ${userStore.token}`
      }

    // 自动设置 Content-Type，仅当未设置时添加
    if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json'
    }

    return config
  },
  (err) => Promise.reject(err),
)

// 响应拦截器：统一处理错误
instance.interceptors.response.use(
  (res) => {
    // 假设后端仍使用 code === 0 表示成功，如果没有 code 就直接返回
    if (res.data?.code === 0 || !('code' in res.data)) {
      return res
    }
    ElMessage({ message: res.data.message || '服务异常', type: 'error' })
    return Promise.reject(res.data)
  },
  (err) => {
    ElMessage({ message: err.response?.data?.message || '服务异常', type: 'error' })
    console.log(err)
    if (err.response?.status === 401) {
      router.push('/login')
    }
    return Promise.reject(err)
  },
)

export default instance
export { baseURL }
