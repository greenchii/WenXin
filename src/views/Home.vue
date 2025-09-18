<template>
  <div class="home-container">
    <div class="content-grid">
      <!-- 左侧列：问心助手 -->
      <AssistantPanel
        :inputText="inputText"
        @update:inputText="inputText = $event"
        :files="files"
        @update:files="files = $event"
        :askType="askType"
        @update:askType="askType = $event"
        :conversationHistory="conversationHistory"
        @submit="submitInput"
        :avatarConfig="avatarConfig"
      />

      <!-- 右侧列：信息分类 -->
      <RightPanel
        v-model:selectedTag="selectedTag"
        :previewItems="previewItems"
        @removeRecord="removeRecord"
      />
    </div>
  </div>
</template>

<script setup>
import '@/style/Home.css'
import { ref } from 'vue'
import dayjs from 'dayjs'
import { useUserStore } from '@/stores/user'
import { useHistoryStore } from '@/stores/history'
import AssistantPanel from '@/components/AssistantPanel.vue'
import RightPanel from '@/components/RightPanel.vue'
import { uploadInfoService, uploadMixedInfoService } from '@/api/conversation'

const userStore = useUserStore()
const historyStore = useHistoryStore()
const isUser = !!userStore.token

// 响应式变量定义（移除了可能的TypeScript类型注释）
const inputText = ref('')
const files = ref([])
const askType = ref('record')
const conversationHistory = ref([])
const selectedTag = ref(null)
const previewItems = ref([])

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

const submitInput = async () => {
  if (!isUser) {
    conversationHistory.value.push({
      role: 'assistant',
      isUser: false,
      type: 'error',
      content: '请先登录再提交信息',
      timestamp: dayjs().format()
    })
    return
  }
  if (!inputText.value.trim() && files.value.length === 0) return

  try {
    // 保存用户输入内容，用于即时显示
    const userInputContent = inputText.value.trim()
    const currentTime = dayjs().format()
    
    // 创建新对话（会在 historyStore 中创建，并返回 convId）
    const convId = await historyStore.createConversation(
      userInputContent.slice(0, 30) || '新对话'
    )

    // 立即把用户消息加入本地 UI 列表（附带 convId，便于 MessageActions 使用）
    const userMessage = {
      id: `local-${Date.now()}`,
      role: 'user',
      isUser: true,
      type: askType.value,
      content: userInputContent,
      timestamp: currentTime,
      convId // <-- 附带 conversation id
    }
    conversationHistory.value.push(userMessage)

    // 同步把这条消息写入 historyStore 的 conversation.messages（防止 MessageActions 在 Home 找不到上下文）
    try {
      historyStore.addMessage(convId, {
        id: userMessage.id,
        role: 'user',
        content: userMessage.content,
        created_at: userMessage.timestamp
      })
    } catch (e) {
      console.warn('addMessage to historyStore failed:', e)
    }

    if (askType.value === 'record') {
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

      // 记录类型添加成功提示（本地显示）
      const assistantMsg = {
        id: `local-assistant-${Date.now()}`,
        role: 'assistant',
        isUser: false,
        type: 'reply',
        content: '记录已保存成功',
        timestamp: dayjs().format(),
        convId
      }
      conversationHistory.value.push(assistantMsg)

      // 把 assistant 提示也写入 historyStore（便于后续配对）
      try {
        historyStore.addMessage(convId, {
          id: assistantMsg.id,
          role: 'assistant',
          content: assistantMsg.content,
          created_at: assistantMsg.timestamp
        })
      } catch (e) {
        console.warn('add assistant message to historyStore failed:', e)
      }

      // 刷新对话详情（从后端拉取包含 info_items 等）
      await historyStore.fetchConversationDetail(convId)
    } else if (askType.value === 'consult') {
      // 发送消息并获取 AI 回复（sendMessage 内部会在 store 中添加 user 消息并 fetch detail）
      await historyStore.sendMessage(convId, userInputContent)
      
      // 刷新本地 UI（显示最新对话内容，包括AI回复）
      const rawMessages = historyStore.getConversationById(convId)?.messages || []
      conversationHistory.value = rawMessages.map(m => ({
         role: m.role,
         isUser: m.role === 'user',
         type: m.role === 'user' ? askType.value : 'reply',
         content: m.content,
         timestamp: dayjs(m.created_at).format(),
         id: m.id,
         convId // attach convId so MessageActions can use it
      }))
    }

    // 清空输入
    inputText.value = ''
    files.value = []
  } catch (e) {
    console.error('提交失败：', e)
    conversationHistory.value.push({
      role: 'assistant',
      isUser: false,
      type: 'error',
      content: '提交失败，请稍后再试',
      timestamp: dayjs().format()
    })
  }
}

const removeRecord = (id) => {
  previewItems.value = previewItems.value.filter(item => item.id !== id)
}
</script>

<style src="@/style/Home.css"></style>







