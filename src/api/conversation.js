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

// 上传文本或文件（必填 conversation_id，文本和文件二选一）
export const uploadInfoService = ({ conversation_id, file, text }) => {
  const formData = new FormData()
  formData.append('conversation_id', conversation_id)
  if (file) formData.append('file', file)
  if (text) formData.append('text', text)

  return request.post('/process/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

// 上传文本 + 图片（新接口）
export const uploadMixedInfoService = (formData) => {
  return request.post('/process/upload/mixed', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

// 获取所有信息（不带分页）
export const getAllInfoService = () => {
  return request.get('/process/info')
}

// 获取所有信息（支持分页与分类）
export const getInfoListService = ({ category, page = 1, page_size = 10 }) => {
  return request.get('/process/info/all', {
    params: {
      category,
      page,
      page_size,
    },
  })
}

// 获取所有分类信息
export const getInfoByCategoryService = (category) => {
  return request.get('/process/info', {
    params: { category },
  })
}

// 获取信息详情
export const getInfoDetailService = (infoId) => {
  return request.get(`/process/info/${infoId}`)
}

// 发送消息接口
export const sendMessageService = (conv_id, content) => {
  return request.post(`/conversation/${conv_id}/message`, {
    content: content 
  })
}