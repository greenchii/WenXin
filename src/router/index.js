import { createRouter, createWebHistory } from 'vue-router'  

// 所有组件均采用异步导入方式
const Home = () => import('../views/Home.vue')
const Question = () => import('../views/Question.vue')
const Login = () => import('../views/Login.vue')
const ProfileEdit = () => import('../views/ProfileEdit.vue')
const Meeting = () => import('../views/categories/Meeting.vue')    
const Life = () => import('../views/categories/Life.vue')          
const Finance = () => import('../views/categories/Finance.vue')    
const Calendar = () => import('@/components/second/Calendar.vue') 
const TrendAnalysis = () => import('@/components/second/TrendAnalysis.vue')
const CostAnalysis = () => import('@/components/second/CostAnalysis.vue')
const CashFlowForecast = () => import('@/components/second/CashFlowForecast.vue')

const routes = [
  {
    path: '/',          
    name: 'Home',
    component: Home,
    meta: { 
      requiresAuth: false  
    }
  },
  {
    path: '/question/:id',
    name: 'Question',
    component: Question,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      requiresAuth: false
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
      tag: '会议'  
    },
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
    },
  },
  {
    path: '/calendar',
    name: 'FinanceCalendar',
    component: Calendar,
    meta: {
      requiresAuth: true,
      tag: '财务'
    }
  },
  {
    path: '/trend',
    name: 'TrendAnalysis',
    component: TrendAnalysis,
    meta: {
      requiresAuth: true,
      tag: '财务'
    }
  },
  {
    path: '/cost',
    name: 'CostAnalysis',
    component: CostAnalysis,
    meta: {
      requiresAuth: true,
      tag: '财务'
    }
  },
  {
    path: '/cashflow',
    name: 'CashFlowForecast',
    component: CashFlowForecast,
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

