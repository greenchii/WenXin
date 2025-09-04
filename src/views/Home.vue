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
import { sendMessageService } from '@/api/conversation'
import { useUserStore } from '@/stores/user'
import { useHistoryStore } from '@/stores/history'
import AssistantPanel from '@/components/AssistantPanel.vue'
import RightPanel from '@/components/RightPanel.vue'

import {
  uploadInfoService,
  uploadMixedInfoService,
  getInfoDetailService
} from '@/api/conversation'

import { createConversationService } from '@/api/conversation'

// 状态管理
const userStore = useUserStore()
const historyStore = useHistoryStore()
const isUser = !!userStore.token

const inputText = ref('')
const files = ref([])
const askType = ref('record') // 'record' 或 'consult'
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

// 提交输入
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

  // 内容和文件都为空则不提交
  if (!inputText.value.trim() && files.value.length === 0) return

  try {
    // 1. 创建对话（两种类型共用）
    const convRes = await createConversationService()
    const { conversation_id, created_at } = convRes.data

    // 2. 处理文件/文本上传（记录类型）
    if (askType.value === 'record') {
      const formData = new FormData()
      formData.append('conversation_id', conversation_id)
      if (inputText.value.trim()) formData.append('text', inputText.value.trim())
      if (files.value.length > 0) formData.append('file', files.value[0])

      let uploadRes
      if (files.value.length > 0 && inputText.value.trim()) {
        uploadRes = await uploadMixedInfoService(formData)
      } else {
        uploadRes = await uploadInfoService({
          conversation_id,
          file: files.value[0] || null,
          text: inputText.value.trim() || null
        })
      }

      // 添加记录类型的回复
      conversationHistory.value.push({
        role: 'user',
        isUser: true,
        type: 'record',
        content: inputText.value,
        files: [...files.value],
        timestamp: dayjs().format()
      })
      conversationHistory.value.push({
        role: 'assistant',
        isUser: false,
        type: 'reply',
        content: uploadRes.data.message,
        timestamp: dayjs().format()
      })

    } 
    // 3. 处理咨询类型
    else if (askType.value === 'consult') {
      // 添加用户消息到当前对话历史
      const userMessage = {
        role: 'user',
        isUser: true,
        type: 'consult',
        content: inputText.value,
        timestamp: dayjs().format()
      }
      conversationHistory.value.push(userMessage)

      // 保存用户消息到历史存储
      historyStore.addConversation({
        id: conversation_id,
        title: inputText.value.trim().substring(0, 30) + (inputText.value.length > 30 ? '...' : ''),
        created_at,
        updated_at: created_at,
        info_count: 1,
        info_items: [{
          id: Date.now(), // 临时ID
          info_type: 'text',
          title: '用户提问',
          content: inputText.value,
          created_at
        }]
      })

      // 发送咨询并获取AI回复
      const replyRes = await sendMessageService(conversation_id, inputText.value)
      const { assistant_reply } = replyRes.data

      // 添加AI回复到当前对话历史
      const aiMessage = {
        role: 'assistant',
        isUser: false,
        type: 'reply',
        content: assistant_reply.content,
        timestamp: dayjs(assistant_reply.created_at).format()
      }
      conversationHistory.value.push(aiMessage)

      // 更新历史存储中的AI回复
      historyStore.addMessage(conversation_id, {
        id: assistant_reply.id,
        info_type: 'text',
        title: '问心回复',
        content: assistant_reply.content,
        created_at: assistant_reply.created_at
      })
    }

    // 清空输入
    inputText.value = ''
    files.value = []

  } catch (error) {
    console.error('提交失败：', error.response?.data || error.message)
    conversationHistory.value.push({
      role: 'assistant',
      isUser: false,
      type: 'error',
      content: '提交失败，请稍后再试',
      timestamp: dayjs().format()
    })
  }
}


// 移除记录
const removeRecord = (id) => {
  previewItems.value = previewItems.value.filter(item => item.id !== id)
}
</script>
