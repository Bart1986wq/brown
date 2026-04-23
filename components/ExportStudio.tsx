
import React from 'react';
import { AuthorMix } from '../types';
import { SparklesIcon } from './Icons';

interface ExportStudioProps {
  authorMix: AuthorMix;
  seed: string;
  expansion: string;
  draft: string;
  revision: string;
  onAddToBook?: (title: string, content: string) => void;
}

export const ExportStudio: React.FC<ExportStudioProps> = ({ authorMix, seed, expansion, draft, revision, onAddToBook }) => {
  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const activeAuthors = Object.entries(authorMix).filter(([_, v]) => (v as number) > 0);

  const getWordCount = (text: string | null) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
  }

  const handleDownload = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    
    let content = `STRANDLINE STUDIO - PROJECT EXPORT\n`;
    content += `Date: ${new Date().toLocaleString()}\n`;
    content += `==========================================\n\n`;

    content += `[VOICE MIX DNA]\n`;
    if (activeAuthors.length > 0) {
        activeAuthors.forEach(([k, v]) => {
            content += `- ${k}: ${v}%\n`;
        });
    } else {
        content += `- Neutral / Standard Strandline\n`;
    }
    content += `\n==========================================\n\n`;

    content += `[1. NARRATIVE SEED]\n\n${seed || "(No seed generated)"}\n\n`;
    content += `==========================================\n\n`;

    content += `[2. EXPANDED STRUCTURE]\n\n${expansion || "(No expansion generated)"}\n\n`;
    content += `==========================================\n\n`;

    content += `[3. DRAFT PROSE]\nWord Count: ${getWordCount(draft)}\n\n${draft || "(No draft generated)"}\n\n`;
    content += `==========================================\n\n`;

    content += `[4. FINAL REVISION]\nWord Count: ${getWordCount(revision)}\n\n${revision || "(No revision generated)"}\n\n`;
    content += `==========================================\n`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Strandline-Project-${timestamp}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleSaveToBook = (text: string, defaultTitle: string) => {
    if (!text || !onAddToBook) return;
    const title = prompt("Enter Chapter Title:", defaultTitle);
    if (title) {
        onAddToBook(title, text);
    }
  }

  return (
    <div className="space-y-8">
        <div className="space-y-4 border-b border-strand-200 pb-4">
            <h2 className="text-2xl font-serif text-strand-800">Module F: Export Studio</h2>
            <p className="text-strand-600 text-sm">
            Review your entire project pipeline and export artifacts.
            </p>
        </div>

        {/* Project Meta */}
        <div className="bg-strand-100 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
             <div>
                <h3 className="text-xs font-bold text-strand-500 uppercase mb-2">Project Voice DNA</h3>
                <div className="flex flex-wrap gap-2">
                    {activeAuthors.length > 0 ? activeAuthors.map(([k, v]) => (
                        <span key={k} className="bg-white px-2 py-1 rounded text-xs text-strand-700 border border-strand-200">
                            {k}: {v}%
                        </span>
                    )) : <span className="text-xs text-strand-500 italic">Neutral Voice</span>}
                </div>
             </div>
             <button 
                onClick={handleDownload}
                className="flex items-center gap-2 bg-strand-800 text-white px-4 py-2 rounded-md shadow-sm hover:bg-strand-900 transition-colors text-sm font-semibold"
             >
                <SparklesIcon className="w-4 h-4" />
                Download Project (.txt)
             </button>
        </div>

        <div className="grid grid-cols-1 gap-8">
            {/* Artifact 1: Seed */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold text-strand-800 uppercase">1. Narrative Seed</h4>
                    <button onClick={() => handleCopy(seed)} className="text-xs text-strand-500 hover:text-strand-900 underline">Copy</button>
                </div>
                <textarea readOnly value={seed} className="w-full h-24 bg-white border border-strand-200 rounded p-2 text-xs text-strand-600 resize-none" />
            </div>

            {/* Artifact 2: Expansion */}
            <div className="space-y-2">
                 <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold text-strand-800 uppercase">2. Expanded Outline</h4>
                    <button onClick={() => handleCopy(expansion)} className="text-xs text-strand-500 hover:text-strand-900 underline">Copy</button>
                </div>
                <textarea readOnly value={expansion} className="w-full h-32 bg-white border border-strand-200 rounded p-2 text-xs text-strand-600 resize-none" />
            </div>

             {/* Artifact 3: Draft */}
             <div className="space-y-2">
                 <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold text-strand-800 uppercase">
                        3. First Draft <span className="text-strand-400 font-mono font-normal ml-2">({getWordCount(draft)} words)</span>
                    </h4>
                    <div className="flex gap-2">
                        <button onClick={() => handleSaveToBook(draft, 'First Draft')} className="text-xs text-strand-600 hover:text-strand-900 bg-strand-50 px-2 py-0.5 rounded border border-strand-200">+ Save as Chapter</button>
                        <button onClick={() => handleCopy(draft)} className="text-xs text-strand-500 hover:text-strand-900 underline">Copy</button>
                    </div>
                </div>
                <textarea readOnly value={draft} className="w-full h-48 bg-white border border-strand-200 rounded p-2 text-xs text-strand-600 resize-none font-serif" />
            </div>

             {/* Artifact 4: Final */}
             <div className="space-y-2">
                 <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold text-strand-800 uppercase">
                        4. Revised Final <span className="text-strand-400 font-mono font-normal ml-2">({getWordCount(revision)} words)</span>
                    </h4>
                    <div className="flex gap-2">
                         <button onClick={() => handleSaveToBook(revision, 'Final Revision')} className="text-xs text-strand-600 hover:text-strand-900 bg-strand-50 px-2 py-0.5 rounded border border-strand-200">+ Save as Chapter</button>
                        <button onClick={() => handleCopy(revision)} className="text-xs text-strand-500 hover:text-strand-900 underline">Copy</button>
                    </div>
                </div>
                <div className="w-full h-auto min-h-[200px] bg-strand-50 border-2 border-strand-800 rounded p-6 text-base text-strand-900 font-serif leading-relaxed">
                    {revision || <span className="text-strand-400 italic">No final revision generated yet.</span>}
                </div>
            </div>
            
            {/* Bottom Download Button (Redundant but useful for long scrolling pages) */}
             <div className="flex justify-center pt-8">
                 <button 
                    onClick={handleDownload}
                    className="flex items-center gap-2 bg-strand-800 text-white px-8 py-4 rounded-full shadow-lg hover:bg-strand-900 transition-transform transform hover:-translate-y-1 text-base font-bold font-serif"
                 >
                    <SparklesIcon className="w-5 h-5" />
                    Download Full Project
                 </button>
             </div>
        </div>
    </div>
  );
};
