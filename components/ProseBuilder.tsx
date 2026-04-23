import React, { useState, useEffect } from 'react';
import { ProseMode, ProseLength, ProseStructure, ProseGenerationParams, AuthorMix, ProseSection, BiomeType, SentenceCadence, AuthorId } from '../types';
import { generateStrandlineProseStream, planProseOutline, generateProseSectionStream, generateAtmosphericPalette } from '../services/geminiService';
import { AUTHOR_DEFINITIONS } from '../constants';
import { StyledSelect } from './InputGroup';
import { SparklesIcon, RefreshIcon, CheckIcon, ArchiveBoxIcon, PlusCircleIcon, BookOpenIcon, InfoIcon } from './Icons';
import { auth, db } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDocFromServer, setDoc, collection, getDocs, query } from 'firebase/firestore';

interface ProseBuilderProps {
  authorMix: AuthorMix;
  biomes: BiomeType[];
  initialScaffold?: string;
  onProseComplete?: (text: string) => void;
  onAddToBook?: (title: string, content: string) => void;
  onSaveSnippet?: (text: string) => void;
  onQuotaExceeded?: () => void;
}

export const ProseBuilder: React.FC<ProseBuilderProps> = ({ authorMix, biomes, initialScaffold, onProseComplete, onAddToBook, onSaveSnippet, onQuotaExceeded }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [scaffoldText, setScaffoldText] = useState(initialScaffold || '');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user ? user.uid : null);
      setIsAuthReady(true);
    });

    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();

    return () => unsubscribe();
  }, []);
  const [proseMode, setProseMode] = useState<ProseMode>(ProseMode.LyricVignette);
  const [proseLength, setProseLength] = useState<ProseLength>(ProseLength.Standard);
  const [customWordCount, setCustomWordCount] = useState<number>(800);
  const [useCustomWordCount, setUseCustomWordCount] = useState(false);
  const [proseStructure, setProseStructure] = useState<ProseStructure>(ProseStructure.SingleBlock);
  
  // Advanced Editorial Controls
  const [primaryAuthorId, setPrimaryAuthorId] = useState<AuthorId | ''>('');
  const [ghostAuthorId, setGhostAuthorId] = useState<AuthorId | ''>('');
  const [cadence, setCadence] = useState<SentenceCadence>(SentenceCadence.Standard);
  const [forceSensoryAnchoring, setForceSensoryAnchoring] = useState(true);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [chapterTitle, setChapterTitle] = useState('');

  // Sequential Generation State
  const [sections, setSections] = useState<ProseSection[]>([]);
  const [isPlanning, setIsPlanning] = useState(false);
  const [isGeneratingSections, setIsGeneratingSections] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number>(-1);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  // Field Guide State
  const [palette, setPalette] = useState<{ flora: string[], fauna: string[], phenomena: string[] } | null>(null);
  const [loadingPalette, setLoadingPalette] = useState(false);

  // Snippet UI State
  const [snippetMenu, setSnippetMenu] = useState<{top: number, left: number, text: string} | null>(null);

  useEffect(() => {
    if (initialScaffold) setScaffoldText(initialScaffold);
  }, [initialScaffold]);

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

  // Helpers
  const getWordCount = (text: string | null) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
  }

  const getTargetRange = (len: ProseLength) => {
      if (useCustomWordCount) {
          return { min: Math.round(customWordCount * 0.8), max: customWordCount, label: `${customWordCount} words` };
      }
      const match = len.match(/(\d+)-(\d+)/);
      return match ? { min: parseInt(match[1]), max: parseInt(match[2]), label: match[0] } : { min: 0, max: 2000, label: "Variable" };
  };

  const currentTotalWords = sections.reduce((acc, s) => acc + getWordCount(s.content), 0);
  const targetInfo = getTargetRange(proseLength);
  const progressPercent = Math.min((currentTotalWords / targetInfo.max) * 100, 100);

  // FIELD GUIDE HANDLERS
  const handleLoadPalette = async () => {
      setLoadingPalette(true);
      try {
          const data = await generateAtmosphericPalette(biomes);
          setPalette(data);
      } catch (e: any) {
          if (onQuotaExceeded && (e.message?.includes('429') || e.message?.includes('RESOURCE_EXHAUSTED'))) {
              onQuotaExceeded();
          } else {
              alert("Failed to load Field Guide.");
          }
      } finally {
          setLoadingPalette(false);
      }
  }

  const handleInjectItem = (item: string, category: string) => {
      // Append to scaffold with a micro-instruction
      const injection = `\n[Must include specific detail: ${item}]`;
      setScaffoldText(prev => prev + injection);
  }

  // SINGLE SHOT GENERATOR
  const handleGenerateSingle = async () => {
    if (!scaffoldText.trim()) return;
    const controller = new AbortController();
    setAbortController(controller);
    setLoading(true);
    setResult("");
    try {
      const stream = generateStrandlineProseStream({ 
        scaffoldText, 
        proseMode, 
        proseLength, 
        proseStructure,
        primaryAuthorId: primaryAuthorId || undefined,
        ghostAuthorId: ghostAuthorId || undefined,
        cadence,
        forceSensoryAnchoring,
        customWordCount: useCustomWordCount ? customWordCount : undefined
      }, authorMix);

      let fullProse = "";
      for await (const chunk of stream) {
          if (controller.signal.aborted) break;
          fullProse += chunk;
          setResult(fullProse);
      }

      if (onProseComplete && !controller.signal.aborted) {
        onProseComplete(fullProse);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      if (onQuotaExceeded && (error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED'))) {
        onQuotaExceeded();
      } else {
        alert("Failed to generate prose.");
      }
    } finally {
      setLoading(false);
      setAbortController(null);
    }
  };

  // SEQUENTIAL: PLAN PHASE
  const handlePlanStructure = async () => {
      if (!scaffoldText.trim()) return;
      setIsPlanning(true);
      setSections([]);
      setResult(null); // Clear previous results
      try {
          const titles = await planProseOutline(scaffoldText, proseMode);
          const newSections: ProseSection[] = titles.map((t, i) => ({
              id: i.toString(),
              title: t,
              content: '',
              status: 'pending'
          }));
          setSections(newSections);
      } catch (error: any) {
          if (onQuotaExceeded && (error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED'))) {
              onQuotaExceeded();
          } else {
              alert("Failed to plan structure.");
          }
      } finally {
          setIsPlanning(false);
      }
  };

  // SEQUENTIAL: GENERATE PHASE
  const handleGenerateSections = async () => {
      const controller = new AbortController();
      setAbortController(controller);
      setIsGeneratingSections(true);
      let accumulatedProse = "";

      for (let i = 0; i < sections.length; i++) {
          if (controller.signal.aborted) break;
          setCurrentSectionIndex(i);
          setSections(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'generating', content: '' } : s));
          
          let sectionContent = "";
          try {
              const stream = generateProseSectionStream(
                  { 
                    scaffoldText, 
                    proseMode, 
                    proseLength, 
                    proseStructure,
                    primaryAuthorId: primaryAuthorId || undefined,
                    ghostAuthorId: ghostAuthorId || undefined,
                    cadence,
                    forceSensoryAnchoring,
                    customWordCount: useCustomWordCount ? customWordCount : undefined
                  },
                  authorMix,
                  sections[i].title,
                  accumulatedProse
              );
              
              for await (const chunk of stream) {
                  if (controller.signal.aborted) break;
                  sectionContent += chunk;
                  // Functional update to avoid closure staleness, updating specific index
                  setSections(prev => prev.map((s, idx) => idx === i ? { ...s, content: sectionContent } : s));
              }
              
              if (controller.signal.aborted) {
                  setSections(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'pending' } : s));
                  break;
              }

              accumulatedProse += `\n\n## ${sections[i].title}\n\n${sectionContent}`;
              
              setSections(prev => prev.map((s, idx) => idx === i ? { ...s, content: sectionContent, status: 'completed' } : s));

          } catch (error: any) {
              if (error.name === 'AbortError') break;
              console.error("Error generating section", i);
              if (onQuotaExceeded && (error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED'))) {
                  onQuotaExceeded();
              }
              setSections(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'pending' } : s));
              break;
          }
      }

      if (!controller.signal.aborted) {
          setResult(accumulatedProse.trim());
          if (onProseComplete) {
              onProseComplete(accumulatedProse.trim());
          }
      }
      setIsGeneratingSections(false);
      setCurrentSectionIndex(-1);
      setAbortController(null);
  };

  const handleStopGeneration = () => {
      if (abortController) {
          abortController.abort();
      }
  }

  const handleSaveProject = async () => {
    if (!userId) {
      alert("Please sign in to save your project.");
      return;
    }
    const projectRef = doc(db, 'users', userId, 'proseProjects', 'project-' + Date.now());
    await setDoc(projectRef, {
        userId,
        proseMode,
        proseLength,
        scaffoldText
    });
    alert("Project saved successfully!");
  };

  const handleSaveToBook = () => {
    if (result && onAddToBook) {
        const title = chapterTitle || `Generated Prose ${new Date().toLocaleTimeString()}`;
        onAddToBook(title, result);
        setChapterTitle('');
    }
  }

  const handleTextSelection = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0 && onSaveSnippet) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          setSnippetMenu({
              top: rect.top,
              left: rect.left + (rect.width / 2),
              text: selection.toString()
          });
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

  const isMultiSection = proseStructure === ProseStructure.MultiSection;

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
                <h2 className="text-2xl font-serif text-strand-800">Module D: Prose Builder</h2>
                <p className="text-strand-600 text-sm">
                Convert your outline into full prose using the <strong>Voice Mix</strong>.
                </p>
            </div>
             <div className="text-xs bg-strand-200 text-strand-700 px-2 py-1 rounded font-mono">
                Input: Expansion/Outline
             </div>
        </div>
        
        {/* Workflow Guide */}
        <div className="bg-strand-100 border border-strand-200 rounded-lg p-4 flex gap-4 items-start">
            <div className="bg-strand-800 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">?</div>
            <div className="space-y-1">
                <h4 className="text-xs font-bold text-strand-800 uppercase tracking-tight">How to use Prose Builder</h4>
                <p className="text-[11px] text-strand-600 leading-relaxed">
                    1. Paste an outline from the <strong>Expander</strong> into the Scaffold area. <br/>
                    2. Choose your <strong>Prose Mode</strong> and <strong>Target Length</strong>. <br/>
                    3. Click <strong>Generate Prose</strong>. <br/>
                    4. Once finished, click <strong>+ Create Chapter</strong> to save it to the <strong>Book Builder</strong>. <br/>
                    5. To polish your work, click <strong>Send to Revision</strong> to move the draft to the next module.
                </p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
            <div className="flex flex-col gap-1.5 relative">
                <div className="flex justify-between items-baseline pl-1 pr-1">
                    <label className="text-xs font-semibold text-strand-500 uppercase tracking-wider">
                        Scaffold / Outline (Input)
                    </label>
                    <button 
                        onClick={handleLoadPalette}
                        disabled={loadingPalette}
                        className="text-[10px] flex items-center gap-1 font-bold text-strand-600 hover:text-strand-800 bg-strand-100 hover:bg-strand-200 px-2 py-1 rounded transition-colors"
                    >
                         {loadingPalette ? <RefreshIcon className="w-3 h-3 animate-spin" /> : <BookOpenIcon className="w-3 h-3" />}
                         {palette ? 'Refresh Field Guide' : 'Open Ecological Field Guide'}
                    </button>
                </div>

                {/* Field Guide Panel */}
                {palette && (
                    <div className="bg-strand-50 border border-strand-200 rounded-lg p-3 mb-2 animate-in slide-in-from-top-2">
                        <h4 className="text-[10px] font-bold text-strand-500 uppercase tracking-wide mb-2">
                            Radical Specificity Palette ({biomes.join(', ')})
                        </h4>
                        <div className="space-y-2">
                             <div className="flex flex-wrap gap-2">
                                 <span className="text-[9px] text-strand-400 font-bold uppercase py-1">Flora:</span>
                                 {palette.flora.map(item => (
                                     <button key={item} onClick={() => handleInjectItem(item, 'flora')} className="text-[10px] bg-white border border-strand-200 px-2 py-1 rounded hover:bg-strand-100 text-strand-700 transition-colors flex items-center gap-1 group">
                                         {item} <PlusCircleIcon className="w-2 h-2 text-strand-300 group-hover:text-strand-600" />
                                     </button>
                                 ))}
                             </div>
                             <div className="flex flex-wrap gap-2">
                                 <span className="text-[9px] text-strand-400 font-bold uppercase py-1">Fauna:</span>
                                 {palette.fauna.map(item => (
                                     <button key={item} onClick={() => handleInjectItem(item, 'fauna')} className="text-[10px] bg-white border border-strand-200 px-2 py-1 rounded hover:bg-strand-100 text-strand-700 transition-colors flex items-center gap-1 group">
                                         {item} <PlusCircleIcon className="w-2 h-2 text-strand-300 group-hover:text-strand-600" />
                                     </button>
                                 ))}
                             </div>
                             <div className="flex flex-wrap gap-2">
                                 <span className="text-[9px] text-strand-400 font-bold uppercase py-1">Phenomena:</span>
                                 {palette.phenomena.map(item => (
                                     <button key={item} onClick={() => handleInjectItem(item, 'phenomena')} className="text-[10px] bg-white border border-strand-200 px-2 py-1 rounded hover:bg-strand-100 text-strand-700 transition-colors flex items-center gap-1 group">
                                         {item} <PlusCircleIcon className="w-2 h-2 text-strand-300 group-hover:text-strand-600" />
                                     </button>
                                 ))}
                             </div>
                        </div>
                        <div className="mt-2 text-[9px] text-strand-400 italic text-right">
                            Click to inject species into scaffold.
                        </div>
                    </div>
                )}

                <textarea
                    value={scaffoldText}
                    onChange={(e) => setScaffoldText(e.target.value)}
                    placeholder="Paste your expanded outline here..."
                    className="w-full h-48 bg-white border border-strand-300 text-strand-800 text-sm rounded-md p-4 focus:outline-none focus:ring-2 focus:ring-strand-400 focus:border-transparent transition-shadow placeholder-strand-300 resize-y font-serif leading-relaxed"
                />
            </div>
        </div>

        <div className="space-y-6">
             <StyledSelect
                label="Prose Mode"
                options={Object.values(ProseMode)}
                value={proseMode}
                onChange={(e) => setProseMode(e.target.value as ProseMode)}
            />

            <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-strand-500 uppercase tracking-widest">Target Length</label>
                        <button 
                            onClick={() => setUseCustomWordCount(!useCustomWordCount)}
                            className="text-[9px] text-strand-400 hover:text-strand-600 underline uppercase tracking-tighter"
                        >
                            {useCustomWordCount ? 'Use Presets' : 'Use Custom Slider'}
                        </button>
                    </div>
                    {useCustomWordCount ? (
                        <div className="space-y-3 p-3 bg-strand-50 rounded-lg border border-strand-200">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-mono text-strand-700">{customWordCount} words</span>
                                <span className="text-[9px] text-strand-400 italic">Max: 5000</span>
                            </div>
                            <input 
                                type="range" 
                                min="100" 
                                max="5000" 
                                step="100"
                                value={customWordCount}
                                onChange={(e) => setCustomWordCount(parseInt(e.target.value))}
                                className="w-full h-1.5 bg-strand-200 rounded-lg appearance-none cursor-pointer accent-strand-700"
                            />
                            <div className="flex justify-between text-[8px] text-strand-400 font-bold uppercase tracking-widest">
                                <span>Brief</span>
                                <span>Standard</span>
                                <span>Epic</span>
                                <span>Long-form</span>
                            </div>
                        </div>
                    ) : (
                        <StyledSelect
                            label=""
                            options={Object.values(ProseLength)}
                            value={proseLength}
                            onChange={(e) => setProseLength(e.target.value as ProseLength)}
                        />
                    )}
                </div>
                <StyledSelect
                    label="Structure Type"
                    options={Object.values(ProseStructure)}
                    value={proseStructure}
                    onChange={(e) => {
                        setProseStructure(e.target.value as ProseStructure);
                        // Reset sectional state when switching types
                        setSections([]);
                        setResult(null);
                    }}
                />
            </div>

            {/* ADVANCED EDITORIAL CONTROLS */}
            <div className="space-y-4 p-4 bg-strand-50 rounded-xl border border-strand-200">
                <h3 className="text-[10px] font-bold text-strand-500 uppercase tracking-widest flex items-center gap-2">
                    Advanced Editorial Controls
                    <div className="group relative">
                        <InfoIcon className="w-3 h-3 text-strand-400 cursor-help" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-strand-800 text-white text-[9px] rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 leading-tight">
                            Fine-tune the authorial influence and sentence rhythm of the generated prose.
                        </div>
                    </div>
                </h3>

                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                        <StyledSelect
                            label="Primary Author"
                            options={['', ...AUTHOR_DEFINITIONS.map(a => a.id)]}
                            value={primaryAuthorId}
                            onChange={(e) => setPrimaryAuthorId(e.target.value)}
                        />
                        <StyledSelect
                            label="Ghost Author"
                            options={['', ...AUTHOR_DEFINITIONS.map(a => a.id)]}
                            value={ghostAuthorId}
                            onChange={(e) => setGhostAuthorId(e.target.value)}
                        />
                    </div>

                    <StyledSelect
                        label="Sentence Cadence"
                        options={Object.values(SentenceCadence)}
                        value={cadence}
                        onChange={(e) => setCadence(e.target.value as SentenceCadence)}
                    />

                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative">
                            <input 
                                type="checkbox" 
                                checked={forceSensoryAnchoring}
                                onChange={(e) => setForceSensoryAnchoring(e.target.checked)}
                                className="sr-only"
                            />
                            <div className={`w-8 h-4 rounded-full transition-colors ${forceSensoryAnchoring ? 'bg-strand-700' : 'bg-strand-300'}`}></div>
                            <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${forceSensoryAnchoring ? 'translate-x-4' : 'translate-x-0'}`}></div>
                        </div>
                        <span className="text-[10px] font-bold text-strand-600 uppercase tracking-tight group-hover:text-strand-800 transition-colors">Force Sensory Anchoring</span>
                    </label>
                </div>
            </div>
            
            {/* Conditional Button Rendering based on Structure Type */}
            {isMultiSection ? (
                <div className="space-y-2">
                    {sections.length === 0 ? (
                        <button
                            onClick={handlePlanStructure}
                            disabled={isPlanning || !scaffoldText}
                            className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full font-serif font-bold text-base shadow-md transition-all ${isPlanning || !scaffoldText ? 'bg-strand-200 text-strand-400' : 'bg-strand-700 text-white hover:bg-strand-800'}`}
                        >
                            {isPlanning ? <RefreshIcon className="w-4 h-4 animate-spin" /> : <SparklesIcon className="w-4 h-4" />}
                            {isPlanning ? 'Analyzing Structure...' : 'Plan Structure'}
                        </button>
                    ) : (
                        <div className="bg-strand-50 rounded-lg p-3 border border-strand-200 space-y-3">
                            <div className="flex justify-between items-center border-b border-strand-200 pb-2">
                                <span className="text-xs font-bold text-strand-600 uppercase">Section Plan</span>
                                <button onClick={() => setSections([])} className="text-[10px] text-strand-400 underline">Reset</button>
                            </div>
                            
                            <ul className="space-y-2 max-h-56 overflow-y-auto">
                                {sections.map((s, idx) => (
                                    <li key={s.id} className="text-xs flex items-center justify-between bg-white p-2 rounded border border-strand-100">
                                        <div className="flex flex-col truncate flex-1 mr-2">
                                            <span className={`truncate ${s.status === 'completed' ? 'text-strand-400' : 'text-strand-800 font-medium'}`}>
                                                {s.title}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {(s.status === 'completed' || s.status === 'generating') && <span className="text-[9px] font-mono text-strand-400">{getWordCount(s.content)}w</span>}
                                            {s.status === 'completed' && <CheckIcon className="w-3 h-3 text-green-500" />}
                                            {s.status === 'generating' && <RefreshIcon className="w-3 h-3 text-strand-500 animate-spin" />}
                                            {s.status === 'pending' && <span className="w-2 h-2 rounded-full bg-strand-200"></span>}
                                        </div>
                                    </li>
                                ))}
                            </ul>

                             {/* Progress Dashboard */}
                            <div className="bg-strand-100 rounded p-2.5 mt-1">
                                <div className="flex justify-between items-end mb-1">
                                    <span className="text-[10px] font-bold text-strand-600 uppercase tracking-wide">Progress</span>
                                    <span className="text-[10px] font-mono text-strand-700">
                                        {currentTotalWords} / <span className="text-strand-500">{targetInfo.label}</span> words
                                    </span>
                                </div>
                                <div className="w-full bg-strand-200 h-1.5 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full bg-strand-700 transition-all duration-500 ease-out ${isGeneratingSections ? 'animate-pulse' : ''}`}
                                        style={{ width: `${progressPercent}%` }}
                                    ></div>
                                </div>
                            </div>

                             {isGeneratingSections ? (
                                <button
                                    onClick={handleStopGeneration}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md font-bold text-sm shadow-sm bg-red-100 text-red-700 hover:bg-red-200 transition-all"
                                >
                                    Stop Generation
                                </button>
                             ) : (
                                <button
                                    onClick={handleGenerateSections}
                                    disabled={isGeneratingSections}
                                    className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md font-bold text-sm shadow-sm transition-all ${isGeneratingSections ? 'bg-strand-200 text-strand-400' : 'bg-strand-800 text-white hover:bg-strand-900'}`}
                                >
                                    Generate All Sections
                                </button>
                             )}
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {loading && (
                         <div className="bg-strand-100 rounded p-2.5">
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-[10px] font-bold text-strand-600 uppercase tracking-wide">Progress</span>
                                <span className="text-[10px] font-mono text-strand-700">
                                    {getWordCount(result)} / <span className="text-strand-500">{targetInfo.label}</span> words
                                </span>
                            </div>
                            <div className="w-full bg-strand-200 h-1.5 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-strand-700 transition-all duration-500 ease-out animate-pulse"
                                    style={{ width: `${Math.min((getWordCount(result) / targetInfo.max) * 100, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    )}
                    
                    {loading ? (
                        <button
                            onClick={handleStopGeneration}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full font-serif font-bold text-base shadow-md bg-red-100 text-red-700 hover:bg-red-200 transition-all"
                        >
                            Stop Generation
                        </button>
                    ) : (
                        <button
                            onClick={handleGenerateSingle}
                            disabled={loading || !scaffoldText}
                            className={`
                            w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full font-serif font-bold text-base shadow-md transition-all
                            ${loading || !scaffoldText
                                ? 'bg-strand-200 text-strand-400 cursor-not-allowed' 
                                : 'bg-strand-800 text-white hover:bg-strand-900'
                            }
                            `}
                        >
                            <SparklesIcon className="w-4 h-4" />
                            <span>Generate Prose</span>
                        </button>
                    )}
                </div>
            )}
        </div>
      </div>

      {result !== null && (
        <div className="bg-white rounded-xl shadow-md border border-strand-200 p-8 relative animate-in fade-in duration-500 mt-8">
             <div className="absolute top-0 right-0 flex items-center gap-2">
               <div className="px-3 py-2 bg-strand-50 border-b border-l border-strand-200 rounded-bl-lg text-xs text-strand-500 font-mono flex items-center gap-2">
                 {loading && <RefreshIcon className="w-3 h-3 animate-spin" />}
                 {getWordCount(result)} words
               </div>
               <div className="px-4 py-2 bg-strand-100 rounded-bl-lg text-xs font-bold text-strand-600 uppercase tracking-wider">
                 {loading ? 'Generating...' : 'Draft Output'}
               </div>
               <div className="flex items-center gap-1 pr-2">
                   <button 
                    onClick={() => {
                        if (result) {
                            navigator.clipboard.writeText(result);
                            alert("Copied to clipboard!");
                        }
                    }}
                    className="p-1.5 text-strand-400 hover:text-strand-600 transition-colors"
                    title="Copy to Clipboard"
                   >
                       <ArchiveBoxIcon className="w-3.5 h-3.5" />
                   </button>
                   <button 
                    onClick={() => {
                        if (result) {
                            const blob = new Blob([result], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${chapterTitle || 'strandline-draft'}.txt`;
                            a.click();
                            URL.revokeObjectURL(url);
                        }
                    }}
                    className="p-1.5 text-strand-400 hover:text-strand-600 transition-colors"
                    title="Download as .txt"
                   >
                       <BookOpenIcon className="w-3.5 h-3.5" />
                   </button>
               </div>
             </div>
             
             <div 
                className="prose prose-stone font-serif text-strand-900 max-w-none cursor-text selection:bg-strand-200 selection:text-strand-900"
                onMouseUp={handleTextSelection}
             >
                 <pre className="whitespace-pre-wrap font-serif text-base leading-loose">
                    {result}
                 </pre>
             </div>
             <div className="mt-6 pt-6 border-t border-strand-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="text-strand-500 text-sm italic">
                    Highlight text to save a snippet.
                    </div>
                    <button 
                        onClick={() => {
                            if (confirm("Clear current draft?")) {
                                setResult(null);
                                setScaffoldText('');
                            }
                        }}
                        className="text-[10px] font-bold text-red-500 hover:text-red-700 uppercase tracking-widest"
                    >
                        Clear Draft
                    </button>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input 
                        type="text" 
                        placeholder="Chapter Title (Optional)"
                        value={chapterTitle}
                        onChange={(e) => setChapterTitle(e.target.value)}
                        className="text-sm border border-strand-300 rounded px-3 py-2 flex-grow sm:w-64"
                    />
                    <button 
                        onClick={handleSaveProject}
                        className="whitespace-nowrap bg-strand-100 text-strand-700 px-4 py-2 rounded font-semibold text-xs hover:bg-strand-200 transition-colors"
                    >
                        Save Project
                    </button>
                    <button 
                        onClick={handleSaveToBook}
                        className="whitespace-nowrap bg-strand-100 text-strand-700 px-4 py-2 rounded font-semibold text-xs hover:bg-strand-200 transition-colors"
                    >
                        + Create Chapter
                    </button>
                    <button 
                        onClick={() => {
                            if (result && onProseComplete) {
                                onProseComplete(result);
                                alert("Draft sent to Revision Engine.");
                            }
                        }}
                        className="whitespace-nowrap bg-strand-800 text-white px-4 py-2 rounded font-semibold text-xs hover:bg-strand-900 transition-colors flex items-center gap-2"
                    >
                        <SparklesIcon className="w-3.5 h-3.5" />
                        Send to Revision
                    </button>
                </div>
             </div>
         </div>
      )}
    </div>
  );
};