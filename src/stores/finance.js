import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useFinanceStore = defineStore('finance', () => {
  // 状态
  
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
  {
    _id: '103',
    title: '市场经济分析报告',
    category: '经济',
    content: '分析近期市场变化与趋势。',
    timestamp: '2023-04-10',
  },
  {
    _id: '104',
    title: '产品发布会',
    category: '会议',
    content: '发布新一代智能家居产品。',
    timestamp: '2023-05-05',
  },
  {
    _id: '105',
    title: '社区志愿活动',
    category: '生活',
    content: '参加社区公益清洁活动。',
    timestamp: '2023-06-12',
  },
  {
    _id: '106',
    title: '全球经济论坛',
    category: '经济',
    content: '讨论国际贸易与投资机会。',
    timestamp: '2023-07-18',
  },
  {
    _id: '107',
    title: '部门周例会',
    category: '会议',
    content: '汇报本周工作进展。',
    timestamp: '2023-08-02',
  },
  {
    _id: '108',
    title: '家庭聚会',
    category: '生活',
    content: '一家人聚餐庆祝父母结婚纪念日。',
    timestamp: '2023-09-25',
  },
  {
    _id: '109',
    title: '金融政策研讨',
    category: '经济',
    content: '探讨新出台的金融监管政策。',
    timestamp: '2023-10-11',
  },
  {
    _id: '110',
    title: '年度预算讨论会',
    category: '会议',
    content: '确定公司下一年度的预算分配。',
    timestamp: '2023-11-30',
  },
  ])

  //从后端抓取
  const fetchRecord=async()=>{
    try{
      const res=await getInfoByCategoryService('finance')
      records.value=[...records.value,res]
    }catch(error){
      console.error('获取财务数据失败:', err)      
    }
  }
  
  // 操作方法
  const addRecord = (record) => {
    records.value.push({
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
    }
  }

  const deleteRecord = (id) => {
    records.value = records.value.filter(r => r._id !== id)
  }

  return {
    records,
    fetchRecord,
    addRecord,
    editRecord,
    deleteRecord
  }
}, {
  persist: true 
})
