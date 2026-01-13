import React from 'react';
import { Crosshair, Circle, Gem, Coins } from 'lucide-react';

interface TargetIDBoxProps {
  percentage: number;
  rawSignal: number;
}

type TargetType = {
  id: string;
  label: string;
  labelEn: string;
  icon: React.ElementType;
  className: string;
};

const TargetIDBox: React.FC<TargetIDBoxProps> = ({ percentage, rawSignal }) => {
  const getTargetType = (): TargetType => {
    if (percentage < 10) {
      return {
        id: 'none',
        label: 'لا يوجد هدف',
        labelEn: 'No Target',
        icon: Crosshair,
        className: 'target-no-target'
      };
    }
    
    // Simulate different metal types based on signal characteristics
    const signalMod = rawSignal % 100;
    
    if (percentage < 35 || signalMod < 25) {
      return {
        id: 'iron',
        label: 'حديد / خردة',
        labelEn: 'Iron / Scrap',
        icon: Circle,
        className: 'target-iron'
      };
    }
    
    if (percentage < 65 || signalMod < 60) {
      return {
        id: 'gold',
        label: 'ذهب / نحاس',
        labelEn: 'Gold / Copper',
        icon: Coins,
        className: 'target-gold'
      };
    }
    
    return {
      id: 'silver',
      label: 'فضة / معدن ثمين',
      labelEn: 'Silver / Precious Metal',
      icon: Gem,
      className: 'target-silver'
    };
  };

  const target = getTargetType();
  const TargetIcon = target.icon;

  return (
    <div className="target-id-box mb-5">
      <div className="target-id-label">تحليل الهدف</div>
      <div className={`target-id-value ${target.className} flex items-center justify-center gap-2`}>
        <TargetIcon size={22} />
        <span>{target.label}</span>
      </div>
      <div className="text-[10px] text-muted-foreground mt-1 font-mono">
        {target.labelEn}
      </div>
    </div>
  );
};

export default TargetIDBox;
