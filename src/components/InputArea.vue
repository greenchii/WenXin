<template>
  <div class="input-area">
    <!-- 文本输入框 -->
    <textarea
      v-model="localInputText"
      placeholder="输入前请先在下方选择您的需求：记录事项或咨询决策(为保证您的用户体验,输入字符建议不超过150字)"
      class="dark-border-input"
      @keyup.enter="submit"
    ></textarea>

    <div class="action-row">
      <!-- 上传附件按钮 -->
      <div class="upload-dropdown" @click.stop>
        <button class="upload-btn" @click="toggleUploadOptions">
          <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" fill="currentColor"/>
          </svg>
        </button>

        <div class="upload-options" v-if="showUploadOptions">
          <label class="upload-option">
            <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M19 7v2.99s-1.99.01-2 0V7h-3s.01-1.99 0-2h3V2h2v3h3v2h-3zm-3 4V8H5v14h14V11h-4zm-8 7H6v-4h2v4zm0-6H6v-2h2v2zm10 6h-2v-4h2v4zm0-6h-2v-2h2v2zm-4 6h-2v-4h2v4zm0-6h-2v-2h2v2z" fill="currentColor"/>
            </svg>
            图片
            <input type="file" accept="image/*" @change="onFilesChange" hidden />
          </label>

          <label class="upload-option">
            <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15 9H3v6h12V9zm-1.5 4.5V15H6v-1.5h7.5zm4.5 0H18v1.5h-1.5V15H15v-1.5h3zm0-3V12H6V9.5h13.5z" fill="currentColor"/>
            </svg>
            文件
            <input type="file" @change="onFilesChange" hidden />
          </label>

          <label class="upload-option">
            <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.42 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" fill="currentColor"/>
            </svg>
            语音
            <input type="file" accept="audio/*" @change="onFilesChange" hidden />
          </label>
        </div>
      </div>

      <!-- 单选类型 -->
      <label class="radio-label">
        <input type="radio" name="ask-type" value="record" v-model="localAskType" />
        <span class="radio-text">记录事项</span>
      </label>
      <label class="radio-label">
        <input type="radio" name="ask-type" value="consult" v-model="localAskType" />
        <span class="radio-text">决策咨询</span>
      </label>

      <!-- 提交按钮 -->
      <button class="submit-btn" @click="submit">提交</button>
    </div>

    <!-- 文件预览 -->
    <div class="files-preview" v-if="localFiles.length">
      <small>已选文件：</small>
      <div class="file-list">
        <div class="file-item" v-for="(f, i) in localFiles" :key="i">
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
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  inputText: String,
  files: Array,
  askType: String
})

const emit = defineEmits(['update:inputText', 'update:files', 'update:askType', 'submit'])

// 本地状态
const localInputText = ref(props.inputText)
const localFiles = ref(props.files || [])
const localAskType = ref(props.askType || 'record')

// watch 同步父组件 prop
watch(() => props.inputText, val => localInputText.value = val)
watch(() => props.files, val => localFiles.value = val)
watch(() => props.askType, val => localAskType.value = val)

// 输入变化时通知父组件
watch(localInputText, val => emit('update:inputText', val))
watch(localFiles, val => emit('update:files', val))
watch(localAskType, val => emit('update:askType', val))

// 上传文件
const showUploadOptions = ref(false)//点击按钮出现附件类型选项
const toggleUploadOptions = () => showUploadOptions.value = !showUploadOptions.value
const onFilesChange = (e) => {
  const selected = Array.from(e.target.files)
  localFiles.value = [...localFiles.value, ...selected]
  showUploadOptions.value = false
}

// 移除文件
const removeFile = (index) => {
  localFiles.value.splice(index, 1)
}

// 提交
const submit = () => emit('submit')//submit定义在Home.vue
</script>

<style scoped>
.input-area {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.dark-border-input {
  border: 1px solid #4c6ef5;
  padding: 8px;
  min-height: 80px;
  resize: vertical;
}
.action-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.upload-btn {
  display: flex;
  align-items: center;
  justify-content: center;
}
.upload-options {
  position: absolute;
  background: #fff;
  border: 1px solid #ccc;
  margin-top: 4px;
  z-index: 10;
}
.upload-option {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 4px 8px;
}
.radio-label {
  display: flex;
  align-items: center;
  gap: 4px;
}
.submit-btn {
  padding: 4px 12px;
  cursor: pointer;
}
.files-preview {
  margin-top: 4px;
}
.file-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.file-item {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #f0f0f0;
  padding: 2px 4px;
  border-radius: 4px;
}
.remove-file {
  background: none;
  border: none;
  cursor: pointer;
}
</style>
