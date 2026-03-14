<template>
  <div class="growth">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>成长记录</span>
          <el-date-picker
            v-model="selectedDate"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="loadGrowthData"
          />
        </div>
      </template>
      
      <div style="display: flex; justify-content: flex-end; margin-bottom: 20px;">
        <el-button type="primary" @click="openAddGrowthDialog">
          <el-icon><Plus /></el-icon>
          添加成长记录
        </el-button>
      </div>
      
      <div class="table-container">
        <el-table :data="growthRecords" style="width: 100%">
          <el-table-column label="序号"  align="center">
            <template #default="scope">
              {{ scope.$index + 1 }}
            </template>
          </el-table-column>
          <el-table-column prop="time" label="时间" />
          <el-table-column prop="height" label="身高 (cm)" />
          <el-table-column prop="weight" label="体重 (kg)" />
          <el-table-column prop="notes" label="备注" />
          <el-table-column label="记录人" width="100" align="center">
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
                <el-button size="small" @click="editGrowthRecord(scope.row)">编辑</el-button>
                <el-button size="small" type="danger" @click="deleteGrowthRecord(scope.row.id)">删除</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
    
    <!-- 添加/编辑成长记录对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="90%"
      :max-width="'500px'"
    >
      <el-form :model="growthForm" label-width="100px">
        <el-form-item label="时间">
          <el-time-picker
            v-model="growthForm.time"
            format="HH:mm"
            value-format="HH:mm"
            placeholder="选择时间"
            style="width: 100%"
            :editable="false"
            clearable
          />
        </el-form-item>
        <el-form-item label="身高 (cm)">
          <el-input
            v-model="growthForm.height"
            type="number"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="体重 (kg)">
          <el-input
            v-model="growthForm.weight"
            type="number"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="growthForm.notes"
            type="textarea"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveGrowthRecord">保存</el-button>
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
      <p>确定要删除这条成长记录吗？此操作不可撤销。</p>
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
import { ref, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRecorderStore } from '../stores/recorder'

export default {
  name: 'Growth',
  components: {
    Plus
  },
  setup() {
    const recorderStore = useRecorderStore()
    const selectedDate = ref(new Date().toISOString().split('T')[0])
    const growthRecords = ref([])
    const dialogVisible = ref(false)
    const deleteDialogVisible = ref(false)
    const dialogTitle = ref('添加成长记录')
    const currentDeleteId = ref('')
    const growthForm = ref({
      id: '',
      time: '',
      height: null,
      weight: null,
      notes: '',
      recorder: recorderStore.currentRecorder.id
    })
    
    onMounted(() => {
      document.title = '成长记录'
    })
    
    const loadGrowthData = () => {
      // 从LocalStorage加载数据
      const data = localStorage.getItem(`growth_${selectedDate.value}`)
      if (data) {
        growthRecords.value = JSON.parse(data)
      } else {
        growthRecords.value = []
      }
    }
    
    const saveGrowthData = () => {
      localStorage.setItem(`growth_${selectedDate.value}`, JSON.stringify(growthRecords.value))
    }
    
    const openAddGrowthDialog = () => {
      dialogTitle.value = '添加成长记录'
      growthForm.value = {
        id: '',
        time: '',
        height: null,
        weight: null,
        notes: '',
        recorder: recorderStore.currentRecorder.id
      }
      dialogVisible.value = true
    }
    
    const editGrowthRecord = (record) => {
      dialogTitle.value = '编辑成长记录'
      growthForm.value = { ...record }
      dialogVisible.value = true
    }
    
    const deleteGrowthRecord = (id) => {
      currentDeleteId.value = id
      deleteDialogVisible.value = true
    }
    
    const confirmDelete = () => {
      growthRecords.value = growthRecords.value.filter(record => record.id !== currentDeleteId.value)
      saveGrowthData()
      deleteDialogVisible.value = false
      ElMessage.success('删除成功！')
    }
    
    const saveGrowthRecord = () => {
      // 验证时间是否为空
      if (!growthForm.value.time) {
        ElMessage.warning('请选择时间')
        return
      }
      
      // 自动使用当前选中的记录人员
      growthForm.value.recorder = recorderStore.currentRecorder.id
      
      if (growthForm.value.id) {
        // 编辑现有记录
        const index = growthRecords.value.findIndex(record => record.id === growthForm.value.id)
        if (index !== -1) {
          growthRecords.value[index] = { ...growthForm.value }
        }
      } else {
        // 添加新记录
        const newRecord = {
          ...growthForm.value,
          id: Date.now().toString()
        }
        growthRecords.value.push(newRecord)
      }
      saveGrowthData()
      dialogVisible.value = false
      ElMessage.success('保存成功！')
    }
    
    const getRecorderInfo = (recorderId) => {
      return recorderStore.getRecorderById(recorderId)
    }
    
    onMounted(() => {
      loadGrowthData()
    })
    
    return {
      selectedDate,
      growthRecords,
      dialogVisible,
      deleteDialogVisible,
      dialogTitle,
      growthForm,
      loadGrowthData,
      openAddGrowthDialog,
      editGrowthRecord,
      deleteGrowthRecord,
      confirmDelete,
      saveGrowthRecord,
      getRecorderInfo
    }
  }
}
</script>

<style lang="scss" scoped>
.growth {
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
  
  .el-card__body {
    padding: 24px;
  }
}

.el-form {
  margin-bottom: 0;
  
  .el-form-item {
    margin-bottom: 16px;
    
    .el-form-item__label {
      font-weight: 500;
      color: #4a4e69;
    }
  }
}

.el-input-number {
  width: 100%;
  margin-bottom: 16px;
}

.el-input {
  margin-bottom: 16px;
  
  textarea {
    min-height: 100px;
  }
}

.el-button {
  margin-top: 8px;
  padding: 10px 24px;
  font-weight: 500;
  
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
  
  .el-table__header-wrapper {
    .el-table__header {
      .el-table__row {
        .el-table__cell {
          background-color: rgba(248, 245, 240, 0.7);
          font-weight: 600;
          color: #333333;
          padding: 10px 12px;
        }
      }
    }
  }
  
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

@media (max-width: 768px) {
  .growth {
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
    
    .el-card__body {
      padding: 20px;
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
  
  .el-form {
    .el-form-item {
      .el-form-item__label {
        font-size: 14px;
      }
    }
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
  .growth {
    padding: 20px;
  }
}
</style>