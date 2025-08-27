<template>
  <div class="plc-page">
    <!-- 顶部标题栏 -->
    <div class="page-header">
      <h1>历史事项记录 -- 财务</h1>
      <button class="back-btn" @click="goLast">
        <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M11.67 3.87L9.9 2.1 0 12l9.9 9.9 1.77-1.77L3.54 12l8.13-8.13z" fill="currentColor"/>
        </svg>
        返回上一页
      </button>
    </div>
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
        <div v-for="w in ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']"
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
          :class="[
            { 'other-month': !cell.inCurrentMonth },
            cell.inCurrentMonth ? netClassOf(cell.dateStr) : ''
          ]"
          :title="tooltipOf(cell.dateStr, cell.inCurrentMonth)"
        >
          <div class="cell-date">{{ cell.date }}</div>

          <!-- 当月日期才显示数据 -->
          <template v-if="cell.inCurrentMonth">
            <div class="line income" v-if="dailyMap[cell.dateStr]?.income">
              收入 {{ formatCurrency(dailyMap[cell.dateStr].income) }}
            </div>
            <div class="line expense" v-if="dailyMap[cell.dateStr]?.expense">
              支出 {{ formatCurrency(dailyMap[cell.dateStr].expense) }}
            </div>

            <!-- 无数据的提示（可选） -->
            <div class="line muted" v-if="!dailyMap[cell.dateStr]">
              无记录
            </div>
          </template>
        </div>
      </div>

       <!-- 📌 新增：底部图例 -->
      <div class="legend">
        <div class="legend-item">
          <span class="color-box profit"></span> 当日盈利
        </div>
        <div class="legend-item">
          <span class="color-box loss"></span> 当日亏损
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
/**
 * 盈亏日历页面（Vue 3 + <script setup>）
 * - 数据结构：
 *   records: Array<{ date: 'YYYY-MM-DD', income: number, expense: number }>
 * - 交互：
 *   支持切换前/后月份；当月统计与日历视图联动
 * - 着色规则（按你的需求）：
 *   净值 > 0 => profit（红背景）；净值 < 0 => loss（绿背景）；=0 => neutral
 */
import { useRouter } from 'vue-router'

const router = useRouter()
const goLast = () => router.push('/finance')

import { computed, ref } from 'vue'

/* -------------------- 工具函数 -------------------- */
const pad2 = (n) => String(n).padStart(2, '0')
const toDateStr = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
const formatCurrency = (n) =>
  (n >= 0 ? '¥ ' : '-¥ ') + Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/* -------------------- 月份状态 -------------------- */
const viewDate = ref(new Date()) // 以此为“当月视图”的锚点
const currentYear = computed(() => viewDate.value.getFullYear())
const currentMonth = computed(() => viewDate.value.getMonth()) // 0-11

const goPrevMonth = () => {
  const d = new Date(viewDate.value)
  d.setMonth(d.getMonth() - 1)
  viewDate.value = d
}
const goNextMonth = () => {
  const d = new Date(viewDate.value)
  d.setMonth(d.getMonth() + 1)
  viewDate.value = d
}

/* -------------------- 模拟数据（接入后端时替换这里） -------------------- */
/**
 * 真实接入时：把 records 替换为后端返回的数据即可
 * 格式：[{ date: '2024-07-01', income: 75, expense: 1219 }, ...]
 */
function mockMonthData(year, month /* 0-11 */) {
  const first = new Date(year, month, 1)
  const days = new Date(year, month + 1, 0).getDate()
  const list = []
  for (let i = 1; i <= days; i++) {
    // 随机 60% 的日期有数据
    if (Math.random() < 0.6) {
      const income = Math.random() < 0.5 ? 0 : +(Math.random() * 2500 + 20).toFixed(0)
      const expense = Math.random() < 0.5 ? 0 : +(Math.random() * 2500 + 20).toFixed(0)
      list.push({
        date: `${year}-${pad2(month + 1)}-${pad2(i)}`,
        income,
        expense
      })
    }
  }
  return list
}

const records = ref(mockMonthData(currentYear.value, currentMonth.value))
// 如果你希望切月时也变更模拟数据，可在 goPrevMonth / goNextMonth 后重置 records
// 例如：records.value = mockMonthData(currentYear.value, currentMonth.value)

/* -------------------- 映射：当月每日数据 -------------------- */
const monthFirstDay = computed(() => new Date(currentYear.value, currentMonth.value, 1))
const monthDays = computed(() => new Date(currentYear.value, currentMonth.value + 1, 0).getDate())

// 仅取“当前视图月份”的记录，映射为 { [dateStr]: { income, expense, net } }
const dailyMap = computed(() => {
  const map = {}
  const ym = `${currentYear.value}-${pad2(currentMonth.value + 1)}-`
  for (const r of records.value) {
    if (!r?.date) continue
    if (!r.date.startsWith(ym)) continue
    map[r.date] = {
      income: Number(r.income || 0),
      expense: Number(r.expense || 0),
      net: Number(r.income || 0) - Number(r.expense || 0)
    }
  }
  return map
})

/* -------------------- 日历 6x7 网格（含补位） -------------------- */
const calendarCells = computed(() => {
  // 以“周日为一周起点”，计算需要往前补的天数
  // JS 的 getDay：周日=0，周一=1 ... 周六=6
  const first = monthFirstDay.value
  const backfill = first.getDay() // 0~6

  // 日历起始日期（可能是上个月的某一天）
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

/* -------------------- 月度统计（摘要板块） -------------------- */
const monthIncome = computed(() =>
  Object.values(dailyMap.value).reduce((sum, d) => sum + d.income, 0)
)
const monthExpense = computed(() =>
  Object.values(dailyMap.value).reduce((sum, d) => sum + d.expense, 0)
)
const monthNet = computed(() => monthIncome.value - monthExpense.value)

/* -------------------- 视图辅助：着色与提示 -------------------- */
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
  return `${dateStr}：收入 ${formatCurrency(d.income)}｜支出 ${formatCurrency(d.expense)}｜净值 ${formatCurrency(d.net)}`
}
</script>

<style scoped>
/* ----------- 基础布局 ----------- */
.plc-page {
  --bg: #f4f8fb;
  --card: #ffffff;
  --text: #0f172a;
  --muted: #94a3b8;

  /* 盈亏配色（按你的要求：盈利=红、亏损=绿） */
  --profit-bg: #ffe5e5;    /* 红背景（淡） */
  --profit-border: #ef4444;
  --profit-text: #b91c1c;

  --loss-bg: #e8fff3;      /* 绿背景（淡） */
  --loss-border: #10b981;
  --loss-text: #065f46;

  --neutral-bg: #f1f5f9;
  --neutral-border: #cbd5e1;
  --neutral-text: #64748b;

  background: var(--bg);
  min-height: 100%;
  padding: 24px;
  box-sizing: border-box;
  color: var(--text);
  font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Arial, "Noto Sans SC", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
}

.plc-header {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.month-switch {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 8px;
}
.month-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  text-align: center;
}
.btn {
  justify-self: start;
  padding: 8px 12px;
  background: var(--card);
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
}
.btn:last-child { justify-self: end; }

/* ----------- 摘要卡片 ----------- */
.summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}
.card {
  background: var(--card);
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px 18px;
  box-shadow: 0 4px 14px rgba(2, 6, 23, 0.04);
}
.label {
  font-size: 12px;
  color: var(--muted);
  margin-bottom: 6px;
}
.value {
  font-size: 22px;
  font-weight: 800;
}
.value.profit { color: var(--profit-text); }
.value.loss { color: var(--loss-text); }
.value.neutral { color: var(--neutral-text); }

/* ----------- 日历板块 ----------- */
.calendar {
  margin-top: 12px;
  background: var(--card);
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 6px 18px rgba(2, 6, 23, 0.05);
}

/* 星期头 */
.week-headers {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-bottom: 8px;
}
.week-header {
  text-align: center;
  font-weight: 600;
  font-size: 12px;
  color: var(--muted);
}

/* 日期网格 */
.grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

/* 单元格 */
.cell {
  min-height: 86px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  transition: box-shadow .2s ease, transform .08s ease;
}
.cell:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(2, 6, 23, 0.08);
}

.cell-date {
  font-weight: 700;
  font-size: 13px;
  margin-bottom: 2px;
}

/* 收入/支出行 */
.line {
  font-size: 12px;
  display: flex;
  justify-content: space-between;
}
.line.income { color: #059669; }  /* 绿色文字（收入） */
.line.expense { color: #d97706; } /* 橙色文字（支出） */
.line.muted { color: var(--neutral-text); }

/* 非当月日期（置灰） */
.other-month {
  background: #f8fafc;
  color: #cbd5e1;
  border-style: dashed;
}

/* 盈亏着色（按净值） */
.profit {
  background: var(--profit-bg);
  border-color: var(--profit-border);
}
.loss {
  background: var(--loss-bg);
  border-color: var(--loss-border);
}
.neutral {
  background: var(--neutral-bg);
  border-color: var(--neutral-border);
}
/* 📌 图例样式 */
.legend {
  justify-content: center; 
  display: flex;
  gap: 16px;
  margin-top: 12px;
  font-size: 15px;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}
.color-box {
  width: 22px;
  height: 22px;
  border-radius: 4px;
  display: inline-block;
}
.color-box.profit {
  background: var(--profit-bg);
  border: 1px solid var(--profit-border);
}
.color-box.loss {
  background: var(--loss-bg);
  border: 1px solid var(--loss-border);
}
</style>
