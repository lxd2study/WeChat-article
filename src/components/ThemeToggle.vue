<template>
  <div class="theme-toggle">
    <el-switch
      v-model="isDark"
      :active-icon="Moon"
      :inactive-icon="Sunny"
      @change="toggleTheme"
      size="large"
      :active-color="isDark ? '#409eff' : '#667eea'"
      :inactive-color="isDark ? '#667eea' : '#409eff'"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Sunny, Moon } from '@element-plus/icons-vue'

const isDark = ref(false)

const toggleTheme = () => {
  const html = document.documentElement
  if (isDark.value) {
    html.setAttribute('data-theme', 'dark')
    localStorage.setItem('theme', 'dark')
  } else {
    html.removeAttribute('data-theme')
    localStorage.setItem('theme', 'light')
  }
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    isDark.value = true
    document.documentElement.setAttribute('data-theme', 'dark')
  } else {
    isDark.value = false
    document.documentElement.removeAttribute('data-theme')
  }
})
</script>

<style scoped>
.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.el-switch__core) {
  border-radius: 20px;
  height: 24px;
  min-width: 60px;
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

:deep(.el-switch.is-checked .el-switch__core) {
  background-color: var(--accent-color);
  border-color: var(--accent-color);
}

:deep(.el-switch__action) {
  border-radius: 50%;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--text-primary);
  transition: all 0.3s ease;
  width: 20px;
  height: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

:deep(.el-switch.is-checked .el-switch__action) {
  background-color: var(--bg-primary);
  color: var(--accent-color);
}

:deep(.el-switch__label) {
  color: var(--text-primary);
}
</style>