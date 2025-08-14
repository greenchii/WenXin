<template>
    <div class="login-container">
      <div class="login-card">
        <div class="logo-wrap">
          <svg class="logo" viewBox="0 0 64 64" aria-hidden="true">
            <circle cx="32" cy="32" r="28" fill="#4c6ef5" />
            <path d="M18 34c4-8 12-10 18-10v14c-8 0-14 3-18 8z" fill="white"/>
          </svg>
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
  
  // 表单数据
  const username = ref('')
  const password = ref('')
  const confirmPassword = ref('')
  const errorMsg = ref('')
  const isLoginMode = ref(true) // 控制登录/注册模式切换
  
  const router = useRouter()
  
  // 切换登录/注册模式
  const toggleMode = () => {
    isLoginMode.value = !isLoginMode.value
    errorMsg.value = '' // 清空错误信息
  }
  
  // 处理登录/注册
  const handleAuth = () => {
    errorMsg.value = ''
    
    // 基本验证
    if (!username.value.trim() || !password.value.trim()) {
      errorMsg.value = '请输入用户名和密码'
      return
    }
    
    // 注册模式下验证密码一致性
    if (!isLoginMode.value && password.value !== confirmPassword.value) {
      errorMsg.value = '两次输入的密码不一致'
      return
    }
    
    // 获取本地存储的用户数据
    const storedUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
    
    if (isLoginMode.value) {
      // 登录逻辑
      const user = storedUsers.find(u => u.username === username.value && u.password === password.value)
      if (user) {
        // 登录成功，保存用户信息
        localStorage.setItem('user', JSON.stringify({
          username: user.username,
          nickname: user.nickname || user.username,
          avatar: user.avatar || ''
        }))
        router.push('/')
      } else {
        errorMsg.value = '用户名或密码错误'
      }
    } else {
      // 注册逻辑
      const userExists = storedUsers.some(u => u.username === username.value)
      if (userExists) {
        errorMsg.value = '该用户名已被注册'
        return
      }
      
      // 保存新用户
      const newUser = {
        username: username.value,
        password: password.value,
        nickname: username.value,
        avatar: ''
      }
      
      storedUsers.push(newUser)
      localStorage.setItem('registeredUsers', JSON.stringify(storedUsers))
      
      // 自动登录新注册用户
      localStorage.setItem('user', JSON.stringify({
        username: newUser.username,
        nickname: newUser.nickname,
        avatar: newUser.avatar
      }))
      
      router.push('/')
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
    font-size: 22px;
    color: var(--accent);
  }
  
  h2 {
    text-align: center;
    margin-bottom: 25px;
    color: #0f172a;
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    font-size: 14px;
  }
  
  input {
    width: 100%;
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
  
  .auth-btn {
    width: 100%;
    background: var(--accent);
    color: white;
    border: 0;
    padding: 12px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 500;
    transition: background-color 0.2s;
    margin-bottom: 15px;
  }
  
  .auth-btn:hover {
    background: #3a5bdb;
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
  
  /* 引入全局变量 */
  :root{
    --bg:#f6f8fb; 
    --card:#fff; 
    --accent:#4c6ef5; 
    --muted:#6b7280;
    --border:#e6ecff;
  }
  </style>
   