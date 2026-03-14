<template>
  <div class="fixed-recorder-selector">
    <!-- 桌面端：显示当前记录人员和下拉选择器 -->
    <div class="desktop-recorder">
      <div class="recorder-display" @click="toggleSelector">
        <span class="recorder-avatar">{{ currentRecorder.avatar }}</span>
        <span class="recorder-name">{{ currentRecorder.name }}</span>
        <el-icon class="arrow-icon" :class="{ 'is-active': showSelector }">
          <ArrowDown />
        </el-icon>
      </div>
      <transition name="fade">
        <div v-show="showSelector" class="selector-panel">
          <RecorderSelector v-model="currentRecorderId" @change="handleRecorderChange" />
        </div>
      </transition>
    </div>

    <!-- 移动端：显示当前记录人员和下拉选择器 -->
    <div class="mobile-recorder">
      <div class="recorder-display" @click="toggleSelector">
        <span class="recorder-avatar">{{ currentRecorder.avatar }}</span>
        <span class="recorder-name">{{ currentRecorder.name }}</span>
        <el-icon class="arrow-icon" :class="{ 'is-active': showSelector }">
          <ArrowDown />
        </el-icon>
      </div>
      <transition name="fade">
        <div v-show="showSelector" class="selector-panel">
          <RecorderSelector v-model="currentRecorderId" @change="handleRecorderChange" />
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'
import { useRecorderStore } from '../stores/recorder'
import RecorderSelector from './RecorderSelector.vue'

export default {
  name: 'FixedRecorderSelector',
  components: {
    ArrowDown,
    RecorderSelector
  },
  setup() {
    const recorderStore = useRecorderStore()
    const currentRecorderId = ref(recorderStore.currentRecorder.id)
    const showSelector = ref(false)

    const currentRecorder = computed(() => {
      return recorderStore.getRecorderById(currentRecorderId.value)
    })

    // 监听 store 中的 currentRecorder 变化，同步更新本地状态
    watch(
      () => recorderStore.currentRecorder,
      (newRecorder) => {
        currentRecorderId.value = newRecorder.id
      },
      { deep: true }
    )

    const toggleSelector = () => {
      showSelector.value = !showSelector.value
    }

    const handleRecorderChange = (recorderId) => {
      recorderStore.setRecorder(recorderId)
      currentRecorderId.value = recorderId
      showSelector.value = false
    }

    const handleClickOutside = (event) => {
      const target = event.target
      const selector = document.querySelector('.fixed-recorder-selector')
      if (selector && !selector.contains(target)) {
        showSelector.value = false
      }
    }

    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
      // 初始化时从 store 恢复状态
      currentRecorderId.value = recorderStore.currentRecorder.id
    })

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
    })

    return {
      currentRecorderId,
      currentRecorder,
      showSelector,
      toggleSelector,
      handleRecorderChange
    }
  }
}
</script>

<style lang="scss" scoped>
.fixed-recorder-selector {
  position: fixed;
  z-index: 999;
  
  .desktop-recorder {
    display: none;
  }

  .mobile-recorder {
    position: fixed;
    top: 16px;
    right: 16px;
    z-index: 999;

    .recorder-display {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border-radius: 20px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
      }

      .recorder-avatar {
        font-size: 20px;
      }

      .recorder-name {
        font-size: 14px;
        font-weight: 600;
        color: #333;
      }

      .arrow-icon {
        font-size: 12px;
        color: #999;
        transition: transform 0.3s;

        &.is-active {
          transform: rotate(180deg);
        }
      }
    }

    .selector-panel {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 8px;
      background: rgba(255, 255, 255, 0.6);
      backdrop-filter: blur(25px);
      -webkit-backdrop-filter: blur(25px);
      border-radius: 14px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
      padding: 8px;
      max-width: 280px;
      width: max-content;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }
  }

  @media (min-width: 769px) {
    .desktop-recorder {
      display: block;
      position: fixed;
      top: 16px;
      right: 24px;
      z-index: 999;

      .recorder-display {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 20px;
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border-radius: 24px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
        }

        .recorder-avatar {
          font-size: 24px;
        }

        .recorder-name {
          font-size: 15px;
          font-weight: 600;
          color: #333;
        }

        .arrow-icon {
          font-size: 14px;
          color: #999;
          transition: transform 0.3s;

          &.is-active {
            transform: rotate(180deg);
          }
        }
      }

      .selector-panel {
        position: absolute;
        top: 100%;
        right: 0;
        margin-top: 8px;
        background: rgba(255, 255, 255, 0.6);
        backdrop-filter: blur(25px);
        -webkit-backdrop-filter: blur(25px);
        border-radius: 14px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        padding: 8px;
        max-width: 320px;
        width: max-content;
        border: 1px solid rgba(255, 255, 255, 0.3);
      }
    }

    .mobile-recorder {
      display: none;
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
