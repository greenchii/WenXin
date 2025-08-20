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
import { uploadInfoService } from '@/api/user'
import AssistantPanel from '@/components/AssistantPanel.vue'
import RightPanel from '@/components/RightPanel.vue'

// 状态管理
const inputText = ref('')
const files = ref([])
const askType = ref('record')
const conversationHistory = ref([])
const selectedTag = ref(null)
const previewItems = ref([])

// 提交输入
const submitInput = async () => {
  try {
    // 1. 创建 FormData
    const formData = new FormData()
    formData.append('askType', askType.value) // 上传时带上问题类型
    formData.append('text', inputText.value)  // 上传文本

    // 2. 添加文件（如果有）
    files.value.forEach((file, index) => {
      formData.append(`file${index}`, file) // 多文件支持
    })

    // 3. 调用接口
    const res = await uploadInfoService(formData)

    // 4. 保存返回结果到对话历史
    conversationHistory.value.push({
      role: 'user',
      content: inputText.value,
      files: [...files.value],
    })
    conversationHistory.value.push({
      role: 'assistant',
      content: res.data?.reply || '无回复',
    })

    // 5. 清空输入框和文件
    inputText.value = ''
    files.value = []
  } catch (error) {
    console.error('上传失败：', error)
  }
}
</script>
