// 导出数据工具函数
export const exportData = () => {
  // 收集所有数据
  const allData = {
    sleep: {},
    feeding: {},
    solidFood: {},
    diaper: {},
    growth: {}
  }
  
  // 遍历LocalStorage收集数据
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key.startsWith('sleep_')) {
      const date = key.replace('sleep_', '')
      allData.sleep[date] = JSON.parse(localStorage.getItem(key))
    } else if (key.startsWith('feeding_')) {
      const date = key.replace('feeding_', '')
      allData.feeding[date] = JSON.parse(localStorage.getItem(key))
    } else if (key.startsWith('solidFood_')) {
      const date = key.replace('solidFood_', '')
      allData.solidFood[date] = JSON.parse(localStorage.getItem(key))
    } else if (key.startsWith('diaper_')) {
      const date = key.replace('diaper_', '')
      allData.diaper[date] = JSON.parse(localStorage.getItem(key))
    } else if (key.startsWith('growth_')) {
      const date = key.replace('growth_', '')
      allData.growth[date] = JSON.parse(localStorage.getItem(key))
    }
  }
  
  // 创建JSON文件
  const dataStr = JSON.stringify(allData, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  
  // 下载文件
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `feeding_record_${new Date().toISOString().split('T')[0]}.json`
  link.click()
  URL.revokeObjectURL(url)
}

// 导入数据工具函数
export const importData = (jsonData) => {
  try {
    const data = JSON.parse(jsonData)
    
    // 清空现有数据
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
    
    // 导入新数据
    if (data.sleep) {
      Object.keys(data.sleep).forEach(date => {
        localStorage.setItem(`sleep_${date}`, JSON.stringify(data.sleep[date]))
      })
    }
    
    if (data.feeding) {
      Object.keys(data.feeding).forEach(date => {
        localStorage.setItem(`feeding_${date}`, JSON.stringify(data.feeding[date]))
      })
    }
    
    if (data.solidFood) {
      Object.keys(data.solidFood).forEach(date => {
        localStorage.setItem(`solidFood_${date}`, JSON.stringify(data.solidFood[date]))
      })
    }
    
    if (data.diaper) {
      Object.keys(data.diaper).forEach(date => {
        localStorage.setItem(`diaper_${date}`, JSON.stringify(data.diaper[date]))
      })
    }
    
    if (data.growth) {
      Object.keys(data.growth).forEach(date => {
        localStorage.setItem(`growth_${date}`, JSON.stringify(data.growth[date]))
      })
    }
    
    return true
  } catch (error) {
    console.error('导入数据失败:', error)
    return false
  }
}