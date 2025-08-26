<template>
  <div class="upload-dropdown" @click.stop>
    <button class="upload-btn" @click="show = !show">上传</button>
    <div class="upload-options" v-if="show">
      <label class="upload-option">
        图片
        <input type="file" accept="image/*" @change="onFileChange" hidden />
      </label>
      <label class="upload-option">
        文件
        <input type="file" @change="onFileChange" hidden />
      </label>
      <label class="upload-option">
        语音
        <input type="file" accept="audio/*" @change="onFileChange" hidden />
      </label>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const show = ref(false)
defineProps({ files: Array })
const onFileChange = (e) => {
  const selectedFiles = Array.from(e.target.files)
  files.push(...selectedFiles)
  show.value = false
}
</script>
