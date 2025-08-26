import { defineStore } from 'pinia'
import dayjs from 'dayjs'
import { useUserStore } from '@/stores/user.js'
import {
  getConversationListService,
  getConversationDetailService,
  createConversationService
} from '@/api/conversation'

/**
 * History store
 * - 本地优先（localStorage）
 * - 若浏览器无本地数据，会用 loadTestData() 填充（你要求的完整示例数据）
 * - 若已登录，会尝试异步从后端拉取并合并
 */

export const useHistoryStore = defineStore('history', {
  state: () => ({
    conversations: [],
    isLoading: false,
    error: null
  }),

  getters: {
    recentConversations: (state) => {
      return [...(state.conversations || [])].sort((a, b) =>
        dayjs(b.updated_at || b.created_at).valueOf() - dayjs(a.updated_at || a.created_at).valueOf()
      )
    },

    conversationCount: (state) => (state.conversations || []).length,

    getConversationById: (state) => (id) => {
      return (state.conversations || []).find(conv => `${conv.id}` === `${id}`)
    },

    categorizedConsultations: (state) => {
      const now = dayjs()
      const today = []
      const yesterday = []
      const last7Days = []
      const last30Days = []

      const list = state.conversations || []

      list.forEach(conv => {
        const time = dayjs(conv.updated_at || conv.created_at)
        if (!time.isValid()) return

        if (time.isSame(now, 'day')) {
          today.push(conv)
        } else if (time.isSame(now.subtract(1, 'day'), 'day')) {
          yesterday.push(conv)
        } else if (time.isAfter(now.subtract(7, 'day'))) {
          last7Days.push(conv)
        } else if (time.isAfter(now.subtract(30, 'day'))) {
          last30Days.push(conv)
        }
      })

      const sortDesc = (arr) => arr.sort((a, b) =>
        dayjs(b.updated_at || b.created_at).valueOf() - dayjs(a.updated_at || a.created_at).valueOf()
      )

      return {
        today: sortDesc(today),
        yesterday: sortDesc(yesterday),
        last7Days: sortDesc(last7Days),
        last30Days: sortDesc(last30Days)
      }
    }
  },

  actions: {
    loadFromLocalStorage() {
      try {
        const saved = localStorage.getItem('consultHistory')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed)) {
            this.conversations = parsed
            return true
          } else {
            console.warn('consultHistory in localStorage is not an array, clearing it.')
            localStorage.removeItem('consultHistory')
          }
        }
      } catch (e) {
        console.error('Failed to parse history from localStorage', e)
        localStorage.removeItem('consultHistory')
      }
      return false
    },

    saveToLocalStorage() {
      try {
        localStorage.setItem('consultHistory', JSON.stringify(this.conversations || []))
      } catch (e) {
        console.error('Failed to save history to localStorage', e)
      }
    },

    // ---------- 测试/示例数据 ----------
    loadTestData() {
      const now = dayjs().format()
      const oneHourAgo = dayjs().subtract(1, 'hour').format()
      const twoHoursAgo = dayjs().subtract(2, 'hour').format()
      const yesterdayMorning = dayjs().subtract(1, 'day').hour(10).minute(30).format()
      const yesterdayAfternoon = dayjs().subtract(1, 'day').hour(15).minute(45).format()
      const threeDaysAgo = dayjs().subtract(3, 'day').format()
      const sevenDaysAgo = dayjs().subtract(7, 'day').format()
      const eightDaysAgo = dayjs().subtract(8, 'day').format()
      const tenDaysAgo = dayjs().subtract(10, 'day').format()
      const thirtyDaysAgo = dayjs().subtract(30, 'day').format()
      const thirtyOneDaysAgo = dayjs().subtract(31, 'day').format()

      this.conversations = [
        {
          id: 1,
          title: '电商平台用户增长策略咨询',
          created_at: twoHoursAgo,
          updated_at: now,
          info_count: 3,
          info_items: [
            {
              id: 1,
              info_type: 'text',
              title: '用户增长问题',
              description: '电商平台用户增长停滞问题咨询',
              content: '我们是一家中型电商平台，最近三个月用户增长停滞，月活维持在80万左右。主要销售3C产品，目标用户是25-40岁的城市白领。想请教下有什么有效的用户增长策略？预算方面我们可以投入月营收的15%左右用于增长。',
              created_at: twoHoursAgo
            },
            {
              id: 2,
              info_type: 'text',
              title: '增长策略建议',
              description: '针对用户增长的建议',
              content: '根据您的情况，建议从以下几个方面入手：\n1. 精细化会员体系：建立分级会员制度，针对不同等级提供专属优惠和服务，提高用户粘性\n2. 内容营销：制作3C产品评测、使用技巧等内容，吸引自然流量\n3. 社交裂变：设计老带新奖励机制，如成功邀请新用户双方各得50元优惠券\n4. 精准投放：针对流失用户（30天未活跃）投放定向优惠\n\n需要我针对某个方向提供更具体的方案吗？',
              created_at: oneHourAgo
            },
            {
              id: 3,
              info_type: 'text',
              title: '社交裂变咨询',
              description: '关于社交裂变的进一步咨询',
              content: '您提到的社交裂变很感兴趣，能详细说一下具体怎么设计这个机制吗？我们之前试过类似活动，但效果不理想，可能是奖励设置有问题。',
              created_at: now
            }
          ]
        },
        {
          id: 2,
          title: '员工绩效考核体系优化',
          created_at: yesterdayMorning,
          updated_at: yesterdayAfternoon,
          info_count: 4,
          info_items: [
            {
              id: 4,
              info_type: 'text',
              title: '绩效考核问题',
              description: '关于员工绩效考核的咨询',
              content: '我们公司目前有50名员工，主要做软件开发。现有的绩效考核还是传统的季度评分制，员工反馈说不够公平，也不能反映实际贡献。想优化一下绩效考核体系，请问有什么好的建议？',
              created_at: yesterdayMorning
            },
            {
              id: 5,
              info_type: 'text',
              title: '绩效考核建议',
              description: '针对绩效考核的建议',
              content: '对于软件公司，建议采用更灵活的绩效考核方式：\n1. 目标与关键成果法(OKR)：设定公司、团队和个人三级目标，强调成果而非过程\n2. 360度反馈：结合上级、同事、下属甚至客户的评价\n3. 持续反馈机制：每月1对1沟通，而非季度一次\n4. 项目贡献度评估：针对开发人员，可量化其在项目中的代码质量、解决问题数量等\n\n需要我提供OKR的具体实施步骤吗？',
              created_at: yesterdayMorning
            },
            {
              id: 6,
              info_type: 'text',
              title: 'OKR实施咨询',
              description: '关于OKR实施的进一步咨询',
              content: '是的，想了解一下OKR在50人规模公司的实施步骤，以及可能遇到的问题和解决方法。另外，如何平衡OKR和日常工作任务的关系？',
              created_at: yesterdayAfternoon
            },
            {
              id: 7,
              info_type: 'text',
              title: 'OKR实施建议',
              description: '针对OKR实施的详细建议',
              content: '50人规模公司实施OKR的步骤建议：\n1. 培训先行（1-2周）：让所有管理者理解OKR的理念和实施方法\n2. 试点运行（1个季度）：选择1-2个部门试点，完善流程\n3. 全公司推广：制定明确的OKR制定、跟踪、评分流程\n4. 定期回顾：每季度末进行OKR复盘，调整下一季度目标\n\n可能遇到的问题及解决：\n- 目标设定不合理：培训管理者设定SMART原则的目标\n- 与日常工作冲突：明确OKR占考核的60%，日常工作占40%\n- 执行流于形式：建立周/月跟踪机制，确保目标推进\n\n需要模板或更详细的实施计划可以告诉我。',
              created_at: yesterdayAfternoon
            }
          ]
        },
        {
          id: 3,
          title: '连锁咖啡店扩张选址分析',
          created_at: threeDaysAgo,
          updated_at: threeDaysAgo,
          info_count: 2,
          info_items: [
            {
              id: 8,
              info_type: 'text',
              title: '选址问题',
              description: '关于咖啡店选址的咨询',
              content: '我们计划在华东地区新开5家连锁咖啡店，目前在考虑南京、杭州、苏州三个城市。想了解这三个城市的市场情况、租金水平和目标客群分布，应该如何做选址分析？预算方面单店初期投资在80-120万之间。',
              created_at: threeDaysAgo
            },
            {
              id: 9,
              info_type: 'text',
              title: '选址建议',
              description: '针对咖啡店选址的建议',
              content: '连锁咖啡店选址分析建议从以下维度进行：\n1. 城市消费能力：人均可支配收入、咖啡消费习惯\n2. 商圈类型评估：\n   - 办公区：午间客流大，周末冷清\n   - 商圈/购物中心：周末客流大，租金较高\n   - 社区型：稳定客流，复购率高\n3. 竞争分析：3公里内同类咖啡店数量、定位\n4. 成本结构：租金(建议不超过月营收的25%)、人力、装修\n\n三个城市初步分析：\n- 杭州：消费能力强，互联网从业者多，西湖周边商圈成熟\n- 南京：高校多，年轻消费群体大，租金相对较低\n- 苏州：工业园区外企集中，消费稳定，社区商业发达\n\n需要我提供更具体的数据分析或选址模型吗？',
              created_at: threeDaysAgo
            }
          ]
        },
        {
          id: 4,
          title: 'SaaS产品定价策略调整',
          created_at: sevenDaysAgo,
          updated_at: eightDaysAgo,
          info_count: 4,
          info_items: [
            {
              id: 10,
              info_type: 'text',
              title: '定价策略问题',
              description: '关于SaaS产品定价的咨询',
              content: '我们的SaaS产品是做客户关系管理的，目前采用单一订阅价：每月999元/用户。现在想调整为分级定价，针对不同规模企业提供不同套餐。请问应该如何设计分级方案？现有客户如何平稳过渡？',
              created_at: sevenDaysAgo
            },
            {
              id: 11,
              info_type: 'text',
              title: '定价策略建议',
              description: '针对SaaS产品定价的建议',
              content: 'SaaS产品分级定价建议采用"三档模型"：\n1. 基础版：适合小微企业(1-10人)\n   - 核心功能：客户管理、简单报表\n   - 定价：399元/用户/月\n2. 专业版：适合中型企业(11-50人)\n   - 包含基础版所有功能+高级分析+API集成\n   - 定价：899元/用户/月\n3. 企业版：适合大型企业(50人以上)\n   - 包含专业版所有功能+专属客服+定制开发\n   - 定价：1599元/用户/月\n\n现有客户过渡方案：\n- 提供3个月缓冲期，维持原价格\n- 针对不同规模客户推荐合适套餐，并给予首年8折优惠\n- 推出"升级礼包"，鼓励用户体验高级功能\n\n需要我提供竞品定价分析作为参考吗？',
              created_at: sevenDaysAgo
            },
            {
              id: 12,
              info_type: 'text',
              title: '企业版定价咨询',
              description: '关于企业版定价的进一步咨询',
              content: '非常感谢，这个方案很清晰。关于企业版，我们还想加入专属数据备份和安全审计功能，这部分定价应该如何考量？另外，是否需要设置最低用户数限制？',
              created_at: eightDaysAgo
            },
            {
              id: 13,
              info_type: 'text',
              title: '企业版定价建议',
              description: '针对企业版定价的详细建议',
              content: '关于企业版的补充建议：\n1. 安全相关功能定价：\n   - 专属数据备份：可作为企业版标配，无需额外收费\n   - 安全审计：可作为可选模块，加收基础费用的15-20%\n\n2. 用户数限制：\n   - 建议设置企业版最低10用户起订，确保收入规模\n   - 超过50用户可提供阶梯折扣，如51-100用户9折，100+用户8折\n\n这种设置既能体现企业版的价值，又能鼓励客户扩大使用规模。需要我帮你设计具体的价格计算表吗？',
              created_at: eightDaysAgo
            }
          ]
        },
        {
          id: 5,
          title: '新媒体运营内容规划',
          created_at: tenDaysAgo,
          updated_at: tenDaysAgo,
          info_count: 2,
          info_items: [
            {
              id: 14,
              info_type: 'text',
              title: '运营规划问题',
              description: '关于新媒体运营的咨询',
              content: '我们是做健康食品的品牌，想加强小红书和抖音的运营。目前粉丝量各有3万左右，互动率不高。想请教一下如何规划内容，提高用户互动和转化？团队有1名专职运营，预算有限。',
              created_at: tenDaysAgo
            },
            {
              id: 15,
              info_type: 'text',
              title: '运营规划建议',
              description: '针对新媒体运营的建议',
              content: '健康食品在小红书和抖音的内容规划建议：\n\n小红书(以种草为主)：\n1. 产品场景化内容(40%)：\n   - 早餐搭配方案\n   - 办公室健康零食选择\n   - 健身前后营养补充\n2. 专业知识科普(30%)：\n   - 成分解析\n   - 健康饮食误区\n   - 营养搭配原则\n3. 用户证言(20%)：\n   - 真实使用反馈\n   - 效果对比\n4. 活动互动(10%)：\n   - 食谱征集\n   - 健康挑战\n\n抖音(以流量和转化为主)：\n1. 产品亮点展示(30%)\n2. 制作过程揭秘(20%)\n3. 快速健康食谱(30%)\n4. 直播带货(20%，每周1-2次)\n\n考虑到您的团队规模，建议先聚焦2-3种内容形式做精，再逐步扩展。需要具体的周内容排期表吗？',
              created_at: tenDaysAgo
            }
          ]
        },
        {
          id: 6,
          title: '传统制造业数字化转型',
          created_at: thirtyDaysAgo,
          updated_at: thirtyOneDaysAgo,
          info_count: 4,
          info_items: [
            {
              id: 16,
              info_type: 'text',
              title: '数字化转型问题',
              description: '关于制造业数字化转型的咨询',
              content: '我们是一家有20年历史的机械制造企业，年营收约8000万。想进行数字化转型，但不知道从何入手。车间设备比较老旧，IT基础薄弱，预算大概能投入500万左右。请问应该制定怎样的转型路径？',
              created_at: thirtyDaysAgo
            },
            {
              id: 17,
              info_type: 'text',
              title: '数字化转型建议',
              description: '针对制造业数字化转型的建议',
              content: '传统制造业数字化转型建议采用"三步走"策略，适合您的规模和预算：\n\n第一步(0-6个月)：基础数字化\n- ERP系统实施：管理采购、库存、生产计划\n- 基础网络升级：确保车间网络覆盖\n- 关键设备数据采集：对核心设备加装传感器\n\n第二步(7-18个月)：生产智能化\n- MES系统上线：生产执行过程数字化\n- 质量追溯系统：实现产品全生命周期追溯\n- 能耗管理系统：监控并优化能源消耗\n\n第三步(19-36个月)：业务智能化\n- 数据分析平台：基于历史数据优化生产\n- 供应链协同平台：与上下游企业数据打通\n- 远程运维系统：实现设备远程监控与诊断\n\n500万预算建议优先投入第一步(约200万)和第二步部分项目(约300万)，分阶段实施效果更好。需要推荐合适的系统供应商或更详细的实施计划吗？',
              created_at: thirtyDaysAgo
            },
            {
              id: 18,
              info_type: 'text',
              title: 'ERP系统咨询',
              description: '关于ERP系统选择的咨询',
              content: '非常感谢，这个分步策略很清晰。关于第一步的ERP系统，市场上有很多选择，像SAP、用友、金蝶等，对于我们这种规模的企业，您更推荐哪类？实施周期大概需要多久？',
              created_at: thirtyOneDaysAgo
            },
            {
              id: 19,
              info_type: 'text',
              title: 'ERP系统建议',
              description: '针对ERP系统选择的建议',
              content: '对于年营收8000万左右的制造企业，ERP选型建议：\n- 优先考虑国内厂商：用友U9 Cloud或金蝶K/3 WISE\n  优势：性价比高(约80-120万)、本地化服务好、更符合国内制造流程\n- 不建议SAP：成本过高(200万以上)，功能过于复杂，适合更大规模企业\n\n实施周期：\n- 需求调研与方案设计：1-2个月\n- 系统配置与开发：2-3个月\n- 测试与培训：1个月\n- 上线与优化：1个月\n总计约5-7个月，建议选择有制造业经验的实施伙伴，可降低风险。需要我提供几家靠谱的实施服务商联系方式吗？',
              created_at: thirtyOneDaysAgo
            }
          ]
        }
      ]

      // 将示例数据写入 localStorage，方便查看（首次打开会被写入）
      this.saveToLocalStorage()
    },

    // ---------- init: local-first，然后可选异步合并后端 ----------
    async init() {
      const userStore = useUserStore()
    
      // 1) 先加载本地（若已有 localStorage 数据则直接显示）
      const hasLocal = this.loadFromLocalStorage()
    
      // 2) 若没有本地数据，则写入示例数据
      if (!hasLocal && (!this.conversations || this.conversations.length === 0)) {
        this.loadTestData()
      }
    
      // 3) 若用户已登录，异步尝试从后端拉取并合并
if (userStore?.token) {
  this.isLoading = true
  try {
    const res = await getConversationListService('30days')
    
    const serverList = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : [])
    if (serverList.length > 0) {
      // ===== 核心处理日志（已注释保留，便于后续调试） =====
      // console.log('开始处理 serverList，长度:', serverList.length)
      
      const localById = {}
      const localConversations = this.conversations || []
      // console.log('本地对话列表长度:', localConversations.length)
      
      // 处理本地对话（保留错误捕获，移除打印）
      localConversations.forEach((c, index) => {
        try {
          const cId = `${c.id}`
          // console.log(`本地对话[${index}] id:`, cId)
          localById[cId] = c
        } catch (e) {
          console.error(`处理本地对话[${index}]出错:`, e, '数据:', c)
        }
      })
      
      const merged = []
      // console.log('开始处理服务端对话...')
      
      // 处理服务端对话（保留错误捕获，移除打印）
      serverList.forEach((s, index) => {
        try {
          // console.log(`处理服务端对话[${index}]数据:`, s)
          
          // 解析服务端对话ID
          const sid = `${s.id ?? s.conversation_id ?? s.conversationId}`
          // console.log(`服务端对话[${index}]解析出的sid:`, sid)
          
          // 获取本地对话
          const local = localById[sid]
          // console.log(`服务端对话[${index}]对应的本地对话:`, local)
          
          // 合并数据
          const mapped = {
            id: sid,
            title: s.title || (local?.title) || '对话',
            created_at: s.created_at || s.createdAt || (local?.created_at) || new Date().toISOString(),
            updated_at: s.updated_at || s.updatedAt || (local?.updated_at) || new Date().toISOString(),
            info_count: s.info_count ?? s.infoCount ?? (local?.info_count) ?? 0,
            info_items: (local && Array.isArray(local.info_items)) ? local.info_items : (Array.isArray(s.info_items) ? s.info_items : [])
          }
          // console.log(`服务端对话[${index}]合并后的数据:`, mapped)
          
          merged.push(mapped)
          delete localById[sid]
        } catch (e) {
          console.error(`处理服务端对话[${index}]出错:`, e, '数据:', s)
        }
      })
      
      // 处理剩余本地对话（保留错误捕获，移除打印）
      // console.log('剩余本地对话数量:', Object.values(localById).length)
      Object.values(localById).forEach((l, index) => {
        try {
          // console.log(`添加剩余本地对话[${index}]:`, l)
          merged.push(l)
        } catch (e) {
          console.error(`添加剩余本地对话[${index}]出错:`, e, '数据:', l)
        }
      })
      
      this.conversations = merged
      // console.log('合并后的数据:', merged)

      this.saveToLocalStorage()
      // ===== 日志结束 =====
    }
    this.error = null
  } catch (e) {
    console.warn('Failed to fetch conversation list from server (will use local data):', e)
    this.error = '无法连接到后端，已使用本地数据。'
  } finally {
    this.isLoading = false
  }
} else {
  this.error = null
}
},

    // 创建对话（优先后端，失败或未登录时本地创建）
    async createConversation(title = '新对话') {
      const userStore = useUserStore()
      if (userStore?.token) {
        try {
          const res = await createConversationService({ title })
          const payload = res.data && !Array.isArray(res.data) ? (res.data.data || res.data) : res.data
          const newConv = {
            id: payload.id ?? payload.conversation_id ?? `conv-${Date.now()}`,
            title: payload.title || title,
            created_at: payload.created_at || new Date().toISOString(),
            updated_at: payload.updated_at || payload.created_at || new Date().toISOString(),
            info_count: payload.info_count ?? 0,
            info_items: payload.info_items || []
          }
          this.conversations.unshift(newConv)
          this.saveToLocalStorage()
          return newConv.id
        } catch (e) {
          console.warn('Failed to create conversation on server, fallback to local:', e)
        }
      }
      const localConv = {
        id: `conv-${Date.now()}`,
        title,
        created_at: dayjs().format(),
        updated_at: dayjs().format(),
        info_count: 0,
        info_items: []
      }
      this.conversations.unshift(localConv)
      this.saveToLocalStorage()
      return localConv.id
    },

    // 向对话添加信息（本地）
    addMessage(conversationId, message) {
      const conversation = this.getConversationById(conversationId)
      if (conversation) {
        const newMessage = {
          id: message.id || `msg-${Date.now()}`,
          info_type: message.info_type || 'text',
          title: message.title || '',
          description: message.description || '',
          content: message.content || '',
          created_at: message.created_at || dayjs().format()
        }

        if (!Array.isArray(conversation.info_items)) conversation.info_items = []
        conversation.info_items.push(newMessage)
        conversation.updated_at = newMessage.created_at
        conversation.info_count = conversation.info_items.length
        this.saveToLocalStorage()
        return newMessage
      }
      return null
    },

    addConversation(conversationData) {
      const newConv = {
        ...conversationData,
        id: conversationData.id || `conv-${Date.now()}`,
        created_at: conversationData.created_at || dayjs().format(),
        updated_at: conversationData.updated_at || dayjs().format(),
        info_count: conversationData.info_count || 0,
        info_items: conversationData.info_items || []
      }

      this.conversations.push(newConv)
      this.saveToLocalStorage()
      return newConv.id
    },

    deleteConversation(id) {
      this.conversations = (this.conversations || []).filter(conv => `${conv.id}` !== `${id}`)
      this.saveToLocalStorage()
    }
  }
})
