<template>
  <div class="profile-container">
    <main class="profile-content">
      <div class="profile-card">
        <h2>编辑个人资料</h2>
        
        <div class="avatar-section">
          <div class="avatar-preview">
            <img :src="user.avatar || defaultAvatar" alt="头像">
          </div>
          <div class="avatar-actions">
            <label class="upload-btn">
              <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 7v2.99s-1.99.01-2 0V7h-3s.01-1.99 0-2h3V2h2v3h3v2h-3zm-3 4V8H5v14h14V11h-4zm-8 8H6v-4h2v4zm0-6H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-4h2v4zm0-6h-2v-2h2v2zm0-4h-2V7h2v2z" fill="currentColor"/>
              </svg>
              更换头像
              <input type="file" accept="image/*" @change="handleAvatarUpload" hidden />
            </label>
          </div>
        </div>
        
        <form @submit.prevent="saveProfile">
          <div class="form-group">
            <label for="username">账号</label>
            <input 
              type="text" 
              id="username" 
              v-model="user.username" 
              required
              placeholder="请输入账号"
            >
            <!-- 移除 readonly 属性，允许修改账号 -->
            <small>账号用于登录，建议使用邮箱或手机号</small>
          </div>
          
          <div class="form-group">
            <label for="nickname">昵称</label>
            <input 
              type="text" 
              id="nickname" 
              v-model="user.nickname" 
              required
              placeholder="请输入昵称"
            >
            <small>昵称将显示在个人资料中</small>
          </div>
          
          <div class="form-actions">
            <button type="button" class="cancel-btn" @click="$router.push('/')">取消</button>
            <button type="submit" class="save-btn">保存修改</button>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48cGF0aCBkPSJNMTIgMkMyLjU4IDEyIDIgMjEuNDIgMiAyNCA0IDIyQzQuMDAxIDE1Ljc4IDguNjU3IDEyIDE0IDEyQzE5LjMzMyAxMiAyNCAxNS43OCAyNCAyMkg2QzYuMDAxIDE1Ljc4IDEwLjY1NyAxMiAxNiAxMkMyMS4zMzMgMTIgMjYgMTUuNzggMjYgMjJIMjhDMjggMjEuNDIgMjEuNDIgMTIgMTIgMnptMCAxOEgxMlYxNEgxMlYxOHptMCA0QzE1LjMzMyAyMiAxOCAxOS4zMzMgMTggMTZDMThgMy4zMTMgMCAxNS4zMzMgMiAxMiAyQzguNjY3IDIgNiA0LjY2NyA2IDhDNiAxMS4zMzMgOC42NjcgMTQgMTIgMTRDMTUuMzMzIDE0IDE4IDExLjMzMyAxOCA4QzE4IDQuNjY3IDE1LjMzMyAyIDEyIDJaIiBmaWxsPSIjZmZmIi8+PC9zdmc+'

const user = ref({
  username: '',  // 账号（可修改）
  nickname: '',  // 昵称（可修改）
  avatar: ''
})

const router = useRouter()

onMounted(() => {
  const savedUser = localStorage.getItem('user')
  if (savedUser) {
    user.value = JSON.parse(savedUser)
  } else {
    router.push('/login')
  }
})

const handleAvatarUpload = (e) => {
  const file = e.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (event) => {
      user.value.avatar = event.target.result
    }
    reader.readAsDataURL(file)
  }
}

const saveProfile = () => {
  // 可以添加账号格式验证（如邮箱/手机号格式）
  if (!user.value.username.trim()) {
    alert('请输入账号')
    return
  }
  if (!user.value.nickname.trim()) {
    alert('请输入昵称')
    return
  }
  
  localStorage.setItem('user', JSON.stringify(user.value))
  alert('资料保存成功')
  router.push('/')
}
</script>

<style scoped>
/* 样式保持不变 */
.profile-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.profile-content {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
  background-color: var(--bg);
  display: flex;
  justify-content: center;
}

.profile-card {
  background: var(--card);
  border-radius: 12px;
  padding: 30px;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 6px 18px rgba(12,34,88,0.06);
  margin-top: 70px; /* 预留顶部导航栏高度 */
  margin-bottom: 44px; /* 预留底部页脚高度 */
}

h2 {
  margin-bottom: 30px;
  color: #0f172a;
  border-bottom: 1px solid var(--border);
  padding-bottom: 15px;
}

.avatar-section {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  gap: 20px;
}

.avatar-preview {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid var(--border);
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.form-group {
  margin-bottom: 25px;
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

small {
  display: block;
  margin-top: 5px;
  color: var(--muted);
  font-size: 12px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
}

.cancel-btn {
  background: #f1f5f9;
  border: 1px solid var(--border);
  color: #0f172a;
  padding: 14px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background-color: #e2e8f0;
}

.save-btn {
  background: #f1f5f9;
  border: 1px solid var(--border);
  color: #0f172a;
  padding: 14px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.2s;
}

.save-btn:hover {
  background-color: #e2e8f0;
}


:root{
  --bg:#f6f8fb; 
  --card:#fff; 
  --accent:#4c6ef5; 
  --muted:#6b7280;
  --border:#e6ecff;
}

.icon {
  width: 20px;
  height: 20px;
  fill: currentColor;
}

.upload-btn{
  background: rgba(76, 110, 245, 0.1);
  color: var(--accent);
  padding: 12px 18px;
  border-radius: 8px;
  cursor: pointer;
  display:flex;
  align-items:center;
  gap:8px;
  font-size: 15px;
  font-weight: 500;
  transition:background-color 0.2s;
}

.upload-btn:hover{
  background: rgba(76, 110, 245, 0.2);
}

@media (max-width: 600px){
  .profile-content {
    padding: 15px;
  }
  
  .profile-card {
    padding: 20px;
    margin-top: 60px;
    margin-bottom: 30px;
  }
  
  .avatar-section {
    flex-direction: column;
    align-items: center;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .cancel-btn, .save-btn {
    width: 100%;
  }
}
</style>