# Router Comparison: y-router vs claude-gemini-router

## Overview Comparison

| Aspect | y-router | claude-gemini-router |
|--------|----------|---------------------|
| **Project Name** | claude-gemini-router | claude-gemini-router |
| **Package Name** | claude-gemini-router | claude-gemini-router |
| **Repository URL** | <https://github.com/rootsongjc/claude-gemini-router> | <https://github.com/rootsongjc/claude-gemini-router> |
| **Author** | luohy15 | Jimmy Song |
| **License** | MIT | Apache 2.0 |
| **Version** | 1.0.0 | 1.0.0 |

## Purpose & Functionality

| Aspect | y-router | claude-gemini-router |
|--------|----------|---------------------|
| **Description** | A Simple Proxy enabling Claude Code to work with OpenRouter | A Cloudflare Worker that routes Claude Code requests to Google Gemini API |
| **Target API** | OpenRouter (OpenAI-compatible APIs) | Google Gemini API |
| **Primary Use Case** | Translation between Anthropic's Claude API and OpenAI-compatible APIs | Translation between Anthropic's Claude API and Google Gemini API |
| **API Format Translation** | Anthropic → OpenAI format | Anthropic → Google Gemini format |

## Technical Configuration

| Aspect | y-router | claude-gemini-router |
|--------|----------|---------------------|
| **Platform** | Cloudflare Workers | Cloudflare Workers |
| **Main Entry Point** | index.ts | src/index.ts |
| **Compatibility Date** | 2025-05-30 | 2023-12-01 |
| **TypeScript** | ✅ | ✅ |

## Default Model Values

| Aspect | y-router | claude-gemini-router |
|--------|----------|---------------------|
| **Default Model** | Not specified (uses OpenRouter models) | gemini-2.5-flash |
| **Model Examples** | - claude-sonnet-4-20250514<br>- moonshotai/kimi-k2<br>- google/gemini-2.5-flash<br>- moonshot-v1-8k | - gemini-2.5-flash |
| **Model Source** | OpenRouter catalog | Google Gemini |

## Install/Deploy Commands

| Aspect | y-router | claude-gemini-router |
|--------|----------|---------------------|
| **Quick Install** | Manual deployment | Manual deployment |
| **Development** | `npm run dev` or `wrangler dev` | `npm run dev` or `wrangler dev` |
| **Deployment** | `npm run deploy` or `wrangler deploy` | `npm run deploy` or `wrangler deploy` |
| **Prerequisites** | Node.js, Wrangler CLI | Node.js, Wrangler CLI |

## Environment Variables

| Aspect | y-router | claude-gemini-router |
|--------|----------|---------------------|
| **API Key** | Uses OpenRouter API key as `ANTHROPIC_API_KEY` | `GEMINI_API_KEY` |
| **Base URL** | `OPENROUTER_BASE_URL` (optional, defaults to <https://openrouter.ai/api/v1>) | N/A |
| **Model Config** | `ANTHROPIC_MODEL`, `ANTHROPIC_SMALL_FAST_MODEL` | `GEMINI_MODEL` |
| **API Endpoint** | `ANTHROPIC_BASE_URL` | N/A |

## Example Endpoints

| Aspect | y-router | claude-gemini-router |
|--------|----------|---------------------|
| **Primary Endpoint** | `/v1/messages` | `/v1/messages` |
| **Example Domain** | cgr.jimmysong.io | cgr.jimmysong.io |
| **Request Format** | Anthropic API format | Anthropic API format |
| **Response Format** | Anthropic API format | Anthropic API format |

## Configuration Examples

### claude-gemini-router Configuration

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

## API Usage Examples

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

## Key Differences

1. **Target API**: y-router focuses on OpenRouter/OpenAI-compatible APIs, while claude-gemini-router targets Google Gemini
2. **Model Selection**: y-router offers access to multiple provider models through OpenRouter, claude-gemini-router focuses on Gemini models
3. **Setup Complexity**: y-router provides a one-line install script, claude-gemini-router requires manual deployment
4. **Environment Variables**: Different naming conventions and requirements
5. **Default Models**: y-router uses various OpenRouter models, claude-gemini-router defaults to gemini-2.5-flash
6. **Domain Examples**: y-router uses cc.yovy.app, claude-gemini-router uses cgr.jimmysong.io

## Testing & Development

| Aspect | y-router | claude-gemini-router |
|--------|----------|---------------------|
| **Testing** | Not specified | Jest with test scripts |
| **Test Scripts** | N/A | `npm run test`, `npm run test:integration`, `npm run test:all`, `npm run test:watch` |
| **Development Dependencies** | Basic | @types/jest, @types/node-fetch, jest, node-fetch, ts-jest, typescript |
