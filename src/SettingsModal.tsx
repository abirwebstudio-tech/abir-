import React from 'react';
import { useStore } from '../store';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Moon, Sun, Mail } from 'lucide-react';

export function SettingsModal() {
  const { settingsOpen, setSettingsOpen, theme, setTheme } = useStore();

  if (!settingsOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSettingsOpen(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        {/* Modal */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md glass-panel rounded-2xl p-6 border border-white/10 shadow-2xl flex flex-col gap-6"
        >
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Settings</h2>
            <button 
              onClick={() => setSettingsOpen(false)}
              className="p-2 -mr-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Account Connect */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account</label>
              <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white text-slate-900 font-semibold text-sm hover:scale-[1.02] active:scale-[0.98] transition-transform">
                <Mail size={18} />
                Connect with Google
              </button>
            </div>

            {/* Theme Toggle */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Appearance</label>
              <div className="flex gap-2">
                <button 
                  onClick={() => setTheme('dark')}
                  className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all ${
                    theme === 'dark' 
                      ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                      : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  <Moon size={16} /> Dark
                </button>
                <button 
                  onClick={() => setTheme('light')}
                  className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all ${
                    theme === 'light' 
                      ? 'bg-blue-300 text-slate-900 shadow-lg' 
                      : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  <Sun size={16} /> Light
                </button>
              </div>
            </div>
            
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
