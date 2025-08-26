<template> 
  <div class="life-page">
    <div class="records-page">
      <div class="page-header">
        <h1>历史事项记录 -- 生活</h1>
        <button class="back-btn" @click="goHome">
          <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M11.67 3.87L9.9 2.1 0 12l9.9 9.9 1.77-1.77L3.54 12l8.13-8.13z" fill="currentColor"/>
          </svg>
          返回首页
        </button>
      </div>

      <div class="calendar-section">
        <RecordCalendar 
          :records="lifeRecords" 
          category="生活"
          @date-click="handleDateClick"
          color-system="orange"
        />
      </div>

      <div class="records-table-container">
        <table class="records-table">
          <thead>
            <tr>
              <th>上传时间</th>
              <th>主题</th>
              <th>详细内容</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(record, index) in filteredRecords" :key="record._id ?? index">
              <td>{{ formatDate(record.timestamp) }}</td>
              <td>{{ record.title }}</td>
              <td class="content-cell">
                <div class="content-text">{{ record.content }}</div>
              </td>
              <td>
                <button class="edit-btn" @click="openEditDialog(record)">
                  <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
                  </svg>
                </button>
                <button class="delete-btn" @click="deleteRecord(index)">
                  <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
                  </svg>
                </button>
              </td>
            </tr>

            <tr v-if="filteredRecords.length === 0">
              <td colspan="4" class="empty-state">
                {{ activeDate ? `${activeDate.dateStr} 暂无生活记录` : '暂无生活记录' }}
                <button class="add-first-btn" @click="goHome">
                  添加第一条记录
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 编辑弹窗 -->
      <el-dialog v-model="isEditDialogVisible" title="编辑生活记录" width="500px">
        <el-form :model="editForm" label-width="80px">
          <el-form-item label="上传时间">
            <el-date-picker
              v-model="editForm.timestamp"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="选择日期"
              style="width: 100%;"
            />
          </el-form-item>
          <el-form-item label="主题">
            <el-input v-model="editForm.title" />
          </el-form-item>
          <el-form-item label="详细内容">
            <el-input type="textarea" v-model="editForm.content" rows="4" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="isEditDialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            @click="submitEdit"
            style="background-color: rgba(76, 110, 245, 0.1); color: #4c6ef5; border: none;"
          >
            提交
          </el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import '@/style/Life.css'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLifeStore } from '@/stores/life'
import RecordCalendar from '@/components/RecordCalendar.vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const goHome = () => router.push('/')

const lifeStore = useLifeStore()
const lifeRecords = computed(() => lifeStore.records ?? [])

const formatDate = (timestamp) => {
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')}`
}

const activeDate = ref(null)
const filteredRecords = computed(() => {
  let result = lifeRecords.value.filter(r => r.category === '生活')
  if (activeDate.value) {
    result = result.filter(r => formatDate(r.timestamp) === activeDate.value.dateStr)
  }
  return result
})

// 编辑弹窗控制
const isEditDialogVisible = ref(false)
const editForm = ref({
  _id: '',
  timestamp: '',
  title: '',
  content: ''
})

const openEditDialog = (record) => {
  editForm.value = { ...record }
  isEditDialogVisible.value = true
}

const submitEdit = () => {
  lifeStore.editRecord(editForm.value._id, {
    title: editForm.value.title,
    content: editForm.value.content,
    timestamp: editForm.value.timestamp
  })
  ElMessage.success('记录已更新')
  isEditDialogVisible.value = false
}

const deleteRecord = (index) => {
  const current = filteredRecords.value[index]
  if (!current || current.category !== '生活') return
  if (confirm(`确定要删除"${current.title}"吗？`)) {
    lifeStore.deleteRecord(current._id)
    ElMessage.success('记录已删除')
  }
}

const handleDateClick = (date) => {
  activeDate.value = date
}

onMounted(async () => {
  try {
    await lifeStore.fetchRecords()
  } catch (error) {
    console.error('加载生活记录失败:', error)
  }
})
</script>
