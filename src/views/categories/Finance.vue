<template>
  <div class="records-page">
    <!-- 顶部标题栏 -->
    <div class="page-header">
      <h1>历史事项记录 -- 财务</h1>
      <button class="back-btn" @click="goHome">
        <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M11.67 3.87L9.9 2.1 0 12l9.9 9.9 1.77-1.77L3.54 12l8.13-8.13z" fill="currentColor"/>
        </svg>
        返回首页
      </button>
    </div>

    <!-- 主体布局：上方卡片区域 + 下方表格区域 -->
    <div class="content-container">
      <!-- 上方卡片区域 -->
      <div class="cards-container">
        <!-- 左侧可视化事件展示卡片 -->
        <div class="visual-card">
          <div class="card-header">
            <h2>可视化事件展示</h2>
          </div>
          <div class="card-body">
            <button 
              class="visual-btn" 
              @click="goToRoute('/calendar')"
            >
              <svg class="btn-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
              </svg>
              盈亏日历
            </button>
            <button 
              class="visual-btn" 
              @click="goToRoute('/trend')"
            >
              <svg class="btn-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2v4l2 2 1.41-1.41L13.41 6H19v12H5V6h5.59l-2.29 2.29L10 8V2h2zm0 14c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" fill="currentColor"/>
              </svg>
              收支趋势分析
            </button>
            <button 
              class="visual-btn" 
              @click="goToRoute('/cost')"
            >
              <svg class="btn-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3-11h-2v2c0 .55-.45 1-1 1s-1-.45-1-1v-3H8c-.55 0-1-.45-1-1s.45-1 1-1h3V8c0-.55.45-1 1-1s1 .45 1 1v3h3c.55 0 1 .45 1 1s-.45 1-1 1z" fill="currentColor"/>
              </svg>
              成本占比看板
            </button>
            <button 
              class="visual-btn" 
              @click="goToRoute('/cashflow')"
            >
              <svg class="btn-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4 9h-3v3c0 .55-.45 1-1 1s-1-.45-1-1v-3H8c-.55 0-1-.45-1-1s.45-1 1-1h3V8c0-.55.45-1 1-1s1 .45 1 1v3h3c.55 0 1 .45 1 1s-.45 1-1 1z" fill="currentColor"/>
              </svg>
              现金流预测
            </button>
          </div>
        </div>

        <!-- 右侧今日事件 TODO 卡片 -->
        <div class="todo-card">
          <div class="card-header">
            <h2>今日事件</h2>
          </div>
          <div class="card-body todo-list">
            <div 
              class="todo-item" 
              v-for="(item, idx) in todoItems" 
              :key="idx" 
              @click="handleTodoClick(item, idx)"
              :class="{ 'done': item.done }"
            >
              <input type="checkbox" class="todo-checkbox" :checked="item.done">
              <span>{{ item.text }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 下方表格区域 - 周记事件 -->
      <div class="table-container">
        <div class="table-header">
          <h2>周记事件</h2>
        </div>
        <div class="table-content">
          <table class="records-table">
            <thead>
              <tr>
                <th>上传时间</th>
                <th>主题</th>
                <th>详细内容</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="(record, index) in filteredRecords" 
                :key="record._id ?? index"
              >
                <td>{{ formatDate(record.timestamp) }}</td>
                <td>{{ record.title }}</td>
                <td class="content-cell">
                  <div class="content-text">{{ record.content ?? record.description }}</div>
                </td>
                <td class="operation-cell">
                  <button class="edit-btn" @click="openEditDialog(record)">
                    <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
                    </svg>
                  </button>
                  <button class="delete-btn" @click="deleteRecord(index)">
                    <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
                    </svg>
                  </button>
                </td>
              </tr>
              <tr v-if="filteredRecords.length === 0">
                <td colspan="4" class="empty-state">
                  {{ activeDate ? `${activeDate.dateStr} 暂无财务记录` : '暂无财务记录' }}
                  <button class="add-first-btn" @click="goHome">
                    添加第一条记录
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 编辑弹窗 -->
    <el-dialog 
      v-model="isEditDialogVisible" 
      title="编辑财务记录" 
      width="500px"
    >
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="上传时间">
          <el-date-picker
            v-model="editForm.timestamp"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择日期"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="主题">
          <el-input v-model="editForm.title" />
        </el-form-item>
        <el-form-item label="详细内容">
          <el-input 
            type="textarea" 
            v-model="editForm.content" 
            rows="4" 
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="isEditDialogVisible = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="submitEdit"
          style="background-color: rgba(76, 110, 245, 0.1); color: #4c6ef5; border: none;"
        >
          提交
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import '@/style/Finance.css'
import { computed, onMounted, ref } from 'vue'
import { useFinanceStore } from '@/stores/finance'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const goHome = () => router.push('/')

// 路由跳转方法
const goToRoute = (path) => {
  router.push(path)
}

const financeStore = useFinanceStore()
const financeRecords = computed(() => financeStore.records ?? [])

const formatDate = (timestamp) => {
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
}

const activeDate = ref(null)
const filteredRecords = computed(() => {
  let result = financeRecords.value.filter(record => record.category === '财务')
  if (activeDate.value) {
    result = result.filter(record => {
      const recordDateStr = formatDate(record.timestamp)
      return recordDateStr === activeDate.value.dateStr
    })
  }
  return result
})

// TODO 列表数据，调整为对象数组，增加 done 标记
const todoItems = ref([
  { text: '审核报销单据', done: false },
  { text: '整理月度财务报表', done: false },
  { text: '与银行对账', done: false },
  { text: '准备税务申报材料', done: false }
])

// todo 项点击处理函数
const handleTodoClick = (item, idx) => {
  item.done = !item.done;
  // 如果标记为已完成，调整数组顺序放到底部
  if (item.done) {
    const doneItem = todoItems.value.splice(idx, 1)[0];
    todoItems.value.push(doneItem);
  }
}

const isEditDialogVisible = ref(false)
const editForm = ref({
  _id: '',
  timestamp: '',
  title: '',
  content: ''
})

const openEditDialog = (record) => {
  editForm.value = { ...record }
  isEditDialogVisible.value = true
}

const submitEdit = () => {
  financeStore.editRecord(editForm.value._id, {
    title: editForm.value.title,
    content: editForm.value.content,
    timestamp: editForm.value.timestamp
  })
  ElMessage.success('记录已更新')
  isEditDialogVisible.value = false
}

const deleteRecord = (index) => {
  const current = filteredRecords.value[index]
  if (!current || current.category !== '财务') return
  if (confirm(`确定要删除"${current.title}"吗？`)) {
    financeStore.deleteRecord(current._id)
    ElMessage.success('记录已删除')
  }
}

onMounted(async () => {
  try {
    await financeStore.fetchRecords()
  } catch (error) {
    console.error('加载财务记录失败:', error)
  }
})
</script>

<style scoped>
/* 基础布局 */
.records-page {
  width: 100%;
  min-height: 100vh;
  background: #f8f9fb;
  padding: 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.page-header h1 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.back-btn {
  display: flex;
  align-items: center;
  background: #fff;
  border: 1px solid #e5e7eb;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.back-btn:hover {
  border-color: #4c6ef5;
  color: #4c6ef5;
}

.icon {
  width: 16px;
  height: 16px;
  margin-right: 4px;
}

/* 内容容器 - 占满剩余空间 */
.content-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex: 1; /* 关键：让内容容器占满剩余空间 */
  min-height: 0; /* 解决flex容器中子元素高度问题 */
}

/* 上方卡片容器 */
.cards-container {
  display: flex;
  gap: 24px;
  height: 300px; /* 固定卡片高度 */
}

/* 可视化卡片、TODO卡片、表格容器 统一加边框 */
.visual-card, .todo-card, .table-container {
  border: 1px solid #e5e7eb; 
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

/* 可视化卡片 */
.visual-card, .todo-card {
  flex: 1;
  background: #fff;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

.todo-checkbox {
  /* 清除默认样式 */
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border: 1px solid #ccc;
  border-radius: 2px; /* 轻微圆角模拟正方形 */
  margin-right: 8px;
  cursor: pointer;
  /* 初始未选中状态背景 */
  background-color: #fff; 
  display: flex;
  align-items: center;
  justify-content: center;
}
/* checkbox 选中状态样式 */
.todo-checkbox:checked {
  background-color: #4c6ef5;
  border-color: #4c6ef5;
}
/* 选中后内部模拟对勾（可选，若需要可视化对勾可加） */
.todo-checkbox:checked::after {
  content: "✔";
  color: #fff;
  font-size: 12px;
}

.todo-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 4px;
  background-color: #f9fafb;
  cursor: pointer;
  transition: all 0.2s;
  /* 新增：默认样式 */
  color: #333; 
  text-decoration: none;
}

.todo-item.done {
  background-color: #ebebeb;
  color: #999;
  text-decoration: line-through;
  /* 可根据需求调整透明度等 */
  opacity: 0.8; 
}
.todo-item:hover {
  background-color: #f0f2f5;
}

.card-header {
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 12px;
  margin-bottom: 16px;
}

.card-header h2 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}

/* 滚动条美化 */
.card-body::-webkit-scrollbar {
  width: 6px;
}

.card-body::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.card-body::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 3px;
}

.card-body::-webkit-scrollbar-thumb:hover {
  background: #bbb;
}

.visual-btn {
  width: 100%;
  text-align: left;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  padding: 12px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.visual-btn:hover {
  background: #4c6ef51a;
  border-color: #4c6ef5;
  color: #4c6ef5;
}

.btn-icon {
  width: 20px;
  height: 20px;
}

/* TODO 卡片 */
.todo-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.todo-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 4px;
  background-color: #f9fafb;
  cursor: pointer;
  transition: background-color 0.2s;
}

.todo-item:hover {
  background-color: #f0f2f5;
}

.todo-item input {
  margin-right: 8px;
  accent-color: #4c6ef5;
}

/* 表格容器 - 占满剩余空间 */
.table-container {
  background: #fff;
  padding: 20px; /* 增加内边距让表格居中显示 */
  display: flex;
  flex-direction: column;
  flex: 1; /* 关键：让表格容器占满剩余空间 */
  overflow: hidden;
}

.table-header {
  border-bottom: 1px solid #e5e7eb;
  padding: 16px;
  margin-bottom: 16px; /* 增加底部间距 */
}

.table-header h2 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.table-content {
  flex: 1; /* 让表格内容区域占满剩余空间 */
  overflow-y: auto; /* 内容过多时显示滚动条 */
}

/* 表格样式 */
.records-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed; /* 固定列宽 */
}

.records-table thead {
  background: #f9fafb;
  position: sticky;
  top: 0;
  z-index: 1;
}

.records-table th, .records-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.records-table th {
  font-weight: 600;
  color: #4e5969;
}

.content-cell {
  max-width: 300px;
  overflow: hidden;
}

.content-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 操作按钮横向排列 */
.operation-cell {
  display: flex;
  gap: 8px; /* 按钮之间的间距 */
}

.empty-state {
  text-align: center;
  color: #999;
  padding: 40px 0;
}

.add-first-btn {
  margin-top: 16px;
  background: #4c6ef5;
  color: white;
  border: none;
  padding: 6px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.edit-btn, .delete-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.edit-btn {
  color: #4c6ef5;
}

.edit-btn:hover {
  background-color: #f0f5ff;
}

.delete-btn {
  color: #ff4d4f;
}

.delete-btn:hover {
  background-color: #fff2f0;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .cards-container {
    flex-direction: column;
    height: auto;
    gap: 16px;
  }
  
  .visual-card, .todo-card {
    height: 250px;
  }
  
  .records-page {
    padding: 16px;
  }
  
  .table-container {
    padding: 12px;
  }
}
</style>