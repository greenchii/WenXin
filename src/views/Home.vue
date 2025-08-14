<template>
  <div class="home-container">
    
    <div class="content-grid">
      <!-- 左侧列：事项记录和事项决策 -->
      <div class="left-column">
        <!-- 上部：事项记录（保留） -->
        <section class="panel input-panel">
          <div class="panel-head">
            <svg class="head-ic" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 7h5v2H7zm5 10H7v-2h5v2zm5-6H7v-2h10v2zm0-4H7V7h10v2z" fill="currentColor"/>
            </svg>
            <h3>事项记录</h3>
          </div>

          <div class="composer">
            <textarea v-model="inputText" placeholder="输入内容或使用 #标签 自动分类（例如：#会议、#财务）"></textarea>

            <div class="action-row">
              <!-- 图片上传按钮 -->
              <label class="upload-btn">
                <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 7v2.99s-1.99.01-2 0V7h-3s.01-1.99 0-2h3V2h2v3h3v2h-3zm-3 4V8H5v14h14V11h-4zm-8 8H6v-4h2v4zm0-6H6v-2h2v2zm0-4H6V7h2v2z" fill="currentColor"/>
                </svg>
                图片
                <input type="file" accept="image/*" multiple @change="onFileChange" hidden />
              </label>
              
              <!-- 文件上传按钮 -->
              <label class="upload-btn">
                <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M15 9H3v6h12V9zm-1.5 4.5V15H6v-1.5h7.5zm4.5 0H18v1.5h-1.5V15H15v-1.5h3zm0-3V12H6V9.5h13.5z" fill="currentColor"/>
                </svg>
                文件
                <input type="file" multiple @change="onFileChange" hidden />
              </label>
              
              <!-- 语音上传按钮 -->
              <label class="upload-btn">
                <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.42 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" fill="currentColor"/>
                </svg>
                语音
                <input type="file" accept="audio/*" @change="onFileChange" hidden />
              </label>

              <div class="spacer"></div>

              <!-- 提交按钮（仅用于事项记录） -->
              <button class="submit-btn" @click="submitInput">
                提交
              </button>
            </div>

            <!-- 已选文件预览 -->
            <div class="files-preview" v-if="files.length">
              <small>已选文件：</small>
              <div class="file-list">
                <div class="file-item" v-for="(f, i) in files" :key="i">
                  <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M15 9H3v6h12V9zm-1.5 4.5V15H6v-1.5h7.5zm4.5 0H18v1.5h-1.5V15H15v-1.5h3zm0-3V12H6V9.5h13.5z" fill="currentColor"/>
                  </svg>
                  {{ f.name }}
                  <button class="remove-file" @click="removeFile(i)">
                    <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 下部：事项决策 -->
        <section class="panel decision-panel">
          <div class="panel-head">
            <svg class="head-ic" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" fill="currentColor"/>
            </svg>
            <h3>事项决策</h3>
          </div>

          <div class="decision-body">
            <input v-model="decisionText" placeholder="在这里写下需要决策的问题，按回车或点击提交" @keyup.enter="submitDecision" />
            <button class="decision-submit-btn" @click="submitDecision">
              提交
            </button>
            
            <div class="hint" style="margin-top:12px">
              提示：已提交的问题会保存到侧边栏的问题记录里，点击侧边栏条目可查看当时的回答。
            </div>
          </div>
        </section>
      </div>

      <!-- 中间列：问心回答 -->
      <div class="middle-column">
        <section class="panel answer-panel">
          <div class="panel-head">
            <svg class="head-ic" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6A4.997 4.997 0 017 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z" fill="currentColor"/>
            </svg>
            <h3>问心回答</h3>
          </div>

          <div class="answer-content">
            <div class="answer-placeholder" v-if="!currentAnswer">
              这里将显示AI对您问题的回答...
            </div>
            <div class="answer-text" v-else>
              {{ currentAnswer }}
            </div>
          </div>
        </section>
      </div>

      <!-- 右侧列：信息分类 -->
      <div class="right-column">
        <section class="panel history-panel">
          <div class="panel-head">
            <svg class="head-ic" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z" fill="currentColor"/>
            </svg>
            <h3>信息分类</h3>
          </div>

          <!-- 标签按钮 -->
          <div class="tag-buttons">
            <button
              class="tag-btn"
              @click="$router.push('/meeting')"
            >
              会议
            </button>
            <button
              class="tag-btn"
              @click="$router.push('/life')"
            >
              生活
            </button>
            <button
              class="tag-btn"
              @click="$router.push('/finance')"
            >
              财务
            </button>
          </div>

          <!-- 标签详情预览 -->
          <div class="history-preview" v-if="selectedTag">
            <div class="preview-head">
              <strong>{{ selectedTag }}</strong>
              <button class="close" @click="selectedTag = null">
                <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
                </svg>
              </button>
            </div>
            <div class="preview-list">
              <small>最近记录</small>
              <ul>
                <li v-for="(it, idx) in previewItems" :key="idx">
                  {{ it }}
                  <button class="remove-item" @click="removeRecord(selectedTag, idx)">
                    <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
                    </svg>
                  </button>
                </li>
                <li v-if="!previewItems.length">（暂无记录）</li>
              </ul>
            </div>
          </div>

          <div class="hint">提示：点击标签查看相关记录，或在输入中使用 <code>#标签</code> 自动分类。</div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const STORAGE_KEY = 'wenxin_v1'

// 左侧“事项记录”保留原逻辑
const inputText = ref('')
const files = ref([])
function onFileChange(e) {
  const list = Array.from(e.target.files || [])
  for (const f of list) files.value.push(f)
  e.target.value = null
}
function removeFile(index) { files.value.splice(index, 1) }
function submitInput() {
  const txt = inputText.value.trim()
  if (!txt && !files.value.length) return alert('请输入内容或选择文件')
  // 与之前一样把普通记录存入 branches（本功能不与问题记录混淆）
  const tags = Array.from(txt.matchAll(/#([^\s#]+)/g)).map(m => m[1])
  const payload = loadStore()
  // 保持 branches 逻辑（仅本地）
  let branches = payload.branches || [
      { name: '会议', items: [] },
      { name: '财务', items: [] },
      { name: '生活', items: [] }
  ]
  if (!tags.length) {
      const target = branches.find(b => b.name === '生活') || branches[0]
      const content = txt || (files.value.map(f => f.name).join('、') || '附件')
      target.items.unshift(content)
  } else {
      tags.forEach(t => {
          const b = branches.find(x => x.name === t)
          if (b) {
              const content = txt || (files.value.map(f => f.name).join('、') || '附件')
              b.items.unshift(content)
          }
      })
  }
  payload.branches = branches
  saveStore(payload)
  inputText.value = ''
  files.value = []
}

// --------------- 决策 -> 问题记录（保存到 sidebar/questions） ---------------
const decisionText = ref('')
const currentAnswer = ref('')

// helper: load whole store
function loadStore() {
  try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}
function saveStore(payload) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload || {}))
  // 通知 App.vue 更新侧边栏
  window.dispatchEvent(new Event('questions-updated'))
}

// attemptBackendCreate: 如果未来接入后端，这里是调用后端的地方；
// 约定后端接口（示例）：
// POST /api/questions  body: { text }
// 返回: { id, text, answer, createdAt }
// 如果后端配置为空则返回 null，调用者要做本地 fallback。
async function attemptBackendCreate(text) {
  // 如果你启用了后端，把 BASE_URL 填到 env 或这里即可。
  const BASE = '' // <-- 若要接后端，把后端基础地址放在这里或使用 import.meta.env.VITE_API_BASE
  if (!BASE) return null
  try {
      const res = await fetch(`${BASE.replace(/\/$/, '')}/api/questions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text })
      })
      if (!res.ok) throw new Error('backend error')
      const data = await res.json()
      return data
  } catch (e) {
      console.warn('后端创建问题失败，回退到本地保存', e)
      return null
  }
}

// 本地生成一个回答（占位）
// 未来可替换为后端返回的真实回答
function generateLocalAnswer(text) {
  return `根据您的问题 "${text}"，我的建议（本地模拟答案）：
1. 分析问题的关键点；
2. 列出可行方案；
3. 评估优缺点并选最合适的方案；
（这是本地模拟，接入后端/模型可返回更智能的答案。）`
}

async function submitDecision() {
  const v = decisionText.value.trim()
  if (!v) return

  // 优先尝试后端；如果没有后端或失败则本地保存
  const backend = await attemptBackendCreate(v)
  let record = null
  if (backend && backend.id) {
      // 后端返回的数据（假设包含 id, text, answer, createdAt）
      record = {
          id: backend.id,
          text: backend.text || v,
          answer: backend.answer || '',
          createdAt: backend.createdAt || new Date().toISOString()
      }
  } else {
      // 本地保存
      record = {
          id: Date.now().toString(),
          text: v,
          answer: generateLocalAnswer(v),
          createdAt: new Date().toISOString()
      }
  }

  // 写入本地 store.questions（前置 newest）
  const store = loadStore()
  store.questions = store.questions || []
  store.questions.unshift(record)
  // 保留只保留最近 500 条以避免无限增长（可调整）
  if (store.questions.length > 500) store.questions.length = 500
  saveStore(store)

  // 显示回答并切换到该问题的路由（以便 URL 可分享）
  currentAnswer.value = record.answer
  decisionText.value = ''
  router.push({ path: `/question/${record.id}` })
}

// 当路由里有 question id 时加载对应问题并显示
function loadQuestionById(id) {
  if (!id) {
      currentAnswer.value = ''
      return
  }
  // 先从本地获取
  const store = loadStore()
  const q = (store.questions || []).find(x => x.id === id)
  if (q) {
      currentAnswer.value = q.answer || ''
      return
  }
  // 如果没有，尝试通过后端拉取（如果已接后端）
  (async () => {
      const BASE = '' // 同上，若接后端填地址
      if (!BASE) return
      try {
          const res = await fetch(`${BASE.replace(/\/$/, '')}/api/questions/${id}`)
          if (!res.ok) return
          const data = await res.json()
          currentAnswer.value = data.answer || ''
      } catch (e) {
          console.warn('fetch question from backend failed', e)
      }
  })()
}

// --------------- branches / 分类（保留原行为） ---------------
const branches = reactive([
  { name: '会议', items: [], count: 0 },
  { name: '财务', items: [], count: 0 },
  { name: '生活', items: [], count: 0 }
])

const selectedTag = ref(null)
const previewItems = computed(() => {
  if (!selectedTag.value) return []
  const b = branches.find(x => x.name === selectedTag.value)
  return (b?.items || []).slice(0, 8)
})

function removeRecord(tagName, index) {
  const branch = branches.find(b => b.name === tagName)
  if (branch) {
      branch.items.splice(index, 1)
      branch.count = branch.items.length
      // persist branches
      const store = loadStore()
      store.branches = branches.map(b => ({ name: b.name, items: b.items }))
      saveStore(store)
  }
}

// 加载持久化数据（branches + questions）
onMounted(() => {
  try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
          const parsed = JSON.parse(raw)
          if (parsed.branches) {
              parsed.branches.forEach(b => {
                  const exist = branches.find(x => x.name === b.name)
                  if (exist) { 
                      exist.items = b.items || []; 
                      exist.count = (b.items || []).length 
                  }
              })
          }
          // 如果路由上带有 question id，则加载
          const qid = route.params.id
          if (qid) {
              loadQuestionById(qid)
          }
      }
  } catch (e) { 
      console.warn('加载数据失败', e) 
  }
})

// 如果路由参数变化（点击侧边栏项会触发），则加载对应问题
watch(() => route.params.id, (nv) => {
  if (nv) loadQuestionById(nv)
})

// 保存 branches（保持原保存逻辑）
// 但注意：questions 的保存由 submitDecision 负责
function saveBranchesToStore() {
  const payload = loadStore()
  payload.branches = branches.map(b => ({ name: b.name, items: b.items }))
  saveStore(payload)
}
watch(branches, () => saveBranchesToStore(), { deep: true })
</script>

<style scoped>
/* 基础样式变量 */
:root {
  --primary: #4c6ef5;
  --primary-light: #eef2ff;
  --light-gray: #f1f5f9;
  --text: #0f172a;
  --text-light: #64748b;
  --accent:#4c6ef5;
  --border:#e6ecff;
  --background: #f8fafc;
  --card: #ffffff;
  --danger: #e53e3e;
}

/* 页面容器占满整个视口高度 */
.home-container {
  padding: 20px;
  min-height: 100vh;
  box-sizing: border-box;
  margin: 0;
}

/* 网格布局设置为占满整个高度 */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 1.5fr 1fr;
  grid-template-rows: 100vh;
  gap: 20px;
  height: calc(100vh - 40px); /* 减去padding */
}

/* 左侧列使用弹性布局，两个面板各占50% */
.left-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}

/* 左侧两个面板各占50%高度 */
.left-column .input-panel,
.left-column .decision-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 中间和右侧列占满整个高度 */
.middle-column, .right-column {
  height: 100%;
}

.middle-column .answer-panel,
.right-column .history-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 确保回答内容区域占满可用空间 */
.answer-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 面板通用样式 */
.panel {
  background: var(--card);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 6px 18px rgba(12, 34, 88, 0.06);
  box-sizing: border-box;
}

.panel-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border);
}

.head-ic {
  width: 24px;
  height: 24px;
  color: var(--primary);
}

.panel h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
}

/* 输入区域样式 */
.composer {
  display: flex;
  flex-direction: column;
  gap: 15px;
  flex: 1;
}

textarea {
  flex: 1;
  min-height: 120px;
  resize: vertical;
  padding: 15px;
  border-radius: 10px;
  border: 1px solid var(--border);
  font-family: inherit;
  font-size: 15px;
  line-height: 1.5;
}

textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(76, 110, 245, 0.1);
}

.action-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.upload-btn{
background: rgba(76, 110, 245, 0.1);
color: var(--accent);
padding: 10px 16px;
border-radius: 8px;
cursor: pointer;
display:flex;
align-items:center;
gap:8px;
font-size: 14px;
font-weight: 500;
transition:background-color 0.2s;
}

.upload-btn:hover{
background: rgba(76, 110, 245, 0.2);
}

.upload-btn .icon { width: 18px; height: 18px; }
.spacer { flex: 1; }

.submit-btn {
  background: var(--light-gray);
  color: #0f172a;
  border: 1px solid var(--border);
  padding: 12px 22px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
}
.submit-btn:hover { background-color: #e2e8f0; }

.answer-panel { flex: 1; display: flex; flex-direction: column; }
.answer-content { padding: 20px; background-color: var(--primary-light); border-radius: 10px; min-height: 300px; }
.answer-placeholder { color: var(--text-light); font-style: italic; }
.answer-text { text-align: left; line-height: 1.6; }

/* 决策面板 */
.decision-panel input {
  width: 100%;
  padding: 14px 16px;
  border-radius: 10px;
  border: 1px solid var(--border);
  font-size: 15px;
  box-sizing: border-box;
}

.decision-panel input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(76, 110, 245, 0.1);
}

.decision-submit-btn {
  background: var(--light-gray);
  color: #0f172a;
  border: 1px solid var(--border);
  padding: 14px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  margin-top: 15px;
  width: 100%;
  cursor: pointer;
}
.decision-submit-btn:hover { background-color: #e2e8f0; }

/* 右侧信息分类面板 */
.tag-buttons { display: flex; flex-direction: column; gap: 15px; padding: 10px 0; margin-bottom: 15px; align-items: center; }
.tag-btn { border: 0; background: var(--light-gray); color: var(--primary); padding: 15px 30px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 18px; text-align: center; transition: all 0.2s; width: 80%; }
.tag-btn:hover { background: var(--primary); color: white; }
.history-preview { margin-top: 15px; border-top: 1px dashed var(--border); padding-top: 15px; background-color: var(--primary-light); border-radius: 8px; padding: 15px; margin-bottom: 15px; }
.preview-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.edit-tag, .delete-tag, .close { background: none; border: none; cursor: pointer; color: var(--text-light); padding: 4px; display: flex; align-items: center; justify-content: center; }
.edit-tag .icon, .delete-tag .icon, .close .icon { width: 18px; height: 18px; }
.preview-list { max-height: 200px; overflow-y: auto; padding-right: 8px; }
.preview-list ul { margin: 10px 0; padding-left: 22px; }
.hint { margin-top: auto; color: var(--text-light); font-size: 13px; padding-top: 10px; border-top: 1px dashed var(--border); }
code { background-color: rgba(16, 24, 40, 0.04); padding: 2px 6px; border-radius: 4px; font-size: 12px; }

/* 文件预览 */
.files-preview { margin-top: 15px; padding-top: 15px; border-top: 1px dashed var(--border); }
.file-list { margin-top: 8px; }
.file-item { display: flex; align-items: center; gap: 8px; padding: 6px 0; border-bottom: 1px solid var(--border); }
.file-item .icon { width: 16px; height: 16px; color: var(--text-light); }
.remove-file { background: none; border: none; cursor: pointer; color: var(--danger); margin-left: auto; }
.remove-file .icon { width: 16px; height: 16px; color: var(--danger); }

/* 响应式调整 */
@media (max-width: 1400px) {
  .content-grid {
      grid-template-columns: 1fr 1fr 1fr;
  }
}

@media (max-width: 1200px) {
  .content-grid {
      grid-template-columns: 1fr 1fr;
      grid-template-rows: auto auto;
      height: auto;
      min-height: 100vh;
  }
  
  .left-column {
      grid-column: span 1;
      height: 100%;
  }
  
  .middle-column, .right-column {
      grid-column: span 1;
      height: 100%;
  }
}

@media (max-width: 980px) {
  .content-grid {
      grid-template-columns: 1fr;
      grid-template-rows: auto;
      height: auto;
  }
  
  .left-column, .middle-column, .right-column {
      grid-column: span 1;
      height: auto;
  }
  
  .left-column {
      flex-direction: column;
      gap: 20px;
  }
  
  .left-column .input-panel,
  .left-column .decision-panel {
      height: auto;
      min-height: 300px;
  }
}

@media (max-width: 600px) {
  .home-container {
      padding: 10px;
  }
  
  .content-grid {
      gap: 10px;
  }
  
  .action-row {
      gap: 8px;
  }
  
  .upload-btn, .submit-btn, .decision-submit-btn {
      padding: 8px 12px;
      font-size: 13px;
  }
  
  .tag-btn {
      font-size: 16px;
      padding: 12px 20px;
      width: 100%;
  }
}
</style>