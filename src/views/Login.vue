<template>
  <div class="login-container">
    <div class="login-card">
      <div class="logo-wrap">
        <img class="logo" src="/favicon.png" alt="网站图标" width="64" height="64">
        <span class="app-name">问心</span>
      </div>
      
      <h2>{{ isLoginMode ? '账号登录' : '账号注册' }}</h2>
      
      <form @submit.prevent="handleAuth">
        <div class="form-group">
          <label for="username">用户名</label>
          <input 
            type="text" 
            id="username" 
            v-model="username" 
            required
            placeholder="请输入用户名"
            autocomplete="off"
          >
        </div>
        
        <div class="form-group" v-if="!isLoginMode">
          <label for="email">邮箱</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            required
            placeholder="请输入邮箱"
            autocomplete="off"
          >
        </div>
        
        <div class="form-group">
          <label for="password">密码</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            required
            placeholder="请输入密码"
          >
        </div>
        
        <div class="form-group" v-if="!isLoginMode">
          <label for="confirmPassword">确认密码</label>
          <input 
            type="password" 
            id="confirmPassword" 
            v-model="confirmPassword" 
            required
            placeholder="请再次输入密码"
          >
        </div>
        
        <button type="submit" class="auth-btn">
          {{ isLoginMode ? '登录' : '注册' }}
        </button>
      </form>
      
      <p class="toggle-mode" @click="toggleMode">
        {{ isLoginMode ? '还没有账号？点击注册' : '已有账号？点击登录' }}
      </p>
      
      <p class="error-msg" v-if="errorMsg">{{ errorMsg }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { userRegisterService } from '@/api/user'
import { useUserStore } from '@/stores/user'

// 表单数据
const username = ref('')
const password = ref('')
const email = ref('')
const confirmPassword = ref('')
const errorMsg = ref('')
const isLoginMode = ref(true)

const router = useRouter()
const userStore = useUserStore()

// 切换登录/注册模式
const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value
  // 清空表单和错误信息
  username.value = ''
  password.value = ''
  email.value = ''
  confirmPassword.value = ''
  errorMsg.value = ''
}

// 处理登录/注册
const handleAuth = async () => {
  errorMsg.value = ''
  
  // 基本验证
  if (!username.value.trim() || !password.value.trim()) {
    errorMsg.value = '请输入用户名和密码'
    return
  }
  
  // 注册模式验证
  if (!isLoginMode.value) {
    if (!email.value.trim()) {
      errorMsg.value = '请输入邮箱'
      return
    }
    if (password.value !== confirmPassword.value) {
      errorMsg.value = '两次输入的密码不一致'
      return
    }
  }

  try {
    if (isLoginMode.value) {
      // 调用 Pinia 的 login 方法（内部会存储 token）
      await userStore.login({ 
        username: username.value, 
        password: password.value 
      })

      // 跳转首页
      router.push('/')
    } else {
      // 注册逻辑
      await userRegisterService({ 
        username: username.value, 
        password: password.value, 
        email: email.value 
      })
      
      // 注册成功后切换到登录模式
      toggleMode()
      errorMsg.value = '注册成功，请登录'
    }
  } catch (err) {
    // 处理错误信息
    errorMsg.value = err.response?.data?.error || 
                    err.response?.data?.message || 
                    '操作失败，请重试'
    console.error('认证错误:', err)
  }
}
</script>


<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--bg);
  padding: 20px;
}

.login-card {
  background: var(--card);
  border-radius: 12px;
  padding: 30px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 6px 18px rgba(12,34,88,0.06);
}

.logo-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 25px;
}

.logo {
  width: 50px;
  height: 50px;
}

.app-name {
  font-weight: 700;
  font-size: 36px;
  color: var(--accent);
}

h2 {
  text-align: center;
  margin-bottom: 25px;
  color: #0f172a;
}


.form-group {
  margin-bottom: 20px;
  /* 确保输入框容器居中 */
  display: flex;
  flex-direction: column;
  align-items: center;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  font-size: 14px;
  /* 让标签与输入框左对齐 */
  align-self: flex-start;
  width: 100%;
  max-width: 320px;
}

input {
  /* 输入框固定最大宽度，确保左右边距相等 */
  width: 100%;
  max-width: 320px;
  padding: 12px 15px;
  border-radius: 8px;
  border: 1px solid var(--border);
  font-size: 15px;
  transition: border-color 0.2s;
}

input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(76, 110, 245, 0.1);
}

/* 按钮样式修改 */
.auth-btn {
  background: rgba(76, 110, 245, 0.1);
  color: var(--accent);
  border: 1px solid var(--border);
  padding: 14px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  margin-top: 15px;
  width: 100%;
  cursor: pointer;
}

.toggle-mode {
  text-align: center;
  color: var(--accent);
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 15px;
}

.toggle-mode:hover {
  text-decoration: underline;
}

.error-msg {
  color: #e53e3e;
  text-align: center;
  font-size: 14px;
  margin: 0;
}

:root{
  --bg:#f6f8fb; 
  --card:#fff; 
  --accent:#4c6ef5; 
  --muted:#6b7280;
  --border:#e6ecff;
}
</style>
