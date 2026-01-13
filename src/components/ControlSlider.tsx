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
  const step = (max - min) / 10;

  const handleDecrement = () => {
    onChange(Math.max(min, value - step));
  };

  const handleIncrement = () => {
    onChange(Math.min(max, value + step));
  };

  return (
    <div className="control-card">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.15em]">
          {label}
        </span>
        <span className="text-sm font-black text-foreground text-mono">
          {Math.round(value)}{unit}
        </span>
      </div>
      
      <div className="flex items-center gap-3">
        <button
          onClick={handleDecrement}
          className="control-button"
          aria-label="تقليل"
        >
          <Minus size={18} className="text-muted-foreground" />
        </button>
        
        <div className="slider-track">
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
          <Plus size={18} className="text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};

export default ControlSlider;
