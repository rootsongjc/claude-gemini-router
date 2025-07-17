interface MessageCreateParamsBase {
  model: string;
  messages: any[];
  system?: any;
  temperature?: number;
  tools?: any[];
  stream?: boolean;
}

interface GeminiContent {
  role: "user" | "model";
  parts: GeminiPart[];
}

interface GeminiPart {
  text?: string;
  functionCall?: {
    name: string;
    args: any;
  };
  functionResponse?: {
    name: string;
    response: any;
  };
}

interface GeminiGenerationConfig {
  temperature?: number;
  topP?: number;
  topK?: number;
  candidateCount?: number;
  maxOutputTokens?: number;
  stopSequences?: string[];
}

interface GeminiSafetySetting {
  category: string;
  threshold: string;
}

interface GeminiTool {
  functionDeclarations: GeminiFunctionDeclaration[];
}

interface GeminiFunctionDeclaration {
  name: string;
  description: string;
  parameters: any;
}

interface GeminiRequest {
  contents: GeminiContent[];
  generationConfig?: GeminiGenerationConfig;
  safetySettings?: GeminiSafetySetting[];
  tools?: GeminiTool[];
}

/**
 * Maps Anthropic model names to Gemini model names
 */
export function mapModelToGemini(modelName: string): string {
  // If model already contains '/', it might be a full model path
  if (modelName.includes('/')) {
    return modelName;
  }
  
  // If it's already a Gemini model name, return it as is
  if (modelName.startsWith('gemini-')) {
    return modelName;
  }
  
  // Map common Anthropic models to Gemini equivalents
  if (modelName.includes('haiku')) {
    return 'gemini-2.5-flash';
  } else if (modelName.includes('sonnet')) {
    return 'gemini-2.5-pro';
  } else if (modelName.includes('opus')) {
    return 'gemini-2.5-pro';
  }
  
  // Default to gemini-2.5-flash for unknown models
  return 'gemini-2.5-flash';
}

/**
 * Converts Anthropic safety settings to Gemini safety settings
 */
function getDefaultSafetySettings(): GeminiSafetySetting[] {
  return [
    {
      category: "HARM_CATEGORY_HARASSMENT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
      category: "HARM_CATEGORY_HATE_SPEECH",
      threshold: "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
      category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
      category: "HARM_CATEGORY_DANGEROUS_CONTENT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE"
    }
  ];
}

/**
 * Converts Anthropic tools to Gemini function declarations
 */
function convertToolsToGemini(tools: any[]): GeminiTool[] {
  if (!tools || tools.length === 0) {
    return [];
  }

  const functionDeclarations: GeminiFunctionDeclaration[] = tools.map(tool => ({
    name: tool.name,
    description: tool.description,
    parameters: filterSchema(tool.input_schema)
  }));

  function filterSchema(schema: any): any {
    if (!schema || typeof schema !== 'object') {
      return schema;
    }
    
    // Handle arrays
    if (Array.isArray(schema)) {
      return schema.map(item => filterSchema(item));
    }
    
    const filteredSchema = { ...schema };
    
    // Remove unsupported JSON Schema fields
    delete filteredSchema['$schema'];
    delete filteredSchema['additionalProperties'];
    
    // Filter format field - Gemini only supports 'enum' and 'date-time' for STRING type
    if (filteredSchema.format && 
        filteredSchema.type === 'string' && 
        filteredSchema.format !== 'enum' && 
        filteredSchema.format !== 'date-time') {
      delete filteredSchema.format;
    }
    
    // Remove other unsupported fields that might cause issues
    delete filteredSchema['examples'];
    delete filteredSchema['$ref'];
    delete filteredSchema['$id'];
    delete filteredSchema['$comment'];
    delete filteredSchema['default'];
    delete filteredSchema['const'];
    delete filteredSchema['contentMediaType'];
    delete filteredSchema['contentEncoding'];
    delete filteredSchema['if'];
    delete filteredSchema['then'];
    delete filteredSchema['else'];
    delete filteredSchema['allOf'];
    delete filteredSchema['anyOf'];
    delete filteredSchema['oneOf'];
    delete filteredSchema['not'];
    delete filteredSchema['contains'];
    delete filteredSchema['patternProperties'];
    delete filteredSchema['dependencies'];
    delete filteredSchema['dependentSchemas'];
    delete filteredSchema['dependentRequired'];
    delete filteredSchema['propertyNames'];
    delete filteredSchema['unevaluatedItems'];
    delete filteredSchema['unevaluatedProperties'];
    
    // Recursively filter nested objects
    for (const key in filteredSchema) {
      if (typeof filteredSchema[key] === 'object') {
        filteredSchema[key] = filterSchema(filteredSchema[key]);
      }
    }
    
    return filteredSchema;
  }

  return [{
    functionDeclarations
  }];
}

/**
 * Converts Anthropic message content to Gemini parts
 */
function convertContentToGeminiParts(content: any[]): GeminiPart[] {
  const parts: GeminiPart[] = [];

  content.forEach(contentPart => {
    if (contentPart.type === "text") {
      parts.push({
        text: typeof contentPart.text === "string" 
          ? contentPart.text 
          : JSON.stringify(contentPart.text)
      });
    } else if (contentPart.type === "tool_use") {
      parts.push({
        functionCall: {
          name: contentPart.name,
          args: contentPart.input
        }
      });
    } else if (contentPart.type === "tool_result") {
      parts.push({
        functionResponse: {
          name: contentPart.tool_use_id, // Gemini uses the function call ID
          response: typeof contentPart.content === "string"
            ? { result: contentPart.content }
            : contentPart.content
        }
      });
    }
  });

  return parts;
}

/**
 * Converts Anthropic messages to Gemini contents
 */
function convertMessagesToGeminiContents(messages: any[], systemPrompt?: string): GeminiContent[] {
  const contents: GeminiContent[] = [];

  // Add system prompt as first user message if provided
  if (systemPrompt) {
    contents.push({
      role: "user",
      parts: [{ text: systemPrompt }]
    });
    
    // Add a dummy model response to maintain conversation flow
    contents.push({
      role: "model",
      parts: [{ text: "I understand. I'll follow these instructions." }]
    });
  }

  messages.forEach(message => {
    if (message.role === "user") {
      const parts = Array.isArray(message.content) 
        ? convertContentToGeminiParts(message.content)
        : [{ text: message.content }];
      
      if (parts.length > 0) {
        contents.push({
          role: "user",
          parts
        });
      }
    } else if (message.role === "assistant") {
      const parts = Array.isArray(message.content)
        ? convertContentToGeminiParts(message.content)
        : [{ text: message.content }];
      
      if (parts.length > 0) {
        contents.push({
          role: "model",
          parts
        });
      }
    }
  });

  return contents;
}

/**
 * Converts Anthropic Claude /v1/messages request to Gemini generateContent format
 */
export function formatAnthropicToGemini(body: MessageCreateParamsBase, env?: { GEMINI_MODEL?: string }): {
  request: GeminiRequest;
  isStream: boolean;
  model: string;
} {
  const { model, messages, system, temperature, tools, stream } = body;

  // Convert system prompt to string if it's an array
  let systemPrompt: string | undefined;
  if (system) {
    if (Array.isArray(system)) {
      systemPrompt = system.map(item => item.text || item).join('\n');
    } else {
      systemPrompt = typeof system === 'string' ? system : system.text || JSON.stringify(system);
    }
  }

  // Convert messages to Gemini contents
  const contents = convertMessagesToGeminiContents(messages, systemPrompt);

  // Build generation config
  const generationConfig: GeminiGenerationConfig = {};
  if (temperature !== undefined) {
    generationConfig.temperature = temperature;
  }

  // Build the request
  const geminiRequest: GeminiRequest = {
    contents,
    generationConfig,
    safetySettings: getDefaultSafetySettings()
  };

  // Add tools if provided
  if (tools && tools.length > 0) {
    geminiRequest.tools = convertToolsToGemini(tools);
  } else if (tools && tools.length === 0) {
    geminiRequest.tools = [];
  }

  // Use request model if available, otherwise use environment variable model
  const selectedModel = model || env?.GEMINI_MODEL || 'gemini-2.5-flash';

  return {
    request: geminiRequest,
    isStream: stream || false,
    model: mapModelToGemini(selectedModel)
  };
}

/**
 * Builds the appropriate Gemini API endpoint URL
 */
export function getGeminiEndpoint(model: string, isStream: boolean): string {
  const baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
  const method = isStream ? 'streamGenerateContent' : 'generateContent';
  return `${baseUrl}/${model}:${method}`;
}

/**
 * Builds headers for Gemini API request
 */
export function getGeminiHeaders(apiKey: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'x-goog-api-key': apiKey
  };
}
