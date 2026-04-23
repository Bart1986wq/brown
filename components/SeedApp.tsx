
import React, { useState, useRef } from 'react';
import { DEFAULT_PARAMS, DEFAULT_AUTHOR_MIX } from '../constants';
import { SeedGeneratorParams, NarrativeBlueprint, AuthorMix } from '../types';
import { generateStrandlineSeeds } from '../services/geminiService';
import { SeedGeneratorForm } from './SeedGeneratorForm';
import { SeedResult } from './SeedResult';

function SeedApp() {
  const [params, setParams] = useState<SeedGeneratorParams>(DEFAULT_PARAMS);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (field: keyof SeedGeneratorParams, value: any) => {
    setParams(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerateSeeds = async () => {
    setLoading(true);
    setResult(null);
    try {
      // In Standalone mode, we use default/empty mix as the lab is not connected
      const blueprint: NarrativeBlueprint = {
        id: Date.now().toString(),
        name: 'Standalone Seed Generation',
        authorMix: DEFAULT_AUTHOR_MIX,
        params: params,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const seedsJsonString = await generateStrandlineSeeds(blueprint);
      
      const parsedSeeds = JSON.parse(seedsJsonString);
      const formattedText = parsedSeeds.map((s: any, i: number) => `
SEED ${i + 1}
TITLE: ${s.title}
PREMISE: ${s.premise}
MOTIFS: ${s.motifs.join(', ')}
TONE: ${s.toneProfile}
STRUCTURE: ${s.structuralSuggestion}
      `).join('\n----------------------------------------\n');

      setResult(formattedText);
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (error) {
      alert("Failed to generate seeds. Please ensure your API Key is valid.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen font-sans bg-strand-50 text-strand-900 pb-20">
      <header className="bg-white border-b border-strand-200 sticky top-0 z-30 bg-opacity-90 backdrop-blur-md mb-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-strand-800 rounded-full flex items-center justify-center text-strand-50 font-serif font-bold text-lg shadow-sm">
              S
            </div>
            <h1 className="font-serif text-xl font-bold tracking-tight text-strand-800">
              Strandline <span className="text-strand-400 font-light italic">Seed Generator</span>
            </h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6">
        <section className="bg-white rounded-xl shadow-sm border border-strand-200 p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-strand-300 via-strand-500 to-strand-300 opacity-50"></div>
          
          <SeedGeneratorForm 
            params={params}
            onParamChange={handleInputChange}
            loading={loading}
            onGenerate={handleGenerateSeeds}
          />
        </section>

        {result && (
          <div ref={resultRef} className="mt-8">
            <SeedResult result={result} />
          </div>
        )}
      </main>
    </div>
  );
}

export default SeedApp;
