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

### GEMINI_MODEL
- **Description**: Default Gemini model to use when no model is specified in requests
- **Required**: No
- **Type**: String
- **Default**: `gemini-2.5-flash`
- **Supported values**:
  - `gemini-2.5-flash` - Latest fast model (recommended)
  - `gemini-1.5-pro` - High-performance model
  - `gemini-1.5-flash` - Fast model
- **Configuration**: Set in `wrangler.toml` under `[vars]` section

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
GEMINI_MODEL = "gemini-1.5-pro"
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

### ANTHROPIC_MODEL
- **Description**: Default model for Claude Code to use
- **Required**: No
- **Type**: String
- **Default**: Uses the GEMINI_MODEL value from your Worker
- **Example**: `gemini-2.5-flash`
- **Configuration**: Set in your shell config (`~/.bashrc` or `~/.zshrc`)

### ANTHROPIC_SMALL_FAST_MODEL
- **Description**: Small/fast model for Claude Code to use for quick operations
- **Required**: No
- **Type**: String
- **Default**: Uses the GEMINI_MODEL value from your Worker
- **Example**: `gemini-2.5-flash`
- **Configuration**: Set in your shell config (`~/.bashrc` or `~/.zshrc`)

## Example Configurations

### Basic Shell Configuration

Add to your `~/.bashrc` or `~/.zshrc`:

```bash
# Basic configuration
export ANTHROPIC_BASE_URL="https://cgr.jimmysong.io"
export ANTHROPIC_API_KEY="$GEMINI_API_KEY"

# Optional: specify models
export ANTHROPIC_MODEL="gemini-2.5-flash"
export ANTHROPIC_SMALL_FAST_MODEL="gemini-2.5-flash"
```

### Multiple Environment Aliases

```bash
# Alias for Gemini via claude-gemini-router
alias claude-gemini='ANTHROPIC_BASE_URL="https://cgr.jimmysong.io" ANTHROPIC_API_KEY="your-gemini-key" ANTHROPIC_MODEL="gemini-2.5-flash" claude'

# Alias for official Anthropic API
alias claude-official='ANTHROPIC_BASE_URL="https://api.anthropic.com" ANTHROPIC_API_KEY="your-anthropic-key" claude'
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
