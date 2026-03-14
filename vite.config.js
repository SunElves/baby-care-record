import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 7788, // 设置访问端口为3000
    host: '0.0.0.0', // 允许局域网访问
    strictPort: true, // 如果端口被占用则直接失败，不尝试其他端口
    open: false // 不自动打开浏览器
  }
})
