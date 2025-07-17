interface GeminiResponse {
  candidates: GeminiCandidate[];
  promptFeedback?: any;
  usageMetadata?: any;
}

interface GeminiCandidate {
  content: GeminiContent;
  finishReason: string;
  index: number;
  safetyRatings?: any[];
}

interface GeminiContent {
  parts: GeminiPart[];
  role: string;
}

interface GeminiPart {
  text?: string;
  functionCall?: {
    name: string;
    args: any;
  };
}

/**
 * Converts Gemini response to Anthropic format
 */
export function formatGeminiToAnthropic(response: GeminiResponse, model: string): any {
  const messageId = "msg_" + Date.now();
  
  // Pick the first candidate as per specification
  const candidate = response.candidates[0];
  if (!candidate) {
    throw new Error("No candidates found in Gemini response");
  }

  let content: any = [];
  let stopReason = "end_turn";

  // Process the parts in the candidate's content
  if (candidate.content && candidate.content.parts) {
    candidate.content.parts.forEach((part: GeminiPart) => {
      if (part.text) {
        // Text content
        content.push({
          type: "text",
          text: part.text
        });
      } else if (part.functionCall) {
        // Function call content
        content.push({
          type: "tool_use",
          id: `toolu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: part.functionCall.name,
          input: part.functionCall.args || {}
        });
        // Set stop reason to tool_use when function calls are present
        stopReason = "tool_use";
      }
    });
  }

  // Map Gemini finish reasons to Anthropic stop reasons
  if (candidate.finishReason) {
    switch (candidate.finishReason) {
      case "STOP":
        stopReason = "end_turn";
        break;
      case "MAX_TOKENS":
        stopReason = "max_tokens";
        break;
      case "SAFETY":
        stopReason = "stop_sequence";
        break;
      case "RECITATION":
        stopReason = "stop_sequence";
        break;
      case "OTHER":
        stopReason = "end_turn";
        break;
      default:
        // If there are function calls, keep tool_use, otherwise default to end_turn
        if (stopReason !== "tool_use") {
          stopReason = "end_turn";
        }
    }
  }

  // Build the Anthropic response format
  const result = {
    id: messageId,
    type: "message",
    role: "assistant",
    content: content,
    stop_reason: stopReason,
    stop_sequence: null,
    model,
    usage: {
      input_tokens: response.usageMetadata?.promptTokenCount || 0,
      output_tokens: response.usageMetadata?.candidatesTokenCount || 0,
    }
  };

  return result;
}

/**
 * Converts streaming Gemini response chunk to Anthropic format
 */
export function formatGeminiStreamToAnthropic(chunk: any, model: string): any {
  const messageId = "msg_" + Date.now();
  
  if (!chunk.candidates || chunk.candidates.length === 0) {
    return null;
  }

  const candidate = chunk.candidates[0];
  let content: any = [];
  let stopReason = null;

  // Process the parts in the candidate's content
  if (candidate.content && candidate.content.parts) {
    candidate.content.parts.forEach((part: GeminiPart) => {
      if (part.text) {
        // Text content
        content.push({
          type: "text",
          text: part.text
        });
      } else if (part.functionCall) {
        // Function call content
        content.push({
          type: "tool_use",
          id: `toolu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: part.functionCall.name,
          input: part.functionCall.args || {}
        });
      }
    });
  }

  // Handle finish reason for streaming
  if (candidate.finishReason) {
    switch (candidate.finishReason) {
      case "STOP":
        stopReason = "end_turn";
        break;
      case "MAX_TOKENS":
        stopReason = "max_tokens";
        break;
      case "SAFETY":
        stopReason = "stop_sequence";
        break;
      case "RECITATION":
        stopReason = "stop_sequence";
        break;
      case "OTHER":
        stopReason = "end_turn";
        break;
      default:
        stopReason = content.some((c: any) => c.type === "tool_use") ? "tool_use" : "end_turn";
    }
  }

  return {
    id: messageId,
    type: "message",
    role: "assistant",
    content: content,
    stop_reason: stopReason,
    stop_sequence: null,
    model,
    usage: {
      input_tokens: chunk.usageMetadata?.promptTokenCount || 0,
      output_tokens: chunk.usageMetadata?.candidatesTokenCount || 0,
    }
  };
}
