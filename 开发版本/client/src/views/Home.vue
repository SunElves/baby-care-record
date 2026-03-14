<template>
  <div class="home">
    <el-card class="home-card">
      <template #header>
        <div class="card-header">
          <span>糯宝喂养记录</span>
          <el-date-picker v-model="selectedDate" type="date" placeholder="选择日期" format="YYYY-MM-DD"
            value-format="YYYY-MM-DD" @change="onDateChange" />
        </div>
      </template>

      <div class="overview-grid">
        <el-card class="overview-card" @click="navigateTo('/dashboard')">
          <div class="card-icon dashboard-icon">🧸</div>
          <h3>数据看板</h3>
          <p>查看数据统计和趋势分析</p>
        </el-card>

        <el-card class="overview-card" @click="navigateTo('/sleep')">
          <div class="card-icon sleep-icon">😴</div>
          <h3>睡眠记录</h3>
          <p>记录宝宝的睡眠时间和质量</p>
        </el-card>

        <el-card class="overview-card" @click="navigateTo('/feeding')">
          <div class="card-icon feeding-icon">🍼</div>
          <h3>喂奶记录</h3>
          <p>记录喂奶时间、量和类型</p>
        </el-card>

        <el-card class="overview-card" @click="navigateTo('/solid-food')">
          <div class="card-icon food-icon">🥣</div>
          <h3>辅食记录</h3>
          <p>记录辅食种类和摄入量</p>
        </el-card>

        <el-card class="overview-card" @click="navigateTo('/diaper')">
          <div class="card-icon diaper-icon">💩</div>
          <h3>换尿布记录</h3>
          <p>记录换尿布时间和状态</p>
        </el-card>

        <el-card class="overview-card" @click="navigateTo('/growth')">
          <div class="card-icon other-icon">👶</div>
          <h3>成长记录</h3>
          <p>记录身高、体重等信息</p>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'Home',
  setup() {
    const router = useRouter()
    const selectedDate = ref(new Date().toISOString().split('T')[0])

    onMounted(() => {
      document.title = '首页'
    })

    const onDateChange = (date) => {
      console.log('Selected date:', date)
    }

    const navigateTo = (path) => {
      router.push(path)
    }

    return {
      selectedDate,
      onDateChange,
      navigateTo
    }
  }
}
</script>

<style lang="scss" scoped>
.home {
  padding: 24px;
  min-height: 100vh;
  background-color: #f8f5f0;
  background-image: linear-gradient(135deg, #f8f5f0 0%, #f5f0e6 100%);
  background-attachment: fixed;
}

.home-card {
  margin-bottom: 24px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(248, 245, 240, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border-radius: 16px;

  .el-card__header {
    background: rgba(255, 255, 255, 0.5);
    border-bottom: 1px solid rgba(255, 255, 255, 0.3);
    padding: 24px 28px;
    font-size: 20px;
    font-weight: 700;
    color: #333333;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);

    .el-date-picker {
      margin-bottom: 0;

      .el-input__wrapper {
        background-color: rgba(255, 255, 255, 0.5);
        border: 1px solid rgba(255, 255, 255, 0.3);

        .el-input__inner {
          color: #333333;
        }

        .el-input__prefix-inner {
          .el-date-editor .el-input__icon {
            color: #333333;
          }
        }
      }
    }
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  margin-top: 24px;
}

.overview-card {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
  padding: 32px 24px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  animation: breathe 4s ease-in-out infinite;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--card-color-start), var(--card-color-end));
  }

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
    animation: none;
  }
}

.card-icon {
  font-size: 56px;
  margin-bottom: 20px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  .overview-card:hover & {
    transform: scale(1.1);
  }
}

.sleep-icon {
  --card-color-start: #888888;
  --card-color-end: #555555;
  color: #555555;
}

.feeding-icon {
  --card-color-start: #f8961e;
  --card-color-end: #fcbf49;
  color: #f8961e;
}

.food-icon {
  --card-color-start: #f77f00;
  --card-color-end: #f9c74f;
  color: #f77f00;
}

.diaper-icon {
  --card-color-start: #f94144;
  --card-color-end: #f8961e;
  color: #f94144;
}

.other-icon {
  --card-color-start: #277da1;
  --card-color-end: #43aa8b;
  color: #277da1;
}

h3 {
  margin-bottom: 12px;
  color: #333333;
  font-size: 20px;
  font-weight: 700;
}

p {
  color: #555555;
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .home {
    padding: 16px;
    padding-bottom: 80px;
    /* 为底部导航留出空间 */
  }

  .home-card {
    .el-card__header {
      padding: 20px 24px;
      font-size: 16px;
    }
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .overview-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-top: 20px;
  }

  .overview-card {
    padding: 24px 20px;
  }

  .card-icon {
    font-size: 48px;
  }

  h3 {
    font-size: 16px;
  }

  p {
    font-size: 13px;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .home {
    padding: 20px;
  }

  .overview-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  .overview-card {
    padding: 28px 20px;
  }
}
</style>