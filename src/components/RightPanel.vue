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

    <!-- 下方面板：今日事件 -->
    <section class="panel history-panel">
      <div class="panel-head">
        <h3>今日事件</h3>
      </div>

      <div class="events-list">
        <div 
          class="event-item" 
          v-for="(item, idx) in todoItems" 
          :key="idx" 
          @click="handleTodoClick(item, idx)"
          :class="{ 'done': item.done }"
        >
          <input type="checkbox" class="event-checkbox" :checked="item.done">
          <span>{{ item.text }}</span>
        </div>

      </div>
    </section>

  </div>
</template>

<script setup>
import TagPreview from './TagPreview.vue'
import { ref } from 'vue'

// TODO 列表数据
const todoItems = ref([
  { text: '审核报销单据', done: false },
  { text: '整理月度财务报表', done: false },
  { text: '与银行对账', done: false },
  { text: '准备税务申报材料', done: false }
])

// todo 项点击处理
const handleTodoClick = (item, idx) => {
  item.done = !item.done;
  if (item.done) {
    const doneItem = todoItems.value.splice(idx, 1)[0];
    todoItems.value.push(doneItem);
  }
}

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
  box-sizing: border-box;
  height:96vh;
}

.right-panel-wrapper .tag-buttons {
  margin-bottom: 8px;
}

:deep(.events-list) {
  overflow-y: visible !important;
  max-height: none !important;
}

/* 今日事件 */
.events-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.event-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 8px;
  background-color: #faf8ff;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #1e1b4b;
  text-decoration: none;
  border: 1px solid transparent;
}

.event-item:hover {
  background-color: #f3f0ff;
  border-color: rgba(139, 92, 246, 0.2);
}

.event-item.done {
  background-color: #f8fafc;
  color: #6b7280;
  text-decoration: line-through;
  opacity: 0.8;
}

.event-checkbox {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border: 1px solid #8b5cf6;
  border-radius: 3px;
  margin-right: 10px;
  cursor: pointer;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.event-checkbox:checked {
  background-color: #8b5cf6;
  border-color: #8b5cf6;
}

.event-checkbox:checked::after {
  content: "✓";
  color: #fff;
  font-size: 12px;
  font-weight: bold;
}

.event-item span {
  font-size: 14px;
  line-height: 1.4;
}
</style>