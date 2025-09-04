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

            <!-- 仅在展开时显示的文字 -->
            <span class="logo-text" v-if="isSidebarExpanded">问心</span>
          </div>

          <!-- 仅在侧边栏折叠时显示的打开按钮 -->
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

          <!-- 新增：开启新对话按钮（折叠状态下显示在打开按钮下方） -->
          <button
            class="new-conversation-btn collapsed"
            @click="startNewConversation"
            aria-label="开启新对话"
            v-if="!isSidebarExpanded"
          >
            <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
            </svg>
            <span class="tooltip">开启新对话</span>
          </button>

          <!-- 侧边栏展开时的头部右侧区域 -->
          <div class="expanded-header" v-if="isSidebarExpanded">
            <!-- 展开状态下的收起按钮 -->
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

            <!-- 展开状态下的开启新对话按钮（位于关闭按钮正下方） -->
            <button
              class="new-conversation-btn expanded"
              @click="startNewConversation"
              aria-label="开启新对话"
            >
              <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
              </svg>
              <span class="tooltip">开启新对话</span>
            </button>
          </div>
        </div>

        <!-- 仅在展开时显示详细内容 -->
        <div class="sidebar-content" v-if="isSidebarExpanded">
          <!-- 加载状态 -->
          <div class="loading" v-if="historyStore.isLoading">
            <p>加载对话历史中...</p>
          </div>
          
          <!-- 错误状态 -->
          <div class="error" v-if="historyStore.error && !historyStore.isLoading">
            <p>加载失败: {{ historyStore.error }}</p>
            <button @click="historyStore.init()">重试</button>
          </div>
          
          <!-- 今天 -->
          <div class="sidebar-section" v-if="historyStore.categorizedConsultations.today.length > 0 && !historyStore.isLoading && !historyStore.error">
            <h4>今天</h4>
            <ul>
              <li
                v-for="(conv, index) in historyStore.categorizedConsultations.today"
                :key="conv.id"
                tabindex="0"
                role="button"
                @click="openQuestion(conv.id)"
              >
                {{ conv.title }}
              </li>
            </ul>
          </div>
          
          <!-- 昨天 -->
          <div class="sidebar-section" v-if="historyStore.categorizedConsultations.yesterday.length > 0 && !historyStore.isLoading && !historyStore.error">
            <h4>昨天</h4>
            <ul>
              <li
                v-for="(conv, index) in historyStore.categorizedConsultations.yesterday"
                :key="conv.id"
                tabindex="0"
                role="button"
                @click="openQuestion(conv.id)"
              >
                {{ conv.title }}
              </li>
            </ul>
          </div>
          
          <!-- 7天内 -->
          <div class="sidebar-section" v-if="historyStore.categorizedConsultations.last7Days.length > 0 && !historyStore.isLoading && !historyStore.error">
            <h4>7天内</h4>
            <ul>
              <li
                v-for="(conv, index) in historyStore.categorizedConsultations.last7Days"
                :key="conv.id"
                tabindex="0"
                role="button"
                @click="openQuestion(conv.id)"
              >
                {{ conv.title }}
              </li>
            </ul>
          </div>
          
          <!-- 30天内 -->
          <div class="sidebar-section" v-if="historyStore.categorizedConsultations.last30Days.length > 0 && !historyStore.isLoading && !historyStore.error">
            <h4>30天内</h4>
            <ul>
              <li
                v-for="(conv, index) in historyStore.categorizedConsultations.last30Days"
                :key="conv.id"
                tabindex="0"
                role="button"
                @click="openQuestion(conv.id)"
              >
                {{ conv.title }}
              </li>
            </ul>
          </div>
          
          <!-- 无记录时显示 -->
          <div class="no-history" v-if="!hasHistory && !historyStore.isLoading && !historyStore.error">
            <p>暂无决策咨询记录</p>
          </div>
        </div>

        <!-- 底部图标区域（预留空间） -->
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
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user.js'
import { useHistoryStore } from '@/stores/history.js'
import { createConversationService } from '@/api/conversation'

// 路由
const router = useRouter()

// Pinia Stores
const userStore = useUserStore()
const historyStore = useHistoryStore()

// 侧边栏状态
const isSidebarExpanded = ref(false)

// 检查是否有历史记录
const hasHistory = computed(() => {
  const cats = historyStore.categorizedConsultations || {};
  return (cats.today?.length || 0) > 0 || 
         (cats.yesterday?.length || 0) > 0 || 
         (cats.last7Days?.length || 0) > 0 || 
         (cats.last30Days?.length || 0) > 0;
})

// 初始化
onMounted(() => {
  // 从API或本地存储加载历史记录
  historyStore.init()
  
  // 加载侧边栏状态
  try {
    const sidebarState = localStorage.getItem('sidebarExpanded')
    if (sidebarState !== null) {
      isSidebarExpanded.value = JSON.parse(sidebarState)
    }
  } catch (e) { 
    console.error('Failed to parse sidebar state:', e)
    isSidebarExpanded.value = false 
  }
  
  console.log('Sidebar initial state:', isSidebarExpanded.value)
})

// 保存侧边栏展开状态
watch(isSidebarExpanded, (newVal) => {
  console.log('Sidebar state changed to:', newVal)
  localStorage.setItem('sidebarExpanded', JSON.stringify(newVal))
})



// 跳转到问题详情
function openQuestion(id) {
  if (!id) return
  router.push({ path: `/question/${id}` })
}

// 新对话
async function startNewConversation() {
  try {
    // 调用API创建新对话
    const response = await createConversationService()
    const { conversation_id } = response.data
    
    // 导航到新对话
    router.push('/').then(() => {
      window.dispatchEvent(new Event('new-conversation'))
    })
  } catch (error) {
    console.error('Failed to create new conversation:', error)
    // 失败时仍导航到首页
    router.push('/').then(() => {
      window.dispatchEvent(new Event('new-conversation'))
    })
  }
}

// 用户状态
const isLoggedIn = computed(() => !!userStore.token)

// 登出处理
const handleLogout = () => {
  if (confirm('确定要退出登录吗？')) {
    userStore.logout() 
    router.push('/login')
  }
}

// 切换侧边栏
const toggleSidebar = () => {
  console.log('Toggling sidebar. Previous state:', isSidebarExpanded.value)
  isSidebarExpanded.value = !isSidebarExpanded.value
  console.log('New sidebar state:', isSidebarExpanded.value)
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
  height: 100vh;         /* 占满视口高度 */
  width: 100%;
  align-items: stretch;
  overflow: hidden;       /* 外层可以保持隐藏，内部主内容滚动 */
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

/* 打开侧边栏按钮 */
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

/* 开启新对话按钮 - 折叠状态 */
.new-conversation-btn.collapsed {
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
  margin-bottom: 8px;
  width: 40px;
  height: 40px;
}

.new-conversation-btn.collapsed:hover {
  background-color: rgba(76,110,245,0.06);
}

/* 展开状态下的按钮容器 */
.expanded-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 8px;
  margin-top: 8px;
}

/* 开启新对话按钮 - 展开状态 */
.new-conversation-btn.expanded {
  background: none;
  color: var(--accent);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border-radius: 6px;
  position: relative;
  width: 40px;
  height: 40px;
}

.new-conversation-btn.expanded:hover {
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
  justify-content: center;
  padding: 10px;
  border-radius: 6px;
  position: relative;
  width: 40px;
  height: 40px;
}

.close-sidebar-btn:hover {
  background-color: rgba(76,110,245,0.06);
}

/* 图标尺寸 */
.open-sidebar-btn .icon, 
.close-sidebar-btn .icon,
.new-conversation-btn .icon {
  width: 20px;
  height: 20px;
  display: block;
}

.icon-btn .icon {
  width: 24px;
  height: 24px;
  display: block;
}

/* 侧边栏内容（只有展开时显示） */
.sidebar-content {
  padding: 14px;
  flex: 1;
  overflow-y: auto;        /* 侧边栏列表允许滚动 */
  margin-top: 16px;
}

/* 加载和错误状态 */
.loading, .error {
  padding: 15px;
  text-align: center;
  color: var(--muted);
}

.error button {
  margin-top: 10px;
  background-color: var(--accent);
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}

/* 小节标题与项 */
.sidebar-section { margin-bottom: 22px; }
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

/* 底部图标区域（预留空间） */
.sidebar-footer {
  padding: 12px;
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  margin-top: auto;
}

/* 单个 icon 按钮：图标居中 */
.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 10px;
  width: 100%;
  border-radius: 8px;
  position: relative;
  color: inherit;
}

/* 悬停效果 */
.icon-btn:hover { background-color: rgba(76,110,245,0.06); }

/* 登出使用危险色 */
.logout-btn { color: var(--danger); }

/* tooltip（靠右显示） */
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

/* logo 专用 tooltip */
.logo-tooltip { left: calc(100% + 8px); }

/* hover/focus 显示 tooltip */
.logo-btn:hover .logo-tooltip,
.open-sidebar-btn:hover .tooltip,
.close-sidebar-btn:hover .tooltip,
.icon-btn:hover .tooltip,
.new-conversation-btn:hover .tooltip,
.logo-btn:focus .logo-tooltip,
.open-sidebar-btn:focus .tooltip,
.close-sidebar-btn:focus .tooltip,
.icon-btn:focus .tooltip,
.new-conversation-btn:focus .tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateY(-50%) translateX(2px);
}

/* 主内容区域：允许滚动 */
.main-content {
  flex: 1;
  min-height: 0;          /* 关键：让 flex 子项可收缩以出现滚动条 */
  overflow: auto;         
  transition: margin-left var(--transition-speed) cubic-bezier(.2,.9,.2,1);
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 10;
}

/* 显示滚动条 */
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(15, 23, 42, 0.25); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: rgba(15, 23, 42, 0.35); }

/* 路由视图占位 */
router-view {
  display:block;
  width:100%;
  flex: 1;                /* 填满主内容区域 */
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
