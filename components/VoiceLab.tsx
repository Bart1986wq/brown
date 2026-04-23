
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AUTHOR_DEFINITIONS, AUTHOR_MIX_PRESETS } from '../constants';
import { AuthorMix, CalibrationMode, VoiceAnalysisResult, VoiceSuggestions, BiomeType, NarrativeAnchor, VoiceTone, AuthorMixPreset, CreativeSuggestions, SocialSetting, AtmosphereMode, TimePeriodMode, TensionLevel } from '../types';
import { generateVoiceSample, suggestVoiceFromContext, suggestTopicsForMix, generateTopicalResponse, generateCreativeSuggestions, getTonalSignature } from '../services/geminiService';
import { LocationCalibrationLab } from './LocationCalibrationLab';
import { Slider } from './Slider';
import { 
  SparklesIcon, 
  RefreshIcon, 
  DiceIcon, 
  MapIcon, 
  ArrowRightCircleIcon, 
  CopyIcon, 
  SearchIcon,
  InfoIcon,
  LayersIcon,
  MessageSquareIcon
} from './Icons';

interface VoiceLabProps {
  mix: AuthorMix;
  onMixChange: (mix: AuthorMix) => void;
  onGenerate: (mode: CalibrationMode, locationHint?: string, mediaInfluence?: string) => void;
  loading: boolean;
  result: VoiceAnalysisResult | null;
  onApplySuggestions?: (location: string, biomes: BiomeType[], anchor?: NarrativeAnchor) => void;
  onGenerateEssaySeeds?: (suggestions: any) => void;
  onQuotaExceeded?: () => void;
  activeLocationHint?: string | null;
  onLocationHintChange?: (hint: string | null) => void;
  mediaInfluence?: string;
  onMediaInfluenceChange?: (influence: string) => void;
}

export const VoiceLab: React.FC<VoiceLabProps> = ({ 
  mix, 
  onMixChange, 
  onGenerate, 
  loading, 
  result, 
  onApplySuggestions, 
  onGenerateEssaySeeds,
  onQuotaExceeded,
  activeLocationHint,
  onLocationHintChange,
  mediaInfluence,
  onMediaInfluenceChange
}) => {
  
  const [sampleLoading, setSampleLoading] = useState(false);
  const [sampleResult, setSampleResult] = useState<string | null>(null);

  // Reverse Calibration State
  const [reverseLocation, setReverseLocation] = useState('');
  const [selectedTone, setSelectedTone] = useState<VoiceTone | null>(null);
  const [reverseLoading, setReverseLoading] = useState(false);
  const [reverseLoadingText, setReverseLoadingText] = useState('Architecting voice...');
  const [suggestedMix, setSuggestedMix] = useState<AuthorMix | null>(null);
  const [activeAuthorId, setActiveAuthorId] = useState<string | null>(null);
  const [showPresets, setShowPresets] = useState(false);
  const [tonalPreview, setTonalPreview] = useState<string>('');
  const [previewLoading, setPreviewLoading] = useState(false);

  // Topical Inquiry State
  const [suggestedTopics, setSuggestedTopics] = useState<string[]>([]);
  const [topicalQuery, setTopicalQuery] = useState('');
  const [topicalResponse, setTopicalResponse] = useState<string | null>(null);
  const [topicalLoading, setTopicalLoading] = useState(false);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [creativeSuggestions, setCreativeSuggestions] = useState<CreativeSuggestions | null>(null);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  useEffect(() => {
    if (result) {
        setSuggestionsLoading(true);
        generateCreativeSuggestions(result).then(s => {
            setCreativeSuggestions(s);
            setSuggestionsLoading(false);
        });
    }
  }, [result]);

  useEffect(() => {
    const handler = setTimeout(async () => {
        setPreviewLoading(true);
        const signature = await getTonalSignature(mix);
        setTonalPreview(signature);
        setPreviewLoading(false);
    }, 1500); // 1.5s debounce

    return () => clearTimeout(handler);
  }, [mix]);

  const totalUsed = (Object.values(mix) as number[]).reduce((sum: number, val: number) => sum + val, 0);

  const handleSuggestTopics = async () => {
    setTopicsLoading(true);
    try {
        const topics = await suggestTopicsForMix(mix);
        setSuggestedTopics(topics);
    } catch (e) {
        alert("Failed to suggest topics.");
    } finally {
        setTopicsLoading(false);
    }
  };

  const handleGenerateTopicalResponse = async () => {
    if (!topicalQuery.trim()) return;
    setTopicalLoading(true);
    setTopicalResponse(null);
    try {
        const response = await generateTopicalResponse(mix, topicalQuery);
        setTopicalResponse(response);
    } catch (e) {
        alert("Failed to generate response.");
    } finally {
        setTopicalLoading(false);
    }
  };

  const handleSliderChange = (id: string, val: number) => {
    const currentVal = mix[id as keyof AuthorMix] || 0;
    const otherTotal = totalUsed - currentVal;
    
    let newValue = val;
    // Prevent going over 100%
    if (otherTotal + newValue > 100) {
      newValue = 100 - otherTotal;
    }
    
    onMixChange({ ...mix, [id]: newValue });
    setActiveAuthorId(id);
  };

  const handleApplyPreset = (preset: AuthorMixPreset) => {
    const zeroMix = { ...mix };
    Object.keys(zeroMix).forEach(k => zeroMix[k as keyof AuthorMix] = 0);
    const newMix = { ...zeroMix, ...preset.mix };
    onMixChange(newMix as AuthorMix);
    setShowPresets(false);
    setSuggestedMix(null);
  };

  const activeAuthor = activeAuthorId ? AUTHOR_DEFINITIONS.find(a => a.id === activeAuthorId) : null;

  // Voice Aura Logic
  const getAuraStyles = () => {
      const activeAuthors = Object.entries(mix).filter(([_, val]) => (val as number) > 0);
      if (activeAuthors.length === 0) return { background: 'radial-gradient(circle, #f8fafc 0%, #f1f5f9 100%)' };

      // Map some authors to colors for the aura
      const colorMap: Record<string, string> = {
          lopez: '#065f46', // Emerald
          macfarlane: '#1e3a8a', // Blue
          hoare: '#1e40af', // Indigo
          sebald: '#475569', // Slate
          worsley: '#0f172a', // Dark Slate
          carson: '#059669', // Green
          deakin: '#b45309', // Amber
          baker: '#7f1d1d', // Red
          shepherd: '#0369a1', // Sky
          liptrot: '#0891b2', // Cyan
          dyer: '#7c3aed', // Violet
          sedaris: '#db2777', // Pink
          bryson: '#ea580c', // Orange
      };

      const gradients = activeAuthors.map(([id, val], idx) => {
          const color = colorMap[id] || '#94a3b8';
          const opacity = (val as number) / 100;
          return `radial-gradient(circle at ${20 + idx * 20}% ${30 + idx * 10}%, ${color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')} 0%, transparent 70%)`;
      });

      return { background: gradients.join(', ') + ', #f8fafc' };
  };

  const handleReset = () => {
    const zeroMix = { ...mix };
    Object.keys(zeroMix).forEach(k => zeroMix[k as keyof AuthorMix] = 0);
    onMixChange(zeroMix);
    setSuggestedMix(null);
    if (onLocationHintChange) onLocationHintChange(null);
  };

  const handleRandomize = () => {
    // Reset all to 0
    const newMix = { ...mix };
    Object.keys(newMix).forEach(k => newMix[k as keyof AuthorMix] = 0);

    // Pick 3 distinct random authors
    const shuffled = [...AUTHOR_DEFINITIONS].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);

    // Generate random weights summing to 100
    // Generate 3 random numbers, sum them, then normalize
    const r1 = Math.random() + 0.2; // Add base to avoid too small numbers
    const r2 = Math.random() + 0.2;
    const r3 = Math.random() + 0.2;
    const sum = r1 + r2 + r3;
    
    const val1 = Math.round((r1 / sum) * 100);
    const val2 = Math.round((r2 / sum) * 100);
    const val3 = 100 - val1 - val2;

    if (selected[0]) newMix[selected[0].id] = val1;
    if (selected[1]) newMix[selected[1].id] = val2;
    if (selected[2]) newMix[selected[2].id] = val3;

    onMixChange(newMix);
    setSuggestedMix(null);
    if (onLocationHintChange) onLocationHintChange(null);
  };

  const handleReverseCalibrate = async () => {
    if (!reverseLocation.trim()) return;
    console.log("handleReverseCalibrate called with location:", reverseLocation);
    setReverseLoading(true);
    setSuggestedMix(null);
    
    const loadingMessages = [
        "Architecting voice...",
        "Consulting the archives...",
        "Mapping the territory...",
        "Blending tonal frequencies...",
        "Finalizing the mix..."
    ];
    
    let msgIdx = 0;
    const interval = setInterval(() => {
        msgIdx = (msgIdx + 1) % loadingMessages.length;
        setReverseLoadingText(loadingMessages[msgIdx]);
    }, 2000);

    try {
        console.log("Calling suggestVoiceFromContext...");
        const mix = await suggestVoiceFromContext(reverseLocation, selectedTone || undefined, mediaInfluence);
        console.log("suggestVoiceFromContext returned:", mix);
        setSuggestedMix(mix);
    } catch (e: any) {
        console.error("Reverse calibration failed:", e);
        if (onQuotaExceeded && (e.message?.includes('429') || e.message?.includes('RESOURCE_EXHAUSTED'))) {
            onQuotaExceeded();
        } else {
            alert("Reverse calibration failed.");
        }
    } finally {
        clearInterval(interval);
        setReverseLoading(false);
        setReverseLoadingText('Architecting voice...');
    }
  };

  const handleApplySuggestedMix = () => {
      if (suggestedMix) {
          onMixChange(suggestedMix);
          if (onLocationHintChange) onLocationHintChange(reverseLocation);
          setSuggestedMix(null);
          setReverseLocation('');
      }
  };

  const handleApplyLocationAndVoice = () => {
      if (suggestedMix) {
          onMixChange(suggestedMix);
          if (onApplySuggestions) {
              onApplySuggestions(reverseLocation, []);
          }
          if (onLocationHintChange) onLocationHintChange(reverseLocation);
          setSuggestedMix(null);
          setReverseLocation('');
      }
  };

  const handleSample = async () => {
    setSampleLoading(true);
    setSampleResult(null);
    try {
        const text = await generateVoiceSample(mix);
        setSampleResult(text);
    } catch (e: any) {
        if (onQuotaExceeded && (e.message?.includes('429') || e.message?.includes('RESOURCE_EXHAUSTED'))) {
            onQuotaExceeded();
        } else {
            alert("Could not generate sample.");
        }
    } finally {
        setSampleLoading(false);
    }
  }

  const handleCopy = (text: string) => {
      navigator.clipboard.writeText(text);
      alert("Copied!");
  }

  const handleSendToGenerator = (location: string, biomes: BiomeType[], anchor?: NarrativeAnchor, socialSetting?: SocialSetting[], atmosphericTone?: AtmosphereMode[], timePeriod?: TimePeriodMode[], tensionLevel?: TensionLevel[]) => {
      if (onApplySuggestions) {
          onApplySuggestions({
              location,
              biomes,
              anchor,
              socialSetting,
              atmosphericTone,
              timePeriod,
              tensionLevel
          });
      }
  }

  return (
    <div className="space-y-8 relative">
      
      {/* Voice Aura Background Visualizer */}
      <motion.div 
        className="absolute -top-20 -left-20 -right-20 h-[600px] opacity-20 blur-[100px] pointer-events-none transition-all duration-1000 z-0"
        style={getAuraStyles()}
        animate={{
            scale: [1, 1.1, 1],
            opacity: [0.15, 0.25, 0.15],
        }}
        transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
        }}
      />

      <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-strand-200 pb-4 gap-4">
        <div>
          <h2 className="text-2xl font-serif text-strand-800">Voice Calibration Lab</h2>
          <p className="text-strand-500 text-sm mt-1">Mix your own literary tonal fingerprint.</p>
        </div>
        
        <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
          <div className="text-[10px] font-bold text-strand-500 italic mb-1 h-4 flex items-center">
             {previewLoading ? '...' : tonalPreview}
          </div>
          <div className="flex items-center gap-3">
             <span className={`text-sm font-bold ${totalUsed === 100 ? 'text-green-600' : 'text-strand-600'}`}>
                Total Mix: {totalUsed}%
             </span>
             <div className="flex gap-2 border-l border-strand-200 pl-3">
                 <div className="relative">
                    <button 
                        onClick={() => setShowPresets(!showPresets)}
                        className="flex items-center gap-1 text-xs font-medium text-strand-700 hover:text-strand-900 bg-white border border-strand-200 hover:bg-strand-50 px-3 py-1.5 rounded transition-colors"
                        title="Choose a curated voice preset"
                    >
                        <LayersIcon className="w-3 h-3" />
                        Presets
                    </button>
                    {showPresets && (
                        <div className="absolute right-0 mt-2 w-64 bg-white border border-strand-200 rounded-xl shadow-xl z-50 p-2 animate-in fade-in zoom-in-95 duration-200">
                            <div className="text-[10px] font-bold text-strand-400 uppercase tracking-widest p-2 border-b border-strand-100 mb-1">Curated Voice Mixes</div>
                            {AUTHOR_MIX_PRESETS.map(preset => (
                                <button
                                    key={preset.id}
                                    onClick={() => handleApplyPreset(preset)}
                                    className="w-full text-left p-3 hover:bg-strand-50 rounded-lg transition-colors group"
                                >
                                    <div className="text-xs font-bold text-strand-800 group-hover:text-strand-900">{preset.name}</div>
                                    <div className="text-[10px] text-strand-500 mt-0.5">{preset.description}</div>
                                </button>
                            ))}
                        </div>
                    )}
                 </div>
                 <button 
                    onClick={handleRandomize}
                    className="flex items-center gap-1 text-xs font-medium text-strand-700 hover:text-strand-900 bg-strand-100 hover:bg-strand-200 px-3 py-1.5 rounded transition-colors"
                    title="Blend 3 random authors"
                >
                    <DiceIcon className="w-3 h-3" />
                    Surprise
                </button>
                 <button 
                    onClick={handleReset}
                    className="text-xs font-medium text-strand-400 hover:text-strand-600 hover:bg-strand-50 px-2 py-1.5 rounded transition-colors"
                >
                    Reset
                </button>
             </div>
          </div>
          <div className="w-full sm:w-64 h-2 bg-strand-100 rounded-full overflow-hidden">
             <div 
                className={`h-full transition-all duration-300 ${totalUsed === 100 ? 'bg-green-500' : 'bg-strand-400'}`} 
                style={{ width: `${totalUsed}%` }}
             ></div>
          </div>
        </div>
      </div>

      {/* Author Spotlight / Signature Move */}
      {activeAuthor && (
          <div className="relative z-10 bg-strand-800 text-white p-4 rounded-xl shadow-lg animate-in slide-in-from-bottom-2 duration-300 flex items-start gap-4">
              <div className="p-2 bg-white/10 rounded-lg">
                  <InfoIcon className="w-5 h-5 text-strand-200" />
              </div>
              <div>
                  <div className="flex items-center gap-2">
                      <h4 className="font-serif text-lg leading-none">{activeAuthor.name}</h4>
                      <span className="text-[10px] uppercase tracking-widest font-bold text-strand-300 bg-white/10 px-2 py-0.5 rounded">Active Focus</span>
                  </div>
                  <p className="text-strand-200 text-xs mt-2 italic font-serif">
                      {activeAuthor.signatureMove || `Signature traits: ${activeAuthor.traits}`}
                  </p>
              </div>
              <button 
                onClick={() => setActiveAuthorId(null)}
                className="ml-auto text-strand-400 hover:text-white"
              >
                  <RefreshIcon className="w-4 h-4 rotate-45" />
              </button>
          </div>
      )}

      {/* Contextual Calibration Section */}
      <div className="bg-strand-100/50 rounded-xl p-6 border border-strand-200">
          <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-strand-800 rounded-lg text-white">
                  <SearchIcon className="w-4 h-4" />
              </div>
              <div>
                  <h3 className="font-serif text-lg text-strand-800 leading-none">Voice Architect</h3>
                  <p className="text-strand-500 text-[10px] uppercase tracking-wider font-bold mt-1">Location, Theme, or Question to Voice Mix</p>
              </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                  <input 
                    type="text" 
                    placeholder="Enter a location, theme, or question (e.g. 'The Outer Hebrides', 'The ethics of rewilding', 'How does grief sound?')..."
                    value={reverseLocation}
                    onChange={(e) => setReverseLocation(e.target.value)}
                    className="w-full bg-white border border-strand-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-strand-500 focus:border-transparent outline-none transition-all"
                  />
              </div>
              <div className="flex-1 relative">
                  <input 
                    type="text" 
                    placeholder="Enter media influence (e.g. 'Hinterland', 'The Blacklist')..."
                    value={mediaInfluence || ''}
                    onChange={(e) => onMediaInfluenceChange && onMediaInfluenceChange(e.target.value)}
                    className="w-full bg-white border border-strand-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-strand-500 focus:border-transparent outline-none transition-all"
                  />
              </div>
              <button 
                onClick={handleReverseCalibrate}
                disabled={reverseLoading || !reverseLocation.trim()}
                className={`
                    px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2
                    ${reverseLoading || !reverseLocation.trim()
                        ? 'bg-strand-200 text-strand-400 cursor-not-allowed'
                        : 'bg-strand-800 text-white hover:bg-strand-900 shadow-sm'
                    }
                `}
              >
                  {reverseLoading ? (
                      <div className="flex items-center gap-2">
                          <RefreshIcon className="w-4 h-4 animate-spin" />
                          <span>{reverseLoadingText}</span>
                      </div>
                  ) : (
                      <>
                          <SparklesIcon className="w-4 h-4" />
                          <span>Suggest Voice Mix</span>
                      </>
                  )}
              </button>
          </div>

          {/* Tone Selection */}
          <div className="mt-4">
              <p className="text-[10px] font-bold text-strand-400 uppercase tracking-widest mb-2">Optional: Desired Tone</p>
              <div className="flex flex-wrap gap-2">
                  {Object.values(VoiceTone).map((tone) => (
                      <button
                        key={tone}
                        onClick={() => setSelectedTone(selectedTone === tone ? null : tone)}
                        className={`
                            px-3 py-1 rounded-full text-[11px] font-bold transition-all border
                            ${selectedTone === tone 
                                ? 'bg-strand-800 text-white border-strand-800 shadow-sm' 
                                : 'bg-white text-strand-500 border-strand-200 hover:border-strand-400'
                            }
                        `}
                      >
                          {tone}
                      </button>
                  ))}
              </div>
          </div>

          {suggestedMix && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-strand-200 animate-in slide-in-from-top-2 duration-300">
                  <div className="flex justify-between items-center mb-3">
                      <h4 className="text-xs font-bold text-strand-500 uppercase tracking-wider">Suggested Mix for: "{reverseLocation}"</h4>
                      <div className="flex gap-2">
                          <button 
                            onClick={handleApplySuggestedMix}
                            className="flex items-center gap-1.5 text-xs font-bold text-strand-600 hover:text-strand-800 bg-strand-50 hover:bg-strand-100 px-3 py-1.5 rounded-full transition-colors"
                          >
                              Apply to Sliders
                          </button>
                          <button 
                            onClick={handleApplyLocationAndVoice}
                            className="flex items-center gap-1.5 text-xs font-bold text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-full transition-colors"
                          >
                              <ArrowRightCircleIcon className="w-3.5 h-3.5" />
                              Apply Location & Voice to Generator
                          </button>
                      </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                      {Object.entries(suggestedMix)
                        .filter(([_, val]) => (val as number) > 0)
                        .map(([id, val]) => {
                            const author = AUTHOR_DEFINITIONS.find(a => a.id === id);
                            return (
                                <div key={id} className="flex items-center gap-2 bg-strand-50 px-3 py-1.5 rounded-md border border-strand-100">
                                    <span className="text-xs font-medium text-strand-800">{author?.name}</span>
                                    <span className="text-xs font-bold text-strand-500">{val}%</span>
                                </div>
                            );
                        })
                      }
                  </div>
              </div>
          )}
      </div>

      {/* Topical Inquiry Section */}
      <div className="bg-strand-50 rounded-xl p-6 border border-strand-200">
          <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-strand-800 rounded-lg text-white">
                  <MessageSquareIcon className="w-4 h-4" />
              </div>
              <div>
                  <h3 className="font-serif text-lg text-strand-800 leading-none">Topical Inquiry</h3>
                  <p className="text-strand-500 text-[10px] uppercase tracking-wider font-bold mt-1">Explore themes through your voice mix</p>
              </div>
          </div>

          <div className="flex gap-3 mb-4">
              <button 
                  onClick={handleSuggestTopics}
                  disabled={topicsLoading}
                  className="flex items-center gap-2 bg-strand-100 hover:bg-strand-200 text-strand-800 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
              >
                  {topicsLoading ? <RefreshIcon className="w-4 h-4 animate-spin" /> : <SparklesIcon className="w-4 h-4" />}
                  Suggest Topics
              </button>
          </div>

          {suggestedTopics.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                  {suggestedTopics.map((topic, idx) => (
                      <button 
                          key={idx}
                          onClick={() => setTopicalQuery(topic)}
                          className="bg-white border border-strand-200 hover:border-strand-400 px-3 py-1.5 rounded-full text-xs font-medium text-strand-700 transition-all"
                      >
                          {topic}
                      </button>
                  ))}
              </div>
          )}

          <div className="flex gap-3">
              <input 
                  type="text" 
                  placeholder="Ask a question or enter a topic..."
                  value={topicalQuery}
                  onChange={(e) => setTopicalQuery(e.target.value)}
                  className="flex-1 bg-white border border-strand-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-strand-500 focus:border-transparent outline-none transition-all"
              />
              <button 
                  onClick={handleGenerateTopicalResponse}
                  disabled={topicalLoading || !topicalQuery.trim()}
                  className="bg-strand-800 text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-strand-900 shadow-sm disabled:bg-strand-200 disabled:text-strand-400 transition-all"
              >
                  {topicalLoading ? <RefreshIcon className="w-4 h-4 animate-spin" /> : "Generate Response"}
              </button>
          </div>

          {topicalResponse && (
              <div className="mt-6 p-6 bg-white rounded-lg border border-strand-200 shadow-sm animate-in fade-in duration-500">
                  <h4 className="text-xs font-bold text-strand-500 uppercase tracking-wider mb-3">Response</h4>
                  <p className="font-serif text-strand-800 text-sm leading-relaxed">
                      {topicalResponse}
                  </p>
              </div>
          )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-6">
        {AUTHOR_DEFINITIONS.map((author) => (
          <div key={author.id} onMouseEnter={() => setActiveAuthorId(author.id)}>
            <Slider
              label={author.name}
              subLabel={author.traits}
              value={mix[author.id]}
              onChange={(val) => handleSliderChange(author.id, val)}
            />
          </div>
        ))}
      </div>

      {/* Control Deck */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
         <button
            onClick={() => onGenerate(CalibrationMode.VoiceDescription, activeLocationHint || undefined, mediaInfluence)}
            disabled={loading}
            className={`
              flex items-center justify-center gap-2 px-6 py-3 rounded-full font-serif font-bold text-base shadow-md transition-all
              ${loading 
                ? 'bg-strand-200 text-strand-400 cursor-not-allowed' 
                : 'bg-strand-800 text-white hover:bg-strand-900'
              }
            `}
          >
            {loading ? (
              <>
                <RefreshIcon className="w-4 h-4 animate-spin" />
                <span>Calibrating...</span>
              </>
            ) : (
              <>
                <SparklesIcon className="w-4 h-4" />
                <span>Analyze & Generate Profile</span>
              </>
            )}
          </button>

          <button
            onClick={handleSample}
            disabled={sampleLoading}
            className={`
              flex items-center justify-center gap-2 px-6 py-3 rounded-full font-serif font-bold text-base shadow-sm border border-strand-300 transition-all
              ${sampleLoading
                ? 'bg-strand-50 text-strand-400' 
                : 'bg-white text-strand-700 hover:bg-strand-50'
              }
            `}
          >
             {sampleLoading ? <RefreshIcon className="w-4 h-4 animate-spin" /> : <span>Blind Taste Test (Sample)</span>}
          </button>
      </div>

      {sampleResult && (
          <div className="bg-strand-50 rounded-xl p-6 border border-strand-200 relative animate-in fade-in duration-500 max-w-2xl mx-auto mt-4">
              <div className="absolute top-0 right-0 px-3 py-1 bg-strand-200 rounded-bl-lg text-[10px] font-bold text-strand-600 uppercase tracking-wider">
               Sample
             </div>
             <p className="font-serif text-strand-800 text-sm italic leading-relaxed">
                 "{sampleResult}"
             </p>
          </div>
      )}

      {/* ANALYSIS RESULT */}
      {result && (
         <div className="space-y-6 animate-in fade-in duration-500">
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-white rounded-xl shadow-sm border border-strand-200 p-6">
                     <h3 className="text-xs font-bold text-strand-500 uppercase tracking-wider mb-3">Author Force Breakdown</h3>
                     <p className="font-serif text-sm text-strand-800 leading-relaxed">{result.authorForceBreakdown}</p>
                 </div>
                 <div className="bg-white rounded-xl shadow-sm border border-strand-200 p-6">
                     <h3 className="text-xs font-bold text-strand-500 uppercase tracking-wider mb-3">Overlaps</h3>
                     <p className="font-serif text-sm text-strand-800 leading-relaxed">{result.overlaps}</p>
                 </div>
                 <div className="bg-white rounded-xl shadow-sm border border-strand-200 p-6">
                     <h3 className="text-xs font-bold text-strand-500 uppercase tracking-wider mb-3">Tensions / Frictions</h3>
                     <p className="font-serif text-sm text-strand-800 leading-relaxed">{result.tensionsFrictions}</p>
                 </div>
                 <div className="bg-white rounded-xl shadow-sm border border-strand-200 p-6">
                     <h3 className="text-xs font-bold text-strand-500 uppercase tracking-wider mb-3">Composite Voice Profile</h3>
                     <p className="font-serif text-sm text-strand-800 leading-relaxed">{result.compositeVoiceProfile}</p>
                 </div>
                 <div className="bg-white rounded-xl shadow-sm border border-strand-200 p-6">
                     <h3 className="text-xs font-bold text-strand-500 uppercase tracking-wider mb-3">Operational Tendencies</h3>
                     <p className="font-serif text-sm text-strand-800 leading-relaxed">{result.operationalTendencies}</p>
                 </div>
                 <div className="bg-white rounded-xl shadow-sm border border-strand-200 p-6">
                     <h3 className="text-xs font-bold text-strand-500 uppercase tracking-wider mb-3">Guardrails</h3>
                     <p className="font-serif text-sm text-strand-800 leading-relaxed">{result.guardrails}</p>
                 </div>
             </div>

             {/* Creative Suggestions */}
             {suggestionsLoading ? (
                 <div className="p-8 text-center text-strand-500">Generating creative suggestions...</div>
             ) : creativeSuggestions && (
                 <div className="bg-strand-800 text-white rounded-xl p-8 shadow-lg">
                     <h2 className="text-2xl font-serif mb-6">Creative Protocol</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         {[
                             { title: "Locations", data: creativeSuggestions.suggestedLocations, key: 'location' },
                             { title: "Social Settings", data: creativeSuggestions.suggestedSocialSettings, key: 'socialSetting' },
                             { title: "Relational Cores", data: creativeSuggestions.suggestedRelationalCores, key: 'relationalCore' },
                             { title: "Protagonist Personas", data: creativeSuggestions.suggestedProtagonistPersonas, key: 'persona' },
                             { title: "Narrative Anchors", data: creativeSuggestions.suggestedNarrativeAnchors, key: 'anchor' },
                             { title: "Themes", data: creativeSuggestions.suggestedThemes, key: 'themes' },
                             { title: "Atmospheric Fields", data: creativeSuggestions.suggestedAtmosphericFields, key: 'atmosphericTone' },
                             { title: "Conflict Drivers", data: creativeSuggestions.suggestedConflictDrivers, key: 'conflicts' },
                             { title: "Symbolic Objects", data: creativeSuggestions.suggestedSymbolicObjects, key: 'motifs' },
                             { title: "Critical Lenses", data: creativeSuggestions.criticalLenses, key: 'lens' },
                         ].map((section, idx) => (
                             <div key={idx} className="bg-white/10 p-4 rounded-lg group relative">
                                 <h4 className="text-xs font-bold uppercase tracking-wider mb-2 text-strand-200">{section.title}</h4>
                                 <ul className="space-y-1">
                                     {section.data.map((item, i) => (
                                         <li key={i} className="text-sm font-serif flex items-center justify-between group/item">
                                             <span>{item}</span>
                                             <button 
                                                 onClick={() => onApplySuggestions({ [section.key]: section.key === 'motifs' || section.key === 'themes' ? [item] : item })}
                                                 className="opacity-0 group-hover/item:opacity-100 text-[10px] bg-white/20 hover:bg-white/40 px-2 py-0.5 rounded transition-all ml-2 flex-shrink-0"
                                             >
                                                 Apply
                                             </button>
                                         </li>
                                     ))}
                                 </ul>
                             </div>
                         ))}
                     </div>
                     
                     <div className="mt-8">
                         <h3 className="text-xl font-serif mb-4 text-strand-200">Grounded Locations</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {creativeSuggestions.groundedLocation.map((item, index) => (
                                 <div key={index} className="bg-white/10 p-4 rounded-lg flex flex-col justify-between">
                                     <div>
                                         <h4 className="font-semibold text-white">{item.location}</h4>
                                         <p className="text-sm text-strand-200 mt-1">{item.reasoning}</p>
                                     </div>
                                     <button 
                                         onClick={() => onApplySuggestions({ 
                                             location: item.location,
                                             motifs: creativeSuggestions.suggestedSymbolicObjects.slice(0, 3)
                                         })}
                                         className="mt-4 w-full bg-white/20 hover:bg-white/40 text-xs font-bold py-2 rounded transition-all"
                                     >
                                         Apply Location & Key Motifs to Generator
                                     </button>
                                 </div>
                             ))}
                         </div>
                     </div>
                 </div>
             )}
             
             {creativeSuggestions && result && (
                 <div className="mt-8">
                     <LocationCalibrationLab 
                         voiceProfile={result} 
                         groundedLocations={creativeSuggestions.groundedLocation}
                         selectedElements={{
                             socialSetting: creativeSuggestions.suggestedSocialSettings.join(', '),
                             relationalCore: creativeSuggestions.suggestedRelationalCores.join(', '),
                             persona: creativeSuggestions.suggestedProtagonistPersonas.join(', '),
                             anchor: creativeSuggestions.suggestedNarrativeAnchors.join(', '),
                             themes: creativeSuggestions.suggestedThemes,
                             atmosphere: creativeSuggestions.suggestedAtmosphericFields,
                             conflicts: creativeSuggestions.suggestedConflictDrivers,
                             objects: creativeSuggestions.suggestedSymbolicObjects,
                             lens: creativeSuggestions.criticalLenses
                         }}
                     />
                 </div>
             )}
         </div>
      )}
    </div>
  );
};
