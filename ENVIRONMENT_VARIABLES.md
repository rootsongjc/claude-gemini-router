# Environment Variables

[English](./ENVIRONMENT_VARIABLES.md) | [中文](./ENVIRONMENT_VARIABLES.zh.md)

This document describes the environment variables used by claude-gemini-router.

## Required Variables

### GEMINI_API_KEY
- **Description**: Your Google Gemini API key
- **Required**: Yes
- **Type**: String (Secret)
- **Example**: `AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **How to obtain**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
- **Configuration**: Set via `wrangler secret put GEMINI_API_KEY`

## Optional Variables

### GEMINI_MODEL (Model Selection Fallback)
- **Description**: Default model to use when no model is specified in requests. Acts as a fallback.
- **Required**: No
- **Type**: String
- **Default**: `gemini-2.5-flash`
- **Supported values**:
  - `gemini-2.5-flash` - Latest fast model (recommended)
  - `gemini-2.5-pro` - High-performance model
  - `gemini-1.5-flash` - Fast model
- **Configuration**: Set in `wrangler.toml` under `[vars]` section
- **Notes**: Request `model` parameter takes precedence. This configuration serves as a fallback.
- **Important**: This worker-side configuration controls model selection along with request parameters, not local shell environment variables.

## Configuration Methods

### 1. Cloudflare Workers Secrets (Recommended for API Keys)

For sensitive data like API keys, use Wrangler secrets:

```bash
# Set the API key securely
wrangler secret put GEMINI_API_KEY
```

### 2. Environment Variables in wrangler.toml

For non-sensitive configuration, use the `[vars]` section in `wrangler.toml`:

```toml
[vars]
GEMINI_MODEL = "gemini-2.5-flash"
```

### 3. Environment-specific Configuration

You can set different values for different environments:

```toml
# Default/development environment
[vars]
GEMINI_MODEL = "gemini-2.5-flash"

# Production environment
[env.production.vars]
GEMINI_MODEL = "gemini-2.5-pro"
```

## Environment Variables for Claude Code Integration

When using claude-gemini-router with Claude Code, configure these environment variables in your shell:

### ANTHROPIC_BASE_URL
- **Description**: Base URL pointing to your claude-gemini-router deployment
- **Required**: Yes (for Claude Code integration)
- **Type**: String
- **Example**: `https://cgr.jimmysong.io` or `https://your-worker.your-subdomain.workers.dev`
- **Configuration**: Set in your shell config (`~/.bashrc` or `~/.zshrc`)

### ANTHROPIC_API_KEY
- **Description**: Your Google Gemini API key (same as GEMINI_API_KEY)
- **Required**: Yes (for Claude Code integration)
- **Type**: String
- **Example**: `AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Configuration**: Set in your shell config (`~/.bashrc` or `~/.zshrc`)

### Model Selection Priority

**The router uses the following priority order for model selection:**

1. **Request Model Parameter** (Highest Priority): The `model` field in API requests
2. **Environment Variable Fallback**: The `GEMINI_MODEL` worker environment variable (configured in `wrangler.toml`)
3. **System Default**: `gemini-2.5-flash` if neither is specified

**Important**: Local shell environment variables like `ANTHROPIC_MODEL` do not affect which model is used - they are ignored by the claude-gemini-router. The router prioritizes the `model` field in requests over worker environment variables.

To use a specific model, either:
- Specify it in the request: `{"model": "gemini-1.5-flash"}`
- Set the `GEMINI_MODEL` variable in your worker configuration as a fallback default

## Example Configurations

### Basic Shell Configuration

Add to your `~/.bashrc` or `~/.zshrc`:

```bash
# Basic configuration
export ANTHROPIC_BASE_URL="https://cgr.jimmysong.io"
export ANTHROPIC_API_KEY="$GEMINI_API_KEY"

# Note: Model selection is controlled by GEMINI_MODEL in your worker configuration,
# not by local shell environment variables
```

### Multiple Environment Aliases

```bash
# Alias for Gemini via claude-gemini-router
# Note: Model selection is controlled by GEMINI_MODEL in your worker configuration
alias claude-gemini='ANTHROPIC_BASE_URL="https://cgr.jimmysong.io" ANTHROPIC_API_KEY="your-gemini-key" claude'

# Alias for official Anthropic API
alias claude-official='ANTHROPIC_BASE_URL="https://api.anthropic.com" ANTHROPIC_API_KEY="your-anthropic-key" claude'

# For different models using separate worker deployments
alias claude-fast='ANTHROPIC_BASE_URL="https://claude-gemini-fast.your-subdomain.workers.dev" ANTHROPIC_API_KEY="your-gemini-key" claude'
alias claude-pro='ANTHROPIC_BASE_URL="https://claude-gemini-pro.your-subdomain.workers.dev" ANTHROPIC_API_KEY="your-gemini-key" claude'
```

### Deploying Multiple Workers for Different Models

To use different Gemini models effectively, deploy separate Workers instead of relying on shell variables:

**Method 1: Named Deployments**

```bash
# Deploy separate workers for different models
wrangler deploy --name claude-gemini-fast
wrangler deploy --name claude-gemini-pro

# Set API keys for each deployment
wrangler secret put GEMINI_API_KEY --name claude-gemini-fast
wrangler secret put GEMINI_API_KEY --name claude-gemini-pro
```

**Method 2: Environment-Based Deployments**

```bash
# Deploy to different environments
wrangler deploy --env fast
wrangler deploy --env pro
```

With `wrangler.toml` configuration:

```toml
[env.fast.vars]
GEMINI_MODEL = "gemini-2.5-flash"

[env.pro.vars]
GEMINI_MODEL = "gemini-2.5-pro"
```

### GitHub Actions Configuration

In your GitHub Actions workflow:

```yaml
env:
  ANTHROPIC_BASE_URL: ${{ secrets.ANTHROPIC_BASE_URL }}
  ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

Set these secrets in your repository:
- `ANTHROPIC_BASE_URL`: Your claude-gemini-router deployment URL
- `ANTHROPIC_API_KEY`: Your Google Gemini API key

## Security Best Practices

1. **Never commit API keys to version control**
2. **Use Wrangler secrets for sensitive data in Workers**
3. **Use environment variables or shell config for local development**
4. **Use repository secrets for GitHub Actions**
5. **Regularly rotate your API keys**
6. **Review API key permissions and usage limits**

## Troubleshooting

### Common Issues

1. **API Key not working**: Ensure your Google Gemini API key is valid and has the necessary permissions
2. **Model not found**: Check that the model name is correctly spelled and supported
3. **Worker not starting**: Verify that all required environment variables are set
4. **Claude Code not connecting**: Ensure ANTHROPIC_BASE_URL points to your deployed Worker

### Debug Environment Variables

To verify your environment variables are set correctly:

```bash
# Check shell environment
echo $ANTHROPIC_BASE_URL
echo $ANTHROPIC_API_KEY

# Check Worker environment (in development)
wrangler dev --local
```

## Related Documentation

- [README.md](./README.md) - Main project documentation
- [wrangler.toml](./wrangler.toml) - Worker configuration file
- [Google AI Studio](https://makersuite.google.com/app/apikey) - Get API key
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/) - Platform documentation
