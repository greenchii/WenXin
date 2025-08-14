<template>
  <div class="records-page">
    <div class="page-header">
      <h1>历史事项记录 -- 会议</h1>
      <button class="back-btn" @click="$router.push('/')">
        <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M11.67 3.87L9.9 2.1 0 12l9.9 9.9 1.77-1.77L3.54 12l8.13-8.13z" fill="currentColor"/>
        </svg>
        返回首页
      </button>
    </div>

    <div class="records-table-container">
      <table class="records-table">
        <thead>
          <tr>
            <th>上传时间</th>
            <th>主题</th>
            <th>详细内容</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(record, index) in meetingRecords" :key="index">
            <td>{{ record.time }}</td>
            <td>{{ record.title }}</td>
            <td class="content-cell">
              <div class="content-text">{{ record.content }}</div>
            </td>
            <td>
              <button class="edit-btn" @click="editRecord(index)">
                <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
                </svg>
              </button>
              <button class="delete-btn" @click="deleteRecord(index)">
                <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
                </svg>
              </button>
            </td>
          </tr>
          <tr v-if="meetingRecords.length === 0">
            <td colspan="4" class="empty-state">
              暂无会议记录
              <button class="add-first-btn" @click="$router.push('/')">
                添加第一条记录
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user.js'

// 路由
const router = useRouter()
const route = useRoute()

const userStore = useUserStore()

// 侧边栏状态
const isSidebarExpanded = ref(false)

// 分组数据结构（会由 refreshSidebar 填充）
const sidebarSections = ref([
  { title: '今天', items: [] },
  { title: '昨天', items: [] },
  { title: '7天内', items: [] },
  { title: '30天内', items: [] }
])

const STORAGE_KEY = 'wenxin_v1'

// 检查登录状态
const checkLoginStatus = () => {
  if (!userStore.user || !userStore.user.username) {
    // 默认未登录状态
    userStore.setUser({ username: '', nickname: '', avatar: '' })
  }
}

// 读取问题（仍用 localStorage 保存问题数据，但用户信息完全用 store）
function loadQuestionsFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return (parsed.questions || []).slice()
  } catch (e) {
    console.warn('解析问题数据失败', e)
    return []
  }
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth() === b.getMonth() &&
         a.getDate() === b.getDate()
}

function buildSectionsFromQuestions(questions) {
  const now = new Date()
  const sections = [
    { title: '今天', items: [] },
    { title: '昨天', items: [] },
    { title: '7天内', items: [] },
    { title: '30天内', items: [] }
  ]

  for (const q of questions) {
    if (!q.createdAt) continue
    const created = new Date(q.createdAt)
    const diffMs = now - created
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    const item = {
      id: q.id,
      text: q.text,
      createdAt: q.createdAt,
      preview: q.text && q.text.length > 50 ? q.text.slice(0,50) + '...' : (q.text || '')
    }

    if (isSameDay(created, now)) {
      sections[0].items.push(item)
    } else if (diffDays === 1) {
      sections[1].items.push(item)
    } else if (diffDays <= 7) {
      sections[2].items.push(item)
    } else if (diffDays <= 30) {
      sections[3].items.push(item)
    }
  }

  return sections
}

// 刷新侧边栏
function refreshSidebar() {
  const qs = loadQuestionsFromStorage()
  qs.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
  sidebarSections.value = buildSectionsFromQuestions(qs)
}

// 跳转到问题详情
function openQuestion(id) {
  if (!id) return
  router.push({ path: `/question/${id}` })
}

// 格式化时间显示
function formatTime(iso) {
  try {
    const d = new Date(iso)
    const now = new Date()
    if (isSameDay(d, now)) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    return d.toLocaleDateString()
  } catch {
    return ''
  }
}

// 监听问题更新事件
function onQuestionsUpdated() {
  refreshSidebar()
}

// 初始化
onMounted(() => {
  checkLoginStatus()
  const sidebarState = localStorage.getItem('sidebarExpanded')
  if (sidebarState) {
    try {
      isSidebarExpanded.value = JSON.parse(sidebarState)
    } catch (e) { isSidebarExpanded.value = false }
  }

  refreshSidebar()
  window.addEventListener('questions-updated', onQuestionsUpdated)
})

// 保存侧边栏展开状态
watch(isSidebarExpanded, (newVal) => {
  localStorage.setItem('sidebarExpanded', JSON.stringify(newVal))
})

// 路由变化时检查登录
watch(() => route.path, () => {
  checkLoginStatus()
})

// 是否已登录
const isLoggedIn = computed(() => !!userStore.user?.username)

// 退出登录
const handleLogout = () => {
  if (confirm('确定要退出登录吗？')) {
    userStore.removeToken()
    userStore.setUser({ username: '', nickname: '', avatar: '' })
    router.push('/login')
  }
}

// 切换侧边栏
const toggleSidebar = () => {
  isSidebarExpanded.value = !isSidebarExpanded.value
}
</script>



<style scoped>
/* 基础样式变量 */
:root {
    --primary: #4c6ef5;
    --primary-light: #eef2ff;
    --light-gray: #f1f5f9;
    --text: #0f172a;
    --text-light: #64748b;
    --accent:#4c6ef5;
    --border:#e6ecff;
    --background: #f8fafc;
    --card: #ffffff;
    --danger: #e53e3e;
}

.records-page {
  padding: 30px;
  min-height: calc(100vh - 44px); /* 减去页脚高度 */
  box-sizing: border-box;
  background-color: var(--background);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 24px;
  color: var(--text);
  margin: 0;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--light-gray);
  color: var(--text);
  border: 1px solid var(--border);
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.back-btn:hover {
  background-color: #e2e8f0;
}

.back-btn .icon {
  width: 18px;
  height: 18px;
}

.records-table-container {
  background-color: var(--card);
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(12, 34, 88, 0.06);
  overflow: hidden;
}

.records-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
}

.records-table th,
.records-table td {
  padding: 15px 20px;
  text-align: left;
  border-bottom: 1px solid var(--border);
}

.records-table th {
  background-color: var(--light-gray);
  font-weight: 600;
  color: var(--text);
}

.content-cell {
  max-width: 400px;
}

.content-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.edit-btn, .delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  margin-right: 8px;
  transition: color 0.2s;
}

.edit-btn .icon {
  width: 18px;
  height: 18px;
  color: var(--primary);
}

.delete-btn .icon {
  width: 18px;
  height: 18px;
  color: var(--danger);
}

.edit-btn:hover .icon {
  color: #3a5bdb;
}

.delete-btn:hover .icon {
  color: #c53030;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-light);
}

.add-first-btn {
  margin-top: 15px;
  background: var(--primary);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

.add-first-btn:hover {
  background-color: #3a5bdb;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .records-page {
    padding: 15px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .records-table-container {
    overflow-x: auto;
  }
}
</style>
   