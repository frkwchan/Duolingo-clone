import React from 'react';

interface LanguageCardProps {
  language: string;
  flag: string;
  onClick: () => void;
}

export const LanguageCard: React.FC<LanguageCardProps> = ({ language, flag, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center justify-center p-6 bg-white border-2 border-duo-gray rounded-2xl border-b-4 hover:border-duo-blue active:border-b-2 active:translate-y-[2px] transition-all w-full"
    >
      <span className="text-4xl mb-3">{flag}</span>
      <span className="font-bold text-duo-text text-lg">{language}</span>
    </button>
  );
};