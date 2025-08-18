import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getInfoByCategoryService } from '@/api/user' // <-- 必须导入，保证会发起请求

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

  // 内部统一的结果标准化函数
  const normalizeList = (data) => {
    return data.map(item => ({
      _id: item.id ?? item._id ?? String(Math.random()),
      title: item.title ?? item.description ?? '',
      category: item.category ?? 'finance',
      content: item.content ?? item.description ?? '',
      timestamp: item.created_at ?? item.timestamp ?? new Date().toISOString()
    }))
  }

  // 从后端抓取（主入口，保证会发起真实请求并在失败时抛错）
  const fetchRecords = async () => {
    try {
      const resp = await getInfoByCategoryService('finance')
      // 兼容多种后端返回结构：直接数组 或 { data: [...] }
      const data = Array.isArray(resp) ? resp : (resp && Array.isArray(resp.data) ? resp.data : [])
      if (data.length > 0) {
        records.value = normalizeList(data)
      } else {
        // 如果后端返回空数组，我们选择保留本地 mock 数据（避免页面瞬间空白）
        // 若你更希望替换成空数组，改为 records.value = []
      }
      return records.value
    } catch (error) {
      console.error('获取财务数据失败:', error)
      // 不吞错误，向上抛出 —— 让页面或全局拦截器接管错误展示（你的项目会显示红色“服务异常”）
      throw error
    }
  }

  // 兼容旧名字：fetchRecord（如果页面调用旧名）
  const fetchRecord = async () => {
    return fetchRecords()
  }

  // 本地/前端的 CRUD 支持（保留）
  const addRecord = (record) => {
    records.value.unshift({
      ...record,
      _id: Date.now().toString(),
      timestamp: new Date().toISOString()
    })
  }

  const editRecord = (id, newContent) => {
    const index = records.value.findIndex(r => r._id === id)
    if (index !== -1) {
      records.value[index].content = newContent
      records.value[index].title =
        newContent.substring(0, 20) + (newContent.length > 20 ? '...' : '')
      records.value[index].timestamp = new Date().toISOString()
    }
  }

  const updateRecord = (index, newContent) => {
    if (!records.value[index]) return
    records.value[index].content = newContent
    records.value[index].title = newContent.substring(0, 20) + (newContent.length > 20 ? '...' : '')
    records.value[index].timestamp = new Date().toISOString()
  }

  const deleteRecord = (id) => {
    records.value = records.value.filter(r => r._id !== id)
  }

  const deleteRecordByIndex = (index) => {
    if (index >= 0 && index < records.value.length) records.value.splice(index, 1)
  }

  return {
    records,
    fetchRecords,
    fetchRecord,
    addRecord,
    editRecord,
    updateRecord,
    deleteRecord,
    deleteRecordByIndex
  }
}, {
  persist: true
})
