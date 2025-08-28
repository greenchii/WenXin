import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getInfoByCategoryService } from '@/api/user'

// 辅助函数：数字补零
const pad2 = (n) => String(n).padStart(2, '0')

export const useFinanceStore = defineStore('finance', () => {
  const records = ref([])

  // 生成模拟财务数据
  const mockDetailedFinanceData = (year, month) => {
    const first = new Date(year, month, 1)
    const days = new Date(year, month + 1, 0).getDate()
    const list = []
    const incomeTypes = ['工资', '奖金', '投资收益', '兼职', '退款']
    const expenseTypes = ['餐饮', '购物', '交通', '房租', '水电', '娱乐', '医疗']
    
    for (let i = 1; i <= days; i++) {
      const date = `${year}-${pad2(month + 1)}-${pad2(i)}`
      if (Math.random() < 0.7) {
        const recordCount = Math.floor(Math.random() * 3) + 1 // 1-3条记录
        for (let j = 0; j < recordCount; j++) {
          // 随机时间点
          const hours = Math.floor(Math.random() * 24)
          const minutes = Math.floor(Math.random() * 60)
          const seconds = Math.floor(Math.random() * 60)
          
          const isIncome = Math.random() > 0.3
          const amount = Number((Math.random() * (isIncome ? 5000 : 2000) + (isIncome ? 1000 : 50)).toFixed(2))
          
          list.push({
            id: `${date}-${j}`,
            date,
            type: isIncome ? 'income' : 'expense',
            amount: isIncome ? amount : -amount,
            title: isIncome ? incomeTypes[Math.floor(Math.random() * incomeTypes.length)] : expenseTypes[Math.floor(Math.random() * expenseTypes.length)],
            description: isIncome ? `月度${incomeTypes[Math.floor(Math.random() * incomeTypes.length)]}` : `日常${expenseTypes[Math.floor(Math.random() * expenseTypes.length)]}`,
            timestamp: new Date(`${date}T${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`).getTime(),
            category: '财务' // 统一添加财务类别，与原有数据兼容
          })
        }
      }
    }
    return list
  }

  // 初始化指定月份的模拟数据
  const initMockData = (year, month) => {
    records.value = mockDetailedFinanceData(year, month)
  }

  // 加载指定月份的数据
  const loadRecordsByMonth = (year, month) => {
    // 实际项目中这里可以从API加载数据，这里先用模拟数据
    records.value = mockDetailedFinanceData(year, month)
  }

  const normalizeList = (data) => {
    return data.map(item => ({
      _id: item.id ?? item._id ?? String(Math.random()),
      title: item.title ?? item.description ?? '',
      category: item.category ?? '财务',
      content: item.content ?? item.description ?? '',
      timestamp: item.created_at ?? item.timestamp ?? new Date().toISOString(),
      // 保留财务特有字段
      date: item.date ?? '',
      type: item.type ?? 'expense',
      amount: item.amount ?? 0
    }))
  }

  const fetchRecords = async () => {
    try {
      const res = await getInfoByCategoryService('finance')
      console.log(res);
      
      if (res.data.length > 0) {
        records.value = normalizeList(res.data)
      }
      return records.value
    } catch (error) {
      console.error('获取财务数据失败:', error)
      // 失败时使用模拟数据
      const now = new Date()
      records.value = mockDetailedFinanceData(now.getFullYear(), now.getMonth())
      throw error
    }
  }


  const addRecord = (record) => {
    records.value.unshift({
      ...record,
      id: Date.now().toString(),
      _id: Date.now().toString(), // 兼容原有ID字段
      timestamp: new Date().getTime(),
      category: '财务'
    })
  }

  // 编辑函数
  const editRecord = (id, updatedData) => {
    const index = records.value.findIndex(r => r.id === id || r._id === id)
    if (index !== -1) {
      records.value[index] = {
        ...records.value[index],
        ...updatedData
      }
    }
  }

  const deleteRecord = (id) => {
    records.value = records.value.filter(r => r.id !== id && r._id !== id)
  }

  return {
    records,
    fetchRecords,
    addRecord,
    editRecord,
    deleteRecord,
    initMockData,
    loadRecordsByMonth,
    mockDetailedFinanceData
  }
}, {
  persist: true
})
