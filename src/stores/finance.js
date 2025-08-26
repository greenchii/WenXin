import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getInfoByCategoryService } from '@/api/user'

export const useFinanceStore = defineStore('finance', () => {
  const records = ref([
    {
      _id: '101',
      title: '年度财务报告',
      category: '财务',
      content: '2023年度公司财务总结与分析',
      timestamp: '2023-02-15',
    },
    {
      _id: '102',
      title: '季度预算审核',
      category: '财务',
      content: 'Q2预算执行情况审核',
      timestamp: '2023-05-20',
    },
  ])

  const normalizeList = (data) => {
    return data.map(item => ({
      _id: item.id ?? item._id ?? String(Math.random()),
      title: item.title ?? item.description ?? '',
      category: item.category ?? 'finance',
      content: item.content ?? item.description ?? '',
      timestamp: item.created_at ?? item.timestamp ?? new Date().toISOString()
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
      throw error
    }
  }


  const addRecord = (record) => {
    records.value.unshift({
      ...record,
      _id: Date.now().toString(),
      timestamp: new Date().toISOString()
    })
  }

  // 编辑函数
  const editRecord = (id, updatedData) => {
    const index = records.value.findIndex(r => r._id === id)
    if (index !== -1) {
      records.value[index] = {
        ...records.value[index],
        ...updatedData
      }
    }
  }

  const deleteRecord = (id) => {
    records.value = records.value.filter(r => r._id !== id)
  }

  return {
    records,
    fetchRecords,
    addRecord,
    editRecord,
    deleteRecord
  }
}, {
  persist: true
})
