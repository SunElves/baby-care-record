<template>
  <div class="app">
    <Navigation />
    <main class="main-content">
      <router-view />
    </main>
    <FixedRecorderSelector />
  </div>
</template>

<script>
import { onMounted } from 'vue'
import Navigation from './components/Navigation.vue'
import FixedRecorderSelector from './components/FixedRecorderSelector.vue'
import { useRecorderStore } from './stores/recorder'

export default {
  name: 'App',
  components: {
    Navigation,
    FixedRecorderSelector
  },
  setup() {
    const recorderStore = useRecorderStore()

    onMounted(() => {
      recorderStore.initRecorder()
    })
  }
}
</script>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
  background-color: #f5f7fa;
  color: #303133;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding-bottom: 60px; /* 为移动端底部导航留出空间 */
}

@media (max-width: 768px) {
  .main-content {
    padding-bottom: 60px;
  }
}
</style>