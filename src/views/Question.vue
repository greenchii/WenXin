<template>
  <div class="question-detail">
    <div class="header">
      <h1>{{ conversation?.title || '对话详情' }}</h1>
      
    </div>

    <div class="loading" v-if="isLoading">
      <p>加载对话详情中...</p>
    </div>

    <div class="error" v-if="error && !isLoading">
      <p>加载失败: {{ error }}</p>
      <button @click="loadConversation()">重试</button>
    </div>

    <div class="conversation-container" v-if="conversation && !isLoading && !error">
      <div
        class="message-row"
        v-for="(item, index) in displayedMessages"
        :key="item.id || index"
        :class="isUserMessage(item) ? 'user' : 'assistant'"
      >
        <div class="avatar" :class="isUserMessage(item) ? 'user' : 'assistant'" 
             :title="isUserMessage(item) ? '您' : '问心助手'"></div>

        <div class="message-block">
          <div class="name" :class="isUserMessage(item) ? 'user' : 'assistant'">
            {{ isUserMessage(item) ? '您' : '问心助手' }}
          </div>

          <div class="bubble" :class="isUserMessage(item) ? 'user' : 'assistant'">
            <!-- message-content 使用 v-html 渲染安全处理后的字符串 -->
            <div class="message-content" v-html="formatContent(item.content)"></div>

            <div v-if="isSaveHint(item)" class="save-hint">
              <small>（检测到可保存的信息，您可以点击“保存”以保留该条信息）</small>
            </div>
          </div>

          <!-- 新增：复制 & 保存 操作按钮（显示在时间上方、靠右） -->
          <MessageActions :message="item" :conv-id="conversationId" />

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

    <div class="follow-up" v-if="conversation && !isLoading && !error">
      <textarea
        v-model="followUpText"
        placeholder="输入您的追问...（不超过150字，按 Enter 发送，可 Shift+Enter 换行）"
        @keydown.enter.exact.prevent="sendFollowUp"
        :maxlength="MAX_CHARS"
      ></textarea>

      <!-- follow-actions: 竖直堆叠（计数在上，发送按钮在下）-->
      <div class="follow-actions">
        <button @click="sendFollowUp" class="send-btn">发送</button>
        <small class="remaining">{{ remainingChars }} 字可输入</small>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHistoryStore } from '@/stores/history.js'
import dayjs from 'dayjs'
import MessageActions from '@/components/MessageActions.vue'  // <-- 新增 import

const route = useRoute()
const router = useRouter()
const historyStore = useHistoryStore()

const conversation = ref(null)
const followUpText = ref('')
const isLoading = ref(false)
const error = ref(null)
const MAX_CHARS = 150
const conversationId = computed(() => route.params.id)

const displayedMessages = computed(() => {
  if (!conversation.value) return []
  if (Array.isArray(conversation.value.messages) && conversation.value.messages.length) {
    return conversation.value.messages
  }
  if (Array.isArray(conversation.value.info_items)) {
    return conversation.value.info_items.map((it, idx) => ({
      id: it.id ?? `info-${idx}`,
      role: it.role ?? 'assistant',
      content: it.content || it.description || it.title || '',
      created_at: it.created_at
    }))
  }
  return []
})

const remainingChars = computed(() => Math.max(0, MAX_CHARS - (followUpText.value ? followUpText.value.length : 0)))

const formatTime = (timestamp) => timestamp ? dayjs(timestamp).format('YYYY-MM-DD HH:mm') : ''

const isUserMessage = (message) => {
  if (!message) return false
  const role = (message.role || message.sender || '').toString().toLowerCase()
  return role === 'user' || role === 'client' || role === 'me' || role === 'you' ? true : false
}

const isSaveHint = (message) => {
  if (!message) return false
  if (message.save_hint === true) return true
  const text = (message.content || '').toString()
  return /保存|是否需要保存|需要保存/.test(text)
}

// 安全转义并保守处理空格：不要生成长串不可换行的 &nbsp;
function escapeHtml(str) {
  if (str == null) return ''
  return str.toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// 重要：只做最保守的空格处理（避免长串 &nbsp;），并把换行转为 <br/>
function formatContent(raw) {
  const s = escapeHtml(raw)
  // 将两个连续空格 -> ' &nbsp;' （避免大量不可断行空格）
  const withSpaces = s.replace(/ {2,}/g, (m) => {
    const extra = Math.min(m.length - 1, 2)
    return ' ' + '&nbsp;'.repeat(extra)
  })
  return withSpaces.replace(/\n/g, '<br/>')
}

async function loadConversation() {
  if (!conversationId.value) { conversation.value = null; return }
  try {
    isLoading.value = true; error.value = null
    let conv = historyStore.getConversationById(conversationId.value)
    if (!conv || !(conv.messages && conv.messages.length)) {
      try { conv = await historyStore.fetchConversationDetail(conversationId.value) } catch (e) { if (!conv) throw e }
    }
    conversation.value = conv
  } catch (e) {
    console.error('Failed to load conversation:', e)
    error.value = e?.message || '加载对话失败'
    conversation.value = null
  } finally { isLoading.value = false }
}

async function sendFollowUp() {
  const text = (followUpText.value || '').trim()
  if (!text || !conversationId.value) return
  if (text.length > MAX_CHARS) { alert(`输入超过 ${MAX_CHARS} 字，请缩短后再发送`); return }
  try {
    isLoading.value = true
    await historyStore.sendMessage(conversationId.value, text)
    followUpText.value = ''
    conversation.value = historyStore.getConversationById(conversationId.value)
    if (!conversation.value || !(conversation.value.messages && conversation.value.messages.length)) {
      await loadConversation()
    }
  } catch (e) {
    console.error('Failed to send follow up:', e)
    alert('发送失败，请稍后重试')
  } finally { isLoading.value = false }
}

function goToHome() { router.push('/') }

onMounted(() => { loadConversation() })

watch(() => conversationId.value, () => { loadConversation() })
</script>

<style src="../style/Question.css" ></style>




