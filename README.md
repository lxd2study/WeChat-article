# AI微信公众号文章生成器

一个基于 Vue3 + Element Plus + Vditor 的智能文章生成工具，集成AI能力，支持对话记忆功能。

## 功能特点

### 核心功能
- **智能文章生成**：输入主题，AI自动生成高质量微信公众号文章
- **AI记忆功能**：AI会记住之前的对话内容，提供个性化服务
- **文章优化**：根据要求优化已生成的文章
- **文章续写**：智能续写文章内容，保持风格一致
- **实时编辑**：基于Vditor的所见即所得Markdown编辑器

### 高级功能
- **多种文章风格**：专业严谨、轻松活泼、幽默风趣等
- **可调文章长度**：短文、中篇、长文
- **目标读者设定**：针对特定人群优化内容
- **关键要点**：指定必须包含的内容要点
- **记忆导入导出**：保存和恢复AI对话记忆

## 技术栈

- **前端框架**：Vue 3 (Composition API)
- **UI组件库**：Element Plus
- **编辑器**：Vditor (Markdown所见即所得编辑器)
- **构建工具**：Vite
- **AI服务**：支持OpenAI API及兼容接口

## 快速开始

### 1. 安装依赖

```bash
cd wechat-article-generator
npm install
```

### 2. 配置AI API

复制 `.env.example` 文件为 `.env`：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的AI API配置：

```env
VITE_AI_API_KEY=your_api_key_here
VITE_AI_API_URL=https://api.openai.com/v1/chat/completions
VITE_AI_MODEL=gpt-4
```

支持的AI服务：
- OpenAI GPT-4/GPT-3.5
- Azure OpenAI
- 其他兼容OpenAI API的服务（如国内的通义千问、文心一言等）

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 即可使用。

### 4. 构建生产版本

```bash
npm run build
```

构建产物位于 `dist` 目录。

## 使用指南

### 基本使用流程

1. **输入文章主题**：在"文章主题"输入框中填写你想写的主题
2. **设置参数**（可选）：
   - 选择文章风格
   - 选择文章长度
   - 填写目标读者
   - 添加关键要点
   - 填写其他特殊要求
3. **生成文章**：点击"生成文章"按钮，AI将自动生成文章
4. **编辑和优化**：
   - 在编辑器中直接修改
   - 使用"优化文章"功能进行AI优化
   - 使用"续写文章"继续创作

### AI记忆功能

AI会自动记住：
- 你的写作偏好
- 之前的对话内容
- 特殊要求和风格

**记忆管理**：
- **清空记忆**：让AI忘记所有历史对话
- **导出记忆**：保存当前的对话记忆到JSON文件
- **导入记忆**：恢复之前保存的对话记忆

这样可以在不同会话之间保持AI的个性化服务。

### 文章管理

- **复制文章**：一键复制到剪贴板
- **下载文章**：保存为Markdown文件
- **实时预览**：所见即所得编辑

## 项目结构

```
wechat-article-generator/
├── src/
│   ├── components/          # Vue组件
│   │   ├── ArticleGenerator.vue   # 主界面组件
│   │   └── VditorEditor.vue       # Vditor编辑器封装
│   ├── services/            # 服务层
│   │   └── aiService.js     # AI服务和记忆管理
│   ├── utils/               # 工具函数
│   │   └── storage.js       # 本地存储工具
│   ├── styles/              # 样式文件
│   │   └── global.css       # 全局样式
│   ├── App.vue              # 根组件
│   └── main.js              # 入口文件
├── public/                  # 静态资源
├── index.html               # HTML模板
├── vite.config.js           # Vite配置
├── package.json             # 依赖配置
└── README.md                # 项目文档
```

## 核心代码说明

### AI服务 (aiService.js)

AI服务类提供以下功能：

- `generateArticle(topic, options)` - 生成文章
- `optimizeArticle(article, instruction)` - 优化文章
- `continueArticle(article)` - 续写文章
- `initConversation()` - 初始化对话
- `addUserMessage(message)` - 添加用户消息到记忆
- `addAssistantMessage(message)` - 添加AI回复到记忆
- `exportConversation()` - 导出对话记忆
- `importConversation(data)` - 导入对话记忆
- `clearConversation()` - 清空对话记忆

### Vditor编辑器组件

封装了Vditor编辑器，提供：

- 双向数据绑定 (v-model)
- 所见即所得模式
- 丰富的工具栏
- 字数统计
- 暴露的方法：`getValue()`, `setValue()`, `insertValue()`

## 常见问题

### 1. AI API调用失败

- 检查 `.env` 文件中的API密钥是否正确
- 确认API地址是否可访问
- 检查网络连接

### 2. 编辑器显示异常

- 确保Vditor的CSS文件正确加载
- 检查浏览器控制台是否有错误信息

### 3. 记忆功能不生效

- 确保没有禁用浏览器的localStorage
- 尝试清空浏览器缓存后重试

## 自定义和扩展

### 修改系统提示词

在 `src/services/aiService.js` 中修改 `systemPrompt` 变量，可以自定义AI的角色和行为。

### 添加新的文章风格

在 `src/components/ArticleGenerator.vue` 中的风格选择器中添加新选项。

### 集成其他AI服务

修改 `src/services/aiService.js` 中的API调用逻辑，适配不同的AI服务接口。

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request！

## 联系方式

如有问题或建议，请通过GitHub Issues联系。
