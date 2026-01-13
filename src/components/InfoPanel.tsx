import React from 'react';
import { Mountain, Ruler } from 'lucide-react';

interface InfoPanelProps {
  groundStability: number;
  rawSignal: number;
  depth: number;
}

const InfoPanel: React.FC<InfoPanelProps> = ({
  groundStability,
  rawSignal,
  depth,
}) => {
  const getStabilityClass = () => {
    if (groundStability > 70) return 'stability-good';
    if (groundStability > 40) return 'stability-medium';
    return 'stability-poor';
  };

  const getStabilityLabel = () => {
    if (groundStability > 70) return 'مستقر';
    if (groundStability > 40) return 'متوسط';
    return 'غير مستقر';
  };

  return (
    <div className="info-grid mb-5">
      <div className="info-item">
        <div className="info-item-label flex items-center gap-1">
          <Mountain size={10} />
          استقرار التربة
        </div>
        <div className="info-item-value flex items-center gap-2">
          <div className={`stability-dot ${getStabilityClass()}`} />
          {groundStability}%
        </div>
        <div className="text-[9px] text-muted-foreground mt-0.5">
          {getStabilityLabel()}
        </div>
      </div>
      
      <div className="info-item">
        <div className="info-item-label flex items-center gap-1">
          <Ruler size={10} />
          العمق التقديري
        </div>
        <div className="info-item-value">
          {depth > 0 ? `${depth} سم` : '—'}
        </div>
        <div className="text-[9px] text-muted-foreground mt-0.5">
          {depth > 0 ? 'تقريبي' : 'لا يوجد هدف'}
        </div>
      </div>
      
      <div className="info-item col-span-2">
        <div className="info-item-label">القراءة الخام</div>
        <div className="info-item-value text-xl">
          {rawSignal.toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default InfoPanel;
