
import React, { useState } from 'react';
import { CritiqueResult, AuthorMix } from '../types';
import { generateCritique } from '../services/geminiService';
import { ClipboardIcon, RefreshIcon, SparklesIcon, InfoIcon, BookOpenIcon, Edit3Icon } from './Icons';

interface EditorDeskProps {
  draftText: string;
  motifs: string[];
  authorMix: AuthorMix;
  onQuotaExceeded: () => void;
}

export const EditorDesk: React.FC<EditorDeskProps> = ({ draftText, motifs, authorMix, onQuotaExceeded }) => {
  const [loading, setLoading] = useState(false);
  const [critique, setCritique] = useState<CritiqueResult | null>(null);

  const handleCritique = async () => {
    if (!draftText.trim()) return;
    setLoading(true);
    try {
      const result = await generateCritique(draftText, motifs, authorMix);
      setCritique(result);
    } catch (error: any) {
      if (error.message?.includes('429')) onQuotaExceeded();
      else alert("Critique failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-serif text-strand-800">The Editor's Desk</h2>
          <p className="text-strand-600 text-sm">Integrated planning, drafting, and high-level structural critique.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-[10px] bg-strand-800 text-white px-2 py-1 rounded font-bold uppercase tracking-widest">Active Editorial Session</div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
        {/* LEFT PANE: DRAFT VIEW */}
        <div className="flex flex-col gap-4 bg-white rounded-xl border border-strand-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-strand-100 bg-strand-50 flex justify-between items-center">
            <h3 className="text-xs font-bold text-strand-600 uppercase tracking-wider flex items-center gap-2">
              <Edit3Icon className="w-4 h-4" />
              Current Manuscript
            </h3>
            <span className="text-[10px] font-mono text-strand-400">{draftText.split(/\s+/).filter(Boolean).length} words</span>
          </div>
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
            {draftText ? (
              <div className="prose prose-stone font-serif text-strand-900 max-w-none">
                <pre className="whitespace-pre-wrap font-serif text-base leading-loose">
                  {draftText}
                </pre>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-strand-400 italic">
                <p>No draft loaded. Generate prose in Module D first.</p>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-strand-100 flex justify-end">
            <button
              onClick={handleCritique}
              disabled={loading || !draftText.trim()}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-serif font-bold transition-all shadow-md ${
                loading || !draftText.trim() 
                ? 'bg-strand-200 text-strand-400 cursor-not-allowed' 
                : 'bg-strand-800 text-white hover:bg-strand-900'
              }`}
            >
              {loading ? <RefreshIcon className="w-4 h-4 animate-spin" /> : <SparklesIcon className="w-4 h-4" />}
              Run Editorial Critique
            </button>
          </div>
        </div>

        {/* RIGHT PANE: EDITORIAL TOOLS & CRITIQUE */}
        <div className="flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
          {!critique && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-strand-50 rounded-xl border border-dashed border-strand-300">
              <BookOpenIcon className="w-12 h-12 text-strand-300 mb-4" />
              <h4 className="text-lg font-serif text-strand-700 mb-2">Editor's Analysis Pending</h4>
              <p className="text-sm text-strand-500 max-w-xs">
                Run a critique to see structural analysis, motif mapping, and authorial alignment for your current draft.
              </p>
            </div>
          )}

          {loading && (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-strand-50 rounded-xl border border-strand-200">
              <RefreshIcon className="w-12 h-12 text-strand-400 animate-spin mb-4" />
              <h4 className="text-lg font-serif text-strand-700 mb-2">Analyzing Manuscript...</h4>
              <p className="text-sm text-strand-500">The editor is reviewing your prose for cadence, sensory depth, and authorial voice.</p>
            </div>
          )}

          {critique && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-8">
              {/* SCORES */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Thematic', value: critique.thematicConsistency.score, color: 'bg-blue-500' },
                  { label: 'Pacing', value: critique.pacing.score, color: 'bg-emerald-500' },
                  { label: 'Ecology', value: critique.ecologicalDepth.score, color: 'bg-amber-500' }
                ].map(stat => (
                  <div key={stat.label} className="bg-white p-4 rounded-xl border border-strand-200 shadow-sm">
                    <div className="text-[9px] font-bold text-strand-400 uppercase tracking-widest mb-1">{stat.label}</div>
                    <div className="flex items-end gap-1">
                      <span className="text-2xl font-serif font-bold text-strand-800">{stat.value}</span>
                      <span className="text-[10px] text-strand-400 mb-1.5">%</span>
                    </div>
                    <div className="w-full bg-strand-100 h-1 rounded-full mt-2 overflow-hidden">
                      <div className={`h-full ${stat.color}`} style={{ width: `${stat.value}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ANALYSIS SECTIONS */}
              <div className="space-y-4">
                <section className="bg-white p-6 rounded-xl border border-strand-200 shadow-sm relative group">
                  <div className="absolute top-4 right-4">
                    <div className="group/tooltip relative">
                      <InfoIcon className="w-4 h-4 text-strand-300 cursor-help" />
                      <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-strand-800 text-white text-[10px] rounded-lg shadow-2xl opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity z-50 leading-relaxed border border-strand-600">
                        <strong className="block mb-1 text-strand-300 uppercase tracking-widest">Show Your Work:</strong>
                        The editor looks for specific lexical markers and rhythmic patterns associated with your chosen Author Mix.
                      </div>
                    </div>
                  </div>
                  <h4 className="text-xs font-bold text-strand-500 uppercase tracking-widest mb-3">Thematic Analysis</h4>
                  <p className="text-sm text-strand-700 leading-relaxed italic">"{critique.thematicConsistency.analysis}"</p>
                  
                  {critique.thematicConsistency.missingMotifs.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h5 className="text-[9px] font-bold text-strand-400 uppercase tracking-widest">Weak or Missing Motifs</h5>
                      <div className="flex flex-wrap gap-2">
                        {critique.thematicConsistency.missingMotifs.map((m, i) => (
                          <span key={i} className="text-[9px] bg-red-50 text-red-700 border border-red-100 px-2 py-0.5 rounded uppercase tracking-tighter">{m}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </section>

                <section className="bg-white p-6 rounded-xl border border-strand-200 shadow-sm">
                  <h4 className="text-xs font-bold text-strand-500 uppercase tracking-widest mb-3">Pacing & Flow</h4>
                  <p className="text-sm text-strand-700 leading-relaxed italic mb-4">"{critique.pacing.analysis}"</p>
                  <div className="space-y-2">
                    <h5 className="text-[9px] font-bold text-strand-400 uppercase tracking-widest">Suggestions</h5>
                    <ul className="space-y-2">
                      {critique.pacing.suggestions.map((s, i) => (
                        <li key={i} className="flex gap-3 text-sm text-strand-700">
                          <span className="text-strand-400 font-serif font-bold">0{i+1}.</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>

                <section className="bg-strand-800 p-6 rounded-xl shadow-lg text-white">
                  <h4 className="text-xs font-bold text-strand-400 uppercase tracking-widest mb-3">Ecological Depth</h4>
                  <p className="text-sm text-strand-200 leading-relaxed italic">"{critique.ecologicalDepth.analysis}"</p>
                </section>

                <section className="bg-strand-100 p-6 rounded-xl border border-strand-200">
                  <h4 className="text-xs font-bold text-strand-500 uppercase tracking-widest mb-2">Overall Feedback</h4>
                  <p className="text-sm text-strand-800 font-serif leading-relaxed">{critique.overallFeedback}</p>
                </section>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
