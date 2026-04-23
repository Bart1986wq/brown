
import React, { useState } from 'react';
import { BiomeType, AuthorMix, CharacterMycelium } from '../types';
import { generateCharacterMycelium } from '../services/geminiService';
import { UserIcon, RefreshIcon, SparklesIcon } from './Icons';

interface CharacterLabProps {
  biome: BiomeType;
  authorMix: AuthorMix;
  onQuotaExceeded: () => void;
}

export const CharacterLab: React.FC<CharacterLabProps> = ({ biome, authorMix, onQuotaExceeded }) => {
  const [loading, setLoading] = useState(false);
  const [character, setCharacter] = useState<CharacterMycelium | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateCharacterMycelium(biome, authorMix);
      setCharacter(result);
    } catch (error: any) {
      if (error.message?.includes('429')) onQuotaExceeded();
      else alert("Character generation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-strand-50 border border-strand-200 rounded-xl p-8 flex flex-col items-center text-center max-w-2xl mx-auto">
        <div className="w-16 h-16 bg-strand-800 text-white rounded-full flex items-center justify-center mb-6 shadow-lg">
          <UserIcon className="w-8 h-8" />
        </div>
        <h3 className="font-serif text-2xl font-bold text-strand-800 mb-2">Character Mycelium</h3>
        <p className="text-strand-600 text-sm mb-8">
          Grow a character native to the <strong>{biome}</strong> biome. Their traits, habits, and metaphors will be shaped by the environment and your current <strong>Voice Mix</strong>.
        </p>
        <button 
          onClick={handleGenerate}
          disabled={loading}
          className="bg-strand-800 text-white px-8 py-3 rounded-full font-serif font-bold text-lg hover:bg-strand-900 transition-all flex items-center gap-3 shadow-md"
        >
          {loading ? <RefreshIcon className="w-5 h-5 animate-spin" /> : <SparklesIcon className="w-5 h-5" />}
          {character ? "Regenerate Character" : "Grow Character"}
        </button>
      </div>

      {character && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-8 duration-700">
          {/* Main Profile */}
          <div className="lg:col-span-2 bg-white border border-strand-200 rounded-xl p-8 shadow-sm space-y-6">
            <div className="border-b border-strand-100 pb-6">
              <h4 className="font-serif text-3xl font-bold text-strand-800">{character.name}</h4>
              <p className="text-lg text-strand-500 italic mt-1">{character.role}</p>
            </div>
            
            <div className="space-y-4">
              <h5 className="text-xs font-bold text-strand-400 uppercase tracking-widest">Environmental Backstory</h5>
              <p className="text-strand-700 font-serif leading-relaxed italic">
                "{character.backstory}"
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              <section className="space-y-3">
                <h5 className="text-xs font-bold text-strand-400 uppercase tracking-widest">Environmental Traits</h5>
                <ul className="space-y-2">
                  {character.environmentalTraits.map((trait, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-strand-700">
                      <span className="text-strand-300 mt-1">•</span>
                      {trait}
                    </li>
                  ))}
                </ul>
              </section>
              <section className="space-y-3">
                <h5 className="text-xs font-bold text-strand-400 uppercase tracking-widest">Sensory Habits</h5>
                <ul className="space-y-2">
                  {character.sensoryHabits.map((habit, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-strand-700">
                      <span className="text-strand-300 mt-1">•</span>
                      {habit}
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>

          {/* Metaphor Matrix */}
          <div className="bg-strand-900 text-strand-100 rounded-xl p-8 shadow-xl flex flex-col">
            <div className="flex items-center gap-3 mb-8 border-b border-strand-800 pb-4">
              <SparklesIcon className="w-5 h-5 text-strand-400" />
              <h4 className="font-serif text-xl font-bold">Metaphor Matrix</h4>
            </div>
            <div className="space-y-6 flex-grow">
              <p className="text-xs text-strand-400 uppercase tracking-widest leading-relaxed">
                How this character perceives the world through the lens of the {biome}:
              </p>
              <div className="space-y-4">
                {character.metaphors.map((metaphor, i) => (
                  <div key={i} className="bg-strand-800 border border-strand-700 p-4 rounded-lg italic text-sm text-strand-200">
                    "{metaphor}"
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-8 pt-4 border-t border-strand-800 text-[10px] text-strand-500 uppercase tracking-widest text-center">
              Native to the {biome}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
