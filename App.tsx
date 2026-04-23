import React, { useState, useRef, useEffect } from 'react';
import { DEFAULT_PARAMS, DEFAULT_AUTHOR_MIX } from './constants';
import {
  SeedGeneratorParams,
  AuthorMix,
  CalibrationMode,
  BookChapter,
  Seed,
  Snippet,
  VoiceAnalysisResult,
  BiomeType,
  VoicePreset,
  NarrativeAnchor,
  NarrativeBlueprint,
  SocialSetting,
  AtmosphereMode,
  TimePeriodMode,
  TensionLevel
} from './types';
import { 
  generateStrandlineSeeds, 
  generateVoiceProfile, 
  remixStrandlineSeeds, 
  generateWritingPrompt,
  generateEssaySeedsFromVoice,
  generateMasterPrompt 
} from './services/geminiService';
import { SeedGeneratorForm } from './components/SeedGeneratorForm';
import { SeedResult } from './components/SeedResult';
import { VoiceLab } from './components/VoiceLab';
import { SeedExpander } from './components/SeedExpander';
import { ProseBuilder } from './components/ProseBuilder';
import { RevisionEngine } from './components/RevisionEngine';
import { ExportStudio } from './components/ExportStudio';
import { BookBuilder } from './components/BookBuilder';
import { ReferenceLibrary } from './components/ReferenceLibrary';
import { FieldLab } from './components/FieldLab';
import { CharacterLab } from './components/CharacterLab';
import { EditorDesk } from './components/EditorDesk';
import { JourneyPlanner } from './components/JourneyPlanner';
import { EssayBuilder } from './components/EssayBuilder';
import { BlueprintLibrary } from './components/BlueprintLibrary';
import { NarrativeStudio } from './components/NarrativeStudio';
import { ArchiveBoxIcon, ArrowRightCircleIcon, SparklesIcon, PlusCircleIcon, ClipboardIcon, RefreshIcon } from './components/Icons';
import { PromptModal } from './components/PromptModal';
import { EssaySeed, EssayDraft } from './types';

enum Tab {
  VoiceLab = 'Module A: Voice',
  Generator = 'Module B: Seeds',
  JourneyPlanner = 'Module L: Journey',
  FieldLab = 'Module I: Field Lab',
  CharacterLab = 'Module J: Mycelium',
  Expander = 'Module C: Expander',
  Prose = 'Module D: Prose',
  Revision = 'Module E: Revision',
  EditorDesk = 'Module K: Editor',
  Export = 'Module F: Export',
  BookBuilder = 'Module G: Book Builder',
  Reference = 'Module H: Reference',
  EssayBuilder = 'Module M: Essay',
  BlueprintLibrary = 'Module N: Blueprints',
  NarrativeStudio = 'Module O: Studio'
}

// --- Local Storage Helpers ---
const STORAGE_KEYS = {
  PARAMS: 'strandline_params',
  MIX: 'strandline_authorMix',
  SEEDS: 'strandline_seedBank',
  CHAPTERS: 'strandline_bookChapters',
  SNIPPETS: 'strandline_snippets',
  TAB: 'strandline_activeTab',
  ESSAY_SEEDS: 'strandline_essaySeeds',
  ESSAY_DRAFTS: 'strandline_essayDrafts',
  BLUEPRINTS: 'strandline_blueprints'
};

const loadJSON = <T,>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.warn(`Failed to load ${key} from storage`);
    return fallback;
  }
};

function App() {
  // --- Persistent State Initialization ---
  
  // Active Tab
  const [activeTab, setActiveTab] = useState<Tab>(() => 
    loadJSON(STORAGE_KEYS.TAB, Tab.Generator)
  );

  // Generator Params (Merge with DEFAULT to ensure new fields are present if storage is old)
  const [params, setParams] = useState<SeedGeneratorParams>(() => {
    const saved = loadJSON(STORAGE_KEYS.PARAMS, {});
    return { ...DEFAULT_PARAMS, ...saved };
  });

  // Author Mix
  const [authorMix, setAuthorMix] = useState<AuthorMix>(() => {
    const saved = loadJSON(STORAGE_KEYS.MIX, {});
    return { ...DEFAULT_AUTHOR_MIX, ...saved };
  });
  
  // Active Location Hint (from Reverse Calibration)
  const [activeLocationHint, setActiveLocationHint] = useState<string | null>(null);
  const [mediaInfluence, setMediaInfluence] = useState<string>('');
  
  // Project Lists (The "To-Do" Lists of the writing project)
  const [seedBank, setSeedBank] = useState<Seed[]>(() => 
    loadJSON(STORAGE_KEYS.SEEDS, [])
  );
  const [bookChapters, setBookChapters] = useState<BookChapter[]>(() => 
    loadJSON(STORAGE_KEYS.CHAPTERS, [])
  );
  const [snippets, setSnippets] = useState<Snippet[]>(() => 
    loadJSON(STORAGE_KEYS.SNIPPETS, [])
  );
  const [essaySeeds, setEssaySeeds] = useState<EssaySeed[]>(() => 
    loadJSON(STORAGE_KEYS.ESSAY_SEEDS, [])
  );
  const [essayDrafts, setEssayDrafts] = useState<EssayDraft[]>(() => 
    loadJSON(STORAGE_KEYS.ESSAY_DRAFTS, [])
  );
  const [blueprints, setBlueprints] = useState<NarrativeBlueprint[]>(() => 
    loadJSON(STORAGE_KEYS.BLUEPRINTS, [])
  );
  const [activeBlueprint, setActiveBlueprint] = useState<NarrativeBlueprint | null>(null);
  const [activeSeed, setActiveSeed] = useState<Seed | null>(null);

  // --- Transient State (Session only) ---
  const [generatedSeeds, setGeneratedSeeds] = useState<Seed[]>([]);

  const handleDevelopInStudio = (seed: Seed) => {
    setActiveSeed(seed);
    setActiveTab(Tab.NarrativeStudio);
  };

  const handlePromoteToBlueprint = (seed: Seed) => {
    setActiveSeed(seed);
    setActiveTab(Tab.BlueprintLibrary);
  };
  const [selectedSeedIndices, setSelectedSeedIndices] = useState<number[]>([]);
  
  const [currentSeed, setCurrentSeed] = useState<string>('');
  const [currentExpansion, setCurrentExpansion] = useState<string>('');
  const [currentDraft, setCurrentDraft] = useState<string>('');
  const [currentRevision, setCurrentRevision] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [promptLoading, setPromptLoading] = useState(false);
  const [showKeyPrompt, setShowKeyPrompt] = useState(false);
  const [hasPersonalKey, setHasPersonalKey] = useState(false);
  // Update labResult to hold the full object
  const [labResult, setLabResult] = useState<VoiceAnalysisResult | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // --- API Key Selection Check ---
  useEffect(() => {
    console.log("CONNECTED");
    const checkKey = async () => {
      // @ts-ignore
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        // @ts-ignore
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasPersonalKey(hasKey);
      }
    };
    checkKey();
  }, []);

  // --- Persistence Effects ---
  useEffect(() => localStorage.setItem(STORAGE_KEYS.TAB, JSON.stringify(activeTab)), [activeTab]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.PARAMS, JSON.stringify(params)), [params]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.MIX, JSON.stringify(authorMix)), [authorMix]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.SEEDS, JSON.stringify(seedBank)), [seedBank]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.CHAPTERS, JSON.stringify(bookChapters)), [bookChapters]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.SNIPPETS, JSON.stringify(snippets)), [snippets]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.ESSAY_SEEDS, JSON.stringify(essaySeeds)), [essaySeeds]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.ESSAY_DRAFTS, JSON.stringify(essayDrafts)), [essayDrafts]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.BLUEPRINTS, JSON.stringify(blueprints)), [blueprints]);

  const [applyVoiceProfile, setApplyVoiceProfile] = useState(false);
  const [lockedFields, setLockedFields] = useState<Set<keyof SeedGeneratorParams>>(new Set());

  const handleUnlockField = (field: keyof SeedGeneratorParams) => {
    setLockedFields(prev => {
      const next = new Set(prev);
      next.delete(field);
      return next;
    });
  };

  const handleInputChange = (field: keyof SeedGeneratorParams, value: any) => {
    // If the field is locked, don't allow change unless unlocked
    if (lockedFields.has(field)) {
        return;
    }
    setParams(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerateSeeds = async () => {
    setLoading(true);
    setGeneratedSeeds([]);
    setSelectedSeedIndices([]);
    try {
      const blueprint: NarrativeBlueprint = {
        id: Date.now().toString(),
        name: 'App Seed Generation',
        authorMix: authorMix,
        params: params,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const seedsJsonString = await generateStrandlineSeeds(blueprint, undefined, applyVoiceProfile ? labResult || undefined : undefined);
      const parsedSeeds: Seed[] = JSON.parse(seedsJsonString);
      setGeneratedSeeds(parsedSeeds);
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (error: any) {
      if (error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED')) {
        setShowKeyPrompt(true);
      } else {
        alert("Failed to generate seeds. Please ensure your API Key is valid.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateProfile = async (mode: CalibrationMode, locationHint?: string, mediaInfluence?: string) => {
    console.log("handleGenerateProfile called with mode:", mode, "locationHint:", locationHint, "mediaInfluence:", mediaInfluence);
    setLoading(true);
    setLabResult(null);
    try {
       console.log("Calling generateVoiceProfile...");
       const result = await generateVoiceProfile(authorMix, mode, locationHint, mediaInfluence);
       console.log("generateVoiceProfile returned:", result);
       setLabResult(result);
    } catch (error: any) {
      console.error("generateVoiceProfile failed:", error);
      if (error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED')) {
        setShowKeyPrompt(true);
      } else {
        alert("Failed to generate profile.");
      }
    } finally {
      setLoading(false);
    }
  }

  const handleApplyVoiceContext = (context: {
      location?: string;
      biomes?: BiomeType[];
      anchor?: NarrativeAnchor;
      socialSetting?: SocialSetting[];
      atmosphericTone?: AtmosphereMode[];
      timePeriod?: TimePeriodMode[];
      tensionLevel?: TensionLevel[];
      motifs?: string[];
      themes?: string[];
  }) => {
      // Update Params
      setParams(prev => ({
          ...prev,
          locationName: context.location || prev.locationName,
          biomeType: context.biomes && context.biomes.length > 0 ? context.biomes : prev.biomeType,
          narrativeAnchor: context.anchor || prev.narrativeAnchor,
          socialSetting: context.socialSetting || prev.socialSetting,
          atmosphericTone: context.atmosphericTone || prev.atmosphericTone,
          timePeriod: context.timePeriod || prev.timePeriod,
          tensionLevel: context.tensionLevel || prev.tensionLevel,
          motifs: context.motifs ? [...new Set([...(prev.motifs || []), ...context.motifs])] : prev.motifs,
          voicePreset: VoicePreset.CustomCalibration
      }));
      
      // Lock the fields
      const newLockedFields = new Set<keyof SeedGeneratorParams>();
      if (context.location) newLockedFields.add('locationName');
      if (context.biomes && context.biomes.length > 0) newLockedFields.add('biomeType' as keyof SeedGeneratorParams);
      if (context.anchor) newLockedFields.add('narrativeAnchor');
      if (context.socialSetting) newLockedFields.add('socialSetting');
      if (context.atmosphericTone) newLockedFields.add('atmosphericTone');
      if (context.timePeriod) newLockedFields.add('timePeriod');
      if (context.tensionLevel) newLockedFields.add('tensionLevel');
      newLockedFields.add('voicePreset');
      
      setLockedFields(newLockedFields);
      alert("Voice profile applied and fields locked in Module B.");
      
      // Update Location Hint for Voice Lab
      if (context.location) {
        setActiveLocationHint(context.location);
      }

      // Switch Tab
      setActiveTab(Tab.Generator);
  }

  const handleGenerateEssaySeedsFromVoice = async (suggestions: any) => {
    setLoading(true);
    try {
      const seeds = await generateEssaySeedsFromVoice(suggestions, authorMix);
      
      // Update params to match the new context (first suggested location is usually the context hint)
      if (suggestions.suggestedLocations && suggestions.suggestedLocations.length > 0) {
        setParams(prev => ({
          ...prev,
          locationName: suggestions.suggestedLocations[0],
          biomeType: suggestions.suggestedBiomes && suggestions.suggestedBiomes.length > 0 
            ? suggestions.suggestedBiomes 
            : prev.biomeType,
          narrativeAnchor: suggestions.recommendedAnchor || prev.narrativeAnchor
        }));
      }

      setEssaySeeds(prev => [...seeds, ...prev]);
      setActiveTab(Tab.EssayBuilder);
      alert("Generated essay seeds from voice profile suggestions!");
    } catch (error) {
      alert("Failed to generate essay seeds from voice profile.");
    } finally {
      setLoading(false);
    }
  };

  // Pipeline Handlers
  const handleUseSeed = (seed: Seed) => {
      // Format the seed object into a text block for the Expander
      const textBlock = `TITLE: ${seed.title || 'Untitled'}\nPREMISE: ${seed.premise || ''}\nMOTIFS: ${seed.motifs?.join(', ') || 'None'}\nTONE: ${seed.toneProfile || 'Standard'}\nSTRUCTURE: ${seed.structuralSuggestion || 'Standard'}`;
      setCurrentSeed(textBlock);
      setActiveTab(Tab.Expander);
  };

  // --- GRAFTING / REMIX LOGIC ---
  const toggleSeedSelection = (index: number) => {
      setSelectedSeedIndices(prev => 
        prev.includes(index) 
            ? prev.filter(i => i !== index) 
            : [...prev, index]
      );
  };

  const handleRemixSeeds = async () => {
      const selectedSeeds = selectedSeedIndices.map(i => generatedSeeds[i]);
      if (selectedSeeds.length < 2) return;
      
      setLoading(true);
      try {
          const resultJson = await remixStrandlineSeeds(selectedSeeds, authorMix);
          const newSeeds: Seed[] = JSON.parse(resultJson);
          setGeneratedSeeds(prev => [...newSeeds, ...prev]); // Prepend new seeds
          setSelectedSeedIndices([]); // Reset selection
          setTimeout(() => {
             resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
      } catch (error: any) {
          if (error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED')) {
              setShowKeyPrompt(true);
          } else {
              alert("Failed to graft seeds.");
          }
      } finally {
          setLoading(false);
      }
  };

  const handleFuseSeeds = () => {
      const selectedSeeds = selectedSeedIndices.map(i => generatedSeeds[i]).filter(Boolean);
      if (selectedSeeds.length < 2) return;

      const combinedBlock = selectedSeeds.map((s, i) => `
[THREAD ${i + 1}]
TITLE: ${s.title || 'Untitled'}
PREMISE: ${s.premise || ''}
MOTIFS: ${s.motifs?.join(', ') || 'None'}
TONE: ${s.toneProfile || 'Standard'}
      `).join('\n\n');

      const fusionPrompt = `
COMBINED NARRATIVE INPUT (FUSED SEEDS):
The user wants to combine the following threads into a single expanded structure:

${combinedBlock}

${params.isSeriesMode ? `SERIES CONTINUITY MODE: This is a series of chapters. Focus on the flow and transitions between these segments. Use the 'Continuity Map' expansion mode to synthesize these into a cohesive whole.` : "INSTRUCTION: Weave these threads together into a single narrative arc."}
      `;
      
      setCurrentSeed(fusionPrompt);
      setActiveTab(Tab.Expander);
      setSelectedSeedIndices([]);
  }

  const handleSaveToBank = (seed: Seed) => {
      setSeedBank(prev => [...prev, seed]);
      alert("Seed archived to Seed Bank.");
  };

  const handleRemoveFromBank = (index: number) => {
      const newBank = [...seedBank];
      newBank.splice(index, 1);
      setSeedBank(newBank);
  };

  const handleDownloadBank = () => {
      const timestamp = new Date().toISOString().slice(0, 10);
      const content = JSON.stringify(seedBank, null, 2);
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Strandline-SeedBank-${timestamp}.json`;
      a.click();
      URL.revokeObjectURL(url);
  };

  const handleAddToBook = (title: string, content: string) => {
    const newChapter: BookChapter = {
        id: Date.now().toString(),
        title,
        content,
        timestamp: Date.now(),
    };
    setBookChapters([...bookChapters, newChapter]);
    alert("Saved to Book Builder!");
  };

  const handleAddEssaySeed = (seed: EssaySeed) => {
    setEssaySeeds(prev => [seed, ...prev]);
  };

  const handleUpdateEssaySeed = (index: number, updatedSeed: EssaySeed) => {
    setEssaySeeds(prev => {
      const next = [...prev];
      next[index] = updatedSeed;
      return next;
    });
  };

  const handleAddEssayDraft = (draft: EssayDraft) => {
    setEssayDrafts(prev => [draft, ...prev]);
  };

  const handleClearEssaySeeds = () => {
    setEssaySeeds([]);
  };

  const handleSaveBlueprint = (name: string) => {
    const newBlueprint: NarrativeBlueprint = {
      id: Date.now().toString(),
      name,
      authorMix,
      params,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updatedBlueprints = [...blueprints, newBlueprint];
    setBlueprints(updatedBlueprints);
    localStorage.setItem(STORAGE_KEYS.BLUEPRINTS, JSON.stringify(updatedBlueprints));
    setActiveBlueprint(newBlueprint);
    alert(`Blueprint "${name}" saved and activated!`);
  };

  const handleLoadBlueprint = (blueprint: NarrativeBlueprint) => {
    setParams(blueprint.params);
    setAuthorMix(blueprint.authorMix);
    setActiveBlueprint(blueprint);
    setActiveTab(Tab.Generator);
    alert(`Loaded blueprint: ${blueprint.name}`);
  };

  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState('');

  const handleGenerateMasterPrompt = async () => {
      if (bookChapters.length === 0) return;
      setLoading(true);
      try {
          const prompt = await generateMasterPrompt(bookChapters, authorMix);
          setGeneratedPrompt(prompt);
          setIsPromptModalOpen(true);
      } catch (error: any) {
          handleQuotaExceeded();
      } finally {
          setLoading(false);
      }
  };

  const handleGeneratePrompt = async (seed: Seed) => {
    setPromptLoading(true);
    try {
      const prompt = await generateWritingPrompt(seed, authorMix);
      setGeneratedPrompt(prompt);
      setIsPromptModalOpen(true);
    } catch (error: any) {
      alert("Failed to generate writing prompt.");
    } finally {
      setPromptLoading(false);
    }
  };

  const handleGenerateBankPrompt = async () => {
    if (seedBank.length === 0) return;
    setPromptLoading(true);
    try {
      const combinedSeeds = seedBank.map((s, i) => `[SEED ${i+1}]\nTITLE: ${s.title}\nPREMISE: ${s.premise}\nMOTIFS: ${s.motifs.join(', ')}`).join('\n\n');
      const prompt = await generateWritingPrompt(combinedSeeds, authorMix);
      setGeneratedPrompt(prompt);
      setIsPromptModalOpen(true);
    } catch (error: any) {
      alert("Failed to generate bank prompt.");
    } finally {
      setPromptLoading(false);
    }
  };

  const handleSaveSnippet = (text: string) => {
    const newSnippet: Snippet = {
        id: Date.now().toString(),
        content: text,
        source: activeTab === Tab.Prose ? 'Prose Builder' : 'Revision Engine',
        timestamp: Date.now()
    };
    setSnippets(prev => [...prev, newSnippet]);
  }

  const handleResetSession = () => {
    if (confirm("Reset the current writing session (clear editor)? Your Book Builder chapters, Seed Bank, and Settings will remain saved.")) {
        setCurrentSeed('');
        setCurrentExpansion('');
        setCurrentDraft('');
        setCurrentRevision('');
        setGeneratedSeeds([]);
        setSelectedSeedIndices([]);
        setActiveTab(Tab.Generator);
    }
  };

  const handleOpenKeySelector = async () => {
    // @ts-ignore
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      setHasPersonalKey(true);
      setShowKeyPrompt(false);
    }
  };

  const handleQuotaExceeded = () => {
    setShowKeyPrompt(true);
  };

  // Helper to switch tabs from sub-components
  const handleTabChange = (tabName: string) => {
      if (tabName === 'Reference') setActiveTab(Tab.Reference);
      if (tabName === 'Generator') setActiveTab(Tab.Generator);
  }

  return (
    <div className="min-h-screen font-sans bg-strand-50 text-strand-900 selection:bg-strand-200 selection:text-strand-900 pb-20 relative">
      {/* Header */}
      <header className="bg-white border-b border-strand-200 sticky top-0 z-30 bg-opacity-90 backdrop-blur-md">
        {showKeyPrompt && (
          <div className="bg-strand-900 text-white px-4 py-2 text-center text-xs flex items-center justify-center gap-4 animate-in slide-in-from-top-full">
            <span>Quota exceeded. Please provide your own Gemini API key to continue with higher limits.</span>
            <button 
              onClick={handleOpenKeySelector}
              className="bg-white text-strand-900 px-3 py-1 rounded font-bold hover:bg-strand-100 transition-colors"
            >
              Select API Key
            </button>
            <button onClick={() => setShowKeyPrompt(false)} className="opacity-50 hover:opacity-100">✕</button>
          </div>
        )}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col xl:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleResetSession}>
            <div className="w-8 h-8 bg-strand-800 rounded-full flex items-center justify-center text-strand-50 font-serif font-bold text-lg shadow-sm">
              S
            </div>
            <div className="flex flex-col">
              <h1 className="font-serif text-xl font-bold tracking-tight text-strand-800">
                Strandline <span className="text-strand-400 font-light italic">Studio</span>
              </h1>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${hasPersonalKey ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                <button 
                  onClick={handleOpenKeySelector}
                  className="text-[9px] uppercase tracking-widest font-bold text-strand-400 hover:text-strand-800 transition-colors"
                >
                  {hasPersonalKey ? 'Personal API Key Active' : 'Using Shared Quota (Click to set personal key)'}
                </button>
              </div>
            </div>
          </div>
          
          <nav className="flex gap-1 bg-strand-100 p-1 rounded-lg overflow-x-auto max-w-full scrollbar-hide">
             {Object.values(Tab).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 text-[10px] sm:text-xs font-semibold rounded-md transition-all whitespace-nowrap uppercase tracking-wide flex items-center gap-1 ${
                    activeTab === tab 
                    ? 'bg-white text-strand-800 shadow-sm border border-strand-200' 
                    : 'text-strand-500 hover:text-strand-700'
                  }`}
                >
                  {tab.replace('Module ', '')}
                  {tab === Tab.BookBuilder && bookChapters.length > 0 && (
                     <span className="w-4 h-4 rounded-full bg-strand-800 text-white text-[9px] flex items-center justify-center">
                        {bookChapters.length}
                     </span>
                  )}
                </button>
             ))}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 gap-10 grid grid-cols-1">
        
        {/* Dynamic Header */}
        <section className="text-center space-y-2 max-w-3xl mx-auto mb-2">
          {activeTab === Tab.Generator && (
             <>
              <h2 className="text-3xl font-serif text-strand-800">Module B: Seed Generator</h2>
              <p className="text-strand-600">Cultivate the narrative soil.</p>
            </>
          )}
          {activeTab === Tab.JourneyPlanner && (
             <>
              <h2 className="text-3xl font-serif text-strand-800">Module L: Journey Planner</h2>
              <p className="text-strand-600">Architect the traverse.</p>
            </>
          )}
          {activeTab === Tab.FieldLab && (
             <>
              <h2 className="text-3xl font-serif text-strand-800">Module I: Field Lab</h2>
              <p className="text-strand-600">Ground your narrative in ecological reality.</p>
            </>
          )}
          {activeTab === Tab.VoiceLab && (
             <>
              <h2 className="text-3xl font-serif text-strand-800">Module A: Voice Lab</h2>
              <p className="text-strand-600">Mix the auditory frequency of the studio.</p>
            </>
          )}
          {activeTab === Tab.Expander && (
             <>
              <h2 className="text-3xl font-serif text-strand-800">Module C: Expander</h2>
              <p className="text-strand-600">Grow the structure from the seed.</p>
            </>
          )}
           {activeTab === Tab.Prose && (
             <>
              <h2 className="text-3xl font-serif text-strand-800">Module D: Prose Builder</h2>
              <p className="text-strand-600">Flesh out the skeleton with sensory detail.</p>
            </>
          )}
           {activeTab === Tab.Revision && (
             <>
              <h2 className="text-3xl font-serif text-strand-800">Module E: Revision Engine</h2>
              <p className="text-strand-600">Polish, tune, and deepen the draft.</p>
            </>
          )}
          {activeTab === Tab.BookBuilder && (
             <>
              <h2 className="text-3xl font-serif text-strand-800">Module G: Book Builder</h2>
              <p className="text-strand-600">Assemble the manuscript.</p>
            </>
          )}
          {activeTab === Tab.Reference && (
             <>
              <h2 className="text-3xl font-serif text-strand-800">Module H: Reference</h2>
              <p className="text-strand-600">Explore the matrix of literary modes.</p>
            </>
          )}
          {activeTab === Tab.EssayBuilder && (
             <>
              <h2 className="text-3xl font-serif text-strand-800">Module M: Essay Builder</h2>
              <p className="text-strand-600">Short-form thematic weaves and articles.</p>
            </>
          )}
        </section>

        {/* MAIN CONTENT AREA */}
        <section className="bg-white rounded-xl shadow-sm border border-strand-200 p-6 sm:p-8 relative overflow-hidden min-h-[500px]">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-strand-300 via-strand-500 to-strand-300 opacity-50"></div>

          {activeTab === Tab.Generator && (
            <div className="space-y-10">
                <SeedGeneratorForm 
                    params={params}
                    onParamChange={handleInputChange}
                    loading={loading}
                    onGenerate={handleGenerateSeeds}
                    onTabChange={handleTabChange}
                    onQuotaExceeded={handleQuotaExceeded}
                    labResult={labResult}
                    applyVoiceProfile={applyVoiceProfile}
                    onApplyVoiceProfileChange={setApplyVoiceProfile}
                    onSaveBlueprint={handleSaveBlueprint}
                    lockedFields={lockedFields}
                    onUnlockField={handleUnlockField}
                />

                {/* Generated Seeds Display */}
                {generatedSeeds.length > 0 && (
                    <div ref={resultRef} className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="flex items-center justify-between mb-4 border-b border-strand-200 pb-2">
                             <h3 className="font-serif text-xl text-strand-800">Fresh Seeds</h3>
                             <div className="flex gap-4 items-center">
                                 <button 
                                    onClick={() => {
                                        if (selectedSeedIndices.length === generatedSeeds.length) {
                                            setSelectedSeedIndices([]);
                                        } else {
                                            setSelectedSeedIndices(generatedSeeds.map((_, i) => i));
                                        }
                                    }}
                                    className="text-[10px] font-bold text-strand-600 hover:text-strand-900 uppercase tracking-widest border border-strand-300 px-2 py-1 rounded hover:bg-strand-50 transition-colors"
                                 >
                                    {selectedSeedIndices.length === generatedSeeds.length ? 'Deselect All' : 'Select All'}
                                 </button>
                                 {selectedSeedIndices.length > 0 && (
                                     <span className="text-xs font-bold text-strand-500 uppercase tracking-wide bg-strand-100 px-2 py-1 rounded">
                                         {selectedSeedIndices.length} Selected
                                     </span>
                                 )}
                                 <span className="text-xs text-strand-500 uppercase tracking-wide">{generatedSeeds.length} Generated</span>
                             </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {generatedSeeds.map((seed, idx) => {
                                const isSelected = selectedSeedIndices.includes(idx);
                                return (
                                    <div 
                                        key={idx} 
                                        className={`
                                            relative bg-strand-50 border rounded-xl p-6 flex flex-col justify-between hover:shadow-md transition-all group
                                            ${isSelected ? 'border-strand-500 ring-1 ring-strand-500 bg-strand-100' : 'border-strand-200'}
                                        `}
                                    >
                                        <div className="absolute top-4 right-4 z-10">
                                            <input 
                                                type="checkbox" 
                                                checked={isSelected}
                                                onChange={() => toggleSeedSelection(idx)}
                                                className="w-5 h-5 rounded border-strand-300 text-strand-700 focus:ring-strand-500 cursor-pointer"
                                                title="Select to Remix"
                                            />
                                        </div>
                                        <div className="space-y-4 mb-6">
                                            <div className="flex justify-between items-start gap-2">
                                                <h4 className="font-serif font-bold text-lg text-strand-900 leading-tight group-hover:text-strand-600 transition-colors pr-6">
                                                    {seed.title}
                                                </h4>
                                                {params.isSeriesMode && (
                                                    <span className="bg-strand-800 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest flex-shrink-0 mt-1">
                                                        Chapter {idx + 1}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-strand-700 font-serif leading-relaxed">
                                                {seed.premise}
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {seed.motifs?.slice(0,3).map((m, i) => (
                                                    <span key={i} className="text-[10px] bg-white border border-strand-200 px-2 py-1 rounded-full text-strand-500 uppercase tracking-wide">
                                                        {m}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 pt-4 border-t border-strand-200">
                                            <button 
                                                onClick={() => handleUseSeed(seed)}
                                                className="flex-1 flex items-center justify-center gap-2 bg-strand-800 text-white text-xs font-bold py-2 rounded-lg hover:bg-strand-900 transition-colors"
                                            >
                                                <ArrowRightCircleIcon className="w-4 h-4" />
                                                Expand
                                            </button>
                                            <button 
                                                onClick={() => handleGeneratePrompt(seed)}
                                                disabled={promptLoading}
                                                className="p-2 text-strand-500 hover:text-strand-800 hover:bg-strand-200 rounded-lg transition-colors"
                                                title="Prompt Architect"
                                            >
                                                {promptLoading ? <RefreshIcon className="w-5 h-5 animate-spin" /> : <ClipboardIcon className="w-5 h-5" />}
                                            </button>
                                            <button 
                                                onClick={() => handleDevelopInStudio(seed)}
                                                className="p-2 text-strand-500 hover:text-strand-800 hover:bg-strand-200 rounded-lg transition-colors"
                                                title="Develop in Studio"
                                            >
                                                <SparklesIcon className="w-5 h-5" />
                                            </button>
                                            <button 
                                                onClick={() => handlePromoteToBlueprint(seed)}
                                                className="p-2 text-strand-500 hover:text-strand-800 hover:bg-strand-200 rounded-lg transition-colors"
                                                title="Promote to Blueprint"
                                            >
                                                <PlusCircleIcon className="w-5 h-5" />
                                            </button>
                                            <button 
                                                onClick={() => handleSaveToBank(seed)}
                                                className="p-2 text-strand-500 hover:text-strand-800 hover:bg-strand-200 rounded-lg transition-colors"
                                                title="Save to Seed Bank"
                                            >
                                                <ArchiveBoxIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* GRAFTING/MIXING FLOATING BAR */}
                {selectedSeedIndices.length > 1 && (
                    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-strand-900 text-white p-2 rounded-full shadow-2xl flex items-center gap-4 pl-6 pr-2 border border-strand-700 animate-in slide-in-from-bottom-10">
                        <span className="text-xs font-bold uppercase tracking-wide">{selectedSeedIndices.length} Seeds Selected</span>
                        <div className="flex gap-2">
                             <button 
                                onClick={handleRemixSeeds}
                                disabled={loading}
                                className="bg-white text-strand-900 px-4 py-2 rounded-full text-xs font-bold hover:bg-strand-100 transition-colors flex items-center gap-2"
                             >
                                 {loading ? <span className="animate-spin">⟳</span> : <SparklesIcon className="w-4 h-4" />}
                                 Graft (Generate New)
                             </button>
                             <button 
                                onClick={handleFuseSeeds}
                                disabled={loading}
                                className="bg-strand-700 text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-strand-600 transition-colors flex items-center gap-2 border border-strand-600"
                             >
                                 <PlusCircleIcon className="w-4 h-4" />
                                 Fuse (Expand Together)
                             </button>
                        </div>
                        <button 
                            onClick={() => setSelectedSeedIndices([])}
                            className="w-8 h-8 flex items-center justify-center hover:bg-strand-800 rounded-full text-strand-400 hover:text-white transition-colors ml-2"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* SEED BANK */}
                <div className="bg-strand-100 rounded-xl p-6 sm:p-8 mt-12 border border-strand-200">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <ArchiveBoxIcon className="w-6 h-6 text-strand-600" />
                            <h3 className="font-serif text-xl text-strand-800">Seed Bank</h3>
                            <span className="bg-white px-2 py-0.5 rounded-full text-xs font-bold text-strand-500">
                                {seedBank.length}
                            </span>
                        </div>
                        {seedBank.length > 0 && (
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={handleGenerateBankPrompt}
                                    disabled={promptLoading}
                                    className="text-xs font-bold bg-strand-800 text-white px-3 py-1.5 rounded-md hover:bg-strand-900 transition-colors flex items-center gap-2"
                                >
                                    {promptLoading ? <RefreshIcon className="w-3 h-3 animate-spin" /> : <SparklesIcon className="w-3 h-3" />}
                                    Master Prompt
                                </button>
                                <button 
                                    onClick={handleDownloadBank}
                                    className="text-xs font-semibold text-strand-600 hover:text-strand-900 underline"
                                >
                                    Download Bank (.json)
                                </button>
                            </div>
                        )}
                    </div>

                    {seedBank.length === 0 ? (
                        <div className="text-center py-8 text-strand-400 text-sm italic border-2 border-dashed border-strand-300 rounded-lg">
                            Archive seeds here to keep them safe while you write.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {seedBank.map((seed, idx) => (
                                <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border border-strand-200 flex flex-col sm:flex-row justify-between gap-4">
                                     <div className="flex-grow">
                                         <h4 className="font-serif font-bold text-strand-900 text-sm">{seed.title}</h4>
                                         <p className="text-xs text-strand-600 line-clamp-2 mt-1">{seed.premise}</p>
                                     </div>
                                     <div className="flex items-center gap-2 flex-shrink-0">
                                        <button 
                                            onClick={() => handleUseSeed(seed)}
                                            className="text-[10px] font-bold bg-strand-50 border border-strand-200 px-3 py-1.5 rounded hover:bg-strand-100 transition-colors uppercase tracking-wide"
                                        >
                                            Load
                                        </button>
                                        <button 
                                            onClick={() => handleRemoveFromBank(idx)}
                                            className="text-strand-400 hover:text-red-500 p-1 transition-colors"
                                        >
                                            ✕
                                        </button>
                                     </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
          )}

          {activeTab === Tab.JourneyPlanner && (
            <JourneyPlanner 
                params={params}
                authorMix={authorMix}
                onUpdateParams={setParams}
                onAddToBook={handleAddToBook}
                onQuotaExceeded={handleQuotaExceeded}
            />
          )}
          
          <div className={activeTab === Tab.VoiceLab ? 'block' : 'hidden'}>
            <VoiceLab 
              mix={authorMix} 
              onMixChange={setAuthorMix} 
              onGenerate={handleGenerateProfile}
              loading={loading}
              result={labResult}
              onApplySuggestions={handleApplyVoiceContext}
              onGenerateEssaySeeds={handleGenerateEssaySeedsFromVoice}
              onQuotaExceeded={handleQuotaExceeded}
              activeLocationHint={activeLocationHint}
              onLocationHintChange={setActiveLocationHint}
              mediaInfluence={mediaInfluence}
              onMediaInfluenceChange={setMediaInfluence}
            />
          </div>

          <div className={activeTab === Tab.EssayBuilder ? 'block' : 'hidden'}>
            <EssayBuilder 
              seeds={essaySeeds}
              onAddDraft={handleAddEssayDraft}
              onAddSeed={handleAddEssaySeed}
              onUpdateSeed={handleUpdateEssaySeed}
              mix={authorMix}
              params={params}
              onClearSeeds={handleClearEssaySeeds}
            />
          </div>

          <div className={activeTab === Tab.BlueprintLibrary ? 'block' : 'hidden'}>
            <BlueprintLibrary 
              blueprints={blueprints}
              onLoad={handleLoadBlueprint}
              onDelete={(id) => setBlueprints(prev => prev.filter(b => b.id !== id))}
              activeSeed={activeSeed}
              onSaveBlueprint={(bp) => {
                setBlueprints(prev => [...prev, bp]);
                setActiveBlueprint(bp);
                alert(`Blueprint "${bp.name}" saved!`);
              }}
              authorMix={authorMix}
              params={params}
              onQuotaExceeded={handleQuotaExceeded}
            />
          </div>

          <div className={activeTab === Tab.NarrativeStudio ? 'block' : 'hidden'}>
            <NarrativeStudio 
              blueprint={activeBlueprint}
              seed={activeSeed}
              onQuotaExceeded={handleQuotaExceeded}
            />
          </div>

          <div className={activeTab === Tab.FieldLab ? 'block' : 'hidden'}>
            <FieldLab 
              locationName={params.locationName}
              biome={params.biomeType?.[0] || BiomeType.CrimeScene}
            />
          </div>
          
          <div className={activeTab === Tab.CharacterLab ? 'block' : 'hidden'}>
            <CharacterLab 
              biome={params.biomeType?.[0] || BiomeType.CrimeScene}
              authorMix={authorMix}
              onQuotaExceeded={handleQuotaExceeded}
            />
          </div>

          <div className={activeTab === Tab.Expander ? 'block' : 'hidden'}>
            <SeedExpander 
              authorMix={authorMix} 
              initialSeed={currentSeed}
              onExpansionComplete={(text) => {
                  setCurrentExpansion(text);
                  setActiveTab(Tab.Prose);
              }}
              onQuotaExceeded={handleQuotaExceeded}
            />
          </div>

          <div className={activeTab === Tab.Prose ? 'block' : 'hidden'}>
            <ProseBuilder 
              authorMix={authorMix} 
              biomes={params.biomeType} // Pass Biome Context
              initialScaffold={currentExpansion}
              onProseComplete={(text) => {
                  setCurrentDraft(text);
                  setActiveTab(Tab.Revision);
              }}
              onAddToBook={handleAddToBook}
              onSaveSnippet={handleSaveSnippet}
              onQuotaExceeded={handleQuotaExceeded}
            />
          </div>

          <div className={activeTab === Tab.Revision ? 'block' : 'hidden'}>
            <RevisionEngine 
              authorMix={authorMix} 
              initialDraft={currentDraft}
              bookChapters={bookChapters}
              onRevisionComplete={(text) => {
                  setCurrentRevision(text);
                  setActiveTab(Tab.EditorDesk);
              }}
              onAddToBook={handleAddToBook}
              onSaveSnippet={handleSaveSnippet}
              onQuotaExceeded={handleQuotaExceeded}
            />
          </div>

          <div className={activeTab === Tab.EditorDesk ? 'block' : 'hidden'}>
            <EditorDesk 
              draftText={currentDraft}
              motifs={currentSeed?.motifs || []}
              authorMix={authorMix}
              onQuotaExceeded={handleQuotaExceeded}
            />
          </div>

           <div className={activeTab === Tab.Export ? 'block' : 'hidden'}>
            <ExportStudio 
              authorMix={authorMix}
              seed={currentSeed}
              expansion={currentExpansion}
              draft={currentDraft}
              revision={currentRevision}
              onAddToBook={handleAddToBook}
            />
          </div>

          <div className={activeTab === Tab.BookBuilder ? 'block' : 'hidden'}>
            <BookBuilder 
              chapters={bookChapters}
              authorMix={authorMix}
              onUpdateChapters={setBookChapters}
              snippets={snippets}
              onUpdateSnippets={setSnippets}
              onGenerateMasterPrompt={handleGenerateMasterPrompt}
              onQuotaExceeded={handleQuotaExceeded}
            />
          </div>
          
          <div className={activeTab === Tab.Reference ? 'block' : 'hidden'}>
             <ReferenceLibrary />
          </div>

        </section>
      </main>

      <PromptModal 
        isOpen={isPromptModalOpen}
        onClose={() => setIsPromptModalOpen(false)}
        prompt={generatedPrompt}
        title="Master Writing Prompt"
      />
    </div>
  );
}

export default App;