
import React, { useState } from 'react';
import { 
  EcologicalResearchResult, 
  SensoryPalette, 
  BiomeType
} from '../types';
import { 
  generateContextResearch, 
  generateSensoryPalette, 
  generateAtmosphereImage 
} from '../services/geminiService';
import { 
  BeakerIcon, 
  PhotoIcon, 
  SearchIcon, 
  SparklesIcon, 
  RefreshIcon 
} from './Icons';

interface FieldLabProps {
  locationName: string;
  biome: BiomeType;
  onQuotaExceeded: () => void;
}

export const FieldLab: React.FC<FieldLabProps> = ({ 
  locationName, 
  biome, 
  onQuotaExceeded 
}) => {
  const [research, setResearch] = useState<EcologicalResearchResult | null>(null);
  const [palette, setPalette] = useState<SensoryPalette | null>(null);
  const [moodboard, setMoodboard] = useState<string | null>(null);
  
  const [loadingResearch, setLoadingResearch] = useState(false);
  const [loadingPalette, setLoadingPalette] = useState(false);
  const [loadingMoodboard, setLoadingMoodboard] = useState(false);

  const handleResearch = async () => {
    if (!locationName) return;
    setLoadingResearch(true);
    try {
      const result = await generateContextResearch(locationName);
      setResearch(result);
    } catch (error: any) {
      if (error.message?.includes('429')) onQuotaExceeded();
      else alert("Research failed.");
    } finally {
      setLoadingResearch(false);
    }
  };

  const handlePalette = async () => {
    setLoadingPalette(true);
    try {
      const result = await generateSensoryPalette(biome, locationName);
      setPalette(result);
    } catch (error: any) {
      if (error.message?.includes('429')) onQuotaExceeded();
      else alert("Palette generation failed.");
    } finally {
      setLoadingPalette(false);
    }
  };

  const handleMoodboard = async () => {
    setLoadingMoodboard(true);
    try {
      const prompt = `${biome} landscape in ${locationName || 'the wild'}. Atmospheric lighting, cinematic composition.`;
      const imageUrl = await generateAtmosphereImage(prompt);
      setMoodboard(imageUrl);
    } catch (error: any) {
      if (error.message?.includes('429')) onQuotaExceeded();
      else alert("Moodboard generation failed.");
    } finally {
      setLoadingMoodboard(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Tool 1: Research */}
        <div className="bg-strand-50 border border-strand-200 rounded-xl p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-strand-800 text-white rounded-full flex items-center justify-center">
              <SearchIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-strand-800">Ecological Scout</h3>
              <p className="text-[10px] text-strand-500 uppercase tracking-widest">Grounding Assistant</p>
            </div>
          </div>
          <p className="text-xs text-strand-600 mb-6 flex-grow">
            Pull real-world ecological data for <strong>{locationName || "Current Location"}</strong> using Google Search grounding.
          </p>
          <button 
            onClick={handleResearch}
            disabled={loadingResearch || !locationName}
            className="w-full bg-strand-800 text-white py-2.5 rounded-lg text-xs font-bold hover:bg-strand-900 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loadingResearch ? <RefreshIcon className="w-4 h-4 animate-spin" /> : <SearchIcon className="w-4 h-4" />}
            {research ? "Refresh Research" : "Scout Location"}
          </button>
        </div>

        {/* Tool 2: Sensory Palette */}
        <div className="bg-strand-50 border border-strand-200 rounded-xl p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-strand-800 text-white rounded-full flex items-center justify-center">
              <BeakerIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-strand-800">Sensory Lab</h3>
              <p className="text-[10px] text-strand-500 uppercase tracking-widest">Atmospheric Word Bank</p>
            </div>
          </div>
          <p className="text-xs text-strand-600 mb-6 flex-grow">
            Generate a non-visual sensory palette for <strong>{biome}</strong>.
          </p>
          <button 
            onClick={handlePalette}
            disabled={loadingPalette}
            className="w-full bg-strand-800 text-white py-2.5 rounded-lg text-xs font-bold hover:bg-strand-900 transition-colors flex items-center justify-center gap-2"
          >
            {loadingPalette ? <RefreshIcon className="w-4 h-4 animate-spin" /> : <SparklesIcon className="w-4 h-4" />}
            {palette ? "Regenerate Palette" : "Synthesize Palette"}
          </button>
        </div>

        {/* Tool 3: Moodboard */}
        <div className="bg-strand-50 border border-strand-200 rounded-xl p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-strand-800 text-white rounded-full flex items-center justify-center">
              <PhotoIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-strand-800">Atmosphere Lab</h3>
              <p className="text-[10px] text-strand-500 uppercase tracking-widest">Visual Reference</p>
            </div>
          </div>
          <p className="text-xs text-strand-600 mb-6 flex-grow">
            Generate a cinematic reference plate to visualize the lighting and mood.
          </p>
          <button 
            onClick={handleMoodboard}
            disabled={loadingMoodboard}
            className="w-full bg-strand-800 text-white py-2.5 rounded-lg text-xs font-bold hover:bg-strand-900 transition-colors flex items-center justify-center gap-2"
          >
            {loadingMoodboard ? <RefreshIcon className="w-4 h-4 animate-spin" /> : <PhotoIcon className="w-4 h-4" />}
            {moodboard ? "New Reference" : "Generate Plate"}
          </button>
        </div>
      </div>

      {/* Results Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Research Results */}
        {research && (
          <div className="bg-white border border-strand-200 rounded-xl p-8 shadow-sm space-y-6 animate-in slide-in-from-left-4 duration-500">
            <div className="border-b border-strand-100 pb-4">
              <h4 className="font-serif text-2xl font-bold text-strand-800">{research.location}</h4>
              <p className="text-sm text-strand-600 mt-2 italic">"{research.summary}"</p>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h5 className="text-[10px] uppercase tracking-widest font-bold text-strand-400 mb-2">Flora</h5>
                <ul className="text-xs text-strand-700 space-y-1">
                  {research.flora.map((item, i) => <li key={i} className="flex items-start gap-2"><span>•</span> {item}</li>)}
                </ul>
              </div>
              <div>
                <h5 className="text-[10px] uppercase tracking-widest font-bold text-strand-400 mb-2">Fauna</h5>
                <ul className="text-xs text-strand-700 space-y-1">
                  {research.fauna.map((item, i) => <li key={i} className="flex items-start gap-2"><span>•</span> {item}</li>)}
                </ul>
              </div>
              <div>
                <h5 className="text-[10px] uppercase tracking-widest font-bold text-strand-400 mb-2">Geology</h5>
                <ul className="text-xs text-strand-700 space-y-1">
                  {research.geology.map((item, i) => <li key={i} className="flex items-start gap-2"><span>•</span> {item}</li>)}
                </ul>
              </div>
              <div>
                <h5 className="text-[10px] uppercase tracking-widest font-bold text-strand-400 mb-2">Climate</h5>
                <ul className="text-xs text-strand-700 space-y-1">
                  {research.climate.map((item, i) => <li key={i} className="flex items-start gap-2"><span>•</span> {item}</li>)}
                </ul>
              </div>
            </div>

            {research.sources && research.sources.length > 0 && (
              <div className="pt-4 border-t border-strand-100">
                <h5 className="text-[10px] uppercase tracking-widest font-bold text-strand-400 mb-2">Grounding Sources</h5>
                <div className="flex flex-wrap gap-2">
                  {research.sources.map((s, i) => (
                    <a 
                      key={i} 
                      href={s.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[10px] text-strand-500 hover:text-strand-800 underline truncate max-w-[200px]"
                    >
                      {s.title || s.uri}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Palette Results */}
        {palette && (
          <div className="bg-strand-900 text-strand-100 rounded-xl p-8 shadow-xl space-y-8 animate-in slide-in-from-right-4 duration-500">
            <div className="border-b border-strand-800 pb-4">
              <h4 className="font-serif text-2xl font-bold">Sensory Palette</h4>
              <p className="text-xs text-strand-400 mt-1 uppercase tracking-widest">{biome}</p>
            </div>

            <div className="space-y-6">
              <section>
                <h5 className="text-[10px] uppercase tracking-widest font-bold text-strand-500 mb-3">Olfactory (Smells)</h5>
                <div className="flex flex-wrap gap-2">
                  {palette.smells.map((s, i) => (
                    <span key={i} className="text-xs bg-strand-800 border border-strand-700 px-3 py-1.5 rounded-full italic">
                      {s}
                    </span>
                  ))}
                </div>
              </section>

              <section>
                <h5 className="text-[10px] uppercase tracking-widest font-bold text-strand-500 mb-3">Auditory (Sounds)</h5>
                <div className="flex flex-wrap gap-2">
                  {palette.sounds.map((s, i) => (
                    <span key={i} className="text-xs bg-strand-800 border border-strand-700 px-3 py-1.5 rounded-full italic">
                      {s}
                    </span>
                  ))}
                </div>
              </section>

              <section>
                <h5 className="text-[10px] uppercase tracking-widest font-bold text-strand-500 mb-3">Tactile (Textures)</h5>
                <div className="flex flex-wrap gap-2">
                  {palette.textures.map((s, i) => (
                    <span key={i} className="text-xs bg-strand-800 border border-strand-700 px-3 py-1.5 rounded-full italic">
                      {s}
                    </span>
                  ))}
                </div>
              </section>

              <section>
                <h5 className="text-[10px] uppercase tracking-widest font-bold text-strand-500 mb-3">Atmospheric (Lighting)</h5>
                <div className="flex flex-wrap gap-2">
                  {palette.lighting.map((s, i) => (
                    <span key={i} className="text-xs bg-strand-800 border border-strand-700 px-3 py-1.5 rounded-full italic">
                      {s}
                    </span>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}

        {/* Moodboard Result */}
        {moodboard && (
          <div className="lg:col-span-2 bg-white border border-strand-200 rounded-xl overflow-hidden shadow-lg animate-in fade-in zoom-in-95 duration-700">
            <div className="aspect-video relative group">
              <img 
                src={moodboard} 
                alt="Atmosphere Reference" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                <p className="text-white text-sm font-serif italic">
                  Visual reference for {locationName || biome}.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
