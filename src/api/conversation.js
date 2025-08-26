import request from '@/utils/request.js'

// 创建对话
export const createConversationService = () => {
  return request.post('/conversation')
}

// 获取对话列表
export const getConversationListService = (dateRange) => {
  return request.get('/conversation', {
    params: {
      date_range: dateRange
    }
  })
}

// 获取对话详情
export const getConversationDetailService = (convId) => {
  return request.get(`/conversation/${convId}`)
}
