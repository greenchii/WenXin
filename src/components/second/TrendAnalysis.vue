<template>
  <div class="trend-analysis">
    <div class="page-header">
      <h1>收支趋势分析</h1>
      <button class="back-btn" @click="goBack">
        <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M11.67 3.87L9.9 2.1 0 12l9.9 9.9 1.77-1.77L3.54 12l8.13-8.13z" fill="currentColor"/>
        </svg>
        返回上一页
      </button>
    </div>
    <div class="panel-row">
      <div ref="barRef" class="chart card" />
      <div ref="pieRef" class="chart card" />
    </div>
    <div class="panel-row">
      <div ref="areaRef" class="chart card wide" />
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'

// 未来可由 store 传入真实数据
const props = defineProps({
  // 月度维度数据：[{ month: '2025-01', income: 12000, expense: 8000 }]
  monthlySeries: { type: Array, default: () => [] },
  // 成本占比：[{ name: '房租', value: 3200 }, ...]
  costDistribution: { type: Array, default: () => [] },
  // 日/周趋势：[{ date: '2025-09-01', income: 500, expense: 200 }]
  dailySeries: { type: Array, default: () => [] }
})

const barRef = ref(null)
const pieRef = ref(null)
const areaRef = ref(null)

let barChart, pieChart, areaChart

const router = useRouter()
const goBack = () => router.back()

function getMockMonthly() {
  return Array.from({ length: 12 }, (_, i) => {
    const month = `${new Date().getFullYear()}-${String(i + 1).padStart(2, '0')}`
    const income = Math.round(8000 + Math.random() * 9000)
    const expense = Math.round(4000 + Math.random() * 7000)
    return { month, income, expense }
  })
}

function getMockCosts() {
  const cats = ['房租', '餐饮', '交通', '水电网', '娱乐', '学习', '其他']
  return cats.map(name => ({ name, value: Math.round(500 + Math.random() * 4000) }))
}

function getMockDaily() {
  const days = 30
  const base = Date.now() - (days - 1) * 24 * 60 * 60 * 1000
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(base + i * 86400000).toISOString().slice(0, 10)
    const income = Math.round(200 + Math.random() * 900)
    const expense = Math.round(100 + Math.random() * 700)
    return { date, income, expense }
  })
}

function buildBarOption(dataset) {
  const months = dataset.map(d => d.month)
  const income = dataset.map(d => d.income)
  const expense = dataset.map(d => d.expense)
  return {
    backgroundColor: 'transparent',
    title: { text: '收支对比（按月）', left: 'center', top: 6, textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 40, right: 20, top: 50, bottom: 40 },
    legend: { top: 24, right: 10 },
    xAxis: { type: 'category', data: months, axisTick: { show: false } },
    yAxis: { type: 'value' },
    series: [
      {
        name: '收入',
        type: 'bar',
        data: income,
        barWidth: 14,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#6be6c1' },
            { offset: 1, color: '#3fb99a' }
          ]),
          shadowColor: 'rgba(0,0,0,0.15)',
          shadowBlur: 8
        }
      },
      {
        name: '支出',
        type: 'bar',
        data: expense,
        barWidth: 14,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#fca5a5' },
            { offset: 1, color: '#f87171' }
          ]),
          shadowColor: 'rgba(0,0,0,0.15)',
          shadowBlur: 8
        }
      }
    ]
  }
}

function buildPieOption(costs) {
  const total = costs.reduce((s, c) => s + c.value, 0) || 1
  return {
    backgroundColor: 'transparent',
    title: { text: '成本占比看板', left: 'center', top: 6, textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'item', formatter: params => `${params.name}: ${params.value} (${params.percent}%)` },
    legend: { type: 'scroll', bottom: 0 },
    series: [
      {
        name: '成本占比',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '50%'],
        roseType: 'radius',
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
        label: {
          formatter: p => `${p.name}\n${((p.value / total) * 100).toFixed(1)}%`,
        },
        emphasis: { scale: true, scaleSize: 10 },
        data: costs
      }
    ]
  }
}

function buildAreaOption(dataset) {
  const dates = dataset.map(d => d.date)
  const income = dataset.map(d => d.income)
  const expense = dataset.map(d => d.expense)
  return {
    backgroundColor: 'transparent',
    title: { text: '最近趋势（面积折线）', left: 'center', top: 6, textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 20, top: 50, bottom: 40 },
    legend: { top: 24, right: 10 },
    xAxis: { type: 'category', data: dates, boundaryGap: false },
    yAxis: { type: 'value' },
    series: [
      {
        name: '收入',
        type: 'line',
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 2, color: '#10b981' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(16,185,129,0.35)' },
            { offset: 1, color: 'rgba(16,185,129,0.05)' }
          ])
        },
        data: income
      },
      {
        name: '支出',
        type: 'line',
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 2, color: '#ef4444' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(239,68,68,0.35)' },
            { offset: 1, color: 'rgba(239,68,68,0.05)' }
          ])
        },
        data: expense
      }
    ]
  }
}

function resizeAll() {
  barChart && barChart.resize()
  pieChart && pieChart.resize()
  areaChart && areaChart.resize()
}

function initCharts() {
  if (barRef.value && !barChart) barChart = echarts.init(barRef.value)
  if (pieRef.value && !pieChart) pieChart = echarts.init(pieRef.value)
  if (areaRef.value && !areaChart) areaChart = echarts.init(areaRef.value)

  const monthly = props.monthlySeries.length ? props.monthlySeries : getMockMonthly()
  const costs = props.costDistribution.length ? props.costDistribution : getMockCosts()
  const daily = props.dailySeries.length ? props.dailySeries : getMockDaily()

  barChart.setOption(buildBarOption(monthly))
  pieChart.setOption(buildPieOption(costs))
  areaChart.setOption(buildAreaOption(daily))

  resizeAll()
}

function updateCharts() {
  if (!barChart || !pieChart || !areaChart) return
  const monthly = props.monthlySeries.length ? props.monthlySeries : getMockMonthly()
  const costs = props.costDistribution.length ? props.costDistribution : getMockCosts()
  const daily = props.dailySeries.length ? props.dailySeries : getMockDaily()
  barChart.setOption(buildBarOption(monthly), true)
  pieChart.setOption(buildPieOption(costs), true)
  areaChart.setOption(buildAreaOption(daily), true)
}

onMounted(async () => {
  await nextTick()
  initCharts()
  window.addEventListener('resize', resizeAll)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeAll)
  barChart && barChart.dispose()
  pieChart && pieChart.dispose()
  areaChart && areaChart.dispose()
})

watch(() => [props.monthlySeries, props.costDistribution, props.dailySeries], () => {
  nextTick().then(updateCharts)
}, { deep: true })
</script>

<style scoped>
.trend-analysis  {
  --primary: #4c6ef5;
  --primary-light: #eef2ff;
  --light-gray: #ffffff;
  --text: #0f172a;
  --text-light: #64748b;
  --accent:#4c6ef5;
  --border:#e6ecff;
  --background: #f8fafc;
  --card: #ffffff;
  --danger: #e53e3e;
  padding: 18px;
  min-height: calc(100vh - 44px);
  background: var(--background);
  overflow-y: scroll;
  overflow-x: hidden;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
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
  gap: 8px;
  background: var(--light-gray);
  border: 1px solid var(--border);
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

.back-btn:hover {background-color: #e2e8f0;}
.back-btn .icon {width: 18px;height: 18px;}

.trend-analysis {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}
.panel-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.chart.card {
  height: 320px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.06);
  padding: 8px;
}
.chart.card.wide {
  grid-column: 1 / span 2;
  height: 360px;
}

@media (max-width: 960px) {
  .panel-row { grid-template-columns: 1fr; }
  .chart.card.wide { grid-column: 1 / span 1; }
}
</style>
