<template>
  <div class="record-calendar">
    <!-- 月份导航 -->
    <div class="calendar-nav">
      <button class="nav-btn" @click="jumpMonths(-3)">前3个月</button>
      <span class="month-range">{{ formatMonthRange }}</span>
      <button class="nav-btn" @click="jumpMonths(3)">后3个月</button>
    </div>

    <!-- 3个月日历网格 -->
    <div class="months-grid">
      <div 
        v-for="(month, index) in displayedMonths" 
        :key="index" 
        class="month-card"
      >
        <div class="month-title">{{ month.year }}年{{ month.month + 1 }}月</div>
        
        <!-- 星期标题 -->
        <div class="weekdays">
          <span v-for="day in ['一', '二', '三', '四', '五', '六', '日']" :key="day">
            {{ day }}
          </span>
        </div>
        
        <!-- 日期网格 -->
        <div class="days-grid">
          <div 
            v-for="date in month.dates" 
            :key="date.dateStr"
            :class="['day', {
              'other-month': date.isOtherMonth,
              'today': date.isToday,
              'level-1': date.recordCount === 1,
              'level-2': date.recordCount === 2,
              'level-3': date.recordCount >= 3
            }]"
            @click="$emit('date-click', date)"
            :title="`${date.dateStr} 共${date.recordCount}条记录`"
          >
            {{ date.day }}
          </div>
        </div>
      </div>
    </div>

    <!-- 图例区域（日历下方，提示语上方，居中） -->
    <div class="calendar-legend">
      <div class="legend-item">
        <div class="legend-color no-record"></div>
        <span>无记录</span>
      </div>
      <div class="legend-item">
        <div class="legend-color level-1"></div>
        <span>1条记录</span>
      </div>
      <div class="legend-item">
        <div class="legend-color level-2"></div>
        <span>2条记录</span>
      </div>
      <div class="legend-item">
        <div class="legend-color level-3"></div>
        <span>3条及以上</span>
      </div>
      <div class="legend-item">
        <div class="legend-color today-marker"></div>
        <span>当前日期</span>
      </div>
    </div>

    <!-- 提示语区域（图例下方，居中） -->
    <div class="calendar-hint">
      提示： 点击日期可查看当天的记录，刷新页面可回到全部记录视图
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// 接收父组件传入的记录数据和分类
const props = defineProps({
  records: {
    type: Array,
    required: true,
    default: () => []
  },
  category: {
    type: String,
    required: true,
    validator: (value) => {
      return ['finance', 'meeting', 'life'].includes(value)
    }
  }
})

// 基准日期（控制显示的3个月范围）
const baseDate = ref(new Date())

// 生成显示的3个月数据
const displayedMonths = computed(() => {
  const months = []
  // 生成前1个月、当前月、后1个月（共3个月）
  for (let i = -1; i <= 1; i++) {
    const targetDate = new Date(baseDate.value)
    targetDate.setMonth(targetDate.getMonth() + i)
    months.push(generateMonthData(targetDate))
  }
  return months
})

// 生成单个月的完整数据（日期、记录数量、状态）
function generateMonthData(date) {
  const year = date.getFullYear()
  const month = date.getMonth() // 0-11
  const firstDay = new Date(year, month, 1)
  
  // 计算日历起始日期（包含上月补充日期）
  const startOffset = firstDay.getDay() || 7 // 周一=1，周日=7
  const startDate = new Date(firstDay)
  startDate.setDate(firstDay.getDate() - (startOffset - 1))

  // 生成42天（6周）的日历数据
  const dates = []
  for (let i = 0; i < 42; i++) {
    const current = new Date(startDate)
    current.setDate(startDate.getDate() + i)
    
    const dateStr = `${current.getFullYear()}-${(current.getMonth() + 1).toString().padStart(2, '0')}-${current.getDate().toString().padStart(2, '0')}`
    const isToday = current.toDateString() === new Date().toDateString()
    const isOtherMonth = current.getMonth() !== month

    // 统计当前分类的记录数量
    const recordCount = props.records.reduce((count, record) => {
      const recordDate = new Date(record.timestamp)
      const recordDateStr = `${recordDate.getFullYear()}-${(recordDate.getMonth() + 1).toString().padStart(2, '0')}-${recordDate.getDate().toString().padStart(2, '0')}`
      
      return recordDateStr === dateStr ? count + 1 : count
    }, 0)

    dates.push({ dateStr, year: current.getFullYear(), month: current.getMonth(), day: current.getDate(), isToday, isOtherMonth, recordCount })
  }

  return { year, month, dates }
}

// 月份跳转（±3个月）
const jumpMonths = (offset) => {
  const newDate = new Date(baseDate.value)
  newDate.setMonth(newDate.getMonth() + offset)
  baseDate.value = newDate
}

// 格式化显示的月份范围
const formatMonthRange = computed(() => {
  const start = new Date(baseDate.value)
  start.setMonth(start.getMonth() - 1)
  const end = new Date(baseDate.value)
  end.setMonth(end.getMonth() + 1)
  return `${start.getFullYear()}年${start.getMonth() + 1}月 - ${end.getFullYear()}年${end.getMonth() + 1}月`
})

// 监听记录变化，自动更新日历统计
watch(() => props.records, () => {
  displayedMonths.value = [...displayedMonths.value]
}, { deep: true })
</script>

<style scoped>
.record-calendar {
  background-color: var(--card);
  border-radius: 12px;
  box-shadow: 0 6px 18px rgba(12, 34, 88, 0.06);
  padding: 20px;
}

/* 月份导航 */
.calendar-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.nav-btn {
  background: rgba(76, 110, 245, 0.1);
  color: var(--text);
  border: 1px solid var(--border);
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.nav-btn:hover {
  background: rgba(76, 110, 245, 0.2);
}

.month-range {
  font-size: 16px;
  color: var(--text);
}

/* 日历网格 */
.months-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 20px; /* 日历与图例间距 */
}

.month-card {
  padding: 16px;
  border-radius: 8px;
  background: #f9fafb;
  box-shadow: 0 2px 4px rgba(0,0,0,0.03);
}

.month-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 12px;
  text-align: center;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
}

.weekdays span {
  font-size: 12px;
  color: var(--text-light);
  text-align: center;
  padding: 4px 0;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.day {
  width: 36px;
  height: 36px;
  line-height: 36px;
  border-radius: 4px;
  font-size: 13px;
  text-align: center;
  cursor: pointer;
  margin: 0 auto;
  transition: all 0.2s;
}

.day:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* 记录数量颜色样式 */
.day.level-1 {
  background-color: rgba(124, 58, 237, 0.2);
  color: #fff;
  font-weight: 500;
}

.day.level-2 {
  background-color: rgba(124, 58, 237, 0.5);
  color: #fff;
  font-weight: 500;
}

.day.level-3 {
  background-color: rgba(124, 58, 237, 0.9);
  color: #fff;
  font-weight: 500;
}

/* 当前日期样式 */
.day.today {
  border: 2px solid #7c3aed;
  font-weight: 600;
}

/* 其他月份日期 */
.day.other-month {
  color: #ccc;
  background-color: #f1f1f1;
}

/* 图例区域（日历下方，提示语上方，居中） */
.calendar-legend {
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center;
  gap: 20px;
  margin: 15px 0; /* 上下间距 */
  flex-wrap: wrap;
  padding: 10px;
  border-top: 1px solid var(--border); /* 与日历分隔 */
  border-bottom: 1px solid var(--border); /* 与提示语分隔 */
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--text);
}

.legend-color {
  width: 18px;
  height: 18px;
  border-radius: 3px;
}

.no-record {
  background-color: #f1f1f1;
  border: 1px solid #ddd;
}

.level-1 {
  background-color: rgba(124, 58, 237, 0.2);
}

.level-2 {
  background-color: rgba(124, 58, 237, 0.5);
}

.level-3 {
  background-color: rgba(124, 58, 237, 0.9);
}

.today-marker {
  background-color: transparent;
  border: 2px solid #7c3aed;
}

/* 提示语区域 */
.calendar-hint {
  text-align: center; /* 水平居中 */
  color: var(--text-light);
  font-size: 14px;
  padding: 10px 0 5px;
}

/* 响应式适配 */
@media (max-width: 900px) {
  .months-grid {
    grid-template-columns: 1fr;
  }
  
  .calendar-legend {
    gap: 12px;
  }
  
  .legend-item {
    font-size: 12px;
  }
}
</style>
