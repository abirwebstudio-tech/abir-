import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { ChatSession, ChatMessage } from './types';

interface AppState {
  sessions: ChatSession[];
  currentSessionId: string | null;
  sidebarOpen: boolean;
  deepThink: boolean;
  deepResearch: boolean;
  theme: 'dark' | 'light';
  settingsOpen: boolean;
  createSession: (mode?: 'BASIC' | 'PLUS' | 'BUSINESS') => void;
  setCurrentSession: (id: string) => void;
  updateSessionMode: (id: string, mode: 'BASIC' | 'PLUS' | 'BUSINESS') => void;
  addMessage: (sessionId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => string;
  updateMessageContent: (sessionId: string, messageId: string, content: string) => void;
  finishMessageGeneration: (sessionId: string, messageId: string) => void;
  deleteSession: (id: string) => void;
  toggleSidebar: () => void;
  setDeepThink: (val: boolean) => void;
  setDeepResearch: (val: boolean) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setSettingsOpen: (open: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  sessions: [],
  currentSessionId: null,
  sidebarOpen: true,
  deepThink: false,
  deepResearch: false,
  theme: 'dark',
  settingsOpen: false,
  createSession: (mode = 'BASIC') => {
    const id = uuidv4();
    set((state) => ({
      sessions: [
        {
          id,
          title: 'New Chat',
          updatedAt: Date.now(),
          messages: [],
          mode,
        },
        ...state.sessions,
      ],
      currentSessionId: id,
    }));
  },
  setCurrentSession: (id) => set({ currentSessionId: id }),
  updateSessionMode: (id, mode) => set((state) => ({
    sessions: state.sessions.map(s => s.id === id ? { ...s, mode } : s)
  })),
  addMessage: (sessionId, message) => {
    const id = uuidv4();
    set((state) => ({
      sessions: state.sessions.map((s) => {
        if (s.id === sessionId) {
          const title = s.messages.length === 0 && message.role === 'user' 
            ? message.content.slice(0, 30) + '...'
            : s.title;
          return {
            ...s,
            title,
            updatedAt: Date.now(),
            messages: [...s.messages, { ...message, id, timestamp: Date.now(), isGenerating: message.role === 'model' }],
          };
        }
        return s;
      }),
    }));
    return id;
  },
  updateMessageContent: (sessionId, messageId, content) => {
    set((state) => ({
      sessions: state.sessions.map((s) => {
        if (s.id === sessionId) {
          return {
            ...s,
            messages: s.messages.map((m) => {
              if (m.id === messageId) {
                return { ...m, content };
              }
              return m;
            }),
          };
        }
        return s;
      }),
    }));
  },
  finishMessageGeneration: (sessionId, messageId) => {
    set((state) => ({
      sessions: state.sessions.map((s) => {
        if (s.id === sessionId) {
          return {
            ...s,
            messages: s.messages.map((m) => {
              if (m.id === messageId) {
                return { ...m, isGenerating: false };
              }
              return m;
            }),
          };
        }
        return s;
      }),
    }));
  },
  deleteSession: (id) => set((state) => ({
    sessions: state.sessions.filter((s) => s.id !== id),
    currentSessionId: state.currentSessionId === id 
      ? (state.sessions.filter(s => s.id !== id)[0]?.id || null) 
      : state.currentSessionId
  })),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setDeepThink: (val) => set({ deepThink: val }),
  setDeepResearch: (val) => set({ deepResearch: val }),
  setTheme: (theme) => set({ theme }),
  setSettingsOpen: (open) => set({ settingsOpen: open }),
}));
