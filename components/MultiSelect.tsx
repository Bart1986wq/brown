
import React, { useState, useRef, useEffect } from 'react';

interface MultiSelectProps {
  label: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  maxSelections?: number;
  disabled?: boolean;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  value = [],
  onChange,
  maxSelections = 3,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const safeValue = Array.isArray(value) ? value : [];

  const toggleOption = (option: string) => {
    if (disabled) return;
    if (safeValue.includes(option)) {
      onChange(safeValue.filter(v => v !== option));
    } else {
      if (safeValue.length < maxSelections) {
        onChange([...safeValue, option]);
      }
    }
  };

  return (
    <div className="flex flex-col gap-1.5" ref={containerRef}>
      <label className="text-xs font-semibold text-strand-500 uppercase tracking-wider pl-1 flex justify-between">
        <span>{label}</span>
        <div className="flex gap-2">
          {safeValue.length > 0 && !disabled && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-[10px] text-red-500 hover:text-red-700 font-bold uppercase tracking-widest"
            >
              Clear
            </button>
          )}
          <span className="text-[10px] font-normal text-strand-400 normal-case tracking-normal">Max {maxSelections}</span>
        </div>
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`w-full bg-white border border-strand-300 text-strand-800 text-sm rounded-md p-3 pr-8 text-left focus:outline-none focus:ring-2 focus:ring-strand-400 focus:border-transparent transition-shadow min-h-[46px] relative ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {safeValue.length === 0 ? (
            <span className="text-strand-400">Select options...</span>
          ) : (
            <span className="block truncate pr-4">{safeValue.join(', ')}</span>
          )}
           <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-strand-500">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
            </div>
        </button>

        {isOpen && !disabled && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-strand-200 rounded-md shadow-lg max-h-60 overflow-auto">
            {options.map((opt) => {
              const isSelected = safeValue.includes(opt);
              const isDisabled = !isSelected && safeValue.length >= maxSelections;
              return (
                <div
                  key={opt}
                  className={`flex items-center px-4 py-2 cursor-pointer transition-colors ${
                    isDisabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:bg-strand-50'
                  }`}
                  onClick={() => !isDisabled && toggleOption(opt)}
                >
                  <div className={`
                    w-4 h-4 rounded border flex items-center justify-center mr-3 flex-shrink-0 transition-colors
                    ${isSelected ? 'bg-strand-600 border-strand-600' : 'border-strand-300 bg-white'}
                  `}>
                    {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                  </div>
                  <span className={`text-sm ${isSelected ? 'text-strand-900 font-medium' : 'text-strand-600'}`}>
                    {opt}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
