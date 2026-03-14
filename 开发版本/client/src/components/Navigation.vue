<template>
  <div class="navigation">
    <!-- 移动端底部导航 -->
    <el-menu :default-active="activeIndex" class="mobile-nav" :router="true" mode="horizontal">
      <el-menu-item index="/">
        <el-icon>
          <House />
        </el-icon>
        <span>首页</span>
      </el-menu-item>
      <el-menu-item index="/dashboard">
        <el-icon>
          <TrendCharts />
        </el-icon>
        <span>看板</span>
      </el-menu-item>
      <el-menu-item index="/sleep">
        <el-icon>
          <AlarmClock />
        </el-icon>
        <span>睡眠</span>
      </el-menu-item>
      <el-menu-item index="/feeding">
        <el-icon>
          <Mug />
        </el-icon>
        <span>喂奶</span>
      </el-menu-item>
      <el-menu-item index="/solid-food">
        <el-icon>
          <KnifeFork />
        </el-icon>
        <span>辅食</span>
      </el-menu-item>
      <el-menu-item index="/diaper">
        <el-icon>
          <Sunset />
        </el-icon>
        <span>换尿布</span>
      </el-menu-item>
      <el-menu-item index="/growth">
        <el-icon>
          <Document />
        </el-icon>
        <span>成长</span>
      </el-menu-item>
      <el-menu-item index="/data">
        <el-icon>
          <DataAnalysis />
        </el-icon>
        <span>数据</span>
      </el-menu-item>
    </el-menu>

    <!-- 平板/桌面端顶部导航 -->
    <el-menu :default-active="activeRoute" mode="horizontal" class="desktop-nav" :router="true">
      <el-menu-item index="/">
        <el-icon>
          <House />
        </el-icon>
        <span>首页</span>
      </el-menu-item>
      <el-menu-item index="/dashboard">
        <el-icon>
          <TrendCharts />
        </el-icon>
        <span>数据看板</span>
      </el-menu-item>
      <el-menu-item index="/sleep">
        <el-icon>
          <AlarmClock />
        </el-icon>
        <span>睡眠记录</span>
      </el-menu-item>
      <el-menu-item index="/feeding">
        <el-icon>
          <Mug />
        </el-icon>
        <span>喂奶记录</span>
      </el-menu-item>
      <el-menu-item index="/solid-food">
        <el-icon>
          <KnifeFork />
        </el-icon>
        <span>辅食记录</span>
      </el-menu-item>
      <el-menu-item index="/diaper">
        <el-icon>
          <Sunset />
        </el-icon>
        <span>换尿布记录</span>
      </el-menu-item>
      <el-menu-item index="/growth">
        <el-icon>
          <Document />
        </el-icon>
        <span>成长记录</span>
      </el-menu-item>
      <el-menu-item index="/data">
        <el-icon>
          <DataAnalysis />
        </el-icon>
        <span>数据管理</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { House, AlarmClock, Mug, KnifeFork, Document, DataAnalysis, Sunset, TrendCharts } from '@element-plus/icons-vue'

export default {
  name: 'Navigation',
  components: {
    House,
    AlarmClock,
    Mug,
    KnifeFork,
    Document,
    DataAnalysis,
    Sunset,
    TrendCharts
  },
  setup() {
    const route = useRoute()
    const activeRoute = ref(route.path)
    const activeIndex = ref(route.path)

    watch(
      () => route.path,
      (newPath) => {
        activeRoute.value = newPath
        activeIndex.value = newPath
      }
    )

    return {
      activeRoute,
      activeIndex
    }
  }
}
</script>

<style lang="scss" scoped>
.navigation {
  .mobile-nav {
    display: none;
  }

  .desktop-nav {
    width: 100%;
    background: rgba(248, 245, 240, 0.7);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    border-radius: 0;
    margin: 0;
    padding: 0 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.3);

    :deep(.el-menu-item) {
      font-weight: 500;
      font-size: 14px;
      color: #333333;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      padding: 0 20px;
      margin: 0 4px;
      border-radius: 12px;
      height: 56px;
      line-height: 56px;

      &:hover {
        background-color: rgba(248, 150, 30, 0.1) !important;
        color: #f8961e;
        transform: translateY(-2px);
      }

      &.is-active {
        background-color: rgba(248, 150, 30, 0.2) !important;
        color: #f8961e !important;
        border-bottom: none !important;
        font-weight: 600 !important;
      }

      .el-icon {
        font-size: 18px;
        margin-right: 8px;
      }
    }
  }


  @media (max-width: 768px) {
    .mobile-nav {
      display: flex;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      background: rgb(248, 245, 240);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
      border-radius: 16px 16px 0 0;
      padding: 12px 0;
      border-top: 1px solid rgba(255, 255, 255, 0.3);
      justify-content: space-around;

      :deep(.el-menu-item) {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-weight: 500;
        font-size: 12px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0, 1);
        padding: 8px 0;
        margin: 0;
        height: auto;
        line-height: 1;

        &:hover {
          background: rgba(248, 245, 240, 0.8);
          backdrop-filter: blur(10px);
          color: #f8961e;
          transform: translateY(-2px);
        }

        &.is-active {
          background: rgba(0, 0, 0, 0.0)!important;
          color: #f8961e !important;
          font-weight: 600 !important;
          border-bottom: none !important;
        }

        .el-icon {
          font-size: 20px;
          margin-right: 0;
          margin-bottom: 4px;
        }
      }
    }

    .desktop-nav {
      display: none;
    }
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    .desktop-nav {
      padding: 0 16px;

      :deep(.el-menu-item) {
        padding: 0 16px;
        font-size: 13px;

        .el-icon {
          font-size: 16px;
          margin-right: 6px;
        }
      }
    }
  }
}
</style>