import axios from 'axios'

/**
 * AI服务类 - 负责与AI API交互和管理对话记忆
 */
class AIService {
  constructor() {
    // 默认配置
    this.defaultConfig = {
      provider: 'openai',
      apiKey: import.meta.env.VITE_AI_API_KEY || '',
      apiUrl: import.meta.env.VITE_AI_API_URL || 'https://api.openai.com/v1/chat/completions',
      model: import.meta.env.VITE_AI_MODEL || 'gpt-4',
      temperature: 0.7,
      maxTokens: 4000,
      systemPrompt: ''
    }

    // 从 localStorage 加载配置
    this.loadConfig()

    // 对话记忆存储
    this.conversationHistory = []

    // 默认系统提示词 - 定义AI的角色和行为
    this.defaultSystemPrompt = `你是一个专业的微信公众号文章写作助手。你的任务是：
1. 根据用户提供的主题生成高质量的微信公众号文章
2. 文章应该具有吸引力的标题、清晰的结构、生动的语言
3. 内容要符合微信公众号的阅读习惯，包含适当的emoji和排版
4. 文章长度适中，通常1500-3000字
5. 可以包含小标题、要点列表、引用等元素
6. 语言风格要亲切、专业，易于理解
7. 记住之前的对话内容，保持上下文连贯性

请始终记住用户的偏好和之前讨论的内容，提供个性化的写作服务。`
  }

  /**
   * 从 localStorage 加载配置
   */
  loadConfig() {
    try {
      const savedConfig = localStorage.getItem('ai_config')
      if (savedConfig) {
        this.config = { ...this.defaultConfig, ...JSON.parse(savedConfig) }
      } else {
        this.config = { ...this.defaultConfig }
      }
    } catch (error) {
      console.error('加载配置失败:', error)
      this.config = { ...this.defaultConfig }
    }
  }

  /**
   * 保存配置到 localStorage
   */
  saveConfig() {
    try {
      localStorage.setItem('ai_config', JSON.stringify(this.config))
    } catch (error) {
      console.error('保存配置失败:', error)
    }
  }

  /**
   * 获取当前配置
   */
  getConfig() {
    return { ...this.config }
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig }
    this.saveConfig()
    // 配置更新后重新初始化对话
    this.initConversation()
  }

  /**
   * 获取系统提示词
   */
  getSystemPrompt() {
    return this.config.systemPrompt || this.defaultSystemPrompt
  }

  /**
   * 初始化对话记忆
   */
  initConversation() {
    this.conversationHistory = [
      {
        role: 'system',
        content: this.getSystemPrompt()
      }
    ]
  }

  /**
   * 添加用户消息到记忆
   */
  addUserMessage(message) {
    this.conversationHistory.push({
      role: 'user',
      content: message
    })
  }

  /**
   * 添加AI回复到记忆
   */
  addAssistantMessage(message) {
    this.conversationHistory.push({
      role: 'assistant',
      content: message
    })
  }

  /**
   * 获取对话历史
   */
  getConversationHistory() {
    return this.conversationHistory
  }

  /**
   * 清空对话记忆
   */
  clearConversation() {
    this.initConversation()
  }

  /**
   * 导出对话记忆（用于保存）
   */
  exportConversation() {
    return JSON.stringify(this.conversationHistory)
  }

  /**
   * 导入对话记忆（用于恢复）
   */
  importConversation(conversationData) {
    try {
      this.conversationHistory = JSON.parse(conversationData)
    } catch (error) {
      console.error('导入对话记忆失败:', error)
      this.initConversation()
    }
  }

  /**
   * 生成文章
   * @param {string} topic - 文章主题
   * @param {object} options - 生成选项
   * @returns {Promise<string>} - 生成的文章内容
   */
  async generateArticle(topic, options = {}) {
    if (!this.config.apiKey) {
      throw new Error('请先配置AI API密钥')
    }

    // 构建提示词
    let prompt = `请为我写一篇关于"${topic}"的微信公众号文章。`

    if (options.style) {
      prompt += `\n文章风格：${options.style}`
    }

    if (options.length) {
      prompt += `\n文章长度：${options.length}`
    }

    if (options.targetAudience) {
      prompt += `\n目标读者：${options.targetAudience}`
    }

    if (options.keyPoints && options.keyPoints.length > 0) {
      prompt += `\n需要包含的要点：${options.keyPoints.join('、')}`
    }

    if (options.additionalRequirements) {
      prompt += `\n其他要求：${options.additionalRequirements}`
    }

    // 添加用户消息到记忆
    this.addUserMessage(prompt)

    try {
      const response = await axios.post(
        this.config.apiUrl,
        {
          model: this.config.model,
          messages: this.conversationHistory,
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`
          }
        }
      )

      const articleContent = response.data.choices[0].message.content

      // 添加AI回复到记忆
      this.addAssistantMessage(articleContent)

      return articleContent
    } catch (error) {
      console.error('AI生成文章失败:', error)
      throw new Error(`AI生成失败: ${error.response?.data?.error?.message || error.message}`)
    }
  }

  /**
   * 优化文章
   * @param {string} article - 原始文章
   * @param {string} instruction - 优化指令
   * @returns {Promise<string>} - 优化后的文章
   */
  async optimizeArticle(article, instruction) {
    const prompt = `请根据以下要求优化这篇文章：\n\n要求：${instruction}\n\n原文章：\n${article}`

    this.addUserMessage(prompt)

    try {
      const response = await axios.post(
        this.config.apiUrl,
        {
          model: this.config.model,
          messages: this.conversationHistory,
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`
          }
        }
      )

      const optimizedContent = response.data.choices[0].message.content
      this.addAssistantMessage(optimizedContent)

      return optimizedContent
    } catch (error) {
      console.error('AI优化文章失败:', error)
      throw new Error(`AI优化失败: ${error.response?.data?.error?.message || error.message}`)
    }
  }

  /**
   * 续写文章
   * @param {string} article - 当前文章内容
   * @returns {Promise<string>} - 续写的内容
   */
  async continueArticle(article) {
    const prompt = `请继续写下面这篇文章，保持风格一致：\n\n${article}`

    this.addUserMessage(prompt)

    try {
      const response = await axios.post(
        this.config.apiUrl,
        {
          model: this.config.model,
          messages: this.conversationHistory,
          temperature: this.config.temperature,
          max_tokens: Math.floor(this.config.maxTokens / 2) // 续写使用一半的tokens
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`
          }
        }
      )

      const continuedContent = response.data.choices[0].message.content
      this.addAssistantMessage(continuedContent)

      return continuedContent
    } catch (error) {
      console.error('AI续写文章失败:', error)
      throw new Error(`AI续写失败: ${error.response?.data?.error?.message || error.message}`)
    }
  }
}

// 创建单例实例
const aiService = new AIService()
aiService.initConversation()

export default aiService
