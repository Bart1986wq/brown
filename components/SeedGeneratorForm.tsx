
import React, { useState } from 'react';
import { 
  SeedGeneratorParams, 
  VoicePreset, 
  NarrativeAnchor,
  PerspectiveFamily,
  PerspectiveMode,
  CreativeForm,
  RoadState,
  WeatherPressure,
  FatigueLevel,
  NarrativeTemp,
  SeedType,
  ProtagonistMode,
  NarrativeMode,
  ThematicFocus,
  PlotStructure,
  SocialSetting,
  AtmosphereMode,
  TimePeriodMode,
  TensionLevel,
  StructureBias,
  VoiceTone,
  VoiceAnalysisResult
} from '../types';
import { 
  VOICE_PRESET_DETAILS, 
  PLOT_STRUCTURE_DETAILS,
  PERSPECTIVE_FAMILY_MODES,
  CREATIVE_FORM_DETAILS,
  PROTAGONIST_MODE_DETAILS,
  NARRATIVE_MODE_DETAILS
} from '../constants';
import { 
  analyzeLocationWithSearch, 
  analyzeRouteWithSearch, 
  generateRandomScoutReport,
  suggestRouteFromLocation,
  generateRandomArtifact,
  generateRandomFigure,
  generateRandomBookRoute,
  suggestRouteFromBook,
  suggestLocationFromFigure
} from '../services/geminiService';
import { StyledSelect, StyledInput } from './InputGroup';
import { MultiSelect } from './MultiSelect';
import { 
    SparklesIcon, 
    RefreshIcon, 
    DiceIcon, 
    BookOpenIcon, 
    MapPinIcon, 
    SignalIcon, 
    MapIcon,
    PlusCircleIcon,
    TrashIcon,
    ArrowRightCircleIcon,
    SearchIcon
} from './Icons';

interface SeedGeneratorFormProps {
  params: SeedGeneratorParams;
  onParamChange: (field: keyof SeedGeneratorParams, value: any) => void;
  loading: boolean;
  onGenerate: () => void;
  onTabChange?: (tab: string) => void;
  onQuotaExceeded?: () => void;
  labResult?: VoiceAnalysisResult | null;
  applyVoiceProfile: boolean;
  onApplyVoiceProfileChange: (value: boolean) => void;
  onSaveBlueprint: (name: string) => void;
  lockedFields: Set<keyof SeedGeneratorParams>;
  onUnlockField: (field: keyof SeedGeneratorParams) => void;
}

export const SeedGeneratorForm: React.FC<SeedGeneratorFormProps> = ({ params, onParamChange, loading, onGenerate, onTabChange, onQuotaExceeded, labResult, applyVoiceProfile, onApplyVoiceProfileChange, onSaveBlueprint, lockedFields, onUnlockField }) => {
  
  const [blueprintName, setBlueprintName] = useState('');
  const [grounding, setGrounding] = useState(false);
  const [routeSuggesting, setRouteSuggesting] = useState(false);
  const [groundingReport, setGroundingReport] = useState<string | null>(null);
  const [groundingSources, setGroundingSources] = useState<any[]>([]);
  const [scoutingRandom, setScoutingRandom] = useState(false);
  const [randomizingArtifact, setRandomizingArtifact] = useState(false);
  const [randomizingFigure, setRandomizingFigure] = useState(false);
  const [randomizingBook, setRandomizingBook] = useState(false);
  const [searchingBook, setSearchingBook] = useState(false);
  const [mappingFigure, setMappingFigure] = useState(false);
  const [newWaypoint, setNewWaypoint] = useState('');

  const selectedFamily = params.narrativePerspective?.family || PerspectiveFamily.FirstPerson;

  const handleSurpriseLocation = async () => {
    setScoutingRandom(true);
    setGroundingReport(null);
    setGroundingSources([]);
    onParamChange('groundingContext', '');
    
    try {
        const result = await generateRandomScoutReport(params.useRouteMode);
        
        if (params.useRouteMode) {
            onParamChange('startPoint', result.startPoint);
            onParamChange('endPoint', result.endPoint);
            onParamChange('waypoints', result.waypoints || []);
            onParamChange('groundingContext', result.routeDescription);
            setGroundingReport(result.routeDescription);
            if (result.suggestedRoadState) onParamChange('roadState', result.suggestedRoadState);
            if (result.suggestedNarrativeTemp) onParamChange('narrativeTemp', result.suggestedNarrativeTemp);
            if (result.suggestedTimePeriod) onParamChange('timePeriod', result.suggestedTimePeriod);
            if (result.suggestedTension) onParamChange('tensionLevel', result.suggestedTension);
        } else {
            onParamChange('locationName', result.locationName);
            onParamChange('groundingContext', result.ecologicalReport);
            setGroundingReport(result.ecologicalReport);
            if (result.suggestedTimePeriod) onParamChange('timePeriod', result.suggestedTimePeriod);
            if (result.suggestedTension) onParamChange('tensionLevel', result.suggestedTension);
        }

        if (result.suggestedSocialSettings) onParamChange('socialSetting', result.suggestedSocialSettings);
        if (result.suggestedAtmosphericTones) onParamChange('atmosphericTone', result.suggestedAtmosphericTones);
        if (result.sources) setGroundingSources(result.sources);
        
    } catch (e: any) {
        console.error("Scout failed", e);
        if (onQuotaExceeded && (e.message?.includes('429') || e.message?.includes('RESOURCE_EXHAUSTED'))) {
            onQuotaExceeded();
        } else {
            alert("Scout failed to return real-world data. Try again.");
        }
    } finally {
        setScoutingRandom(false);
    }
  };

  const handleRandomArtifact = async () => {
    setRandomizingArtifact(true);
    try {
        const artifact = await generateRandomArtifact(params.locationName || params.startPoint);
        onParamChange('focalArtifact', artifact);
    } catch (e: any) {
        console.error("Artifact randomization failed", e);
    } finally {
        setRandomizingArtifact(false);
    }
  };

  const handleRandomFigure = async () => {
    setRandomizingFigure(true);
    try {
        const figure = await generateRandomFigure(params.locationName || params.startPoint);
        onParamChange('focalFigure', figure);
    } catch (e: any) {
        console.error("Figure randomization failed", e);
    } finally {
        setRandomizingFigure(false);
    }
  };

  const handleMapFigureToLocation = async () => {
    if (!params.focalFigure) return;
    setMappingFigure(true);
    try {
        const location = await suggestLocationFromFigure(params.focalFigure);
        if (location) {
            onParamChange('locationName', location);
            // Also trigger a scout to get biomes etc
            const result = await analyzeLocationWithSearch(location);
            if (result && !result.error) {
                updateFormParamsFromAnalysis(result);
            }
        }
    } catch (e: any) {
        console.error("Figure mapping failed", e);
    } finally {
        setMappingFigure(false);
    }
  };

  const handleRandomBook = async () => {
    setRandomizingBook(true);
    try {
        const book = await generateRandomBookRoute(params.locationName || params.startPoint);
        onParamChange('focalBook', book);
    } catch (e: any) {
        console.error("Book randomization failed", e);
    } finally {
        setRandomizingBook(false);
    }
  };

  const handleSearchBookRoute = async () => {
    if (!params.focalBook) return;
    setSearchingBook(true);
    try {
        const result = await suggestRouteFromBook(params.focalBook);
        if (result && !result.error && result.startPoint) {
            onParamChange('useRouteMode', true);
            onParamChange('startPoint', result.startPoint);
            onParamChange('endPoint', result.endPoint);
            onParamChange('waypoints', result.waypoints || []);
            onParamChange('groundingContext', result.routeDescription);
            if (result.suggestedBiomes && result.suggestedBiomes.length > 0) {
                onParamChange('biomeType', result.suggestedBiomes);
            }
        } else {
            alert("Could not find a clear route for this book. Try a more specific title or author, or set the route manually.");
        }
    } catch (e: any) {
        console.error("Book route search failed", e);
    } finally {
        setSearchingBook(false);
    }
  };

  const handleSuggestRoute = async (sourceLocation: string) => {
      if (!sourceLocation) return;
      setRouteSuggesting(true);
      setGroundingReport(null);
      setGroundingSources([]);
      
      try {
          const result = await suggestRouteFromLocation(sourceLocation);
          if (result && !result.error) {
              onParamChange('useRouteMode', true);
              onParamChange('startPoint', result.startPoint);
              onParamChange('endPoint', result.endPoint);
              onParamChange('waypoints', result.waypoints || []);
              onParamChange('biomeType', result.suggestedBiomes || params.biomeType);
              onParamChange('groundingContext', result.routeDescription);
              if (result.suggestedRoadState) onParamChange('roadState', result.suggestedRoadState);
              if (result.suggestedNarrativeTemp) onParamChange('narrativeTemp', result.suggestedNarrativeTemp);
              setGroundingReport(result.routeDescription);
              setGroundingSources(result.sources || []);
          } else {
              alert("Could not suggest a logical route from this location.");
          }
      } catch (e: any) {
          if (onQuotaExceeded && (e.message?.includes('429') || e.message?.includes('RESOURCE_EXHAUSTED'))) {
              onQuotaExceeded();
          } else {
              alert("Error scouting route.");
          }
      } finally {
          setRouteSuggesting(false);
      }
  }

  const handleGrounding = async () => {
      setGroundingReport(null);
      setGroundingSources([]);
      
      if (!params.useRouteMode) {
          if (!params.locationName) return;
          setGrounding(true);
          try {
              const result = await analyzeLocationWithSearch(params.locationName);
              if (result && !result.error) {
                  updateFormParamsFromAnalysis(result);
              } else {
                  alert(`Scout could not find specific ecological details for "${params.locationName}". Try a more specific place name.`);
              }
          } catch (e: any) {
              if (onQuotaExceeded && (e.message?.includes('429') || e.message?.includes('RESOURCE_EXHAUSTED'))) {
                  onQuotaExceeded();
              } else {
                  alert("Could not ground location.");
              }
          } finally {
              setGrounding(false);
          }
      } else {
          if (!params.startPoint || !params.endPoint) return;
          setGrounding(true);
          try {
              const result = await analyzeRouteWithSearch(params.startPoint, params.endPoint, params.waypoints || []);
              if (result) updateFormParamsFromAnalysis(result);
          } catch (e: any) {
              if (onQuotaExceeded && (e.message?.includes('429') || e.message?.includes('RESOURCE_EXHAUSTED'))) {
                  onQuotaExceeded();
              } else {
                  alert("Could not scout route.");
              }
          } finally {
              setGrounding(false);
          }
      }
  }

  const updateFormParamsFromAnalysis = (result: any) => {
      if (result.suggestedSocialSettings?.length > 0) onParamChange('socialSetting', result.suggestedSocialSettings);
      if (result.suggestedAtmosphericTones?.length > 0) onParamChange('atmosphericTone', result.suggestedAtmosphericTones);
      if (result.suggestedTimePeriod?.length > 0) onParamChange('timePeriod', result.suggestedTimePeriod);
      if (result.suggestedTension?.length > 0) onParamChange('tensionLevel', result.suggestedTension);
      
      const report = result.ecologicalReport || result.routeDescription;
      if (report) {
          setGroundingReport(report);
          onParamChange('groundingContext', report);
      }

      if (result.sources) {
          setGroundingSources(result.sources);
      }
  }

  const addWaypoint = () => {
      if (newWaypoint.trim()) {
          const updated = [...(params.waypoints || []), newWaypoint.trim()];
          onParamChange('waypoints', updated);
          setNewWaypoint('');
      }
  }

  const removeWaypoint = (idx: number) => {
      const updated = [...(params.waypoints || [])];
      updated.splice(idx, 1);
      onParamChange('waypoints', updated);
  }

  const activeVoiceDetail = VOICE_PRESET_DETAILS[params.voicePreset];
  const lastActiveProtagonist = params.protagonistMode && params.protagonistMode.length > 0 ? PROTAGONIST_MODE_DETAILS[params.protagonistMode[params.protagonistMode.length - 1]] : null;
  const lastActiveNarrative = params.narrativeMode && params.narrativeMode.length > 0 ? NARRATIVE_MODE_DETAILS[params.narrativeMode[params.narrativeMode.length - 1]] : null;

  return (
    <div className="space-y-8">
      {/* SEED TYPE PIVOT */}
      <div className="flex justify-center mb-6">
        <div className="bg-strand-100 p-1 rounded-xl flex gap-1 shadow-inner border border-strand-200">
          <button
            onClick={() => onParamChange('seedType', SeedType.Narrative)}
            className={`px-6 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${params.seedType === SeedType.Narrative ? 'bg-white text-strand-800 shadow-sm border border-strand-200' : 'text-strand-500 hover:text-strand-700'}`}
          >
            <BookOpenIcon className="w-4 h-4" />
            Narrative Seeds
          </button>
          <button
            onClick={() => onParamChange('seedType', SeedType.Essay)}
            className={`px-6 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${params.seedType === SeedType.Essay ? 'bg-white text-strand-800 shadow-sm border border-strand-200' : 'text-strand-500 hover:text-strand-700'}`}
          >
            <SparklesIcon className="w-4 h-4" />
            Essay Seeds
          </button>
        </div>
      </div>

      {/* NARRATIVE ANCHOR PIVOT */}
      <div className="bg-strand-100 rounded-xl p-4 border border-strand-200 shadow-sm">
        <label className="text-xs font-bold text-strand-500 uppercase tracking-widest block mb-3 text-center">Narrative Anchor (Lead Focus)</label>
        <div className="flex flex-wrap gap-2 justify-center">
             {Object.values(NarrativeAnchor).map((anchor) => (
                <button
                    key={anchor}
                    onClick={() => onParamChange('narrativeAnchor', anchor)}
                    disabled={lockedFields.has('narrativeAnchor')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border flex items-center gap-2 ${params.narrativeAnchor === anchor ? 'bg-strand-800 text-white border-strand-800 shadow-md' : 'bg-white text-strand-500 border-strand-200 hover:border-strand-400'} ${lockedFields.has('narrativeAnchor') ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {anchor}
                    {lockedFields.has('narrativeAnchor') && params.narrativeAnchor === anchor && (
                        <span className="text-[8px] bg-strand-200 px-1 rounded">LOCKED</span>
                    )}
                </button>
             ))}
             {lockedFields.has('narrativeAnchor') && (
                 <button onClick={() => onUnlockField('narrativeAnchor')} className="text-[10px] text-strand-500 hover:text-strand-800 underline">Unlock</button>
             )}
        </div>
        <p className="text-[10px] text-strand-500 text-center mt-3 px-4 leading-relaxed">
            {params.narrativeAnchor === NarrativeAnchor.Relationship && "Centers the story on the connection between characters and the dynamics of their bond."}
            {params.narrativeAnchor === NarrativeAnchor.SocialTension && "Centers the story on the system, social structures, and the friction of modern life."}
            {params.narrativeAnchor === NarrativeAnchor.TurningPoint && "Centers the story on the moment of change, the catalyst, and the aftermath."}
            {params.narrativeAnchor === NarrativeAnchor.Memory && "Centers the story on the past, nostalgia, and the unreliable nature of memory."}
            {params.narrativeAnchor === NarrativeAnchor.Desire && "Centers the story on the 'Want'—the hidden longings, ambitions, and obsessions."}
            {params.narrativeAnchor === NarrativeAnchor.Setting && "Centers the story on the atmospheric tension of the place and its impact on the characters."}
            {params.narrativeAnchor === NarrativeAnchor.Timeline && "Centers the story on the sequence of events, the passage of time, and the unfolding narrative."}
            {params.narrativeAnchor === NarrativeAnchor.Perspective && "Centers the story on the observer, their viewpoint, and the subjective nature of truth."}
            {params.narrativeAnchor === NarrativeAnchor.Absence && "Centers the story on what is missing, silent, or erased from the narrative."}
            {params.narrativeAnchor === NarrativeAnchor.Threshold && "Centers the story on boundaries, edges, and the act of crossing between worlds."}
            {params.narrativeAnchor === NarrativeAnchor.Institution && "Centers the story on the system itself as the narrative engine (university, hospital, prison, etc.)."}
            {params.narrativeAnchor === NarrativeAnchor.Labour && "Centers the story on the character's daily work, time management, and physical reality."}
            {params.narrativeAnchor === NarrativeAnchor.Scene && "Centers the story on an immediate, concrete situation or setting as the starting point."}
            {params.narrativeAnchor === NarrativeAnchor.Body && "Centers the story on physical experience (pain, hunger, exhaustion, desire, touch)."}
            {params.narrativeAnchor === NarrativeAnchor.Liminal && "Centers the story on in-between spaces, ambiguity, and the blurring of boundaries between states."}
        </p>
      </div>

      {/* CALIBRATED VOICE PROFILE TOGGLE */}
      {labResult && (
        <div className="bg-strand-50 rounded-xl p-4 border border-strand-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="bg-strand-800 p-2 rounded-lg text-white">
                    <SparklesIcon className="w-5 h-5" />
                </div>
                <div>
                    <label className="text-xs font-bold text-strand-800 uppercase tracking-widest block">Apply Calibrated Voice Profile</label>
                    <p className="text-[10px] text-strand-500">Use your calibrated voice profile to influence seed generation.</p>
                </div>
            </div>
            <input 
                type="checkbox" 
                checked={applyVoiceProfile}
                onChange={(e) => onApplyVoiceProfileChange(e.target.checked)}
                className="w-5 h-5 rounded border-strand-300 text-strand-800 focus:ring-strand-800"
            />
        </div>
      )}

      {/* PERSPECTIVE & FORM */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-strand-500 uppercase tracking-wider pl-1">Perspective Family</label>
            <select 
                value={selectedFamily}
                onChange={(e) => {
                    const family = e.target.value as PerspectiveFamily;
                    onParamChange('narrativePerspective', { family, modes: [] });
                }}
                className="w-full bg-white border border-strand-300 text-sm rounded-md p-3 focus:ring-2 focus:ring-strand-400 focus:outline-none"
            >
                {Object.values(PerspectiveFamily).map(family => (
                    <option key={family} value={family}>{family}</option>
                ))}
            </select>
          </div>
          
          <MultiSelect 
            label="Perspective Modes" 
            options={PERSPECTIVE_FAMILY_MODES[selectedFamily] || []} 
            value={params.narrativePerspective?.modes || []} 
            onChange={(val) => onParamChange('narrativePerspective', { family: selectedFamily, modes: val })} 
            maxSelections={3}
          />
          
          <MultiSelect 
            label="Creative Form" 
            options={Object.values(CreativeForm)} 
            value={params.creativeForm || []} 
            onChange={(val) => onParamChange('creativeForm', val)} 
            maxSelections={3}
          />
      </div>

      {/* Location & Environment */}
      <div className="space-y-4">
        <h3 className="font-serif text-lg text-strand-800 border-b border-strand-100 pb-2 mb-4">Location & Focal Point</h3>
        
        {/* Mode Toggle */}
        <div className="flex gap-4 mb-4">
             <button 
                onClick={() => { onParamChange('useRouteMode', false); setGroundingReport(null); setGroundingSources([]); onParamChange('groundingContext', ''); }}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold transition-colors ${!params.useRouteMode ? 'bg-strand-700 text-white' : 'bg-strand-100 text-strand-500 hover:bg-strand-200'}`}
             >
                 <MapPinIcon className="w-4 h-4" />
                 Single Location
             </button>
             <button 
                onClick={() => { onParamChange('useRouteMode', true); setGroundingReport(null); setGroundingSources([]); onParamChange('groundingContext', ''); }}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold transition-colors ${params.useRouteMode ? 'bg-strand-700 text-white' : 'bg-strand-100 text-strand-500 hover:bg-strand-200'}`}
             >
                 <MapIcon className="w-4 h-4" />
                 Linear Journey / Route
             </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Dynamic Location Input Area */}
          <div className="flex flex-col gap-1.5 sm:col-span-1">
             {!params.useRouteMode ? (
                 <>
                    <div className="flex justify-between items-baseline pl-1">
                        <label className="text-xs font-semibold text-strand-500 uppercase tracking-wider">
                            Location Name
                        </label>
                        <div className="flex gap-2">
                            <button 
                                type="button" 
                                onClick={handleSurpriseLocation}
                                disabled={scoutingRandom}
                                className="text-[10px] text-strand-400 hover:text-strand-700 font-medium flex items-center gap-1 transition-colors"
                            >
                                {scoutingRandom ? <RefreshIcon className="w-3 h-3 animate-spin" /> : <DiceIcon className="w-3 h-3" />}
                                {scoutingRandom ? 'Scouting...' : 'Surprise Me'}
                            </button>
                        </div>
                    </div>
                    <div className="flex gap-2 relative group">
                        <input
                            value={params.locationName || ''}
                            onChange={(e) => onParamChange('locationName', e.target.value)}
                            disabled={lockedFields.has('locationName')}
                            placeholder="e.g. The Lost Coast"
                            className={`w-full bg-white border border-strand-300 text-strand-800 text-sm rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-strand-400 focus:border-transparent transition-shadow placeholder-strand-300 pr-10 ${lockedFields.has('locationName') ? 'opacity-50 cursor-not-allowed' : ''}`}
                        />
                        {lockedFields.has('locationName') && (
                            <button onClick={() => onUnlockField('locationName')} className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-strand-500 hover:text-strand-800 underline">Unlock</button>
                        )}
                        {params.locationName && !lockedFields.has('locationName') && (
                            <button 
                                type="button"
                                onClick={() => onParamChange('locationName', '')}
                                className="absolute right-12 top-1/2 -translate-y-1/2 p-1 text-strand-300 hover:text-strand-500 transition-colors"
                                title="Clear Location"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        )}
                        <button
                            onClick={handleGrounding}
                            disabled={grounding || !params.locationName}
                            title="Ground Location using Google Search"
                            className={`flex items-center justify-center p-3 rounded-md border transition-all ${grounding ? 'bg-strand-100 border-strand-200 text-strand-400' : 'bg-white border-strand-300 text-strand-600 hover:bg-strand-50 shadow-sm'}`}
                        >
                            {grounding ? <RefreshIcon className="w-5 h-5 animate-spin" /> : <MapPinIcon className="w-5 h-5" />}
                        </button>
                    </div>
                    {params.locationName && (
                        <button 
                            onClick={() => handleSuggestRoute(params.locationName)}
                            disabled={routeSuggesting}
                            className="text-[10px] font-bold text-strand-600 hover:text-strand-900 flex items-center gap-1 mt-1 transition-colors group"
                        >
                            {routeSuggesting ? <RefreshIcon className="w-3 h-3 animate-spin" /> : <SparklesIcon className="w-3 h-3 group-hover:scale-110 transition-transform" />}
                            {routeSuggesting ? 'Scouting Paths...' : 'Expand to Journey (Suggest Route)'}
                        </button>
                    )}
                 </>
             ) : (
                 <div className="space-y-3 bg-strand-50 p-3 rounded-lg border border-strand-200">
                     <div className="flex justify-between items-baseline pl-1">
                        <label className="text-xs font-semibold text-strand-500 uppercase tracking-wider">Route Plan</label>
                        <button type="button" onClick={handleSurpriseLocation} disabled={scoutingRandom} className="text-[10px] text-strand-400 hover:text-strand-700 font-medium flex items-center gap-1 transition-colors">
                             {scoutingRandom ? <RefreshIcon className="w-3 h-3 animate-spin" /> : <DiceIcon className="w-3 h-3" />}
                             {scoutingRandom ? 'Scouting...' : 'Random Route'}
                        </button>
                    </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-strand-400 uppercase tracking-widest pl-1">Start</label>
                        <div className="flex gap-2">
                             <input 
                                value={params.startPoint || ''} 
                                onChange={(e) => onParamChange('startPoint', e.target.value)} 
                                placeholder="e.g. London"
                                className="w-full bg-white border border-strand-300 text-sm rounded-md p-2 focus:ring-1 focus:ring-strand-400 focus:outline-none"
                             />
                             {params.startPoint && (
                                <button 
                                    onClick={() => handleSuggestRoute(params.startPoint || '')}
                                    disabled={routeSuggesting}
                                    title="Suggest Destination & Waypoints"
                                    className={`p-2 rounded border transition-all ${routeSuggesting ? 'bg-strand-100 text-strand-300' : 'bg-white border-strand-300 text-strand-600 hover:bg-strand-100 shadow-sm'}`}
                                >
                                    {routeSuggesting ? <RefreshIcon className="w-4 h-4 animate-spin" /> : <SparklesIcon className="w-4 h-4" />}
                                </button>
                             )}
                        </div>
                     </div>
                     <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-strand-500 uppercase tracking-wider pl-1">Waypoints</label>
                        <div className="flex gap-2">
                            <input value={newWaypoint} onChange={(e) => setNewWaypoint(e.target.value)} placeholder="Add stop..." className="w-full bg-white border border-strand-300 text-xs rounded-md p-2" />
                            <button onClick={addWaypoint} className="text-strand-600 hover:text-strand-900 p-2"><PlusCircleIcon className="w-5 h-5" /></button>
                        </div>
                        {params.waypoints?.length > 0 && (
                            <div className="space-y-1 mt-1">
                                {params.waypoints.map((wp, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-white px-2 py-1 rounded border border-strand-200 text-xs">
                                        <span className="truncate text-strand-700">{wp}</span>
                                        <button onClick={() => removeWaypoint(idx)} className="text-red-300 hover:text-red-500"><TrashIcon className="w-3 h-3" /></button>
                                    </div>
                                ))}
                            </div>
                        )}
                     </div>
                     <StyledInput label="End" placeholder="e.g. Canterbury" value={params.endPoint || ''} onChange={(e) => onParamChange('endPoint', e.target.value)} />
                 </div>
             )}
          </div>

          <div className="flex flex-col gap-1.5">
              <MultiSelect label="Social Setting" options={Object.values(SocialSetting)} value={params.socialSetting || []} onChange={(val) => onParamChange('socialSetting', val)} maxSelections={3} disabled={lockedFields.has('socialSetting')} />
              {lockedFields.has('socialSetting') && <button onClick={() => onUnlockField('socialSetting')} className="text-[10px] text-strand-500 hover:text-strand-800 underline self-end">Unlock</button>}
          </div>

          <div className="flex flex-col gap-1.5">
              <MultiSelect label="Atmospheric Tone" options={Object.values(AtmosphereMode)} value={params.atmosphericTone || []} onChange={(val) => onParamChange('atmosphericTone', val)} maxSelections={3} disabled={lockedFields.has('atmosphericTone')} />
              {lockedFields.has('atmosphericTone') && <button onClick={() => onUnlockField('atmosphericTone')} className="text-[10px] text-strand-500 hover:text-strand-800 underline self-end">Unlock</button>}
          </div>

          <div className="flex flex-col gap-1.5">
              <MultiSelect label="Time Period" options={Object.values(TimePeriodMode)} value={params.timePeriod || []} onChange={(val) => onParamChange('timePeriod', val)} maxSelections={3} disabled={lockedFields.has('timePeriod')} />
              {lockedFields.has('timePeriod') && <button onClick={() => onUnlockField('timePeriod')} className="text-[10px] text-strand-500 hover:text-strand-800 underline self-end">Unlock</button>}
          </div>

          <div className="flex flex-col gap-1.5">
              <MultiSelect label="Tension Level" options={Object.values(TensionLevel)} value={params.tensionLevel || []} onChange={(val) => onParamChange('tensionLevel', val)} maxSelections={1} disabled={lockedFields.has('tensionLevel')} />
              {lockedFields.has('tensionLevel') && <button onClick={() => onUnlockField('tensionLevel')} className="text-[10px] text-strand-500 hover:text-strand-800 underline self-end">Unlock</button>}
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
             <div className="bg-strand-50 p-4 rounded-xl border border-strand-200 space-y-4">
                <div className="flex items-center gap-2 border-b border-strand-200 pb-2">
                    <SparklesIcon className="w-4 h-4 text-strand-600" />
                    <h4 className="text-xs font-bold text-strand-800 uppercase tracking-widest">Focal Points (Optional)</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Focal Theme */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-strand-500 uppercase tracking-wider">Focal Theme</label>
                        <input
                            value={params.focalSpecies || ''}
                            onChange={(e) => onParamChange('focalSpecies', e.target.value)}
                            placeholder="e.g. Betrayal, Memory"
                            className="w-full bg-white border border-strand-300 text-sm rounded-md p-2 focus:ring-1 focus:ring-strand-400 focus:outline-none"
                        />
                    </div>

                    {/* Structure Bias */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-strand-500 uppercase tracking-wider">Structure Bias</label>
                        <select
                            value={params.structureBias || StructureBias.Tight}
                            onChange={(e) => onParamChange('structureBias', e.target.value)}
                            className="w-full bg-white border border-strand-300 text-sm rounded-md p-2 focus:ring-1 focus:ring-strand-400 focus:outline-none"
                        >
                            {Object.values(StructureBias).map(bias => (
                                <option key={bias} value={bias}>{bias}</option>
                            ))}
                        </select>
                    </div>

                    {/* Focal Figure */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-bold text-strand-500 uppercase tracking-wider">Focal Figure (Ghost)</label>
                            <button 
                                type="button" 
                                onClick={handleRandomFigure}
                                disabled={randomizingFigure}
                                className="text-[9px] text-strand-400 hover:text-strand-700"
                            >
                                {randomizingFigure ? <RefreshIcon className="w-2.5 h-2.5 animate-spin" /> : 'Random'}
                            </button>
                        </div>
                        <div className="flex gap-1">
                            <input
                                value={params.focalFigure || ''}
                                onChange={(e) => onParamChange('focalFigure', e.target.value)}
                                placeholder="e.g. John Milton"
                                className="flex-1 bg-white border border-strand-300 text-sm rounded-md p-2 focus:ring-1 focus:ring-strand-400 focus:outline-none"
                            />
                            {params.focalFigure && (
                                <button
                                    type="button"
                                    onClick={handleMapFigureToLocation}
                                    disabled={mappingFigure}
                                    title="Map to Place"
                                    className="p-2 bg-strand-100 text-strand-600 rounded hover:bg-strand-200 transition-colors"
                                >
                                    <MapPinIcon className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Focal Artifact */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-bold text-strand-500 uppercase tracking-wider">Focal Artifact / Work</label>
                            <button 
                                type="button" 
                                onClick={handleRandomArtifact}
                                disabled={randomizingArtifact}
                                className="text-[9px] text-strand-400 hover:text-strand-700"
                            >
                                {randomizingArtifact ? <RefreshIcon className="w-2.5 h-2.5 animate-spin" /> : 'Random'}
                            </button>
                        </div>
                        <input
                            value={params.focalArtifact || ''}
                            onChange={(e) => onParamChange('focalArtifact', e.target.value)}
                            placeholder="e.g. Paradise Lost"
                            className="w-full bg-white border border-strand-300 text-sm rounded-md p-2 focus:ring-1 focus:ring-strand-400 focus:outline-none"
                        />
                    </div>
                </div>

                {/* Contextual Guidance based on Anchor */}
                <div className="bg-strand-800 text-white p-2 rounded text-[10px] animate-pulse">
                    {" The narrative will center on the selected focal points through the lens of this anchor."}
                </div>
             </div>
          </div>
        </div>
        
        {/* Expedition Engine Controls - Only visible in Route Mode */}
        {params.useRouteMode && (
             <div className="bg-strand-800 rounded-xl p-5 shadow-inner border border-strand-900 space-y-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center gap-2 mb-2 border-b border-strand-700 pb-2">
                    <SignalIcon className="w-4 h-4 text-strand-400" />
                    <h4 className="text-[10px] font-bold text-strand-200 uppercase tracking-widest">Expedition Engine Overlays</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                     <StyledSelect 
                        label="Road State" 
                        options={Object.values(RoadState)} 
                        value={params.roadState || RoadState.Cruising} 
                        onChange={(e) => onParamChange('roadState', e.target.value)}
                        className="!bg-strand-900 !text-strand-200 !border-strand-700 !text-[11px]"
                     />
                     <StyledSelect 
                        label="Weather Pressure" 
                        options={Object.values(WeatherPressure)} 
                        value={params.weatherPressure || WeatherPressure.Calm} 
                        onChange={(e) => onParamChange('weatherPressure', e.target.value)}
                        className="!bg-strand-900 !text-strand-200 !border-strand-700 !text-[11px]"
                     />
                     <StyledSelect 
                        label="Fatigue" 
                        options={Object.values(FatigueLevel)} 
                        value={params.fatigue || FatigueLevel.Fresh} 
                        onChange={(e) => onParamChange('fatigue', e.target.value)}
                        className="!bg-strand-900 !text-strand-200 !border-strand-700 !text-[11px]"
                     />
                     <StyledSelect 
                        label="Narrative Temp" 
                        options={Object.values(NarrativeTemp)} 
                        value={params.narrativeTemp || NarrativeTemp.Observational} 
                        onChange={(e) => onParamChange('narrativeTemp', e.target.value)}
                        className="!bg-strand-900 !text-strand-200 !border-strand-700 !text-[11px]"
                     />
                </div>
                <p className="text-[9px] text-strand-400 italic text-center">These state variables will bias the imagery, pacing, and internal resonance of generated seeds.</p>
             </div>
        )}

        {groundingReport && (
            <div className="bg-green-50 border border-green-100 rounded-lg p-3 space-y-3 animate-in fade-in slide-in-from-top-2">
                <div className="flex gap-3 items-start">
                    <SignalIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-green-800 leading-relaxed">
                        <strong className="uppercase tracking-wide text-[10px] text-green-600 block mb-1">
                            {params.useRouteMode ? 'Route Analysis Applied' : 'Ecological Data Applied'}
                        </strong>
                        {groundingReport}
                    </div>
                </div>
                
                {groundingSources.length > 0 && (
                    <div className="pt-2 border-t border-green-200">
                        <span className="text-[9px] font-bold text-green-600 uppercase tracking-widest block mb-1">Search Sources:</span>
                        <div className="flex flex-wrap gap-2">
                            {groundingSources.map((source, idx) => (
                                <a 
                                    key={idx} 
                                    href={source.uri} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-[9px] text-green-700 bg-green-100 hover:bg-green-200 px-2 py-0.5 rounded border border-green-200 flex items-center gap-1 transition-colors"
                                >
                                    <ArrowRightCircleIcon className="w-2 h-2" />
                                    {source.title || "Source"}
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )}

      </div>

      {/* SERIES / ANTHOLOGY MODE */}
      <div className="bg-strand-50 rounded-xl p-6 border border-strand-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <BookOpenIcon className="w-5 h-5 text-strand-700" />
                <h3 className="font-serif text-lg text-strand-800">Series / Anthology Mode</h3>
            </div>
            <button 
                onClick={() => onParamChange('isSeriesMode', !params.isSeriesMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-strand-500 focus:ring-offset-2 ${params.isSeriesMode ? 'bg-strand-800' : 'bg-strand-200'}`}
            >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${params.isSeriesMode ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
        </div>
        
        {params.isSeriesMode ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                <p className="text-xs text-strand-500 leading-relaxed">
                    Generate sequential chapter seeds that form a cohesive narrative arc. The AI will ensure continuity and thematic progression across the batch.
                </p>
                <div className="space-y-3">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-strand-500 uppercase tracking-wider pl-1">Global Narrative Spine</label>
                        <input 
                            value={params.seriesSpine || ''} 
                            onChange={(e) => onParamChange('seriesSpine', e.target.value)} 
                            placeholder="e.g. A 500-mile migration along the Atlantic coast"
                            className="w-full bg-white border border-strand-300 text-sm rounded-md p-3 focus:ring-2 focus:ring-strand-400 focus:outline-none"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-strand-500 uppercase tracking-wider pl-1">Chapter Subjects (Comma Separated)</label>
                        <textarea 
                            value={params.seriesSubjectList || ''} 
                            onChange={(e) => onParamChange('seriesSubjectList', e.target.value)} 
                            placeholder="e.g. Gannet, Razorbill, Grey Seal, Driftwood"
                            rows={2}
                            className="w-full bg-white border border-strand-300 text-sm rounded-md p-3 focus:ring-2 focus:ring-strand-400 focus:outline-none resize-none"
                        />
                        <p className="text-[10px] text-strand-400 italic">One subject will be assigned to each chapter in the sequence.</p>
                    </div>
                </div>
            </div>
        ) : (
            <p className="text-xs text-strand-400 italic">Enable to generate interconnected chapter seeds instead of independent narrative ideas.</p>
        )}
      </div>

      {/* Weather & Season */}
      <div className="space-y-4">
        <h3 className="font-serif text-lg text-strand-800 border-b border-strand-100 pb-2 mb-4">Weather & Season</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <StyledSelect 
                label="Weather Pressure" 
                options={Object.values(WeatherPressure)}
                value={params.weatherPressure || WeatherPressure.Calm}
                onChange={(e) => onParamChange('weatherPressure', e.target.value as WeatherPressure)}
            />
            <MultiSelect 
                label="Atmospheric Tone" 
                options={Object.values(AtmosphereMode)} 
                value={params.atmosphericTone || []} 
                onChange={(val) => onParamChange('atmosphericTone', val)} 
                maxSelections={3}
            />
        </div>
      </div>

      {/* Wildlife & Voice */}
      <div className="space-y-4">
        <div className="flex justify-between items-end border-b border-strand-100 pb-2 mb-4">
            <h3 className="font-serif text-lg text-strand-800">Voice</h3>
            {onTabChange && (
                <button onClick={() => onTabChange('Reference')} className="flex items-center gap-1 text-[10px] text-strand-500 hover:text-strand-800 uppercase tracking-wide font-bold transition-colors">
                    <BookOpenIcon className="w-3 h-3" />
                    View Full Reference
                </button>
            )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="flex flex-col gap-1.5">
              <StyledSelect label="Voice Preset" options={Object.values(VoicePreset)} value={params.voicePreset || VoicePreset.ClassicStrandline} onChange={(e) => onParamChange('voicePreset', e.target.value)} />
              {activeVoiceDetail && (
                <div className="bg-strand-50 border border-strand-100 p-2 rounded text-[10px] text-strand-600 space-y-1">
                   <div><span className="font-bold text-strand-700">Keywords:</span> {activeVoiceDetail.keywords}</div>
                   <div className="italic text-strand-500 border-l-2 border-strand-200 pl-1">"{activeVoiceDetail.effects}"</div>
                </div>
              )}
          </div>
          <div className="flex flex-col gap-1.5">
            <MultiSelect label="Protagonist Mode" options={Object.values(ProtagonistMode)} value={params.protagonistMode || []} onChange={(val) => onParamChange('protagonistMode', val)} maxSelections={3} />
            {lastActiveProtagonist && (
                 <div className="bg-strand-50 border border-strand-100 p-2 rounded text-[10px] text-strand-600 leading-tight">
                    <span className="font-bold text-strand-700">Perspective: </span> {lastActiveProtagonist}
                 </div>
             )}
          </div>
          <div className="flex flex-col gap-1.5">
            <MultiSelect label="Narrative Mode" options={Object.values(NarrativeMode)} value={params.narrativeMode || []} onChange={(val) => onParamChange('narrativeMode', val)} maxSelections={2} />
            {lastActiveNarrative && (
                 <div className="bg-strand-50 border border-strand-100 p-2 rounded text-[10px] text-strand-600 leading-tight">
                    <span className="font-bold text-strand-700">Method: </span> {lastActiveNarrative}
                 </div>
             )}
          </div>
        </div>
      </div>

      {/* Scale & Structure */}
      <div className="space-y-4">
        <h3 className="font-serif text-lg text-strand-800 border-b border-strand-100 pb-2 mb-4">Scale & Structure</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <MultiSelect 
              label="Thematic Focus" 
              options={Object.values(ThematicFocus)} 
              value={params.thematicFocus || []} 
              onChange={(val) => onParamChange('thematicFocus', val)} 
              maxSelections={3}
          />
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-strand-500 uppercase tracking-wider pl-1">Desired Tone</label>
            <select
                value={params.voiceTone || ''}
                onChange={(e) => onParamChange('voiceTone', e.target.value)}
                className="w-full bg-white border border-strand-300 text-strand-800 text-sm rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-strand-400 focus:border-transparent transition-shadow"
            >
                <option value="">Select a tone...</option>
                {Object.values(VoiceTone).map((tone) => (
                    <option key={tone} value={tone}>{tone}</option>
                ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-strand-500 uppercase tracking-wider pl-1">Media Influence</label>
            <input 
                type="text"
                value={params.mediaInfluence || ''}
                onChange={(e) => onParamChange('mediaInfluence', e.target.value)}
                className="w-full bg-white border border-strand-300 text-strand-800 text-sm rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-strand-400 focus:border-transparent transition-shadow"
                placeholder="e.g., Social Media, News Cycle, Viral Trend"
            />
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-strand-500 uppercase tracking-wider pl-1">Seed Count (Max 12)</label>
            <input 
                type="number"
                min={1}
                max={12}
                value={params.seedCount || 3}
                onChange={(e) => {
                    let val = parseInt(e.target.value);
                    if (isNaN(val)) val = 1;
                    if (val > 12) val = 12;
                    if (val < 1) val = 1;
                    onParamChange('seedCount', val);
                }}
                className="w-full bg-white border border-strand-300 text-strand-800 text-sm rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-strand-400 focus:border-transparent transition-shadow"
            />
          </div>
        </div>
      </div>

      <div className="pt-4 flex flex-col items-center gap-4">
        <div className="flex gap-2 w-full max-w-sm">
            <input 
                type="text" 
                placeholder="Blueprint Name" 
                value={blueprintName}
                onChange={(e) => setBlueprintName(e.target.value)}
                className="flex-grow bg-white border border-strand-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-strand-400"
            />
            <button
                onClick={() => {
                    if (blueprintName.trim()) {
                        onSaveBlueprint(blueprintName);
                        setBlueprintName('');
                    } else {
                        alert("Please enter a name for the blueprint.");
                    }
                }}
                className="bg-strand-100 text-strand-800 px-4 py-2 rounded-full text-sm font-bold hover:bg-strand-200 transition-colors"
            >
                Save
            </button>
        </div>
        <button
          onClick={onGenerate}
          disabled={loading}
          className={`flex items-center gap-2 px-8 py-4 rounded-full font-serif font-bold text-lg shadow-xl transition-all transform hover:-translate-y-1 ${loading ? 'bg-strand-200 text-strand-400' : 'bg-strand-800 text-white hover:bg-strand-900 ring-4 ring-white'}`}
        >
          {loading ? <><RefreshIcon className="w-5 h-5 animate-spin" /><span>Cultivating...</span></> : <><SparklesIcon className="w-5 h-5" /><span>Generate Seeds</span></>}
        </button>
        <button
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
          className="text-xs text-strand-400 hover:text-red-500 transition-colors underline"
        >
          Reset Generator (Clear All Settings)
        </button>
      </div>
    </div>
  );
};
