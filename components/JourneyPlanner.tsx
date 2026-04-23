
import React, { useState } from 'react';
import { 
    SeedGeneratorParams, 
    RoadState, 
    WeatherPressure, 
    FatigueLevel, 
    NarrativeTemp,
    BiomeType,
    Seed,
    NarrativeBlueprint
} from '../types';
import { 
    MapIcon, 
    PlusCircleIcon, 
    TrashIcon, 
    SparklesIcon, 
    RefreshIcon, 
    ArrowRightCircleIcon,
    SignalIcon,
    MapPinIcon,
    ClipboardIcon
} from './Icons';
import { suggestRouteFromLocation, generateStrandlineSeeds } from '../services/geminiService';
import { StyledInput, StyledSelect } from './InputGroup';

interface JourneyLeg {
    id: string;
    location: string;
    description: string;
    seed?: Seed;
}

interface JourneyPlannerProps {
    params: SeedGeneratorParams;
    authorMix: any;
    onUpdateParams: (params: SeedGeneratorParams) => void;
    onAddToBook: (title: string, content: string) => void;
    onQuotaExceeded?: () => void;
}

export const JourneyPlanner: React.FC<JourneyPlannerProps> = ({ params, authorMix, onUpdateParams, onAddToBook, onQuotaExceeded }) => {
    const [legs, setLegs] = useState<JourneyLeg[]>([]);
    const [loading, setLoading] = useState(false);
    const [newLegLocation, setNewLegLocation] = useState('');

    const handleAddLeg = () => {
        if (!newLegLocation.trim()) return;
        const newLeg: JourneyLeg = {
            id: Date.now().toString(),
            location: newLegLocation.trim(),
            description: ''
        };
        setLegs([...legs, newLeg]);
        setNewLegLocation('');
    };

    const handleRemoveLeg = (id: string) => {
        setLegs(legs.filter(l => l.id !== id));
    };

    const handleGenerateItinerary = async () => {
        if (!params.startPoint || !params.endPoint) {
            alert("Please set a Start and End point in the Seed Tab first, or use the Scout tool.");
            return;
        }

        setLoading(true);
        try {
            const result = await suggestRouteFromLocation(params.startPoint);
            if (result && !result.error) {
                const newLegs: JourneyLeg[] = [
                    { id: 'start', location: result.startPoint, description: 'Starting point of the traverse.' },
                    ...(result.waypoints || []).map((wp: string, i: number) => ({
                        id: `wp-${i}`,
                        location: wp,
                        description: `Waypoint ${i + 1} on the route.`
                    })),
                    { id: 'end', location: result.endPoint, description: 'Final destination.' }
                ];
                setLegs(newLegs);
            }
        } catch (e: any) {
            if (onQuotaExceeded && (e.message?.includes('429') || e.message?.includes('RESOURCE_EXHAUSTED'))) {
                onQuotaExceeded();
            }
        } finally {
            setLoading(false);
        }
    };

    const handleImportFromParams = () => {
        if (!params.startPoint || !params.endPoint) {
            alert("No route defined in the Seed Tab. Please set a Start and End point first.");
            return;
        }

        const newLegs: JourneyLeg[] = [
            { id: 'start', location: params.startPoint, description: 'Starting point of the traverse.' },
            ...(params.waypoints || []).map((wp: string, i: number) => ({
                id: `wp-${i}`,
                location: wp,
                description: `Waypoint ${i + 1} on the route.`
            })),
            { id: 'end', location: params.endPoint, description: 'Final destination.' }
        ];
        setLegs(newLegs);
    };

    const handleSeedLeg = async (legId: string) => {
        const leg = legs.find(l => l.id === legId);
        if (!leg) return;

        setLoading(true);
        try {
            // Create a temporary param set for this specific leg
            const legParams: SeedGeneratorParams = {
                ...params,
                locationName: leg.location,
                useRouteMode: false,
                seedCount: 1
            };

            const blueprint: NarrativeBlueprint = {
                id: Date.now().toString(),
                name: `Seed for ${leg.location}`,
                authorMix: authorMix,
                params: legParams,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            const seedsJson = await generateStrandlineSeeds(blueprint);
            const seeds: Seed[] = JSON.parse(seedsJson);
            
            if (seeds.length > 0) {
                setLegs(legs.map(l => l.id === legId ? { ...l, seed: seeds[0] } : l));
            }
        } catch (e: any) {
            console.error("Failed to seed leg", e);
        } finally {
            setLoading(false);
        }
    };

    const handleCompileTravelBook = () => {
        if (legs.length === 0) return;
        
        let bookContent = `# Journey Itinerary: ${params.startPoint || 'Untitled'} to ${params.endPoint || 'Untitled'}\n\n`;
        
        legs.forEach((leg, idx) => {
            bookContent += `## Leg ${idx + 1}: ${leg.location}\n`;
            if (leg.seed) {
                bookContent += `**Premise:** ${leg.seed.premise}\n\n`;
                bookContent += `**Motifs:** ${leg.seed.motifs.join(', ')}\n\n`;
                bookContent += `**Tone:** ${leg.seed.toneProfile}\n\n`;
            } else {
                bookContent += `*No seed generated for this leg yet.*\n\n`;
            }
            bookContent += `---\n\n`;
        });

        onAddToBook(`Travel Book: ${params.startPoint || 'Start'} - ${params.endPoint || 'End'}`, bookContent);
    };

    return (
        <div className="space-y-8">
            <div className="bg-strand-100 rounded-xl p-6 border border-strand-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h3 className="font-serif text-xl text-strand-800 flex items-center gap-2">
                            <MapIcon className="w-6 h-6 text-strand-600" />
                            Journey Architecture
                        </h3>
                        <p className="text-sm text-strand-500">Plan multi-location travelogues and complex itineraries.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button 
                            onClick={handleImportFromParams}
                            disabled={loading || (!params.startPoint && !params.endPoint)}
                            className="bg-white border border-strand-300 text-strand-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-strand-50 transition-colors flex items-center gap-2 shadow-sm"
                        >
                            <ClipboardIcon className="w-4 h-4" />
                            Import from Seed Tab
                        </button>
                        <button 
                            onClick={handleGenerateItinerary}
                            disabled={loading}
                            className="bg-white border border-strand-300 text-strand-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-strand-50 transition-colors flex items-center gap-2 shadow-sm"
                        >
                            {loading ? <RefreshIcon className="w-4 h-4 animate-spin" /> : <SparklesIcon className="w-4 h-4" />}
                            Scout Full Route
                        </button>
                        <button 
                            onClick={handleCompileTravelBook}
                            disabled={legs.length === 0}
                            className="bg-strand-800 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-strand-900 transition-colors flex items-center gap-2 shadow-md"
                        >
                            <ArrowRightCircleIcon className="w-4 h-4" />
                            Compile Travel Book
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex gap-2">
                        <input 
                            value={newLegLocation}
                            onChange={(e) => setNewLegLocation(e.target.value)}
                            placeholder="Add a location to the itinerary..."
                            className="flex-1 bg-white border border-strand-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-strand-400 focus:outline-none"
                            onKeyPress={(e) => e.key === 'Enter' && handleAddLeg()}
                        />
                        <button 
                            onClick={handleAddLeg}
                            className="bg-strand-200 text-strand-700 p-2 rounded-lg hover:bg-strand-300 transition-colors"
                        >
                            <PlusCircleIcon className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="space-y-3">
                        {legs.length === 0 && (
                            <div className="text-center py-12 border-2 border-dashed border-strand-200 rounded-xl text-strand-400">
                                <MapPinIcon className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                <p className="font-serif italic">Your itinerary is empty. Add locations or scout a route.</p>
                            </div>
                        )}
                        {legs.map((leg, idx) => (
                            <div key={leg.id} className="bg-white border border-strand-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow group">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-4 items-start">
                                        <div className="w-8 h-8 bg-strand-800 text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <h4 className="font-serif font-bold text-strand-900">{leg.location}</h4>
                                            {leg.seed ? (
                                                <div className="mt-2 space-y-2">
                                                    <p className="text-xs text-strand-700 leading-relaxed italic border-l-2 border-strand-200 pl-3">
                                                        {leg.seed.premise}
                                                    </p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {leg.seed.motifs.map((m, i) => (
                                                            <span key={i} className="text-[9px] bg-strand-50 text-strand-500 px-2 py-0.5 rounded-full border border-strand-100 uppercase tracking-wider">
                                                                {m}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-xs text-strand-400 mt-1 italic">No narrative seed generated for this stop.</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => handleSeedLeg(leg.id)}
                                            disabled={loading}
                                            title="Generate Seed for this Leg"
                                            className="p-2 text-strand-500 hover:text-strand-800 hover:bg-strand-100 rounded-lg transition-colors"
                                        >
                                            <SparklesIcon className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleRemoveLeg(leg.id)}
                                            className="p-2 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* EXPEDITION OVERLAYS (SHARED WITH SEED GEN) */}
            <div className="bg-strand-800 rounded-xl p-6 text-white shadow-xl border border-strand-900">
                <div className="flex items-center gap-2 mb-4 border-b border-strand-700 pb-2">
                    <SignalIcon className="w-5 h-5 text-strand-400" />
                    <h3 className="font-serif text-lg">Global Journey Parameters</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StyledSelect 
                        label="Road State" 
                        options={Object.values(RoadState)} 
                        value={params.roadState || RoadState.Cruising} 
                        onChange={(e) => onUpdateParams({ ...params, roadState: e.target.value as RoadState })}
                        className="!bg-strand-900 !text-strand-200 !border-strand-700"
                    />
                    <StyledSelect 
                        label="Weather Pressure" 
                        options={Object.values(WeatherPressure)} 
                        value={params.weatherPressure || WeatherPressure.Calm} 
                        onChange={(e) => onUpdateParams({ ...params, weatherPressure: e.target.value as WeatherPressure })}
                        className="!bg-strand-900 !text-strand-200 !border-strand-700"
                    />
                    <StyledSelect 
                        label="Fatigue" 
                        options={Object.values(FatigueLevel)} 
                        value={params.fatigue || FatigueLevel.Fresh} 
                        onChange={(e) => onUpdateParams({ ...params, fatigue: e.target.value as FatigueLevel })}
                        className="!bg-strand-900 !text-strand-200 !border-strand-700"
                    />
                    <StyledSelect 
                        label="Narrative Temp" 
                        options={Object.values(NarrativeTemp)} 
                        value={params.narrativeTemp || NarrativeTemp.Observational} 
                        onChange={(e) => onUpdateParams({ ...params, narrativeTemp: e.target.value as NarrativeTemp })}
                        className="!bg-strand-900 !text-strand-200 !border-strand-700"
                    />
                </div>
            </div>
        </div>
    );
};
