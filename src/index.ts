import {
  formatAnthropicToGemini,
  getGeminiEndpoint,
  getGeminiHeaders,
} from "./formatRequestGemini";
import { formatGeminiToAnthropic } from "./formatResponseGemini";
import { streamGeminiToAnthropic } from "./streamResponseGemini";
import { logger } from "./logger";
import { Env } from "./types";

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers":
            "Content-Type, Authorization, x-api-key",
        },
      });
    }

    // Only handle POST requests to /v1/messages
    const url = new URL(request.url);

    // Serve HTML page on the root path for GET requests
    if (request.method === "GET" && url.pathname === "/") {
      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Claude Gemini Router</title>
    <link rel="icon" type="image/x-icon" href="https://jimmysong.io/images/favicon.ico">
    <style>
        body { 
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; 
            margin: 0 auto; 
            max-width: 800px; 
            padding: 2em; 
            line-height: 1.6; 
            color: #333;
        }
        h1, h2 { 
            color: #2c3e50; 
            margin-top: 1.5em;
        }
        h1 { 
            border-bottom: 2px solid #eaecef;
            padding-bottom: 0.3em;
        }
        code { 
            background: #f6f8fa; 
            padding: 3px 6px; 
            border-radius: 3px; 
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
            font-size: 0.9em;
        }
        pre { 
            background: #f6f8fa; 
            padding: 16px; 
            border-radius: 6px; 
            overflow-x: auto; 
            border: 1px solid #e1e4e8;
            margin: 1.2em 0;
        }
        pre code { 
            background: transparent; 
            padding: 0; 
            white-space: pre;
            display: block;
            line-height: 1.5;
        }
        a { 
            color: #0366d6; 
            text-decoration: none; 
        }
        a:hover { 
            text-decoration: underline; 
        }
        p {
            margin: 1em 0;
        }
        .container {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            padding: 2em;
        }
    </style>
</head>
<body>
    <div class="container">
    <h1>Welcome to Claude Gemini Router!</h1>
    <p>This Cloudflare Worker acts as a translation layer, allowing you to use <strong>Anthropic's Claude Code CLI</strong> with <strong>Google's Gemini models</strong>.</p>
    <p>It translates requests from Anthropic API format to Google Gemini API format, forwards them to Google Gemini, and then translates the responses back to Anthropic's format, supporting both streaming and non-streaming.</p>
    
    <h2>How to Use:</h2>
    <p>1. Get your Google Gemini API key from <a href="https://makersuite.google.com/app/apikey" target="_blank">Google AI Studio</a>.</p>
    <p>2. Configure your Claude Code CLI to point to this router and use your Gemini API key:</p>
    <pre><code>export ANTHROPIC_BASE_URL="https://cgr.jimmysong.io"
export ANTHROPIC_API_KEY="your-gemini-api-key"
export ANTHROPIC_MODEL="gemini-2.5-flash" # Optional, specify your preferred Gemini model</code></pre>
    <p>3. Now you can use the Claude Code CLI as usual, powered by Google Gemini!</p>

    <h2>Project Repository:</h2>
    <p>Find more details and contribute on GitHub: <a href="https://github.com/rootsongjc/claude-gemini-router" target="_blank">rootsongjc/claude-gemini-router</a></p>
    </div>
</body>
</html>`;
      return new Response(htmlContent, {
        headers: { "Content-Type": "text/html" },
      });
    }

    // Only handle POST requests to /v1/messages for API calls
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    if (url.pathname !== "/v1/messages") {
      return new Response("Not Found", { status: 404 });
    }

    try {
      // Get API key from headers
      const apiKey =
        request.headers.get("x-api-key") ||
        request.headers.get("Authorization")?.replace("Bearer ", "");

      if (!apiKey) {
        return new Response("Missing API key", { status: 401 });
      }

      // Parse request body
      const body = await request.json();

      // Log the incoming request
      logger.debug("Incoming request:", body);

      // Convert Anthropic request to Gemini format
      const {
        request: geminiRequest,
        isStream,
        model,
      } = formatAnthropicToGemini(body);

      // Get the appropriate Gemini endpoint
      const endpoint = getGeminiEndpoint(model, isStream);

      // Log the converted request
      logger.debug("Converted to Gemini request:", geminiRequest);
      logger.debug("Endpoint:", endpoint);

      // Make request to Gemini API
      const geminiResponse = await fetch(endpoint, {
        method: "POST",
        headers: getGeminiHeaders(apiKey),
        body: JSON.stringify(geminiRequest),
      });

      if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text();
        logger.error("Gemini API error:", errorText);

        // Try to parse error response
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: { message: errorText } };
        }

        return new Response(
          JSON.stringify({
            error: {
              type: "api_error",
              message:
                errorData.error?.message || "Unknown error from Gemini API",
            },
          }),
          {
            status: geminiResponse.status,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      }

      // Handle streaming response
      if (isStream) {
        const stream = streamGeminiToAnthropic(geminiResponse);
        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }

      // Handle non-streaming response
      const geminiData = await geminiResponse.json();
      logger.debug("Gemini response:", geminiData);

      const anthropicResponse = formatGeminiToAnthropic(geminiData);
      logger.debug("Converted to Anthropic response:", anthropicResponse);

      return new Response(JSON.stringify(anthropicResponse), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error) {
      logger.error("Error processing request:", error);

      return new Response(
        JSON.stringify({
          error: {
            type: "internal_error",
            message: error instanceof Error ? error.message : "Unknown error",
          },
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  },
};
