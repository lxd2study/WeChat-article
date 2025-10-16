<template>
  <div id="app">
    <el-container class="app-container">
      <el-header class="app-header">
        <div class="header-content">
          <h1>
            <el-icon><EditPen /></el-icon>
            AI微信公众号文章生成器
          </h1>
          <el-tag type="success">智能AI助手</el-tag>
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
</script>

<style scoped>
#app {
  height: 100vh;
  overflow: hidden;
}

.app-container {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.app-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  padding: 0 30px;
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
  color: #303133;
  display: flex;
  align-items: center;
  gap: 10px;
}

.app-main {
  padding: 20px;
  overflow: auto;
}
</style>
