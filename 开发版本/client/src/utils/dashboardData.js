// 数据看板数据计算工具

/**
 * 从 localStorage 读取所有记录数据
 * @param {string} type - 记录类型 (sleep, feeding, solidFood, diaper, growth)
 * @returns {Object} 按日期分组的数据对象
 */
export const loadAllRecords = (type) => {
  const records = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key.startsWith(`${type}_`)) {
      const date = key.replace(`${type}_`, '')
      const data = localStorage.getItem(key)
      if (data) {
        records[date] = JSON.parse(data)
      }
    }
  }
  return records
}

/**
 * 获取指定日期范围内的所有记录
 * @param {string} type - 记录类型
 * @param {string} startDate - 开始日期 (YYYY-MM-DD)
 * @param {string} endDate - 结束日期 (YYYY-MM-DD)
 * @returns {Array} 记录数组，包含日期信息
 */
export const getRecordsByDateRange = (type, startDate, endDate) => {
  const allRecords = loadAllRecords(type)
  const result = []
  
  Object.keys(allRecords).forEach(date => {
    if (date >= startDate && date <= endDate) {
      allRecords[date].forEach(record => {
        result.push({ ...record, date })
      })
    }
  })
  
  return result
}

/**
 * 计算今日睡眠统计
 * @param {string} date - 日期 (YYYY-MM-DD)
 * @returns {Object} 睡眠统计数据
 */
export const calculateSleepStats = (date) => {
  const data = localStorage.getItem(`sleep_${date}`)
  const records = data ? JSON.parse(data) : []
  
  let totalDuration = 0
  const qualityCount = { excellent: 0, good: 0, fair: 0, poor: 0 }
  
  records.forEach(record => {
    if (record.startTime && record.endTime) {
      const start = record.startTime.split(':').map(Number)
      const end = record.endTime.split(':').map(Number)
      let duration = (end[0] * 60 + end[1]) - (start[0] * 60 + start[1])
      if (duration < 0) duration += 24 * 60 // 跨天情况
      totalDuration += duration
    }
    
    if (record.quality) {
      qualityCount[record.quality]++
    }
  })
  
  return {
    totalDuration,
    count: records.length,
    averageDuration: records.length > 0 ? Math.round(totalDuration / records.length) : 0,
    qualityCount
  }
}

/**
 * 计算今日喂奶统计
 * @param {string} date - 日期 (YYYY-MM-DD)
 * @returns {Object} 喂奶统计数据
 */
export const calculateFeedingStats = (date) => {
  const data = localStorage.getItem(`feeding_${date}`)
  const records = data ? JSON.parse(data) : []
  
  let totalAmount = 0
  const typeCount = { formula: 0, breast: 0 }
  
  records.forEach(record => {
    if (record.type === 'formula' && record.amount) {
      totalAmount += parseInt(record.amount) || 0
    }
    if (record.type) {
      typeCount[record.type]++
    }
  })
  
  return {
    totalAmount,
    count: records.length,
    typeCount,
    formulaCount: typeCount.formula,
    breastCount: typeCount.breast
  }
}

/**
 * 计算今日尿布统计
 * @param {string} date - 日期 (YYYY-MM-DD)
 * @returns {Object} 尿布统计数据
 */
export const calculateDiaperStats = (date) => {
  const data = localStorage.getItem(`diaper_${date}`)
  const records = data ? JSON.parse(data) : []
  
  const typeCount = { stool: 0, urine: 0 }
  
  records.forEach(record => {
    if (record.type) {
      typeCount[record.type]++
    }
  })
  
  return {
    totalCount: records.length,
    typeCount,
    stoolCount: typeCount.stool,
    urineCount: typeCount.urine
  }
}

/**
 * 计算今日辅食统计
 * @param {string} date - 日期 (YYYY-MM-DD)
 * @returns {Object} 辅食统计数据
 */
export const calculateSolidFoodStats = (date) => {
  const data = localStorage.getItem(`solidFood_${date}`)
  const records = data ? JSON.parse(data) : []
  
  const typeCount = { '纯米糊': 0, '米糊加辅料': 0, '水果': 0 }
  const auxiliaryTypes = {}
  const fruitTypes = {}
  
  records.forEach(record => {
    if (record.type) {
      typeCount[record.type]++
    }
    
    // 统计辅料类型
    if (record.type === '米糊加辅料') {
      const auxType = record.auxiliaryType === '其他' ? record.otherAuxiliaryType : record.auxiliaryType
      if (auxType && auxType !== '无') {
        auxiliaryTypes[auxType] = (auxiliaryTypes[auxType] || 0) + 1
      }
    }
    
    // 统计水果种类
    if (record.type === '水果' && record.fruitType) {
      fruitTypes[record.fruitType] = (fruitTypes[record.fruitType] || 0) + 1
    }
  })
  
  return {
    count: records.length,
    typeCount,
    auxiliaryTypes,
    fruitTypes
  }
}

/**
 * 获取近N天的睡眠趋势数据
 * @param {number} days - 天数
 * @returns {Array} 睡眠趋势数据数组
 */
export const getSleepTrend = (days = 7) => {
  const trend = []
  const today = new Date()
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    const stats = calculateSleepStats(dateStr)
    
    trend.push({
      date: dateStr,
      label: `${date.getMonth() + 1}/${date.getDate()}`,
      duration: stats.totalDuration,
      count: stats.count
    })
  }
  
  return trend
}

/**
 * 获取成长趋势数据
 * @param {number} days - 天数
 * @returns {Array} 成长趋势数据数组
 */
export const getGrowthTrend = (days = 30) => {
  const allRecords = loadAllRecords('growth')
  const trend = []
  const today = new Date()
  
  // 收集日期范围内的数据
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    
    if (allRecords[dateStr] && allRecords[dateStr].length > 0) {
      // 取该日期的最后一条记录
      const lastRecord = allRecords[dateStr][allRecords[dateStr].length - 1]
      if (lastRecord.height || lastRecord.weight) {
        trend.push({
          date: dateStr,
          label: `${date.getMonth() + 1}/${date.getDate()}`,
          height: lastRecord.height ? parseFloat(lastRecord.height) : null,
          weight: lastRecord.weight ? parseFloat(lastRecord.weight) : null
        })
      }
    }
  }
  
  return trend
}

/**
 * 格式化时长显示
 * @param {number} minutes - 分钟数
 * @returns {string} 格式化后的时长字符串
 */
export const formatDuration = (minutes) => {
  if (!minutes || minutes === 0) return '0 分钟'
  
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

/**
 * 获取睡眠质量分布数据（用于饼图）
 * @param {string} date - 日期 (YYYY-MM-DD)
 * @returns {Array} 饼图数据数组
 */
export const getSleepQualityDistribution = (date) => {
  const stats = calculateSleepStats(date)
  const { qualityCount } = stats
  
  return [
    { name: '优秀', value: qualityCount.excellent, color: '#10b981' },
    { name: '良好', value: qualityCount.good, color: '#3b82f6' },
    { name: '一般', value: qualityCount.fair, color: '#f59e0b' },
    { name: '较差', value: qualityCount.poor, color: '#ef4444' }
  ].filter(item => item.value > 0)
}

/**
 * 获取喂奶类型分布数据（用于饼图）
 * @param {string} date - 日期 (YYYY-MM-DD)
 * @returns {Array} 饼图数据数组
 */
export const getFeedingTypeDistribution = (date) => {
  const stats = calculateFeedingStats(date)
  const { typeCount } = stats
  
  return [
    { name: '奶粉', value: typeCount.formula, color: '#4cc9f0' },
    { name: '母乳', value: typeCount.breast, color: '#30d364' }
  ].filter(item => item.value > 0)
}

/**
 * 获取辅食类型分布数据（用于饼图）
 * @param {string} date - 日期 (YYYY-MM-DD)
 * @returns {Array} 饼图数据数组
 */
export const getSolidFoodTypeDistribution = (date) => {
  const stats = calculateSolidFoodStats(date)
  const { typeCount } = stats
  
  return [
    { name: '纯米糊', value: typeCount['纯米糊'], color: '#f8961e' },
    { name: '米糊加辅料', value: typeCount['米糊加辅料'], color: '#f72585' },
    { name: '水果', value: typeCount['水果'], color: '#48bb78' }
  ].filter(item => item.value > 0)
}

/**
 * 获取尿布类型分布数据（用于饼图）
 * @param {string} date - 日期 (YYYY-MM-DD)
 * @returns {Array} 饼图数据数组
 */
export const getDiaperTypeDistribution = (date) => {
  const stats = calculateDiaperStats(date)
  const { typeCount } = stats
  
  return [
    { name: '大便', value: typeCount.stool, color: '#f72585' },
    { name: '小便', value: typeCount.urine, color: '#f8961e' }
  ].filter(item => item.value > 0)
}

/**
 * 获取今日概览数据
 * @param {string} date - 日期 (YYYY-MM-DD)
 * @returns {Object} 今日概览数据
 */
export const getTodayOverview = (date) => {
  const sleepStats = calculateSleepStats(date)
  const feedingStats = calculateFeedingStats(date)
  const diaperStats = calculateDiaperStats(date)
  const solidFoodStats = calculateSolidFoodStats(date)
  
  return {
    sleep: {
      totalDuration: sleepStats.totalDuration,
      totalDurationFormatted: formatDuration(sleepStats.totalDuration),
      count: sleepStats.count
    },
    feeding: {
      totalAmount: feedingStats.totalAmount,
      count: feedingStats.count,
      formulaCount: feedingStats.formulaCount,
      breastCount: feedingStats.breastCount
    },
    diaper: {
      totalCount: diaperStats.totalCount,
      stoolCount: diaperStats.stoolCount,
      urineCount: diaperStats.urineCount
    },
    solidFood: {
      count: solidFoodStats.count
    }
  }
}
