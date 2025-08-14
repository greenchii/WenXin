import { defineStore } from 'pinia'
import { ref } from 'vue'

// 用户模块 token setToken removeToken
export const useUserStore = defineStore(
  'big-user',
  () => {
    const token = ref('')
    const setToken = (newToken) => {
      token.value = newToken
    }
    const removeToken = () => {
      token.value = ''
    } // 用户信息（目前接口未提供，预留）

    const user = ref({})
    const setUser = (obj) => {
      user.value = obj
    }

    return {
      user,
      token,
      setUser,
      setToken,
      removeToken,
    }
  },
  {
    persist: true,
  },
)
