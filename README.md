# claude-gemini-router

[简体中文](README.zh.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange?style=flat&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)

A Cloudflare Worker that translates between Anthropic's Claude API and Google Gemini API, enabling you to use Claude Code with Google's Gemini models.

## Quick Usage

### Manual Setup

**Step 1:** Install Claude Code

```bash
npm install -g @anthropic-ai/claude-code
```

**Step 2:** Get Google Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

**Step 3:** Configure environment variables in your shell config (`~/.bashrc` or `~/.zshrc`):

```bash
# For quick testing, you can use our shared instance. For daily use, deploy your own instance for better reliability.
export ANTHROPIC_BASE_URL="https://cgr.jimmysong.io"
export ANTHROPIC_API_KEY="$GEMINI_API_KEY"
```

**Step 4:** Reload your shell and run Claude Code:

```bash
source ~/.bashrc
claude
```

That's it! Claude Code will now use Google Gemini models through claude-gemini-router.

### Multiple Configurations

To maintain multiple Claude Code configurations for different providers, use shell aliases:

```bash
# Example aliases for different configurations
alias claude-gemini='ANTHROPIC_BASE_URL="https://cgr.jimmysong.io" ANTHROPIC_API_KEY="your-gemini-key" claude'
alias claude-official='ANTHROPIC_BASE_URL="https://api.anthropic.com" ANTHROPIC_API_KEY="your-anthropic-key" claude'
```

Add these aliases to your shell config file (`~/.bashrc` or `~/.zshrc`), then use `claude-gemini` or `claude-official` to switch between configurations.

#### Using Different Models with Separate Workers

To use different Gemini models, deploy separate Workers with different configurations instead of relying on shell variables:

**Option 1: Multiple Worker Deployments**

```bash
# Deploy worker for fast model
wrangler deploy --name claude-gemini-fast
wrangler secret put GEMINI_API_KEY --name claude-gemini-fast

# Deploy worker for pro model  
wrangler deploy --name claude-gemini-pro
wrangler secret put GEMINI_API_KEY --name claude-gemini-pro
```

Then configure different `wrangler.toml` files or use environment-specific configurations:

```toml
# For the fast worker
[vars]
GEMINI_MODEL = "gemini-2.5-flash"

# For the pro worker
[vars]
GEMINI_MODEL = "gemini-2.5-pro"
```

**Option 2: Environment-Based Deployment**

```bash
# Deploy to different environments
wrangler deploy --env fast
wrangler deploy --env pro
```

With corresponding `wrangler.toml` configuration:

```toml
[env.fast.vars]
GEMINI_MODEL = "gemini-2.5-flash"

[env.pro.vars]
GEMINI_MODEL = "gemini-2.5-pro"
```

Then use aliases to point to different deployments:

```bash
# Aliases for different model deployments
alias claude-fast='ANTHROPIC_BASE_URL="https://claude-gemini-fast.your-subdomain.workers.dev" ANTHROPIC_API_KEY="your-gemini-key" claude'
alias claude-pro='ANTHROPIC_BASE_URL="https://claude-gemini-pro.your-subdomain.workers.dev" ANTHROPIC_API_KEY="your-gemini-key" claude'
```

## GitHub Actions Usage

To use Claude Code in GitHub Actions workflows, add the environment variable to your workflow:

```yaml
env:
  ANTHROPIC_BASE_URL: ${{ secrets.ANTHROPIC_BASE_URL }}
```

Set `ANTHROPIC_BASE_URL` to `https://cgr.jimmysong.io` in your repository secrets.

Example workflows are available for GitHub Actions integration.

## What it does

claude-gemini-router acts as a translation layer that:

- Accepts requests in Anthropic's API format (`/v1/messages`)
- Converts them to Google Gemini's API format
- Forwards to Google Gemini API
- Translates the response back to Anthropic's format
- Supports both streaming and non-streaming responses

## Perfect for Claude Code + Google Gemini

This allows you to use [Claude Code](https://claude.ai/code) with Google's Gemini models by:

1. Pointing Claude Code to your claude-gemini-router deployment
2. Using your Google Gemini API key
3. Accessing Gemini models through Claude Code's interface

## Setup

1. **Clone and deploy:**

   ```bash
   git clone https://github.com/rootsongjc/claude-gemini-router
   cd claude-gemini-router
   npm install
   npm install -g wrangler
   wrangler deploy
   ```

2. **Set environment variables:**

   ```bash
   # Required: Google Gemini API key
   wrangler secret put GEMINI_API_KEY
   ```

3. **Configure Claude Code:**
   - Set API endpoint to your deployed Worker URL
   - Use your Google Gemini API key
   - Enjoy access to Gemini models via Claude Code!

## Environment Variables

- `GEMINI_API_KEY` (required): Your Google Gemini API key
- `GEMINI_MODEL` (optional): Default model to use. Defaults to `gemini-2.5-flash`

## Supported Models

| Model Name | Description |
|------------|-------------|
| `gemini-2.5-flash` | Latest fast model (default) |
| `gemini-2.5-pro` | High-performance model |
| `gemini-1.5-flash` | Fast model |

## Model Selection

**The claude-gemini-router supports two valid methods for selecting the Gemini model to use:**

1. **Cloudflare Worker Environment Variable**: The `GEMINI_MODEL` environment variable can be set in your `wrangler.toml` configuration file under the `[vars]` section or as a Cloudflare secret. This variable is intended to serve as a fallback default model, though the current implementation primarily relies on the automatic mapping mechanism below.

2. **Automatic Model Mapping**: The `mapModelToGemini()` function automatically translates Anthropic model names sent by the client into appropriate Gemini model equivalents. When a client sends model names containing "haiku", "sonnet", or "opus", the router intelligently maps them to corresponding Gemini models ("gemini-2.5-flash" for haiku, "gemini-2.5-pro" for sonnet/opus). If the model name already contains a forward slash, it's passed through unchanged. For unrecognized models, it defaults to "gemini-2.5-flash".

**Important**: The client-side `ANTHROPIC_MODEL` environment variable has **no server-side effect** on model selection within the worker itself. While it may be used by client applications (like Claude Code) to specify which model name to send in requests, the actual model selection is handled exclusively by the server-side `mapModelToGemini()` function. This client-side variable should not be advertised as a way to control server-side model selection, as it has no impact on the worker's behavior.

## API Usage

Send requests to `/v1/messages` using Anthropic's format:

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

## Development

```bash
npm run dev    # Start development server
npm run deploy # Deploy to Cloudflare Workers
```

## Testing

```bash
npm run test              # Run unit tests
npm run test:integration  # Run integration tests
npm run test:all          # Run all tests
npm run test:watch        # Run tests in watch mode
```

## Configuration

The project uses `wrangler.toml` for configuration:

```toml
name = "claude-gemini-router"
main = "src/index.ts"
compatibility_date = "2023-12-01"

[vars]
GEMINI_MODEL = "gemini-2.5-flash"
```

## Thanks

Special thanks to these projects that inspired claude-gemini-router:

- [y-router](https://github.com/luohy15/y-router)
- [claude-code-router](https://github.com/musistudio/claude-code-router)
- [claude-code-proxy](https://github.com/kiyo-e/claude-code-proxy)

## Disclaimer

**Important Legal Notice:**

- **Third-party Tool**: claude-gemini-router is an independent, unofficial tool and is not affiliated with, endorsed by, or supported by Anthropic PBC or Google LLC
- **Service Terms**: Users are responsible for ensuring compliance with the Terms of Service of all involved parties (Anthropic, Google, and any other API providers)
- **API Key Responsibility**: Users must use their own valid API keys and are solely responsible for any usage, costs, or violations associated with those keys
- **No Warranty**: This software is provided "as is" without any warranties. The authors are not responsible for any damages, service interruptions, or legal issues arising from its use
- **Data Privacy**: While claude-gemini-router does not intentionally store user data, users should review the privacy policies of all connected services
- **Compliance**: Users are responsible for ensuring their use complies with applicable laws and regulations in their jurisdiction
- **Commercial Use**: Any commercial use should be carefully evaluated against relevant terms of service and licensing requirements

**Use at your own risk and discretion.**

## License

Apache 2.0
