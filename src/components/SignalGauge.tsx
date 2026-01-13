import React from 'react';

interface SignalGaugeProps {
  percentage: number;
  size?: number;
}

const SignalGauge: React.FC<SignalGaugeProps> = ({ percentage, size = 256 }) => {
  const strokeWidth = 16;
  const radius = (size / 2) - (strokeWidth / 2) - 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * Math.min(percentage, 100)) / 100;

  return (
    <div className="gauge-container mb-8">
      <svg 
        className="transform -rotate-90" 
        width={size} 
        height={size}
        style={{ filter: 'drop-shadow(0 0 20px hsl(45, 93%, 53%, 0.3))' }}
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(0, 0%, 10%)"
          strokeWidth={strokeWidth - 4}
          fill="transparent"
        />
        
        {/* Glow effect */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#gaugeGradient)"
          strokeWidth={strokeWidth + 8}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-150 ease-out"
          style={{ opacity: 0.3, filter: 'blur(8px)' }}
        />
        
        {/* Main arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#gaugeGradient)"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-150 ease-out"
        />
        
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(45, 93%, 53%)" />
            <stop offset="100%" stopColor="hsl(24, 95%, 53%)" />
          </linearGradient>
        </defs>
      </svg>
      
      <div className="gauge-value">
        <div className="gauge-value-number">
          {Math.round(percentage)}
        </div>
        <div className="gauge-value-label">SIGNAL %</div>
      </div>
    </div>
  );
};

export default SignalGauge;
