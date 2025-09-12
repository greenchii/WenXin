<template>
  <div class="conversation-area">
    <!-- 初始提示 -->
    <div class="initial-hint" v-if="conversationHistory.length === 0">
      欢迎使用问心助手！请输入您想记录的事项或需要咨询的问题...
    </div>
    
    <!-- 消息列表 -->
    <div v-else>
      <div 
        v-for="(msg, index) in conversationHistory" 
        :key="index"
        class="message-container"
        :class="{ 'user-message-container': msg.isUser }"
      >
        <!-- 助手消息 -->
        <template v-if="!msg.isUser">
          <div class="message-avatar">
            <img 
              :src="avatarConfig.assistant.src" 
              :alt="avatarConfig.assistant.alt"
              @error="handleImageError('assistant')"
            >
          </div>

          <div class="message-block">
            <div class="message-content assistant-message">
              {{ msg.content }}
            </div>

            <!-- 操作按钮放在气泡外 -->
            <MessageActions :message="msg" :conv-id="null" />

            <div class="reply-options" 
                 v-if="index === conversationHistory.length - 1 && msg.type === 'consult'">
              <button class="reply-btn" @click="$emit('newQuestion')">新问题</button>
              <button class="reply-btn" @click="$emit('followUp')">追问</button>
            </div>
          </div>
        </template>

        <!-- 用户消息 -->
        <template v-else>
          <div class="message-block user-message-block">
            <div class="message-content user-message">
              {{ msg.content }}
            </div>

            <!-- 操作按钮放在气泡外 -->
            <MessageActions :message="msg" :conv-id="null" />
          </div>

          <div class="message-avatar">
            <img 
              :src="avatarConfig.user.src" 
              :alt="avatarConfig.user.alt"
              @error="handleImageError('user')"
            >
          </div>
        </template>
      </div>
    </div>
  </div>
</template>


<script setup>
import { defineEmits } from 'vue'
import MessageActions from '@/components/MessageActions.vue'  // <-- 新增 import

const props = defineProps({
  conversationHistory: Array,
  avatarConfig: {
    type: Object,
    default: () => ({
      user: { src: '', alt: '用户头像' },
      assistant: { src: '', alt: '助手头像' }
    })
  }
})

const emit = defineEmits(['newQuestion', 'followUp'])

// 处理图片加载失败
const handleImageError = (type) => {
  console.warn(`${type}头像加载失败，使用默认头像`)
  // 可以在这里设置默认头像
}
</script>

<style>
@import '@/style/conversation.css';

/* 初始提示样式 */
.initial-hint {
  color: #999;
  text-align: center;
  padding: 40px 20px;
  font-size: 14px;
}

/* 回复选项样式 */
.reply-options {
  margin-top: 10px;
  display: flex;
  gap: 8px;
}

.reply-btn {
  padding: 4px 12px;
  font-size: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background-color: #f9fafb;
  cursor: pointer;
  transition: all 0.2s;
}

.reply-btn:hover {
  background-color: #f3f4f6;
}
</style>

