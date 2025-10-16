/**
 * 历史记录服务 - 管理文章生成历史
 */
class HistoryService {
  constructor() {
    this.storageKey = 'article_history'
    this.maxHistoryItems = 100 // 最多保存100条历史记录
  }

  /**
   * 获取所有历史记录
   * @returns {Array} 历史记录数组
   */
  getHistory() {
    try {
      const history = localStorage.getItem(this.storageKey)
      return history ? JSON.parse(history) : []
    } catch (error) {
      console.error('获取历史记录失败:', error)
      return []
    }
  }

  /**
   * 保存文章到历史记录
   * @param {Object} article - 文章信息
   */
  saveToHistory(article) {
    try {
      const history = this.getHistory()

      // 创建历史记录项
      const historyItem = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        topic: article.topic,
        content: article.content,
        style: article.style,
        length: article.length,
        targetAudience: article.targetAudience,
        keyPoints: article.keyPoints || [],
        additionalRequirements: article.additionalRequirements || '',
        wordCount: this.countWords(article.content),
        preview: this.generatePreview(article.content)
      }

      // 添加到历史记录开头
      history.unshift(historyItem)

      // 限制历史记录数量
      if (history.length > this.maxHistoryItems) {
        history.splice(this.maxHistoryItems)
      }

      // 保存到 localStorage
      localStorage.setItem(this.storageKey, JSON.stringify(history))

      return historyItem
    } catch (error) {
      console.error('保存历史记录失败:', error)
      throw error
    }
  }

  /**
   * 删除历史记录
   * @param {number} id - 历史记录ID
   */
  deleteHistory(id) {
    try {
      const history = this.getHistory()
      const filtered = history.filter(item => item.id !== id)
      localStorage.setItem(this.storageKey, JSON.stringify(filtered))
      return true
    } catch (error) {
      console.error('删除历史记录失败:', error)
      return false
    }
  }

  /**
   * 批量删除历史记录
   * @param {Array} ids - 历史记录ID数组
   */
  deleteMultiple(ids) {
    try {
      const history = this.getHistory()
      const filtered = history.filter(item => !ids.includes(item.id))
      localStorage.setItem(this.storageKey, JSON.stringify(filtered))
      return true
    } catch (error) {
      console.error('批量删除历史记录失败:', error)
      return false
    }
  }

  /**
   * 清空所有历史记录
   */
  clearHistory() {
    try {
      localStorage.removeItem(this.storageKey)
      return true
    } catch (error) {
      console.error('清空历史记录失败:', error)
      return false
    }
  }

  /**
   * 根据ID获取历史记录
   * @param {number} id - 历史记录ID
   */
  getHistoryById(id) {
    const history = this.getHistory()
    return history.find(item => item.id === id)
  }

  /**
   * 搜索历史记录
   * @param {string} keyword - 搜索关键词
   */
  searchHistory(keyword) {
    const history = this.getHistory()
    if (!keyword) return history

    const lowerKeyword = keyword.toLowerCase()
    return history.filter(item => {
      return (
        item.topic?.toLowerCase().includes(lowerKeyword) ||
        item.content?.toLowerCase().includes(lowerKeyword) ||
        item.preview?.toLowerCase().includes(lowerKeyword)
      )
    })
  }

  /**
   * 按条件筛选历史记录
   * @param {Object} filters - 筛选条件
   */
  filterHistory(filters = {}) {
    let history = this.getHistory()

    // 按风格筛选
    if (filters.style) {
      history = history.filter(item => item.style === filters.style)
    }

    // 按长度筛选
    if (filters.length) {
      history = history.filter(item => item.length === filters.length)
    }

    // 按日期范围筛选
    if (filters.startDate) {
      const startTime = new Date(filters.startDate).getTime()
      history = history.filter(item => new Date(item.timestamp).getTime() >= startTime)
    }

    if (filters.endDate) {
      const endTime = new Date(filters.endDate).getTime()
      history = history.filter(item => new Date(item.timestamp).getTime() <= endTime)
    }

    return history
  }

  /**
   * 导出历史记录
   */
  exportHistory() {
    const history = this.getHistory()
    return JSON.stringify(history, null, 2)
  }

  /**
   * 导入历史记录
   * @param {string} data - JSON格式的历史记录数据
   */
  importHistory(data) {
    try {
      const importedHistory = JSON.parse(data)

      if (!Array.isArray(importedHistory)) {
        throw new Error('数据格式不正确')
      }

      // 合并现有历史记录
      const currentHistory = this.getHistory()
      const mergedHistory = [...importedHistory, ...currentHistory]

      // 去重（根据timestamp和topic）
      const uniqueHistory = mergedHistory.reduce((acc, item) => {
        const exists = acc.find(h =>
          h.timestamp === item.timestamp && h.topic === item.topic
        )
        if (!exists) {
          acc.push(item)
        }
        return acc
      }, [])

      // 按时间排序并限制数量
      uniqueHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      if (uniqueHistory.length > this.maxHistoryItems) {
        uniqueHistory.splice(this.maxHistoryItems)
      }

      localStorage.setItem(this.storageKey, JSON.stringify(uniqueHistory))
      return true
    } catch (error) {
      console.error('导入历史记录失败:', error)
      throw error
    }
  }

  /**
   * 生成文章预览（前200个字符）
   * @param {string} content - 文章内容
   */
  generatePreview(content) {
    if (!content) return ''

    // 移除Markdown标记
    const plainText = content
      .replace(/[#*`>\-\[\]!]/g, '')
      .replace(/\n+/g, ' ')
      .trim()

    return plainText.length > 200
      ? plainText.substring(0, 200) + '...'
      : plainText
  }

  /**
   * 计算字数（中文按字符，英文按单词）
   * @param {string} content - 文章内容
   */
  countWords(content) {
    if (!content) return 0

    // 移除Markdown标记
    const plainText = content.replace(/[#*`>\-\[\]!]/g, '').trim()

    // 统计中文字符
    const chineseChars = plainText.match(/[\u4e00-\u9fa5]/g) || []

    // 统计英文单词
    const englishWords = plainText
      .replace(/[\u4e00-\u9fa5]/g, '')
      .match(/[a-zA-Z]+/g) || []

    return chineseChars.length + englishWords.length
  }

  /**
   * 获取统计信息
   */
  getStatistics() {
    const history = this.getHistory()

    return {
      totalArticles: history.length,
      totalWords: history.reduce((sum, item) => sum + (item.wordCount || 0), 0),
      styleDistribution: this.getStyleDistribution(history),
      lengthDistribution: this.getLengthDistribution(history),
      recentDays: this.getRecentDaysCount(history, 7)
    }
  }

  /**
   * 获取风格分布
   */
  getStyleDistribution(history) {
    const distribution = {}
    history.forEach(item => {
      if (item.style) {
        distribution[item.style] = (distribution[item.style] || 0) + 1
      }
    })
    return distribution
  }

  /**
   * 获取长度分布
   */
  getLengthDistribution(history) {
    const distribution = {}
    history.forEach(item => {
      if (item.length) {
        distribution[item.length] = (distribution[item.length] || 0) + 1
      }
    })
    return distribution
  }

  /**
   * 获取最近N天的文章数量
   */
  getRecentDaysCount(history, days) {
    const now = Date.now()
    const daysAgo = now - (days * 24 * 60 * 60 * 1000)
    return history.filter(item =>
      new Date(item.timestamp).getTime() >= daysAgo
    ).length
  }
}

// 创建单例实例
const historyService = new HistoryService()

export default historyService
