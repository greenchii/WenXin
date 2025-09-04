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
