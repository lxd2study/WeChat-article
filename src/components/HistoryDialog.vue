<template>
  <el-dialog
    v-model="visible"
    title="文章历史记录"
    width="90%"
    :fullscreen="isFullscreen"
    @close="handleClose"
  >
    <template #header>
      <div class="dialog-header">
        <span class="dialog-title">文章历史记录</span>
        <div class="header-actions">
          <el-button
            size="small"
            :icon="isFullscreen ? 'ZoomOut' : 'FullScreen'"
            @click="isFullscreen = !isFullscreen"
            circle
          />
        </div>
      </div>
    </template>

    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索主题或内容..."
          clearable
          :prefix-icon="Search"
          style="width: 300px"
          @input="handleSearch"
        />
      </div>

      <div class="filter-bar">
        <el-select
          v-model="filters.style"
          placeholder="筛选风格"
          clearable
          style="width: 150px"
          @change="applyFilters"
        >
          <el-option label="专业严谨" value="professional" />
          <el-option label="轻松活泼" value="casual" />
          <el-option label="幽默风趣" value="humorous" />
          <el-option label="感性温馨" value="emotional" />
          <el-option label="科技前沿" value="tech" />
        </el-select>

        <el-select
          v-model="filters.length"
          placeholder="筛选长度"
          clearable
          style="width: 150px"
          @change="applyFilters"
        >
          <el-option label="短文" value="short" />
          <el-option label="中篇" value="medium" />
          <el-option label="长文" value="long" />
        </el-select>

        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 240px"
          @change="handleDateChange"
        />
      </div>

      <div class="action-bar">
        <el-button
          type="danger"
          size="small"
          :disabled="selectedIds.length === 0"
          @click="deleteSelected"
        >
          删除选中 ({{ selectedIds.length }})
        </el-button>
        <el-button
          type="warning"
          size="small"
          @click="clearAllHistory"
        >
          清空全部
        </el-button>
        <el-button
          type="primary"
          size="small"
          @click="exportHistory"
        >
          导出历史
        </el-button>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="statistics" v-if="statistics">
      <el-tag type="info">总计：{{ statistics.totalArticles }} 篇</el-tag>
      <el-tag type="success">总字数：{{ statistics.totalWords.toLocaleString() }}</el-tag>
      <el-tag type="warning">近7天：{{ statistics.recentDays }} 篇</el-tag>
    </div>

    <!-- 历史记录列表 -->
    <div class="history-list" v-loading="loading">
      <el-empty v-if="displayedHistory.length === 0" description="暂无历史记录" />

      <div v-else class="history-items">
        <div
          v-for="item in displayedHistory"
          :key="item.id"
          class="history-item"
          :class="{ selected: selectedIds.includes(item.id) }"
        >
          <el-checkbox
            :model-value="selectedIds.includes(item.id)"
            @change="toggleSelect(item.id)"
            class="item-checkbox"
          />

          <div class="item-content" @click="viewArticle(item)">
            <div class="item-header">
              <h3 class="item-title">{{ item.topic }}</h3>
              <div class="item-meta">
                <el-tag size="small" type="primary">{{ getStyleLabel(item.style) }}</el-tag>
                <el-tag size="small" type="success">{{ getLengthLabel(item.length) }}</el-tag>
                <span class="item-time">{{ formatTime(item.timestamp) }}</span>
                <span class="item-words">{{ item.wordCount }} 字</span>
              </div>
            </div>

            <div class="item-preview">{{ item.preview }}</div>

            <div class="item-tags" v-if="item.keyPoints && item.keyPoints.length > 0">
              <el-tag
                v-for="(point, index) in item.keyPoints.slice(0, 3)"
                :key="index"
                size="small"
                type="info"
              >
                {{ point }}
              </el-tag>
              <el-tag v-if="item.keyPoints.length > 3" size="small" type="info">
                +{{ item.keyPoints.length - 3 }}
              </el-tag>
            </div>
          </div>

          <div class="item-actions">
            <el-button
              type="primary"
              size="small"
              @click.stop="loadArticle(item)"
            >
              加载
            </el-button>
            <el-button
              type="info"
              size="small"
              @click.stop="viewArticle(item)"
            >
              预览
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click.stop="deleteItem(item.id)"
            >
              删除
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 文章预览对话框 -->
    <el-dialog
      v-model="previewDialogVisible"
      title="文章预览"
      width="70%"
      append-to-body
    >
      <div v-if="previewArticle" class="preview-content">
        <div class="preview-info">
          <h2>{{ previewArticle.topic }}</h2>
          <div class="preview-meta">
            <el-tag type="primary">{{ getStyleLabel(previewArticle.style) }}</el-tag>
            <el-tag type="success">{{ getLengthLabel(previewArticle.length) }}</el-tag>
            <span>{{ formatTime(previewArticle.timestamp) }}</span>
            <span>{{ previewArticle.wordCount }} 字</span>
          </div>
        </div>
        <el-divider />
        <div class="preview-body" v-html="renderMarkdown(previewArticle.content)"></div>
      </div>
      <template #footer>
        <el-button @click="previewDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="loadArticleFromPreview">加载到编辑器</el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import historyService from '../services/historyService'
import { marked } from 'marked'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'load-article'])

// 对话框可见性
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 状态
const loading = ref(false)
const isFullscreen = ref(false)
const searchKeyword = ref('')
const dateRange = ref([])
const filters = ref({
  style: '',
  length: ''
})

// 历史记录
const allHistory = ref([])
const displayedHistory = ref([])
const selectedIds = ref([])

// 统计信息
const statistics = ref(null)

// 预览
const previewDialogVisible = ref(false)
const previewArticle = ref(null)

// 加载历史记录
const loadHistory = () => {
  loading.value = true
  try {
    allHistory.value = historyService.getHistory()
    displayedHistory.value = allHistory.value
    statistics.value = historyService.getStatistics()
  } catch (error) {
    ElMessage.error('加载历史记录失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  if (!searchKeyword.value) {
    applyFilters()
    return
  }

  displayedHistory.value = historyService.searchHistory(searchKeyword.value)
}

// 应用筛选
const applyFilters = () => {
  const filterParams = {}

  if (filters.value.style) {
    filterParams.style = filters.value.style
  }

  if (filters.value.length) {
    filterParams.length = filters.value.length
  }

  if (dateRange.value && dateRange.value.length === 2) {
    filterParams.startDate = dateRange.value[0]
    filterParams.endDate = dateRange.value[1]
  }

  let filtered = historyService.filterHistory(filterParams)

  // 如果有搜索关键词，在筛选结果中搜索
  if (searchKeyword.value) {
    const lowerKeyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(item =>
      item.topic?.toLowerCase().includes(lowerKeyword) ||
      item.content?.toLowerCase().includes(lowerKeyword) ||
      item.preview?.toLowerCase().includes(lowerKeyword)
    )
  }

  displayedHistory.value = filtered
}

// 日期范围变化
const handleDateChange = () => {
  applyFilters()
}

// 切换选中
const toggleSelect = (id) => {
  const index = selectedIds.value.indexOf(id)
  if (index > -1) {
    selectedIds.value.splice(index, 1)
  } else {
    selectedIds.value.push(id)
  }
}

// 删除单个
const deleteItem = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这条历史记录吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    if (historyService.deleteHistory(id)) {
      ElMessage.success('删除成功')
      loadHistory()
      selectedIds.value = selectedIds.value.filter(sid => sid !== id)
    }
  } catch {
    // 用户取消
  }
}

// 删除选中
const deleteSelected = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedIds.value.length} 条历史记录吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    if (historyService.deleteMultiple(selectedIds.value)) {
      ElMessage.success('删除成功')
      loadHistory()
      selectedIds.value = []
    }
  } catch {
    // 用户取消
  }
}

// 清空全部
const clearAllHistory = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有历史记录吗？此操作不可恢复！',
      '确认清空',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    if (historyService.clearHistory()) {
      ElMessage.success('历史记录已清空')
      loadHistory()
      selectedIds.value = []
    }
  } catch {
    // 用户取消
  }
}

// 导出历史
const exportHistory = () => {
  const data = historyService.exportHistory()
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `article-history-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)

  ElMessage.success('历史记录已导出')
}

// 加载文章到编辑器
const loadArticle = (item) => {
  emit('load-article', item)
  visible.value = false
  ElMessage.success('文章已加载到编辑器')
}

// 查看文章
const viewArticle = (item) => {
  previewArticle.value = item
  previewDialogVisible.value = true
}

// 从预览加载
const loadArticleFromPreview = () => {
  if (previewArticle.value) {
    loadArticle(previewArticle.value)
    previewDialogVisible.value = false
  }
}

// 格式化时间
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date

  // 今天
  if (diff < 24 * 60 * 60 * 1000 && date.getDate() === now.getDate()) {
    return `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }

  // 昨天
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.getDate() === yesterday.getDate()) {
    return `昨天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }

  // 其他日期
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

// 获取风格标签
const getStyleLabel = (style) => {
  const labels = {
    professional: '专业严谨',
    casual: '轻松活泼',
    humorous: '幽默风趣',
    emotional: '感性温馨',
    tech: '科技前沿'
  }
  return labels[style] || style || '未知'
}

// 获取长度标签
const getLengthLabel = (length) => {
  const labels = {
    short: '短文',
    medium: '中篇',
    long: '长文'
  }
  return labels[length] || length || '未知'
}

// 渲染Markdown
const renderMarkdown = (content) => {
  return marked(content || '')
}

// 关闭对话框
const handleClose = () => {
  selectedIds.value = []
  searchKeyword.value = ''
  dateRange.value = []
  filters.value = { style: '', length: '' }
}

// 监听对话框打开
watch(visible, (val) => {
  if (val) {
    loadHistory()
  }
})

// 挂载时加载
onMounted(() => {
  if (visible.value) {
    loadHistory()
  }
})
</script>

<style scoped>
.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.dialog-title {
  font-size: 18px;
  font-weight: bold;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
}

.search-bar,
.filter-bar,
.action-bar {
  display: flex;
  gap: 10px;
  align-items: center;
}

.statistics {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.history-list {
  min-height: 400px;
  max-height: 600px;
  overflow-y: auto;
}

.history-items {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.history-item {
  display: flex;
  gap: 15px;
  padding: 15px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  transition: all 0.3s;
  background: #fff;
}

.history-item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border-color: #409eff;
}

.history-item.selected {
  background: #ecf5ff;
  border-color: #409eff;
}

.item-checkbox {
  flex-shrink: 0;
  margin-top: 5px;
}

.item-content {
  flex: 1;
  cursor: pointer;
}

.item-header {
  margin-bottom: 10px;
}

.item-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  margin: 0 0 8px 0;
}

.item-meta {
  display: flex;
  gap: 10px;
  align-items: center;
  font-size: 12px;
  color: #909399;
}

.item-time,
.item-words {
  color: #909399;
}

.item-preview {
  color: #606266;
  line-height: 1.6;
  margin-bottom: 10px;
}

.item-tags {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.item-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

.preview-content {
  padding: 20px;
}

.preview-info h2 {
  margin: 0 0 15px 0;
  color: #303133;
}

.preview-meta {
  display: flex;
  gap: 15px;
  align-items: center;
  color: #909399;
  font-size: 14px;
}

.preview-body {
  line-height: 1.8;
  color: #606266;
}

.preview-body :deep(h1),
.preview-body :deep(h2),
.preview-body :deep(h3) {
  margin-top: 20px;
  margin-bottom: 10px;
  color: #303133;
}

.preview-body :deep(p) {
  margin-bottom: 15px;
}

.preview-body :deep(code) {
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: monospace;
}

.preview-body :deep(pre) {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
}
</style>
