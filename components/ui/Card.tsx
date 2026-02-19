
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = "", title, icon }) => {
  // We detect gender from parents usually via class names or context, 
  // but for simplicity we'll keep the base class flexible.
  return (
    <div className={`bg-white rounded-[20px] p-5 shadow-sm border transition-all duration-500 ${className}`}>
      {title && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">{icon}</span>
          <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
        </div>
      )}
      {children}
    </div>
  );
};
