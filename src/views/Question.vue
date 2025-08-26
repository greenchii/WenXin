<template>
  <div class="question-detail">
    <div class="header">
      <button class="back-btn" @click="goToHome">
        <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor"/>
        </svg>
        返回首页
      </button>
      <h1>{{ conversation?.title || '对话详情' }}</h1>
    </div>

    <!-- 加载状态 -->
    <div class="loading" v-if="isLoading">
      <p>加载对话详情中...</p>
    </div>

    <!-- 错误状态 -->
    <div class="error" v-if="error && !isLoading">
      <p>加载失败: {{ error }}</p>
      <button @click="loadConversation()">重试</button>
    </div>

    <div class="conversation-container" v-if="conversation && !isLoading && !error">
      <div
        class="message-row"
        v-for="(item, index) in conversation.info_items || []"
        :key="item.id || index"
        :class="isUserMessage(index) ? 'user' : 'assistant'"
      >
        <!-- 头像 -->
        <div class="avatar" :class="isUserMessage(index) ? 'user' : 'assistant'" 
             :title="isUserMessage(index) ? '您' : '问心助手'"></div>

        <!-- 气泡与名字与时间包装 -->
        <div class="message-block">
          <!-- 名称 -->
          <div class="name" :class="isUserMessage(index) ? 'user' : 'assistant'">
            {{ isUserMessage(index) ? '您' : '问心助手' }}
          </div>

          <!-- 气泡内容 -->
          <div class="bubble" :class="isUserMessage(index) ? 'user' : 'assistant'">
            <div class="message-content">
              {{ item.content }}
            </div>
          </div>

          <!-- 时间 -->
          <div class="time">
            {{ formatTime(item.created_at) }}
          </div>
        </div>
      </div>
    </div>

    <div class="empty-state" v-if="!conversation && !isLoading && !error">
      <p>未找到对话记录</p>
      <button @click="$router.push('/')" class="new-conversation-btn">
        开始新对话
      </button>
    </div>

    <!-- 追问区域 -->
    <div class="follow-up" v-if="conversation && !isLoading && !error">
      <textarea
        v-model="followUpText"
        placeholder="输入您的追问...（按 Enter 发送，可 Shift+Enter 换行）"
        @keydown.enter.exact.prevent="sendFollowUp"
      ></textarea>
      <button @click="sendFollowUp" class="send-btn">发送</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHistoryStore } from '@/stores/history.js'
import dayjs from 'dayjs'

// 路由 & store
const route = useRoute()
const router = useRouter()
const historyStore = useHistoryStore()

// 本地响应式状态
const conversation = ref(null)
const followUpText = ref('')
const isLoading = ref(false)
const error = ref(null)

// 响应路由 id
const conversationId = computed(() => route.params.id)

// 判断消息是否为用户发送（简单判断：奇数索引为用户，偶数为助手）
const isUserMessage = (index) => {
  return index % 2 === 0; // 用户消息在偶数位置（0, 2, 4...）
}

// 时间格式化
const formatTime = (timestamp) => {
  if (!timestamp) return ''
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm')
}

// 加载并设置当前对话
async function loadConversation() {
  if (!conversationId.value) {
    conversation.value = null
    return
  }

  try {
    isLoading.value = true
    error.value = null
    
    // 先尝试从本地获取
    let conv = historyStore.getConversationById(conversationId.value)
    
    // 如果本地没有，从API获取
    if (!conv) {
      conv = await historyStore.fetchConversationDetail(conversationId.value)
    }
    
    conversation.value = conv
  } catch (e) {
    console.error('Failed to load conversation:', e)
    error.value = e.message || '加载对话失败'
    conversation.value = null
  } finally {
    isLoading.value = false
  }
}

// 发送追问
function sendFollowUp() {
  const text = (followUpText.value || '').trim()
  if (!text || !conversationId.value) return

  const userMsg = {
    info_type: 'text',
    title: '用户追问',
    description: '用户的追问内容',
    content: text,
    created_at: dayjs().format()
  }

  try {
    historyStore.addMessage(conversationId.value, userMsg)
    
    // 清空输入框
    followUpText.value = ''
    
    // 重新加载对话
    setTimeout(() => {
      conversation.value = historyStore.getConversationById(conversationId.value)
      
      // 模拟AI回复
      setTimeout(() => {
        historyStore.addMessage(
          conversationId.value, 
          {
            info_type: 'text',
            title: '问心回复',
            description: '问心助手的回复',
            content: "这是问心助手的回复。在实际应用中，这里会显示大模型生成的智能回答。",
          }
        )
        conversation.value = historyStore.getConversationById(conversationId.value)
      }, 1000)
    }, 50)
  } catch (e) {
    console.error('Failed to add message:', e)
  }
}

// 返回首页的方法
function goToHome() {
  router.push('/')
}

// 初始化
onMounted(() => {
  loadConversation()
})

// 监听路由 id 的变化
watch(
  () => conversationId.value,
  () => {
    loadConversation()
  }
)
</script>

<style src="../style/Question.css" ></style>

