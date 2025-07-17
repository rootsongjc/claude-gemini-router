# 多 Worker 部署指南

本指南详细说明如何部署多个 Worker 实例来支持不同的 Gemini 模型。

## 方法 1：使用不同的 Worker 名称

### 步骤 1：创建基础配置文件

保持原始的 `wrangler.toml` 文件作为模板。

### 步骤 2：部署快速模型 Worker

```bash
# 部署快速模型 Worker
wrangler deploy --name claude-gemini-flash

# 设置 API 密钥
wrangler secret put GEMINI_API_KEY --name claude-gemini-flash

# 设置模型环境变量
wrangler secret put GEMINI_MODEL --name claude-gemini-flash
# 当提示时输入: gemini-2.5-flash
```

### 步骤 3：部署专业模型 Worker

```bash
# 部署专业模型 Worker
wrangler deploy --name claude-gemini-pro

# 设置 API 密钥
wrangler secret put GEMINI_API_KEY --name claude-gemini-pro

# 设置模型环境变量
wrangler secret put GEMINI_MODEL --name claude-gemini-pro
# 当提示时输入: gemini-2.5-pro
```

### 步骤 4：配置 Shell 别名

在 `~/.zshrc` 或 `~/.bashrc` 中添加：

```bash
# 快速模型别名
alias claude-flash='ANTHROPIC_BASE_URL="https://claude-gemini-flash.your-subdomain.workers.dev" ANTHROPIC_API_KEY="$GEMINI_API_KEY" claude'

# 专业模型别名
alias claude-pro='ANTHROPIC_BASE_URL="https://claude-gemini-pro.your-subdomain.workers.dev" ANTHROPIC_API_KEY="$GEMINI_API_KEY" claude'
```

## 方法 2：使用环境配置

### 步骤 1：修改 wrangler.toml

```toml
name = "claude-gemini-router"
main = "src/index.ts"
compatibility_date = "2023-12-01"

[vars]
GEMINI_MODEL = "gemini-2.5-flash"

[env.flash.vars]
GEMINI_MODEL = "gemini-2.5-flash"

[env.pro.vars]
GEMINI_MODEL = "gemini-2.5-pro"

[env.flash15.vars]
GEMINI_MODEL = "gemini-1.5-flash"
```

### 步骤 2：部署不同环境

```bash
# 部署快速模型环境
wrangler deploy --env flash
wrangler secret put GEMINI_API_KEY --env flash

# 部署专业模型环境
wrangler deploy --env pro
wrangler secret put GEMINI_API_KEY --env pro

# 部署 1.5 flash 环境
wrangler deploy --env flash15
wrangler secret put GEMINI_API_KEY --env flash15
```

### 步骤 3：配置 Shell 别名

```bash
# 不同模型的别名
alias claude-flash='ANTHROPIC_BASE_URL="https://claude-gemini-router-flash.your-subdomain.workers.dev" ANTHROPIC_API_KEY="$GEMINI_API_KEY" claude'
alias claude-pro='ANTHROPIC_BASE_URL="https://claude-gemini-router-pro.your-subdomain.workers.dev" ANTHROPIC_API_KEY="$GEMINI_API_KEY" claude'
alias claude-flash15='ANTHROPIC_BASE_URL="https://claude-gemini-router-flash15.your-subdomain.workers.dev" ANTHROPIC_API_KEY="$GEMINI_API_KEY" claude'
```

## 方法 3：单个 Worker + 请求时指定模型（推荐）

### 最简单的方法：

1. 只部署一个 Worker
2. 在 API 请求中指定模型

```bash
# 测试不同模型
curl -X POST https://cgr.jimmysong.io/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: $GEMINI_API_KEY" \
  -d '{
    "model": "gemini-1.5-flash",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

**注意：** Claude Code 的环境变量如 `ANTHROPIC_MODEL` 对 Worker 端的模型选择没有影响。

## 验证部署

### 测试快速模型：
```bash
curl -X POST https://claude-gemini-flash.your-subdomain.workers.dev/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: $GEMINI_API_KEY" \
  -d '{"messages": [{"role": "user", "content": "What model are you?"}]}' | \
  python3 -c "import sys, json; print(json.load(sys.stdin)['model'])"
```

### 测试专业模型：
```bash
curl -X POST https://claude-gemini-pro.your-subdomain.workers.dev/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: $GEMINI_API_KEY" \
  -d '{"messages": [{"role": "user", "content": "What model are you?"}]}' | \
  python3 -c "import sys, json; print(json.load(sys.stdin)['model'])"
```

## 关于 Claude Code 环境变量的澄清

### 这些环境变量 **不会** 影响 Worker 的行为：

```bash
# 这些对 Worker 没有影响
export ANTHROPIC_MODEL="gemini-1.5-flash"
export ANTHROPIC_SMALL_FAST_MODEL="gemini-1.5-flash"
```

### 模型选择的实际优先级：

1. **API 请求中的 `model` 参数** (最高优先级)
2. **Worker 的 `GEMINI_MODEL` 环境变量** (fallback)
3. **系统默认** (`gemini-2.5-flash`)

### 推荐配置：

```bash
# ~/.zshrc 或 ~/.bashrc
export ANTHROPIC_BASE_URL="https://cgr.jimmysong.io"
export ANTHROPIC_API_KEY="$GEMINI_API_KEY"

# 用于不同模型的别名
alias claude-flash='ANTHROPIC_BASE_URL="https://claude-gemini-flash.your-subdomain.workers.dev" ANTHROPIC_API_KEY="$GEMINI_API_KEY" claude'
alias claude-pro='ANTHROPIC_BASE_URL="https://claude-gemini-pro.your-subdomain.workers.dev" ANTHROPIC_API_KEY="$GEMINI_API_KEY" claude'
```
