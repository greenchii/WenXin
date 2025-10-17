<template>
  <div class="today-events">
    <div class="events-header">
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
  </div>
</template>

<script setup>
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
</script>

<style scoped>
.today-events {
  height: auto !important;
  display: block;
  margin-top: 8px;
  padding: 16px;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e0e7ff;
  box-shadow: 0 4px 16px rgba(139, 92, 246, 0.08);
}

.events-header {
  background: var(--card);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(139, 92, 246, 0.08);
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border);
}

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
