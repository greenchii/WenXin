<template>
  <div class="meeting-page">
    <div class="page-header">
      <h1>历史事项记录 -- 会议</h1>
      <button class="back-btn" @click="goHome">
        <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M11.67 3.87L9.9 2.1 0 12l9.9 9.9 1.77-1.77L3.54 12l8.13-8.13z" fill="currentColor"/>
        </svg>
        返回首页
      </button>
    </div>

    <!-- 日历 -->
    <div class="calendar-section">
      <RecordCalendar 
        :records="meetingRecords" 
        category="会议"
        @date-click="handleDateClick"
        color-system="green"
      />
    </div>

    <!-- 表格 -->
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
              <div class="content-text">{{ record.content ?? record.description }}</div>
            </td>
            <td>
              <button class="edit-btn" @click="openEditDialog(record)">
                <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
                </svg>
              </button>
              <button class="delete-btn" @click="confirmDelete(record)">
                <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
                </svg>
              </button>
            </td>
          </tr>

          <tr v-if="filteredRecords.length === 0">
            <td colspan="4" class="empty-state">
              {{ activeDate ? `${activeDate.dateStr} 暂无会议记录` : '暂无会议记录' }}
              <button class="add-first-btn" @click="goHome">
                添加第一条记录
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 编辑弹窗 -->
    <el-dialog v-model="editDialogVisible" title="编辑会议记录" width="500px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="上传时间">
          <el-date-picker
            v-model="editForm.timestamp"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="主题">
          <el-input v-model="editForm.title" />
        </el-form-item>
        <el-form-item label="详细内容">
          <el-input type="textarea" v-model="editForm.content" :rows="4" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button
          :style="{ backgroundColor: 'rgba(76, 110, 245, 0.1)', color: '#4c6ef5' }"
          @click="submitEdit"
        >
          提交
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import '@/style/Meeting.css'
import { computed, onMounted, ref } from 'vue'
import { useMeetingStore } from '@/stores/meeting'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import RecordCalendar from '@/components/RecordCalendar.vue'

// 路由
const router = useRouter()
const goHome = () => router.push('/')

// store
const meetingStore = useMeetingStore()
const meetingRecords = computed(() =>
  (meetingStore.records ?? []).map(record => ({
    ...record,
    timestamp: record.timestamp || record.time,
    category: record.category || '会议'
  }))
)

// 工具
const formatDate = (timestamp) => {
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
}

// 筛选
const activeDate = ref(null)
const filteredRecords = computed(() => {
  let result = meetingRecords.value
  if (activeDate.value) {
    result = result.filter(r => formatDate(r.timestamp) === activeDate.value.dateStr)
  }
  return result
})

// 编辑弹窗
const editDialogVisible = ref(false)
const editForm = ref({ _id: '', timestamp: '', title: '', content: '' })

const openEditDialog = (record) => {
  editForm.value = {
    _id: record._id,
    timestamp: record.timestamp,
    title: record.title,
    content: record.content
  }
  editDialogVisible.value = true
}

const submitEdit = () => {
  if (!editForm.value._id) return
  meetingStore.editRecord(editForm.value._id, { ...editForm.value })
  ElMessage.success('会议记录已更新')
  editDialogVisible.value = false
}

// 删除
const confirmDelete = (record) => {
  ElMessageBox.confirm(
    `确定要删除 "${record.title}" 吗？`,
    '提示',
    { type: 'warning' }
  )
    .then(() => {
      meetingStore.deleteRecord(record._id)
      ElMessage.success('会议记录已删除')
    })
    .catch(() => {})
}

// 日历点击
const handleDateClick = (date) => {
  activeDate.value = date
}

// 初始化
onMounted(() => {
  meetingStore.fetchRecords()
})
</script>


