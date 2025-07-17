# claude-gemini-router

> **注意：** 本文档为中文版本，英文版本请参考 [README.md](README.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange?style=flat&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)

一个运行在 Cloudflare Worker 上的 API 转换器，可以在 Anthropic 的 Claude API 和 Google Gemini API 之间进行转换，让您能够在 Claude Code 中使用 Google 的 Gemini 模型。

## 快速使用

### 手动设置

**第 1 步：** 安装 Claude Code

```bash
npm install -g @anthropic-ai/claude-code
```

**第 2 步：** 从 [Google AI Studio](https://makersuite.google.com/app/apikey) 获取 Google Gemini API 密钥

**第 3 步：** 在您的 shell 配置文件中配置环境变量（`~/.bashrc` 或 `~/.zshrc`）：

```bash
# 对于快速测试，您可以使用我们的共享实例。日常使用建议部署自己的实例以获得更好的可靠性。
export ANTHROPIC_BASE_URL="https://cgr.jimmysong.io"
export ANTHROPIC_API_KEY="$GEMINI_API_KEY"
```

**可选：** 配置特定模型：

```bash
export ANTHROPIC_MODEL="gemini-2.5-pro"
export ANTHROPIC_SMALL_FAST_MODEL="gemini-2.5-flash"
```

**第 4 步：** 重新加载您的 shell 并运行 Claude Code：

```bash
source ~/.bashrc
claude
```

就这样！Claude Code 现在将通过 claude-gemini-router 使用 Google Gemini 模型。

### 多种配置

要为不同的提供商或模型维护多个 Claude Code 配置，请使用 shell 别名：

```bash
# 不同配置的示例别名
alias c1='ANTHROPIC_BASE_URL="https://cgr.jimmysong.io" ANTHROPIC_API_KEY="your-gemini-key" ANTHROPIC_MODEL="gemini-2.5-flash" claude'
alias c2='ANTHROPIC_BASE_URL="https://api.anthropic.com" ANTHROPIC_API_KEY="your-anthropic-key" claude'
```

将这些别名添加到您的 shell 配置文件（`~/.bashrc` 或 `~/.zshrc`）中，然后使用 `c1` 或 `c2` 在配置之间切换。

## GitHub Actions 使用

要在 GitHub Actions 工作流中使用 Claude Code，请将环境变量添加到您的工作流中：

```yaml
env:
  ANTHROPIC_BASE_URL: ${{ secrets.ANTHROPIC_BASE_URL }}
```

在您的仓库密钥中将 `ANTHROPIC_BASE_URL` 设置为 `https://cgr.jimmysong.io`。

示例工作流可用于 GitHub Actions 集成。

## 功能说明

claude-gemini-router 作为一个转换层，具有以下功能：

- 接受 Anthropic API 格式的请求（`/v1/messages`）
- 将其转换为 Google Gemini API 格式
- 转发到 Google Gemini API
- 将响应转换回 Anthropic 格式
- 支持流式和非流式响应

## 完美适配 Claude Code + Google Gemini

这使您能够将 [Claude Code](https://claude.ai/code) 与 Google 的 Gemini 模型一起使用，通过：

1. 将 Claude Code 指向您的 claude-gemini-router 部署
2. 使用您的 Google Gemini API 密钥
3. 通过 Claude Code 的界面访问 Gemini 模型

## 设置

1. **克隆并部署：**

   ```bash
   git clone https://github.com/rootsongjc/claude-gemini-router
   cd claude-gemini-router
   npm install
   npm install -g wrangler
   wrangler deploy
   ```

2. **设置环境变量：**

   ```bash
   # 必需：Google Gemini API 密钥
   wrangler secret put GEMINI_API_KEY
   ```

3. **配置 Claude Code：**
   - 将 API 端点设置为您部署的 Worker URL
   - 使用您的 Google Gemini API 密钥
   - 享受通过 Claude Code 访问 Gemini 模型的体验！

## 环境变量

- `GEMINI_API_KEY`（必需）：您的 Google Gemini API 密钥
- `GEMINI_MODEL`（可选）：要使用的默认模型。默认为 `gemini-2.5-flash`

## 支持的模型

## 免费额度限制

| 模型 | 每分钟请求数 (RPM) | 每分钟令牌数 (TPM) | 每天请求数 (RPD) |
|------|-------------------|-------------------|-----------------|
| **文本输出模型** |
| `gemini-2.5-pro` | 5 | 250,000 | 100 |
| `gemini-2.5-flash` | 10 | 250,000 | 250 |
| `gemini-2.5-flash-lite` | 15 | 250,000 | 1,000 |
| `gemini-2.0-flash` | 15 | 1,000,000 | 200 |
| `gemini-2.0-flash-lite` | 30 | 1,000,000 | 200 |

> 以上为 Google Gemini API 免费层级的使用限制，详情请参阅[官方文档](https://ai.google.dev/gemini-api/docs/rate-limits?utm_source=chatgpt.com#free-tier)

## API 使用

使用 Anthropic 格式向 `/v1/messages` 发送请求：

```bash
curl -X POST https://cgr.jimmysong.io/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: $GEMINI_API_KEY" \
  -d '{
    "model": "gemini-2.5-flash",
    "messages": [{"role": "user", "content": "Hello, Claude"}],
    "max_tokens": 100
  }'
```

## 开发

```bash
npm run dev    # 启动开发服务器
npm run deploy # 部署到 Cloudflare Workers
```

## 测试

```bash
npm run test              # 运行单元测试
npm run test:integration  # 运行集成测试
npm run test:all          # 运行所有测试
npm run test:watch        # 在监视模式下运行测试
```

## 配置

项目使用 `wrangler.toml` 进行配置：

```toml
name = "claude-gemini-router"
main = "src/index.ts"
compatibility_date = "2023-12-01"

[vars]
GEMINI_MODEL = "gemini-2.5-flash"
```

## 致谢

特别感谢以下项目对 claude-gemini-router 的启发：

- [y-router](https://github.com/luohy15/y-router)
- [claude-code-router](https://github.com/musistudio/claude-code-router)
- [claude-code-proxy](https://github.com/kiyo-e/claude-code-proxy)

## 免责声明

**重要法律声明：**

- **第三方工具**：claude-gemini-router 是一个独立的、非官方工具，未得到 Anthropic PBC 或 Google LLC 的关联、认可或支持
- **服务条款**：用户有责任确保遵守所有相关方（Anthropic、Google 和任何其他 API 提供商）的服务条款
- **API 密钥责任**：用户必须使用自己的有效 API 密钥，并对与这些密钥相关的任何使用、成本或违规行为承担全部责任
- **无担保**：本软件按"原样"提供，不提供任何担保。作者不对因使用本软件而产生的任何损害、服务中断或法律问题负责
- **数据隐私**：虽然 claude-gemini-router 不会有意存储用户数据，但用户应查看所有连接服务的隐私政策
- **合规性**：用户有责任确保其使用符合其管辖区域内的适用法律法规
- **商业使用**：任何商业使用都应根据相关服务条款和许可要求进行仔细评估

**使用风险自负。**

## 许可证

Apache 2.0
