import React, { useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { ChatInput } from './components/ChatInput';
import { ChatBlock } from './components/ChatBlock';
import { useStore } from './store';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  const { sessions, currentSessionId, createSession, addMessage, updateMessageContent, deepThink, theme, finishMessageGeneration } = useStore();
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sessions.length === 0) {
      createSession();
    }
  }, [sessions.length, createSession]);

  const currentSession = sessions.find(s => s.id === currentSessionId);
  const messages = currentSession?.messages || [];

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!currentSessionId) return;

    // Add user message
    addMessage(currentSessionId, { role: 'user', content: text });

    // Add empty AI message to stream into
    const aiMessageId = addMessage(currentSessionId, { role: 'model', content: '' });

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: JSON.stringify([...messages, { role: 'user', content: text }]),
          model: currentSession?.mode === 'BUSINESS' || deepThink ? 'gemini-3.1-pro-preview' : 'gemini-2.5-flash',
          isThinkingMode: currentSession?.mode === 'BUSINESS' || deepThink,
          systemInstruction: `You are ABIR AI — your intelligent cloud assistant. Follow these constraints: tone should be smart, helpful, fast, human-like, professional, deep-thinking, coding-focused.
If asked to build a full project or generate a ZIP, you MUST output the code blocks clearly.
Current mode: ${currentSession?.mode}`,
        }),
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamedContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '');
            if (dataStr === '[DONE]') break;
            
            try {
              const data = JSON.parse(dataStr);
              if (data.text) {
                streamedContent += data.text;
                updateMessageContent(currentSessionId, aiMessageId, streamedContent);
              } else if (data.error) {
                streamedContent += `\n**Error:** ${data.error}`;
                updateMessageContent(currentSessionId, aiMessageId, streamedContent);
              }
            } catch (e) {
              // incomplete JSON chunk, wait for next
            }
          }
        }
      }
      finishMessageGeneration(currentSessionId, aiMessageId);
    } catch (error: any) {
      console.error("Chat error:", error);
      updateMessageContent(currentSessionId, aiMessageId, "An error occurred while connecting to ABIR AI.");
      finishMessageGeneration(currentSessionId, aiMessageId);
    }
  };

  return (
    <div className={`flex h-screen w-full text-slate-200 overflow-hidden font-sans relative ${theme === 'light' ? 'light-mode-active' : ''}`}>
      <SettingsModal />
      <div className="mesh-bg"></div>
      <Sidebar />
      <div className="flex-1 flex flex-col h-full min-w-0 z-0">
        <Topbar />
        
        <div className="flex-1 overflow-y-auto scrollbar-hide relative flex flex-col p-8 space-y-8 max-w-4xl mx-auto w-full">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-6">
                <span className="text-4xl font-bold text-white tracking-tighter">A</span>
              </div>
              <h1 className="text-3xl font-bold mb-2 text-white">How can I help you today?</h1>
              <p className="text-slate-400 max-w-md">
                I am ABIR AI — your intelligent cloud assistant. Ready to think deep, research, and write code.
              </p>
            </div>
          ) : (
            <div className="flex-1 pb-10 space-y-8">
              {messages.map((msg) => (
                <ChatBlock key={msg.id} message={msg} />
              ))}
              <div ref={chatBottomRef} className="h-4" />
            </div>
          )}
        </div>

        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}
