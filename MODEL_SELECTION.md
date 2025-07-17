# Model Selection Mechanism

**The claude-gemini-router supports two valid methods for selecting the Gemini model to use:**

1. **Cloudflare Worker Environment Variable**: The `GEMINI_MODEL` environment variable can be set in your `wrangler.toml` configuration file under the `[vars]` section or as a Cloudflare secret. This variable is intended to serve as a fallback default model, though the current implementation primarily relies on the automatic mapping mechanism below.

2. **Automatic Model Mapping**: The `mapModelToGemini()` function automatically translates Anthropic model names sent by the client into appropriate Gemini model equivalents. When a client sends model names containing "haiku", "sonnet", or "opus", the router intelligently maps them to corresponding Gemini models ("gemini-2.5-flash" for haiku, "gemini-2.5-pro" for sonnet/opus). If the model name already contains a forward slash, it's passed through unchanged. For unrecognized models, it defaults to "gemini-2.5-flash".

**Important**: The client-side `ANTHROPIC_MODEL` environment variable has **no server-side effect** on model selection within the worker itself. While it may be used by client applications (like Claude Code) to specify which model name to send in requests, the actual model selection is handled exclusively by the server-side `mapModelToGemini()` function. This client-side variable should not be advertised as a way to control server-side model selection, as it has no impact on the worker's behavior.
