<template>   
  <div id="app" :class="{ 'sidebar-expanded': isSidebarExpanded }">
    <div class="app-container">
      <!-- 侧边栏 -->
      <aside class="sidebar" :aria-expanded="isSidebarExpanded">
        <!-- 侧边栏顶部区域 -->
        <div class="sidebar-header">
          <!-- LOGO 区域（始终显示 logo） -->
          <div class="logo-area" role="banner">
            <button
              class="logo-btn"
              @click="$router.push('/')"
              aria-label="问心"
            >
              <img 
                src="/favicon.png" 
                alt="问心 logo" 
                class="logo"
              />
              <!-- logo hover tooltip（折叠时仍可显示） -->
              <span class="tooltip logo-tooltip">问心</span>
            </button>

            <!-- 仅在展开时显示的文字（和你要求一致） -->
            <span class="logo-text" v-if="isSidebarExpanded">问心</span>
          </div>

          <!-- 仅在侧边栏折叠时显示的打开按钮（保留原行为） -->
          <button
            class="open-sidebar-btn"
            @click="toggleSidebar"
            :aria-label="isSidebarExpanded ? '收起边栏' : '打开边栏'"
            v-if="!isSidebarExpanded"
          >
            <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" fill="currentColor"/>
            </svg>
            <span class="tooltip">打开边栏</span>
          </button>

          <!-- 侧边栏展开时的头部右侧的收起按钮 -->
          <div class="expanded-header" v-if="isSidebarExpanded">
            <button
              class="close-sidebar-btn"
              @click="toggleSidebar"
              :aria-label="isSidebarExpanded ? '收起边栏' : '打开边栏'"
            >
              <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
              </svg>
              <span class="tooltip">收起边栏</span>
            </button>
          </div>
        </div>

        <!-- 仅在展开时显示详细内容 -->
        <div class="sidebar-content" v-if="isSidebarExpanded">
          <div class="sidebar-section" v-for="(section, sIdx) in sidebarSections" :key="sIdx">
            <h4>{{ section.title }}</h4>
            <ul>
              <li
                v-for="(item, itemIndex) in section.items"
                :key="itemIndex"
                tabindex="0"
                :role="item && item.id ? 'button' : undefined"
                @click="item && item.id ? openQuestion(item.id) : null"
              >
                <!-- 如果 item 是字符串（老数据），保持原样显示；否则显示 preview -->
                <template v-if="typeof item === 'string'">
                  {{ item }}
                </template>
                <template v-else>
                  {{ item.preview || item.text }}
                </template>
              </li>
              <li v-if="!section.items.length" class="empty">（暂无）</li>
            </ul>
          </div>
        </div>

        <!-- 底部图标区域 -->
        <div class="sidebar-footer" role="navigation" aria-label="Sidebar actions">
          <button
            class="icon-btn"
            @click="$router.push('/profile')"
            v-if="isLoggedIn"
            aria-label="个人信息"
          >
            <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3 1.34-3 3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill="currentColor"/>
            </svg>
            <span class="tooltip">个人信息</span>
          </button>

          <button
            class="icon-btn logout-btn"
            @click="handleLogout"
            v-if="isLoggedIn"
            aria-label="退出登录"
          >
            <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11c1.56.1 2.78 1.41 2.78 2.96 0 1.65-1.35 3-3 3z" fill="currentColor"/>
            </svg>
            <span class="tooltip">退出登录</span>
          </button>
        </div>
      </aside>

      <!-- 主内容区域 -->
      <main class="main-content">
        <router-view/>

        <footer class="footer">© 问心 · 本地演示版</footer>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 用户信息
const currentUser = ref({
  username: '',
  nickname: '',
  avatar: ''
})

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

// 检查登录状态并更新用户信息
const checkLoginStatus = () => {
  const savedUser = localStorage.getItem('user')
  if (savedUser) {
    try {
      currentUser.value = JSON.parse(savedUser)
    } catch (e) {
      currentUser.value = { username: '', nickname: '', avatar: '' }
    }
  } else {
    currentUser.value = { username: '', nickname: '', avatar: '' }
  }
}

// 读取问题（localStorage，后续可替换为后端 fetch）
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

// 刷新侧边栏（从存储读取并按时间排序分组）
function refreshSidebar() {
  const qs = loadQuestionsFromStorage()
  qs.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
  sidebarSections.value = buildSectionsFromQuestions(qs)
}

// 跳转到问题详情（Home 或 Question 页面会读取 route.params.id 并显示回答）
function openQuestion(id) {
  if (!id) return
  router.push({ path: `/question/${id}` })
}

// 格式化时间显示（在侧边栏可用）
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

// 监听问题更新事件（例如 Home 保存问题时触发）
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

  // 初次加载侧边栏问题
  refreshSidebar()
  // 监听跨窗口/组件更新
  window.addEventListener('questions-updated', onQuestionsUpdated)
})

// 保存侧边栏展开状态
watch(isSidebarExpanded, (newVal) => {
  localStorage.setItem('sidebarExpanded', JSON.stringify(newVal))
})

// 路由变化时检查登录（保留原逻辑）
watch(() => route.path, () => {
  checkLoginStatus()
})

// 是否已登录
const isLoggedIn = computed(() => {
  return !!currentUser.value.username
})

// 退出登录
const handleLogout = () => {
  if (confirm('确定要退出登录吗？')) {
    localStorage.removeItem('user')
    currentUser.value = { username: '', nickname: '', avatar: '' }
    router.push('/login')
  }
}

// 切换侧边栏
const toggleSidebar = () => {
  isSidebarExpanded.value = !isSidebarExpanded.value
}
</script>

<style scoped>
:root{
  --bg:#f6f8fb;
  --card:#fff;
  --accent:#4c6ef5;
  --muted:#6b7280;
  --border:#e6ecff;
  --danger:#e53e3e;

  /* 折叠和展开宽度 */
  --sidebar-width: 60px;
  --sidebar-expanded-width: 280px;
  --transition-speed: 0.28s;
  --shadow: 0 6px 18px rgba(16,24,40,0.04);
}

/* 全局重置 */
*{ box-sizing:border-box; margin:0; padding:0; }
html,body,#app{ height:100%; width:100%; }
#app{ min-height:100vh; background:var(--bg); font-family:Inter, "Helvetica Neue", Arial, sans-serif; color:#0f172a; }

/* 布局容器：侧边栏 + 主内容 并列 */
.app-container {
  display: flex;
  height: 100vh;
  width: 100%;
  align-items: stretch;
  overflow: hidden;
}

/* 侧边栏 */
.sidebar {
  width: var(--sidebar-width);
  background: var(--card);
  box-shadow: var(--shadow);
  transition: width var(--transition-speed) cubic-bezier(.2,.9,.2,1);
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border);
  /* 关键：允许 tooltip 超出侧边栏且不被主内容覆盖 */
  overflow: visible;
  position: relative;
  z-index: 30;
}

/* 展开宽度 */
#app.sidebar-expanded .sidebar {
  width: var(--sidebar-expanded-width);
}

/* 头部：logo + 切换按钮 */
.sidebar-header {
  display:flex;
  flex-direction: column;
  align-items:center;
  padding: 12px 0;
  height: auto;
  border-bottom: 1px solid var(--border);
  background: linear-gradient(180deg, rgba(255,255,255,0.6), transparent);
}

/* LOGO 区域（始终显示 logo） */
.logo-area {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  justify-content: center;
  padding: 6px 8px;
}

/* logo 按钮（用于悬停 tooltip） */
.logo-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 40px;
  height: 40px;
}

/* LOGO 大小 */
.logo {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

/* 展开时的文字（仅展开时显示） */
.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-left: 6px;
}

/* 打开侧边栏按钮（在logo下方） */
.open-sidebar-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border-radius: 6px;
  position: relative;
  margin: 8px 0 6px 0;
}

.open-sidebar-btn:hover {
  background-color: rgba(76,110,245,0.06);
}

/* 关闭侧边栏按钮（在右侧） */
.close-sidebar-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--accent);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px;
  border-radius: 6px;
  position: relative;
}

.close-sidebar-btn:hover {
  background-color: rgba(76,110,245,0.06);
}

/* 图标尺寸 - 保持你之前的增大设置 */
.open-sidebar-btn .icon, 
.close-sidebar-btn .icon {
  width: 20px;
  height: 20px;
  display: block;
}

.icon-btn .icon {
  width: 24px;  /* 增大图标尺寸 */
  height: 24px; /* 增大图标尺寸 */
  display: block;
}

/* 侧边栏内容（只有展开时显示） */
.sidebar-content {
  padding: 14px;
  flex: 1;
  overflow-y: auto;
}

/* 小节标题与项 */
.sidebar-section {
  margin-bottom: 22px;
}
.sidebar-section h4 {
  color: var(--muted);
  font-size: 13px;
  margin-bottom: 8px;
  letter-spacing: 0.6px;
  text-transform: uppercase;
}
.sidebar-section ul { list-style:none; padding:0; margin:0; }
.sidebar-section li {
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.18s;
}
.sidebar-section li:hover {
  background-color: rgba(76,110,245,0.06);
}

/* 底部图标区域 */
.sidebar-footer {
  padding: 12px;
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 12px;  /* 增加间距 */
  align-items: center;  /* 居中对齐 */
  margin-top: auto;
}

/* 单个 icon 按钮：图标居中 */
.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;  /* 居中显示 */
  gap: 10px;
  padding: 10px;
  width: 100%;
  border-radius: 8px;
  position: relative;
  color: inherit;
}

/* 悬停效果 */
.icon-btn:hover {
  background-color: rgba(76,110,245,0.06);
}

/* 登出使用危险色 */
.logout-btn { color: var(--danger); }

/* tooltip（靠右显示）——始终隐藏文本直到 hover */
/* logo tooltip 使用同样样式，但 z-index 更高，避免被遮挡 */
.tooltip {
  position: absolute;
  left: calc(100% + 10px);
  top: 50%;
  transform: translateY(-50%);
  background-color: #111827;
  color: white;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 13px;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.14s ease, transform 0.14s ease;
  z-index: 9999;
}

/* logo 专用 tooltip（若需要微调样式可以只改这里） */
.logo-tooltip { left: calc(100% + 8px); }

/* 当 hover 时显示 tooltip（支持键盘 focus） */
.logo-btn:hover .logo-tooltip,
.open-sidebar-btn:hover .tooltip,
.close-sidebar-btn:hover .tooltip,
.icon-btn:hover .tooltip,
.logo-btn:focus .logo-tooltip,
.open-sidebar-btn:focus .tooltip,
.close-sidebar-btn:focus .tooltip,
.icon-btn:focus .tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateY(-50%) translateX(2px);
}

/* 主内容区域：降低 z-index，避免覆盖 sidebar tooltip */
.main-content {
  flex: 1;
  height: 100vh;
  overflow: auto;
  transition: margin-left var(--transition-speed) cubic-bezier(.2,.9,.2,1);
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 10;
}

/* 路由视图占位 */
router-view {
  display:block;
  width:100%;
  flex: 1;
  padding: 20px;
}

/* 页脚固定在主内容底部 */
.footer {
  height:44px;
  display:flex;
  align-items:center;
  justify-content:center;
  color:var(--muted);
  font-size:13px;
  border-top:1px solid var(--border);
  padding: 0 20px;
  background: linear-gradient(0deg, rgba(255,255,255,0.6), transparent);
}

/* 小屏幕调整 */
@media (max-width: 900px) {
  :root { --sidebar-expanded-width: 240px; }
  .sidebar { width: var(--sidebar-width); }
  #app.sidebar-expanded .sidebar { width: var(--sidebar-expanded-width); }
}
</style>


