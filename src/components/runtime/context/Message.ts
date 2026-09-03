export type MessageRole = 'user' | 'assistant' | 'tool'

export interface Message {
  role: MessageRole;
  content?: string;
  toolName?: string;
  args?: unknown;
}

export type History = Message[]