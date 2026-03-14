import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useRecorderStore = defineStore('recorder', () => {
  // 预设人员列表
  const recorders = ref([
    { id: 'dad', name: '爸爸', avatar: '👨' },
    { id: 'mom', name: '妈妈', avatar: '👩' },
    { id: 'grandpa', name: '爷爷', avatar: '👴' },
    { id: 'grandma', name: '奶奶', avatar: '👵' },
    { id: 'maternal-grandpa', name: '姥爷', avatar: '👴' },
    { id: 'maternal-grandma', name: '姥姥', avatar: '👵' },
    { id: 'aunt', name: '阿姨', avatar: '👩‍🦰' }
  ])

  // 从 localStorage 恢复当前选中人员，如果没有则默认为阿姨
  const getInitialRecorder = () => {
    const saved = localStorage.getItem('currentRecorder')
    if (saved) {
      try {
        const savedRecorder = JSON.parse(saved)
        const recorder = recorders.value.find(r => r.id === savedRecorder.id)
        if (recorder) {
          return recorder
        }
      } catch (e) {
        console.error('Failed to parse saved recorder:', e)
      }
    }
    return recorders.value[6] // 默认为阿姨
  }

  // 当前选中的人员
  const currentRecorder = ref(getInitialRecorder())

  // 切换人员
  const setRecorder = (recorderId) => {
    const recorder = recorders.value.find(r => r.id === recorderId)
    if (recorder) {
      currentRecorder.value = recorder
      // 保存到 localStorage
      localStorage.setItem('currentRecorder', JSON.stringify(recorder))
    }
  }

  // 根据ID获取人员信息
  const getRecorderById = (recorderId) => {
    return recorders.value.find(r => r.id === recorderId) || recorders.value[6]
  }

  // 初始化时从 localStorage 恢复当前选中人员
  const initRecorder = () => {
    const saved = localStorage.getItem('currentRecorder')
    if (saved) {
      try {
        const savedRecorder = JSON.parse(saved)
        const recorder = recorders.value.find(r => r.id === savedRecorder.id)
        if (recorder) {
          currentRecorder.value = recorder
        }
      } catch (e) {
        console.error('Failed to parse saved recorder:', e)
      }
    }
  }

  return {
    recorders,
    currentRecorder,
    setRecorder,
    getRecorderById,
    initRecorder
  }
})
