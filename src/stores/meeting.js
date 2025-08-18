import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getInfoByCategoryService } from '@/api/user'

export const useMeetingStore = defineStore('meeting', () => {
  const records = ref([
    {
      _id: '103',
      title: '市场经济分析报告',
      category: '会议',
      content: '分析近期市场变化与趋势。',
      timestamp: '2023-04-10', // 统一使用timestamp字段
    },
    {
      _id: '104',
      title: '产品发布会',
      category: '会议',
      content: '发布新一代智能家居产品，包含智能音箱、灯光控制系统。',
      timestamp: '2023-05-05', // 统一使用timestamp字段
    },
    {
      _id: '106',
      title: '全球经济论坛',
      category: '会议',
      content: '讨论国际贸易与投资机会。',
      timestamp: '2023-07-18',
    },
    {
      _id: '107',
      title: '部门周例会',
      category: '会议',
      content: '汇报本周工作进展，讨论下周任务分配。',
      timestamp: '2023-08-02',
    },
    {
      _id: '109',
      title: '金融政策研讨',
      category: '会议',
      content: '探讨新出台的金融监管政策。',
      timestamp: '2023-10-11',
    },
    {
      _id: '110',
      title: '年度预算讨论会',
      category: '会议',
      content: '确定公司下一年度的预算分配，重点投入研发部门。',
      timestamp: '2023-11-30',
    },
  ])

  // 内部统一的结果标准化函数（与财务保持一致）
  const normalizeList = (data) => {
    return data.map(item => ({
      _id: item.id ?? item._id ?? String(Math.random()),
      title: item.title ?? item.description ?? '',
      category: item.category ?? '会议',
      content: item.content ?? item.description ?? '',
      timestamp: item.created_at ?? item.timestamp ?? item.time ?? new Date().toISOString().split('T')[0]
    }))
  }

  // 从后端抓取（与财务保持一致的实现）
  const fetchRecords = async () => {
    try {
      const resp = await getInfoByCategoryService('meeting')
      // 兼容多种后端返回结构：直接数组 或 { data: [...] }
      const data = Array.isArray(resp) ? resp : (resp && Array.isArray(resp.data) ? resp.data : [])
      if (data.length > 0) {
        records.value = normalizeList(data)
      }
      return records.value
    } catch (error) {
      console.error('获取会议数据失败:', error)
      throw error // 不吞错误，让全局处理
    }
  }

  // 兼容旧名字
  const fetchRecord = async () => {
    return fetchRecords()
  }

  // 添加新记录
  const addRecord = (content) => {
    const title = content.length > 20 ? content.substring(0, 20) + '...' : content
    const timeStr = new Date().toISOString().split('T')[0]
    records.value.unshift({
      _id: Date.now().toString(),
      content,
      title,
      timestamp: timeStr, // 使用timestamp字段
      category: '会议'
    })
  }

  // 编辑记录（按ID）
  const editRecord = (id, newContent) => {
    const index = records.value.findIndex(r => r._id === id)
    if (index !== -1) {
      records.value[index].content = newContent
      records.value[index].title = newContent.substring(0, 20) + (newContent.length > 20 ? '...' : '')
      records.value[index].timestamp = new Date().toISOString().split('T')[0]
    }
  }

  // 更新记录（按索引）
  const updateRecord = (index, newContent) => {
    if (!records.value[index]) return
    records.value[index].content = newContent
    records.value[index].title = newContent.substring(0, 20) + (newContent.length > 20 ? '...' : '')
    records.value[index].timestamp = new Date().toISOString().split('T')[0]
  }

  // 删除记录（按ID）
  const deleteRecord = (id) => {
    records.value = records.value.filter(r => r._id !== id)
  }

  // 按索引删除
  const deleteRecordByIndex = (index) => {
    if (index >= 0 && index < records.value.length) records.value.splice(index, 1)
  }

  // 按单个日期统计数量
  const getRecordsCountByDate = (date) => {
    if (!date) return 0
    return records.value.filter(item => {
      const recordDate = new Date(item.timestamp).toISOString().split('T')[0]
      return recordDate === date
    }).length
  }

  // 按日期筛选记录
  const getRecordsByDate = (date) => {
    if (!date) return [...records.value]
    return records.value.filter(item => {
      const recordDate = new Date(item.timestamp).toISOString().split('T')[0]
      return recordDate === date
    })
  }

  return {
    records,
    fetchRecords,
    fetchRecord,
    addRecord,
    editRecord,
    updateRecord,
    deleteRecord,
    deleteRecordByIndex,
    getRecordsCountByDate,
    getRecordsByDate
  }
}, {
  persist: true // 与财务保持一致，添加持久化
})
    