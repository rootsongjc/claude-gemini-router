# 环境变量

[English](./ENVIRONMENT_VARIABLES.md) | [中文](./ENVIRONMENT_VARIABLES.zh.md)

本文档描述了 claude-gemini-router 使用的环境变量。

## 必需变量

### GEMINI_API_KEY
- **描述**: 你的 Google Gemini API 密钥
- **必需**: 是
- **类型**: 字符串（机密）
- **示例**: `AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **获取方式**: 从 [Google AI Studio](https://makersuite.google.com/app/apikey) 获取
- **配置方式**: 通过 `wrangler secret put GEMINI_API_KEY` 设置

## 可选变量

### GEMINI_MODEL（主要模型配置）
- **描述**: **这是配置路由器使用哪个 Gemini 模型的主要方式。** 当请求中未指定模型时使用的默认 Gemini 模型
- **必需**: 否
- **类型**: 字符串
- **默认值**: `gemini-2.5-flash`
- **支持的值**:
  - `gemini-2.5-flash` - 最新快速模型（推荐）
  - `gemini-2.5-pro` - 高性能模型
  - `gemini-1.5-flash` - 快速模型
- **配置方式**: 在 `wrangler.toml` 的 `[vars]` 部分设置
- **重要**: 这个 Worker 端配置控制模型选择，而不是本地 shell 环境变量

## 配置方法

### 1. Cloudflare Workers 机密（推荐用于 API 密钥）

对于 API 密钥等敏感数据，使用 Wrangler 机密：

```bash
# 安全地设置 API 密钥
wrangler secret put GEMINI_API_KEY
```

### 2. wrangler.toml 中的环境变量

对于非敏感配置，使用 `wrangler.toml` 中的 `[vars]` 部分：

```toml
[vars]
GEMINI_MODEL = "gemini-2.5-flash"
```

### 3. 环境特定配置

你可以为不同环境设置不同的值：

```toml
# 默认/开发环境
[vars]
GEMINI_MODEL = "gemini-2.5-flash"

# 生产环境
[env.production.vars]
GEMINI_MODEL = "gemini-2.5-pro"
```

## Claude Code 集成的环境变量

当使用 claude-gemini-router 与 Claude Code 集成时，请在你的 shell 中配置这些环境变量：

### ANTHROPIC_BASE_URL
- **描述**: 指向你的 claude-gemini-router 部署的基础 URL
- **必需**: 是（用于 Claude Code 集成）
- **类型**: 字符串
- **示例**: `https://cgr.jimmysong.io` 或 `https://your-worker.your-subdomain.workers.dev`
- **配置方式**: 在你的 shell 配置文件中设置（`~/.bashrc` 或 `~/.zshrc`）

### ANTHROPIC_API_KEY
- **描述**: 你的 Google Gemini API 密钥（与 GEMINI_API_KEY 相同）
- **必需**: 是（用于 Claude Code 集成）
- **类型**: 字符串
- **示例**: `AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **配置方式**: 在你的 shell 配置文件中设置（`~/.bashrc` 或 `~/.zshrc`）

### 模型选择

**重要**: 模型选择由 Worker 端的 `GEMINI_MODEL` 环境变量控制（在 `wrangler.toml` 中配置）。本地 shell 环境变量如 `ANTHROPIC_MODEL` 不会影响使用哪个模型 - 它们会被 claude-gemini-router 忽略。

要更改路由器使用的模型，请更新 Worker 配置中的 `GEMINI_MODEL` 变量（参见上面的"可选变量"部分）。

## 配置示例

### 基本 Shell 配置

添加到你的 `~/.bashrc` 或 `~/.zshrc`：

```bash
# 基本配置
export ANTHROPIC_BASE_URL="https://cgr.jimmysong.io"
export ANTHROPIC_API_KEY="$GEMINI_API_KEY"

# 注意：模型选择由 Worker 配置中的 GEMINI_MODEL 控制，
# 而不是本地 shell 环境变量
```

### 多环境别名

```bash
# 通过 claude-gemini-router 使用 Gemini 的别名
# 注意：模型选择由 Worker 配置中的 GEMINI_MODEL 控制
alias claude-gemini='ANTHROPIC_BASE_URL="https://cgr.jimmysong.io" ANTHROPIC_API_KEY="your-gemini-key" claude'

# 官方 Anthropic API 的别名
alias claude-official='ANTHROPIC_BASE_URL="https://api.anthropic.com" ANTHROPIC_API_KEY="your-anthropic-key" claude'

# 使用不同 Worker 部署的不同模型
alias claude-fast='ANTHROPIC_BASE_URL="https://claude-gemini-fast.your-subdomain.workers.dev" ANTHROPIC_API_KEY="your-gemini-key" claude'
alias claude-pro='ANTHROPIC_BASE_URL="https://claude-gemini-pro.your-subdomain.workers.dev" ANTHROPIC_API_KEY="your-gemini-key" claude'
```

### 为不同模型部署多个 Worker

要有效使用不同的 Gemini 模型，请部署不同的 Worker 而不是依赖 shell 变量：

**方法 1：命名部署**

```bash
# 为不同模型部署不同的 Worker
wrangler deploy --name claude-gemini-fast
wrangler deploy --name claude-gemini-pro

# 为每个部署设置 API 密钥
wrangler secret put GEMINI_API_KEY --name claude-gemini-fast
wrangler secret put GEMINI_API_KEY --name claude-gemini-pro
```

**方法 2：基于环境的部署**

```bash
# 部署到不同环境
wrangler deploy --env fast
wrangler deploy --env pro
```

使用 `wrangler.toml` 配置：

```toml
[env.fast.vars]
GEMINI_MODEL = "gemini-2.5-flash"

[env.pro.vars]
GEMINI_MODEL = "gemini-2.5-pro"
```

### GitHub Actions 配置

在你的 GitHub Actions 工作流中：

```yaml
env:
  ANTHROPIC_BASE_URL: ${{ secrets.ANTHROPIC_BASE_URL }}
  ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

在你的仓库中设置这些机密：
- `ANTHROPIC_BASE_URL`: 你的 claude-gemini-router 部署 URL
- `ANTHROPIC_API_KEY`: 你的 Google Gemini API 密钥

## 安全最佳实践

1. **永远不要将 API 密钥提交到版本控制中**
2. **在 Workers 中使用 Wrangler 机密存储敏感数据**
3. **本地开发使用环境变量或 shell 配置**
4. **GitHub Actions 使用仓库机密**
5. **定期轮换你的 API 密钥**
6. **检查 API 密钥权限和使用限制**

## 故障排除

### 常见问题

1. **API 密钥不工作**: 确保你的 Google Gemini API 密钥有效且具有必要的权限
2. **找不到模型**: 检查模型名称是否正确拼写且受支持
3. **Worker 无法启动**: 验证所有必需的环境变量是否已设置
4. **Claude Code 无法连接**: 确保 ANTHROPIC_BASE_URL 指向你已部署的 Worker

### 调试环境变量

要验证你的环境变量是否正确设置：

```bash
# 检查 shell 环境
echo $ANTHROPIC_BASE_URL
echo $ANTHROPIC_API_KEY

# 检查 Worker 环境（在开发中）
wrangler dev --local
```

## 相关文档

- [README.md](./README.md) - 主要项目文档
- [wrangler.toml](./wrangler.toml) - Worker 配置文件
- [Google AI Studio](https://makersuite.google.com/app/apikey) - 获取 API 密钥
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/) - 平台文档
