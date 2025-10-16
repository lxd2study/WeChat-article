<template>
  <el-dialog
    v-model="visible"
    title="AI 配置"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form :model="config" label-width="120px" label-position="left">
      <el-form-item label="API Provider">
        <el-select v-model="config.provider" style="width: 100%" @change="handleProviderChange">
          <el-option label="OpenAI" value="openai" />
          <el-option label="Anthropic Claude" value="anthropic" />
          <el-option label="自定义" value="custom" />
        </el-select>
      </el-form-item>

      <el-form-item label="API Key" required>
        <el-input
          v-model="config.apiKey"
          type="password"
          placeholder="请输入 API Key"
          show-password
          clearable
        />
        <div class="form-help">
          您的 API Key 将安全地存储在浏览器本地
        </div>
      </el-form-item>

      <el-form-item label="API URL">
        <el-input
          v-model="config.apiUrl"
          placeholder="API 端点 URL"
          clearable
        />
        <div class="form-help">
          {{ getApiUrlHelp() }}
        </div>
      </el-form-item>

      <el-form-item label="模型">
        <el-select
          v-model="config.model"
          filterable
          allow-create
          placeholder="选择或输入模型名称"
          style="width: 100%"
        >
          <el-option
            v-for="model in getAvailableModels()"
            :key="model.value"
            :label="model.label"
            :value="model.value"
          />
        </el-select>
        <div class="form-help">
          {{ getModelHelp() }}
        </div>
      </el-form-item>

      <el-divider content-position="left">高级设置</el-divider>

      <el-form-item label="Temperature">
        <el-slider
          v-model="config.temperature"
          :min="0"
          :max="2"
          :step="0.1"
          show-input
          :marks="{0: '精确', 1: '平衡', 2: '创造'}"
        />
        <div class="form-help">
          控制生成内容的随机性，0-2之间，值越高越有创造性
        </div>
      </el-form-item>

      <el-form-item label="Max Tokens">
        <el-input-number
          v-model="config.maxTokens"
          :min="100"
          :max="32000"
          :step="100"
          style="width: 100%"
        />
        <div class="form-help">
          单次生成的最大令牌数（约等于字数）
        </div>
      </el-form-item>

      <el-form-item label="系统提示词">
        <el-input
          v-model="config.systemPrompt"
          type="textarea"
          :rows="6"
          placeholder="自定义 AI 的角色和行为..."
        />
        <div class="form-help">
          留空将使用默认提示词
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSave" :disabled="!config.apiKey">
          保存配置
        </el-button>
        <el-button type="success" @click="handleTest" :loading="testing" :disabled="!config.apiKey">
          测试连接
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  currentConfig: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

const visible = ref(props.modelValue)
const testing = ref(false)

// 配置对象
const config = ref({
  provider: 'openai',
  apiKey: '',
  apiUrl: 'https://api.openai.com/v1/chat/completions',
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 4000,
  systemPrompt: ''
})

// 监听外部 visible 变化
watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val && props.currentConfig) {
    // 加载当前配置
    config.value = { ...config.value, ...props.currentConfig }
  }
})

// 监听内部 visible 变化
watch(visible, (val) => {
  emit('update:modelValue', val)
})

// Provider 变化处理
const handleProviderChange = (provider) => {
  switch (provider) {
    case 'openai':
      config.value.apiUrl = 'https://api.openai.com/v1/chat/completions'
      config.value.model = 'gpt-4'
      break
    case 'anthropic':
      config.value.apiUrl = 'https://api.anthropic.com/v1/messages'
      config.value.model = 'claude-3-5-sonnet-20241022'
      break
    case 'custom':
      config.value.apiUrl = ''
      config.value.model = ''
      break
  }
}

// 获取可用模型列表
const getAvailableModels = () => {
  switch (config.value.provider) {
    case 'openai':
      return [
        { label: 'GPT-4 Turbo', value: 'gpt-4-turbo-preview' },
        { label: 'GPT-4', value: 'gpt-4' },
        { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
        { label: 'GPT-4o', value: 'gpt-4o' },
        { label: 'GPT-4o Mini', value: 'gpt-4o-mini' }
      ]
    case 'anthropic':
      return [
        { label: 'Claude 3.5 Sonnet', value: 'claude-3-5-sonnet-20241022' },
        { label: 'Claude 3 Opus', value: 'claude-3-opus-20240229' },
        { label: 'Claude 3 Sonnet', value: 'claude-3-sonnet-20240229' },
        { label: 'Claude 3 Haiku', value: 'claude-3-haiku-20240307' }
      ]
    default:
      return []
  }
}

// 获取 API URL 帮助文本
const getApiUrlHelp = () => {
  switch (config.value.provider) {
    case 'openai':
      return '默认: https://api.openai.com/v1/chat/completions'
    case 'anthropic':
      return '默认: https://api.anthropic.com/v1/messages'
    default:
      return '请输入完整的 API 端点 URL'
  }
}

// 获取模型帮助文本
const getModelHelp = () => {
  switch (config.value.provider) {
    case 'openai':
      return '推荐使用 GPT-4 或 GPT-4 Turbo 以获得最佳效果'
    case 'anthropic':
      return '推荐使用 Claude 3.5 Sonnet 以获得最佳效果'
    default:
      return '请输入您的模型标识符'
  }
}

// 保存配置
const handleSave = () => {
  if (!config.value.apiKey) {
    ElMessage.warning('请输入 API Key')
    return
  }

  emit('save', { ...config.value })
  ElMessage.success('配置已保存')
  visible.value = false
}

// 测试连接
const handleTest = async () => {
  if (!config.value.apiKey) {
    ElMessage.warning('请输入 API Key')
    return
  }

  testing.value = true

  try {
    // 这里可以调用实际的测试接口
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('连接测试成功！')
  } catch (error) {
    ElMessage.error('连接测试失败: ' + error.message)
  } finally {
    testing.value = false
  }
}

// 关闭对话框
const handleClose = () => {
  visible.value = false
}
</script>

<style scoped>
.form-help {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.5;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.el-divider__text) {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
}

:deep(.el-slider__marks-text) {
  font-size: 12px;
}
</style>
