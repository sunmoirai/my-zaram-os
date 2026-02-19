
import React from 'react';
import { GuideData, Gender } from '../types';
import { Card } from './ui/Card';

interface MonthlyGuideSectionProps {
  months: number;
  guide: GuideData | null;
  loading: boolean;
  gender: Gender;
}

export const MonthlyGuideSection: React.FC<MonthlyGuideSectionProps> = ({ months, guide, loading, gender }) => {
  const isGirl = gender === 'girl';
  const themeColor = isGirl ? 'text-pink-500' : 'text-blue-500';
  const borderTheme = isGirl ? 'border-pink-100' : 'border-blue-100';
  const bgGradient = isGirl ? 'from-pink-50' : 'from-blue-50';

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className={`h-24 ${isGirl ? 'bg-pink-100' : 'bg-blue-100'} rounded-2xl w-full`}></div>
      </div>
    );
  }

  const renderLines = (text?: string) => {
    if (!text) return null;
    return (
      <ul className="space-y-1">
        {text
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line, idx) => (
            <li key={idx} className="text-gray-600 leading-relaxed flex gap-2">
              <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-gray-300 flex-shrink-0" />
              <span>{line.replace(/^•\s?/, '')}</span>
            </li>
          ))}
      </ul>
    );
  };

  return (
    <Card 
      title={`${months}개월 발달 가이드`} 
      icon="✨" 
      className={`bg-gradient-to-br ${bgGradient} to-white ${isGirl ? 'border-pink-100' : 'border-blue-100'}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="flex flex-col gap-1">
          <span className={`font-semibold ${themeColor} flex items-center gap-1`}>🎨 놀이</span>
          {renderLines(guide?.play)}
        </div>
        <div className={`flex flex-col gap-1 border-t md:border-t-0 md:border-l ${borderTheme} pt-3 md:pt-0 md:pl-4`}>
          <span className={`font-semibold ${themeColor} flex items-center gap-1`}>📚 교육</span>
          {renderLines(guide?.education)}
        </div>
        <div className={`flex flex-col gap-1 border-t md:border-t-0 md:border-l ${borderTheme} pt-3 md:pt-0 md:pl-4`}>
          <span className={`font-semibold ${themeColor} flex items-center gap-1`}>🥄 영양</span>
          {renderLines(guide?.nutrition)}
        </div>
      </div>

      {guide?.discipline && (
        <div className={`mt-4 pt-4 border-t ${borderTheme}`}>
          <div className={`font-semibold ${themeColor} flex items-center gap-1 mb-2`}>🧭 훈육/행동</div>
          <div className="text-sm">{renderLines(guide.discipline)}</div>
        </div>
      )}
    </Card>
  );
};
