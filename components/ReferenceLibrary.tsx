
import React, { useState } from 'react';
import { 
  VOICE_PRESET_DETAILS, 
  AUTHOR_DEFINITIONS,
  PERSPECTIVE_MODE_DETAILS,
  CREATIVE_FORM_DETAILS
} from '../constants';
import { BookOpenIcon } from './Icons';

type Section = 'QuickStart' | 'Voice' | 'Perspective' | 'Form' | 'Authors';

export const ReferenceLibrary: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Section>('QuickStart');

  const tabs: Section[] = ['QuickStart', 'Voice', 'Perspective', 'Form', 'Authors'];

  return (
    <div className="space-y-8">
      <div className="space-y-4 border-b border-strand-200 pb-4">
        <h2 className="text-2xl font-serif text-strand-800">Module H: Reference Library</h2>
        <p className="text-strand-600 text-sm">
          A definitive guide to the modes, tones, and structures of the Strandline Studio.
        </p>
      </div>

      {/* Internal Navigation */}
      <div className="flex gap-2 pb-2 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveSection(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-colors whitespace-nowrap ${
              activeSection === tab 
                ? 'bg-strand-800 text-white' 
                : 'bg-strand-100 text-strand-500 hover:bg-strand-200'
            }`}
          >
            {tab === 'QuickStart' ? 'Quick Start' : tab}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 gap-6">
        
        {activeSection === 'QuickStart' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <section className="space-y-4">
              <div className="flex items-center gap-3 border-b border-strand-200 pb-2">
                <div className="bg-strand-800 text-white p-1.5 rounded">
                   <BookOpenIcon className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-xl text-strand-800">The Strandline Loop (Integrated Workflow)</h3>
              </div>
              <p className="text-sm text-strand-600 leading-relaxed">
                For the deepest narrative results, follow this end-to-end pipeline to ground your writing in ecological reality and literary precision.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-strand-50 p-5 rounded-xl border border-strand-200">
                  <span className="text-[10px] font-bold text-strand-400 uppercase tracking-widest mb-1 block">Step 01</span>
                  <h4 className="font-bold text-strand-800 mb-2">Calibrate Voice (Module A)</h4>
                  <p className="text-xs text-strand-600">Mix authors in the Voice Lab. Try 60% Macfarlane + 40% Dillard for "Scientific Lyricism." Save this as your Custom Calibration.</p>
                </div>
                <div className="bg-strand-50 p-5 rounded-xl border border-strand-200">
                  <span className="text-[10px] font-bold text-strand-400 uppercase tracking-widest mb-1 block">Step 02</span>
                  <h4 className="font-bold text-strand-800 mb-2">Ground Reality (Module I)</h4>
                  <p className="text-xs text-strand-600">Enter your location in the Field Lab. Fetch real ecological data and click "Apply Context" to feed it into the Generator.</p>
                </div>
                <div className="bg-strand-50 p-5 rounded-xl border border-strand-200">
                  <span className="text-[10px] font-bold text-strand-400 uppercase tracking-widest mb-1 block">Step 03</span>
                  <h4 className="font-bold text-strand-800 mb-2">Generate Seeds (Module B)</h4>
                  <p className="text-xs text-strand-600">Use Series Mode for interconnected chapters. Define a "Global Spine" (e.g., a river walk) to maintain continuity across seeds.</p>
                </div>
                <div className="bg-strand-50 p-5 rounded-xl border border-strand-200">
                  <span className="text-[10px] font-bold text-strand-400 uppercase tracking-widest mb-1 block">Step 04</span>
                  <h4 className="font-bold text-strand-800 mb-2">Expand & Draft (Modules C/D)</h4>
                  <p className="text-xs text-strand-600">Expand a seed into a structure, then use the Prose Builder to flesh it out with sensory detail based on your voice mix.</p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 border-b border-strand-200 pb-2">
                <div className="bg-strand-800 text-white p-1.5 rounded">
                   <span className="font-bold text-xs">SM</span>
                </div>
                <h3 className="font-serif text-xl text-strand-800">Series Mode Strategies</h3>
              </div>
              <div className="space-y-4">
                <div className="bg-white p-6 rounded-xl border border-strand-200 shadow-sm">
                  <h4 className="font-bold text-strand-900 mb-2">The Global Spine</h4>
                  <p className="text-sm text-strand-700 leading-relaxed mb-4">
                    The "Spine" is the thread that holds your series together. It can be a physical journey, a temporal shift, or a thematic obsession.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="text-xs bg-strand-50 p-3 rounded border border-strand-100">
                      <strong className="block text-strand-800 mb-1">Physical:</strong>
                      "A 50-mile solo walk following a chalk stream from source to sea."
                    </div>
                    <div className="text-xs bg-strand-50 p-3 rounded border border-strand-100">
                      <strong className="block text-strand-800 mb-1">Temporal:</strong>
                      "A year-long observation of a single ancient Yew tree across seasons."
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 border-b border-strand-200 pb-2">
                <div className="bg-strand-800 text-white p-1.5 rounded">
                   <span className="font-bold text-xs">GR</span>
                </div>
                <h3 className="font-serif text-xl text-strand-800">Grafting & Remixing</h3>
              </div>
              <div className="bg-strand-900 text-strand-100 p-6 rounded-xl shadow-lg">
                <p className="text-sm leading-relaxed mb-4">
                  Don't settle for the first batch. Select two or more seeds in the Generator and click <strong className="text-white">"Graft"</strong>.
                </p>
                <p className="text-xs text-strand-300 italic">
                  "Grafting tells the AI to take the best elements of two chapter ideas and merge them into a new, more complex 'hybrid' chapter. It's perfect for creating unexpected narrative collisions."
                </p>
              </div>
            </section>
          </div>
        )}

        {activeSection === 'Voice' && (
           <div className="space-y-6">
             <h3 className="font-serif text-xl text-strand-800">Voice Presets</h3>
             <div className="grid grid-cols-1 gap-4">
               {Object.entries(VOICE_PRESET_DETAILS).map(([key, detail]) => (
                 <div key={key} className="bg-white p-6 rounded-xl border border-strand-200 shadow-sm">
                   <div className="flex justify-between items-start mb-2">
                     <h4 className="font-serif font-bold text-strand-900 text-lg">{key}</h4>
                     <span className="text-[10px] bg-strand-50 text-strand-500 px-2 py-1 rounded border border-strand-100 uppercase tracking-wider">Preset</span>
                   </div>
                   <div className="space-y-3">
                     <div className="text-xs text-strand-500">
                       <strong className="text-strand-700 uppercase">Author Blend:</strong> {detail.authors}
                     </div>
                     <div className="text-xs text-strand-500">
                       <strong className="text-strand-700 uppercase">Keywords:</strong> {detail.keywords}
                     </div>
                     <p className="text-sm text-strand-800 font-serif italic border-l-2 border-strand-300 pl-3">
                       "{detail.effects}"
                     </p>
                   </div>
                 </div>
               ))}
             </div>
           </div>
        )}

        {activeSection === 'Perspective' && (
           <div className="space-y-6">
             <h3 className="font-serif text-xl text-strand-800">Narrative Perspectives</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {Object.entries(PERSPECTIVE_MODE_DETAILS).map(([key, detail]) => (
                 <div key={key} className="bg-white p-5 rounded-xl border border-strand-200 shadow-sm flex flex-col justify-between">
                   <h4 className="font-serif font-bold text-strand-900 mb-2">{key}</h4>
                   <p className="text-sm text-strand-600 leading-relaxed">
                     {detail}
                   </p>
                 </div>
               ))}
             </div>
           </div>
        )}

        {activeSection === 'Form' && (
           <div className="space-y-6">
             <h3 className="font-serif text-xl text-strand-800">Creative Forms</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {Object.entries(CREATIVE_FORM_DETAILS).map(([key, detail]) => (
                 <div key={key} className="bg-white p-5 rounded-xl border border-strand-200 shadow-sm flex flex-col justify-between">
                   <h4 className="font-serif font-bold text-strand-900 mb-2">{key}</h4>
                   <p className="text-sm text-strand-600 leading-relaxed">
                     {detail}
                   </p>
                 </div>
               ))}
             </div>
           </div>
        )}

        {activeSection === 'Authors' && (
            <div className="space-y-6">
              <h3 className="font-serif text-xl text-strand-800">Author Database (Voice Engine)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {AUTHOR_DEFINITIONS.map((author) => (
                  <div key={author.id} className="bg-white p-4 rounded-lg border border-strand-200 shadow-sm">
                    <h4 className="font-serif font-bold text-strand-900 mb-1">{author.name}</h4>
                    <p className="text-xs text-strand-500 font-mono mb-2">{author.id}</p>
                    <p className="text-xs text-strand-600 leading-relaxed bg-strand-50 p-2 rounded">
                      {author.traits}
                    </p>
                  </div>
                ))}
              </div>
            </div>
        )}

      </div>
    </div>
  );
};
