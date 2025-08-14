<template>
    <div class="question-page">
      <div class="panel">
        <div class="panel-head">
          <button class="back-btn" @click="goBack" title="返回">
            ← 返回
          </button>
          <h2>问题详情</h2>
        </div>
  
        <div v-if="loading" class="loading">加载中…</div>
  
        <div v-else-if="!question" class="empty">
          未找到该问题（可能已被删除）。
        </div>
  
        <div v-else class="body">
          <div class="meta">
            <div class="time">时间：{{ formatFullTime(question.createdAt) }}</div>
            <div class="id">ID：{{ question.id }}</div>
          </div>
  
          <div class="field">
            <label>问题</label>
            <div v-if="!editing" class="text-block">{{ question.text }}</div>
  
            <div v-else>
              <textarea v-model="editText" rows="4"></textarea>
              <div class="edit-actions">
                <button @click="saveEdit">保存</button>
                <button @click="cancelEdit">取消</button>
              </div>
            </div>
  
            <div v-if="!editing" class="actions">
              <button @click="startEdit">编辑</button>
              <button class="danger" @click="confirmDelete">删除</button>
            </div>
          </div>
  
          <div class="field">
            <label>回答</label>
            <div class="answer-block" v-if="question.answer">{{ question.answer }}</div>
            <div class="answer-empty" v-else>（无回答）</div>
          </div>
        </div>
      </div>
  
      <!-- 简易确认模态（CSS） -->
      <div v-if="showConfirm" class="confirm-mask" @click.self="showConfirm = false">
        <div class="confirm-box">
          <p>确定要删除这条问题吗？此操作不可撤销。</p>
          <div class="btns">
            <button @click="showConfirm = false">取消</button>
            <button class="danger" @click="deleteQuestion">确认删除</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  
  const route = useRoute()
  const router = useRouter()
  
  const STORAGE_KEY = 'wenxin_v1'
  
  const loading = ref(true)
  const question = ref(null)
  const editing = ref(false)
  const editText = ref('')
  const showConfirm = ref(false)
  
  // --- Helper: 本地存储操作（与 Home / App 保持一致） ---
  function loadStore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  }
  function saveStore(payload) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload || {}))
    // 告诉侧边栏刷新
    window.dispatchEvent(new Event('questions-updated'))
  }
  
  // --- Backend placeholders（若接后端可在这里填写 BASE） ---
  const BASE = '' // 若接后端把地址写在这里或使用 env
  async function fetchQuestionFromBackend(id) {
    if (!BASE) return null
    try {
      const res = await fetch(`${BASE.replace(/\/$/, '')}/api/questions/${id}`)
      if (!res.ok) return null
      return await res.json()
    } catch (e) {
      console.warn('fetch question backend failed', e)
      return null
    }
  }
  async function deleteQuestionOnBackend(id) {
    if (!BASE) return false
    try {
      const res = await fetch(`${BASE.replace(/\/$/, '')}/api/questions/${id}`, { method: 'DELETE' })
      return res.ok
    } catch (e) {
      console.warn('delete backend failed', e)
      return false
    }
  }
  async function updateQuestionOnBackend(id, payload) {
    if (!BASE) return null
    try {
      const res = await fetch(`${BASE.replace(/\/$/, '')}/api/questions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) return null
      return await res.json()
    } catch (e) {
      console.warn('update backend failed', e)
      return null
    }
  }
  
  // --- Load question by id (先本地，再后端尝试) ---
  async function loadQuestion(id) {
    loading.value = true
    question.value = null
  
    // 1) 本地查找
    const store = loadStore()
    const q = (store.questions || []).find(x => x.id === id)
    if (q) {
      question.value = { ...q }
      loading.value = false
      return
    }
  
    // 2) 尝试后端获取（如果配置了后端）
    const remote = await fetchQuestionFromBackend(id)
    if (remote) {
      question.value = { ...remote }
      loading.value = false
      return
    }
  
    loading.value = false
    question.value = null
  }
  
  // --- Formatting helpers ---
  function formatFullTime(iso) {
    try {
      const d = new Date(iso)
      return d.toLocaleString()
    } catch {
      return iso || ''
    }
  }
  
  // --- UI actions ---
  function goBack() {
    // 如果之前来自 /question/:id 链接，直接回到首页
    router.push('/')
  }
  
  function startEdit() {
    editing.value = true
    editText.value = question.value?.text || ''
  }
  function cancelEdit() {
    editing.value = false
    editText.value = ''
  }
  
  async function saveEdit() {
    if (!question.value) return
    const newText = (editText.value || '').trim()
    if (!newText) return alert('问题不能为空')
    // 优先尝试后端更新
    const backendResult = await updateQuestionOnBackend(question.value.id, { text: newText })
    if (backendResult && backendResult.id) {
      // 用后端返回覆盖
      question.value = { ...backendResult }
      // 也同步回本地（便于离线）
      const store = loadStore()
      store.questions = store.questions || []
      const idx = store.questions.findIndex(x => x.id === question.value.id)
      if (idx >= 0) store.questions[idx] = { ...question.value }
      else store.questions.unshift({ ...question.value })
      saveStore(store)
    } else {
      // 本地更新
      question.value.text = newText
      const store = loadStore()
      store.questions = store.questions || []
      const idx = store.questions.findIndex(x => x.id === question.value.id)
      if (idx >= 0) store.questions[idx].text = newText
      saveStore(store)
    }
    editing.value = false
    editText.value = ''
  }
  
  function confirmDelete() {
    showConfirm.value = true
  }
  
  async function deleteQuestion() {
    if (!question.value) return
    const id = question.value.id
    // 1) 尝试后端删除
    const backendOK = await deleteQuestionOnBackend(id)
    // 2) 本地删除（无论后端是否存在，都做本地删除）
    const store = loadStore()
    store.questions = (store.questions || []).filter(x => x.id !== id)
    saveStore(store)
  
    showConfirm.value = false
    // 返回首页并触发侧边栏刷新
    router.push('/')
  }
  
  // --- 初始化：根据路由 id 加载数据 ---
  onMounted(() => {
    const id = route.params.id
    if (id) loadQuestion(id)
  })
  </script>
  
  <style scoped>
  .question-page { padding: 24px; }
  .panel { background: #fff; border-radius: 12px; padding: 18px; box-shadow: 0 8px 24px rgba(12,34,88,0.06); max-width: 900px; margin: 0 auto; }
  .panel-head { display:flex; align-items:center; gap:12px; margin-bottom: 12px; }
  .back-btn { background:none; border: none; cursor: pointer; color: #4c6ef5; font-weight:700; }
  .loading, .empty { padding: 40px; text-align:center; color:#64748b; }
  .body .meta { display:flex; gap:12px; color:#64748b; font-size:13px; margin-bottom:12px; }
  .field { margin-bottom: 16px; }
  .field label { font-weight:600; margin-bottom:6px; display:block; }
  .text-block, .answer-block { background: #f8fafc; padding: 12px; border-radius: 8px; white-space: pre-wrap; }
  .answer-empty { color:#64748b; font-style:italic; }
  textarea { width:100%; min-height:100px; padding:10px; border-radius:8px; border:1px solid #e6ecff; }
  .actions { margin-top:8px; display:flex; gap:8px; }
  .actions button { padding:8px 12px; border-radius:8px; cursor:pointer; border:1px solid #e6ecff; background:white; }
  .actions .danger { color: #e53e3e; border-color: rgba(229,62,62,0.12); }
  .confirm-mask { position:fixed; inset:0; display:flex; align-items:center; justify-content:center; background: rgba(0,0,0,0.35); z-index:9999; }
  .confirm-box { background:white; padding:18px; border-radius:10px; width:320px; box-shadow:0 10px 30px rgba(2,6,23,0.3); }
  .confirm-box .btns { display:flex; justify-content:flex-end; gap:8px; margin-top:12px; }
  .confirm-box .danger { background:#e53e3e; color:white; border:none; padding:8px 12px; border-radius:6px; }
  </style>
  