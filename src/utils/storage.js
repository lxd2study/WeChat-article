/**
 * 本地存储工具函数
 */

const STORAGE_PREFIX = 'wechat_article_'

/**
 * 保存数据到localStorage
 */
export function saveToStorage(key, value) {
  try {
    const serializedValue = JSON.stringify(value)
    localStorage.setItem(STORAGE_PREFIX + key, serializedValue)
    return true
  } catch (error) {
    console.error('保存数据失败:', error)
    return false
  }
}

/**
 * 从localStorage读取数据
 */
export function getFromStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error('读取数据失败:', error)
    return defaultValue
  }
}

/**
 * 从localStorage删除数据
 */
export function removeFromStorage(key) {
  try {
    localStorage.removeItem(STORAGE_PREFIX + key)
    return true
  } catch (error) {
    console.error('删除数据失败:', error)
    return false
  }
}

/**
 * 清空所有存储数据
 */
export function clearStorage() {
  try {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key)
      }
    })
    return true
  } catch (error) {
    console.error('清空数据失败:', error)
    return false
  }
}

/**
 * 自动保存AI记忆到本地
 */
export function saveAIMemory(conversationHistory) {
  return saveToStorage('ai_memory', conversationHistory)
}

/**
 * 从本地加载AI记忆
 */
export function loadAIMemory() {
  return getFromStorage('ai_memory', [])
}

/**
 * 保存草稿
 */
export function saveDraft(content) {
  return saveToStorage('draft', {
    content,
    timestamp: Date.now()
  })
}

/**
 * 加载草稿
 */
export function loadDraft() {
  return getFromStorage('draft')
}

/**
 * 保存用户偏好设置
 */
export function savePreferences(preferences) {
  return saveToStorage('preferences', preferences)
}

/**
 * 加载用户偏好设置
 */
export function loadPreferences() {
  return getFromStorage('preferences', {
    style: 'professional',
    length: 'medium',
    autoSave: true
  })
}
