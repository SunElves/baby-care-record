<template>
  <div class="diaper">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>换尿布记录</span>
          <el-date-picker
            v-model="selectedDate"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="loadDiaperData"
          />
        </div>
      </template>
      
      <div style="display: flex; justify-content: flex-end;">
        <el-button type="primary" @click="openAddDiaperDialog">
          <el-icon><Plus /></el-icon>
          添加尿布记录
        </el-button>
      </div>
      
      <div class="table-container">
        <el-table :data="sortedDiaperRecords" style="width: 100%">
          <el-table-column label="序号" align="center">
            <template #default="scope">
              第{{ scope.$index + 1 }}次
            </template>
          </el-table-column>
          <el-table-column prop="time" label="时间" />
          <el-table-column prop="type" label="臭臭类型">
            <template #default="scope">
              <el-tag :type="scope.row.type === 'stool' ? 'warning' : 'info'">
                {{ scope.row.type === 'stool' ? '大便' : '小便' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" v-if="showStatusColumn">
            <template #default="scope">
              <el-tag :type="getStatusTagType(scope.row.status)">
                {{ getStatusText(scope.row.status) }}
              </el-tag>
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
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="scope">
              <div class="table-actions">
                <el-button size="small" @click="editDiaperRecord(scope.row)">编辑</el-button>
                <el-button size="small" type="danger" @click="deleteDiaperRecord(scope.row.id)">删除</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <div class="diaper-stats" style="margin-top: 20px;">
        <el-card class="stats-card">
          <h3>换尿布统计</h3>
          <div class="stats-grid">
            <div class="stat-item stat-stool">
              <div class="stat-value">{{ stoolCount }}</div>
              <div class="stat-label">大便次数</div>
            </div>
            <div class="stat-item stat-urine">
              <div class="stat-value">{{ urineCount }}</div>
              <div class="stat-label">小便次数</div>
            </div>
            <div class="stat-item stat-total">
              <div class="stat-value">{{ totalCount }}</div>
              <div class="stat-label">总次数</div>
            </div>
          </div>
        </el-card>
      </div>
    </el-card>
    
    <!-- 添加/编辑换尿布记录对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="90%"
      :max-width="'500px'"
    >
      <el-form :model="diaperForm" label-width="80px">
        <el-form-item label="时间">
          <el-time-picker
            v-model="diaperForm.time"
            format="HH:mm"
            value-format="HH:mm"
            placeholder="选择时间"
            style="width: 100%"
            :editable="false"
            clearable
          />
        </el-form-item>
        <el-form-item label="臭臭类型">
          <el-radio-group v-model="diaperForm.type" @change="onTypeChange">
            <el-radio value="stool">大便</el-radio>
            <el-radio value="urine">小便</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态" v-if="diaperForm.type === 'stool'">
          <el-select v-model="diaperForm.status" placeholder="选择状态">
            <el-option label="正常" value="normal" />
            <el-option label="稀便" value="loose" />
            <el-option label="便秘" value="constipated" />
            <el-option label="异常" value="abnormal" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="diaperForm.notes"
            type="textarea"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveDiaperRecord">保存</el-button>
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
      <p>确定要删除这条换尿布记录吗？此操作不可撤销。</p>
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
  name: 'Diaper',
  components: {
    Plus
  },
  setup() {
    const recorderStore = useRecorderStore()
    const selectedDate = ref(new Date().toISOString().split('T')[0])
    const diaperRecords = ref([])
    const dialogVisible = ref(false)
    const deleteDialogVisible = ref(false)
    const dialogTitle = ref('添加换尿布记录')
    const currentDeleteId = ref('')
    const diaperForm = ref({
      id: '',
      time: '',
      type: 'stool',
      status: 'normal',
      notes: '',
      recorder: recorderStore.currentRecorder.id
    })
    
    onMounted(() => {
      document.title = '换尿布记录'
    })
    
    const loadDiaperData = () => {
      // 从LocalStorage加载数据
      const data = localStorage.getItem(`diaper_${selectedDate.value}`)
      if (data) {
        diaperRecords.value = JSON.parse(data)
      } else {
        diaperRecords.value = []
      }
    }
    
    const saveDiaperData = () => {
      localStorage.setItem(`diaper_${selectedDate.value}`, JSON.stringify(diaperRecords.value))
    }
    
    const openAddDiaperDialog = () => {
      dialogTitle.value = '添加换尿布记录'
      diaperForm.value = {
        id: '',
        time: '',
        type: 'stool',
        status: 'normal',
        notes: '',
        recorder: recorderStore.currentRecorder.id
      }
      dialogVisible.value = true
    }
    
    const editDiaperRecord = (record) => {
      dialogTitle.value = '编辑换尿布记录'
      diaperForm.value = { ...record }
      dialogVisible.value = true
    }
    
    const deleteDiaperRecord = (id) => {
      currentDeleteId.value = id
      deleteDialogVisible.value = true
    }
    
    const confirmDelete = () => {
      diaperRecords.value = diaperRecords.value.filter(record => record.id !== currentDeleteId.value)
      saveDiaperData()
      deleteDialogVisible.value = false
    }
    
    const saveDiaperRecord = () => {
      // 验证时间是否为空
      if (!diaperForm.value.time) {
        ElMessage.warning('请选择时间')
        return
      }
      
      // 自动使用当前选中的记录人员
      diaperForm.value.recorder = recorderStore.currentRecorder.id
      
      if (diaperForm.value.id) {
        // 编辑现有记录
        const index = diaperRecords.value.findIndex(record => record.id === diaperForm.value.id)
        if (index !== -1) {
          diaperRecords.value[index] = { ...diaperForm.value }
        }
      } else {
        // 添加新记录
        const newRecord = {
          ...diaperForm.value,
          id: Date.now().toString()
        }
        diaperRecords.value.push(newRecord)
      }
      saveDiaperData()
      dialogVisible.value = false
    }
    
    const onTypeChange = () => {
      if (diaperForm.value.type === 'stool') {
        diaperForm.value.status = 'normal'
      }
    }
    
    const getStatusTagType = (status) => {
      switch (status) {
        case 'normal': return 'success'
        case 'loose': return 'warning'
        case 'constipated': return 'danger'
        case 'abnormal': return 'info'
        default: return ''
      }
    }
    
    const getStatusText = (status) => {
      switch (status) {
        case 'normal': return '正常'
        case 'loose': return '稀便'
        case 'constipated': return '便秘'
        case 'abnormal': return '异常'
        default: return ''
      }
    }
    
    const showStatusColumn = computed(() => {
      return diaperRecords.value.some(record => record.type === 'stool')
    })
    
    const stoolCount = computed(() => {
      return diaperRecords.value.filter(record => record.type === 'stool').length
    })
    
    const urineCount = computed(() => {
      return diaperRecords.value.filter(record => record.type === 'urine').length
    })
    
    const totalCount = computed(() => {
      return diaperRecords.value.length
    })
    
    const sortedDiaperRecords = computed(() => {
      return [...diaperRecords.value].sort((a, b) => {
        const timeA = a.time.split(':').map(Number)
        const timeB = b.time.split(':').map(Number)
        const minutesA = timeA[0] * 60 + timeA[1]
        const minutesB = timeB[0] * 60 + timeB[1]
        return minutesA - minutesB
      })
    })
    
    const getRecorderInfo = (recorderId) => {
      return recorderStore.getRecorderById(recorderId)
    }
    
    onMounted(() => {
      loadDiaperData()
    })
    
    return {
      selectedDate,
      diaperRecords,
      sortedDiaperRecords,
      dialogVisible,
      deleteDialogVisible,
      dialogTitle,
      diaperForm,
      loadDiaperData,
      openAddDiaperDialog,
      editDiaperRecord,
      deleteDiaperRecord,
      confirmDelete,
      saveDiaperRecord,
      onTypeChange,
      getStatusTagType,
      getStatusText,
      showStatusColumn,
      stoolCount,
      urineCount,
      totalCount,
      getRecorderInfo
    }
  }
}
</script>

<style lang="scss" scoped>
.diaper {
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
    background: linear-gradient(135deg, #f72585 0%, #f8961e 100%);
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

.diaper-stats {
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

.stat-stool {
  background: linear-gradient(135deg, rgba(247, 37, 133, 0.15), rgba(247, 37, 133, 0.25));
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  box-shadow: 0 6px 20px rgba(247, 37, 133, 0.2);
  
  .stat-value {
    color: #f72585;
  }
}

.stat-urine {
  background: linear-gradient(135deg, rgba(248, 150, 30, 0.15), rgba(248, 150, 30, 0.25));
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  box-shadow: 0 6px 20px rgba(248, 150, 30, 0.2);
  
  .stat-value {
    color: #f8961e;
  }
}

.stat-total {
  background: linear-gradient(135deg, rgba(72, 187, 120, 0.15), rgba(72, 187, 120, 0.25));
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  box-shadow: 0 6px 20px rgba(72, 187, 120, 0.2);
  
  .stat-value {
    color: #48bb78;
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
    background: linear-gradient(135deg, #f72585 0%, #f8961e 100%);
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
    padding: 24px;
  }
  
  .el-form-item {
    margin-bottom: 16px;
  }
  
  .el-radio-group {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    
    .el-radio {
      margin-right: 0;
    }
  }
  
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}

@media (max-width: 768px) {
  .diaper {
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
    
    .el-form-item {
      margin-bottom: 12px;
      
      .el-form-item__label {
        font-size: 13px;
      }
    }
    
    .el-radio-group {
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
  .diaper {
    padding: 20px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>