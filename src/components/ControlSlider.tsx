import React from 'react';
import { Plus, Minus } from 'lucide-react';

interface ControlSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  onChange: (value: number) => void;
}

const ControlSlider: React.FC<ControlSliderProps> = ({
  label,
  value,
  min,
  max,
  unit = '',
  onChange,
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  const handleDecrement = () => {
    const step = (max - min) / 20;
    onChange(Math.max(min, value - step));
  };

  const handleIncrement = () => {
    const step = (max - min) / 20;
    onChange(Math.min(max, value + step));
  };

  return (
    <div className="control-card">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
          {label}
        </span>
        <span className="text-sm font-black text-foreground">
          {Math.round(value)}{unit}
        </span>
      </div>
      
      <div className="flex items-center gap-3">
        <button
          onClick={handleDecrement}
          className="control-button"
          aria-label="تقليل"
        >
          <Minus size={16} />
        </button>
        
        <div className="flex-1 slider-track">
          <div 
            className="slider-fill" 
            style={{ width: `${percentage}%` }} 
          />
        </div>
        
        <button
          onClick={handleIncrement}
          className="control-button"
          aria-label="زيادة"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
};

export default ControlSlider;
