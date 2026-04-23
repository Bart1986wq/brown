import React, { useState } from 'react';
import { LocationCalibrationParams, LocationCalibrationResult, VoiceAnalysisResult } from '../types';
import { calibrateNarrativeToLocation } from '../services/geminiService';
import { SparklesIcon, RefreshIcon } from './Icons';

interface LocationCalibrationLabProps {
  voiceProfile: VoiceAnalysisResult;
  groundedLocations: { location: string; reasoning: string }[];
  selectedElements: any; // Simplified for now
}

export const LocationCalibrationLab: React.FC<LocationCalibrationLabProps> = ({
  voiceProfile,
  groundedLocations,
  selectedElements
}) => {
  const [selectedLocation, setSelectedLocation] = useState(groundedLocations[0]);
  const [calibration, setCalibration] = useState<LocationCalibrationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCalibrate = async () => {
    setLoading(true);
    try {
      const result = await calibrateNarrativeToLocation({
        voiceProfile,
        location: selectedLocation,
        selectedElements
      });
      setCalibration(result);
    } catch (e) {
      alert("Calibration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl border border-strand-200 shadow-sm space-y-6">
      <h3 className="text-xl font-serif text-strand-800">Location Calibration Engine</h3>
      
      <div className="space-y-4">
        <label className="block text-sm font-medium text-strand-700">Select Grounded Location to Calibrate Against:</label>
        <select 
          className="w-full p-2 border border-strand-300 rounded-lg"
          onChange={(e) => setSelectedLocation(groundedLocations[parseInt(e.target.value)])}
        >
          {groundedLocations.map((loc, idx) => (
            <option key={idx} value={idx}>{loc.location}</option>
          ))}
        </select>
        
        <button 
          onClick={handleCalibrate}
          disabled={loading}
          className="w-full bg-strand-800 text-white py-2 rounded-lg font-bold hover:bg-strand-900 transition-colors flex items-center justify-center gap-2"
        >
          {loading ? <RefreshIcon className="w-4 h-4 animate-spin" /> : <SparklesIcon className="w-4 h-4" />}
          Calibrate Narrative
        </button>
      </div>

      {calibration && (
        <div className="space-y-4 animate-in fade-in duration-500">
          <div className="p-4 bg-strand-50 rounded-lg border border-strand-200">
            <h4 className="font-bold text-strand-800">Overall Fit Score: {calibration.overallFitScore}</h4>
            <p className="text-sm text-strand-600 mt-1">{calibration.frictionPoints}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white border border-strand-200 rounded-lg">
              <h5 className="font-bold text-strand-800 text-sm">Social Calibration</h5>
              <p className="text-xs text-strand-600 mt-1">{calibration.socialCalibration}</p>
            </div>
            <div className="p-4 bg-white border border-strand-200 rounded-lg">
              <h5 className="font-bold text-strand-800 text-sm">Class & Power</h5>
              <p className="text-xs text-strand-600 mt-1">{calibration.classPowerCalibration}</p>
            </div>
            <div className="p-4 bg-white border border-strand-200 rounded-lg">
              <h5 className="font-bold text-strand-800 text-sm">Institutional Reality</h5>
              <p className="text-xs text-strand-600 mt-1">{calibration.institutionalRealityCheck}</p>
            </div>
            <div className="p-4 bg-white border border-strand-200 rounded-lg">
              <h5 className="font-bold text-strand-800 text-sm">Relational Adjustment</h5>
              <p className="text-xs text-strand-600 mt-1">{calibration.relationalBehaviorAdjustment}</p>
            </div>
          </div>
          
          <div className="p-4 bg-white border border-strand-200 rounded-lg">
              <h5 className="font-bold text-strand-800 text-sm">Conflict Calibration</h5>
              <p className="text-xs text-strand-600 mt-1">{calibration.conflictCalibration}</p>
          </div>
          
          <div className="p-4 bg-white border border-strand-200 rounded-lg">
              <h5 className="font-bold text-strand-800 text-sm">Symbolic Objects</h5>
              <p className="text-xs text-strand-600 mt-1">{calibration.symbolicObjectAdjustment}</p>
          </div>

          <div className="p-4 bg-strand-800 text-white rounded-lg">
            <h5 className="font-bold text-sm">What This Place Naturally Produces</h5>
            <p className="text-xs text-strand-200 mt-1">{calibration.whatThisPlaceNaturallyProduces}</p>
          </div>
        </div>
      )}
    </div>
  );
};
