import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getInfoByCategoryService } from '@/api/user'

export const useLifeStore = defineStore('life', () => {
  // 默认示例数据
  const records = ref([
    {
      _id: '105',
      title: '社区志愿活动',
      category: '生活',
      content: '参加社区公益清洁活动。',
      timestamp: '2023-06-12',
    },
    {
      _id: '108',
      title: '家庭聚会',
      category: '生活',
      content: '一家人聚餐庆祝父母结婚纪念日。',
      timestamp: '2023-09-25',
    }
  ])

  // 统一格式化后端数据为前端所需结构
  const normalizeList = (data) => {
    return data.map(item => ({
      _id: item.id ?? item._id ?? String(Math.random()),
      title: item.title ?? item.description ?? '',
      category: item.category ?? '生活',
      content: item.content ?? item.description ?? '',
      timestamp: item.created_at ?? item.timestamp ?? item.time ?? new Date().toISOString().split('T')[0]
    }))
  }

  // 拉取生活记录（按需覆盖示例数据）
  const fetchRecords = async () => {
    try {
      const res = await getInfoByCategoryService('life')
      console.log(res);
      
      if (res.data && res.data.length > 0) {
        records.value = normalizeList(res.data)
      }
      return records.value
    } catch (error) {
      console.error('获取生活数据失败:', error)
      // 返回现有示例数据以保证界面可用
      return records.value
    }
  }

  const addRecord = (record) => {
    records.value.unshift({
      ...record,
      _id: Date.now().toString(),
      category: '生活',
      timestamp: record.timestamp || new Date().toISOString().split('T')[0]
    })
  }

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
