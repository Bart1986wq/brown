import React, { useState, useEffect, useRef } from 'react';
import { 
  NarrativeBlueprint, 
  NarrativeBeat, 
  BlueprintCharacter,
  AuthorMix,
  Seed
} from '../types';
import { executeNarrativeBeat } from '../services/geminiService';
import { TensionGraph } from './TensionGraph';
import { 
  Play, 
  Settings, 
  Type, 
  Eye, 
  History, 
  Save, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Sparkles,
  MessageSquare,
  Wind,
  Zap,
  Layout,
  Mic,
  PenTool,
  Sliders
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NarrativeStudioProps {
  blueprint: NarrativeBlueprint | null;
  seed?: Seed | null;
  onQuotaExceeded: () => void;
}

const PROSE_LENSES = [
  { id: 'visceral', name: 'Visceral / Sensory', description: 'Focus on physical sensations and raw environmental detail.' },
  { id: 'internal', name: 'Internal / Psychological', description: 'Deep dive into the character\'s interiority and memory.' },
  { id: 'cinematic', name: 'Cinematic / Action', description: 'Focus on movement, blocking, and external kinesis.' },
  { id: 'observational', name: 'Observational / Cuskian', description: 'Detached, analytical, focusing on social dynamics and dialogue.' },
  { id: 'lyrical', name: 'Lyrical / Poetic', description: 'High-stylized prose with focus on metaphor and rhythm.' },
];

export function NarrativeStudio({ blueprint, seed, onQuotaExceeded }: NarrativeStudioProps) {
  const [activeBeatIndex, setActiveBeatIndex] = useState(0);
  const [selectedLens, setSelectedLens] = useState(PROSE_LENSES[0].id);
  const [isExecuting, setIsExecuting] = useState(false);
  const [generatedProse, setGeneratedProse] = useState<string>('');
  const [sensoryDetails, setSensoryDetails] = useState<string[]>([]);
  const [internalMonologue, setInternalMonologue] = useState<string>('');
  const [proseHistory, setProseHistory] = useState<{ [beatIndex: number]: string }>({});
  const [authorInfluence, setAuthorInfluence] = useState(70); // 0-100

  const proseRef = useRef<HTMLTextAreaElement>(null);

  const handleExecuteBeat = async () => {
    if (!blueprint) return;
    
    setIsExecuting(true);
    try {
      const previousProse = activeBeatIndex > 0 ? proseHistory[activeBeatIndex - 1] : undefined;
      const result = await executeNarrativeBeat(
        blueprint, 
        activeBeatIndex, 
        PROSE_LENSES.find(l => l.id === selectedLens)?.name || 'Standard',
        previousProse
      );
      
      setGeneratedProse(result.prose);
      setSensoryDetails(result.sensoryDetails);
      setInternalMonologue(result.internalMonologue || '');
      
      // Save to history
      setProseHistory(prev => ({ ...prev, [activeBeatIndex]: result.prose }));
    } catch (error: any) {
      if (error.message?.includes('Quota exceeded')) {
        onQuotaExceeded();
      } else {
        alert("Failed to execute beat. Please try again.");
      }
    } finally {
      setIsExecuting(false);
    }
  };

  const activeBeat = blueprint?.beats?.[activeBeatIndex];

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-180px)] flex gap-6 overflow-hidden">
      {/* Left Sidebar: Blueprint Navigator */}
      <div className="w-80 flex flex-col bg-white border border-strand-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-strand-100 bg-strand-50/50">
          <div className="flex items-center gap-2 mb-1">
            <Layout className="w-4 h-4 text-strand-800" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-strand-800">Blueprint Navigator</h3>
          </div>
          <h4 className="text-sm font-serif font-bold text-strand-900 truncate">
            {blueprint?.name || 'No Blueprint Loaded'}
          </h4>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {blueprint?.beats?.map((beat, idx) => (
            <button
              key={beat.id}
              onClick={() => setActiveBeatIndex(idx)}
              className={`w-full text-left p-3 rounded-xl transition-all border ${
                activeBeatIndex === idx 
                ? 'bg-strand-800 text-white border-strand-800 shadow-md' 
                : 'bg-white text-strand-600 border-strand-100 hover:border-strand-300'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className={`text-[9px] font-mono ${activeBeatIndex === idx ? 'text-strand-300' : 'text-strand-400'}`}>
                  BEAT {idx + 1}
                </span>
                {proseHistory[idx] && (
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                )}
              </div>
              <h5 className="text-xs font-bold truncate">{beat.title}</h5>
              <p className={`text-[10px] line-clamp-1 mt-1 opacity-70`}>
                {beat.description}
              </p>
            </button>
          ))}
          {!blueprint && (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-12 h-12 bg-strand-50 rounded-full flex items-center justify-center text-strand-300">
                <BookOpen className="w-6 h-6" />
              </div>
              <p className="text-xs text-strand-400 italic">Load a blueprint from the Library to start directing.</p>
            </div>
          )}
        </div>

        {blueprint && (
          <div className="p-4 border-t border-strand-100 bg-strand-50/30">
            <TensionGraph beats={blueprint.beats || []} />
            <div className="flex items-center justify-between text-[10px] font-bold uppercase text-strand-400 mb-2 mt-4">
              <span>Progress</span>
              <span>{Math.round((Object.keys(proseHistory).length / (blueprint.beats?.length || 1)) * 100)}%</span>
            </div>
            <div className="w-full h-1.5 bg-strand-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-strand-800 transition-all duration-500" 
                style={{ width: `${(Object.keys(proseHistory).length / (blueprint.beats?.length || 1)) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Workspace: Director's Chair */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        {/* Top Console: Lenses & Controls */}
        <div className="bg-white border border-strand-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-start gap-8">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-strand-800" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-strand-800">Director's Console</h3>
              </div>
              
              <div className="flex gap-2">
                {PROSE_LENSES.map(lens => (
                  <button
                    key={lens.id}
                    onClick={() => setSelectedLens(lens.id)}
                    className={`flex-1 text-left p-3 rounded-xl border transition-all ${
                      selectedLens === lens.id 
                      ? 'bg-strand-50 border-strand-800 ring-1 ring-strand-800' 
                      : 'bg-white border-strand-100 hover:border-strand-300'
                    }`}
                  >
                    <h4 className="text-[11px] font-bold text-strand-900">{lens.name}</h4>
                    <p className="text-[9px] text-strand-500 leading-tight mt-1">{lens.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="w-64 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-strand-800" />
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-strand-800">Author Influence</h3>
                </div>
                <span className="text-[10px] font-mono text-strand-500">{authorInfluence}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={authorInfluence}
                onChange={(e) => setAuthorInfluence(parseInt(e.target.value))}
                className="w-full h-1.5 bg-strand-200 rounded-lg appearance-none cursor-pointer accent-strand-800"
              />
              <button
                onClick={handleExecuteBeat}
                disabled={isExecuting || !blueprint}
                className="w-full py-3 bg-strand-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg hover:shadow-strand-200 disabled:opacity-50"
              >
                {isExecuting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Executing Beat...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Execute Prose
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Workspace: Prose View & Context */}
        <div className="flex-1 flex gap-6 overflow-hidden">
          {/* Prose Editor */}
          <div className="flex-1 bg-white border border-strand-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b border-strand-100 flex justify-between items-center bg-strand-50/30">
              <div className="flex items-center gap-3">
                <PenTool className="w-4 h-4 text-strand-800" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-strand-800">Prose Output</h3>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-strand-400 hover:text-strand-800 transition-colors" title="Copy to Clipboard">
                  <Type className="w-4 h-4" />
                </button>
                <button className="p-2 text-strand-400 hover:text-strand-800 transition-colors" title="Save Draft">
                  <Save className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 relative">
              <textarea
                ref={proseRef}
                value={generatedProse}
                onChange={(e) => setGeneratedProse(e.target.value)}
                placeholder={isExecuting ? "Directing the AI..." : "Select a beat and click 'Execute Prose' to begin writing."}
                className="w-full h-full p-8 font-serif text-lg leading-relaxed text-strand-800 bg-transparent border-none focus:ring-0 resize-none placeholder:italic placeholder:text-strand-300"
              />
              {isExecuting && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] flex items-center justify-center">
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="flex flex-col items-center gap-3"
                  >
                    <div className="w-12 h-12 bg-strand-900 rounded-full flex items-center justify-center text-white shadow-xl">
                      <Sparkles className="w-6 h-6 animate-pulse" />
                    </div>
                    <span className="text-xs font-bold text-strand-900 uppercase tracking-widest">Synthesizing Prose...</span>
                  </motion.div>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar: Context & Sensory */}
          <div className="w-72 space-y-6 overflow-y-auto pr-2">
            {/* Beat Context */}
            <div className="bg-strand-900 text-white rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 opacity-60">
                <Zap className="w-3.5 h-3.5" />
                <h3 className="text-[10px] font-bold uppercase tracking-widest">Beat Context</h3>
              </div>
              {activeBeat ? (
                <div className="space-y-3">
                  <h4 className="text-sm font-serif font-bold">{activeBeat.title}</h4>
                  <p className="text-[11px] leading-relaxed opacity-80 italic">"{activeBeat.description}"</p>
                  <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[9px] uppercase opacity-50 block">Kinesis</span>
                      <span className="text-[10px] font-bold capitalize">{activeBeat.kinesis}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase opacity-50 block">Tension</span>
                      <span className="text-[10px] font-bold">{activeBeat.tension}%</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-[10px] opacity-50 italic">No beat selected.</p>
              )}
            </div>

            {/* Sensory Anchors */}
            <div className="bg-white border border-strand-200 rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center gap-2">
                <Wind className="w-3.5 h-3.5 text-strand-800" />
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-strand-800">Sensory Anchors</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {sensoryDetails.length > 0 ? (
                  sensoryDetails.map(detail => (
                    <span key={detail} className="px-2 py-1 bg-strand-50 border border-strand-100 rounded-lg text-[10px] text-strand-600 font-medium">
                      {detail}
                    </span>
                  ))
                ) : (
                  <p className="text-[10px] text-strand-400 italic">No anchors generated yet.</p>
                )}
              </div>
            </div>

            {/* Internal Monologue */}
            <div className="bg-white border border-strand-200 rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-strand-800" />
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-strand-800">Internal Monologue</h3>
              </div>
              <div className="p-3 bg-strand-50 rounded-xl border border-strand-100 italic text-[11px] text-strand-600 leading-relaxed">
                {internalMonologue || "Character interiority will appear here after execution."}
              </div>
            </div>

            {/* Continuity */}
            <div className="bg-white border border-strand-200 rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center gap-2">
                <History className="w-3.5 h-3.5 text-strand-800" />
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-strand-800">Continuity</h3>
              </div>
              <div className="space-y-3">
                {activeBeatIndex > 0 ? (
                  <div className="p-3 bg-strand-50 rounded-xl border border-strand-100">
                    <h5 className="text-[10px] font-bold text-strand-800 mb-1">Previous Beat</h5>
                    <p className="text-[10px] text-strand-500 line-clamp-3 italic">
                      {proseHistory[activeBeatIndex - 1] || "No prose saved for previous beat."}
                    </p>
                  </div>
                ) : (
                  <p className="text-[10px] text-strand-400 italic">First beat in sequence.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
