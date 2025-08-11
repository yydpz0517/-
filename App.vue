<template>
  <div id="app" class="app-container">
    <!-- 3D背景容器 -->
    <div id="three-container" class="three-container"></div>
    
    <!-- 主要内容 -->
    <router-view v-slot="{ Component, route }">
      <transition :name="route.meta.transition || 'fade'" mode="out-in">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
    
    <!-- 全局音效控制 -->
    <AudioController />
    
    <!-- 全局通知 -->
    <NotificationCenter />
    
    <!-- AI语音助手 -->
    <AIVoiceAssistant />
    
    <!-- 全局加载遮罩 -->
    <GlobalLoading v-if="isLoading" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useThreeStore } from '@/stores/three'
import AudioController from '@/components/AudioController.vue'
import NotificationCenter from '@/components/NotificationCenter.vue'
import AIVoiceAssistant from '@/components/AIVoiceAssistant.vue'
import GlobalLoading from '@/components/GlobalLoading.vue'
import { initThreeScene } from '@/utils/three'

const router = useRouter()
const userStore = useUserStore()
const threeStore = useThreeStore()
const isLoading = ref(false)

onMounted(async () => {
  // 初始化3D场景
  await initThreeScene()
  
  // 检查用户登录状态
  await userStore.checkAuth()
  
  // 初始化应用数据
  await initApp()
})

onUnmounted(() => {
  // 清理3D资源
  threeStore.dispose()
})

const initApp = async () => {
  try {
    isLoading.value = true
    
    // 预加载关键资源
    await preloadAssets()
    
    // 初始化用户数据
    if (userStore.isAuthenticated) {
      await userStore.loadUserData()
    }
    
  } catch (error) {
    console.error('应用初始化失败:', error)
  } finally {
    isLoading.value = false
  }
}

const preloadAssets = async () => {
  // 预加载音效文件
  const audioFiles = [
    '/sounds/click.mp3',
    '/sounds/success.mp3',
    '/sounds/achievement.mp3',
    '/sounds/notification.mp3',
    '/sounds/error.mp3'
  ]
  
  const promises = audioFiles.map(file => {
    return new Promise((resolve, reject) => {
      const audio = new Audio(file)
      audio.addEventListener('canplaythrough', resolve)
      audio.addEventListener('error', reject)
      audio.load()
    })
  })
  
  try {
    await Promise.all(promises)
    console.log('音效文件预加载完成')
  } catch (error) {
    console.warn('部分音效文件加载失败:', error)
  }
}

// 监听路由变化，更新3D场景
router.afterEach((to) => {
  threeStore.updateScene(to.name as string)
})
</script>

<style lang="scss">
.app-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.three-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

// 路由过渡动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s ease;
}

.slide-left-enter-from {
  transform: translateX(100%);
}

.slide-left-leave-to {
  transform: translateX(-100%);
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease;
}

.slide-right-enter-from {
  transform: translateX(-100%);
}

.slide-right-leave-to {
  transform: translateX(100%);
}

// 全局样式重置
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #000;
  color: #fff;
  overflow: hidden;
}

// 滚动条样式
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.5);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .app-container {
    font-size: 14px;
  }
}

// 高DPI屏幕优化
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .app-container {
    -webkit-font-smoothing: subpixel-antialiased;
  }
}
</style>