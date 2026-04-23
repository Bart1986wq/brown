import React, { useState } from 'react';
import { BookChapter, AuthorMix, Snippet } from '../types';
import { generateBookMeta } from '../services/geminiService';
import { SparklesIcon, CopyIcon, RefreshIcon, ArchiveBoxIcon, ArrowRightCircleIcon, TrashIcon } from './Icons';

interface BookBuilderProps {
  chapters: BookChapter[];
  authorMix: AuthorMix;
  onUpdateChapters: (chapters: BookChapter[]) => void;
  snippets: Snippet[];
  onUpdateSnippets: (snippets: Snippet[]) => void;
  onGenerateMasterPrompt?: () => void;
  onQuotaExceeded?: () => void;
}

export const BookBuilder: React.FC<BookBuilderProps> = ({ 
  chapters, 
  authorMix, 
  onUpdateChapters, 
  snippets, 
  onUpdateSnippets, 
  onGenerateMasterPrompt,
  onQuotaExceeded 
}) => {
  const [loading, setLoading] = useState(false);
  const [metaResult, setMetaResult] = useState<string | null>(null);

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newChapters = [...chapters];
    if (direction === 'up' && index > 0) {
      [newChapters[index], newChapters[index - 1]] = [newChapters[index - 1], newChapters[index]];
    } else if (direction === 'down' && index < newChapters.length - 1) {
      [newChapters[index], newChapters[index + 1]] = [newChapters[index + 1], newChapters[index]];
    }
    onUpdateChapters(newChapters);
  };

  const handleDelete = (index: number) => {
    if (confirm("Are you sure you want to delete this chapter?")) {
      const newChapters = [...chapters];
      newChapters.splice(index, 1);
      onUpdateChapters(newChapters);
    }
  };

  const handleSnippetDelete = (index: number) => {
      if (confirm("Remove this snippet from Commonplace Book?")) {
          const newSnippets = [...snippets];
          newSnippets.splice(index, 1);
          onUpdateSnippets(newSnippets);
      }
  }

  const handleSnippetToChapter = (snippet: Snippet) => {
      if (confirm("Convert snippet to a new Chapter?")) {
          const newChapter: BookChapter = {
              id: Date.now().toString(),
              title: `Note: ${new Date(snippet.timestamp).toLocaleTimeString()}`,
              content: snippet.content,
              timestamp: Date.now()
          };
          onUpdateChapters([...chapters, newChapter]);
      }
  }

  const handleCopySnippet = (text: string) => {
      navigator.clipboard.writeText(text);
      alert("Snippet copied!");
  }

  const handleGenerateMeta = async () => {
    if (chapters.length === 0) return;
    setLoading(true);
    setMetaResult(null);
    try {
      const result = await generateBookMeta(chapters, authorMix);
      setMetaResult(result);
    } catch (error: any) {
      if (onQuotaExceeded && (error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED'))) {
        onQuotaExceeded();
      } else {
        alert("Failed to analyze book.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadManuscript = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    let content = `STRANDLINE MANUSCRIPT\nCompiled: ${new Date().toLocaleString()}\n\n`;
    
    chapters.forEach((chapter, index) => {
      content += `CHAPTER ${index + 1}\n${chapter.title}\n\n`;
      content += `${chapter.content}\n\n`;
      content += `* * *\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Manuscript-${timestamp}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4 border-b border-strand-200 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
           <h2 className="text-2xl font-serif text-strand-800">Module G: Book Builder</h2>
           <p className="text-strand-600 text-sm">
             Assemble your seeds and drafts into a coherent manuscript.
           </p>
        </div>
        <div className="flex gap-2">
            <button
                onClick={onGenerateMasterPrompt}
                disabled={chapters.length === 0 || loading}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold text-xs transition-colors ${loading ? 'bg-strand-200 text-strand-500' : 'bg-strand-100 text-strand-700 hover:bg-strand-200'}`}
            >
                <SparklesIcon className="w-4 h-4" />
                Master Prompt
            </button>
            <button
                onClick={handleGenerateMeta}
                disabled={chapters.length === 0 || loading}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold text-xs transition-colors ${loading ? 'bg-strand-200 text-strand-500' : 'bg-white border border-strand-300 text-strand-700 hover:bg-strand-50'}`}
            >
                {loading ? <RefreshIcon className="w-4 h-4 animate-spin" /> : <SparklesIcon className="w-4 h-4" />}
                Analyze Structure
            </button>
            <button
                onClick={handleDownloadManuscript}
                disabled={chapters.length === 0}
                className="flex items-center gap-2 bg-strand-800 text-white px-4 py-2 rounded-md hover:bg-strand-900 transition-colors text-xs font-semibold"
            >
                <CopyIcon className="w-4 h-4" />
                Export Manuscript
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Col: Chapter List */}
        <div className="lg:col-span-2 space-y-4">
           <h3 className="font-bold text-strand-700 uppercase text-xs tracking-wider border-b border-strand-200 pb-2">Manuscript</h3>
           {chapters.length === 0 ? (
             <div className="border-2 border-dashed border-strand-200 rounded-xl p-12 text-center text-strand-400">
               <p className="mb-2">No chapters yet.</p>
               <p className="text-xs">Use the "Save to Book" button in Prose Builder or Revision Engine to add content here.</p>
             </div>
           ) : (
             <div className="space-y-4">
               {chapters.map((chapter, index) => (
                 <div key={chapter.id} className="bg-white border border-strand-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-serif font-bold text-strand-800 text-lg">
                        <span className="text-strand-400 font-sans text-xs uppercase tracking-wider mr-2">Ch {index + 1}</span>
                        {chapter.title}
                      </h3>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => handleMove(index, 'up')}
                          disabled={index === 0}
                          className="p-1 hover:bg-strand-100 rounded text-strand-500 disabled:opacity-30"
                        >
                          ↑
                        </button>
                        <button 
                          onClick={() => handleMove(index, 'down')}
                          disabled={index === chapters.length - 1}
                          className="p-1 hover:bg-strand-100 rounded text-strand-500 disabled:opacity-30"
                        >
                          ↓
                        </button>
                        <button 
                          onClick={() => handleDelete(index)}
                          className="p-1 hover:bg-red-50 text-red-400 hover:text-red-600 rounded ml-2"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    <div className="text-sm text-strand-600 line-clamp-3 font-serif leading-relaxed">
                      {chapter.content}
                    </div>
                 </div>
               ))}
             </div>
           )}
        </div>

        {/* Middle Col: Analysis */}
        <div className="lg:col-span-1 space-y-4">
           <h3 className="font-bold text-strand-700 uppercase text-xs tracking-wider border-b border-strand-200 pb-2">Meta Analysis</h3>
           <div className="bg-strand-50 rounded-xl p-6 border border-strand-200 h-full min-h-[300px]">
              {metaResult ? (
                <div className="prose prose-sm prose-stone font-serif">
                   <pre className="whitespace-pre-wrap font-serif text-sm leading-relaxed text-strand-800 font-normal">
                      {metaResult}
                   </pre>
                </div>
              ) : (
                <p className="text-strand-400 text-sm italic">
                  Generate an analysis to see thematic threads and synopsis suggestions based on your collected chapters.
                </p>
              )}
           </div>
        </div>

        {/* Right Col: Commonplace Book */}
        <div className="lg:col-span-1 space-y-4">
            <h3 className="font-bold text-strand-700 uppercase text-xs tracking-wider border-b border-strand-200 pb-2 flex items-center gap-2">
                <ArchiveBoxIcon className="w-4 h-4" />
                Commonplace Book
            </h3>
            {snippets.length === 0 ? (
                <div className="bg-strand-50 border border-strand-200 rounded-lg p-6 text-center text-strand-400 text-xs italic">
                    Select text in Prose/Revision modules and confirm to save snippets here.
                </div>
            ) : (
                <div className="space-y-3">
                    {snippets.map((snippet, idx) => (
                        <div key={snippet.id} className="bg-white p-3 rounded border border-strand-200 shadow-sm text-xs space-y-2">
                             <p className="font-serif italic text-strand-800 leading-relaxed border-l-2 border-strand-300 pl-2">
                                 "{snippet.content}"
                             </p>
                             <div className="flex justify-between items-center text-[10px] text-strand-400 pt-1 border-t border-strand-100">
                                 <span>{new Date(snippet.timestamp).toLocaleTimeString()}</span>
                                 <div className="flex gap-1">
                                     <button 
                                        onClick={() => handleCopySnippet(snippet.content)} 
                                        className="p-1 hover:bg-strand-100 rounded text-strand-500 hover:text-strand-800 transition-colors"
                                        title="Copy to Clipboard"
                                     >
                                         <CopyIcon className="w-3.5 h-3.5" />
                                     </button>
                                     <button 
                                        onClick={() => handleSnippetToChapter(snippet)} 
                                        className="p-1 hover:bg-strand-100 rounded text-strand-500 hover:text-strand-800 transition-colors"
                                        title="Convert to Chapter"
                                     >
                                         <ArrowRightCircleIcon className="w-3.5 h-3.5" />
                                     </button>
                                     <button 
                                        onClick={() => handleSnippetDelete(idx)} 
                                        className="p-1 hover:bg-red-50 rounded text-red-300 hover:text-red-500 transition-colors"
                                        title="Delete Snippet"
                                     >
                                         <TrashIcon className="w-3.5 h-3.5" />
                                     </button>
                                 </div>
                             </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
