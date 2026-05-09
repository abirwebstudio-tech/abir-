import React, { useMemo, useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css'; 
import { Copy, Check, Download, Archive, ThumbsUp, ThumbsDown, RefreshCcw, Brain, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { ChatMessage } from '../types';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export function ChatBlock({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  
  // Look for code blocks to enable ZIP export
  const hasCodeBlocks = useMemo(() => {
    return message.content.includes('\`\`\`');
  }, [message.content]);

  const handleExportZip = async () => {
    const zip = new JSZip();
    const regex = /\`\`\`([a-z]+)?\n([\s\S]*?)\`\`\`/g;
    let match;
    let fileCount = 0;
    
    while ((match = regex.exec(message.content)) !== null) {
      const language = match[1] || 'txt';
      const code = match[2];
      
      // Determine a fake filename or try to guess from previous line
      let filename = `file_${fileCount + 1}.${language}`;
      
      // Look at the line right before the code block to see if there's a filename
      const contentBefore = message.content.substring(0, match.index);
      const linesBefore = contentBefore.split('\n');
      const lastLine = linesBefore[linesBefore.length - 2]?.trim(); // -2 because -1 is empty before backticks typically
      
      if (lastLine && (lastLine.includes('.') && lastLine.length < 50)) {
        // basic heuristic: if it looks like a filename, use it
        const possibleFilename = lastLine.replace(/[\*\`:]/g, '').trim();
        if (possibleFilename.includes('.')) {
          filename = possibleFilename.split('/').pop() || filename;
        }
      }
      
      zip.file(filename, code);
      fileCount++;
    }
    
    if (fileCount > 0) {
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "abir-ai-project.zip");
    }
  };

  const { mainContent, thinkContent } = useMemo(() => {
    const raw = message.content;
    const hasThink = raw.includes('<think>');
    if (!hasThink) return { mainContent: raw, thinkContent: null };

    const thinkStart = raw.indexOf('<think>');
    const thinkEnd = raw.indexOf('</think>');

    if (thinkEnd !== -1) {
      return {
        thinkContent: raw.substring(thinkStart + 7, thinkEnd).trim(),
        mainContent: (raw.substring(0, thinkStart) + raw.substring(thinkEnd + 8)).trim()
      };
    } else {
      return {
        thinkContent: raw.substring(thinkStart + 7).trim(),
        mainContent: raw.substring(0, thinkStart).trim()
      };
    }
  }, [message.content]);

  const [isThinkingOpen, setIsThinkingOpen] = useState(true);

  useEffect(() => {
    if (!message.isGenerating && thinkContent && mainContent) {
      setIsThinkingOpen(false);
    }
  }, [message.isGenerating, thinkContent, mainContent]);

  return (
    <div className="w-full flex justify-center py-2">
      <div className="max-w-4xl w-full px-8 flex gap-4 items-start">
        <div className={cn(
          "w-8 h-8 flex-shrink-0 flex items-center justify-center font-bold text-white",
          isUser ? "bg-slate-700 rounded-full text-xs font-semibold" : "bg-indigo-500 rounded-lg shadow-lg shadow-indigo-500/20"
        )}>
          {isUser ? '' : 'A'}
        </div>
        
        {isUser ? (
          <div className="bg-white/5 rounded-2xl px-5 py-3 border border-white/5 text-sm leading-relaxed max-w-[85%] text-slate-200">
            {message.content}
          </div>
        ) : (
          <div className="flex-1 space-y-4 min-w-0">
            <div className={cn("markdown-body relative pb-10", message.isGenerating && "typing-cursor")}>
              {message.content === '' && message.isGenerating ? (
                 <div className="flex items-center gap-1 h-6">
                   <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                   <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                   <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                 </div>
              ) : (
                <>
                  {thinkContent && (
                    <details 
                      className="mb-4 bg-slate-900/40 border border-slate-700/50 rounded-xl overflow-hidden group shadow-inner relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-indigo-500" 
                      open={isThinkingOpen}
                      onToggle={(e) => setIsThinkingOpen(e.currentTarget.open)}
                    >
                      <summary className="px-5 py-3 cursor-pointer flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-slate-300 hover:bg-white/5 transition-colors select-none">
                        <Brain size={16} className={message.isGenerating && !mainContent ? "animate-pulse text-indigo-400" : "text-slate-500"} />
                        <span className="mt-0.5">Deep Think Process</span>
                        <ChevronDown size={14} className="ml-auto opacity-50 group-open:rotate-180 transition-transform" />
                      </summary>
                      <div className="px-5 pb-4 pt-1 text-[13px] leading-relaxed text-slate-400 border-t border-white/5 mt-1 font-mono">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{thinkContent}</ReactMarkdown>
                      </div>
                    </details>
                  )}
                  {mainContent && (
                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 shadow-xl leading-relaxed">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                        components={{
                          pre: ({ node, ...props }) => (
                            <div className="relative group my-6">
                              <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity right-2 top-2 flex gap-2">
                                 <button className="p-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded border border-white/10 text-xs flex items-center gap-1 active:scale-95 transition-transform" onClick={() => {
                                   const code = node?.children[0]?.children?.[0]?.value;
                                   if(code) navigator.clipboard.writeText(code);
                                 }}>
                                   <Copy size={14} /> Copy
                                 </button>
                              </div>
                              <pre {...props} />
                            </div>
                          )
                        }}
                      >
                        {mainContent}
                      </ReactMarkdown>
                    </div>
                  )}
                  
                  {hasCodeBlocks && (
                    <div className="mt-4 pt-4 border-t border-white/5 flex gap-3">
                      <button 
                        onClick={handleExportZip}
                        className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-lg text-sm font-medium transition-colors"
                      >
                        <Archive size={16} /> Export as ZIP
                      </button>
                    </div>
                  )}

                  {!message.isGenerating && (
                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2">
                       <button className="p-2 text-slate-500 hover:text-slate-300 hover:bg-white/5 rounded-lg transition-colors group relative" title="Good response">
                         <ThumbsUp size={16} />
                       </button>
                       <button className="p-2 text-slate-500 hover:text-slate-300 hover:bg-white/5 rounded-lg transition-colors group relative" title="Poor response">
                         <ThumbsDown size={16} />
                       </button>
                       <button className="p-2 text-slate-500 hover:text-slate-300 hover:bg-white/5 rounded-lg transition-colors group relative" title="Regenerate">
                         <RefreshCcw size={16} />
                       </button>
                       <button 
                         className="p-2 text-slate-500 hover:text-slate-300 hover:bg-white/5 rounded-lg transition-colors group relative ml-auto flex items-center gap-2 text-xs font-semibold uppercase tracking-wider" 
                         title="Copy text"
                         onClick={() => navigator.clipboard.writeText(message.content)}
                       >
                         <Copy size={16} /> Copy
                       </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
