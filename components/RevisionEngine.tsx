
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RevisionFocus, RevisionParams, AuthorMix, WeatherEvent, AuthorId, SentenceCadence, BookChapter } from '../types';
import { reviseStrandlineProse, applyWeatherOverlay } from '../services/geminiService';
import { computeDiff } from '../utils/diff';
import { StyledSelect } from './InputGroup';
import { Slider } from './Slider';
import { SparklesIcon, RefreshIcon, ArchiveBoxIcon, CloudIcon, InfoIcon } from './Icons';
import { AUTHOR_DEFINITIONS } from '../constants';

interface RevisionEngineProps {
  authorMix: AuthorMix;
  initialDraft?: string;
  bookChapters?: BookChapter[];
  onRevisionComplete?: (text: string) => void;
  onAddToBook?: (title: string, content: string) => void;
  onSaveSnippet?: (text: string) => void;
  onQuotaExceeded?: () => void;
}

export const RevisionEngine: React.FC<RevisionEngineProps> = ({ authorMix, initialDraft, bookChapters = [], onRevisionComplete, onAddToBook, onSaveSnippet, onQuotaExceeded }) => {
  const [draftText, setDraftText] = useState(initialDraft || '');
  const [revisionFocus, setRevisionFocus] = useState<RevisionFocus>(RevisionFocus.EnhanceEcology);
  const [weatherEvent, setWeatherEvent] = useState<WeatherEvent>(WeatherEvent.CoastalSquall);
  
  // Sensory Tuner State
  const [abstraction, setAbstraction] = useState(50);
  const [temperature, setTemperature] = useState(50);
  const [humanPresence, setHumanPresence] = useState(50);

  // Advanced Editorial Controls
  const [primaryAuthorId, setPrimaryAuthorId] = useState<AuthorId | ''>('');
  const [ghostAuthorId, setGhostAuthorId] = useState<AuthorId | ''>('');
  const [cadence, setCadence] = useState<SentenceCadence>(SentenceCadence.Standard);
  const [forceSensoryAnchoring, setForceSensoryAnchoring] = useState(true);

  const [loading, setLoading] = useState(false);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [chapterTitle, setChapterTitle] = useState('');
  
  // View State
  const [showDiff, setShowDiff] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  // Marginalia State
  const [marginaliaNote, setMarginaliaNote] = useState('');
  const [selectedText, setSelectedText] = useState('');

  // Snippet UI State
  const [snippetMenu, setSnippetMenu] = useState<{top: number, left: number, text: string} | null>(null);

  useEffect(() => {
    if (initialDraft) setDraftText(initialDraft);
  }, [initialDraft]);

  // Handle Selection Change to clear menu
  useEffect(() => {
    const handleSelectionChange = () => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) {
            setSnippetMenu(null);
        }
    };
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  const handleRevise = async () => {
    if (!draftText.trim()) return;
    
    setLoading(true);
    setResult(null);
    setShowDiff(false);
    try {
      const revised = await reviseStrandlineProse({ 
        draftText, 
        revisionFocus,
        sensoryTuner: { abstraction, temperature, humanPresence },
        marginaliaNote: revisionFocus === RevisionFocus.Marginalia ? marginaliaNote : undefined,
        selectedText: revisionFocus === RevisionFocus.Marginalia ? selectedText : undefined,
        primaryAuthorId: primaryAuthorId || undefined,
        ghostAuthorId: ghostAuthorId || undefined,
        cadence,
        forceSensoryAnchoring
      }, authorMix);
      setResult(revised);
      if (onRevisionComplete) {
        onRevisionComplete(revised);
      }
      // Clear marginalia after successful edit
      if (revisionFocus === RevisionFocus.Marginalia) {
        setMarginaliaNote('');
        setSelectedText('');
      }
    } catch (error: any) {
      if (onQuotaExceeded && (error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED'))) {
        onQuotaExceeded();
      } else {
        alert("Failed to revise prose.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleWeatherOverlay = async () => {
    if (!draftText.trim()) return;
    setLoadingWeather(true);
    setResult(null);
    setShowDiff(false);
    try {
      const revised = await applyWeatherOverlay(draftText, weatherEvent, authorMix);
      setResult(revised);
      if (onRevisionComplete) {
        onRevisionComplete(revised);
      }
    } catch (error: any) {
      if (onQuotaExceeded && (error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED'))) {
        onQuotaExceeded();
      } else {
        alert("Failed to apply weather overlay.");
      }
    } finally {
      setLoadingWeather(false);
    }
  };

  const handleSaveToBook = () => {
    if (result && onAddToBook) {
        const title = chapterTitle || `Revised Prose ${new Date().toLocaleTimeString()}`;
        onAddToBook(title, result);
        setChapterTitle('');
    }
  }

  const handleTextSelection = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim() || '';
      
      if (text.length > 0) {
          setSelectedText(text);
          if (onSaveSnippet) {
              const range = selection!.getRangeAt(0);
              const rect = range.getBoundingClientRect();
              setSnippetMenu({
                  top: rect.top,
                  left: rect.left + (rect.width / 2),
                  text: text
              });
          }
      } else {
          setSnippetMenu(null);
      }
  }

  const handleSaveSnippet = () => {
      if (snippetMenu && onSaveSnippet) {
          onSaveSnippet(snippetMenu.text);
          setSnippetMenu(null);
          window.getSelection()?.removeAllRanges();
      }
  }

  const getWordCount = (text: string | null) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
  }

  const renderDiff = () => {
      if (!result) return null;
      const diff = computeDiff(draftText, result);
      return (
          <div className="font-serif text-sm leading-relaxed whitespace-pre-wrap">
              {diff.map((part, i) => (
                  <span 
                    key={i} 
                    className={`
                        ${part.added ? 'bg-green-100 text-green-800' : ''}
                        ${part.removed ? 'bg-red-100 text-red-800 line-through decoration-red-400 opacity-60' : ''}
                    `}
                  >
                      {part.value}{' '}
                  </span>
              ))}
          </div>
      )
  }

  return (
    <div className="space-y-8 relative">
       {/* Floating Snippet Menu */}
      {snippetMenu && (
          <div 
            className="fixed z-50 transform -translate-x-1/2 -translate-y-full mb-1"
            style={{ top: snippetMenu.top - 8, left: snippetMenu.left }}
          >
             <button
                onMouseDown={(e) => { e.preventDefault(); handleSaveSnippet(); }}
                className="bg-strand-800 text-white text-xs font-bold rounded shadow-lg py-1.5 px-3 flex items-center gap-2 hover:bg-strand-900 transition-colors animate-in zoom-in duration-200"
             >
                 <ArchiveBoxIcon className="w-3.5 h-3.5" />
                 Save Snippet
             </button>
             <div className="w-2 h-2 bg-strand-800 transform rotate-45 mx-auto -mt-1"></div>
          </div>
      )}

      <div className="space-y-4">
        <div className="flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-serif text-strand-800">Module E: Revision Engine</h2>
                <p className="text-strand-600 text-sm">
                Polish and tune your draft. Applies the <strong>Voice Mix</strong> to specific literary parameters.
                </p>
            </div>
            <div className="text-xs bg-strand-200 text-strand-700 px-2 py-1 rounded font-mono">
                Input: Draft Text
            </div>
        </div>

        {/* Workflow Guide */}
        <div className="bg-strand-100 border border-strand-200 rounded-lg p-4 flex gap-4 items-start">
            <div className="bg-strand-800 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">?</div>
            <div className="space-y-1">
                <h4 className="text-xs font-bold text-strand-800 uppercase tracking-tight">How to use Revision Engine</h4>
                <p className="text-[11px] text-strand-600 leading-relaxed">
                    1. Load a draft from the <strong>Prose Builder</strong> or select an existing chapter from the <strong>Book Builder</strong> using the dropdown below. <br/>
                    2. Choose a <strong>Revision Focus</strong> (e.g., "Enhance Ecology" or "Marginalia" for surgical edits). <br/>
                    3. Adjust the <strong>Sensory Tuner</strong> and <strong>Advanced Editorial Controls</strong>. <br/>
                    4. Click <strong>Run Revision</strong>. <br/>
                    5. Review the <strong>Revised Output</strong> (use "Diff" to see changes). <br/>
                    6. Click <strong>+ Create Chapter</strong> to save the polished version to your manuscript.
                </p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Column: Input */}
        <div className="space-y-4">
             <div className="flex flex-col gap-1.5 h-full">
                <div className="flex justify-between items-baseline pl-1 pr-1">
                    <div className="flex items-center gap-3">
                        <label className="text-xs font-semibold text-strand-500 uppercase tracking-wider">
                            Original Draft
                        </label>
                        {bookChapters.length > 0 && (
                            <select 
                                onChange={(e) => {
                                    const chapter = bookChapters.find(c => c.id === e.target.value);
                                    if (chapter && confirm(`Load "${chapter.title}" for revision? This will overwrite the current draft area.`)) {
                                        setDraftText(chapter.content);
                                        setChapterTitle(chapter.title + " (Revised)");
                                    }
                                    e.target.value = "";
                                }}
                                className="text-[10px] bg-white border border-strand-200 rounded px-2 py-0.5 text-strand-600 focus:outline-none focus:ring-1 focus:ring-strand-400"
                            >
                                <option value="">Load from Book Builder...</option>
                                {bookChapters.map(c => (
                                    <option key={c.id} value={c.id}>{c.title}</option>
                                ))}
                            </select>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => {
                                if (confirm("Clear draft input?")) {
                                    setDraftText('');
                                }
                            }}
                            className="text-[9px] font-bold text-red-400 hover:text-red-600 uppercase tracking-widest"
                        >
                            Clear
                        </button>
                        <span className="text-[10px] text-strand-400 font-mono">{getWordCount(draftText)} words</span>
                    </div>
                </div>
                <textarea
                    value={draftText}
                    onChange={(e) => setDraftText(e.target.value)}
                    placeholder="Paste your draft text here..."
                    className="w-full h-96 bg-white border border-strand-300 text-strand-800 text-sm rounded-md p-4 focus:outline-none focus:ring-2 focus:ring-strand-400 focus:border-transparent transition-shadow placeholder-strand-300 resize-none font-serif leading-relaxed"
                />
            </div>
        </div>

        {/* Right Column: Controls & Output */}
        <div className="space-y-4 flex flex-col">
            <div className="bg-strand-50 p-6 rounded-lg border border-strand-200 space-y-6">
                 <StyledSelect
                    label="Revision Focus (Primary Goal)"
                    options={Object.values(RevisionFocus)}
                    value={revisionFocus}
                    onChange={(e) => setRevisionFocus(e.target.value as RevisionFocus)}
                />

                {revisionFocus === RevisionFocus.Marginalia && (
                    <div className="space-y-3 p-4 bg-strand-100 rounded-lg border border-strand-200 animate-in fade-in slide-in-from-top-2">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-bold text-strand-500 uppercase tracking-widest">Marginalia (Surgical Edit)</label>
                            {selectedText && (
                                <span className="text-[9px] bg-strand-800 text-white px-2 py-0.5 rounded uppercase tracking-tighter">Text Selected</span>
                            )}
                        </div>
                        <p className="text-[10px] text-strand-600 italic">
                            {selectedText 
                                ? `Target: "${selectedText.slice(0, 50)}${selectedText.length > 50 ? '...' : ''}"` 
                                : "Highlight text in the editor to target a specific section."}
                        </p>
                        <textarea 
                            value={marginaliaNote}
                            onChange={(e) => setMarginaliaNote(e.target.value)}
                            placeholder="Editor's note: e.g., 'Make this more visceral', 'Add a mention of the tide', 'Change the tone to Berger-esque'..."
                            className="w-full h-20 bg-white border border-strand-300 text-xs rounded p-2 focus:ring-1 focus:ring-strand-400 focus:outline-none resize-none"
                        />
                    </div>
                )}

                {/* SENSORY TUNER UI */}
                <div className="space-y-4 pt-2 border-t border-strand-200">
                    <h4 className="text-xs font-bold text-strand-500 uppercase tracking-wider">Sensory Tuner</h4>
                    <div className="space-y-4">
                        <Slider 
                            label="Abstraction"
                            subLabel="Literal <-> Metaphorical"
                            value={abstraction}
                            onChange={setAbstraction}
                        />
                         <Slider 
                            label="Temperature"
                            subLabel="Cold/Forensic <-> Warm/Nostalgic"
                            value={temperature}
                            onChange={setTemperature}
                        />
                         <Slider 
                            label="Human Presence"
                            subLabel="Pristine/Wilderness <-> Anthropocene/Ruins"
                            value={humanPresence}
                            onChange={setHumanPresence}
                        />
                    </div>
                </div>

                {/* ADVANCED EDITORIAL CONTROLS */}
                <div className="space-y-4 pt-6 border-t border-strand-200">
                    <div className="flex items-center gap-2">
                        <InfoIcon className="w-4 h-4 text-strand-500" />
                        <h4 className="text-xs font-bold text-strand-500 uppercase tracking-wider">Advanced Editorial Controls</h4>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <StyledSelect 
                            label="Primary Author"
                            options={['', ...AUTHOR_DEFINITIONS.map(a => a.id)]}
                            value={primaryAuthorId}
                            onChange={(e) => setPrimaryAuthorId(e.target.value as AuthorId)}
                        />
                        <StyledSelect 
                            label="Ghost Author"
                            options={['', ...AUTHOR_DEFINITIONS.map(a => a.id)]}
                            value={ghostAuthorId}
                            onChange={(e) => setGhostAuthorId(e.target.value as AuthorId)}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <StyledSelect 
                            label="Sentence Cadence"
                            options={Object.values(SentenceCadence)}
                            value={cadence}
                            onChange={(e) => setCadence(e.target.value as SentenceCadence)}
                        />
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-strand-100/50 rounded-md border border-strand-200">
                        <input 
                            type="checkbox"
                            id="forceSensoryRevision"
                            checked={forceSensoryAnchoring}
                            onChange={(e) => setForceSensoryAnchoring(e.target.checked)}
                            className="w-4 h-4 text-strand-800 border-strand-300 rounded focus:ring-strand-500"
                        />
                        <label htmlFor="forceSensoryRevision" className="text-xs font-medium text-strand-700 cursor-pointer">
                            Force Sensory Anchoring <span className="text-[10px] text-strand-400 font-normal block">Ensures every paragraph is grounded in physical detail.</span>
                        </label>
                    </div>
                </div>

                 <button
                    onClick={handleRevise}
                    disabled={loading || loadingWeather || !draftText}
                    className={`
                    w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full font-serif font-bold text-base shadow-md transition-all mt-4
                    ${loading || loadingWeather || !draftText
                        ? 'bg-strand-200 text-strand-400 cursor-not-allowed' 
                        : 'bg-strand-800 text-white hover:bg-strand-900'
                    }
                    `}
                >
                    {loading ? (
                    <>
                        <RefreshIcon className="w-4 h-4 animate-spin" />
                        <span>Polishing...</span>
                    </>
                    ) : (
                    <>
                        <SparklesIcon className="w-4 h-4" />
                        <span>Run Revision</span>
                    </>
                    )}
                </button>

                {/* WEATHER OVERLAY UI */}
                <div className="space-y-4 pt-6 border-t border-strand-200">
                    <div className="flex items-center gap-2">
                        <CloudIcon className="w-4 h-4 text-strand-500" />
                        <h4 className="text-xs font-bold text-strand-500 uppercase tracking-wider">Weather Overlay</h4>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex-grow">
                            <StyledSelect
                                label=""
                                options={Object.values(WeatherEvent)}
                                value={weatherEvent}
                                onChange={(e) => setWeatherEvent(e.target.value as WeatherEvent)}
                            />
                        </div>
                        <button
                            onClick={handleWeatherOverlay}
                            disabled={loading || loadingWeather || !draftText}
                            className={`
                            px-4 rounded-md font-bold text-xs shadow-sm transition-all
                            ${loading || loadingWeather || !draftText
                                ? 'bg-strand-200 text-strand-400 cursor-not-allowed' 
                                : 'bg-strand-100 text-strand-800 hover:bg-strand-200'
                            }
                            `}
                        >
                            {loadingWeather ? <RefreshIcon className="w-4 h-4 animate-spin" /> : "Apply"}
                        </button>
                    </div>
                    <p className="text-[10px] text-strand-400 italic">Inject a sudden weather event to shift the scene's tension.</p>
                </div>
            </div>

             {result ? (
                <div className="flex-grow flex flex-col gap-1.5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                     <div className="flex justify-between items-center pl-1 pr-1">
                        <label className="text-xs font-semibold text-strand-500 uppercase tracking-wider flex items-center gap-2">
                            <SparklesIcon className="w-3 h-3 text-strand-600" />
                            Revised Output
                        </label>
                        <div className="flex items-center gap-2">
                             <span className="text-[10px] text-strand-400 font-mono mr-2">{getWordCount(result)} words</span>
                             <div className="flex bg-strand-100 rounded p-0.5">
                                  <button 
                                    onClick={() => setShowDiff(false)}
                                    className={`text-[10px] px-2 py-0.5 rounded ${!showDiff ? 'bg-white shadow-sm font-bold text-strand-800' : 'text-strand-500 hover:text-strand-700'}`}
                                 >
                                     Clean
                                 </button>
                                 <button 
                                    onClick={() => setShowDiff(true)}
                                    className={`text-[10px] px-2 py-0.5 rounded ${showDiff ? 'bg-white shadow-sm font-bold text-strand-800' : 'text-strand-500 hover:text-strand-700'}`}
                                 >
                                     Diff
                                 </button>
                             </div>
                        </div>
                     </div>
                    <div 
                        ref={outputRef}
                        onMouseUp={handleTextSelection}
                        className="w-full flex-grow bg-white border border-strand-300 rounded-md p-4 overflow-y-auto h-64 border-l-4 border-l-strand-400 cursor-text selection:bg-strand-200 selection:text-strand-900"
                    >
                        {showDiff ? renderDiff() : (
                            <pre className="whitespace-pre-wrap font-serif text-sm leading-relaxed text-strand-800 font-normal">
                                {result}
                            </pre>
                        )}
                    </div>
                     <div className="mt-2 pt-2 border-t border-strand-100 flex flex-col sm:flex-row items-center justify-between gap-2">
                         <div className="flex items-center gap-4">
                             <div className="text-[10px] text-strand-400 italic hidden sm:block">
                                 Highlight text to save a snippet.
                             </div>
                             <button 
                                 onClick={() => {
                                     if (confirm("Clear revised output?")) {
                                         setResult(null);
                                     }
                                 }}
                                 className="text-[10px] font-bold text-red-500 hover:text-red-700 uppercase tracking-widest"
                             >
                                 Clear Output
                             </button>
                         </div>
                         <div className="flex items-center gap-2 w-full sm:w-auto">
                            <input 
                                type="text" 
                                placeholder="Chapter Title (Optional)"
                                value={chapterTitle}
                                onChange={(e) => setChapterTitle(e.target.value)}
                                className="text-sm border border-strand-300 rounded px-3 py-1.5 flex-grow"
                            />
                            <button 
                                onClick={handleSaveToBook}
                                className="whitespace-nowrap bg-strand-100 text-strand-700 px-4 py-1.5 rounded font-semibold text-xs hover:bg-strand-200 transition-colors"
                            >
                                + Create Chapter
                            </button>
                         </div>
                     </div>
                </div>
             ) : (
                 <div className="flex-grow flex items-center justify-center border-2 border-dashed border-strand-200 rounded-lg text-strand-400 text-sm h-64">
                    Waiting for revision...
                 </div>
             )}
        </div>
      </div>
    </div>
  );
};
