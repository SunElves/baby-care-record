<template>
  <div class="recorder-selector" role="radiogroup" aria-label="选择记录人员">
    <div class="bubble-container">
      <div
        v-for="recorder in recorders"
        :key="recorder.id"
        class="recorder-bubble"
        :class="{ 
          'active': selectedRecorder === recorder.id,
          'selected': selectedRecorder === recorder.id
        }"
        :role="'radio'"
        :aria-checked="selectedRecorder === recorder.id"
        :tabindex="selectedRecorder === recorder.id ? 0 : -1"
        @click="handleRecorderChange(recorder.id)"
        @keydown.enter="handleRecorderChange(recorder.id)"
        @keydown.space.prevent="handleRecorderChange(recorder.id)"
      >
        <div class="bubble-content">
          <span class="recorder-avatar" :aria-hidden="true">{{ recorder.avatar }}</span>
          <span class="recorder-name">{{ recorder.name }}</span>
        </div>
        <transition name="check-fade">
          <div v-if="selectedRecorder === recorder.id" class="check-mark">
            <el-icon><Check /></el-icon>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'
import { Check, SuccessFilled } from '@element-plus/icons-vue'
import { useRecorderStore } from '../stores/recorder'

export default {
  name: 'RecorderSelector',
  components: {
    Check,
    SuccessFilled
  },
  props: {
    modelValue: {
      type: String,
      default: 'mom'
    }
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const recorderStore = useRecorderStore()
    const selectedRecorder = ref(props.modelValue)
    const recorders = computed(() => recorderStore.recorders)
    const showToast = ref(false)

    const currentRecorderName = computed(() => {
      const recorder = recorders.value.find(r => r.id === selectedRecorder.value)
      return recorder ? recorder.name : ''
    })

    watch(() => props.modelValue, (newVal) => {
      selectedRecorder.value = newVal
    })

    const handleRecorderChange = (recorderId) => {
      if (selectedRecorder.value === recorderId) {
        return
      }
      
      selectedRecorder.value = recorderId
      emit('update:modelValue', recorderId)
      emit('change', recorderId)
      recorderStore.setRecorder(recorderId)
      
      // 显示状态提示
      showToast.value = true
      setTimeout(() => {
        showToast.value = false
      }, 2000)
    }

    onMounted(() => {
      if (!selectedRecorder.value) {
        selectedRecorder.value = recorderStore.currentRecorder.id
      }
    })

    return {
      selectedRecorder,
      recorders,
      showToast,
      currentRecorderName,
      handleRecorderChange
    }
  }
}
</script>

<style lang="scss" scoped>
.recorder-selector {
  position: relative;

  .bubble-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    padding: 4px;
    max-height: 300px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(248, 150, 30, 0.3) transparent;

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(248, 150, 30, 0.3);
      border-radius: 2px;

      &:hover {
        background: rgba(248, 150, 30, 0.5);
      }
    }
  }

  .recorder-bubble {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px 12px;
    border-radius: 18px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border: 2px solid transparent;
    user-select: none;
    outline: none;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
      background: rgba(255, 255, 255, 0.95);
    }

    &:focus {
      outline: 2px solid #f8961e;
      outline-offset: 2px;
    }

    &.active {
      background: linear-gradient(135deg, rgba(248, 150, 30, 0.15) 0%, rgba(248, 150, 30, 0.25) 100%);
      border-color: #f8961e;
      box-shadow: 0 4px 16px rgba(248, 150, 30, 0.3);
      transform: translateY(-2px);

      .recorder-avatar {
        animation: bounce 0.5s ease;
      }
    }

    .bubble-content {
      display: flex;
      align-items: center;
      gap: 5px;

      .recorder-avatar {
        font-size: 18px;
        transition: transform 0.3s ease;
      }

      .recorder-name {
        font-size: 12px;
        font-weight: 600;
        color: #333;
        white-space: nowrap;
      }
    }

    .check-mark {
      position: absolute;
      top: -5px;
      right: -5px;
      width: 18px;
      height: 18px;
      background: #f8961e;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 11px;
      box-shadow: 0 2px 8px rgba(248, 150, 30, 0.4);
    }
  }

  .status-toast {
    position: fixed;
    top: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(103, 194, 58, 0.95);
    color: white;
    padding: 12px 24px;
    border-radius: 24px;
    box-shadow: 0 4px 16px rgba(103, 194, 58, 0.3);
    display: flex;
    align-items: center;
    gap: 8px;
    z-index: 2000;
    font-size: 14px;
    font-weight: 500;

    .toast-icon {
      font-size: 18px;
    }
  }

  @media (max-width: 768px) {
    .bubble-container {
      gap: 6px;
      padding: 3px;
      max-height: 250px;
    }

    .recorder-bubble {
      padding: 5px 10px;
      border-radius: 14px;

      .bubble-content {
        .recorder-avatar {
          font-size: 16px;
        }

        .recorder-name {
          font-size: 11px;
        }
      }

      .check-mark {
        width: 16px;
        height: 16px;
        font-size: 9px;
        top: -4px;
        right: -4px;
      }
    }

    .status-toast {
      top: 70px;
      padding: 10px 20px;
      font-size: 12px;
    }
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    .bubble-container {
      gap: 7px;
      max-height: 280px;
    }

    .recorder-bubble {
      padding: 5px 11px;

      .bubble-content {
        .recorder-avatar {
          font-size: 17px;
        }

        .recorder-name {
          font-size: 11px;
        }
      }
    }
  }
}

.check-fade-enter-active,
.check-fade-leave-active {
  transition: all 0.3s ease;
}

.check-fade-enter-from {
  opacity: 0;
  transform: scale(0);
}

.check-fade-leave-to {
  opacity: 0;
  transform: scale(0);
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.3s ease;
}

.toast-fade-enter-from {
  opacity: 0;
  transform: translate(-50%, -20px);
}

.toast-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}

@keyframes bounce {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}
</style>
