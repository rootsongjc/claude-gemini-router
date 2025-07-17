# Model Selection Mechanism

**The claude-gemini-router supports flexible model selection with the following priority order:**

1. **Request Model Parameter**: The `model` field in the API request takes precedence. You can specify any valid Gemini model name directly:
   ```json
   {
     "model": "gemini-1.5-flash",
     "messages": [{"role": "user", "content": "Hello!"}]
   }
   ```

2. **Environment Variable Fallback**: If no model is specified in the request, the `GEMINI_MODEL` environment variable is used as a fallback default.

3. **System Default**: If neither is specified, defaults to `gemini-2.5-flash`.

### Model Name Handling

- **Direct Gemini Models**: Names starting with `gemini-` are used as-is (e.g., `gemini-1.5-flash`, `gemini-2.5-pro`).
- **Anthropic Model Mapping**: Automatically maps Anthropic model names:
  - `haiku` → `gemini-2.5-flash`
  - `sonnet` → `gemini-2.5-pro`
  - `opus` → `gemini-2.5-pro`
- **Unknown Models**: Default to `gemini-2.5-flash`.

### API Response

The API response includes the `model` field showing the actual model used:
```json
{
  "id": "msg_1234567890",
  "type": "message",
  "role": "assistant",
  "content": [{"type": "text", "text": "Hello!"}],
  "model": "gemini-1.5-flash",
  "usage": {"input_tokens": 4, "output_tokens": 8}
}
```
