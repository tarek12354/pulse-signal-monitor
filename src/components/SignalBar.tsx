import React from 'react';

interface SignalBarProps {
  percentage: number;
}

const SignalBar: React.FC<SignalBarProps> = ({ percentage }) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">
          مستوى الإشارة
        </span>
        <span className="text-xs font-bold text-mono text-foreground">
          {Math.round(percentage)}%
        </span>
      </div>
      <div className="signal-bar-container">
        <div 
          className="signal-bar-glow"
          style={{ width: `${percentage}%` }}
        />
        <div 
          className="signal-bar-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default SignalBar;
