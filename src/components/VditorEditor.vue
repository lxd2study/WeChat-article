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
let originalContent = '' // 保存原始内容（包含完整base64）

// 将base64图片替换为简短占位符（仅用于显示）
const collapseBase64Images = (content) => {
  if (!content) return content

  // 匹配 markdown 图片语法中的 base64
  return content.replace(/!\[([^\]]*)\]\(data:image\/([^;]+);base64,([^\)]{50})[^\)]+\)/g,
    (match, alt, imageType, base64Start) => {
      // 替换为简短的占位符，但保留图片语法
      return `![${alt}](data:image/${imageType};base64,${base64Start}...[base64-collapsed])`
    }
  )
}

// 恢复完整的base64图片（用于保存和导出）
const expandBase64Images = (displayContent) => {
  // 直接返回原始内容，因为我们保存了完整版本
  return originalContent || displayContent
}

onMounted(() => {
  // 计算实际高度
  const actualHeight = props.height === 'auto'
    ? '100%'
    : (typeof props.height === 'number' ? `${props.height}px` : props.height)

  // 保存原始内容
  originalContent = props.modelValue

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
    customWysiwygToolbar: (toolbar) => {
      // 返回默认工具栏，不做任何修改
      return toolbar
    },
    after: () => {
      emit('ready', vditor)
      // 设置初始内容后调整高度
      if (props.height === 'auto') {
        adjustEditorHeight()
      }

      // 监听编辑器模式切换，在源码模式下处理base64显示
      setupBase64Handler()
    },
    input: (value) => {
      // 保存完整的原始内容
      originalContent = value
      // 发送给父组件的也是完整内容
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

// 设置base64图片处理
const setupBase64Handler = () => {
  if (!vditor || !editorRef.value) return

  // 使用 MutationObserver 监听DOM变化，检测模式切换
  const observer = new MutationObserver(() => {
    processBase64InSourceMode()
  })

  observer.observe(editorRef.value, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class']
  })

  // 初始处理一次
  processBase64InSourceMode()
}

// 在源码模式下处理base64显示
const processBase64InSourceMode = () => {
  if (!editorRef.value) return

  const textarea = editorRef.value.querySelector('.vditor-sv__textarea')
  if (!textarea) return

  // 如果是源码模式，添加自定义处理
  const content = textarea.value
  if (content && content.includes('data:image')) {
    // 使用 CSS 类来标记包含 base64 的行
    textarea.classList.add('has-base64-images')
  } else {
    textarea.classList.remove('has-base64-images')
  }
}

// 监听外部值变化
watch(() => props.modelValue, (newValue) => {
  if (vditor && vditor.getValue() !== newValue) {
    // 保存原始内容
    originalContent = newValue
    vditor.setValue(newValue)
    // 内容变化后调整高度
    if (props.height === 'auto') {
      setTimeout(() => adjustEditorHeight(), 100)
    }
  }
})

// 暴露方法供父组件调用
const getValue = () => {
  // 返回完整的原始内容
  return originalContent || (vditor ? vditor.getValue() : '')
}

// 获取完整内容用于保存或导出
const getFullValue = () => {
  // 返回完整的原始内容（包含完整base64）
  return originalContent || (vditor ? vditor.getValue() : '')
}

const setValue = (value) => {
  if (vditor) {
    // 保存原始内容
    originalContent = value
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
  getFullValue,
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

/* 隐藏base64图片的长字符串 */
/* 在即时渲染(IR)模式下，折叠图片链接中的base64部分 */
:deep(.vditor-ir__marker--link) {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
  vertical-align: bottom;
}

/* 在源码编辑模式下折叠base64 */
:deep(.vditor-sv .vditor-sv__textarea) {
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 13px;
}

/* 使用 content-visibility 优化包含 base64 的行的渲染 */
:deep(.vditor-sv__textarea.has-base64-images) {
  line-height: 1.8;
  word-break: break-all;
}

/* 在预览区域折叠base64字符串 */
:deep(.vditor-preview pre code) {
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 300px;
  overflow-y: auto;
}

/* 使用伪元素隐藏base64的方式 - 针对预览面板中的代码块 */
:deep(.vditor-preview code) {
  max-width: 100%;
  overflow-x: auto;
  display: inline-block;
}

/* 分屏预览时，源码区域的样式优化 */
:deep(.vditor--preview .vditor-sv__textarea) {
  font-size: 12px;
  line-height: 1.5;
}

/* 当存在 data:image 时，在源码视图中添加视觉提示 */
:deep(.vditor-sv__textarea.has-base64-images) {
  background: linear-gradient(to right, #f9f9f9 0%, #ffffff 100%);
}

/* Wysiwyg和IR模式下图片正常显示 */
:deep(.vditor-wysiwyg img[src^="data:image"]),
:deep(.vditor-ir img[src^="data:image"]) {
  max-width: 100%;
  height: auto;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 4px;
  background: #fff;
}

/* 预览区域的图片样式 */
:deep(.vditor-preview img[src^="data:image"]) {
  max-width: 100%;
  height: auto;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 4px;
  background: #fff;
}
</style>
