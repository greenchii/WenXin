import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userLoginService } from '@/api/user' // 引入登录接口

// 用户模块
export const useUserStore = defineStore(
  'big-user',
  () => {
    // token
    const token = ref('')
    const setToken = (newToken) => {
      token.value = newToken
    }
    const removeToken = () => {
      token.value = ''
    }

    // 登录方法
    const login = async ({ username, password }) => {
      try {
        const res = await userLoginService({ username, password })
        console.log(res)
        setToken(res.data.access_token)
        return res
      } catch (err) {
        console.error('登录失败:', err)
        throw err
      }
    }

    // 退出方法
    const logout = () => {
      removeToken()
    }

    return {
      token,
      setToken,
      removeToken,
      login,
      logout,
    }
  },
  {
    persist: true,
  },
)
