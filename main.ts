import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'
import { initSupabase } from './utils/supabase'
import { initAudio } from './utils/audio'
import './styles/main.scss'

// 初始化应用
const app = createApp(App)
const pinia = createPinia()

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(pinia)
app.use(router)
app.use(ElementPlus)

// 初始化服务
initSupabase()
initAudio()

// 隐藏加载屏幕
const hideLoading = () => {
  const loading = document.getElementById('loading')
  if (loading) {
    loading.style.opacity = '0'
    setTimeout(() => {
      loading.remove()
    }, 500)
  }
}

// 应用挂载完成后隐藏加载屏幕
app.mount('#app')
setTimeout(hideLoading, 1000)

// PWA支持
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration)
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError)
      })
  })
}

// 全局错误处理
app.config.errorHandler = (err, vm, info) => {
  console.error('全局错误:', err, info)
  // 这里可以添加错误上报逻辑
}

// 性能监控
if (import.meta.env.PROD) {
  // 页面加载性能监控
  window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    console.log('页面加载时间:', perfData.loadEventEnd - perfData.fetchStart, 'ms')
  })
}