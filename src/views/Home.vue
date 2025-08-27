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

import {
  uploadInfoService,
  uploadMixedInfoService,
  getInfoDetailService
} from '@/api/user'

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

const emit = defineEmits(['new-consult'])

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

  // 如果内容和文件都为空，则不提交
  if (!inputText.value.trim() && files.value.length === 0) return

  try {
    let conversationId = null
    const res = await createConversationService()
    console.log('创建对话返回:', res)
    conversationId = res.data.conversation_id

    // 创建 FormData
    const formData = new FormData()
    if (conversationId) formData.append('conversation_id', conversationId)
    if (inputText.value.trim()) formData.append('text', inputText.value.trim())
    if (files.value.length > 0) formData.append('file', files.value[0])

    let uploadRes

    if (files.value.length > 0 && inputText.value.trim()) {
      // 文本+文件 → uploadMixedInfoService
      uploadRes = await uploadMixedInfoService(formData)
    } else {
      // 单文件或单文本 → uploadInfoService
      // 注意：uploadInfoService 接口期望普通对象，而不是 FormData
      uploadRes = await uploadInfoService({
        conversation_id: conversationId,
        file: files.value[0] || null,
        text: inputText.value.trim() || null
      })
    }

    console.log('上传接口返回:', uploadRes)

    // 显示用户消息
    conversationHistory.value.push({
      role: 'user',
      isUser: true,
      type: askType.value,
      content: inputText.value,
      files: [...files.value],
      timestamp: dayjs().format()
    })

    if (askType.value === 'consult') {
      //暂缺接口
      emit('new-consult', {
        question: inputText.value
      })
    } else if (askType.value === 'record') {
      conversationHistory.value.push({
        role: 'assistant',
        isUser: false,
        type: 'reply',
        content: uploadRes.data.message,
        timestamp: dayjs().format()
      })
    }

    // 清空输入和文件
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
