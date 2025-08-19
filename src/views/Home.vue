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
import AssistantPanel from '@/components/AssistantPanel.vue'
import RightPanel from '@/components/RightPanel.vue'

// 状态管理
const inputText = ref('')
const files = ref([])
const askType = ref('record')
const conversationHistory = ref([])
const selectedTag = ref(null)
const previewItems = ref([])

// 提交逻辑保留原来的 submitInput
const submitInput = async () => {
  // 这里可以直接复用原来的提交逻辑
}
const removeRecord = (tag, index) => {
  previewItems.value.splice(index, 1)
}
</script>
