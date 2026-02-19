
import React from 'react';
import { Gender } from '../types';

interface HeaderProps {
  months: number;
  onMonthsChange: (months: number) => void;
  gender: Gender;
  onGenderChange: (gender: Gender) => void;
}

export const Header: React.FC<HeaderProps> = ({ months, onMonthsChange, gender, onGenderChange }) => {
  const isGirl = gender === 'girl';

  return (
    <header className={`${isGirl ? 'bg-[#FFC1CC]' : 'bg-[#A2D2FF]'} pt-6 pb-10 px-6 rounded-b-[40px] shadow-sm sticky top-0 z-40 transition-colors duration-500`}>
      {/* Gender Selector Toggle */}
      <div className="flex justify-end mb-4">
        <div className="bg-black/10 p-1 rounded-full flex gap-1">
          <button 
            onClick={() => onGenderChange('girl')}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isGirl ? 'bg-white shadow-md scale-110' : 'opacity-50'}`}
          >
            👧
          </button>
          <button 
            onClick={() => onGenderChange('boy')}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${!isGirl ? 'bg-white shadow-md scale-110' : 'opacity-50'}`}
          >
            👦
          </button>
        </div>
      </div>

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white drop-shadow-sm">자람이</h1>
          <p className="text-white/90 text-sm mt-1">우리 아이 성장 다이어리</p>
        </div>
        <div className="bg-white/30 backdrop-blur-md rounded-2xl p-3 flex flex-col items-end">
          <span className="text-xs font-bold text-white uppercase tracking-wider mb-1">아이 개월수</span>
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              value={months} 
              onChange={(e) => onMonthsChange(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-14 bg-white/20 border-none text-white text-2xl font-bold text-right focus:outline-none rounded-lg p-1"
            />
            <span className="text-white text-xl font-bold">개월</span>
          </div>
        </div>
      </div>
    </header>
  );
};
