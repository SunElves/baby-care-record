<template>
  <div class="data-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>数据管理</span>
        </div>
      </template>
      
      <div class="data-actions">
        <el-card class="action-card">
          <h3>导出数据</h3>
          <p>将所有记录导出为JSON文件</p>
          <el-button type="primary" @click="handleExport">
            <el-icon><Download /></el-icon>
            导出数据
          </el-button>
        </el-card>
        
        <el-card class="action-card">
          <h3>清空数据</h3>
          <p>清空所有记录数据</p>
          <el-button type="danger" @click="handleClear">
            <el-icon><Delete /></el-icon>
            清空数据
          </el-button>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { exportData } from '../utils/exportData'
import { Download, Delete } from '@element-plus/icons-vue'

export default {
  name: 'DataManagement',
  components: {
    Download,
    Delete
  },
  setup() {
    onMounted(() => {
      document.title = '数据管理'
    })
    
    const handleExport = () => {
      exportData()
    }
    
    const handleClear = () => {
      if (confirm('确定要清空所有数据吗？此操作不可恢复！')) {
        // 清空所有相关数据
        const keysToRemove = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key.startsWith('sleep_') || key.startsWith('feeding_') || 
              key.startsWith('solidFood_') || key.startsWith('diaper_') || 
              key.startsWith('growth_')) {
            keysToRemove.push(key)
          }
        }
        
        keysToRemove.forEach(key => localStorage.removeItem(key))
        alert('数据已清空！')
        window.location.reload()
      }
    }
    
    return {
      handleExport,
      handleClear
    }
  }
}
</script>

<style lang="scss" scoped>
.data-management {
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
  }
  
  .el-card__body {
    padding: 24px;
  }
}

.data-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  margin-top: 24px;
}

.action-card {
  padding: 32px;
  text-align: center;
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  }
  
  h3 {
    margin-bottom: 12px;
    color: #2b2d42;
    font-size: 18px;
    font-weight: 600;
  }
  
  p {
    margin-bottom: 24px;
    color: #4a4e69;
    font-size: 14px;
    line-height: 1.5;
  }
  
  .el-button {
    padding: 10px 24px;
    font-weight: 500;
    
    .el-icon {
      margin-right: 8px;
    }
  }
}

@media (max-width: 768px) {
  .data-management {
    padding: 16px;
    padding-bottom: 80px; /* 为底部导航留出空间 */
  }
  
  .el-card {
    .el-card__header {
      padding: 16px 20px;
    }
    
    .el-card__body {
      padding: 20px;
    }
  }
  
  .data-actions {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .action-card {
    padding: 24px;
  }
  
  h3 {
    font-size: 16px;
  }
  
  p {
    font-size: 13px;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .data-management {
    padding: 20px;
  }
  
  .data-actions {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>