
import React from 'react';

interface SliderProps {
  label: string;
  subLabel?: string;
  value: number;
  onChange: (val: number) => void;
  className?: string;
}

export const Slider: React.FC<SliderProps> = ({ label, subLabel, value, onChange, className }) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex justify-between items-end">
        <div>
          <span className="block text-sm font-bold text-strand-800">{label}</span>
          {subLabel && <span className="block text-[10px] text-strand-500 uppercase tracking-wide">{subLabel}</span>}
        </div>
        <span className="text-xs font-mono font-medium text-strand-600 bg-strand-100 px-2 py-0.5 rounded">
          {value}%
        </span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value || 0}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-strand-200 rounded-lg appearance-none cursor-pointer accent-strand-700 hover:accent-strand-600 focus:outline-none focus:ring-2 focus:ring-strand-400 focus:ring-offset-1"
      />
    </div>
  );
};
