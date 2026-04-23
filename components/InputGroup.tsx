import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: string[] | number[];
}

export const StyledSelect: React.FC<SelectProps> = ({ label, options, className, ...props }) => {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-strand-500 uppercase tracking-wider pl-1">
        {label}
      </label>
      <div className="relative">
        <select
          {...props}
          className={`appearance-none w-full bg-white border border-strand-300 text-strand-800 text-sm rounded-md p-3 pr-8 focus:outline-none focus:ring-2 focus:ring-strand-400 focus:border-transparent transition-shadow ${className}`}
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-strand-500">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const StyledInput: React.FC<InputProps> = ({ label, className, ...props }) => {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-strand-500 uppercase tracking-wider pl-1">
        {label}
      </label>
      <input
        {...props}
        className={`w-full bg-white border border-strand-300 text-strand-800 text-sm rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-strand-400 focus:border-transparent transition-shadow placeholder-strand-300 ${className}`}
      />
    </div>
  );
};
