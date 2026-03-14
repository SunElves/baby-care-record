<template>
  <div class="sleep">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>睡眠记录</span>
          <el-date-picker
            v-model="selectedDate"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="loadSleepData"
          />
        </div>
      </template>
      
      <div style="display: flex; justify-content: flex-end;">
        <el-button type="primary" @click="openAddSleepDialog">
          <el-icon><Plus /></el-icon>
          添加睡眠记录
        </el-button>
      </div>
      
      <div class="table-container">
        <el-table :data="sleepRecordsWithIndex" style="width: 100%">
          <el-table-column label="序号" width="100" align="center">
            <template #default="scope">
              第{{ scope.row.sleepIndex }}觉
            </template>
          </el-table-column>
          <el-table-column prop="startTime" label="开始时间" />
          <el-table-column prop="endTime" label="结束时间"  />
          <el-table-column prop="duration" label="时长(分钟)" />
          <el-table-column prop="quality" label="睡眠质量">
            <template #default="scope">
              <el-tag :type="getQualityTagType(scope.row.quality)" size="small">
                {{ getQualityText(scope.row.quality) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="记录人" align="center">
            <template #default="scope">
              <div class="recorder-cell">
                <span class="recorder-avatar">{{ getRecorderInfo(scope.row.recorder).avatar }}</span>
                <span class="recorder-name">{{ getRecorderInfo(scope.row.recorder).name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="notes" label="备注"/>
          <el-table-column label="操作" width="150" fixed="right" align="center">
            <template #default="scope">
              <div class="table-actions">
                <el-button size="small" @click="editSleepRecord(scope.row)">编辑</el-button>
                <el-button size="small" type="danger" @click="deleteSleepRecord(scope.row.id)">删除</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <div class="sleep-stats" style="margin-top: 20px;">
        <el-card class="stats-card">
          <h3>睡眠统计</h3>
          <div class="stats-grid">
            <div class="stat-item stat-total">
              <div class="stat-value">{{ formatDuration(totalSleepDuration) }}</div>
              <div class="stat-label">总睡眠时长</div>
            </div>
            <div class="stat-item stat-count">
              <div class="stat-value">{{ sleepRecords.length }} 次</div>
              <div class="stat-label">睡眠次数</div>
            </div>
            <div class="stat-item stat-average">
              <div class="stat-value">{{ formatDuration(averageSleepDuration) }}</div>
              <div class="stat-label">平均时长</div>
            </div>
          </div>
        </el-card>
      </div>
    </el-card>
    
    <!-- 添加/编辑睡眠记录对话框 -->
    <!-- 添加/编辑睡眠记录对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="90%"
      :max-width="'500px'"
    >
      <el-form :model="sleepForm" label-width="80px" class="dialog-form">
        <el-form-item label="开始时间">
          <el-time-picker
            v-model="sleepForm.startTime"
            format="HH:mm"
            value-format="HH:mm"
            placeholder="选择开始时间"
            style="width: 100%"
            :editable="false"
            clearable
          />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-time-picker
            v-model="sleepForm.endTime"
            format="HH:mm"
            value-format="HH:mm"
            placeholder="选择结束时间"
            style="width: 100%"
            :editable="false"
            clearable
          />
        </el-form-item>
        <el-form-item label="睡眠质量">
          <el-radio-group v-model="sleepForm.quality" class="radio-group">
            <el-radio value="excellent">优秀</el-radio>
            <el-radio value="good">良好</el-radio>
            <el-radio value="fair">一般</el-radio>
            <el-radio value="poor">较差</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="sleepForm.notes"
            type="textarea"
            placeholder="请输入备注"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveSleepRecord">保存</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 删除确认对话框 -->
    <el-dialog
      v-model="confirmDialogVisible"
      title="确认删除"
      width="90%"
      :max-width="'400px'"
    >
      <p>确定要删除这条睡眠记录吗？此操作不可恢复。</p>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="confirmDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="confirmDelete">删除</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRecorderStore } from '../stores/recorder'

export default {
  name: 'Sleep',
  components: {
    Plus
  },
  setup() {
    const recorderStore = useRecorderStore()
    const selectedDate = ref(new Date().toISOString().split('T')[0])
    const sleepRecords = ref([])
    const dialogVisible = ref(false)
    const confirmDialogVisible = ref(false)
    const dialogTitle = ref('添加睡眠记录')
    const deleteId = ref('')
    const sleepForm = ref({
      id: '',
      startTime: '',
      endTime: '',
      quality: 'good',
      notes: '',
      recorder: recorderStore.currentRecorder.id
    })
    
    onMounted(() => {
      document.title = '睡眠记录'
    })
    
    const loadSleepData = () => {
      // 从LocalStorage加载数据
      const data = localStorage.getItem(`sleep_${selectedDate.value}`)
      if (data) {
        sleepRecords.value = JSON.parse(data)
      } else {
        sleepRecords.value = []
      }
    }
    
    const saveSleepData = () => {
      localStorage.setItem(`sleep_${selectedDate.value}`, JSON.stringify(sleepRecords.value))
    }
    
    const openAddSleepDialog = () => {
      dialogTitle.value = '添加睡眠记录'
      sleepForm.value = {
        id: '',
        startTime: '',
        endTime: '',
        quality: 'good',
        notes: ''
      }
      dialogVisible.value = true
    }
    
    const editSleepRecord = (record) => {
      dialogTitle.value = '编辑睡眠记录'
      sleepForm.value = { ...record }
      dialogVisible.value = true
    }
    
    const deleteSleepRecord = (id) => {
      deleteId.value = id
      confirmDialogVisible.value = true
    }
    
    const confirmDelete = () => {
      sleepRecords.value = sleepRecords.value.filter(record => record.id !== deleteId.value)
      saveSleepData()
      confirmDialogVisible.value = false
    }
    
    const saveSleepRecord = () => {
      // 验证开始时间
      if (!sleepForm.value.startTime) {
        ElMessage.error('请选择开始时间')
        return
      }
      
      // 验证结束时间（如果填写了）
      if (sleepForm.value.endTime) {
        // 验证结束时间是否晚于开始时间
        const start = sleepForm.value.startTime.split(':').map(Number)
        const end = sleepForm.value.endTime.split(':').map(Number)
        const startTimeInMinutes = start[0] * 60 + start[1]
        const endTimeInMinutes = end[0] * 60 + end[1]
        
        if (endTimeInMinutes <= startTimeInMinutes) {
          ElMessage.error('结束时间必须晚于开始时间')
          return
        }
        
        // 计算睡眠时长
        let duration = endTimeInMinutes - startTimeInMinutes
        if (duration < 0) duration += 24 * 60 // 跨天情况
        sleepForm.value.duration = duration
      } else {
        // 没有结束时间时，时长为0
        sleepForm.value.duration = 0
      }
      
      // 自动使用当前选中的记录人员
      sleepForm.value.recorder = recorderStore.currentRecorder.id
      
      if (sleepForm.value.id) {
        // 编辑现有记录
        const index = sleepRecords.value.findIndex(record => record.id === sleepForm.value.id)
        if (index !== -1) {
          sleepRecords.value[index] = { ...sleepForm.value }
        }
      } else {
        // 添加新记录
        const newRecord = {
          ...sleepForm.value,
          id: Date.now().toString()
        }
        sleepRecords.value.push(newRecord)
      }
      saveSleepData()
      dialogVisible.value = false
    }
    
    const getQualityTagType = (quality) => {
      switch (quality) {
        case 'excellent': return 'success'
        case 'good': return 'primary'
        case 'fair': return 'warning'
        case 'poor': return 'danger'
        default: return ''
      }
    }
    
    const getQualityText = (quality) => {
      switch (quality) {
        case 'excellent': return '优秀'
        case 'good': return '良好'
        case 'fair': return '一般'
        case 'poor': return '较差'
        default: return ''
      }
    }
    
    const getRecorderInfo = (recorderId) => {
      return recorderStore.getRecorderById(recorderId)
    }
    
    const totalSleepDuration = computed(() => {
      return sleepRecords.value.reduce((total, record) => {
        if (record.startTime && record.endTime) {
          const start = record.startTime.split(':').map(Number)
          const end = record.endTime.split(':').map(Number)
          let duration = (end[0] * 60 + end[1]) - (start[0] * 60 + start[1])
          if (duration < 0) duration += 24 * 60 // 跨天情况
          return total + duration
        }
        return total
      }, 0)
    })
    
    // 格式化睡眠时长显示
    const formatDuration = (minutes) => {
      if (minutes < 60) {
        return `${minutes} 分钟`
      } else {
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        if (mins === 0) {
          return `${hours} 小时`
        } else {
          return `${hours} 小时 ${mins} 分钟`
        }
      }
    }
    
    const averageSleepDuration = computed(() => {
      if (sleepRecords.value.length === 0) return 0
      return Math.round(totalSleepDuration.value / sleepRecords.value.length)
    })
    
    // 为睡眠记录添加序号
    const sleepRecordsWithIndex = computed(() => {
      // 按开始时间排序
      const sortedRecords = [...sleepRecords.value].sort((a, b) => {
        return a.startTime.localeCompare(b.startTime)
      })
      
      // 添加序号
      return sortedRecords.map((record, index) => {
        return {
          ...record,
          sleepIndex: index + 1
        }
      })
    })
    
    onMounted(() => {
      loadSleepData()
    })
    
    return {
      selectedDate,
      sleepRecords,
      sleepRecordsWithIndex,
      dialogVisible,
      confirmDialogVisible,
      dialogTitle,
      deleteId,
      sleepForm,
      loadSleepData,
      openAddSleepDialog,
      editSleepRecord,
      deleteSleepRecord,
      confirmDelete,
      saveSleepRecord,
      getQualityTagType,
      getQualityText,
      getRecorderInfo,
      totalSleepDuration,
      averageSleepDuration,
      formatDuration
    }
  }
}
</script>

<style lang="scss" scoped>
.sleep {
  padding: 24px;
  min-height: 100vh;
  background-color: #f8f5f0;
  background-image: linear-gradient(135deg, #f8f5f0 0%, #f5f0e6 100%);
  background-attachment: fixed;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.el-card {
  border: none;
  
  .el-card__header {
    background: linear-gradient(135deg, #4361ee 0%, #4895ef 100%);
    color: #ffffff;
    border-bottom: none;
    padding: 20px 24px;
    font-size: 16px;
    font-weight: 600;
    
    .el-date-picker {
      margin-bottom: 0;
      
      .el-input__wrapper {
        background-color: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
        
        .el-input__inner {
          color: #ffffff;
        }
        
        .el-input__prefix-inner {
          .el-date-editor .el-input__icon {
            color: #ffffff;
          }
        }
      }
    }
  }
}

.el-button {
  margin-bottom: 20px;
  
  .el-icon {
    margin-right: 8px;
  }
}

.table-container {
  overflow-x: auto;
  margin-bottom: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  
  &::-webkit-scrollbar {
    height: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
  }
}

.el-table {
  min-width: 600px;
  
  .el-table__row {
    &:hover {
      background-color: #edf2f4;
    }
  }
  
  .el-table__cell {
    padding: 8px 12px;
  }
}

.table-actions {
  display: flex;
  gap: 8px;
  
  .el-button {
    padding: 4px 8px;
    font-size: 12px;
  }
}

.el-tag {
  font-weight: 500;
  padding: 4px 12px;
  border-radius: 16px;
}

.recorder-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  
  .recorder-avatar {
    font-size: 18px;
  }
  
  .recorder-name {
    font-size: 12px;
    color: #666;
  }
}

.sleep-stats {
  margin-top: 24px;
}

.stats-card {
  margin-top: 24px;
  border: none;
  
  .el-card__body {
    padding: 24px;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.stat-item {
  text-align: center;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  }
}

.stat-total {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(102, 126, 234, 0.25));
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.2);
  
  .stat-value {
    color: #667eea;
  }
}

.stat-count {
  background: linear-gradient(135deg, rgba(147, 51, 234, 0.15), rgba(147, 51, 234, 0.25));
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  box-shadow: 0 6px 20px rgba(147, 51, 234, 0.2);
  
  .stat-value {
    color: #9333ea;
  }
}

.stat-average {
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(236, 72, 153, 0.25));
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  box-shadow: 0 6px 20px rgba(236, 72, 153, 0.2);
  
  .stat-value {
    color: #ec4899;
  }
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
}

.stat-label {
  color: #4a4e69;
  font-size: 14px;
  font-weight: 500;
}

.el-dialog {
  .el-dialog__header {
    background: linear-gradient(135deg, #4361ee 0%, #4895ef 100%);
    color: #ffffff;
    border-bottom: none;
    
    .el-dialog__title {
      color: #ffffff;
      font-weight: 600;
    }
    
    .el-dialog__headerbtn .el-icon {
      color: #ffffff;
    }
  }
  
  .el-dialog__body {
    padding: 20px;
  }
  
  .dialog-form {
    .el-form-item {
      margin-bottom: 16px;
      
      .el-form-item__label {
        font-size: 14px;
      }
    }
  }
  
  .radio-group {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    
    .el-radio {
      margin-right: 0;
      font-size: 14px;
    }
  }
  
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    
    .el-button {
      padding: 8px 16px;
      font-size: 14px;
    }
  }
}

@media (max-width: 768px) {
  .sleep {
    padding: 16px;
    padding-bottom: 80px; /* 为底部导航留出空间 */
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .el-card {
    .el-card__header {
      padding: 16px 20px;
    }
  }
  
  .table-container {
    margin-bottom: 20px;
  }
  
  .el-table {
    .el-table__cell {
      padding: 6px 8px;
      font-size: 13px;
    }
  }
  
  .table-actions {
    gap: 4px;
    
    .el-button {
      padding: 2px 6px;
      font-size: 11px;
    }
  }
  
  .el-tag {
    font-size: 11px;
    padding: 2px 8px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .stat-item {
    padding: 20px;
  }
  
  .stat-value {
    font-size: 24px;
  }
  
  .el-dialog {
    width: 95% !important;
    margin: 20px auto !important;
    
    .el-dialog__body {
      padding: 16px;
    }
    
    .dialog-form {
      .el-form-item {
        margin-bottom: 12px;
        
        .el-form-item__label {
          font-size: 13px;
        }
      }
    }
    
    .radio-group {
      gap: 8px;
      
      .el-radio {
        font-size: 13px;
      }
    }
    
    .dialog-footer {
      gap: 8px;
      
      .el-button {
        padding: 6px 12px;
        font-size: 13px;
      }
    }
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .sleep {
    padding: 20px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>