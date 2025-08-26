import { createRouter, createWebHistory } from 'vue-router'  
import Home from '../views/Home.vue'
import Question from '../views/Question.vue'
import Login from '../views/Login.vue'
import ProfileEdit from '../views/ProfileEdit.vue'
import Meeting from '../views/categories/Meeting.vue'    // 会议页面
import Life from '../views/categories/Life.vue'          // 生活页面
import Finance from '../views/categories/Finance.vue'    // 财务页面

const routes = [
  {
    path: '/',          // 根路径对应首页
    name: 'Home',
    component: Home,
    meta: { 
      requiresAuth: false  // 不需要登录也能访问首页
    }
  },

  {
    path: '/question/:id', // 点击侧边栏问题会跳转到这里
    name: 'Question',
    component: Question,
    meta: { requiresAuth: true }
  },

  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      requiresAuth: false  // 不需要登录
    }
  },
  {
    path: '/profile',
    name: 'ProfileEdit',
    component: ProfileEdit,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/meeting',
    name: 'Meeting',
    component: Meeting,
    meta: {
      requiresAuth: true,
      tag: '会议'  // 用于标识该路由对应的标签
    }
  },
  {
    path: '/life',
    name: 'Life',
    component: Life,
    meta: {
      requiresAuth: true,
      tag: '生活'
    }
  },
  {
    path: '/finance',
    name: 'Finance',
    component: Finance,
    meta: {
      requiresAuth: true,
      tag: '财务'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})


export default router
