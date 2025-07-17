export function streamGeminiToAnthropic(geminiStream: ReadableStream, model: string): ReadableStream {
  const messageId = "msg_" + Date.now();
  
  const enqueueSSE = (controller: ReadableStreamDefaultController, eventType: string, data: any) => {
    const sseMessage = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
    controller.enqueue(new TextEncoder().encode(sseMessage));
  };
  
  return new ReadableStream({
    async start(controller) {
      // Send message_start event
      const messageStart = {
        type: "message_start",
        message: {
          id: messageId,
          type: "message",
          role: "assistant",
          content: [],
          model,
          stop_reason: null,
          stop_sequence: null,
          usage: { input_tokens: 1, output_tokens: 1 },
        },
      };
      enqueueSSE(controller, "message_start", messageStart);
      
      let contentBlockIndex = 0;
      let hasStartedTextBlock = false;
      let isToolUse = false;
      let currentToolCallId: string | null = null;
      let toolCallJsonMap = new Map<string, string>();

      const reader = geminiStream.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            // Process final buffer
            if (buffer.trim()) {
              try {
                const parsed = JSON.parse(buffer.trim());
                if (Array.isArray(parsed) && parsed.length > 0) {
                  const item = parsed[0];
                  if (item.candidates && item.candidates.length > 0) {
                    processGeminiDelta(item);
                  }
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
            break;
          }
          
          // Decode chunk and add to buffer
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;
          
          // Try to parse complete JSON array
          try {
            const parsed = JSON.parse(buffer);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const item = parsed[0];
              if (item.candidates && item.candidates.length > 0) {
                processGeminiDelta(item);
                buffer = ''; // Clear buffer after processing
              }
            }
          } catch (e) {
            // Buffer doesn't contain complete JSON yet, continue
          }
        }
      } finally {
        reader.releaseLock();
      }

      function processGeminiDelta(geminiChunk: any) {
        const candidate = geminiChunk.candidates[0];
        if (!candidate || !candidate.content || !candidate.content.parts) {
          return;
        }

        // Process each part in the candidate's content
        for (const part of candidate.content.parts) {
          // Handle function calls (tool use)
          if (part.functionCall) {
            const toolCallId = `toolu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            // Close previous content block if any
            if (isToolUse || hasStartedTextBlock) {
              enqueueSSE(controller, "content_block_stop", {
                type: "content_block_stop",
                index: contentBlockIndex,
              });
            }

            isToolUse = true;
            hasStartedTextBlock = false;
            currentToolCallId = toolCallId;
            contentBlockIndex++;

            // Start new tool use block
            const toolBlock = {
              type: "tool_use",
              id: toolCallId,
              name: part.functionCall.name,
              input: {},
            };

            enqueueSSE(controller, "content_block_start", {
              type: "content_block_start",
              index: contentBlockIndex,
              content_block: toolBlock,
            });

            // Send function call arguments as input_json_delta
            if (part.functionCall.args) {
              const argsJson = JSON.stringify(part.functionCall.args);
              toolCallJsonMap.set(toolCallId, argsJson);

              enqueueSSE(controller, "content_block_delta", {
                type: "content_block_delta",
                index: contentBlockIndex,
                delta: {
                  type: "input_json_delta",
                  partial_json: argsJson,
                },
              });
            }
          }
          // Handle text content
          else if (part.text) {
            // Close tool use block if switching from tool to text
            if (isToolUse) {
              enqueueSSE(controller, "content_block_stop", {
                type: "content_block_stop",
                index: contentBlockIndex,
              });
              isToolUse = false;
              currentToolCallId = null;
              contentBlockIndex++;
            }

            // Start text block if not already started
            if (!hasStartedTextBlock) {
              enqueueSSE(controller, "content_block_start", {
                type: "content_block_start",
                index: contentBlockIndex,
                content_block: {
                  type: "text",
                  text: "",
                },
              });
              hasStartedTextBlock = true;
            }

            // Send text delta
            enqueueSSE(controller, "content_block_delta", {
              type: "content_block_delta",
              index: contentBlockIndex,
              delta: {
                type: "text_delta",
                text: part.text,
              },
            });
          }
        }

        // Handle finish reason from Gemini
        if (candidate.finishReason) {
          // Close current content block
          if (isToolUse || hasStartedTextBlock) {
            enqueueSSE(controller, "content_block_stop", {
              type: "content_block_stop",
              index: contentBlockIndex,
            });
          }

          // Map Gemini finish reasons to Anthropic stop reasons
          let stopReason = "end_turn";
          switch (candidate.finishReason) {
            case "STOP":
              stopReason = isToolUse ? "tool_use" : "end_turn";
              break;
            case "MAX_TOKENS":
              stopReason = "max_tokens";
              break;
            case "SAFETY":
            case "RECITATION":
              stopReason = "stop_sequence";
              break;
            case "OTHER":
            default:
              stopReason = isToolUse ? "tool_use" : "end_turn";
          }

          // Send message_delta and message_stop
          enqueueSSE(controller, "message_delta", {
            type: "message_delta",
            delta: {
              stop_reason: stopReason,
              stop_sequence: null,
            },
            usage: { 
              input_tokens: geminiChunk.usageMetadata?.promptTokenCount || 100, 
              output_tokens: geminiChunk.usageMetadata?.candidatesTokenCount || 150 
            },
          });

          enqueueSSE(controller, "message_stop", {
            type: "message_stop",
          });

          controller.close();
          return;
        }
      }

      // If we reach here without a finish reason, still close properly
      if (isToolUse || hasStartedTextBlock) {
        enqueueSSE(controller, "content_block_stop", {
          type: "content_block_stop",
          index: contentBlockIndex,
        });
      }

      // Send final message_delta and message_stop
      enqueueSSE(controller, "message_delta", {
        type: "message_delta",
        delta: {
          stop_reason: isToolUse ? "tool_use" : "end_turn",
          stop_sequence: null,
        },
        usage: { input_tokens: 100, output_tokens: 150 },
      });

      enqueueSSE(controller, "message_stop", {
        type: "message_stop",
      });

      controller.close();
    },
  });
}
