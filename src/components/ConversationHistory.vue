<template>
  <div class="conversation-history">
    <div class="message" v-for="(msg, index) in conversationHistory" :key="index">
      <!-- 消息头像和内容保持原逻辑 -->
      <div class="message-avatar" :class="{ 'user-avatar': msg.isUser, 'assistant-avatar': !msg.isUser }">
        <svg v-if="!msg.isUser" viewBox="0 0 24 24"><path d="..." fill="currentColor"/></svg>
        <svg v-if="msg.isUser" viewBox="0 0 24 24"><path d="..." fill="currentColor"/></svg>
      </div>
      <div class="message-content" :class="{ 'user-message': msg.isUser, 'assistant-message': !msg.isUser }">
        {{ msg.content }}
        <div class="reply-options" v-if="!msg.isUser && index === conversationHistory.length - 1 && msg.type === 'consult'">
          <button class="reply-btn" @click="$emit('newQuestion')">新问题</button>
          <button class="reply-btn" @click="$emit('followUp')">追问</button>
        </div>
      </div>
    </div>

    <div class="initial-hint" v-if="conversationHistory.length === 0">
      欢迎使用问心助手！请输入您想记录的事项或需要咨询的问题...
    </div>
  </div>
</template>

<script setup>
defineProps({ conversationHistory: Array })
defineEmits(['newQuestion', 'followUp'])
</script>
