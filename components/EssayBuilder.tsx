
import React, { useState } from 'react';
import { EssaySeed, EssayDraft, AuthorMix, SeedGeneratorParams, ProseLength, RevisionFocus, BraidedThread, VisualContext } from '../types';
import { generateEssayDraft, reviseEssayDraft, generateAdvancedEssaySeed, analyzeLocationWithSearch } from '../services/geminiService';
import { SparklesIcon, RefreshIcon, CopyIcon, ArchiveBoxIcon, PlusCircleIcon, ArrowRightCircleIcon, ClipboardIcon, PhotoIcon, UserIcon, BeakerIcon, ListBulletIcon, SearchIcon, TrashIcon } from './Icons';

interface EssayBuilderProps {
  seeds: EssaySeed[];
  onAddDraft: (draft: EssayDraft) => void;
  onAddSeed: (seed: EssaySeed) => void;
  onUpdateSeed: (index: number, seed: EssaySeed) => void;
  mix: AuthorMix;
  params: SeedGeneratorParams;
  onClearSeeds: () => void;
}

export const EssayBuilder: React.FC<EssayBuilderProps> = ({ seeds, onAddDraft, onAddSeed, onUpdateSeed, mix, params, onClearSeeds }) => {
  const [loading, setLoading] = useState(false);
  const [activeSeedIndex, setActiveSeedIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<string>('');
  const [selectedLength, setSelectedLength] = useState<ProseLength>(ProseLength.Extended);
  const [revisionFocus, setRevisionFocus] = useState<RevisionFocus>(RevisionFocus.DeepenAtmosphere);
  const [customInstructions, setCustomInstructions] = useState('');
  const [showRevisionPanel, setShowRevisionPanel] = useState(false);
  const [isEditingContext, setIsEditingContext] = useState(false);

  // Advanced Architect State
  const [showAdvancedArchitect, setShowAdvancedArchitect] = useState(false);
  const [fieldNotes, setFieldNotes] = useState('');
  const [braidedThreads, setBraidedThreads] = useState<BraidedThread[]>([]);
  const [focalPeople, setFocalPeople] = useState<string[]>([]);
  const [focalArtifacts, setFocalArtifacts] = useState<string[]>([]);
  const [focalPoems, setFocalPoems] = useState<string[]>([]);
  const [focalLyrics, setFocalLyrics] = useState<string[]>([]); // Added for lyrics specifically if needed, but will merge with poems
  const [imageContext, setImageContext] = useState<{ data: string; mimeType: string; preview: string } | null>(null);
  const [scoutLocation, setScoutLocation] = useState(params.locationName || '');
  const [isScouting, setIsScouting] = useState(false);

  // Reset active seed index if it's out of bounds after seeds update
  React.useEffect(() => {
    if (activeSeedIndex !== null && (!seeds[activeSeedIndex] || seeds.length === 0)) {
      setActiveSeedIndex(null);
      setDraft('');
    }
  }, [seeds, activeSeedIndex]);

  const handleGenerateDraft = async (index: number) => {
    if (!seeds[index]) return;
    setLoading(true);
    setActiveSeedIndex(index);
    try {
      const content = await generateEssayDraft(seeds[index], mix, params, selectedLength);
      setDraft(content);
    } catch (error) {
      alert("Failed to generate essay draft.");
    } finally {
      setLoading(false);
    }
  };

  const handleReviseDraft = async () => {
    if (!draft || activeSeedIndex === null) return;
    setLoading(true);
    try {
      const content = await reviseEssayDraft(draft, seeds[activeSeedIndex], mix, revisionFocus, customInstructions);
      setDraft(content);
      setShowRevisionPanel(false);
    } catch (error) {
      alert("Failed to revise essay draft.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    if (!draft || activeSeedIndex === null || !seeds[activeSeedIndex]) return;
    const activeSeed = seeds[activeSeedIndex];
    
    const newDraft: EssayDraft = {
      id: crypto.randomUUID(),
      title: activeSeed.title || 'Untitled Draft',
      content: draft,
      thesis: activeSeed.thesis || '',
      timestamp: Date.now()
    };
    
    onAddDraft(newDraft);
    alert("Draft saved to Archive!");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draft);
    alert("Copied to clipboard!");
  };

  const handleCopyPrompt = async () => {
    if (activeSeedIndex === null || !seeds[activeSeedIndex]) return;
    const seed = seeds[activeSeedIndex];
    if (!seed) return;

    const prompt = `
I want you to write a high-quality essay based on the following parameters:

TITLE: ${seed.title || 'Untitled'}
THESIS: ${seed.thesis || ''}
KEY ARGUMENTS:
${seed.keyArguments?.map(arg => `- ${arg}`).join('\n') || 'None'}

MOTIFS TO WEAVE IN: ${seed.motifs?.join(', ') || 'None'}
TONE PROFILE: ${seed.toneProfile || 'Standard'}
STRUCTURAL SUGGESTION: ${seed.structuralSuggestion || 'Standard'}

${seed.braidedThreads && seed.braidedThreads.length > 0 ? `BRAIDED THREADS:\n${seed.braidedThreads.map(t => `- ${t?.title || 'Untitled'} (${t?.focus || 'General'}): ${t?.description || ''}`).join('\n')}` : ""}
${seed.focalPeople && seed.focalPeople.length > 0 ? `FOCAL PEOPLE: ${seed.focalPeople.join(', ')}` : ""}
${seed.focalArtifacts && seed.focalArtifacts.length > 0 ? `FOCAL ARTIFACTS: ${seed.focalArtifacts.join(', ')}` : ""}
${seed.focalPoems && seed.focalPoems.length > 0 ? `FOCAL POEMS/LYRICS: ${seed.focalPoems.join(', ')}` : ""}
${seed.visualContext ? `VISUAL CONTEXT: ${seed.visualContext.analysis}` : ""}

TARGET LENGTH: ${selectedLength}
LOCATION CONTEXT: ${params.locationName}

WRITING STYLE INSTRUCTIONS:
Please use a voice that blends the following influences:
${Object.entries(mix).filter(([_, val]) => typeof val === 'number' && (val as number) > 0).map(([id, val]) => `- ${id}: ${val}%`).join('\n')}

Focus on sensory detail, precise ecological observation, and a strong narrative voice.
    `.trim();
    
    try {
      await navigator.clipboard.writeText(prompt);
      alert("AI Prompt copied to clipboard! You can now paste this into Claude or another writing tool.");
    } catch (err) {
      console.error('Failed to copy prompt: ', err);
      // Fallback: show the prompt in a textarea for the user to copy manually
      const textarea = document.createElement('textarea');
      textarea.value = prompt;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        alert("Clipboard access denied. Prompt selected in a text area, please copy manually (Ctrl+C).");
      } catch (err) {
        alert("Failed to copy prompt. Please copy the following text manually:\n\n" + prompt);
      }
      document.body.removeChild(textarea);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageContext({
          data: (reader.result as string).split(',')[1],
          mimeType: file.type,
          preview: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScout = async () => {
    if (!scoutLocation) return;
    setIsScouting(true);
    try {
      const report = await analyzeLocationWithSearch(scoutLocation);
      if (report.foundLocation) setScoutLocation(report.foundLocation);
      alert(`Scouted ${scoutLocation}. Ecological context retrieved.`);
    } catch (error) {
      alert("Scouting failed.");
    } finally {
      setIsScouting(false);
    }
  };

  const handleGenerateAdvancedSeed = async () => {
    setLoading(true);
    try {
      const newSeed = await generateAdvancedEssaySeed({
        location: scoutLocation,
        people: focalPeople,
        artifacts: focalArtifacts,
        poems: focalPoems,
        fieldNotes,
        imageContext: imageContext ? { data: imageContext.data, mimeType: imageContext.mimeType } : undefined,
        braidedThreads,
        mix
      });
      onAddSeed(newSeed);
      setShowAdvancedArchitect(false);
      // Reset advanced state
      setFieldNotes('');
      setBraidedThreads([]);
      setFocalPeople([]);
      setFocalArtifacts([]);
      setFocalPoems([]);
      setImageContext(null);
    } catch (error) {
      alert("Failed to generate advanced essay seed.");
    } finally {
      setLoading(false);
    }
  };

  const addThread = () => setBraidedThreads([...braidedThreads, { title: '', focus: 'General', description: '' }]);
  const updateThread = (idx: number, field: keyof BraidedThread, val: string) => {
    const next = [...braidedThreads];
    next[idx] = { ...next[idx], [field]: val };
    setBraidedThreads(next);
  };

  const removeThread = (idx: number) => {
    setBraidedThreads(braidedThreads.filter((_, i) => i !== idx));
  };

  const handleUpdateActiveSeedContext = () => {
    if (activeSeedIndex === null || !seeds[activeSeedIndex]) return;
    const updatedSeed = {
      ...seeds[activeSeedIndex],
      focalPeople,
      focalArtifacts,
      focalPoems,
      braidedThreads,
      fieldNotes // Note: EssaySeed type might need fieldNotes if we want to persist it there
    };
    onUpdateSeed(activeSeedIndex, updatedSeed);
    setIsEditingContext(false);
    alert("Seed context updated!");
  };

  const startEditingContext = () => {
    if (activeSeedIndex === null || !seeds[activeSeedIndex]) return;
    const seed = seeds[activeSeedIndex];
    setFocalPeople(seed.focalPeople || []);
    setFocalArtifacts(seed.focalArtifacts || []);
    setFocalPoems(seed.focalPoems || []);
    setBraidedThreads(seed.braidedThreads || []);
    // setFieldNotes(seed.fieldNotes || ''); // If we add fieldNotes to EssaySeed
    setIsEditingContext(true);
  };

  const addContextItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, current: string[]) => {
    setter([...current, '']);
  };
  const updateContextItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, current: string[], idx: number, val: string) => {
    const next = [...current];
    next[idx] = val;
    setter(next);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center border-b border-strand-200 pb-4">
        <div>
          <h2 className="text-2xl font-serif text-strand-800">Essay Builder</h2>
          <p className="text-strand-500 text-sm mt-1">Short-form articles, thematic weaves, and lyric essays.</p>
        </div>
        <div className="flex gap-4 items-center">
          <button
            onClick={() => setShowAdvancedArchitect(!showAdvancedArchitect)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${showAdvancedArchitect ? 'bg-strand-800 text-white' : 'bg-white text-strand-800 border border-strand-200 hover:border-strand-400'}`}
          >
            <SparklesIcon className="w-4 h-4" />
            {showAdvancedArchitect ? 'Close Architect' : 'Advanced Architect'}
          </button>
          {seeds.length > 0 && (
            <button 
              onClick={onClearSeeds}
              className="text-xs font-bold text-strand-400 hover:text-strand-600 transition-colors"
            >
              Clear Essay Seeds
            </button>
          )}
        </div>
      </div>

      {showAdvancedArchitect && (
        <div className="bg-white rounded-xl border border-strand-200 shadow-md overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-strand-800 text-white px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <SparklesIcon className="w-6 h-6 text-strand-300" />
              <div>
                <h3 className="font-serif font-bold">Advanced Essay Architect</h3>
                <p className="text-[10px] text-strand-300 uppercase tracking-widest">Visual Witness • Distiller • Braided Planner</p>
              </div>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Visual & Notes */}
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-bold text-strand-500 uppercase tracking-widest block mb-2">Visual Witness (Image Upload)</label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 flex flex-col items-center justify-center h-32 border-2 border-dashed border-strand-200 rounded-xl hover:border-strand-400 transition-colors cursor-pointer bg-strand-50 overflow-hidden relative">
                    {imageContext ? (
                      <img src={imageContext.preview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <PhotoIcon className="w-8 h-8 text-strand-300 mb-2" />
                        <span className="text-[10px] text-strand-400 font-bold">Upload Field Photo</span>
                      </>
                    )}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  {imageContext && (
                    <button onClick={() => setImageContext(null)} className="text-red-500 hover:text-red-700 p-2">
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-strand-500 uppercase tracking-widest block mb-2">Field Note Distiller</label>
                <textarea
                  value={fieldNotes}
                  onChange={(e) => setFieldNotes(e.target.value)}
                  placeholder="Paste raw, messy observations here. The AI will distill them into a structured seed..."
                  className="w-full h-48 p-4 rounded-xl border border-strand-200 text-sm focus:ring-2 focus:ring-strand-500 outline-none resize-none font-serif"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-strand-500 uppercase tracking-widest block mb-2">Geographic Grounding (Scout)</label>
                <div className="flex gap-2 relative group">
                  <input
                    type="text"
                    value={scoutLocation}
                    onChange={(e) => setScoutLocation(e.target.value)}
                    placeholder="Enter a specific location (e.g. Orford Ness)"
                    className="flex-1 px-4 py-2 rounded-lg border border-strand-200 text-sm outline-none focus:ring-2 focus:ring-strand-500 pr-10"
                  />
                  {scoutLocation && (
                    <button 
                      onClick={() => setScoutLocation('')}
                      className="absolute right-24 top-1/2 -translate-y-1/2 p-1 text-strand-300 hover:text-strand-500 transition-colors"
                      title="Clear Scout Location"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={handleScout}
                    disabled={isScouting}
                    className="bg-strand-100 text-strand-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-strand-200 transition-colors flex items-center gap-2"
                  >
                    {isScouting ? <RefreshIcon className="w-4 h-4 animate-spin" /> : <SearchIcon className="w-4 h-4" />}
                    Scout
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Braiding & Context */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[10px] font-bold text-strand-500 uppercase tracking-widest">Braided Threads</label>
                  <button onClick={addThread} className="text-strand-600 hover:text-strand-800">
                    <PlusCircleIcon className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-2 scrollbar-hide">
                  {braidedThreads.map((thread, idx) => (
                    <div key={idx} className="bg-strand-50 p-3 rounded-lg border border-strand-200 space-y-2 relative group">
                      <button onClick={() => removeThread(idx)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-strand-400 hover:text-red-500 transition-opacity">
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          placeholder="Thread Title"
                          value={thread?.title || ''}
                          onChange={(e) => updateThread(idx, 'title', e.target.value)}
                          className="px-2 py-1 rounded border border-strand-200 text-[10px] outline-none"
                        />
                        <select
                          value={thread?.focus || 'General'}
                          onChange={(e) => updateThread(idx, 'focus', e.target.value)}
                          className="px-2 py-1 rounded border border-strand-200 text-[10px] outline-none"
                        >
                          <option>Historical</option>
                          <option>Ecological</option>
                          <option>Personal</option>
                          <option>Philosophical</option>
                          <option>Artistic</option>
                          <option>General</option>
                        </select>
                      </div>
                      <textarea
                        placeholder="Thread focus/description..."
                        value={thread?.description || ''}
                        onChange={(e) => updateThread(idx, 'description', e.target.value)}
                        className="w-full h-12 p-2 rounded border border-strand-200 text-[10px] outline-none resize-none"
                      />
                    </div>
                  ))}
                  {braidedThreads.length === 0 && (
                    <p className="text-[10px] text-strand-400 italic text-center py-4">Add threads to weave multiple narratives together.</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* People */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] font-bold text-strand-500 uppercase tracking-widest flex items-center gap-1">
                      <UserIcon className="w-3 h-3" /> People
                    </label>
                    <button onClick={() => addContextItem(setFocalPeople, focalPeople)} className="text-strand-400 hover:text-strand-600">
                      <PlusCircleIcon className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {focalPeople.map((p, idx) => (
                      <input
                        key={idx}
                        value={p}
                        onChange={(e) => updateContextItem(setFocalPeople, focalPeople, idx, e.target.value)}
                        className="w-full px-2 py-1 rounded border border-strand-200 text-[10px] outline-none"
                        placeholder="Name..."
                      />
                    ))}
                  </div>
                </div>

                {/* Artifacts */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] font-bold text-strand-500 uppercase tracking-widest flex items-center gap-1">
                      <BeakerIcon className="w-3 h-3" /> Artifacts
                    </label>
                    <button onClick={() => addContextItem(setFocalArtifacts, focalArtifacts)} className="text-strand-400 hover:text-strand-600">
                      <PlusCircleIcon className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {focalArtifacts.map((a, idx) => (
                      <input
                        key={idx}
                        value={a}
                        onChange={(e) => updateContextItem(setFocalArtifacts, focalArtifacts, idx, e.target.value)}
                        className="w-full px-2 py-1 rounded border border-strand-200 text-[10px] outline-none"
                        placeholder="Object..."
                      />
                    ))}
                  </div>
                </div>

                {/* Poems & Lyrics */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] font-bold text-strand-500 uppercase tracking-widest flex items-center gap-1">
                      <ListBulletIcon className="w-3 h-3" /> Poems & Lyrics
                    </label>
                    <button onClick={() => addContextItem(setFocalPoems, focalPoems)} className="text-strand-400 hover:text-strand-600">
                      <PlusCircleIcon className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {focalPoems.map((p, idx) => (
                      <input
                        key={idx}
                        value={p}
                        onChange={(e) => updateContextItem(setFocalPoems, focalPoems, idx, e.target.value)}
                        className="w-full px-2 py-1 rounded border border-strand-200 text-[10px] outline-none"
                        placeholder="Title/Line/Lyric..."
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-strand-50 px-6 py-4 flex justify-end border-t border-strand-200">
            <button
              onClick={handleGenerateAdvancedSeed}
              disabled={loading}
              className="flex items-center gap-2 bg-strand-800 text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-strand-900 transition-all shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {loading ? <RefreshIcon className="w-5 h-5 animate-spin" /> : <SparklesIcon className="w-5 h-5" />}
              Architect Advanced Seed
            </button>
          </div>
        </div>
      )}

      {seeds.length === 0 && !showAdvancedArchitect ? (
        <div className="bg-strand-100/50 rounded-xl p-12 text-center border-2 border-dashed border-strand-200">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <PlusCircleIcon className="w-8 h-8 text-strand-300" />
          </div>
          <h3 className="font-serif text-lg text-strand-800 mb-2">No Essay Seeds Active</h3>
          <p className="text-strand-500 text-sm max-w-md mx-auto">
            Generate essay seeds in the <span className="font-bold">Seeds</span> module (switch to Essay mode) or send them from the <span className="font-bold">Voice Lab</span> suggestions.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Seed Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div>
              <h3 className="text-xs font-bold text-strand-400 uppercase tracking-widest mb-3">Target Length</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(ProseLength).map((len) => (
                  <button
                    key={len}
                    onClick={() => setSelectedLength(len)}
                    className={`px-3 py-2 rounded-lg text-[10px] font-bold transition-all border ${selectedLength === len ? 'bg-strand-800 text-white border-strand-800' : 'bg-white text-strand-500 border-strand-200 hover:border-strand-300'}`}
                  >
                    {len.split(' (')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-strand-400 uppercase tracking-widest mb-2">Active Essay Seeds</h3>
              {seeds.map((seed, idx) => (
                <div key={idx} className="space-y-2">
                  <button
                    onClick={() => handleGenerateDraft(idx)}
                    disabled={loading}
                    className={`
                      w-full text-left p-4 rounded-xl border transition-all group
                      ${activeSeedIndex === idx 
                        ? 'bg-strand-800 border-strand-800 text-white shadow-md' 
                        : 'bg-white border-strand-200 text-strand-800 hover:border-strand-400 shadow-sm'
                      }
                    `}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-serif font-bold text-sm leading-tight">{seed?.title || 'Untitled Seed'}</h4>
                      <ArrowRightCircleIcon className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${activeSeedIndex === idx ? 'text-strand-300' : 'text-strand-400'}`} />
                    </div>
                    <p className={`text-[10px] line-clamp-2 mb-2 ${activeSeedIndex === idx ? 'text-strand-300' : 'text-strand-500'}`}>
                      {seed?.thesis || 'No thesis provided.'}
                    </p>
                  </button>
                  {activeSeedIndex === idx && (
                    <button
                      onClick={handleCopyPrompt}
                      className="w-full flex items-center justify-center gap-2 py-2 bg-strand-100 text-strand-600 rounded-lg text-[10px] font-bold hover:bg-strand-200 transition-colors border border-strand-200"
                    >
                      <ClipboardIcon className="w-3.5 h-3.5" />
                      Copy Prompt for External AI
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Drafting Area */}
          <div className="lg:col-span-2 space-y-4">
            {activeSeedIndex !== null ? (
              <div className="bg-white rounded-xl shadow-sm border border-strand-200 overflow-hidden flex flex-col min-h-[700px]">
                <div className="bg-strand-50 border-b border-strand-200 px-6 py-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-serif font-bold text-strand-800">{seeds[activeSeedIndex]?.title || 'Untitled'}</h3>
                    <p className="text-[10px] text-strand-500 uppercase tracking-wider font-bold">Essay Draft</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setShowRevisionPanel(!showRevisionPanel)}
                      className={`p-2 rounded-lg transition-colors ${showRevisionPanel ? 'bg-strand-200 text-strand-800' : 'hover:bg-strand-200 text-strand-600'}`}
                      title="Revision Engine"
                    >
                      <RefreshIcon className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={handleCopy}
                      className="p-2 hover:bg-strand-200 rounded-lg text-strand-600 transition-colors"
                      title="Copy to Clipboard"
                    >
                      <CopyIcon className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={handleSaveDraft}
                      className="flex items-center gap-2 bg-strand-800 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-strand-900 transition-colors shadow-sm"
                    >
                      <ArchiveBoxIcon className="w-3.5 h-3.5" />
                      Save to Archive
                    </button>
                  </div>
                </div>

                {showRevisionPanel && (
                  <div className="bg-strand-100 p-6 border-b border-strand-200 animate-in slide-in-from-top duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-[10px] font-bold text-strand-500 uppercase tracking-widest block mb-2">Revision Focus</label>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.values(RevisionFocus).map((focus) => (
                            <button
                              key={focus}
                              onClick={() => setRevisionFocus(focus)}
                              className={`px-3 py-2 rounded-lg text-[10px] font-bold transition-all border ${revisionFocus === focus ? 'bg-strand-800 text-white border-strand-800' : 'bg-white text-strand-500 border-strand-200 hover:border-strand-300'}`}
                            >
                              {focus}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-strand-500 uppercase tracking-widest block mb-2">Custom Instructions (Optional)</label>
                        <textarea
                          value={customInstructions}
                          onChange={(e) => setCustomInstructions(e.target.value)}
                          placeholder="e.g. Make the conclusion more hopeful, or focus more on the marine life..."
                          className="w-full h-20 p-3 rounded-lg border border-strand-200 text-xs focus:ring-2 focus:ring-strand-500 focus:border-transparent outline-none resize-none"
                        />
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={handleReviseDraft}
                        disabled={loading}
                        className="flex items-center gap-2 bg-strand-800 text-white px-6 py-2 rounded-lg text-xs font-bold hover:bg-strand-900 transition-colors shadow-md"
                      >
                        <SparklesIcon className="w-3.5 h-3.5" />
                        Apply Revision
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex-1 p-8 relative flex flex-col">
                  {loading ? (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                      <RefreshIcon className="w-8 h-8 text-strand-800 animate-spin mb-4" />
                      <p className="font-serif italic text-strand-600">Processing essay...</p>
                    </div>
                  ) : draft ? (
                    <div className="flex-1 flex flex-col">
                      <div className="mb-6 pb-6 border-b border-strand-100">
                        <p className="text-xs font-bold text-strand-400 uppercase tracking-widest mb-2">Thesis</p>
                        <p className="font-serif italic text-strand-700 leading-relaxed mb-4">
                          {seeds[activeSeedIndex]?.thesis || 'No thesis provided.'}
                        </p>

                        {/* Contextual Weave Display */}
                        {(seeds[activeSeedIndex]?.focalPeople?.length || 0) > 0 || 
                         (seeds[activeSeedIndex]?.focalArtifacts?.length || 0) > 0 || 
                         (seeds[activeSeedIndex]?.focalPoems?.length || 0) > 0 || 
                         (seeds[activeSeedIndex]?.braidedThreads?.length || 0) > 0 || isEditingContext ? (
                          <div className="mt-4 p-4 bg-strand-50 rounded-xl border border-strand-100 relative">
                            <div className="flex justify-between items-center mb-4">
                               <p className="text-[10px] font-bold text-strand-400 uppercase tracking-widest">Contextual Weave</p>
                               {!isEditingContext ? (
                                 <button 
                                   onClick={startEditingContext}
                                   className="text-[10px] font-bold text-strand-600 hover:text-strand-800 flex items-center gap-1"
                                 >
                                   <RefreshIcon className="w-3 h-3" /> Edit Context
                                 </button>
                               ) : (
                                 <div className="flex gap-2">
                                   <button 
                                     onClick={() => setIsEditingContext(false)}
                                     className="text-[10px] font-bold text-strand-400 hover:text-strand-600"
                                   >
                                     Cancel
                                   </button>
                                   <button 
                                     onClick={handleUpdateActiveSeedContext}
                                     className="text-[10px] font-bold text-strand-800 hover:text-strand-900"
                                   >
                                     Save Changes
                                   </button>
                                 </div>
                               )}
                            </div>

                            {isEditingContext ? (
                              <div className="space-y-4">
                                {/* Inline Editing Form */}
                                <div>
                                  <div className="flex justify-between items-center mb-2">
                                    <label className="text-[10px] font-bold text-strand-500">Braided Threads</label>
                                    <button onClick={addThread} className="text-strand-400"><PlusCircleIcon className="w-3 h-3" /></button>
                                  </div>
                                  <div className="space-y-2">
                                    {braidedThreads.map((t, i) => (
                                      <div key={i} className="flex gap-2 items-start">
                                        <input 
                                          className="flex-1 px-2 py-1 text-[10px] border border-strand-200 rounded" 
                                          value={t.title} 
                                          onChange={(e) => updateThread(i, 'title', e.target.value)}
                                          placeholder="Title"
                                        />
                                        <button onClick={() => removeThread(i)} className="text-red-400"><TrashIcon className="w-3 h-3" /></button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                  <div>
                                    <label className="text-[10px] font-bold text-strand-500 block mb-1">People</label>
                                    <button onClick={() => addContextItem(setFocalPeople, focalPeople)} className="text-[10px] text-strand-400 mb-1">+ Add</button>
                                    {focalPeople.map((p, i) => (
                                      <input key={i} className="w-full px-2 py-1 text-[10px] border border-strand-200 rounded mb-1" value={p} onChange={(e) => updateContextItem(setFocalPeople, focalPeople, i, e.target.value)} />
                                    ))}
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-bold text-strand-500 block mb-1">Artifacts</label>
                                    <button onClick={() => addContextItem(setFocalArtifacts, focalArtifacts)} className="text-[10px] text-strand-400 mb-1">+ Add</button>
                                    {focalArtifacts.map((a, i) => (
                                      <input key={i} className="w-full px-2 py-1 text-[10px] border border-strand-200 rounded mb-1" value={a} onChange={(e) => updateContextItem(setFocalArtifacts, focalArtifacts, i, e.target.value)} />
                                    ))}
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-bold text-strand-500 block mb-1">Poems & Lyrics</label>
                                    <button onClick={() => addContextItem(setFocalPoems, focalPoems)} className="text-[10px] text-strand-400 mb-1">+ Add</button>
                                    {focalPoems.map((p, i) => (
                                      <input key={i} className="w-full px-2 py-1 text-[10px] border border-strand-200 rounded mb-1" value={p} onChange={(e) => updateContextItem(setFocalPoems, focalPoems, i, e.target.value)} />
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {seeds[activeSeedIndex]?.braidedThreads && seeds[activeSeedIndex]!.braidedThreads!.length > 0 && (
                                  <div className="col-span-full">
                                    <p className="text-[10px] font-bold text-strand-400 uppercase tracking-widest mb-2">Braided Threads</p>
                                    <div className="flex flex-wrap gap-2">
                                      {seeds[activeSeedIndex]!.braidedThreads!.map((t, i) => (
                                        <span key={i} className="px-2 py-1 bg-white border border-strand-200 rounded text-[10px] text-strand-600" title={t.description}>
                                          {t.title} ({t.focus})
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {seeds[activeSeedIndex]?.focalPeople && seeds[activeSeedIndex]!.focalPeople!.length > 0 && (
                                  <div>
                                    <p className="text-[10px] font-bold text-strand-400 uppercase tracking-widest mb-1">People</p>
                                    <p className="text-[10px] text-strand-600">{seeds[activeSeedIndex]!.focalPeople!.join(', ')}</p>
                                  </div>
                                )}
                                {seeds[activeSeedIndex]?.focalArtifacts && seeds[activeSeedIndex]!.focalArtifacts!.length > 0 && (
                                  <div>
                                    <p className="text-[10px] font-bold text-strand-400 uppercase tracking-widest mb-1">Artifacts</p>
                                    <p className="text-[10px] text-strand-600">{seeds[activeSeedIndex]!.focalArtifacts!.join(', ')}</p>
                                  </div>
                                )}
                                {seeds[activeSeedIndex]?.focalPoems && seeds[activeSeedIndex]!.focalPoems!.length > 0 && (
                                  <div>
                                    <p className="text-[10px] font-bold text-strand-400 uppercase tracking-widest mb-1">Poems & Lyrics</p>
                                    <p className="text-[10px] text-strand-600">{seeds[activeSeedIndex]!.focalPoems!.join(', ')}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="mt-4">
                             <button 
                               onClick={startEditingContext}
                               className="text-[10px] font-bold text-strand-400 hover:text-strand-600 flex items-center gap-1"
                             >
                               <PlusCircleIcon className="w-3 h-3" /> Add Contextual Weave (People, Artifacts, Poems)
                             </button>
                          </div>
                        )}

                        {seeds[activeSeedIndex]?.visualContext && (
                          <div className="mt-4 p-4 bg-strand-50 rounded-xl border border-strand-100 flex gap-4 items-start">
                            <div className="w-12 h-12 rounded bg-strand-200 flex-shrink-0 flex items-center justify-center">
                              <PhotoIcon className="w-6 h-6 text-strand-400" />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-strand-400 uppercase tracking-widest mb-1">Visual Witness Analysis</p>
                              <p className="text-[10px] text-strand-600 italic">{seeds[activeSeedIndex]!.visualContext!.analysis}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <textarea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        className="flex-1 w-full font-serif text-strand-800 leading-relaxed text-lg outline-none resize-none bg-transparent"
                        placeholder="Start writing or generate a draft..."
                      />
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-12">
                      <SparklesIcon className="w-12 h-12 text-strand-200 mb-4" />
                      <h4 className="font-serif text-strand-400">Select a seed to generate the essay draft.</h4>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full bg-strand-50/50 rounded-xl border border-dashed border-strand-200 flex items-center justify-center p-20 text-center">
                <div>
                  <ArrowRightCircleIcon className="w-12 h-12 text-strand-200 mx-auto mb-4" />
                  <p className="font-serif italic text-strand-400">Select an essay seed from the sidebar to begin drafting.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
