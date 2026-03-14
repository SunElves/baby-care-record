<template>
  <div class="feeding">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>喂奶记录</span>
          <el-date-picker
            v-model="selectedDate"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="loadFeedingData"
          />
        </div>
      </template>
      
      <div style="display: flex; justify-content: flex-end;">
        <el-button type="primary" @click="openAddFeedingDialog">
          <el-icon><Plus /></el-icon>
          添加喂奶记录
        </el-button>
      </div>
      
      <div class="table-container">
        <el-table :data="sortedFeedingRecords" style="width: 100%">
          <el-table-column label="顺序" align="center">
            <template #default="scope">
              第{{ scope.$index + 1 }}次
            </template>
          </el-table-column>
          <el-table-column prop="time" label="时间"/>
          <el-table-column prop="type" label="类型">
            <template #default="scope">
              <el-tag :type="getTypeTagType(scope.row.type)" size="small">
                {{ getTypeText(scope.row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="amount" label="量 (ml)">
            <template #default="scope">
              {{ scope.row.type === 'formula' ? scope.row.amount : '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="notes" label="备注" />
          <el-table-column label="记录人" align="center">
            <template #default="scope">
              <div class="recorder-cell">
                <span class="recorder-avatar">{{ getRecorderInfo(scope.row.recorder).avatar }}</span>
                <span class="recorder-name">{{ getRecorderInfo(scope.row.recorder).name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right" align="center">
            <template #default="scope">
              <div class="table-actions">
                <el-button size="small" @click="editFeedingRecord(scope.row)">编辑</el-button>
                <el-button size="small" type="danger" @click="deleteFeedingRecord(scope.row.id)">删除</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <div class="feeding-stats" style="margin-top: 20px;">
        <el-card class="stats-card">
          <h3>喂奶统计</h3>
          <div class="stats-grid">
            <div class="stat-item stat-total">
              <div class="stat-value">{{ totalAmount }} ml</div>
              <div class="stat-label">总喂奶量</div>
            </div>
            <div class="stat-item stat-average">
              <div class="stat-value">{{ averageAmount }} ml</div>
              <div class="stat-label">平均奶量</div>
            </div>
            <div class="stat-item stat-breastfeeding">
              <div class="stat-value">{{ breastfeedingCount }}</div>
              <div class="stat-label">母乳喂养次数</div>
            </div>
            <div class="stat-item stat-interval">
              <div class="stat-value">{{ averageInterval }}</div>
              <div class="stat-label">平均喂奶间隔</div>
            </div>
          </div>
        </el-card>
      </div>
    </el-card>
    
    <!-- 添加/编辑喂奶记录对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="90%"
      :max-width="'500px'"
    >
      <el-form :model="feedingForm" label-width="70px" class="dialog-form">
        <el-form-item label="时间">
          <el-time-picker
            v-model="feedingForm.time"
            format="HH:mm"
            value-format="HH:mm"
            placeholder="选择时间"
            style="width: 100%"
            :editable="false"
            clearable
          />
        </el-form-item>
        <el-form-item label="类型">
          <el-radio-group v-model="feedingForm.type" @change="onTypeChange" class="radio-group">
            <el-radio value="formula">奶粉</el-radio>
            <el-radio value="breast">母乳喂养</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="量 (ml)" v-if="feedingForm.type === 'formula'">
          <el-select v-model="feedingForm.amountOption" @change="onAmountOptionChange" style="width: 100%">
            <el-option label="100ml" value="100" />
            <el-option label="150ml" value="150" />
            <el-option label="200ml" value="200" />
            <el-option label="自定义" value="custom" />
          </el-select>
          <el-input
            v-if="feedingForm.amountOption === 'custom'"
            type="number"
            v-model="feedingForm.amount"
            style="width: 100%; margin-top: 12px"
          />
        </el-form-item>

        <el-form-item label="备注">
          <el-input
            v-model="feedingForm.notes"
            type="textarea"
            placeholder="请输入备注"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveFeedingRecord">保存</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 删除确认对话框 -->
    <el-dialog
      v-model="deleteDialogVisible"
      title="确认删除"
      width="90%"
      :max-width="'400px'"
    >
      <p>确定要删除这条喂奶记录吗？此操作不可撤销。</p>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="confirmDelete">确认删除</el-button>
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
  name: 'Feeding',
  components: {
    Plus
  },
  setup() {
    const recorderStore = useRecorderStore()
    const selectedDate = ref(new Date().toISOString().split('T')[0])
    const feedingRecords = ref([])
    const dialogVisible = ref(false)
    const deleteDialogVisible = ref(false)
    const dialogTitle = ref('添加喂奶记录')
    const currentDeleteId = ref('')
    const feedingForm = ref({
      id: '',
      time: '',
      type: 'formula',
      amount: 100,
      amountOption: '100',
      side: 'left',
      notes: '',
      recorder: recorderStore.currentRecorder.id
    })
    
    onMounted(() => {
      document.title = '喂奶记录'
    })
    
    const loadFeedingData = () => {
      // 从LocalStorage加载数据
      const data = localStorage.getItem(`feeding_${selectedDate.value}`)
      if (data) {
        feedingRecords.value = JSON.parse(data)
      } else {
        feedingRecords.value = []
      }
    }
    
    const saveFeedingData = () => {
      localStorage.setItem(`feeding_${selectedDate.value}`, JSON.stringify(feedingRecords.value))
    }
    
    const openAddFeedingDialog = () => {
      dialogTitle.value = '添加喂奶记录'
      feedingForm.value = {
        id: '',
        time: '',
        type: 'formula',
        amount: 100,
        amountOption: '100',
        side: 'left',
        notes: '',
        recorder: recorderStore.currentRecorder.id
      }
      dialogVisible.value = true
    }
    
    const editFeedingRecord = (record) => {
      dialogTitle.value = '编辑喂奶记录'
      feedingForm.value = { 
        ...record,
        amountOption: record.amount?.toString() || '100'
      }
      dialogVisible.value = true
    }
    
    const deleteFeedingRecord = (id) => {
      currentDeleteId.value = id
      deleteDialogVisible.value = true
    }
    
    const confirmDelete = () => {
      feedingRecords.value = feedingRecords.value.filter(record => record.id !== currentDeleteId.value)
      saveFeedingData()
      deleteDialogVisible.value = false
    }
    
    const saveFeedingRecord = () => {
      // 验证时间是否为空
      if (!feedingForm.value.time) {
        ElMessage.warning('请选择时间')
        return
      }
      
      // 自动使用当前选中的记录人员
      feedingForm.value.recorder = recorderStore.currentRecorder.id
      
      if (feedingForm.value.id) {
        // 编辑现有记录
        const index = feedingRecords.value.findIndex(record => record.id === feedingForm.value.id)
        if (index !== -1) {
          feedingRecords.value[index] = { 
            ...feedingForm.value,
            amount: feedingForm.value.type === 'formula' ? parseInt(feedingForm.value.amount) || 0 : undefined
          }
        }
      } else {
        // 添加新记录
        feedingRecords.value.push({ 
          ...feedingForm.value,
          id: Date.now().toString(),
          amount: feedingForm.value.type === 'formula' ? parseInt(feedingForm.value.amount) || 0 : undefined
        })
      }
      saveFeedingData()
      dialogVisible.value = false
    }
    
    const onTypeChange = () => {
      if (feedingForm.value.type === 'breast') {
        feedingForm.value.side = 'left'
      }
    }
    
    const onAmountOptionChange = (value) => {
      if (value !== 'custom') {
        feedingForm.value.amount = parseInt(value)
      }
    }
    
    const getTypeTagType = (type) => {
      return type === 'breast' ? 'success' : 'primary'
    }
    
    const getTypeText = (type) => {
      return type === 'breast' ? '母乳喂养' : '奶粉'
    }
    
    const getRecorderInfo = (recorderId) => {
      return recorderStore.getRecorderById(recorderId)
    }
    
    const totalAmount = computed(() => {
      const formulaRecords = feedingRecords.value.filter(record => record.type === 'formula')
      return formulaRecords.reduce((total, record) => {
        return total + (parseInt(record.amount) || 0)
      }, 0)
    })
    
    const averageAmount = computed(() => {
      const formulaRecords = feedingRecords.value.filter(record => record.type === 'formula')
      const validFormulaRecords = formulaRecords.filter(record => record.amount !== undefined && record.amount !== null)
      if (validFormulaRecords.length === 0) return 0
      const total = validFormulaRecords.reduce((sum, record) => sum + (parseInt(record.amount) || 0), 0)
      return Math.round(total / validFormulaRecords.length)
    })
    
    const breastfeedingCount = computed(() => {
      return feedingRecords.value.filter(record => record.type === 'breast').length
    })
    
    const sortedFeedingRecords = computed(() => {
      return [...feedingRecords.value].sort((a, b) => {
        const timeA = a.time.split(':').map(Number)
        const timeB = b.time.split(':').map(Number)
        const minutesA = timeA[0] * 60 + timeA[1]
        const minutesB = timeB[0] * 60 + timeB[1]
        return minutesA - minutesB
      })
    })
    
    const averageInterval = computed(() => {
      if (sortedFeedingRecords.value.length < 2) {
        return '0 分钟'
      }
      
      let totalMinutes = 0
      for (let i = 1; i < sortedFeedingRecords.value.length; i++) {
        const prevTime = sortedFeedingRecords.value[i-1].time.split(':').map(Number)
        const currTime = sortedFeedingRecords.value[i].time.split(':').map(Number)
        const prevMinutes = prevTime[0] * 60 + prevTime[1]
        const currMinutes = currTime[0] * 60 + currTime[1]
        totalMinutes += currMinutes - prevMinutes
      }
      
      const avgMinutes = Math.round(totalMinutes / (sortedFeedingRecords.value.length - 1))
      const hours = Math.floor(avgMinutes / 60)
      const minutes = avgMinutes % 60
      
      if (hours > 0) {
        return `${hours} 小时 ${minutes} 分钟`
      } else {
        return `${minutes} 分钟`
      }
    })
    
    onMounted(() => {
      loadFeedingData()
    })
    
    return {
      selectedDate,
      feedingRecords,
      sortedFeedingRecords,
      dialogVisible,
      deleteDialogVisible,
      dialogTitle,
      feedingForm,
      loadFeedingData,
      openAddFeedingDialog,
      editFeedingRecord,
      deleteFeedingRecord,
      confirmDelete,
      saveFeedingRecord,
      onTypeChange,
      onAmountOptionChange,
      getTypeTagType,
      getTypeText,
      getRecorderInfo,
      totalAmount,
      averageAmount,
      breastfeedingCount,
      averageInterval
    }
  }
}
</script>

<style lang="scss" scoped>
.feeding {
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
    background: linear-gradient(135deg, #4cc9f0 0%, #4361ee 100%);
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
    border-radius: 8px;
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(255, 255, 255, 0.8);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }
    
    &.el-button--danger {
      &:hover {
        background: rgba(245, 108, 108, 0.9);
        box-shadow: 0 4px 12px rgba(245, 108, 108, 0.3);
      }
    }
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

.feeding-stats {
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
  background: linear-gradient(135deg, rgba(76, 201, 240, 0.15), rgba(76, 201, 240, 0.25));
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  box-shadow: 0 6px 20px rgba(76, 201, 240, 0.2);
  
  .stat-value {
    color: #4cc9f0;
  }
}

.stat-average {
  background: linear-gradient(135deg, rgba(67, 97, 238, 0.15), rgba(67, 97, 238, 0.25));
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  box-shadow: 0 6px 20px rgba(67, 97, 238, 0.2);
  
  .stat-value {
    color: #4361ee;
  }
}

.stat-breastfeeding {
  background: linear-gradient(135deg, rgba(48, 211, 100, 0.15), rgba(48, 211, 100, 0.25));
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  box-shadow: 0 6px 20px rgba(48, 211, 100, 0.2);
  
  .stat-value {
    color: #30d364;
  }
}

.stat-interval {
  background: linear-gradient(135deg, rgba(247, 127, 0, 0.15), rgba(247, 127, 0, 0.25));
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  box-shadow: 0 6px 20px rgba(247, 127, 0, 0.2);
  
  .stat-value {
    color: #f77f00;
  }
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #4cc9f0;
  margin-bottom: 8px;
}

.stat-label {
  color: #4a4e69;
  font-size: 14px;
  font-weight: 500;
}

.el-dialog {
  .el-dialog__header {
    background: linear-gradient(135deg, #4cc9f0 0%, #4361ee 100%);
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
  .feeding {
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
  .feeding {
    padding: 20px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>