import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getInfoByCategoryService } from '@/api/user' // 引入接口方法

export const useMeetingStore = defineStore('meeting', () => {
const records = ref([
    {
      _id: '104',
      title: '产品发布会',
      category: '会议',
      content: '发布新一代智能家居产品。',
      time: '2023-05-05',
    },
    {
      _id: '107',
      title: '部门周例会',
      category: '会议',
      content: '汇报本周工作进展。',
      time: '2023-08-02',
    },
    {
      _id: '110',
      title: '年度预算讨论会',
      category: '会议',
      content: '确定公司下一年度的预算分配。',
      time: '2023-11-30',
    },
  ])
  // 从后端获取会议数据
  const fetchRecords = async () => {
    try {
      const res = await getInfoByCategoryService('meeting')
      records.value = [...records.value,res]
    } catch (err) {
      console.error('获取会议数据失败:', err)
    }
  }

  const addRecord = (content) => {
    const title = content.length > 20 ? content.substring(0, 20) + '...' : content
    const timeStr = new Date().toLocaleString()
    records.value.unshift({
      _id: Date.now().toString(),
      content,
      title,
      time: timeStr
    })
  }

  const updateRecord = (index, newContent) => {
    const title = newContent.length > 20 ? newContent.substring(0, 20) + '...' : newContent
    records.value[index].content = newContent
    records.value[index].title = title
    records.value[index].time = new Date().toLocaleString()
  }

  const deleteRecord = (index) => {
    records.value.splice(index, 1)
  }

  return {
    records,
    fetchRecords,
    addRecord,
    updateRecord,
    deleteRecord
  }
})
