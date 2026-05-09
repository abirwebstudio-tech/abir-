import React from 'react';
import { useStore } from '../store';
import { cn } from '../lib/utils';
import { 
  MessageSquare, 
  Plus, 
  Settings, 
  Search, 
  PanelLeftClose, 
  PanelLeftOpen,
  Crown,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Sidebar() {
  const { 
    sessions, 
    currentSessionId, 
    sidebarOpen, 
    createSession, 
    setCurrentSession,
    deleteSession,
    toggleSidebar
  } = useStore();

  return (
    <AnimatePresence initial={false}>
      {sidebarOpen && (
        <motion.div 
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 256, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          className="w-64 glass flex flex-col border-r border-white/10 flex-shrink-0 z-20 overflow-hidden relative"
        >
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
                A
              </div>
              <span className="text-xl font-bold tracking-tight text-white">ABIR AI</span>
            </div>

            <button 
              onClick={() => createSession('BASIC')}
              className="w-full py-2.5 px-4 rounded-xl glass border border-white/10 hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Plus size={16} />
              New Project
            </button>
          </div>

          <nav className="flex-1 px-4 space-y-1 overflow-y-auto scrollbar-hide py-2">
            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3 px-2">Recent Projects</div>
            {sessions.map((session) => (
              <div 
                key={session.id}
                className={cn(
                  "group p-2.5 rounded-lg text-sm transition-all cursor-pointer flex items-center justify-between",
                  currentSessionId === session.id 
                    ? "active-tab" 
                    : "text-slate-400 hover:bg-white/5"
                )}
                onClick={() => setCurrentSession(session.id)}
              >
                <div className="flex items-center gap-3 truncate pr-2">
                  <MessageSquare size={16} className="opacity-70 flex-shrink-0" />
                  <span className="truncate">{session.title}</span>
                </div>
                <button 
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-opacity flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSession(session.id);
                  }}
                >
                  <Trash2 size={14} className="hover:text-red-400 transition-colors" />
                </button>
              </div>
            ))}
          </nav>

          <div className="p-6 border-t border-white/5 space-y-4">
            {/* Database indicator */}
            <div className="px-4 py-3 bg-black/20 rounded-xl border border-white/5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-slate-400">Database Storage</span>
                <span className="text-xs text-indigo-400 font-bold tracking-tight">1.2 GB <span className="text-slate-500">/ 5 GB</span></span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full" style={{ width: '24%' }}></div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <div className="text-xs font-bold text-indigo-400 mb-1 uppercase tracking-wider">ABIR BUSINESS</div>
              <div className="text-[11px] text-slate-400 mb-3">Unlimited deep reasoning & cloud projects.</div>
              <button className="w-full py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center">
                Upgrade Plan
              </button>
            </div>

            <div className="flex items-center gap-3 px-1">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-semibold">
                U
              </div>
              <div className="flex-1 text-xs min-w-0">
                <div className="font-medium text-white truncate">User Account</div>
                <div 
                  className="text-slate-500 cursor-pointer hover:text-slate-400"
                  onClick={() => useStore.getState().setSettingsOpen(true)}
                >
                  Settings
                </div>
              </div>
              <Settings 
                size={16} 
                className="text-slate-500 cursor-pointer hover:text-slate-300 flex-shrink-0" 
                onClick={() => useStore.getState().setSettingsOpen(true)}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
