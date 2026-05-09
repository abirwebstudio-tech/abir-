export type Role = 'user' | 'model';

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  isGenerating?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  updatedAt: number;
  messages: ChatMessage[];
  mode: 'BASIC' | 'PLUS' | 'BUSINESS';
}
