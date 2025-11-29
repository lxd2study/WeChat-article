<template>
  <div id="app">
    <el-container class="app-container">
      <el-header class="app-header">
        <div class="header-content">
          <h1>
            <el-icon><EditPen /></el-icon>
            AI微信公众号文章生成器
          </h1>
          <div class="header-right">
            <el-tag type="success">智能AI助手</el-tag>
            <ThemeToggle />
          </div>
        </div>
      </el-header>
      <el-main class="app-main">
        <ArticleGenerator />
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { EditPen } from '@element-plus/icons-vue'
import ArticleGenerator from './components/ArticleGenerator.vue'
import ThemeToggle from './components/ThemeToggle.vue'
</script>

<style scoped>
#app {
  height: 100vh;
  overflow: hidden;
}

.app-container {
  height: 100%;
  background: var(--gradient-primary);
  transition: background 0.3s ease;
}

.app-header {
  background: var(--bg-primary);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 12px var(--shadow-color);
  display: flex;
  align-items: center;
  padding: 0 30px;
  transition: background-color 0.3s ease;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.header-content h1 {
  margin: 0;
  font-size: 24px;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.app-main {
  padding: 20px;
  overflow: auto;
}
</style>
