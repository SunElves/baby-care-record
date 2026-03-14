<template>
  <div class="solid-food">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>辅食记录</span>
          <el-date-picker
            v-model="selectedDate"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="loadSolidFoodData"
          />
        </div>
      </template>
      
      <div style="display: flex; justify-content: flex-end;">
        <el-button type="primary" @click="openAddSolidFoodDialog">
          <el-icon><Plus /></el-icon>
          添加辅食记录
        </el-button>
      </div>
      
      <div class="table-container">
        <el-table :data="sortedSolidFoodRecords" style="width: 100%">
        <el-table-column label="顺序" align="center">
          <template #default="scope">
            第{{ scope.$index + 1 }}餐
          </template>
        </el-table-column>
        <el-table-column prop="time" label="时间" />
        <el-table-column prop="type" label="种类" />
        <el-table-column label="辅料类型" width="120">
          <template #default="scope">
            {{ scope.row.type === '米糊加辅料' ? (scope.row.auxiliaryType === '其他' ? scope.row.otherAuxiliaryType : scope.row.auxiliaryType || '-') : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="水果种类" width="120">
          <template #default="scope">
            {{ scope.row.type === '水果' ? scope.row.fruitType || '-' : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="加水量 (ml)" />
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
              <el-button size="small" @click="editSolidFoodRecord(scope.row)">编辑</el-button>
              <el-button size="small" type="danger" @click="deleteSolidFoodRecord(scope.row.id)">删除</el-button>
            </div>
          </template>
        </el-table-column>
        </el-table>
      </div>
      
      <div class="solid-food-stats" style="margin-top: 20px;">
        <el-card class="stats-card">
          <h3>辅食统计</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">{{ solidFoodRecords.length }}</div>
              <div class="stat-label">喂食次数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ uniqueTypes.length }}</div>
              <div class="stat-label">食物种类</div>
            </div>
            <div class="stat-item stat-tags">
              <div class="tags-container">
                <el-tag v-for="tag in allFoodTypes" :key="tag" size="small" class="food-tag">
                  {{ tag }}
                </el-tag>
              </div>
              <div class="stat-label">辅食与水果种类</div>
            </div>
          </div>
        </el-card>
      </div>
    </el-card>
    
    <!-- 添加/编辑辅食记录对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="90%"
      :max-width="'500px'"
    >
      <el-form :model="solidFoodForm" label-width="80px">
        <el-form-item label="时间">
          <el-time-picker
            v-model="solidFoodForm.time"
            format="HH:mm"
            value-format="HH:mm"
            placeholder="选择时间"
            style="width: 100%"
            :editable="false"
            clearable
          />
        </el-form-item>
        <el-form-item label="种类">
          <el-select
            v-model="solidFoodForm.type"
            placeholder="请选择辅食种类"
            style="width: 100%"
          >
            <el-option label="纯米糊" value="纯米糊" />
            <el-option label="米糊加辅料" value="米糊加辅料" />
            <el-option label="水果" value="水果" />
          </el-select>
        </el-form-item>
        <el-form-item label="辅料类型" v-if="solidFoodForm.type === '米糊加辅料'">
          <el-select
            v-model="solidFoodForm.auxiliaryType"
            placeholder="请选择辅料类型"
            style="width: 100%"
            @change="onAuxiliaryTypeChange"
          >
            <el-option label="无" value="无" />
            <el-option label="牛肉" value="牛肉" />
            <el-option label="猪肉" value="猪肉" />
            <el-option label="菠菜" value="菠菜" />
            <el-option label="南瓜" value="南瓜" />
            <el-option label="其他" value="其他" />
          </el-select>
          <el-input
            v-if="solidFoodForm.auxiliaryType === '其他'"
            v-model="solidFoodForm.otherAuxiliaryType"
            placeholder="请输入其他辅料类型"
            style="width: 100%; margin-top: 12px"
          />
        </el-form-item>
        <el-form-item label="水果种类" v-if="solidFoodForm.type === '水果'">
          <el-input
            v-model="solidFoodForm.fruitType"
            placeholder="请输入水果种类"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="加水量 (ml)">
          <el-input
            type="number"
            v-model="solidFoodForm.amount"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="solidFoodForm.notes"
            type="textarea"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveSolidFoodRecord">保存</el-button>
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
  name: 'SolidFood',
  components: {
    Plus
  },
  setup() {
    const recorderStore = useRecorderStore()
    const selectedDate = ref(new Date().toISOString().split('T')[0])
    const solidFoodRecords = ref([])
    const dialogVisible = ref(false)
    const dialogTitle = ref('添加辅食记录')
    const solidFoodForm = ref({
      id: '',
      time: '',
      type: '',
      auxiliaryType: '无',
      otherAuxiliaryType: '',
      fruitType: '',
      amount: 0,
      notes: '',
      recorder: recorderStore.currentRecorder.id
    })
    
    onMounted(() => {
      document.title = '辅食记录'
    })
    
    const loadSolidFoodData = () => {
      // 从LocalStorage加载数据
      const data = localStorage.getItem(`solidFood_${selectedDate.value}`)
      if (data) {
        solidFoodRecords.value = JSON.parse(data)
      } else {
        solidFoodRecords.value = []
      }
    }
    
    const saveSolidFoodData = () => {
      localStorage.setItem(`solidFood_${selectedDate.value}`, JSON.stringify(solidFoodRecords.value))
    }
    
    const openAddSolidFoodDialog = () => {
      dialogTitle.value = '添加辅食记录'
      solidFoodForm.value = {
        id: '',
        time: '',
        type: '',
        auxiliaryType: '无',
        otherAuxiliaryType: '',
        fruitType: '',
        amount: 0,
        notes: '',
        recorder: recorderStore.currentRecorder.id
      }
      dialogVisible.value = true
    }
    
    const editSolidFoodRecord = (record) => {
      dialogTitle.value = '编辑辅食记录'
      solidFoodForm.value = { ...record }
      dialogVisible.value = true
    }
    
    const deleteSolidFoodRecord = (id) => {
      solidFoodRecords.value = solidFoodRecords.value.filter(record => record.id !== id)
      saveSolidFoodData()
    }
    
    const onAuxiliaryTypeChange = () => {
      if (solidFoodForm.value.auxiliaryType !== '其他') {
        solidFoodForm.value.otherAuxiliaryType = ''
      }
    }
    
    const saveSolidFoodRecord = () => {
      // 验证时间
      if (!solidFoodForm.value.time) {
        ElMessage.warning('请选择时间')
        return
      }
      
      // 验证加水量（米糊和米糊加辅料必须填写）
      if ((solidFoodForm.value.type === '纯米糊' || solidFoodForm.value.type === '米糊加辅料') && (!solidFoodForm.value.amount || solidFoodForm.value.amount <= 0)) {
        ElMessage.warning('请填写加水量')
        return
      }
      
      // 自动使用当前选中的记录人员
      solidFoodForm.value.recorder = recorderStore.currentRecorder.id
      
      if (solidFoodForm.value.id) {
        // 编辑现有记录
        const index = solidFoodRecords.value.findIndex(record => record.id === solidFoodForm.value.id)
        if (index !== -1) {
          solidFoodRecords.value[index] = { ...solidFoodForm.value }
        }
      } else {
        // 添加新记录
        const newRecord = {
          ...solidFoodForm.value,
          id: Date.now().toString()
        }
        solidFoodRecords.value.push(newRecord)
      }
      saveSolidFoodData()
      dialogVisible.value = false
    }
    
    const totalAmount = computed(() => {
      return solidFoodRecords.value.reduce((total, record) => {
        return total + (record.amount || 0)
      }, 0)
    })
    
    const uniqueTypes = computed(() => {
      const types = solidFoodRecords.value.map(record => record.type)
      return [...new Set(types)].filter(Boolean)
    })
    
    const sortedSolidFoodRecords = computed(() => {
      return [...solidFoodRecords.value].sort((a, b) => {
        const timeA = a.time.split(':').map(Number)
        const timeB = b.time.split(':').map(Number)
        const minutesA = timeA[0] * 60 + timeA[1]
        const minutesB = timeB[0] * 60 + timeB[1]
        return minutesA - minutesB
      })
    })
    
    const allFoodTypes = computed(() => {
      const types = new Set()
      
      solidFoodRecords.value.forEach(record => {
        // 添加辅料类型
        if (record.type === '米糊加辅料') {
          if (record.auxiliaryType === '其他' && record.otherAuxiliaryType) {
            types.add(record.otherAuxiliaryType)
          } else if (record.auxiliaryType && record.auxiliaryType !== '无') {
            types.add(record.auxiliaryType)
          }
        }
        // 添加水果种类
        if (record.type === '水果' && record.fruitType) {
          types.add(record.fruitType)
        }
      })
      
      return Array.from(types)
    })
    
    const getRecorderInfo = (recorderId) => {
      return recorderStore.getRecorderById(recorderId)
    }
    
    onMounted(() => {
      loadSolidFoodData()
    })
    
    return {
      selectedDate,
      solidFoodRecords,
      sortedSolidFoodRecords,
      dialogVisible,
      dialogTitle,
      solidFoodForm,
      loadSolidFoodData,
      openAddSolidFoodDialog,
      editSolidFoodRecord,
      deleteSolidFoodRecord,
      onAuxiliaryTypeChange,
      saveSolidFoodRecord,
      totalAmount,
      uniqueTypes,
      allFoodTypes,
      getRecorderInfo
    }
  }
}
</script>

<style lang="scss" scoped>
.solid-food {
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
    background: linear-gradient(135deg, #f8961e 0%, #f72585 100%);
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
  align-items: center;
  justify-content: center;
  
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

.solid-food-stats {
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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  }
}

.stat-item:nth-child(1) {
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(236, 72, 153, 0.25));
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  box-shadow: 0 6px 20px rgba(236, 72, 153, 0.2);
  
  .stat-value {
    color: #ec4899;
  }
}

.stat-item:nth-child(2) {
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.15), rgba(124, 58, 237, 0.25));
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  box-shadow: 0 6px 20px rgba(124, 58, 237, 0.2);
  
  .stat-value {
    color: #7c3aed;
  }
}

.stat-item:nth-child(3) {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(249, 115, 22, 0.25));
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  box-shadow: 0 6px 20px rgba(249, 115, 22, 0.2);
  
  .stat-label {
    color: #f97316;
  }
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #f8961e;
  margin-bottom: 8px;
}

.stat-label {
  color: #4a4e69;
  font-size: 14px;
  font-weight: 500;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 10px;
}

// .stat-tags {
//   padding: 16px;
// }

.tags-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-bottom: 8px;
}

.food-tag {
  margin-bottom: 4px;
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

.el-dialog {
  .el-dialog__header {
    background: linear-gradient(135deg, #f8961e 0%, #f72585 100%);
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
  
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}

@media (max-width: 768px) {
  .solid-food {
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
  .solid-food {
    padding: 20px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>