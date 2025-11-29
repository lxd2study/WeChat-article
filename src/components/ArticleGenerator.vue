<template>
  <div class="article-generator">
    <el-card class="control-panel" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>文章生成控制台</span>
          <div class="header-actions">
            <el-tag :type="hasMemory ? 'success' : 'info'" style="margin-right: 10px">
              {{ hasMemory ? 'AI记忆已激活' : 'AI记忆未激活' }}
            </el-tag>
            <el-button
              size="small"
              type="success"
              @click="showHistoryDialog"
            >
              <el-icon><Tickets /></el-icon>
              历史记录
            </el-button>
            <el-button
              size="small"
              type="primary"
              :icon="Setting"
              @click="showConfigDialog"
            >
              AI 配置
            </el-button>
          </div>
        </div>
      </template>

      <el-form :model="formData" label-width="100px" label-position="top">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="文章主题" required>
              <el-input
                v-model="formData.topic"
                placeholder="请输入文章主题，例如：如何提高工作效率"
                clearable
                :prefix-icon="EditPen"
              />
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="文章风格">
              <el-select v-model="formData.style" placeholder="选择风格" style="width: 100%">
                <el-option label="专业严谨" value="professional" />
                <el-option label="轻松活泼" value="casual" />
                <el-option label="幽默风趣" value="humorous" />
                <el-option label="感性温馨" value="emotional" />
                <el-option label="科技前沿" value="tech" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="文章长度">
              <el-select v-model="formData.length" placeholder="选择长度" style="width: 100%">
                <el-option label="短文 (800-1200字)" value="short" />
                <el-option label="中篇 (1500-2500字)" value="medium" />
                <el-option label="长文 (3000-5000字)" value="long" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="8">
            <el-form-item label="目标读者">
              <el-input
                v-model="formData.targetAudience"
                placeholder="例如：职场白领、学生群体"
                clearable
              />
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="关键要点">
              <el-select
                v-model="formData.keyPoints"
                multiple
                filterable
                allow-create
                placeholder="输入后按回车添加要点"
                style="width: 100%"
              >
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="其他要求">
              <el-input
                v-model="formData.additionalRequirements"
                type="textarea"
                :rows="3"
                placeholder="可以添加任何特殊要求，AI会记住这些偏好..."
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="10" class="action-buttons">
          <el-col :span="6">
            <el-button
              type="primary"
              :loading="isGenerating"
              @click="generateArticle"
              style="width: 100%"
              :disabled="!formData.topic"
            >
              <el-icon><MagicStick /></el-icon>
              生成文章
            </el-button>
          </el-col>
          <el-col :span="6">
            <el-button
              type="success"
              :loading="isOptimizing"
              @click="showOptimizeDialog"
              style="width: 100%"
              :disabled="!articleContent"
            >
              <el-icon><Edit /></el-icon>
              优化文章
            </el-button>
          </el-col>
          <el-col :span="6">
            <el-button
              type="warning"
              :loading="isContinuing"
              @click="continueArticle"
              style="width: 100%"
              :disabled="!articleContent"
            >
              <el-icon><DArrowRight /></el-icon>
              续写文章
            </el-button>
          </el-col>
          <el-col :span="6">
            <el-button
              type="info"
              @click="clearMemory"
              style="width: 100%"
            >
              <el-icon><Delete /></el-icon>
              清空记忆
            </el-button>
          </el-col>
        </el-row>

        <el-row :gutter="10" style="margin-top: 10px">
          <el-col :span="12">
            <el-button @click="saveMemory" style="width: 100%">
              <el-icon><Download /></el-icon>
              导出记忆
            </el-button>
          </el-col>
          <el-col :span="12">
            <el-button @click="showImportDialog" style="width: 100%">
              <el-icon><Upload /></el-icon>
              导入记忆
            </el-button>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <el-card class="editor-panel" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>文章编辑器</span>
          <el-button-group>
            <el-button size="small" @click="copyArticle" :disabled="!articleContent">
              <el-icon><CopyDocument /></el-icon>
              复制
            </el-button>
            <el-button size="small" @click="downloadArticle" :disabled="!articleContent">
              <el-icon><Download /></el-icon>
              下载
            </el-button>
          </el-button-group>
        </div>
      </template>

      <VditorEditor
        v-model="articleContent"
        ref="editorRef"
        height="auto"
        min-height="400px"
      />
    </el-card>

    <!-- 优化文章对话框 -->
    <el-dialog
      v-model="optimizeDialogVisible"
      title="优化文章"
      width="500px"
    >
      <el-input
        v-model="optimizeInstruction"
        type="textarea"
        :rows="4"
        placeholder="请输入优化要求，例如：让语言更生动一些，增加一些案例"
      />
      <template #footer>
        <el-button @click="optimizeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="optimizeArticle" :loading="isOptimizing">
          开始优化
        </el-button>
      </template>
    </el-dialog>

    <!-- 导入记忆对话框 -->
    <el-dialog
      v-model="importDialogVisible"
      title="导入AI记忆"
      width="500px"
    >
      <el-input
        v-model="importMemoryData"
        type="textarea"
        :rows="10"
        placeholder="粘贴之前导出的记忆数据..."
      />
      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="importMemory">
          导入
        </el-button>
      </template>
    </el-dialog>

    <!-- AI 配置对话框 -->
    <AIConfigDialog
      v-model="configDialogVisible"
      :current-config="currentAIConfig"
      @save="handleSaveConfig"
    />

    <!-- 历史记录对话框 -->
    <HistoryDialog
      v-model="historyDialogVisible"
      @load-article="loadFromHistory"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  EditPen,
  MagicStick,
  Edit,
  DArrowRight,
  Delete,
  Download,
  Upload,
  CopyDocument,
  Setting,
  Tickets
} from '@element-plus/icons-vue'
import VditorEditor from './VditorEditor.vue'
import AIConfigDialog from './AIConfigDialog.vue'
import HistoryDialog from './HistoryDialog.vue'
import aiService from '../services/aiService'
import historyService from '../services/historyService'

// 表单数据
const formData = ref({
  topic: '',
  style: 'professional',
  length: 'medium',
  targetAudience: '',
  keyPoints: [],
  additionalRequirements: ''
})

// 文章内容
const articleContent = ref('')

// 编辑器引用
const editorRef = ref(null)

// 加载状态
const isGenerating = ref(false)
const isOptimizing = ref(false)
const isContinuing = ref(false)

// 对话框状态
const optimizeDialogVisible = ref(false)
const optimizeInstruction = ref('')
const importDialogVisible = ref(false)
const importMemoryData = ref('')
const configDialogVisible = ref(false)
const historyDialogVisible = ref(false)

// AI 配置
const currentAIConfig = ref(aiService.getConfig())

// 检查是否有记忆
const hasMemory = computed(() => {
  return aiService.getConversationHistory().length > 1
})

// 生成文章
const generateArticle = async () => {
  if (!formData.value.topic) {
    ElMessage.warning('请输入文章主题')
    return
  }

  isGenerating.value = true

  try {
    const options = {
      style: formData.value.style,
      length: formData.value.length,
      targetAudience: formData.value.targetAudience,
      keyPoints: formData.value.keyPoints,
      additionalRequirements: formData.value.additionalRequirements
    }

    const article = await aiService.generateArticle(formData.value.topic, options)
    articleContent.value = article

    // 保存到历史记录
    saveToHistory(article)

    ElMessage.success('文章生成成功！')
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    isGenerating.value = false
  }
}

// 显示优化对话框
const showOptimizeDialog = () => {
  optimizeInstruction.value = ''
  optimizeDialogVisible.value = true
}

// 优化文章
const optimizeArticle = async () => {
  if (!optimizeInstruction.value) {
    ElMessage.warning('请输入优化要求')
    return
  }

  isOptimizing.value = true

  try {
    // 获取完整内容（包含base64图片）进行优化
    const fullContent = editorRef.value?.getFullValue() || articleContent.value
    const optimized = await aiService.optimizeArticle(
      fullContent,
      optimizeInstruction.value
    )
    articleContent.value = optimized
    optimizeDialogVisible.value = false

    // 保存优化后的文章到历史记录
    saveToHistory(optimized)

    ElMessage.success('文章优化成功！')
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    isOptimizing.value = false
  }
}

// 续写文章
const continueArticle = async () => {
  isContinuing.value = true

  try {
    // 获取完整内容（包含base64图片）进行续写
    const fullContent = editorRef.value?.getFullValue() || articleContent.value
    const continued = await aiService.continueArticle(fullContent)
    articleContent.value += '\n\n' + continued

    // 保存续写后的文章到历史记录
    saveToHistory(articleContent.value)

    ElMessage.success('文章续写成功！')
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    isContinuing.value = false
  }
}

// 清空记忆
const clearMemory = async () => {
  try {
    await ElMessageBox.confirm(
      '清空记忆后，AI将忘记之前的所有对话内容。是否继续？',
      '确认清空',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    aiService.clearConversation()
    ElMessage.success('AI记忆已清空')
  } catch {
    // 用户取消
  }
}

// 保存记忆
const saveMemory = () => {
  const memoryData = aiService.exportConversation()
  const blob = new Blob([memoryData], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `ai-memory-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)

  ElMessage.success('记忆数据已导出')
}

// 显示导入对话框
const showImportDialog = () => {
  importMemoryData.value = ''
  importDialogVisible.value = true
}

// 导入记忆
const importMemory = () => {
  if (!importMemoryData.value) {
    ElMessage.warning('请粘贴记忆数据')
    return
  }

  try {
    aiService.importConversation(importMemoryData.value)
    importDialogVisible.value = false
    ElMessage.success('记忆数据已导入')
  } catch (error) {
    ElMessage.error('导入失败，请检查数据格式')
  }
}

// 复制文章
const copyArticle = () => {
  // 获取完整内容（包含base64图片）
  const fullContent = editorRef.value?.getFullValue() || articleContent.value
  navigator.clipboard.writeText(fullContent).then(() => {
    ElMessage.success('文章已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败')
  })
}

// 下载文章
const downloadArticle = () => {
  // 获取完整内容（包含base64图片）
  const fullContent = editorRef.value?.getFullValue() || articleContent.value
  const blob = new Blob([fullContent], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `article-${Date.now()}.md`
  a.click()
  URL.revokeObjectURL(url)

  ElMessage.success('文章已下载')
}

// 显示配置对话框
const showConfigDialog = () => {
  currentAIConfig.value = aiService.getConfig()
  configDialogVisible.value = true
}

// 保存 AI 配置
const handleSaveConfig = (config) => {
  aiService.updateConfig(config)
  currentAIConfig.value = config
  ElMessage.success('AI 配置已保存')
}

// 保存到历史记录
const saveToHistory = (article) => {
  try {
    // 获取完整内容（包含base64图片）
    const fullContent = editorRef.value?.getFullValue() || article
    historyService.saveToHistory({
      topic: formData.value.topic,
      content: fullContent,
      style: formData.value.style,
      length: formData.value.length,
      targetAudience: formData.value.targetAudience,
      keyPoints: formData.value.keyPoints,
      additionalRequirements: formData.value.additionalRequirements
    })
  } catch (error) {
    console.error('保存历史记录失败:', error)
  }
}

// 显示历史记录对话框
const showHistoryDialog = () => {
  historyDialogVisible.value = true
}

// 从历史记录加载文章
const loadFromHistory = (historyItem) => {
  // 加载表单数据
  formData.value.topic = historyItem.topic || ''
  formData.value.style = historyItem.style || 'professional'
  formData.value.length = historyItem.length || 'medium'
  formData.value.targetAudience = historyItem.targetAudience || ''
  formData.value.keyPoints = historyItem.keyPoints || []
  formData.value.additionalRequirements = historyItem.additionalRequirements || ''

  // 加载文章内容
  articleContent.value = historyItem.content || ''
}
</script>

<style scoped>
.article-generator {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: calc(100vh - 100px);
}

.control-panel {
  flex-shrink: 0;
  background-color: var(--bg-primary);
  transition: background-color 0.3s ease;
}

.editor-panel {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);
  transition: background-color 0.3s ease;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--text-primary);
}

.header-actions {
  display: flex;
  align-items: center;
}

.action-buttons {
  margin-top: 20px;
}

:deep(.el-card) {
  background-color: var(--bg-primary);
  border-color: var(--border-color);
  transition: all 0.3s ease;
}

:deep(.el-card__header) {
  background-color: var(--bg-secondary);
  border-bottom-color: var(--border-color);
  color: var(--text-primary);
  transition: all 0.3s ease;
}

:deep(.el-card__body) {
  padding: 20px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: all 0.3s ease;
}

:deep(.editor-panel .el-card__body) {
  display: flex;
  flex-direction: column;
}

:deep(.el-form-item__label) {
  color: var(--text-primary);
}

:deep(.el-input__wrapper) {
  background-color: var(--bg-primary);
  border-color: var(--border-color);
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper:hover) {
  border-color: var(--accent-color);
}

:deep(.el-input__wrapper.is-focus) {
  border-color: var(--accent-color);
}

:deep(.el-input__inner) {
  color: var(--text-primary);
  background-color: transparent;
}

:deep(.el-input__inner::placeholder) {
  color: var(--text-tertiary);
}

:deep(.el-textarea__inner) {
  background-color: var(--bg-primary);
  border-color: var(--border-color);
  color: var(--text-primary);
  transition: all 0.3s ease;
}

:deep(.el-textarea__inner:hover) {
  border-color: var(--accent-color);
}

:deep(.el-textarea__inner:focus) {
  border-color: var(--accent-color);
}

:deep(.el-textarea__inner::placeholder) {
  color: var(--text-tertiary);
}

:deep(.el-select__wrapper) {
  background-color: var(--bg-primary);
  border-color: var(--border-color);
  transition: all 0.3s ease;
}

:deep(.el-select__wrapper:hover) {
  border-color: var(--accent-color);
}

:deep(.el-select__wrapper.is-focus) {
  border-color: var(--accent-color);
}

:deep(.el-select__selected-item) {
  color: var(--text-primary);
}

:deep(.el-select__placeholder) {
  color: var(--text-tertiary);
}

:deep(.el-dialog) {
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

:deep(.el-dialog__header) {
  background-color: var(--bg-secondary);
  border-bottom-color: var(--border-color);
  color: var(--text-primary);
}

:deep(.el-dialog__body) {
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

:deep(.el-dialog__footer) {
  background-color: var(--bg-secondary);
  border-top-color: var(--border-color);
}

:deep(.el-overlay-dialog) {
  background-color: rgba(0, 0, 0, 0.5);
}

:deep(.el-button) {
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

:deep(.el-button:hover) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

:deep(.el-button:active) {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

:deep(.el-button--primary) {
  background-color: #7CB5EC;
  border-color: #7CB5EC;
  color: #fff;
}

:deep(.el-button--primary:hover) {
  background-color: #5FA3D8;
  border-color: #5FA3D8;
}

:deep(.el-button--success) {
  background-color: #90EE90;
  border-color: #90EE90;
  color: #000;
}

:deep(.el-button--success:hover) {
  background-color: #7DD87D;
  border-color: #7DD87D;
}

:deep(.el-button--warning) {
  background-color: #FFD700;
  border-color: #FFD700;
  color: #000;
}

:deep(.el-button--warning:hover) {
  background-color: #FFC700;
  border-color: #FFC700;
}

:deep(.el-button--info) {
  background-color: #808080;
  border-color: #808080;
  color: #fff;
}

:deep(.el-button--info:hover) {
  background-color: #707070;
  border-color: #707070;
}

:deep(.el-button--default) {
  background-color: var(--bg-tertiary);
  border-color: var(--border-color);
  color: var(--text-primary);
}

:deep(.el-button--default:hover) {
  background-color: var(--bg-secondary);
  border-color: var(--accent-color);
  color: var(--accent-color);
}

:deep(.el-button:disabled) {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

:deep(.el-button-group) {
  display: flex;
  gap: 0;
}

:deep(.el-button-group .el-button) {
  border-radius: 0;
}

:deep(.el-button-group .el-button:first-child) {
  border-radius: 6px 0 0 6px;
}

:deep(.el-button-group .el-button:last-child) {
  border-radius: 0 6px 6px 0;
}
</style>
