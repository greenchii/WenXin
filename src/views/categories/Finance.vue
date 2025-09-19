<template>
  <div class="finance-page">
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
                @click="goToCalendar"
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
            <p class="week-info">最近一周: {{ weekRange }}</p>
          </div>
          <div class="table-content">
            <table class="records-table">
              <thead>
                <tr>
                  <th>上传时间</th>
                  <th>主题</th>
                  <th>详细内容</th>
                  <th>金额</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="(record, index) in weeklyRecords" 
                  :key="record.id ?? record._id ?? index"
                >
                  <td>{{ record.date || formatDate(record.timestamp) }}</td>
                  <td>{{ record.title }}</td>
                  <td class="content-cell">
                    <div class="content-text">{{ record.content ?? record.description }}</div>
                  </td>
                  <td :class="record.amount >= 0 ? 'income-amount' : 'expense-amount'">
                    {{ record.amount >= 0 ? '+' : '' }}{{ record.amount.toFixed(2) }}
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
                <tr v-if="weeklyRecords.length === 0">
                  <td colspan="5" class="empty-state">
                    最近一周暂无财务记录
                    <button class="add-first-btn" @click="goToAddRecord">
                      添加记录
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
          <el-form-item label="金额">
            <el-input 
              v-model="editForm.amount" 
              type="number" 
              placeholder="收入为正，支出为负"
            />
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

// 跳转到盈亏日历
const goToCalendar = () => {
  router.push('/calendar')
}

const financeStore = useFinanceStore()
const financeRecords = computed(() => financeStore.records ?? [])

// 格式化日期为 YYYY-MM-DD
const formatDate = (timestamp) => {
  if (!timestamp) return '';
  
  // 如果是字符串且已经是 YYYY-MM-DD 格式，直接返回
  if (typeof timestamp === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(timestamp)) {
    return timestamp;
  }
  
  // 否则按时间戳处理
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
}

// 计算最近一周的日期范围
const getWeekRange = () => {
  const now = new Date();
  const endDate = new Date(now);
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - 6); // 7天前
  
  return {
    start: formatDate(startDate),
    end: formatDate(endDate),
    text: `${formatDate(startDate)} 至 ${formatDate(endDate)}`
  };
}

// 最近一周范围信息
const weekRange = computed(() => getWeekRange().text);

// 筛选出最近一周的记录并标准化日期格式
const weeklyRecords = computed(() => {
  const { start, end } = getWeekRange();
  const startDate = new Date(start);
  const endDate = new Date(end);
  endDate.setHours(23, 59, 59, 999); // 设置为当天结束时间
  
  return financeRecords.value
    .filter(record => {
      // 转换记录日期
      const recordDate = record.date ? new Date(record.date) : new Date(record.timestamp);
      // 检查是否在最近一周范围内
      return recordDate >= startDate && recordDate <= endDate;
    })
    .map(record => ({
      ...record,
      // 确保日期格式为 YYYY-MM-DD
      date: record.date || formatDate(record.timestamp),
      // 确保金额字段存在并为数字
      amount: typeof record.amount === 'number' ? record.amount : parseFloat(record.amount) || 0
    }))
    // 按日期降序排列，最新的在前
    .sort((a, b) => new Date(b.date || b.timestamp) - new Date(a.date || a.timestamp));
});

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

const isEditDialogVisible = ref(false)
const editForm = ref({
  id: '',
  _id: '',
  timestamp: '',
  title: '',
  amount: 0,
  content: ''
})

const openEditDialog = (record) => {
  // 初始化编辑表单，确保日期格式正确
  editForm.value = { 
    ...record,
    timestamp: record.date || formatDate(record.timestamp)
  }
  isEditDialogVisible.value = true
}

const submitEdit = () => {
  // 确保日期格式一致
  const updatedData = {
    ...editForm.value,
    date: editForm.value.timestamp,
    amount: parseFloat(editForm.value.amount) || 0
  }
  
  financeStore.editRecord(editForm.value.id || editForm.value._id, updatedData)
  ElMessage.success('记录已更新')
  isEditDialogVisible.value = false
}

const deleteRecord = (index) => {
  const current = weeklyRecords.value[index]
  if (!current || current.category !== '财务') return
  if (confirm(`确定要删除"${current.title}"吗？`)) {
    financeStore.deleteRecord(current.id || current._id)
    ElMessage.success('记录已删除')
  }
}

const goToAddRecord = () => {
  router.push('/finance/add')
}

onMounted(() => {
  financeStore.fetchRecords()
})
</script>

<style scoped src="@/style/Finance.css">
</style>

