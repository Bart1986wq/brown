import React, { useState, useEffect } from 'react';
import { 
  NarrativeBlueprint, 
  Seed, 
  NarrativeStructureTemplate, 
  NarrativeBeat, 
  BlueprintCharacter,
  AuthorMix,
  SeedGeneratorParams
} from '../types';
import { engineerBlueprint } from '../services/geminiService';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  Layers, 
  Zap, 
  Users, 
  Activity, 
  Save, 
  Trash2, 
  ChevronRight, 
  Plus, 
  Sparkles,
  Info,
  Clock,
  Layout,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BlueprintLibraryProps {
  blueprints: NarrativeBlueprint[];
  onLoad: (blueprint: NarrativeBlueprint) => void;
  onDelete: (id: string) => void;
  activeSeed: Seed | null;
  onSaveBlueprint: (blueprint: NarrativeBlueprint) => void;
  authorMix: AuthorMix;
  params: SeedGeneratorParams;
  onQuotaExceeded: () => void;
}

export function BlueprintLibrary({ 
  blueprints, 
  onLoad, 
  onDelete, 
  activeSeed, 
  onSaveBlueprint,
  authorMix,
  params,
  onQuotaExceeded
}: BlueprintLibraryProps) {
  const [isEngineering, setIsEngineering] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<NarrativeStructureTemplate>(NarrativeStructureTemplate.ThreeAct);
  const [currentBlueprint, setCurrentBlueprint] = useState<Partial<NarrativeBlueprint> | null>(null);
  const [activeBeatIndex, setActiveBeatIndex] = useState<number | null>(null);

  // If a seed is promoted, we can start engineering
  const handleEngineer = async () => {
    if (!activeSeed) return;
    
    setIsEngineering(true);
    try {
      const result = await engineerBlueprint(activeSeed, selectedTemplate, authorMix, params);
      setCurrentBlueprint({
        id: crypto.randomUUID(),
        name: `${activeSeed.title} - ${selectedTemplate}`,
        seedSource: activeSeed,
        structureTemplate: selectedTemplate,
        beats: result.beats,
        characters: result.characters,
        authorMix,
        params,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } catch (error: any) {
      if (error.message?.includes('Quota exceeded')) {
        onQuotaExceeded();
      } else {
        alert("Failed to engineer blueprint. Please try again.");
      }
    } finally {
      setIsEngineering(false);
    }
  };

  const handleSave = () => {
    if (currentBlueprint && currentBlueprint.id) {
      onSaveBlueprint(currentBlueprint as NarrativeBlueprint);
      setCurrentBlueprint(null);
    }
  };

  const tensionData = currentBlueprint?.beats?.map((beat, index) => ({
    name: beat.title,
    tension: beat.tension,
    index: index + 1
  })) || [];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-strand-200 pb-6">
        <div>
          <h2 className="text-4xl font-serif text-strand-900 tracking-tight">Narrative Architect</h2>
          <p className="text-strand-500 mt-2 max-w-xl">
            Transform raw seeds into structured narrative skeletons. Map beats, tension, and character arcs before execution.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-widest text-strand-400 font-bold block mb-1">Library Status</span>
            <span className="text-sm font-mono text-strand-600">{blueprints.length} Blueprints Stored</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar: Seed Promotion & Templates */}
        <div className="lg:col-span-4 space-y-6">
          {activeSeed ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-strand-50 border border-strand-200 rounded-xl p-5 space-y-4"
            >
              <div className="flex items-center gap-2 text-strand-800">
                <Sparkles className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Active Seed</h3>
              </div>
              <div>
                <h4 className="font-serif text-lg text-strand-900">{activeSeed.title}</h4>
                <p className="text-xs text-strand-500 line-clamp-2 mt-1 italic">"{activeSeed.premise}"</p>
              </div>

              <div className="space-y-3 pt-2 border-t border-strand-200">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-strand-400">Structural Template</label>
                <div className="grid grid-cols-1 gap-2">
                  {Object.values(NarrativeStructureTemplate).map(template => (
                    <button
                      key={template}
                      onClick={() => setSelectedTemplate(template)}
                      className={`text-left px-3 py-2 rounded-lg text-xs transition-all border ${
                        selectedTemplate === template 
                        ? 'bg-strand-800 text-white border-strand-800 shadow-md' 
                        : 'bg-white text-strand-600 border-strand-200 hover:border-strand-400'
                      }`}
                    >
                      {template}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleEngineer}
                disabled={isEngineering}
                className="w-full py-3 bg-strand-900 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-black transition-colors disabled:opacity-50"
              >
                {isEngineering ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Engineering...
                  </>
                ) : (
                  <>
                    <Layers className="w-4 h-4" />
                    Engineer Blueprint
                  </>
                )}
              </button>
            </motion.div>
          ) : (
            <div className="bg-strand-50 border border-dashed border-strand-300 rounded-xl p-8 text-center space-y-3">
              <div className="w-12 h-12 bg-strand-100 rounded-full flex items-center justify-center mx-auto text-strand-400">
                <Plus className="w-6 h-6" />
              </div>
              <p className="text-sm text-strand-500 italic">No active seed selected.<br/>Promote a seed from the Generator to begin architecting.</p>
            </div>
          )}

          {/* Saved Blueprints List */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-strand-400">Saved Blueprints</h3>
            <div className="space-y-2">
              {blueprints.length === 0 ? (
                <p className="text-xs text-strand-400 italic">No blueprints in library.</p>
              ) : (
                blueprints.map(bp => (
                  <div 
                    key={bp.id}
                    className="group bg-white border border-strand-200 rounded-lg p-3 flex justify-between items-center hover:border-strand-400 transition-all cursor-pointer"
                    onClick={() => onLoad(bp)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-strand-50 rounded flex items-center justify-center text-strand-400 group-hover:text-strand-800">
                        <Layout className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-strand-800 line-clamp-1">{bp.name}</h4>
                        <p className="text-[10px] text-strand-400">{new Date(bp.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDelete(bp.id); }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-strand-300 hover:text-red-500 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Main Content: Architect Workspace */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {currentBlueprint ? (
              <motion.div 
                key="workspace"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                {/* Blueprint Header */}
                <div className="bg-white border border-strand-200 rounded-xl p-6 shadow-sm flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-strand-100 text-strand-600 text-[9px] font-bold uppercase tracking-tighter rounded">
                        {currentBlueprint.structureTemplate}
                      </span>
                    </div>
                    <input 
                      type="text"
                      value={currentBlueprint.name}
                      onChange={(e) => setCurrentBlueprint(prev => ({ ...prev, name: e.target.value }))}
                      className="text-2xl font-serif text-strand-900 bg-transparent border-none p-0 focus:ring-0 w-full"
                    />
                  </div>
                  <button 
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-strand-800 text-white rounded-lg text-sm font-bold hover:bg-strand-900 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    Save Blueprint
                  </button>
                </div>

                {/* Tension Map Visualization */}
                <div className="bg-white border border-strand-200 rounded-xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-strand-800" />
                      <h3 className="text-sm font-bold uppercase tracking-wider text-strand-800">Narrative Tension Map</h3>
                    </div>
                    <div className="text-[10px] text-strand-400 italic">Visualizing structural pressure across beats</div>
                  </div>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={tensionData}>
                        <defs>
                          <linearGradient id="colorTension" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1e293b" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#1e293b" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="index" hide />
                        <YAxis hide domain={[0, 100]} />
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-strand-900 text-white p-2 rounded-lg text-[10px] shadow-xl border border-white/10">
                                  <p className="font-bold">{payload[0].payload.name}</p>
                                  <p className="opacity-70">Tension: {payload[0].value}%</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="tension" 
                          stroke="#1e293b" 
                          strokeWidth={2}
                          fillOpacity={1} 
                          fill="url(#colorTension)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Beats & Characters Tabs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Beats Column */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-strand-800" />
                      <h3 className="text-sm font-bold uppercase tracking-wider text-strand-800">Narrative Beats</h3>
                    </div>
                    <div className="space-y-3">
                      {currentBlueprint.beats?.map((beat, idx) => (
                        <div 
                          key={beat.id}
                          onClick={() => setActiveBeatIndex(idx)}
                          className={`p-4 rounded-xl border transition-all cursor-pointer ${
                            activeBeatIndex === idx 
                            ? 'bg-strand-50 border-strand-800 shadow-sm' 
                            : 'bg-white border-strand-200 hover:border-strand-400'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[9px] font-mono text-strand-400">BEAT {idx + 1}</span>
                            <span className={`px-1.5 py-0.5 text-[8px] font-bold uppercase rounded ${
                              beat.tension > 70 ? 'bg-red-100 text-red-700' : 'bg-strand-100 text-strand-600'
                            }`}>
                              {beat.tension}% Tension
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-strand-900 mb-1">{beat.title}</h4>
                          <p className="text-xs text-strand-500 line-clamp-2 leading-relaxed">{beat.description}</p>
                          
                          {activeBeatIndex === idx && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="mt-4 pt-4 border-t border-strand-200 space-y-3"
                            >
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-[9px] font-bold uppercase text-strand-400">Kinesis</label>
                                  <div className="text-xs text-strand-700 capitalize">{beat.kinesis}</div>
                                </div>
                                <div>
                                  <label className="text-[9px] font-bold uppercase text-strand-400">Focus</label>
                                  <div className="text-xs text-strand-700">{beat.sensoryFocus.join(', ')}</div>
                                </div>
                              </div>
                              <div>
                                <label className="text-[9px] font-bold uppercase text-strand-400">Cast</label>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {beat.charactersPresent.map(c => (
                                    <span key={c} className="px-2 py-0.5 bg-white border border-strand-200 rounded text-[10px] text-strand-600">
                                      {c}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Characters Column */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-strand-800" />
                      <h3 className="text-sm font-bold uppercase tracking-wider text-strand-800">Character Roster</h3>
                    </div>
                    <div className="space-y-3">
                      {currentBlueprint.characters?.map((char) => (
                        <div key={char.id} className="bg-white border border-strand-200 rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-bold text-strand-900">{char.name}</h4>
                            <span className="text-[9px] font-bold uppercase text-strand-400">{char.role}</span>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <label className="text-[8px] font-bold uppercase text-strand-400 tracking-tighter">Motivation</label>
                              <p className="text-[11px] text-strand-600 leading-tight">{char.motivation}</p>
                            </div>
                            <div>
                              <label className="text-[8px] font-bold uppercase text-strand-400 tracking-tighter">Arc</label>
                              <p className="text-[11px] text-strand-600 leading-tight italic">{char.arc}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-[60vh] flex flex-col items-center justify-center text-center space-y-6"
              >
                <div className="w-20 h-20 bg-strand-50 rounded-full flex items-center justify-center text-strand-200">
                  <Layout className="w-10 h-10" />
                </div>
                <div className="max-w-md">
                  <h3 className="text-xl font-serif text-strand-800">Architect Workspace Empty</h3>
                  <p className="text-sm text-strand-500 mt-2">
                    Select a seed from the sidebar and choose a structural template to begin engineering your narrative blueprint.
                  </p>
                </div>
                {activeSeed && (
                  <button 
                    onClick={handleEngineer}
                    className="px-6 py-3 bg-strand-800 text-white rounded-lg font-bold text-sm hover:bg-strand-900 transition-all flex items-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    Engineer "{activeSeed.title}"
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
