import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getInfoByCategoryService } from '@/api/user'

export const useFinanceStore = defineStore('finance', () => {
  const records = ref([
  {
    id: '2025-07-03-0',
    date: '2025-07-03',
    type: 'income',
    amount: 3500.50,
    title: '工资',
    description: '月度工资',
    timestamp: new Date('2025-07-03T09:30:00').getTime(),
    category: '财务'
  },
  {
    id: '2025-07-15-1',
    date: '2025-07-15',
    type: 'expense',
    amount: -120.75,
    title: '餐饮',
    description: '日常餐饮',
    timestamp: new Date('2025-07-15T12:15:00').getTime(),
    category: '财务'
  },
  {
    id: '2025-08-01-2',
    date: '2025-08-01',
    type: 'income',
    amount: 4200.00,
    title: '奖金',
    description: '月度奖金',
    timestamp: new Date('2025-08-01T10:45:00').getTime(),
    category: '财务'
  },
  {
    id: '2025-08-09-3',
    date: '2025-08-09',
    type: 'expense',
    amount: -320.50,
    title: '交通',
    description: '日常交通',
    timestamp: new Date('2025-08-09T08:20:00').getTime(),
    category: '财务'
  },
  {
    id: '2025-08-24-4',
    date: '2025-08-24',
    type: 'expense',
    amount: -1500.00,
    title: '房租',
    description: '日常房租',
    timestamp: new Date('2025-08-24T09:00:00').getTime(),
    category: '财务'
  },
  {
    id: '2025-09-02-5',
    date: '2025-09-02',
    type: 'income',
    amount: 3000.00,
    title: '投资收益',
    description: '月度投资收益',
    timestamp: new Date('2025-09-02T14:30:00').getTime(),
    category: '财务'
  },
  {
    id: '2025-09-10-6',
    date: '2025-09-10',
    type: 'expense',
    amount: -200.00,
    title: '娱乐',
    description: '日常娱乐',
    timestamp: new Date('2025-09-10T18:45:00').getTime(),
    category: '财务'
  },
  {
    id: '2025-09-15-7',
    date: '2025-09-15',
    type: 'income',
    amount: 500.00,
    title: '兼职',
    description: '月度兼职',
    timestamp: new Date('2025-09-15T16:10:00').getTime(),
    category: '财务'
  },
  {
    id: '2025-09-20-8',
    date: '2025-09-20',
    type: 'expense',
    amount: -90.25,
    title: '购物',
    description: '日常购物',
    timestamp: new Date('2025-09-20T11:50:00').getTime(),
    category: '财务'
  },
  {
    id: '2025-09-28-9',
    date: '2025-09-28',
    type: 'income',
    amount: 600.00,
    title: '退款',
    description: '月度退款',
    timestamp: new Date('2025-09-28T13:25:00').getTime(),
    category: '财务'
  }
])
  const pad2 = (n) => String(n).padStart(2, '0')

  const loadRecordsByMonth = (year, month) => {
    const monthStr = pad2(month + 1)
    // 筛选现有 records 中「属于该年月」的记录（date 以 "YYYY-MM" 开头）
    const filteredRecords = records.value.filter(record => 
      record.date && record.date.startsWith(`${year}-${monthStr}`)
    )
    // 如果没有对应年月的记录，初始化模拟数据
    if (filteredRecords.length === 0) {
      console.log('初始化模拟数据')
    }
  }

  //规格化后端得到数据
  const normalizeList = (data) => {
    return data.map(item => ({
      _id: item.id ?? item._id ?? String(Math.random()),
      title: item.title ?? item.description ?? '',
      //category: item.category ?? '财务',
      content: item.content ?? item.description ?? '',
      timestamp: item.created_at ?? item.timestamp ?? new Date().toISOString(),
      // 保留财务特有字段
      date: item.date ?? '',
      //type: item.type ?? 'expense',
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
    loadRecordsByMonth
  }
}, {
  persist: true
})
