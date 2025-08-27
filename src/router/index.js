import { createRouter, createWebHistory } from 'vue-router'  
import Home from '../views/Home.vue'
import Question from '../views/Question.vue'
import Login from '../views/Login.vue'
import ProfileEdit from '../views/ProfileEdit.vue'
import Meeting from '../views/categories/Meeting.vue'    
import Life from '../views/categories/Life.vue'          
import Finance from '../views/categories/Finance.vue'    
import Calendar from '@/components/second/Calendar.vue' 
import TrendAnalysis from '@/components/second/TrendAnalysis.vue'  // 收支趋势分析组件
import CostAnalysis from '@/components/second/CostAnalysis.vue'    // 成本占比看板组件
import CashFlowForecast from '@/components/second/CashFlowForecast.vue'  // 现金流预测组件

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
        name: 'FinanceCalendar',  // 盈亏日历路由名称
        component: Calendar,
        meta: {
          requiresAuth: true,
          tag: '财务'
        }
      },
      {
        path: '/trend',
        name: 'TrendAnalysis',  // 收支趋势分析路由名称
        component: TrendAnalysis,
        meta: {
          requiresAuth: true,
          tag: '财务'
        }
      },
      {
        path: '/cost',
        name: 'CostAnalysis',  // 成本占比看板路由名称
        component: CostAnalysis,
        meta: {
          requiresAuth: true,
          tag: '财务'
        }
      },
      {
        path: '/cashflow',
        name: 'CashFlowForecast',  // 现金流预测路由名称
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
