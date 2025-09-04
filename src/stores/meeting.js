import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getInfoByCategoryService } from '@/api/conversation'

export const useMeetingStore = defineStore('meeting', () => {
  // 默认示例数据（保证组件在无网络或接口返回空时仍有显示）
  const records = ref([
    {
      _id: '103',
      title: '市场经济分析报告',
      category: '会议',
      content: '分析近期市场变化与趋势。',
      timestamp: '2023-04-10',
    },
    {
      _id: '104',
      title: '产品发布会',
      category: '会议',
      content: '发布新一代智能家居产品，包含智能音箱、灯光控制系统。',
      timestamp: '2023-05-05',
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

  // 标准化函数（把后端返回项转换为统一字段）
  const normalizeList = (data) => {
    return data.map(item => ({
      _id: item.id ?? item._id ?? String(Math.random()),
      title: item.title ?? item.description ?? '',
      category: item.category ?? '会议',
      content: item.content ?? item.description ?? '',
      // 支持各种时间字段名
      timestamp: item.created_at ?? item.timestamp ?? item.time ?? new Date().toISOString().split('T')[0]
    }))
  }

  // 拉取远端数据（按需替换 records）
  const fetchRecords = async () => {
    try {
      const res = await getInfoByCategoryService('meeting')
      console.log(res)

      if (res?.data?.length > 0) {
        records.value = normalizeList(res.data)
      }

      return records.value
    } catch (error) {
      console.error('获取会议数据失败:', error)
      // 出错时返回默认/现有 records
      return records.value
    }
  }

  // 添加新记录
  const addRecord = (record) => {
    records.value.unshift({
      ...record,
      _id: Date.now().toString(),
      timestamp: record.timestamp || new Date().toISOString().split('T')[0],
      category: record.category ?? '会议'
    })
  }

  // 编辑记录
  const editRecord = (id, updated) => {
    const index = records.value.findIndex(r => r._id === id)
    if (index !== -1) {
      records.value[index] = {
        ...records.value[index],
        ...updated,
        title: updated.title ?? records.value[index].title,
        content: updated.content ?? records.value[index].content,
        timestamp: updated.timestamp ?? records.value[index].timestamp
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

