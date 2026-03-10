import React, { useState } from 'react';
import { useTheme, Theme } from '../hooks/useTheme';

const themes: { key: Theme; name: string; colors: string[] }[] = [
  { 
    key: 'default', 
    name: 'Default', 
    colors: ['#FFA564', '#0FCDDC', '#7864EB'] 
  },
  { 
    key: 'dark', 
    name: 'Dark', 
    colors: ['#1a1a1a', '#333333', '#555555'] 
  },
  { 
    key: 'gray', 
    name: 'Gray', 
    colors: ['#6B7280', '#9CA3AF', '#D1D5DB'] 
  },
  { 
    key: 'pastel', 
    name: 'Pastel', 
    colors: ['#FFB3BA', '#BAFFC9', '#BAE1FF'] 
  },
  { 
    key: 'vibrant', 
    name: 'Vibrant', 
    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1'] 
  }
];

export const ThemeToggle: React.FC = () => {
  const { theme, changeTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white/20 backdrop-blur-md rounded-lg p-3 border border-white/30 shadow-xl hover:bg-white/30 transition-colors"
      >
        <div className="flex space-x-1">
          {themes.find(t => t.key === theme)?.colors.map((color, index) => (
            <div
              key={index}
              className="w-4 h-4 rounded-full border border-white/30"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <span className="[font-family:'GRIFTER-Regular',Helvetica] font-normal text-white text-sm drop-shadow-sm">
          {themes.find(t => t.key === theme)?.name}
        </span>
        <svg
          className={`w-4 h-4 text-white transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white/20 backdrop-blur-md rounded-lg border border-white/30 shadow-xl z-50 min-w-[200px]">
          {themes.map((themeOption) => (
            <button
              key={themeOption.key}
              onClick={() => {
                changeTheme(themeOption.key);
                setIsOpen(false);
              }}
              className={`w-full flex items-center space-x-3 p-3 hover:bg-white/20 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                theme === themeOption.key ? 'bg-white/30' : ''
              }`}
            >
              <div className="flex space-x-1">
                {themeOption.colors.map((color, index) => (
                  <div
                    key={index}
                    className="w-4 h-4 rounded-full border border-white/30"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <span className="[font-family:'GRIFTER-Regular',Helvetica] font-normal text-white text-sm drop-shadow-sm">
                {themeOption.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};