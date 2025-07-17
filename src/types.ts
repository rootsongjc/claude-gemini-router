export interface Env {
  GEMINI_API_KEY: string;
  GEMINI_MODEL?: string;
}

export interface AnthropicMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | AnthropicContent[];
}

export interface AnthropicContent {
  type: 'text' | 'image' | 'tool_use' | 'tool_result';
  text?: string;
  source?: {
    type: 'base64';
    media_type: string;
    data: string;
  };
  name?: string;
  input?: any;
  tool_use_id?: string;
  content?: string;
  is_error?: boolean;
}

export interface AnthropicRequest {
  model: string;
  messages: AnthropicMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  stop_sequences?: string[];
  stream?: boolean;
  system?: string;
  tools?: AnthropicTool[];
}

export interface AnthropicTool {
  name: string;
  description: string;
  input_schema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface GeminiRequest {
  model: string;
  request: {
    contents: GeminiContent[];
    generationConfig?: {
      temperature?: number;
      topP?: number;
      maxOutputTokens?: number;
      stopSequences?: string[];
    };
    systemInstruction?: {
      parts: Array<{ text: string }>;
    };
    tools?: {
      functionDeclarations: GeminiFunctionDeclaration[];
    }[];
  };
  isStream: boolean;
}

export interface GeminiContent {
  role: 'user' | 'model';
  parts: GeminiPart[];
}

export interface GeminiPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
  functionCall?: {
    name: string;
    args: any;
  };
  functionResponse?: {
    name: string;
    response: any;
  };
}

export interface GeminiFunctionDeclaration {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}
