import React from 'react';

interface SignalGaugeProps {
  percentage: number;
  size?: number;
}

const SignalGauge: React.FC<SignalGaugeProps> = ({ percentage, size = 240 }) => {
  const strokeWidth = 14;
  const radius = (size / 2) - (strokeWidth / 2) - 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * Math.min(percentage, 100)) / 100;

  // Calculate color based on percentage (yellow -> orange -> red)
  const getGaugeColor = () => {
    if (percentage < 33) return '#facc15'; // yellow
    if (percentage < 66) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  return (
    <div className="gauge-container mb-6">
      <svg 
        className="transform -rotate-90" 
        width={size} 
        height={size}
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(0, 0%, 8%)"
          strokeWidth={strokeWidth - 2}
          fill="transparent"
        />
        
        {/* Glow layer */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#gaugeGradient)"
          strokeWidth={strokeWidth + 10}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-100 ease-out"
          style={{ opacity: 0.25, filter: 'blur(10px)' }}
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
          className="transition-all duration-100 ease-out"
        />
        
        {/* Tick marks */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180;
          const innerRadius = radius - 20;
          const outerRadius = radius - 12;
          const x1 = size / 2 + innerRadius * Math.cos(angle);
          const y1 = size / 2 + innerRadius * Math.sin(angle);
          const x2 = size / 2 + outerRadius * Math.cos(angle);
          const y2 = size / 2 + outerRadius * Math.sin(angle);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="hsl(0, 0%, 20%)"
              strokeWidth={i % 3 === 0 ? 2 : 1}
            />
          );
        })}
        
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#facc15" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>
      </svg>
      
      <div className="gauge-value">
        <div 
          className="gauge-value-number"
          style={{ color: getGaugeColor() }}
        >
          {Math.round(percentage)}
        </div>
        <div className="gauge-value-label">SIGNAL</div>
      </div>
    </div>
  );
};

export default SignalGauge;
