import request from '@/utils/request.js'

// ---------- 用户认证 ----------

// 注册接口
export const userRegisterService = ({ username, password, email }) => {
  return request.post('/auth/register', {
    username,
    password,
    email,
  })
}

// 登录接口
export const userLoginService = ({ username, password }) => {
  return request.post('/auth/login', {
    username,
    password,
  })
}

// ---------- 信息处理接口 ----------

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
