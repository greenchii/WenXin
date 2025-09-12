<template>
    <div class="message-actions" v-if="message">
      <button
        type="button"
        class="action-btn copy"
        @click="copyContent"
        @mouseenter="hover = 'copy'"
        @mouseleave="hover = ''"
        :title="'复制'"
      >
        <span class="icon" v-html="copySvg"></span>
        <span class="hint" v-if="hover === 'copy'">复制</span>
      </button>
  
      <button
        type="button"
        class="action-btn save"
        @click="saveContent"
        @mouseenter="hover = 'save'"
        @mouseleave="hover = ''"
        :title="'保存'"
      >
        <span class="icon" v-html="saveSvg"></span>
        <span class="hint" v-if="hover === 'save'">保存</span>
      </button>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import dayjs from 'dayjs'
  import { ElMessage } from 'element-plus'
  import { useHistoryStore } from '@/stores/history.js'
  import { useMeetingStore } from '@/stores/meeting.js'
  import { useLifeStore } from '@/stores/life.js'
  import { useFinanceStore } from '@/stores/finance.js'
  import { useUserStore } from '@/stores/user'
  import { uploadInfoService, uploadMixedInfoService } from '@/api/conversation'
  
  // props
  const props = defineProps({
    message: { type: Object, required: true },
    convId: { type: [String, Number], default: null }
  })
  
  const hover = ref('')
  const historyStore = useHistoryStore()
  const meetingStore = useMeetingStore()
  const lifeStore = useLifeStore()
  const financeStore = useFinanceStore()
  const userStore = useUserStore()
  
  /* SVG 内联 */
  const copySvg = `
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="7" y="7" width="11" height="11" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <rect x="3" y="3" width="11" height="11" rx="2" stroke="currentColor" stroke-width="1.5" fill="none" opacity="0.9"/>
  </svg>`
  
  const saveSvg = `
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="7" width="18" height="10" rx="2" stroke="currentColor" stroke-width="1.4" fill="none"/>
    <path d="M8 5h8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
    <path d="M8 3h8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
    <path d="M12 10v4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M10 12h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
  </svg>`
  
  /* 复制 */
  async function copyContent() {
    const text = extractPlainText(props.message)
    if (!text) { ElMessage.warning('无内容可复制'); return }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        const ta = document.createElement('textarea')
        ta.value = text
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      }
      ElMessage.success('已复制到剪贴板')
    } catch (e) {
      console.error('copy error', e)
      ElMessage.error('复制失败')
    }
  }
  
  /* 保存（写本地 store 并尝试同步到后端，但绝不新增对话历史） */
  let saving = false
  async function saveContent() {
    if (saving) return
    saving = true
    try {
      // 1) 选取要保存的上下文（尽量把 user+assistant 合并为一条）
      let toSaveMessages = []
      const conv = props.convId ? historyStore.getConversationById(props.convId) : null
  
      if (props.message) {
        const isUser = ((props.message.role || '').toString().toLowerCase() === 'user')
        if (conv && Array.isArray(conv.messages)) {
          const idx = conv.messages.findIndex(m => `${m.id}` === `${props.message.id}`)
          if (idx !== -1) {
            if (!isUser) {
              // assistant：合并前一条 user（若存在且为 user）
              const prev = conv.messages[idx - 1]
              if (prev && ((prev.role || '').toString().toLowerCase() === 'user')) {
                toSaveMessages = [prev, conv.messages[idx]]
              } else {
                toSaveMessages = [conv.messages[idx]]
              }
            } else {
              // user：尝试合并后续 assistant
              const next = conv.messages[idx + 1]
              if (next && ((next.role || '').toString().toLowerCase() !== 'user')) {
                toSaveMessages = [conv.messages[idx], next]
              } else {
                toSaveMessages = [conv.messages[idx]]
              }
            }
          } else {
            // 未找到索引：回退为最后一条消息（保守）
            toSaveMessages = [props.message]
          }
        } else {
          // 无 conv 或 messages 时，按原消息为一条
          toSaveMessages = [props.message]
        }
      }
  
      // 2) 合并为一段文本（一次性上传）
      const combined = toSaveMessages.map(m => `${(m.role === 'user' ? '您' : '助手')}: ${m.content || m.description || m.title || ''}`).join('\n\n')
      const title = combined.replace(/\n+/g, ' ').trim().slice(0, 60)
      const ts = props.message?.created_at || new Date().toISOString()
      const category = classifyCategory(combined)
  
      // 3) 上传到后端：**只有在已登录并且传入 convId 时才尝试上传**（避免创建新的对话）
      let backendOk = false
      try {
        if (userStore?.token && props.convId) {
          // 如果带附件，需要更复杂逻辑，这里仅支持文本上传（如有文件请改为 uploadMixedInfoService）
          await uploadInfoService({
            conversation_id: props.convId,
            text: combined
          })
          backendOk = true
        } else if (userStore?.token && !props.convId) {
          // 登录但没有 convId：我们**不自动创建对话**，提示用户
          ElMessage.info('已登录但未指定对话，已保存到本地分类。若需要上传到后端，请先打开/创建会话并重试保存。')
        } else {
          // 未登录：只做本地保存
          ElMessage.info('未登录：内容已保存到本地分类，登录后可同步到后端。')
        }
      } catch (e) {
        console.error('后端保存失败:', e)
        ElMessage.error('同步到后端失败（已在本地保存）')
        backendOk = false
      }
  
      // 4) 将一条 record 写入对应的分类 store（只写一次，不拆分）
      if (category === 'finance') {
        const amount = parseAmountFromText(combined)
        financeStore.addRecord({
          id: `auto-${Date.now()}`,
          date: dayjs(ts).format('YYYY-MM-DD'),
          type: amount >= 0 ? 'income' : 'expense',
          amount: amount || 0,
          title: title || '财务记录',
          description: combined,
          timestamp: new Date(ts).getTime()
        })
        ElMessage.success(backendOk ? '已保存到「财务」并同步到后端' : '已保存到「财务」（未同步到后端）')
      } else if (category === 'meeting') {
        meetingStore.addRecord({
          title: title || '会议记录',
          content: combined,
          timestamp: dayjs(ts).format('YYYY-MM-DD')
        })
        ElMessage.success(backendOk ? '已保存到「会议」并同步到后端' : '已保存到「会议」（未同步到后端）')
      } else {
        lifeStore.addRecord({
          title: title || '生活记录',
          content: combined,
          timestamp: dayjs(ts).format('YYYY-MM-DD')
        })
        ElMessage.success(backendOk ? '已保存到「生活」并同步到后端' : '已保存到「生活」（未同步到后端）')
      }
  
      // 注意：**刻意不再**去创建会话或刷新 conversation 列表（history store）。
      // 这样就不会在侧边栏产生新的会话条目或重复项。
    } catch (e) {
      console.error('saveContent error', e)
      ElMessage.error('保存失败')
    } finally {
      saving = false
    }
  }
  
  /* helpers */
  function extractPlainText(m) {
    if (!m) return ''
    if (typeof m.content === 'string') return m.content
    if (m.description) return m.description
    if (m.text) return m.text
    return JSON.stringify(m).slice(0, 1000)
  }
  
  function classifyCategory(text) {
    const t = (text || '').toString()
    const financeKeywords = ['收入', '支出', '金额', '元', '￥', '¥', '$', '转账', '付款', '报销', '账单']
    if (financeKeywords.some(k => t.indexOf(k) !== -1)) return 'finance'
    const meetingKeywords = ['会议', '开会', '安排', '会议安排', '讨论会', '日程', '议程', '会议纪要', '线上会议', '线下会议']
    if (meetingKeywords.some(k => t.indexOf(k) !== -1)) return 'meeting'
    if (/\d+[,\d]*\.\d+|\d+[,\d]*元|￥\s*\d+/.test(t)) return 'finance'
    return 'life'
  }
  
  function parseAmountFromText(text) {
    if (!text) return 0
    const m = text.match(/([￥¥$]\s?[\d,]+(?:\.\d+)?)/) || text.match(/([\d,]+(?:\.\d+)?\s*元)/) || text.match(/([\d,]+(?:\.\d+)?)/)
    if (!m) return 0
    let s = m[0].replace(/[,，\s]/g, '').replace('元', '')
    s = s.replace(/[￥¥$]/g, '')
    const val = parseFloat(s)
    return isNaN(val) ? 0 : val
  }
  </script>
  
  <style scoped>
  .message-actions {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: flex-end;
    margin-top: 8px;
  }
  
  /* 按钮基础 */
  .action-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 34px;
    width: 34px;
    border-radius: 8px;
    border: none;
    background: transparent;
    cursor: pointer;
    position: relative;
    padding: 4px;
  }
  
  .action-btn:hover {
    background: rgba(16, 24, 40, 0.04);
  }
  
  .icon { display: inline-block; color: #233; }
  
  .hint {
    position: absolute;
    bottom: 40px;
    right: 0;
    background: #111827;
    color: #fff;
    padding: 6px 8px;
    font-size: 12px;
    border-radius: 6px;
    white-space: nowrap;
    box-shadow: 0 6px 18px rgba(16,24,40,0.12);
    z-index: 40;
  }
  
  @media (max-width: 640px) {
    .message-actions { margin-top: 6px; }
    .hint { bottom: 34px; font-size: 11px; }
  }
  </style>
  