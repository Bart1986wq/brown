import React, { useState, useEffect } from 'react';
import { DEFAULT_AUTHOR_MIX } from './constants';
import { AuthorMix, CalibrationMode, VoiceAnalysisResult } from './types';
import { generateVoiceProfile } from './services/geminiService';
import { VoiceLab } from './components/VoiceLab';

function VoiceApp() {
  const [authorMix, setAuthorMix] = useState<AuthorMix>(DEFAULT_AUTHOR_MIX);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VoiceAnalysisResult | null>(null);
  const [showKeyPrompt, setShowKeyPrompt] = useState(false);
  const [hasPersonalKey, setHasPersonalKey] = useState(false);

  // --- API Key Selection Check ---
  useEffect(() => {
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

  const handleOpenKeySelector = async () => {
    // @ts-ignore
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      setHasPersonalKey(true);
      setShowKeyPrompt(false);
    }
  };

  const handleGenerateProfile = async (mode: CalibrationMode, locationHint?: string) => {
    setLoading(true);
    setResult(null);
    try {
       const profile = await generateVoiceProfile(authorMix, mode, locationHint);
       setResult(profile);
    } catch (error: any) {
      if (error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED')) {
        setShowKeyPrompt(true);
      } else {
        alert("Failed to generate profile.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen font-sans bg-strand-50 text-strand-900 pb-20">
      <header className="bg-white border-b border-strand-200 sticky top-0 z-30 bg-opacity-90 backdrop-blur-md mb-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-strand-800 rounded-full flex items-center justify-center text-strand-50 font-serif font-bold text-lg shadow-sm">
                  V
                </div>
                <div className="flex flex-col">
                  <h1 className="font-serif text-xl font-bold tracking-tight text-strand-800">
                    Strandline <span className="text-strand-400 font-light italic">Voice Calibration Lab</span>
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
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6">
        {showKeyPrompt && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-6 shadow-sm animate-in fade-in slide-in-from-top-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 flex-shrink-0">
                  ⚠️
                </div>
                <div>
                  <h3 className="font-serif font-bold text-amber-900">API Quota Exceeded</h3>
                  <p className="text-sm text-amber-700">You've hit the rate limit for the shared API key. Please select your own API key to continue.</p>
                </div>
              </div>
              <button 
                onClick={handleOpenKeySelector}
                className="bg-amber-600 text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-amber-700 transition-colors shadow-md"
              >
                Select API Key
              </button>
            </div>
          </div>
        )}
        <section className="bg-white rounded-xl shadow-sm border border-strand-200 p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-strand-300 via-strand-500 to-strand-300 opacity-50"></div>
          <VoiceLab 
              mix={authorMix} 
              onMixChange={setAuthorMix} 
              onGenerate={handleGenerateProfile}
              loading={loading}
              result={result}
              onQuotaExceeded={() => setShowKeyPrompt(true)}
            />
        </section>
      </main>
    </div>
  );
}

export default VoiceApp;