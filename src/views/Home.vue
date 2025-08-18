<template>
  <div class="home-container">
    <div class="content-grid">
      <!-- 左侧列：问心助手 -->
      <div class="left-column">
        <section class="panel ask-panel">
          <div class="panel-head">
            <svg class="head-ic" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6A4.997 4.997 0 017 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z" fill="currentColor"/>
            </svg>
            <h3>问心助手</h3>
          </div>

          <!-- 对话历史区域 -->
          <div class="conversation-history">
            <!-- 消息记录 -->
            <div class="message" v-for="(msg, index) in conversationHistory" :key="index">
              <div class="message-avatar" :class="{ 'user-avatar': msg.isUser, 'assistant-avatar': !msg.isUser }">
                <svg v-if="!msg.isUser" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6A4.997 4.997 0 017 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z" fill="currentColor"/>
                </svg>
                <svg v-if="msg.isUser" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 5.5c-2.5 0-4.5 2-4.5 4.5s2 4.5 4.5 4.5 4.5-2 4.5-4.5-2-4.5-4.5-4.5zm0 8c-1.9 0-3.5-1.6-3.5-3.5S10.1 6.5 12 6.5s3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zm9 0c0 3.9-3.1 7-7 7h-4c-3.9 0-7-3.1-7-7s3.1-7 7-7h1.5c.8 0 1.5-.7 1.5-1.5S8.3 2 7.5 2H7C2.8 2-1 5.8-1 10s3.8 8 8 8h4c4.2 0 8-3.8 8-8v-1.5c0-.8.7-1.5 1.5-1.5H21c.8 0 1.5.7 1.5 1.5s-.7 1.5-1.5 1.5h-1.5z" fill="currentColor"/>
                </svg>
              </div>
              <div class="message-content" :class="{ 'user-message': msg.isUser, 'assistant-message': !msg.isUser }">
                {{ msg.content }}
                
                <!-- 回答后的操作选项：仅决策咨询显示 -->
                <div class="reply-options" v-if="!msg.isUser && index === conversationHistory.length - 1 && msg.type === 'consult'">
                  <button class="reply-btn" @click="handleNewQuestion">新问题</button>
                  <button class="reply-btn" @click="handleFollowUp">追问</button>
                </div>
              </div>
            </div>

            <!-- 初始提示 -->
            <div class="initial-hint" v-if="conversationHistory.length === 0">
              欢迎使用问心助手！请输入您想记录的事项或需要咨询的问题...
            </div>
          </div>

          <!-- 输入区域 -->
          <div class="input-area">
            <textarea 
              v-model="inputText" 
              placeholder="输入前请先在下方选择您的需求：记录事项或咨询决策" 
              class="dark-border-input"
              @keyup.enter="submitInput"
            ></textarea>

            <div class="action-row">
              <!-- 超链接图标按钮 -->
              <div class="upload-dropdown" @click.stop>
                <button class="upload-btn" @click="toggleUploadOptions">
                  <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" fill="currentColor"/>
                  </svg>
                </button>
                
                <!-- 下拉选项：显示在图标上方 -->
                <div class="upload-options" v-if="showUploadOptions">
                  <label class="upload-option">
                    <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M19 7v2.99s-1.99.01-2 0V7h-3s.01-1.99 0-2h3V2h2v3h3v2h-3zm-3 4V8H5v14h14V11h-4zm-8 7H6v-4h2v4zm0-6H6v-2h2v2zm10 6h-2v-4h2v4zm0-6h-2v-2h2v2zm-4 6h-2v-4h2v4zm0-6h-2v-2h2v2z" fill="currentColor"/>
                    </svg>
                    图片
                    <input type="file" accept="image/*" @change="onFileChange" hidden />
                  </label>
                  <label class="upload-option">
                    <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M15 9H3v6h12V9zm-1.5 4.5V15H6v-1.5h7.5zm4.5 0H18v1.5h-1.5V15H15v-1.5h3zm0-3V12H6V9.5h13.5z" fill="currentColor"/>
                    </svg>
                    文件
                    <input type="file" @change="onFileChange" hidden />
                  </label>
                  <label class="upload-option">
                    <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.42 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" fill="currentColor"/>
                    </svg>
                    语音
                    <input type="file" accept="audio/*" @change="onFileChange" hidden />
                  </label>
                </div>
              </div>

              <!-- 记录事项 / 决策咨询 -->
              <label class="radio-label">
                <input type="radio" name="ask-type" value="record" v-model="askType" />
                <span class="radio-text">记录事项</span>
              </label>
              <label class="radio-label">
                <input type="radio" name="ask-type" value="consult" v-model="askType" />
                <span class="radio-text">决策咨询</span>
              </label>

              <!-- 提交按钮 -->
              <button class="submit-btn" @click="submitInput">
                提交
              </button>
            </div>

            <!-- 已选文件预览 -->
            <div class="files-preview" v-if="files.length">
              <small>已选文件：</small>
              <div class="file-list">
                <div class="file-item" v-for="(f, i) in files" :key="i">
                  <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M15 9H3v6h12V9zm-1.5 4.5V15H6v-1.5h7.5zm4.5 0H18v1.5h-1.5V15H15v-1.5h3zm0-3V12H6V9.5h13.5z" fill="currentColor"/>
                  </svg>
                  {{ f.name }}
                  <button class="remove-file" @click="removeFile(i)">
                    <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- 右侧列：信息分类 -->
      <div class="right-column">
        <section class="panel history-panel">
          <div class="panel-head">
            <svg class="head-ic" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z" fill="currentColor"/>
            </svg>
            <h3>信息分类</h3>
          </div>

          <!-- 标签按钮 -->
          <div class="tag-buttons">
            <button
              class="tag-btn"
              @click="$router.push('/meeting')"
            >
              会议
            </button>
            <button
              class="tag-btn"
              @click="$router.push('/life')"
            >
              生活
            </button>
            <button
              class="tag-btn"
              @click="$router.push('/finance')"
            >
              财务
            </button>
          </div>

          <!-- 标签详情预览 -->
          <div class="history-preview" v-if="selectedTag">
            <div class="preview-head">
              <strong>{{ selectedTag }}</strong>
              <button class="close" @click="selectedTag = null">
                <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
                </svg>
              </button>
            </div>
            <div class="preview-list">
              <small>最近记录</small>
              <ul>
                <li v-for="(it, idx) in previewItems" :key="idx">
                  {{ it }}
                  <button class="remove-item" @click="removeRecord(selectedTag, idx)">
                    <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
                    </svg>
                  </button>
                </li>
                <li v-if="!previewItems.length">（暂无记录）</li>
              </ul>
            </div>
          </div>

          <div class="hint">提示：点击标签查看相关记录，或在输入中使用 <code>#标签</code> 自动分类。</div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// 模拟消息提示
const ElMessage = {
  warning: (msg) => console.warn(msg),
  success: (msg) => console.log(msg),
  error: (msg) => console.error(msg)
}

// 后端接口服务（确保内容存储到后端，不保存本地）
const apiService = {
  // 保存记录/咨询到后端
  saveToBackend: (data) => fetch('/api/info/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  }).then(res => res.json()),
  
  // 上传带文件的内容到后端
  uploadWithFiles: (formData) => fetch('/api/info/upload', {
    method: 'POST',
    body: formData
  }).then(res => res.json()),
  
  // 获取AI响应
  getAIResponse: (data) => fetch('/api/ai/response', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  }).then(res => res.json())
}

// 状态管理
const inputText = ref('')                // 输入框内容
const files = ref([])                   // 已选文件/图片/语音
const askType = ref('record')           // 记录事项/决策咨询（二选一）
const showUploadOptions = ref(false)     // 控制上传选项显示
const selectedTag = ref(null)           // 选中的分类标签
const previewItems = ref([])            // 标签预览项
const conversationHistory = ref([])     // 对话历史记录（包含type字段）

// 切换上传选项显示/隐藏
const toggleUploadOptions = () => {
  showUploadOptions.value = !showUploadOptions.value
}

// 点击页面其他区域关闭上传选项
onMounted(() => {
  document.addEventListener('click', (e) => {
    const dropdown = document.querySelector('.upload-dropdown')
    if (!dropdown?.contains(e.target)) {
      showUploadOptions.value = false
    }
  })

  // 开启新对话，刷新问心助手的对话页面
  window.addEventListener('new-conversation', () => {
    // 重置对话状态
    conversationHistory.value = []
    inputText.value = ''
    files.value = []
  })
})

// 处理文件选择
const onFileChange = (e) => {
  const selectedFiles = Array.from(e.target.files)
  files.value = [...files.value, ...selectedFiles]
  showUploadOptions.value = false  // 选择后关闭选项
}

// 移除已选文件
const removeFile = (index) => {
  files.value.splice(index, 1)
}

// 提交内容到后端
const submitInput = async () => {
  if (!inputText.value.trim() && files.value.length === 0) {
    ElMessage.warning('请输入内容或上传附件')
    return
  }

  try {
    // 添加用户消息到对话历史（包含类型）
    const userMsg = {
      isUser: true,
      content: inputText.value.trim() || `[上传了${files.value.length}个文件]`,
      type: askType.value
    }
    conversationHistory.value.push(userMsg)

    // 1. 准备提交数据
    const content = inputText.value.trim()
    const tags = extractTags(content)
    const primaryTag = tags.length > 0 ? tags[0] : askType.value === 'record' ? 'default' : 'consult'

    // 2. 提交到后端（区分带文件和纯文本）
    let saveRes
    if (files.value.length > 0) {
      const formData = new FormData()
      formData.append('content', content)
      formData.append('type', askType.value)
      formData.append('tag', primaryTag)
      files.value.forEach(file => {
        formData.append('files', file)
      })
      saveRes = await apiService.uploadWithFiles(formData)
    } else {
      saveRes = await apiService.saveToBackend({
        content,
        type: askType.value,
        tag: primaryTag,
        timestamp: new Date().toISOString()
      })
    }

    if (!saveRes.success) {
      throw new Error(saveRes.message || '保存到后端失败')
    }

    // 3. 获取AI响应
    const aiRes = await apiService.getAIResponse({
      content,
      type: askType.value,
      tag: primaryTag,
      history: conversationHistory.value.slice(0, -1).map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.content
      }))
    })

    if (aiRes.success && aiRes.data?.answer) {
      // 生成AI回复内容（记录事项带分类提示）
      const aiContent = askType.value === 'record' 
        ? `事项主题是${content.substring(0, 20)}...，已保存到 #${primaryTag} 分类`
        : aiRes.data.answer

      // 添加AI回答到对话历史（包含类型）
      conversationHistory.value.push({
        isUser: false,
        content: aiContent,
        type: askType.value  // 关键：记录消息类型用于控制按钮显示
      })
      
      // 清空输入
      inputText.value = ''
      files.value = []
      
      // 自动滚动到底部
      scrollToBottom()

      // 更新信息分类预览
      selectedTag.value = primaryTag
      updatePreviewItems(primaryTag)
    } else {
      throw new Error(aiRes.message || '获取AI回答失败')
    }
  } catch (error) {
    console.error('提交失败:', error)
    conversationHistory.value.push({
      isUser: false,
      content: `操作失败：${error.message}`,
      type: askType.value
    })
    ElMessage.error(`操作失败：${error.message}`)
  }
}

// 处理新问题
const handleNewQuestion = () => {
  inputText.value = ''
  files.value = []
  scrollToBottom()
}

// 处理追问
const handleFollowUp = () => {
  inputText.value = `追问：${inputText.value}`
  scrollToBottom()
  setTimeout(() => {
    document.querySelector('.dark-border-input')?.focus()
  }, 100)
}

// 自动滚动到对话底部
const scrollToBottom = () => {
  setTimeout(() => {
    const container = document.querySelector('.conversation-history')
    if (container) container.scrollTop = container.scrollHeight
  }, 100)
}

// 信息分类相关逻辑
const extractTags = (text) => {
  const tagRegex = /#(\w+)/g
  const matches = text.match(tagRegex)
  return matches ? matches.map(tag => tag.substring(1)) : []
}
const detectedTags = computed(() => extractTags(inputText.value))
const updatePreviewItems = (tag) => {
  previewItems.value = [
    `关于${tag}的最新记录1`,
    `关于${tag}的最新记录2`,
    `关于${tag}的最新记录3`
  ]
}
const removeRecord = (tag, index) => {
  previewItems.value.splice(index, 1)
  ElMessage.success('记录已删除')
}
</script>

<style scoped>
/* 基础样式变量 */
:root {
  --primary: #4c6ef5;
  --primary-light: #eef2ff;
  --light-gray: #f1f5f9;
  --text: #0f172a;
  --text-light: #64748b;
  --accent: #4c6ef5;
  --border: #e6ecff;
  --background: #f8fafc;
  --card: #ffffff;
  --danger: #e53e3e;
  --user-msg-bg: #f1f5f9; /* 用户消息背景（浅灰色） */
  --assistant-msg-bg: #ffffff; /* 助手消息背景 */
}

/* 确保页面基础显示 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.home-container {
  padding: 20px;
  min-height: 100vh;
  box-sizing: border-box;
  background-color: var(--background);
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  height: calc(100vh - 40px);
}

.left-column, .right-column {
  height: 100%;
}

.panel {
  background: var(--card);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 6px 18px rgba(12, 34, 88, 0.06);
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.panel-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border);
}

.head-ic {
  width: 24px;
  height: 24px;
  color: var(--primary);
}

.panel h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
}

.conversation-history {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  margin-bottom: 15px;
  border-radius: 8px;
  background-color: var(--light-gray);
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.initial-hint {
  color: var(--text-light);
  font-style: italic;
  padding: 20px;
  text-align: center;
  margin: auto;
}

.message {
  display: flex;
  gap: 10px;
  max-width: 85%;
  animation: fadeIn 0.3s ease;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background-color: var(--light-gray);
}

.user-avatar {
  background-color: var(--primary);
  color: white;
}

.assistant-avatar {
  background-color: var(--light-gray);
  color: var(--primary);
  border: 1px solid var(--border);
}

.message-content {
  padding: 12px 16px;
  border-radius: 18px;
  line-height: 1.6;
  font-size: 15px;
  position: relative;
  max-width: calc(100% - 46px);
}

.user-message {
  margin-left: auto;
  background-color: var(--user-msg-bg);
  border-top-right-radius: 4px;
}

.assistant-message {
  margin-right: auto;
  background-color: var(--assistant-msg-bg);
  border: 1px solid var(--border);
  border-top-left-radius: 4px;
}

.reply-options {
  display: flex;
  gap: 10px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed var(--border);
}

.reply-btn {
  background: none;
  border: 1px solid var(--primary);
  color: var(--primary);
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.reply-btn:hover {
  background-color: var(--primary);
  color: white;
}

.input-area {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.dark-border-input {
  min-height: 80px;
  resize: vertical;
  padding: 15px;
  border-radius: 10px;
  border: 2px solid #333; /* 深色边框 */
  font-family: inherit;
  font-size: 15px;
  line-height: 1.5;
}

.dark-border-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(76, 110, 245, 0.1);
}

.action-row {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.upload-dropdown {
  position: relative;
  display: inline-block;
}

.upload-btn {
  background: rgba(76, 110, 245, 0.1);
  color: var(--accent);
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  transition: background-color 0.2s;
}

.upload-btn:hover {
  background: rgba(76, 110, 245, 0.2);
}

.upload-btn .icon {
  width: 20px;
  height: 20px;
}

/* 超链接选项显示在图标上方 */
.upload-options {
  position: absolute;
  bottom: 100%; /* 改为从底部向上显示 */
  left: 0;
  margin-bottom: 5px; /* 与按钮保持距离 */
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 150px;
  z-index: 100;
  overflow: hidden;
}

.upload-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 15px;
  cursor: pointer;
  transition: background-color 0.2s;
  width: 100%;
  box-sizing: border-box;
}

.upload-option:hover {
  background-color: var(--primary-light);
}

.upload-option .icon {
  width: 18px;
  height: 18px;
  color: var(--text);
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.radio-label:hover {
  background-color: rgba(76, 110, 245, 0.05);
}

.radio-label input {
  accent-color: var(--primary);
}

.radio-text {
  font-size: 14px;
  color: var(--text);
}

.submit-btn {
  background: rgba(76, 110, 245, 0.1);
  color: var(--accent);
  border: 1px solid var(--border);
  padding: 12px 22px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  margin-left: auto;
}

.submit-btn:hover {
  background-color: rgba(76, 110, 245, 0.2);
}

.files-preview {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed var(--border);
}

.file-list {
  margin-top: 8px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid var(--border);
}

.file-item .icon {
  width: 16px;
  height: 16px;
  color: var(--text-light);
}

.remove-file {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--danger);
  margin-left: auto;
}

.remove-file .icon {
  width: 16px;
  height: 16px;
  color: var(--danger);
}

.right-column .history-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tag-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 10px 0;
  margin-bottom: 15px;
  align-items: center;
}

.tag-btn {
  border: 0;
  background: var(--light-gray);
  color: var(--primary);
  padding: 15px 30px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 18px;
  text-align: center;
  transition: all 0.2s;
  width: 80%;
}

.tag-btn:hover {
  background: rgba(76, 110, 245, 0.1);
  color: var(--accent);
}

.history-preview {
  margin-top: 15px;
  border-top: 1px dashed var(--border);
  padding-top: 15px;
  background-color: var(--primary-light);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
}

.preview-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.close {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-light);
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close .icon {
  width: 18px;
  height: 18px;
}

.preview-list {
  max-height: 200px;
  overflow-y: auto;
  padding-right: 8px;
}

.preview-list ul {
  margin: 10px 0;
  padding-left: 22px;
}

.hint {
  margin-top: auto;
  color: var(--text-light);
  font-size: 13px;
  padding-top: 10px;
  border-top: 1px dashed var(--border);
}

code {
  background-color: rgba(16, 24, 40, 0.04);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
    height: auto;
    min-height: 100vh;
  }
}

@media (max-width: 600px) {
  .home-container {
    padding: 10px;
  }
  .content-grid {
    gap: 10px;
  }
}
</style>
