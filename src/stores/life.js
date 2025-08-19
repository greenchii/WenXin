import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getInfoByCategoryService } from '@/api/user'

export const useLifeStore = defineStore('life', () => {
  // 生活记录状态
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

  // 数据格式统一
  const normalizeList = (data) => {
    return data.map(item => ({
      _id: item.id ?? item._id ?? String(Math.random()),
      title: item.title ?? item.description ?? '',
      category: item.category ?? '生活',
      content: item.content ?? item.description ?? '',
      timestamp: item.created_at ?? item.timestamp ?? new Date().toISOString()
    }))
  }

  // 拉取生活记录
  const fetchRecords = async () => {
    try {
      const resp = await getInfoByCategoryService('life')
      const data = Array.isArray(resp) ? resp : (resp?.data ?? [])
      if (data.length > 0) {
        records.value = normalizeList(data)
      }
      return records.value
    } catch (error) {
      console.error('获取生活数据失败:', error)
      throw error
    }
  }

  // 添加记录
  const addRecord = (record) => {
    records.value.unshift({
      ...record,
      _id: Date.now().toString(),
      category: '生活',
      timestamp: new Date().toISOString()
    })
  }

  // 编辑记录
  const editRecord = (id, updatedData) => {
    const index = records.value.findIndex(r => r._id === id)
    if (index !== -1) {
      records.value[index] = {
        ...records.value[index],
        ...updatedData
      }
    }
  }

  // 删除记录
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
