# Test Guide for Claude-Gemini-Router

This guide explains how to run the comprehensive test suite for the Claude-Gemini-Router integration.

## Test Structure

The test suite is organized into three main categories:

### 1. Unit Tests (Formatters)
- **Location**: `tests/formatters/`
- **Purpose**: Test the request/response formatters with sample payloads
- **Run**: `npm test`

#### Test Coverage:
- ✅ **formatRequest.test.ts**: Tests Anthropic to OpenAI request formatting
- ✅ **formatRequestGemini.test.ts**: Tests Anthropic to Gemini request formatting  
- ✅ **formatResponse.test.ts**: Tests OpenAI to Anthropic response formatting
- ✅ **formatResponseGemini.test.ts**: Tests Gemini to Anthropic response formatting

### 2. Integration Tests
- **Location**: `tests/integration/`
- **Purpose**: Test the actual Worker with the Gemini API for both streaming and non-streaming
- **Run**: `npm run test:integration`

#### Prerequisites:
1. Start the development server: `wrangler dev`
2. Set environment variable: `export GEMINI_API_KEY=your_api_key`

#### Test Coverage:
- ✅ **Non-streaming requests**: Simple messages, system messages, tool calls
- ✅ **Streaming requests**: Streaming text, streaming tool calls
- ✅ **Error handling**: Invalid models, malformed requests
- ✅ **Worker endpoints**: Index page, 404 handling

### 3. Tool Call Validation Tests
- **Purpose**: Validate tool_call scenarios and ensure proper formatting
- **Coverage**: Complete tool call sequences, incomplete tool calls, multiple tool calls

## Running Tests

### Run All Tests
```bash
npm run test:all
```

### Run Unit Tests Only
```bash
npm test
```

### Run Integration Tests Only
```bash
# Prerequisites: Start wrangler dev and set GEMINI_API_KEY
wrangler dev &
export GEMINI_API_KEY=your_api_key
npm run test:integration
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

