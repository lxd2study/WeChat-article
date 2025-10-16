<template>
  <div ref="editorRef" class="vditor-wrapper"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import Vditor from 'vditor'
import 'vditor/dist/index.css'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  height: {
    type: [String, Number],
    default: 'auto'
  },
  minHeight: {
    type: String,
    default: '300px'
  }
})

const emit = defineEmits(['update:modelValue', 'ready'])

const editorRef = ref(null)
let vditor = null

onMounted(() => {
  // 计算实际高度
  const actualHeight = props.height === 'auto'
    ? '100%'
    : (typeof props.height === 'number' ? `${props.height}px` : props.height)

  vditor = new Vditor(editorRef.value, {
    height: actualHeight,
    minHeight: props.minHeight,
    theme: 'classic',
    mode: 'wysiwyg', // 所见即所得模式
    placeholder: '请输入文章内容，支持Markdown格式...',
    value: props.modelValue,
    cache: {
      enable: false
    },
    toolbar: [
      'headings',
      'bold',
      'italic',
      'strike',
      '|',
      'line',
      'quote',
      'list',
      'ordered-list',
      'check',
      '|',
      'code',
      'inline-code',
      'link',
      'table',
      '|',
      'undo',
      'redo',
      '|',
      'edit-mode',
      'preview',
      'fullscreen',
      'outline'
    ],
    counter: {
      enable: true,
      type: 'text'
    },
    after: () => {
      emit('ready', vditor)
      // 设置初始内容后调整高度
      if (props.height === 'auto') {
        adjustEditorHeight()
      }
    },
    input: (value) => {
      emit('update:modelValue', value)
      // 内容变化时自动调整高度
      if (props.height === 'auto') {
        adjustEditorHeight()
      }
    },
    resize: {
      enable: true
    }
  })
})

// 自动调整编辑器高度
const adjustEditorHeight = () => {
  if (!vditor || !editorRef.value) return

  // 获取编辑器容器
  const vditorElement = editorRef.value.querySelector('.vditor')
  if (!vditorElement) return

  // 获取内容区域
  const contentElement = vditorElement.querySelector('.vditor-content')
  if (!contentElement) return

  // 获取实际内容区域（wysiwyg 模式）
  const wysiwygElement = contentElement.querySelector('.vditor-wysiwyg')
  if (!wysiwygElement) return

  // 获取工具栏高度
  const toolbar = vditorElement.querySelector('.vditor-toolbar')
  const toolbarHeight = toolbar ? toolbar.offsetHeight : 0

  // 获取底部信息栏高度
  const footer = vditorElement.querySelector('.vditor-counter')
  const footerHeight = footer ? footer.offsetHeight : 0

  // 计算内容实际高度
  const contentHeight = wysiwygElement.scrollHeight

  // 计算最小高度（去掉 px 单位）
  const minHeightValue = parseInt(props.minHeight) || 300

  // 计算总高度：工具栏 + 内容 + 底部信息栏 + 额外间距
  const totalHeight = Math.max(
    toolbarHeight + contentHeight + footerHeight + 40,
    minHeightValue
  )

  // 设置编辑器高度
  vditorElement.style.height = `${totalHeight}px`
}

// 监听外部值变化
watch(() => props.modelValue, (newValue) => {
  if (vditor && vditor.getValue() !== newValue) {
    vditor.setValue(newValue)
    // 内容变化后调整高度
    if (props.height === 'auto') {
      setTimeout(() => adjustEditorHeight(), 100)
    }
  }
})

// 暴露方法供父组件调用
const getValue = () => {
  return vditor ? vditor.getValue() : ''
}

const setValue = (value) => {
  if (vditor) {
    vditor.setValue(value)
  }
}

const insertValue = (value) => {
  if (vditor) {
    vditor.insertValue(value)
  }
}

defineExpose({
  getValue,
  setValue,
  insertValue,
  vditor
})

onBeforeUnmount(() => {
  if (vditor) {
    vditor.destroy()
  }
})
</script>

<style scoped>
.vditor-wrapper {
  border-radius: 8px;
  overflow: visible;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  min-height: 400px;
}

:deep(.vditor) {
  border: none;
  display: flex;
  flex-direction: column;
}

:deep(.vditor-toolbar) {
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
}

:deep(.vditor-content) {
  background-color: #fff;
  min-height: 300px;
}

/* 自适应容器 */
:deep(.vditor-content .vditor-ir),
:deep(.vditor-content .vditor-wysiwyg),
:deep(.vditor-content .vditor-sv) {
  min-height: 300px;
}
</style>
