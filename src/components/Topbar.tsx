import React, { useState } from 'react';
import { useStore } from '../store';
import { PanelLeftOpen, Brain, Globe, ChevronDown, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function Topbar() {
  const { 
    sidebarOpen, 
    toggleSidebar, 
    deepThink, 
    setDeepThink,
    deepResearch,
    setDeepResearch,
    sessions,
    currentSessionId,
    updateSessionMode
  } = useStore();

  const [modeMenuOpen, setModeMenuOpen] = useState(false);

  const currentSession = sessions.find(s => s.id === currentSessionId);
  // Real world: we would update the mode in store, but here we just show it
  // and deep think toggles it essentially.

  return (
    <header className="h-16 glass flex items-center justify-between px-8 z-10 sticky top-0 w-full relative">
      <div className="flex items-center gap-6">
        {!sidebarOpen && (
          <button 
            onClick={toggleSidebar}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <PanelLeftOpen size={18} />
          </button>
        )}
        <div className="relative">
          <button 
            onClick={() => setModeMenuOpen(!modeMenuOpen)}
            className="flex items-center gap-2 bg-black/30 border border-white/10 rounded-full px-3 py-1.5 text-xs font-medium cursor-pointer"
          >
            <span className="text-indigo-400 font-bold uppercase">Abir-4-{currentSession?.mode || 'BASIC'}</span>
            <ChevronDown size={14} className="text-slate-400" />
          </button>
          
          <AnimatePresence>
            {modeMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 mt-2 w-48 glass rounded-xl py-1 z-50 border border-white/10 overflow-hidden shadow-2xl"
              >
                <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-white/5">Select Model</div>
                <button 
                  onClick={() => {
                    setModeMenuOpen(false);
                    if (currentSessionId) updateSessionMode(currentSessionId, 'BASIC');
                  }}
                  className="w-full text-left px-3 py-2.5 hover:bg-white/5 flex items-center gap-2 text-sm text-slate-200"
                >
                  <Sparkles size={14} className="text-slate-400" />
                  Basic (Fast)
                </button>
                <button 
                  onClick={() => {
                    setModeMenuOpen(false);
                    if (currentSessionId) updateSessionMode(currentSessionId, 'PLUS');
                  }}
                  className="w-full text-left px-3 py-2.5 hover:bg-white/5 flex items-center gap-2 text-sm text-slate-200"
                >
                  <Sparkles size={14} className="text-indigo-400" />
                  Plus (Reasoning)
                </button>
                <button 
                  onClick={() => {
                    setModeMenuOpen(false);
                    if (currentSessionId) updateSessionMode(currentSessionId, 'BUSINESS');
                  }}
                  className="w-full text-left px-3 py-2.5 hover:bg-white/5 flex items-center gap-2 text-sm text-slate-200"
                >
                  <Sparkles size={14} className="text-amber-400" />
                  Business (Deep)
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-4 border-l border-white/10 pl-6">
          <label className="flex items-center gap-2 cursor-pointer transition-opacity">
            <div className={`w-8 h-4 rounded-full relative transition-colors ${deepThink ? 'bg-indigo-500' : 'bg-slate-700'}`}>
              <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all ${deepThink ? 'right-0.5' : 'left-0.5'}`} />
            </div>
            <span className="text-xs font-medium text-slate-300">Deep Think</span>
            <input type="checkbox" className="hidden" checked={deepThink} onChange={() => setDeepThink(!deepThink)} />
          </label>
          <label className="flex items-center gap-2 cursor-pointer transition-opacity opacity-50 hover:opacity-100">
            <div className={`w-8 h-4 rounded-full relative transition-colors ${deepResearch ? 'bg-indigo-500' : 'bg-slate-700'}`}>
              <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all ${deepResearch ? 'right-0.5' : 'left-0.5'}`} />
            </div>
            <span className="text-xs font-medium text-slate-300">Deep Research</span>
            <input type="checkbox" className="hidden" checked={deepResearch} onChange={() => setDeepResearch(!deepResearch)} />
          </label>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-lg hover:bg-white/5 transition-all text-slate-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        </button>
        <button className="px-4 py-1.5 rounded-lg bg-white/5 text-xs border border-white/10 font-medium hover:bg-white/10">
          Share Project
        </button>
      </div>
    </header>
  );
}
