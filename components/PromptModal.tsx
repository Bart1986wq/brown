
import React, { useState } from 'react';
import { CopyIcon, CheckIcon } from './Icons';

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: string;
  title?: string;
}

export const PromptModal: React.FC<PromptModalProps> = ({ isOpen, onClose, prompt, title = "Prompt Architect" }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-strand-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-strand-200 w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-strand-100 flex items-center justify-between bg-strand-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-strand-800 rounded-lg flex items-center justify-center text-white">
              <span className="font-mono font-bold text-xs">{">_"}</span>
            </div>
            <h3 className="font-serif font-bold text-strand-800">{title}</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-strand-400 hover:text-strand-800 transition-colors p-1"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-[11px] text-amber-800 leading-relaxed">
            <strong>HOW TO USE:</strong> Copy this prompt and paste it into Claude, ChatGPT, or your preferred AI writing assistant. It is pre-configured with your specific authorial voice, narrative motifs, and structural guidance.
          </div>
          
          <div className="relative group">
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                    onClick={handleCopy}
                    className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-md transition-all shadow-sm ${copied ? 'bg-green-500 text-white' : 'bg-strand-800 text-white hover:bg-strand-900'}`}
                >
                    {copied ? <CheckIcon className="w-3 h-3" /> : <CopyIcon className="w-3 h-3" />}
                    {copied ? 'COPIED' : 'COPY PROMPT'}
                </button>
            </div>
            <div className="bg-strand-50 border border-strand-200 rounded-xl p-6 font-mono text-xs sm:text-sm text-strand-700 leading-relaxed whitespace-pre-wrap min-h-[200px]">
                {prompt}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-strand-100 bg-strand-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-white border border-strand-200 rounded-full text-xs font-bold text-strand-600 hover:text-strand-900 hover:border-strand-400 transition-all shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
      <div className="absolute inset-0 -z-10" onClick={onClose}></div>
    </div>
  );
};
