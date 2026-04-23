
import React, { useState, useEffect } from 'react';
import { ExpansionMode, SeedExpansionParams, AuthorMix, ExpansionDepth, ExpansionLength, ExpansionFormat } from '../types';
import { expandStrandlineSeed, generateWritingPrompt } from '../services/geminiService';
import { StyledSelect, StyledInput } from './InputGroup';
import { SparklesIcon, RefreshIcon, ClipboardIcon } from './Icons';
import { PromptModal } from './PromptModal';

interface SeedExpanderProps {
  authorMix: AuthorMix;
  initialSeed?: string;
  onExpansionComplete?: (text: string) => void;
  onQuotaExceeded?: () => void;
}

export const SeedExpander: React.FC<SeedExpanderProps> = ({ authorMix, initialSeed, onExpansionComplete, onQuotaExceeded }) => {
  const [seedText, setSeedText] = useState(initialSeed || '');
  const [expansionMode, setExpansionMode] = useState<ExpansionMode>(ExpansionMode.SensoryMap);
  const [expansionDepth, setExpansionDepth] = useState<ExpansionDepth>(ExpansionDepth.Standard);
  const [expansionLength, setExpansionLength] = useState<ExpansionLength>(ExpansionLength.Standard);
  const [expansionFormat, setExpansionFormat] = useState<ExpansionFormat>(ExpansionFormat.BulletPoints);
  const [customFocus, setCustomFocus] = useState('');
  const [includeMotifTimeline, setIncludeMotifTimeline] = useState(true);
  const [includeFactSheet, setIncludeFactSheet] = useState(true);
  
  const [loading, setLoading] = useState(false);
  const [promptLoading, setPromptLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState('');

  // Update local state if prop changes
  useEffect(() => {
    if (initialSeed) {
        setSeedText(initialSeed);
        if (initialSeed.includes('COMBINED NARRATIVE INPUT') || initialSeed.includes('SERIES CONTINUITY MODE')) {
            setExpansionMode(ExpansionMode.ContinuityMap);
        }
    }
  }, [initialSeed]);

  const handleExpand = async () => {
    if (!seedText.trim()) return;
    
    setLoading(true);
    setResult(null);
    try {
      const expansion = await expandStrandlineSeed({ 
          seedText, 
          expansionMode,
          customFocus,
          expansionDepth,
          expansionLength,
          expansionFormat,
          includeMotifTimeline,
          includeFactSheet
      }, authorMix);
      setResult(expansion);
      if (onExpansionComplete) {
        onExpansionComplete(expansion);
      }
    } catch (error: any) {
      if (onQuotaExceeded && (error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED'))) {
        onQuotaExceeded();
      } else {
        alert("Failed to expand seed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateWritingPrompt = async () => {
    if (!seedText.trim()) return;
    
    setPromptLoading(true);
    try {
      const prompt = await generateWritingPrompt(seedText, authorMix, result || undefined);
      setGeneratedPrompt(prompt);
      setIsPromptModalOpen(true);
    } catch (error: any) {
      alert("Failed to generate writing prompt.");
    } finally {
      setPromptLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
             <div>
                <h2 className="text-2xl font-serif text-strand-800">Module C: Seed Expander</h2>
                <p className="text-strand-600 text-sm">
                Transform a narrative seed into a structure using your <strong>Voice Mix</strong>.
                </p>
             </div>
             <div className="text-xs bg-strand-200 text-strand-700 px-2 py-1 rounded font-mono">
                Input: Seed Text
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-strand-500 uppercase tracking-wider pl-1">
                    Source Seed (Input)
                </label>
                <textarea
                    value={seedText}
                    onChange={(e) => setSeedText(e.target.value)}
                    placeholder="Paste your generated seed here..."
                    className="w-full h-48 bg-white border border-strand-300 text-strand-800 text-sm rounded-md p-4 focus:outline-none focus:ring-2 focus:ring-strand-400 focus:border-transparent transition-shadow placeholder-strand-300 resize-y font-serif leading-relaxed"
                />
            </div>
            
            <div className="bg-strand-50 border border-strand-200 rounded-lg p-4 space-y-3">
                 <h4 className="text-xs font-bold text-strand-500 uppercase">Steering Instructions</h4>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <StyledSelect
                        label="Detail Density"
                        options={Object.values(ExpansionDepth)}
                        value={expansionDepth}
                        onChange={(e) => setExpansionDepth(e.target.value as ExpansionDepth)}
                    />
                    <StyledSelect
                        label="Target Length"
                        options={Object.values(ExpansionLength)}
                        value={expansionLength}
                        onChange={(e) => setExpansionLength(e.target.value as ExpansionLength)}
                    />
                     <StyledSelect
                        label="Output Format"
                        options={Object.values(ExpansionFormat)}
                        value={expansionFormat}
                        onChange={(e) => setExpansionFormat(e.target.value as ExpansionFormat)}
                    />
                    <StyledInput
                        label="Custom Focus Directive"
                        placeholder="e.g. Focus on the decay..."
                        value={customFocus}
                        onChange={(e) => setCustomFocus(e.target.value)}
                    />
                 </div>
                 <div className="flex gap-6 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative">
                            <input 
                                type="checkbox" 
                                checked={includeMotifTimeline}
                                onChange={(e) => setIncludeMotifTimeline(e.target.checked)}
                                className="sr-only"
                            />
                            <div className={`w-8 h-4 rounded-full transition-colors ${includeMotifTimeline ? 'bg-strand-700' : 'bg-strand-300'}`}></div>
                            <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${includeMotifTimeline ? 'translate-x-4' : 'translate-x-0'}`}></div>
                        </div>
                        <span className="text-[10px] font-bold text-strand-600 uppercase tracking-tight group-hover:text-strand-800 transition-colors">Include Motif Map</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative">
                            <input 
                                type="checkbox" 
                                checked={includeFactSheet}
                                onChange={(e) => setIncludeFactSheet(e.target.checked)}
                                className="sr-only"
                            />
                            <div className={`w-8 h-4 rounded-full transition-colors ${includeFactSheet ? 'bg-strand-700' : 'bg-strand-300'}`}></div>
                            <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${includeFactSheet ? 'translate-x-4' : 'translate-x-0'}`}></div>
                        </div>
                        <span className="text-[10px] font-bold text-strand-600 uppercase tracking-tight group-hover:text-strand-800 transition-colors">Include Fact Sheet</span>
                    </label>
                 </div>
            </div>
        </div>

        <div className="space-y-6">
             <StyledSelect
                label="Expansion Mode"
                options={Object.values(ExpansionMode)}
                value={expansionMode}
                onChange={(e) => setExpansionMode(e.target.value as ExpansionMode)}
            />
            
            <div className="bg-strand-100 rounded-lg p-4 border border-strand-200">
                <h4 className="text-xs font-bold text-strand-500 uppercase mb-2">Active Voice Mix</h4>
                <div className="text-xs text-strand-600 space-y-1">
                    {Object.entries(authorMix)
                        .filter(([_, val]) => (val as number) > 0)
                        .map(([key, val]) => (
                            <div key={key} className="flex justify-between">
                                <span className="capitalize">{key}</span>
                                <span className="font-mono">{val as number}%</span>
                            </div>
                        ))}
                    {Object.values(authorMix).every(v => (v as number) === 0) && (
                        <span className="italic opacity-70">Neutral / Standard Strandline</span>
                    )}
                </div>
            </div>

            <button
                onClick={handleExpand}
                disabled={loading || !seedText}
                className={`
                  w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full font-serif font-bold text-base shadow-md transition-all
                  ${loading || !seedText
                    ? 'bg-strand-200 text-strand-400 cursor-not-allowed' 
                    : 'bg-strand-800 text-white hover:bg-strand-900'
                  }
                `}
            >
                {loading ? (
                  <>
                    <RefreshIcon className="w-4 h-4 animate-spin" />
                    <span>Expanding...</span>
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-4 h-4" />
                    <span>Expand Seed</span>
                  </>
                )}
            </button>
        </div>
      </div>

      {result && (
        <div className="bg-white rounded-xl shadow-md border border-strand-200 p-8 relative animate-in fade-in duration-500 mt-8">
            <div className="absolute top-0 left-0 w-1 h-full bg-strand-400 rounded-l-xl"></div>
             <div className="absolute top-0 right-0 px-4 py-2 bg-strand-100 rounded-bl-lg text-xs font-bold text-strand-600 uppercase tracking-wider">
               Expansion Output
             </div>
             <div className="absolute bottom-4 right-4">
                <button 
                    onClick={handleGenerateWritingPrompt}
                    disabled={promptLoading}
                    className="flex items-center gap-2 bg-strand-50 border border-strand-200 text-strand-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-strand-100 transition-all shadow-sm"
                >
                    {promptLoading ? <RefreshIcon className="w-4 h-4 animate-spin" /> : <ClipboardIcon className="w-4 h-4" />}
                    {promptLoading ? 'Architecting...' : 'Prompt Architect'}
                </button>
             </div>
             <pre className="whitespace-pre-wrap font-serif text-sm sm:text-base leading-relaxed text-strand-800 font-normal pb-12">
                {result}
             </pre>
             <div className="mt-4 pt-4 border-t border-strand-100 text-center text-strand-500 text-sm italic">
                Output automatically available in <strong>Prose Builder</strong>.
             </div>
         </div>
      )}
      <PromptModal 
        isOpen={isPromptModalOpen}
        onClose={() => setIsPromptModalOpen(false)}
        prompt={generatedPrompt}
        title="Master Writing Prompt"
      />
    </div>
  );
};
