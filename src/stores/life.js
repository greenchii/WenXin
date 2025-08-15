import { ref } from 'vue'
import { defineStore } from 'pinia'
import {getInfoByCategoryService} from '@/api/user'

export const useLifeStore = defineStore('life', () => {
  // 状态
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

  //从后端抓取
  const fetchRecord=async()=>{
    try{
      const res=await getInfoByCategoryService('life')
      records.value=[...records.value,res]
    }catch(error){
      console.error('获取生活数据失败:', err)      
    }
  }

  // 添加记录
  const addRecord = (content) => {
    const title = content.length > 20 ? content.substring(0, 20) + '...' : content
    const timestamp = new Date().toLocaleString()
    records.value.unshift({
      _id: Date.now().toString(),
      title,
      category: '生活',
      content,
      timestamp
    })
  }

  // 更新记录
  const updateRecord = (index, newContent) => {
    const title = newContent.length > 20 ? newContent.substring(0, 20) + '...' : newContent
    records.value[index].content = newContent
    records.value[index].title = title
    records.value[index].timestamp = new Date().toLocaleString()
  }

  // 删除记录
  const deleteRecord = (index) => {
    records.value.splice(index, 1)
  }

  return {
    records,
    fetchRecord,
    addRecord,
    updateRecord,
    deleteRecord
  }
}, {
  persist: true
})
