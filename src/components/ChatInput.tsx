import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Image as ImageIcon, Mic } from 'lucide-react';
import { useStore } from '../store';
import { cn } from '../lib/utils';
import TextareaAutosize from 'react-textarea-autosize';

export function ChatInput({ onSendMessage }: { onSendMessage: (text: string) => void }) {
  const [input, setInput] = useState('');
  const { deepThink, deepResearch } = useStore();
  
  const handleSubmit = () => {
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <footer className="p-8 w-full mt-auto">
      <div className="max-w-4xl mx-auto w-full">
        <div className="glass rounded-2xl border border-white/10 p-2 shadow-2xl relative">
          <div className="flex items-end gap-2 px-2 py-1">
            <button className="p-2 hover:bg-white/5 rounded-xl transition-all text-slate-400 relative group">
              <Paperclip size={20} />
            </button>
            <TextareaAutosize
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask ABIR AI anything... (Cmd + Enter to send)"
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 resize-none text-slate-200 placeholder-slate-500 outline-none"
              minRows={1}
              maxRows={8}
            />
            <button className="p-2 hover:bg-white/5 rounded-xl transition-all text-slate-400 relative group mr-1">
              <Mic size={20} />
            </button>
            <button 
              onClick={handleSubmit}
              disabled={!input.trim()}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-lg text-white font-bold flex-shrink-0",
                input.trim() 
                  ? "bg-indigo-500 hover:bg-indigo-400 shadow-indigo-500/20 active:scale-95" 
                  : "bg-white/5 text-slate-500 shadow-none cursor-not-allowed"
              )}
            >
              <Send size={18} className={input.trim() ? "translate-x-[1px] translate-y-[-1px]" : ""} />
            </button>
          </div>
        </div>
        <div className="flex justify-center gap-4 mt-3 text-[10px] text-slate-600 font-medium uppercase tracking-widest">
          <span>Markdown Supported</span>
          <span className="text-indigo-900">•</span>
          <span>Encrypted Session</span>
          <span className="text-indigo-900">•</span>
          <span>Abir v4.2.1</span>
        </div>
      </div>
    </footer>
  );
}
