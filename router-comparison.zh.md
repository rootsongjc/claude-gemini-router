# 路由器对比：y-router 与 claude-gemini-router

## 概览对比

| 方面 | y-router | claude-gemini-router |
|--------|----------|---------------------|
| **项目名称** | claude-gemini-router | claude-gemini-router |
| **包名** | claude-gemini-router | claude-gemini-router |
| **仓库地址** | https://github.com/rootsongjc/claude-gemini-router | https://github.com/rootsongjc/claude-gemini-router |
| **作者** | luohy15 | Jimmy Song |
| **许可证** | MIT | Apache 2.0 |
| **版本** | 1.0.0 | 1.0.0 |

## 目的与功能

| 方面 | y-router | claude-gemini-router |
|--------|----------|---------------------|
| **描述** | 一个简单的代理，使 Claude Code 能够与 OpenRouter 配合使用 | 一个 Cloudflare Worker，将 Claude Code 请求路由到 Google Gemini API |
| **目标 API** | OpenRouter (兼容 OpenAI 的 API) | Google Gemini API |
| **主要用例** | Anthropic 的 Claude API 与兼容 OpenAI 的 API 之间的转换 | Anthropic 的 Claude API 与 Google Gemini API 之间的转换 |
| **API 格式转换** | Anthropic → OpenAI 格式 | Anthropic → Google Gemini 格式 |

## 技术配置

| 方面 | y-router | claude-gemini-router |
|--------|----------|---------------------|
| **平台** | Cloudflare Workers | Cloudflare Workers |
| **主入口点** | index.ts | src/index.ts |
| **兼容日期** | 2025-05-30 | 2023-12-01 |
| **TypeScript** | ✅ | ✅ |

## 默认模型值

| 方面 | y-router | claude-gemini-router |
|--------|----------|---------------------|
| **默认模型** | 未指定（使用 OpenRouter 模型） | gemini-2.5-flash |
| **模型示例** | - claude-sonnet-4-20250514<br>- moonshotai/kimi-k2<br>- google/gemini-2.5-flash<br>- moonshot-v1-8k | - gemini-2.5-flash |
| **模型来源** | OpenRouter 目录 | Google Gemini |

## 安装/部署命令

| 方面 | y-router | claude-gemini-router |
|--------|----------|---------------------|
| **快速安装** | 手动部署 | 手动部署 |
| **开发** | `npm run dev` 或 `wrangler dev` | `npm run dev` 或 `wrangler dev` |
| **部署** | `npm run deploy` 或 `wrangler deploy` | `npm run deploy` 或 `wrangler deploy` |
| **先决条件** | Node.js, Wrangler CLI | Node.js, Wrangler CLI |

## 环境变量

| 方面 | y-router | claude-gemini-router |
|--------|----------|---------------------|
| **API 密钥** | 使用 OpenRouter API 密钥作为 `ANTHROPIC_API_KEY` | `GEMINI_API_KEY` |
| **基础 URL** | `OPENROUTER_BASE_URL` (可选，默认为 https://openrouter.ai/api/v1) | 不适用 |
| **模型配置** | `ANTHROPIC_MODEL`, `ANTHROPIC_SMALL_FAST_MODEL` | `GEMINI_MODEL` |
| **API 端点** | `ANTHROPIC_BASE_URL` | 不适用 |

## 示例端点

| 方面 | y-router | claude-gemini-router |
|--------|----------|---------------------|
| **主端点** | `/v1/messages` | `/v1/messages` |
| **示例域名** | cgr.jimmysong.io | cgr.jimmysong.io |
| **请求格式** | Anthropic API 格式 | Anthropic API 格式 |
| **响应格式** | Anthropic API 格式 | Anthropic API 格式 |

## 配置示例

### claude-gemini-router 配置

```toml
# wrangler.toml
name = "claude-gemini-router"
main = "src/index.ts"
compatibility_date = "2023-12-01"

routes = [
  { pattern = "cgr.jimmysong.io", custom_domain = true }
]

# Default environment variables
[vars]
GEMINI_MODEL = "gemini-2.5-flash"

# Enable logging
[observability]
enabled = true
head_sampling_rate = 1
```

## API 使用示例

### claude-gemini-router

```bash
curl -X POST https://cgr.jimmysong.io/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{
    "model": "gemini-2.5-flash",
    "messages": [{"role": "user", "content": "Hello, Claude"}],
    "max_tokens": 100
  }'
```

## 主要区别

1. **目标 API**：y-router 专注于 OpenRouter/兼容 OpenAI 的 API，而 claude-gemini-router 专注于 Google Gemini
2. **模型选择**：y-router 通过 OpenRouter 提供对多个提供商模型的访问，claude-gemini-router 专注于 Gemini 模型
3. **设置复杂性**：y-router 提供一键安装脚本，claude-gemini-router 需要手动部署
4. **环境变量**：不同的命名约定和要求
5. **默认模型**：y-router 使用各种 OpenRouter 模型，claude-gemini-router 默认为 gemini-2.5-flash
6. **域名示例**：y-router 使用 cc.yovy.app，claude-gemini-router 使用 cgr.jimmysong.io

## 测试与开发

| 方面 | y-router | claude-gemini-router |
|--------|----------|---------------------|
| **测试** | 未指定 | Jest 及测试脚本 |
| **测试脚本** | 不适用 | `npm run test`, `npm run test:integration`, `npm run test:all`, `npm run test:watch` |
| **开发依赖** | 基本 | @types/jest, @types/node-fetch, jest, node-fetch, ts-jest, typescript |
