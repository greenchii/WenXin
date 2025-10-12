<template>
  <div class="conversation-area">
    <!-- 初始提示 -->
    <div class="initial-hint" v-if="!conversationHistory || conversationHistory.length === 0">
      欢迎使用问心助手！请输入您想记录的事项或需要咨询的问题...
    </div>
    
    <!-- 消息列表 -->
    <div v-else class="messages-scroll" ref="scrollContainer">
      <div 
        v-for="(msg, index) in conversationHistory" 
        :key="msg.id || index"
        class="message-container"
        :class="{ 'user-message-container': msg.isUser }"
      >
        <!-- 助手消息 -->
        <template v-if="!msg.isUser">
          <div class="message-avatar">
            <img 
              :src="avatarConfig.assistant.src" 
              :alt="avatarConfig.assistant.alt"
              @error="handleImageError('assistant')"
            >
          </div>

          <div class="message-block">
            <div class="message-content assistant-message" v-html="formatMessageContent(msg.content)">
            </div>

            <!-- 操作按钮放在气泡外 -->
            <MessageActions :message="msg" :conv-id="conversationId" />
          </div>
        </template>

        <!-- 用户消息 -->
        <template v-else>
          <div class="message-block user-message-block">
            <div class="message-content user-message">
              {{ msg.content }}
            </div>

            <!-- 操作按钮放在气泡外 -->
            <MessageActions :message="msg" :conv-id="conversationId" />
          </div>

          <div class="message-avatar">
            <img 
              :src="avatarConfig.user.src" 
              :alt="avatarConfig.user.alt"
              @error="handleImageError('user')"
            >
          </div>
        </template>
      </div>

      <!-- loading indicator: 当 store 正在加载且这是当前会话时，在消息列表底部显示三个动态点 -->
      <div v-if="shouldShowLoadingIndicator" class="message-container assistant loading-row">
        <div class="message-avatar">
          <img 
            :src="avatarConfig.assistant.src" 
            :alt="avatarConfig.assistant.alt"
            @error="handleImageError('assistant')"
          >
        </div>
        <div class="message-block">
          <div class="message-content assistant-message loading-bubble">
            <LoadingDots />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, ref, onMounted, watch, nextTick, computed } from 'vue'
import MessageActions from '@/components/MessageActions.vue'
import LoadingDots from '@/components/second/LoadingDots.vue'
import { useHistoryStore } from '@/stores/history.js'

const props = defineProps({
  conversationHistory: {
    type: Array,
    default: () => []
  },
  avatarConfig: {
    type: Object,
    default: () => ({
      user: { src: '', alt: '用户头像' },
      assistant: { src: '', alt: '助手头像' }
    })
  },
  conversationId: { type: [String, Number, null], default: null }
})

const historyStore = useHistoryStore()
const scrollContainer = ref(null)

// 当 conversationHistory 更新时自动滚动到底部（保留用户滚动习惯：当用户在底部则自动滚动）
onMounted(() => {
  scrollToBottom()
})

watch(() => props.conversationHistory.length, async () => {
  // 等待渲染再滚动
  await nextTick()
  scrollToBottom()
})

function scrollToBottom() {
  try {
    const el = scrollContainer.value
    if (!el) return
    // 只有当滚动接近底部时自动滚动，以免覆盖用户读旧消息
    const nearBottom = (el.scrollHeight - el.clientHeight - el.scrollTop) < 80
    if (nearBottom || el.scrollTop === 0) {
      el.scrollTop = el.scrollHeight
    }
  } catch (e) {
    console.warn('scrollToBottom failed', e)
  }
}

// 处理图片加载失败（可扩展）
const handleImageError = (type) => {
  console.warn(`${type}头像加载失败，使用默认头像`)
}

// 简单的 HTML 转义与换行处理（避免长不可换行字符串）
function formatMessageContent(raw) {
  if (raw == null) return ''
  const s = raw.toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  const withSpaces = s.replace(/ {2,}/g, (m) => {
    const extra = Math.min(m.length - 1, 2)
    return ' ' + '&nbsp;'.repeat(extra)
  })
  return withSpaces.replace(/\n/g, '<br/>')
}

/*
  显示 loading 的逻辑：
  - 仅当 historyStore.isLoading 为 true（表示正在拉取/生成回复）
  - 且 当前 store 的 currentConversationId 等于传入的 conversationId（仅在当前活动会话显示）
*/
const shouldShowLoadingIndicator = computed(() => {
  if (!historyStore) return false
  if (!historyStore.isLoading) return false
  // 仅在当前会话才展示
  if (!props.conversationId) return false
  return `${historyStore.currentConversationId}` === `${props.conversationId}`
})
</script>

<style>
@import '@/style/conversation.css';

/* 让对话区自身拥有滚动条与高度（在 Home 的布局中，父容器会决定最终高度）*/
.messages-scroll {
  max-height: calc(100vh - 220px); /* 经验值：按需调整 */
  overflow-y: auto;
  padding: 12px;
}

/* loading row 的样式：让 LoadingDots 看起来像在气泡内 */
.loading-row .loading-bubble {
  display: inline-block;
  padding: 8px 12px;
  border-radius: 12px;
  background: #f3f4f6;
  min-width: 60px;
  text-align: center;
}

/* 如果需要，可微调 avatar 与 bubble 对齐 */
.message-container.loading-row .message-avatar img {
  width: 36px;
  height: 36px;
}

/* 初始提示样式 */
.initial-hint {
  color: #999;
  text-align: center;
  padding: 40px 20px;
  font-size: 14px;
}
</style>




