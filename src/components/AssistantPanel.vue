<template>
  <section class="panel ask-panel">
    <div class="panel-head">
      <svg class="head-ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="..." fill="currentColor"/>
      </svg>
      <h3>问心助手</h3>
    </div>

    <ConversationHistory
      :conversationHistory="conversationHistory"
      @newQuestion="handleNewQuestion"
      @followUp="handleFollowUp"
    />

    <InputArea
      :inputText="inputText"
      @update:inputText="emit('update:inputText', $event)"
      :files="files"
      @update:files="emit('update:files', $event)"
      :askType="askType"
      @update:askType="emit('update:askType', $event)"
      @submit="submitInput"
    />
  </section>
</template>

<script setup>
import ConversationHistory from './ConversationHistory.vue'
import InputArea from './InputArea.vue'

const props = defineProps({
  inputText: String,
  files: Array,
  askType: String,
  conversationHistory: Array
})

const emit = defineEmits(['update:inputText', 'update:files', 'update:askType', 'submit'])

const submitInput = () => {
  emit('submit')
}

// 这里可以加 handleNewQuestion 和 handleFollowUp 方法
const handleNewQuestion = (question) => {
  console.log('新问题:', question)
}

const handleFollowUp = (question) => {
  console.log('跟进问题:', question)
}
</script>
