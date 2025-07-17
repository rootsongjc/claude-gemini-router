# Claude-Gemini-Router 测试指南

本指南说明了如何运行 Claude-Gemini-Router 集成的全面测试套件。

## 测试结构

测试套件分为三个主要类别：

### 1. 单元测试（格式化器）

- **位置**：`tests/formatters/`
- **目的**：使用示例载荷测试请求/响应格式化器
- **运行**：`npm test`

#### 测试覆盖

- ✅ **formatRequest.test.ts**：测试从 Anthropic 到 OpenAI 的请求格式化
- ✅ **formatRequestGemini.test.ts**：测试从 Anthropic 到 Gemini 的请求格式化  
- ✅ **formatResponse.test.ts**：测试从 OpenAI 到 Anthropic 的响应格式化
- ✅ **formatResponseGemini.test.ts**：测试从 Gemini 到 Anthropic 的响应格式化

### 2. 集成测试

- **位置**：`tests/integration/`
- **目的**：测试使用 Gemini API 的实际 Worker，包括流式和非流式请求
- **运行**：`npm run test:integration`

#### 先决条件

1. 启动开发服务器：`wrangler dev`
2. 设置环境变量：`export GEMINI_API_KEY=your_api_key`

#### 测试覆盖

- ✅ **非流式请求**：简单消息、系统消息、工具调用
- ✅ **流式请求**：流式文本、流式工具调用
- ✅ **错误处理**：无效模型、格式错误请求
- ✅ **Worker 端点**：索引页、404 处理

### 3. 工具调用验证测试

- **目的**：验证工具调用场景并确保正确的格式化
- **覆盖**：完整工具调用序列、不完整工具调用、多重工具调用

## 运行测试

### 运行所有测试

```bash
npm run test:all
```

### 仅运行单元测试

```bash
npm test
```

### 仅运行集成测试

```bash
# 先决条件：启动 wrangler dev 并设置 GEMINI_API_KEY
wrangler dev &
export GEMINI_API_KEY=your_api_key
npm run test:integration
```

### 以监视模式运行测试

```bash
npm run test:watch
```

## 测试结果摘要

### 单元测试 ✅

- **总测试数**：54 个通过
- **测试套件**：4 个通过
- **覆盖范围**：使用全面示例载荷的请求/响应格式化器

### 集成测试 🔄

- **先决条件**：需要运行 `wrangler dev` 和有效的 `GEMINI_API_KEY`
- **测试场景**：
  - 非流式请求
  - 流式请求
  - 工具调用验证
  - 错误处理
  - Worker 端点验证

## 测试的示例载荷

### 简单消息

```json
{
  "model": "claude-3-haiku-20240307",
  "messages": [
    {
      "role": "user", 
      "content": "Hello, how are you today?"
    }
  ],
  "temperature": 0.7
}
```

### 系统消息

```json
{
  "model": "claude-3-sonnet-20240229",
  "messages": [
    {
      "role": "user",
      "content": "What is the weather like?"
    }
  ],
  "system": "You are a helpful weather assistant.",
  "temperature": 0.3
}
```

### 工具调用

```json
{
  "model": "claude-3-sonnet-20240229",
  "messages": [
    {
      "role": "user",
      "content": "What's the weather like in New York?"
    }
  ],
  "tools": [
    {
      "name": "get_weather",
      "description": "Get the current weather in a given location",
      "input_schema": {
        "type": "object",
        "properties": {
          "location": {
            "type": "string",
            "description": "The city and state, e.g. San Francisco, CA"
          }
        },
        "required": ["location"]
      }
    }
  ]
}
```

### 流式请求

```json
{
  "model": "claude-3-haiku-20240307",
  "messages": [
    {
      "role": "user",
      "content": "Tell me a short story"
    }
  ],
  "stream": true
}
```

## 测试验证

### 回归测试 ✅

- **模型映射**：Anthropic 和 Gemini 模型之间的正确映射
- **请求格式化**：将 Anthropic 请求正确转换为 Gemini 格式
- **响应格式化**：将 Gemini 响应正确转换为 Anthropic 格式
- **工具调用验证**：正确处理 tool_calls 和 tool_results
- **流式传输**：为流式响应生成正确的 SSE 事件

### 工具调用场景 ✅

- **完整工具调用**：与匹配工具结果的工具调用
- **不完整工具调用**：没有匹配结果的工具调用（已过滤）
- **多重工具调用**：多个同时工具调用
- **混合内容**：同一响应中的文本和工具调用

## 故障排除

### 常见问题

1. **集成测试失败**：确保 `wrangler dev` 正在运行且 `GEMINI_API_KEY` 已设置
2. **测试超时**：为慢速 API 响应增加超时时间
3. **类型错误**：确保使用 `npm install` 安装了所有依赖项

### 调试模式

```bash
# 以详细输出运行测试
npm test -- --verbose

# 运行特定测试文件
npm test -- formatRequest.test.ts
```

## 下一步

成功运行测试后：

1. ✅ 单元测试验证格式化器逻辑
2. ✅ 集成测试验证端到端功能
3. ✅ 工具调用场景得到正确处理
4. ✅ 流式和非流式都正常工作

测试套件为 Claude-Gemini-Router 集成提供了全面的覆盖，确保与 Google Gemini API 后端的可靠操作。
