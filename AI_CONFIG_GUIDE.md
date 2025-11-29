# AI 配置指南

## 功能说明

现在你的微信文章生成器已经支持灵活的 AI 配置功能：

### 1. 编辑器自动高度调整

- **VditorEditor** 组件现在会根据内容自动调整高度
- 当生成的内容很长时，编辑器会自动扩展显示所有内容
- 最小高度为 400px，确保编辑体验舒适

### 2. AI 配置管理

在文章生成控制台右上角，点击"AI 配置"按钮，可以配置以下内容：

#### 基础配置

- **API Provider**: 选择 AI 服务提供商
  - OpenAI（GPT 系列）
  - Anthropic Claude（Claude 系列）
  - 自定义（支持任何兼容的 API）

- **API Key**: 你的 API 密钥
  - 密钥会安全地存储在浏览器本地
  - 支持密码显示/隐藏

- **API URL**: API 端点地址
  - 自动根据 Provider 填充默认值
  - 支持自定义端点（如使用代理或本地服务）

- **模型选择**: 选择或输入模型名称
  - OpenAI: GPT-4, GPT-4 Turbo, GPT-3.5 等
  - Anthropic: Claude 3.5 Sonnet, Claude 3 Opus 等
  - 支持手动输入其他模型

#### 高级设置

- **Temperature** (0-2): 控制生成内容的随机性
  - 0: 最精确、最确定性的输出
  - 1: 平衡的输出（推荐）
  - 2: 最有创造性的输出

- **Max Tokens** (100-32000): 单次生成的最大令牌数
  - 约等于生成的字数
  - 推荐 4000 以上以支持长文生成

- **系统提示词**: 自定义 AI 的角色和行为
  - 留空使用默认的微信文章写作助手提示词
  - 可以根据需要定制 AI 的写作风格和要求

## 使用示例

### OpenAI 配置示例

```
Provider: OpenAI
API Key: sk-xxx...
API URL: https://api.openai.com/v1/chat/completions
Model: gpt-4
Temperature: 0.7
Max Tokens: 4000
```

### Claude 配置示例

```
Provider: Anthropic Claude
API Key: sk-ant-xxx...
API URL: https://api.anthropic.com/v1/messages
Model: claude-3-5-sonnet-20241022
Temperature: 0.7
Max Tokens: 4000
```

### 自定义代理示例

```
Provider: 自定义
API Key: 你的密钥
API URL: https://your-proxy.com/v1/chat/completions
Model: gpt-4
Temperature: 0.7
Max Tokens: 4000
```

## 配置存储

- 所有配置都保存在浏览器的 localStorage 中
- 刷新页面后配置仍然有效
- 可以随时修改配置
- API Key 安全地存储在本地，不会上传到服务器

## 测试连接

在配置对话框中点击"测试连接"按钮，可以验证配置是否正确。

## 注意事项

1. **API Key 安全**:
   - API Key 只存储在你的浏览器中
   - 不要在公共电脑上保存 API Key
   - 定期更换 API Key

2. **费用控制**:
   - 注意 Max Tokens 设置，避免单次生成消耗过多 token
   - 长文章建议使用续写功能，分段生成

3. **模型选择**:
   - GPT-4 质量最高，但成本较高
   - GPT-3.5 性价比高，适合大量生成
   - Claude 3.5 Sonnet 综合能力强，推荐使用

## 环境变量备用方案

如果不想使用配置界面，仍然可以通过环境变量设置默认值：

创建 `.env` 文件：

```env
VITE_AI_API_KEY=your-api-key
VITE_AI_API_URL=https://api.openai.com/v1/chat/completions
VITE_AI_MODEL=gpt-4
```

启动应用时会使用这些默认值。

## 故障排查

1. **生成失败**: 检查 API Key 是否正确，API URL 是否可访问
2. **连接超时**: 检查网络连接，或尝试使用代理
3. **响应错误**: 检查模型名称是否正确，账户是否有足够余额

## 更新日志

- ✅ 编辑器高度自动调整
- ✅ 支持多个 AI Provider
- ✅ 可视化配置界面
- ✅ 配置本地持久化
- ✅ 高级参数调整
- ✅ 自定义系统提示词
