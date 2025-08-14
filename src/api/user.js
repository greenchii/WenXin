import request from '@/utils/request.js'

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

// 上传文本或图片
export const uploadInfoService = (formData) => {
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

// 获取指定分类信息
export const getInfoByCategoryService = (category) => {
  return request.get('/process/info', {
    params: { category },
  })
}

// 获取信息详情
export const getInfoDetailService = (infoId) => {
  return request.get(`/process/info/${infoId}`)
}
