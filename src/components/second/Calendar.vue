<template>
  <div class="plc-page">
    <!-- 顶部标题栏（保留在页面头部） -->
    <div class="page-root">
      <div class="page-header">
        <h1>历史事项记录 -- 财务</h1>
        <button class="back-btn" @click="goLast">
          <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M11.67 3.87L9.9 2.1 0 12l9.9 9.9 1.77-1.77L3.54 12l8.13-8.13z" fill="currentColor"/>
          </svg>
          返回上一页
        </button>
      </div>

      <!-- 主可滚动区域：把日历 + 列表放在这里，滚动只发生在此 -->
      <div class="page-body">
        <!-- 月份切换 + 摘要板块 -->
        <header class="plc-header">
          <div class="month-switch">
            <button class="btn" @click="goPrevMonth">‹ 上个月</button>
            <h1 class="month-title">{{ currentYear }}年 {{ currentMonth + 1 }}月</h1>
            <button class="btn" @click="goNextMonth">下个月 ›</button>
          </div>

          <!-- 总显示板块：当月总收入 / 总支出 / 结余 -->
          <section class="summary">
            <div class="card">
              <div class="label">收入</div>
              <div class="value">{{ formatCurrency(monthIncome) }}</div>
            </div>
            <div class="card">
              <div class="label">支出</div>
              <div class="value">{{ formatCurrency(monthExpense) }}</div>
            </div>
            <div class="card">
              <div class="label">结余</div>
              <div
                class="value"
                :class="{
                  profit: monthNet > 0,
                  loss: monthNet < 0,
                  neutral: monthNet === 0
                }"
              >
                {{ formatCurrency(monthNet) }}
              </div>
            </div>
          </section>
        </header>

        <!-- 日历板块 -->
        <section class="calendar">
          <!-- 星期标题行 -->
          <div class="week-headers">
            <div v-for="w in ['周日','周一','周二','周三','周四','周五','周六']"
                 :key="w"
                 class="week-header">
              {{ w }}
            </div>
          </div>

          <!-- 日期格子（6 行 * 7 列 = 42 个） -->
          <div class="grid">
            <div
              v-for="cell in calendarCells"
              :key="cell.key"
              class="cell"
              :class="[ { 'other-month': !cell.inCurrentMonth }, cell.inCurrentMonth ? netClassOf(cell.dateStr) : '' ]"
              :title="tooltipOf(cell.dateStr, cell.inCurrentMonth)"
              @click="handleDateClick(cell)"
            >
              <div class="cell-date">{{ cell.date }}</div>

              <!-- 当月日期显示详细记录 -->
              <template v-if="cell.inCurrentMonth">
                <!-- 多条记录列表 -->
                <div class="records-list" v-if="dailyMap[cell.dateStr]?.records && dailyMap[cell.dateStr].records.length">
                  <div 
                    class="record-item" 
                    :class="record.type"
                    v-for="(record, idx) in dailyMap[cell.dateStr].records" 
                    :key="idx"
                  >
                    <span class="record-title">{{ record.title }}</span>
                    <span class="record-amount">{{ formatCurrency(record.amount) }}</span>
                  </div>
                </div>

                <!-- 无数据的提示 -->
                <div class="line muted" v-if="!dailyMap[cell.dateStr]">
                  无记录
                </div>
              </template>
            </div>
          </div>

          <!-- 底部图例 -->
          <div class="legend">
            <div class="legend-item">
              <span class="color-box profit"></span> 当日盈利
            </div>
            <div class="legend-item">
              <span class="color-box loss"></span> 当日亏损
            </div>
            <div class="legend-item" v-if="selectedDate">
              <span>已选日期: {{ selectedDate }}</span>
            </div>
          </div>
        </section>

        <!-- 财务记录列表 - 表格形式 -->
        <section class="records-section" v-if="selectedDate">
          <div class="records-table-container">
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
                <tr v-for="(record, index) in dailyRecords" :key="record.id ?? index">
                  <td>{{ formatDateTime(record.timestamp) }}</td>
                  <td>{{ record.title }}{{ record.type === 'income' ? '收入' : '支出' }}</td>
                  <td class="content-cell">
                    <div class="content-text">{{ record.description }}</div>
                  </td>
                  <td :class="record.type === 'income' ? 'income-amount' : 'expense-amount'">
                    {{ formatCurrency(record.amount) }}
                  </td>
                  <td class="actions-cell">
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

                <tr v-if="dailyRecords.length === 0">
                  <td colspan="5" class="empty-state">
                    {{ selectedDate }} 暂无财务记录
                    <button class="add-first-btn" @click="addNewRecord">
                      添加记录
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- 编辑弹窗 -->
        <el-dialog v-model="isEditDialogVisible" title="编辑财务记录" width="500px">
          <el-form :model="editForm" label-width="80px">
            <el-form-item label="日期">
              <el-date-picker
                v-model="editForm.date"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="选择日期"
                style="width: 100%;"
              />
            </el-form-item>
            <el-form-item label="时间">
              <el-time-picker
                v-model="editForm.time"
                value-format="HH:mm:ss"
                placeholder="选择时间"
                style="width: 100%;"
              />
            </el-form-item>
            <el-form-item label="类型">
              <el-radio-group v-model="editForm.type">
                <el-radio label="income">收入</el-radio>
                <el-radio label="expense">支出</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="主题">
              <el-input v-model="editForm.title" />
            </el-form-item>
            <el-form-item label="金额">
              <el-input 
                v-model="editForm.amount" 
                type="number" 
                step="0.01"
                min="0"
              />
            </el-form-item>
            <el-form-item label="详细内容">
              <el-input type="textarea" v-model="editForm.description" rows="4" />
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
      </div> <!-- /.page-body -->
    </div> <!-- /.page-root -->
  </div> <!-- /.plc-page -->
</template>

<script setup>
import { useRouter } from 'vue-router'
import { computed, ref, reactive, onMounted } from 'vue'
import { ElDialog, ElForm, ElFormItem, ElInput, ElButton, ElDatePicker, ElTimePicker, ElRadioGroup, ElRadio } from 'element-plus'
import { useFinanceStore } from '@/stores/finance'

const router = useRouter()
const goLast = () => router.push('/finance')
const financeStore = useFinanceStore()

/* -------------------- 工具函数 -------------------- */
const pad2 = (n) => String(n).padStart(2, '0')
const toDateStr = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
const formatCurrency = (n) =>
  (n >= 0 ? '¥ ' : '-¥ ') + Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// 格式化日期时间显示
const formatDateTime = (timestamp) => {
  const date = new Date(timestamp)
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`
}

// 格式化日期
const formatDate = (timestamp) => {
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

/* -------------------- 月份状态 -------------------- */
const viewDate = ref(new Date()) // 以此为“当月视图”的锚点
const currentYear = computed(() => viewDate.value.getFullYear())
const currentMonth = computed(() => viewDate.value.getMonth()) // 0-11

const goPrevMonth = () => {
  const d = new Date(viewDate.value)
  d.setMonth(d.getMonth() - 1)
  viewDate.value = d
  // 加载上个月数据
  financeStore.loadRecordsByMonth(d.getFullYear(), d.getMonth())
}

const goNextMonth = () => {
  const d = new Date(viewDate.value)
  d.setMonth(d.getMonth() + 1)
  viewDate.value = d
  // 加载下个月数据
  financeStore.loadRecordsByMonth(d.getFullYear(), d.getMonth())
}

/* -------------------- 从Store获取数据 -------------------- */
const records = computed(() => financeStore.records)

/* -------------------- 映射：当月每日数据 -------------------- */
const monthFirstDay = computed(() => new Date(currentYear.value, currentMonth.value, 1))
const monthDays = computed(() => new Date(currentYear.value, currentMonth.value + 1, 0).getDate())

const dailyMap = computed(() => {
  const map = {}
  const ym = `${currentYear.value}-${pad2(currentMonth.value + 1)}-`
  
  records.value.forEach(record => {
    if (!record.date || !record.date.startsWith(ym)) return
    
    const dateStr = record.date
    if (!map[dateStr]) {
      map[dateStr] = {
        income: 0,
        expense: 0,
        net: 0,
        records: []
      }
    }
    
    if (record.type === 'income') {
      map[dateStr].income += record.amount
      map[dateStr].net += record.amount
    } else {
      map[dateStr].expense += Math.abs(record.amount)
      map[dateStr].net -= Math.abs(record.amount)
    }
    
    map[dateStr].records.push(record)
  })
  
  return map
})

/* -------------------- 日历 6x7 网格 -------------------- */
const calendarCells = computed(() => {
  const first = monthFirstDay.value
  const backfill = first.getDay() 
  const start = new Date(first)
  start.setDate(first.getDate() - backfill)

  const cells = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const inCurrentMonth = d.getMonth() === currentMonth.value && d.getFullYear() === currentYear.value
    cells.push({
      key: toDateStr(d),
      dateStr: toDateStr(d),
      date: d.getDate(),
      inCurrentMonth
    })
  }
  return cells
})

/* -------------------- 月度统计 -------------------- */
const monthIncome = computed(() => Object.values(dailyMap.value).reduce((sum, d) => sum + d.income, 0))
const monthExpense = computed(() => Object.values(dailyMap.value).reduce((sum, d) => sum + d.expense, 0))
const monthNet = computed(() => monthIncome.value - monthExpense.value)

/* -------------------- 视图辅助 -------------------- */
const netClassOf = (dateStr) => {
  const d = dailyMap.value[dateStr]
  if (!d) return 'neutral'
  if (d.net > 0) return 'profit'
  if (d.net < 0) return 'loss'
  return 'neutral'
}

const tooltipOf = (dateStr, inCurrentMonth) => {
  if (!inCurrentMonth) return ''
  const d = dailyMap.value[dateStr]
  if (!d) return `${dateStr}：无记录`
  return `${dateStr}：收入 ${formatCurrency(d.income)}｜支出 ${formatCurrency(d.expense)}｜净值 ${formatCurrency(d.net)}｜${d.records.length}条记录`
}

/* -------------------- 日期点击处理 -------------------- */
const selectedDate = ref(null)
const dailyRecords = computed(() => {
  if (!selectedDate.value) return []
  const dateData = dailyMap.value[selectedDate.value]
  // 按时间戳排序，最新的在前面
  return dateData ? [...dateData.records].sort((a, b) => b.timestamp - a.timestamp) : []
})

const handleDateClick = (cell) => {
  if (!cell.inCurrentMonth) return
  selectedDate.value = cell.dateStr
}

/* -------------------- 编辑和删除功能 -------------------- */
const isEditDialogVisible = ref(false)
const editForm = reactive({
  id: '',
  date: '',
  time: '',
  type: 'income',
  title: '',
  amount: 0,
  description: ''
})

// 打开编辑对话框
const openEditDialog = (record) => {
  const date = new Date(record.timestamp)
  editForm.id = record.id
  editForm.date = formatDate(record.timestamp)
  editForm.time = formatDateTime(record.timestamp)
  editForm.type = record.type
  editForm.title = record.title
  editForm.amount = Math.abs(record.amount)
  editForm.description = record.description
  isEditDialogVisible.value = true
}

// 添加新记录
const addNewRecord = () => {
  const now = new Date()
  editForm.id = `new-${Date.now()}`
  editForm.date = selectedDate.value || formatDate(now.getTime())
  editForm.time = formatDateTime(now.getTime())
  editForm.type = 'income'
  editForm.title = ''
  editForm.amount = 0
  editForm.description = ''
  isEditDialogVisible.value = true
}

// 提交编辑
const submitEdit = () => {
  // 合并日期和时间
  const datetimeStr = `${editForm.date}T${editForm.time}`
  const timestamp = new Date(datetimeStr).getTime()
  
  // 计算实际金额（支出为负数）
  const amount = editForm.type === 'income' ? Number(editForm.amount) : -Number(editForm.amount)
  
  // 使用store的方法更新记录
  if (editForm.id.startsWith('new-')) {
    // 添加新记录
    financeStore.addRecord({
      id: editForm.id,
      date: editForm.date,
      type: editForm.type,
      title: editForm.title,
      amount,
      description: editForm.description,
      timestamp
    })
  } else {
    // 更新现有记录
    financeStore.editRecord(editForm.id, {
      date: editForm.date,
      type: editForm.type,
      title: editForm.title,
      amount,
      description: editForm.description,
      timestamp
    })
  }
  
  isEditDialogVisible.value = false
}

// 删除记录
const deleteRecord = (index) => {
  if (!selectedDate.value) return
  
  // 找到要删除的记录ID
  const recordToDelete = dailyRecords.value[index]
  if (recordToDelete) {
    // 调用store的删除方法
    financeStore.deleteRecord(recordToDelete.id)
  }
}

// 初始化数据
onMounted(() => {
  financeStore.initMockData(currentYear.value, currentMonth.value)
})
</script>

<style scoped>
/* ----------- 根与布局 ----------- */
.plc-page {
  --bg: #f4f8fb;
  --card: #ffffff;
  --text: #0f172a;
  --muted: #94a3b8;
  --profit-bg: #ffe5e5;    
  --profit-border: #ef4444;
  --loss-bg: #e8fff3;      
  --loss-border: #10b981;
  --neutral-bg: #f1f5f9;
  --border: #e2e8f0;

  background: var(--bg);
  height: 100%;
  padding: 24px;
  box-sizing: border-box;
  color: var(--text);
  display: flex;
  flex-direction: column;
}

.page-root {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  gap: 16px;
}

.page-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ----------- 头部 ----------- */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}
.back-btn:hover {
  background-color: #f1f5f9;
}
.icon { width: 18px; height: 18px; }

/* ----------- plc-header 摘要 ----------- */
.plc-header {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
.month-switch {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 8px;
}
.month-title { margin: 0; font-size: 20px; font-weight: 700; text-align: center; }
.btn {
  justify-self: start;
  padding: 8px 12px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.btn:hover { background-color: #f1f5f9; }
.btn:last-child { justify-self: end; }
.summary { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.card { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 16px 18px; box-shadow: 0 4px 14px rgba(2, 6, 23, 0.04); }
.label { font-size:12px; color:var(--muted); margin-bottom:6px; }
.value { font-size:22px; font-weight:800; }
.value.profit { color: #b91c1c; }
.value.loss { color: #065f46; }
.value.neutral { color: #64748b; }

/* ----------- 日历样式（重点修改） ----------- */
.calendar {
  margin-top: 12px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 6px 18px rgba(2, 6, 23, 0.05);
}
.week-headers { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; margin-bottom: 8px; }
.week-header { text-align:center; font-weight:600; font-size:12px; color:var(--muted); padding:6px 0; }
.grid { display:grid; grid-template-columns: repeat(7, 1fr); gap:8px; }

/* 日历单元格 - 增加高度以容纳多条记录 */
.cell { 
  min-height: 140px; /* 增加单元格高度，容纳多条记录 */
  background:white; 
  border:1px solid var(--border); 
  border-radius:10px; 
  padding:8px 5px; 
  display:flex; 
  flex-direction:column; 
  align-items:center; 
  justify-content:flex-start; /* 顶部对齐，方便显示多条记录 */
  gap:6px; 
  cursor:pointer; 
  transition: box-shadow 0.2s ease, transform 0.08s ease;
  position: relative;
  overflow: hidden;
}
.cell:hover { transform: translateY(-1px); box-shadow: 0 8px 18px rgba(2,6,23,0.08); }
.cell-date { 
  font-weight:700; 
  font-size:13px; 
  margin:0; 
  padding-bottom: 4px;
  border-bottom: 1px dashed var(--border);
  width: 100%;
  text-align: center;
}

/* 记录列表容器 */
.records-list {
  width: 100%;
  padding: 4px 5px;
  display: flex;
  flex-direction: column;
  gap: 5px; /* 记录之间的间距 */
  overflow: hidden;
  flex-grow: 1;
}

/* 单条记录样式 - 主题和金额在同一行 */
.record-item {
  width: 100%;
  font-size: 12px;
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center;
  gap: 6px; /* 主题和金额之间的间距 */
  padding: 2px 0;
  line-height: 1.3;
  white-space: nowrap; /* 防止换行 */
}

/* 记录主题 - 与金额颜色一致 */
.record-item.income .record-title { color: #059669; }
.record-item.expense .record-title { color: #d97706; }

/* 记录主题样式 */
.record-title {
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: right;
  max-width: 55%; /* 控制主题部分宽度 */
}

/* 记录金额样式 - 与主题颜色一致 */
.record-amount {
  font-weight: 500;
  text-align: left;
  max-width: 40%; /* 控制金额部分宽度 */
}

/* 收入和支出的颜色区分 - 主题和金额保持一致 */
.record-item.income { color: #059669; }
.record-item.expense { color: #d97706; }

/* 无记录提示 */
.line.muted { 
  color: var(--muted); 
  font-size: 12px;
  margin-top: auto; /* 推到单元格底部 */
}

.other-month { background:#f8fafc; color:#cbd5e1; border-style:dashed; }
.profit { background: var(--profit-bg); border-color: var(--profit-border); }
.loss { background: var(--loss-bg); border-color: var(--loss-border); }
.neutral { background: var(--neutral-bg); border-color: var(--border); }

.legend { justify-content:center; display:flex; gap:16px; margin-top:12px; font-size:15px; flex-wrap:wrap; }
.legend-item { display:flex; align-items:center; gap:6px; margin:4px 0; }
.color-box { width:22px; height:22px; border-radius:4px; display:inline-block; }
.color-box.profit { background: var(--profit-bg); border:1px solid var(--profit-border); }
.color-box.loss { background: var(--loss-bg); border:1px solid var(--loss-border); }

/* ----------- 记录列表 ----------- */
.records-section { width:100%; background:var(--card); border-radius:12px; padding:20px; box-shadow:0 4px 14px rgba(2,6,23,0.04); margin-bottom:20px; }
.records-table-container { overflow-x:auto; }
.records-table { width:100%; border-collapse:collapse; min-width:800px; }
.records-table th, .records-table td { padding:12px 15px; text-align:left; border-bottom:1px solid var(--border); }
.records-table th { background-color:#f8fafc; font-weight:600; font-size:14px; color:var(--text); }
.records-table tbody tr:hover { background-color:#f8fafc; }
.content-cell { max-width:400px; }
.content-text { white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.income-amount { color:#059669; font-weight:500; }
.expense-amount { color:#d97706; font-weight:500; }
.edit-btn, .delete-btn { background:none; border:none; cursor:pointer; padding:4px; margin-right:8px; display: inline-flex; border-radius:4px; transition: background-color 0.2s; }
.edit-btn:hover { background-color: rgba(76,110,245,0.1); color:#4c6ef5; }
.delete-btn:hover {background-color: rgba(239,68,68,0.1); color:#ef4444; }
.empty-state { text-align:center; padding:60px 20px; color:var(--muted); font-size:16px; }
.add-first-btn { margin-top:16px; padding:8px 16px; background-color: rgba(76,110,245,0.1); color:#4c6ef5; border:none; border-radius:8px; cursor:pointer; transition: background-color 0.2s; }
.add-first-btn:hover { background-color: rgba(76,110,245,0.2); }

</style>




