<template>
  <div class="history-preview">
    <div class="preview-head">
      <strong>{{ selectedTag }}</strong>
      <button class="close" @click="$emit('removeItem', null)">×</button>
    </div>
    <div class="preview-list">
      <small>最近记录</small>
      <ul>
        <li v-for="(it, idx) in previewItems" :key="idx">
          {{ it }}
          <button class="remove-item" @click="$emit('removeItem', idx)">×</button>
        </li>
        <li v-if="!previewItems.length">（暂无记录）</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
defineProps({
  selectedTag: String,
  previewItems: Array
})
defineEmits(['removeItem'])
</script>
