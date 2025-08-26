<template>
  <section class="panel history-panel">
    <div class="panel-head">
      <h3>信息分类</h3>
    </div>

    <div class="tag-buttons">
      <button class="tag-btn" @click="$router.push('/meeting')">会议</button>
      <button class="tag-btn" @click="$router.push('/life')">生活</button>
      <button class="tag-btn" @click="$router.push('/finance')">财务</button>
    </div>

    <TagPreview v-if="selectedTag" :selectedTag="selectedTag" :previewItems="previewItems" @removeItem="$emit('removeRecord', selectedTag, $event)" />

    <div class="hint">提示：点击标签查看相关记录，或在输入中使用 <code>#标签</code> 自动分类。</div>
  </section>
</template>

<script setup>
import TagPreview from './TagPreview.vue'
defineProps({
  selectedTag: String,
  previewItems: Array
})
defineEmits(['removeRecord'])
</script>
