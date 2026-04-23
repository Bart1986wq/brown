import React, { useState } from 'react';
import { SparklesIcon, CopyIcon, CheckIcon, ClipboardIcon, RefreshIcon } from './Icons';
import { generateWritingPrompt } from '../services/geminiService';
import { AuthorMix } from '../types';
import { PromptModal } from './PromptModal';
import { DEFAULT_AUTHOR_MIX } from '../constants';

interface SeedResultProps {
  result: string;
  onUseSeed?: (text: string) => void;
  authorMix?: AuthorMix;
}

export const SeedResult: React.FC<SeedResultProps> = ({ result, onUseSeed, authorMix = DEFAULT_AUTHOR_MIX }) => {
  const [copied, setCopied] = useState(false);
  const [promptLoading, setPromptLoading] = useState(false);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState('');

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateWritingPrompt = async () => {
    setPromptLoading(true);
    try {
      const prompt = await generateWritingPrompt(result, authorMix);
      setGeneratedPrompt(prompt);
      setIsPromptModalOpen(true);
    } catch (error: any) {
      alert("Failed to generate writing prompt.");
    } finally {
      setPromptLoading(false);
    }
  };

  return (
    <section className="animate-in fade-in slide-in-from-bottom-8 duration-700 pb-10">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-sm font-bold text-strand-400 uppercase tracking-widest">Generated Packet</h3>
        <div className="flex gap-2">
          <button 
            onClick={handleGenerateWritingPrompt}
            disabled={promptLoading}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md transition-colors bg-strand-100 text-strand-700 hover:bg-strand-200 border border-strand-200 shadow-sm"
          >
            {promptLoading ? <RefreshIcon className="w-4 h-4 animate-spin" /> : <ClipboardIcon className="w-4 h-4" />}
            {promptLoading ? 'Architecting...' : 'Prompt Architect'}
          </button>
          {onUseSeed && (
            <button 
              onClick={() => onUseSeed(result)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md transition-colors bg-strand-800 text-white hover:bg-strand-900 shadow-md"
            >
              <SparklesIcon className="w-4 h-4" />
              Use Packet in Expander
            </button>
          )}
          <button 
            onClick={handleCopy}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${copied ? 'bg-green-100 text-green-700' : 'bg-white text-strand-600 hover:text-strand-900 border border-strand-200'}`}
          >
            {copied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-md border border-strand-200 p-8 sm:p-12 relative">
        <pre className="whitespace-pre-wrap font-serif text-sm sm:text-base leading-relaxed text-strand-800 font-normal border-l-4 border-strand-300 pl-6">
          {result}
        </pre>
      </div>

      <PromptModal 
        isOpen={isPromptModalOpen}
        onClose={() => setIsPromptModalOpen(false)}
        prompt={generatedPrompt}
        title="Master Writing Prompt"
      />
    </section>
  );
};