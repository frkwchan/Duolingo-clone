import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const percentage = Math.min(100, Math.max(0, (current / total) * 100));

  return (
    <div className="w-full bg-duo-gray rounded-full h-4 relative overflow-hidden">
      <div 
        className="bg-duo-green h-full rounded-full transition-all duration-500 ease-out relative"
        style={{ width: `${percentage}%` }}
      >
        <div className="absolute top-1 right-2 w-full h-1 bg-white/20 rounded-full"></div>
      </div>
    </div>
  );
};