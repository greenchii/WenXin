<template>
  <div class="right-panel-wrapper">

    <!-- 上方面板：信息分类 -->
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

    <section class="today-panel">
      <TodayEvents />
    </section>

  </div>
</template>

<script setup>
import TagPreview from './TagPreview.vue'
import TodayEvents from './TodayEvents.vue'

defineProps({
  selectedTag: String,
  previewItems: Array
})
defineEmits(['removeRecord'])
</script>

<style scoped>
.right-panel-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
  box-sizing: border-box;
}

.today-panel {
  /* 固定高度，以便底部与左侧 ConversationHistory 对齐 */
  height: 360px;
  min-height: 360px;
  max-height: 360px;
  padding: 0; /* TodayEvents 自带内边距，不重复 */
  display: block;
}

/* 确保上方面板按内容自适应高度，去掉可能把内容推到底部的自动 margin */
.right-panel-wrapper .history-panel {
  height: auto !important;
  display: block;
}

.right-panel-wrapper .history-panel .hint {
  margin-top: 8px !important;
}

.right-panel-wrapper .tag-buttons {
  margin-bottom: 8px;
}

/* 使用 deep selector 覆盖 TodayEvents 内部顶部边框/外边距，避免重复的上边线 */
::v-deep .today-events {
  margin-top: 0 !important;
  padding-top: 12px !important;
  border-top: none !important;
  border-radius: 12px !important;
}

/* 不使用内部滚动条，让页面整体滚动处理 TodayEvents 的内容 */
::v-deep .today-events .events-list {
  overflow-y: visible !important;
  max-height: none !important;
}
</style>