<template>
  <div class="home-container">
    <div class="content-grid">
      <!-- 左侧列：问心助手 -->
      <div class="left-column">
        <AssistantPanel
        :inputText="inputText"
        @update:inputText="inputText = $event"
        :files="files"
        @update:files="files = $event"
        :askType="askType"
        @update:askType="askType = $event"
        :conversationHistory="conversationHistory"
        :conversationId="currentConvId"
        @submit="submitInput"
        :avatarConfig="avatarConfig"
        />
      </div>

      <!-- 右侧列：信息分类 -->
      <div class="right-column">
        <RightPanel
          v-model:selectedTag="selectedTag"
          :previewItems="previewItems"
          @removeRecord="removeRecord"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import '@/style/Home.css'
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import { useUserStore } from '@/stores/user'
import { useHistoryStore } from '@/stores/history'
import AssistantPanel from '@/components/AssistantPanel.vue'
import RightPanel from '@/components/RightPanel.vue'
import { uploadInfoService, uploadMixedInfoService } from '@/api/conversation'

const userStore = useUserStore()
const historyStore = useHistoryStore()
const isUser = !!userStore.token

// 响应式变量定义
const inputText = ref('')
const files = ref([])
const askType = ref('record')
const selectedTag = ref(null)
const previewItems = ref([])

// 会话 id：来自 historyStore.currentConversationId（可为 null）
const currentConvId = computed(() => historyStore.currentConversationId || null)

// 本地显示的 conversationHistory（用来渲染 Home 的对话框）——从 store 派生
const conversationHistory = computed(() => {
  const conv = historyStore.getConversationById(currentConvId.value)
  if (!conv) return []
  const raw = Array.isArray(conv.messages) ? conv.messages : (Array.isArray(conv.info_items) ? conv.info_items : [])
  return raw.map(m => ({
    id: m.id,
    role: (m.role || 'assistant'),
    isUser: (m.role === 'user'),
    type: m.role === 'user' ? 'user' : 'consult',
    content: m.content || m.description || m.title || '',
    timestamp: dayjs(m.created_at || m.created_at).format()
  }))
})

const avatarConfig = ref({
  user: {
    src: "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='12' fill='%23e6e9ef'/%3E%3Cg fill='%23111'%3E%3Ccircle cx='12' cy='8' r='3'/%3E%3Cpath d='M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6H4z'/%3E%3C/g%3E%3C/svg%3E",
    alt: "用户头像"
  },
  assistant: {
    src: "/favicon.png",
    alt: "问心助手头像"
  }
})

// 处理提交：如果已存在 currentConversationId，则在该会话追加；否则创建（仅在首次使用或用户点击新会话时）
const submitInput = async () => {
  if (!isUser) {
    // 若未登录，确保有会话并显示提示
    const tmpConv = historyStore.currentConversationId || await historyStore.createConversation('新对话')
    historyStore.addMessage(tmpConv, {
      id: `local-${Date.now()}`,
      role: 'assistant',
      content: '请先登录再提交信息',
      created_at: dayjs().format()
    })
    return
  }
  if (!inputText.value.trim() && files.value.length === 0) return

  try {
    const userInputContent = inputText.value.trim()
    const currentTime = dayjs().format()

    // 确保存在 active conversation（不会重复 select）
    let convId = historyStore.currentConversationId
    if (!convId) {
      convId = await historyStore.getOrCreateActiveConversation()
      // getOrCreateActiveConversation 已经会把 currentConversationId 设好
    }

    if (askType.value === 'record') {
      // 对于记录类型：先上传数据，然后获取AI回复
      
      // 上传文件/文本
      const formData = new FormData()
      formData.append('conversation_id', convId)
      if (userInputContent) formData.append('text', userInputContent)
      if (files.value.length > 0) formData.append('file', files.value[0])

      if (files.value.length > 0 && userInputContent) {
        await uploadMixedInfoService(formData)
      } else {
        await uploadInfoService({
          conversation_id: convId,
          file: files.value[0] || null,
          text: userInputContent || null
        })
      }

      // 使用sendMessage获取问心助手的AI回复
      await historyStore.sendMessage(convId, userInputContent)

    } else if (askType.value === 'consult') {
      // 对于咨询（追问）：不要在这里重复 addMessage，
      // 由 store.sendMessage 负责本地加入 user 消息并触发后续 fetch。
      await historyStore.sendMessage(convId, userInputContent)

      // sendMessage 内部会 fetchConversationDetail，因此直接从 store 获取最新 messages 来更新本地显示（如果需要）
      const rawMessages = historyStore.getConversationById(convId)?.messages || []
      conversationHistory.value = rawMessages.map(m => ({
         role: m.role,
         isUser: m.role === 'user',
         type: m.role === 'user' ? askType.value : 'reply',
         content: m.content,
         timestamp: dayjs(m.created_at).format(),
         id: m.id,
         convId
      }))
    }

    // 清空输入
    inputText.value = ''
    files.value = []
  } catch (e) {
    console.error('提交失败：', e)
    // 若发生错误，尽量向当前会话推一个错误提示
    const convId = historyStore.currentConversationId || await historyStore.getOrCreateActiveConversation()
    historyStore.addMessage(convId, {
      id: `local-error-${Date.now()}`,
      role: 'assistant',
      content: '提交失败，请稍后再试',
      created_at: dayjs().format()
    })
  }
}

// helper：移除右侧记录
const removeRecord = (id) => {
  previewItems.value = previewItems.value.filter(item => item.id !== id)
}

// 当 App.vue 发出 new-conversation 事件时，切换 currentConversationId（确保主页使用到新的会话）
onMounted(() => {
  window.addEventListener('new-conversation', (e) => {
    const newId = e?.detail?.convId
    if (newId) {
      historyStore.selectConversation(newId)
    } else {
      // 如果没有传 id，尝试选取最近
      const recent = historyStore.recentConversations?.[0]?.id
      if (recent) historyStore.selectConversation(recent)
    }
  })
})
</script>

<style src="@/style/Home.css"></style>








