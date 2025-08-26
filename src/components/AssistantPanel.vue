<template>
  <section class="panel ask-panel">
    <div class="panel-head">
      <h3>问心助手</h3>
    </div>

    <ConversationHistory
      :conversationHistory="conversationHistory"
      :avatarConfig="avatarConfig" 
      @newQuestion="handleNewQuestion"
      @followUp="handleFollowUp"
    />

    <InputArea
      :inputText="inputText"
      @update:inputText="val => emit('update:inputText', val)"
      :files="files"
      @update:files="val => emit('update:files', val)"
      :askType="askType"
      @update:askType="val => emit('update:askType', val)"
      @submit="submitInput"
    />
  </section>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import ConversationHistory from './ConversationHistory.vue'
import InputArea from './InputArea.vue'

const props = defineProps({
  inputText: String,
  files: Array,
  askType: String,
  conversationHistory: Array,
  avatarConfig: {
    type: Object,
    default: () => ({
      user: { src: '', alt: '用户头像' },
      assistant: { src: '', alt: '助手头像' }
    })
  }
})

const emit = defineEmits(['update:inputText', 'update:files', 'update:askType', 'submit'])

const submitInput = () => {
  emit('submit')
}

const handleNewQuestion = (question) => {
  emit('update:inputText', question)
}

const handleFollowUp = (question) => {
  emit('update:inputText', `${props.inputText} ${question}`.trim())
}
</script>

<style scoped>
.ask-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.panel-head {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.panel-head h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}
</style>
