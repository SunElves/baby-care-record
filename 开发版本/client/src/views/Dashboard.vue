<template>
  <div class="dashboard">
    <el-card class="header-card">
      <div class="card-header">
        <span class="title">数据看板</span>
        <div class="header-actions">
          <el-date-picker
            v-model="selectedDate"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="refreshData"
            class="date-picker"
          />
          <el-button @click="refreshData" :icon="Refresh" circle />
        </div>
      </div>
    </el-card>

    <!-- 今日概览 -->
    <div class="overview-section">
      <h2 class="section-title">今日概览</h2>
      <div class="overview-grid">
        <div class="overview-card sleep-card">
          <div class="card-icon">😴</div>
          <div class="card-content">
            <div class="card-value">{{ overview.sleep.totalDurationFormatted }}</div>
            <div class="card-label">睡眠总时长</div>
            <div class="card-sub">{{ overview.sleep.count }} 次睡眠</div>
          </div>
        </div>

        <div class="overview-card feeding-card">
          <div class="card-icon">🍼</div>
          <div class="card-content">
            <div class="card-value">{{ overview.feeding.totalAmount }} ml</div>
            <div class="card-label">喂奶总量</div>
            <div class="card-sub">奶粉 {{ overview.feeding.formulaCount }} 次 / 母乳 {{ overview.feeding.breastCount }} 次</div>
          </div>
        </div>

        <div class="overview-card diaper-card">
          <div class="card-icon">👶</div>
          <div class="card-content">
            <div class="card-value">{{ overview.diaper.totalCount }} 次</div>
            <div class="card-label">换尿布</div>
            <div class="card-sub">大便 {{ overview.diaper.stoolCount }} 次 / 小便 {{ overview.diaper.urineCount }} 次</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <!-- 睡眠趋势图 -->
      <div class="chart-card">
        <h3 class="chart-title">睡眠趋势（近7天）</h3>
        <div class="chart-container">
          <v-chart :option="sleepTrendOption" autoresize />
        </div>
      </div>

      <!-- 睡眠质量分布 -->
      <div class="chart-card">
        <h3 class="chart-title">睡眠质量分布</h3>
        <div class="chart-container">
          <v-chart v-if="sleepQualityData.length > 0" :option="sleepQualityOption" autoresize />
          <div v-else class="no-data">暂无数据</div>
        </div>
      </div>

      <!-- 喂奶类型分布 -->
      <div class="chart-card">
        <h3 class="chart-title">喂奶类型分布</h3>
        <div class="chart-container">
          <v-chart v-if="feedingTypeData.length > 0" :option="feedingTypeOption" autoresize />
          <div v-else class="no-data">暂无数据</div>
        </div>
      </div>

      <!-- 辅食类型分布 -->
      <div class="chart-card">
        <h3 class="chart-title">辅食类型分布</h3>
        <div class="chart-container">
          <v-chart v-if="solidFoodTypeData.length > 0" :option="solidFoodTypeOption" autoresize />
          <div v-else class="no-data">暂无数据</div>
        </div>
      </div>

      <!-- 成长趋势图 -->
      <div class="chart-card">
        <h3 class="chart-title">成长趋势（近30天）</h3>
        <div class="chart-container">
          <v-chart v-if="growthTrendData.length > 0" :option="growthTrendOption" autoresize />
          <div v-else class="no-data">暂无数据</div>
        </div>
      </div>

      <!-- 尿布类型分布 -->
      <div class="chart-card">
        <h3 class="chart-title">尿布类型分布</h3>
        <div class="chart-container">
          <v-chart v-if="diaperTypeData.length > 0" :option="diaperTypeOption" autoresize />
          <div v-else class="no-data">暂无数据</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import {
  getTodayOverview,
  getSleepTrend,
  getGrowthTrend,
  getSleepQualityDistribution,
  getFeedingTypeDistribution,
  getSolidFoodTypeDistribution,
  getDiaperTypeDistribution
} from '../utils/dashboardData'

use([
  CanvasRenderer,
  LineChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

export default {
  name: 'Dashboard',
  components: {
    VChart
  },
  setup() {
    const selectedDate = ref(new Date().toISOString().split('T')[0])
    const overview = ref({
      sleep: { totalDuration: 0, totalDurationFormatted: '0 分钟', count: 0 },
      feeding: { totalAmount: 0, count: 0, formulaCount: 0, breastCount: 0 },
      diaper: { totalCount: 0, stoolCount: 0, urineCount: 0 },
      solidFood: { count: 0 }
    })

    const sleepTrendData = ref([])
    const growthTrendData = ref([])
    const sleepQualityData = ref([])
    const feedingTypeData = ref([])
    const solidFoodTypeData = ref([])
    const diaperTypeData = ref([])

    // 睡眠趋势图配置
    const sleepTrendOption = computed(() => ({
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: '#e0e0e0',
        borderWidth: 1,
        textStyle: {
          color: '#333'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: sleepTrendData.value.map(item => item.label),
        boundaryGap: false
      },
      yAxis: {
        type: 'value',
        name: '分钟'
      },
      series: [
        {
          name: '睡眠时长',
          type: 'line',
          data: sleepTrendData.value.map(item => item.duration),
          smooth: true,
          lineStyle: {
            color: '#f8961e',
            width: 2
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(248, 150, 30, 0.3)' },
                { offset: 1, color: 'rgba(248, 150, 30, 0.05)' }
              ]
            }
          },
          itemStyle: {
            color: '#f8961e'
          }
        }
      ]
    }))

    // 成长趋势图配置
    const growthTrendOption = computed(() => ({
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: '#e0e0e0',
        borderWidth: 1,
        textStyle: {
          color: '#333'
        }
      },
      legend: {
        data: ['身高', '体重'],
        top: 10
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: growthTrendData.value.map(item => item.label),
        boundaryGap: false
      },
      yAxis: [
        {
          type: 'value',
          name: '身高(cm)',
          position: 'left'
        },
        {
          type: 'value',
          name: '体重(kg)',
          position: 'right'
        }
      ],
      series: [
        {
          name: '身高',
          type: 'line',
          data: growthTrendData.value.map(item => item.height),
          smooth: true,
          lineStyle: {
            color: '#4cc9f0',
            width: 2
          },
          itemStyle: {
            color: '#4cc9f0'
          }
        },
        {
          name: '体重',
          type: 'line',
          yAxisIndex: 1,
          data: growthTrendData.value.map(item => item.weight),
          smooth: true,
          lineStyle: {
            color: '#f72585',
            width: 2
          },
          itemStyle: {
            color: '#f72585'
          }
        }
      ]
    }))

    // 睡眠质量分布图配置
    const sleepQualityOption = computed(() => ({
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: '#e0e0e0',
        borderWidth: 1,
        textStyle: {
          color: '#333'
        }
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        top: 'center'
      },
      series: [
        {
          name: '睡眠质量',
          type: 'pie',
          radius: '50%',
          center: ['60%', '50%'],
          data: sleepQualityData.value.map(item => ({
            value: item.value,
            name: item.name
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          itemStyle: {
            color: (params) => {
              const colors = {
                '优秀': '#52c41a',
                '良好': '#1890ff',
                '一般': '#faad14',
                '较差': '#f5222d'
              }
              return colors[params.name] || '#999'
            }
          }
        }
      ]
    }))

    // 喂奶类型分布图配置
    const feedingTypeOption = computed(() => ({
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: '#e0e0e0',
        borderWidth: 1,
        textStyle: {
          color: '#333'
        }
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        top: 'center'
      },
      series: [
        {
          name: '喂奶类型',
          type: 'pie',
          radius: '50%',
          center: ['60%', '50%'],
          data: feedingTypeData.value.map(item => ({
            value: item.value,
            name: item.name
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          itemStyle: {
            color: (params) => {
              const colors = {
                '母乳': '#ff7875',
                '配方奶': '#69c0ff'
              }
              return colors[params.name] || '#999'
            }
          }
        }
      ]
    }))

    // 辅食类型分布图配置
    const solidFoodTypeOption = computed(() => ({
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: '#e0e0e0',
        borderWidth: 1,
        textStyle: {
          color: '#333'
        }
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        top: 'center'
      },
      series: [
        {
          name: '辅食类型',
          type: 'pie',
          radius: '50%',
          center: ['60%', '50%'],
          data: solidFoodTypeData.value.map(item => ({
            value: item.value,
            name: item.name
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    }))

    // 尿布类型分布图配置
    const diaperTypeOption = computed(() => ({
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: '#e0e0e0',
        borderWidth: 1,
        textStyle: {
          color: '#333'
        }
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        top: 'center'
      },
      series: [
        {
          name: '尿布类型',
          type: 'pie',
          radius: '50%',
          center: ['60%', '50%'],
          data: diaperTypeData.value.map(item => ({
            value: item.value,
            name: item.name
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          itemStyle: {
            color: (params) => {
              const colors = {
                '大便': '#8b4513',
                '小便': '#87ceeb'
              }
              return colors[params.name] || '#999'
            }
          }
        }
      ]
    }))

    const refreshData = () => {
      // 今日概览
      overview.value = getTodayOverview(selectedDate.value)

      // 睡眠趋势
      sleepTrendData.value = getSleepTrend(7)

      // 成长趋势
      growthTrendData.value = getGrowthTrend(30)

      // 睡眠质量分布
      sleepQualityData.value = getSleepQualityDistribution(selectedDate.value)

      // 喂奶类型分布
      feedingTypeData.value = getFeedingTypeDistribution(selectedDate.value)

      // 辅食类型分布
      solidFoodTypeData.value = getSolidFoodTypeDistribution(selectedDate.value)

      // 尿布类型分布
      diaperTypeData.value = getDiaperTypeDistribution(selectedDate.value)
    }

    onMounted(() => {
      document.title = '数据看板'
      refreshData()
    })

    return {
      selectedDate,
      overview,
      sleepTrendData,
      growthTrendData,
      sleepQualityData,
      feedingTypeData,
      solidFoodTypeData,
      diaperTypeData,
      sleepTrendOption,
      growthTrendOption,
      sleepQualityOption,
      feedingTypeOption,
      solidFoodTypeOption,
      diaperTypeOption,
      refreshData,
      Refresh
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  padding: 24px;
  min-height: 100vh;
  background-color: #f8f5f0;
  background-image: linear-gradient(135deg, #f8f5f0 0%, #f5f0e6 100%);
  background-attachment: fixed;
}

.header-card {
  margin-bottom: 24px;
  border: none;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);

  .el-card__body {
    padding: 20px 24px;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .title {
    font-size: 24px;
    font-weight: 600;
    color: #333;
  }

  .header-actions {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    gap: 12px;
    align-items: flex-start;

    :deep(.el-input){
      margin-bottom: 0!important;
    }

    .date-picker {
      width: 200px;
    }
  }
}

.overview-section {
  margin-bottom: 32px;

  .section-title {
    font-size: 20px;
    font-weight: 600;
    color: #333;
    margin-bottom: 16px;
  }
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.overview-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  .card-icon {
    font-size: 48px;
    line-height: 1;
  }

  .card-content {
    flex: 1;

    .card-value {
      font-size: 28px;
      font-weight: 700;
      color: #333;
      margin-bottom: 4px;
    }

    .card-label {
      font-size: 14px;
      color: #666;
      margin-bottom: 4px;
    }

    .card-sub {
      font-size: 12px;
      color: #999;
    }
  }
}

.sleep-card {
  border-left: 4px solid #f8961e;
}

.feeding-card {
  border-left: 4px solid #1890ff;
}

.diaper-card {
  border-left: 4px solid #52c41a;
}

.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

.chart-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);

  .chart-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 16px;
  }

  .chart-container {
    width: 100%;
    height: 300px;
  }

  .no-data {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 300px;
    color: #999;
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: 16px;
  }

  .header-card {
    .el-card__body {
      padding: 16px;
    }
  }

  .card-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;

    .title {
      font-size: 20px;
    }

    .header-actions {
      width: 100%;
      flex-direction: row;
      gap: 8px;

      .date-picker {
        width: 100%;
      }
    }
  }

  .overview-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .overview-card {
    padding: 16px;

    .card-icon {
      font-size: 36px;
    }

    .card-content {
      .card-value {
        font-size: 24px;
      }
    }
  }

  .charts-section {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .chart-card {
    padding: 16px;

    .chart-container {
      height: 250px;
    }
  }
}
</style>
