import React from 'react';
import { Activity, Zap, ShieldAlert, Binary } from 'lucide-react';

interface TargetAnalysisProps {
  percentage: number;
  groundStability: number;
  rawSignal: number;
}

const TargetAnalysis: React.FC<TargetAnalysisProps> = ({
  percentage,
  groundStability,
  rawSignal,
}) => {
  const getTargetType = () => {
    if (percentage < 10) return { text: "لا يوجد هدف", icon: Binary, color: "text-muted-foreground" };
    if (percentage < 30) return { text: "معدن صغير", icon: Activity, color: "text-primary" };
    if (percentage < 60) return { text: "معدن متوسط", icon: Zap, color: "text-accent" };
    return { text: "هدف كبير!", icon: ShieldAlert, color: "text-success" };
  };

  const target = getTargetType();
  const TargetIcon = target.icon;

  return (
    <div className="mb-6">
      {/* Target Type Indicator */}
      <div className="flex justify-center mb-6">
        <div className="target-indicator">
          <TargetIcon size={18} className={target.color} />
          <span className={`font-bold ${target.color}`}>{target.text}</span>
        </div>
      </div>

      {/* Info Grid */}
      <div className="info-grid">
        <div className="info-item">
          <div className="info-item-label">استقرار التربة</div>
          <div className="info-item-value flex items-center gap-2">
            <div 
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: groundStability > 70 
                  ? 'hsl(var(--success))' 
                  : groundStability > 40 
                    ? 'hsl(var(--primary))' 
                    : 'hsl(var(--destructive))'
              }}
            />
            {groundStability}%
          </div>
        </div>
        
        <div className="info-item">
          <div className="info-item-label">القراءة الخام</div>
          <div className="info-item-value">{rawSignal}</div>
        </div>
        
        <div className="info-item">
          <div className="info-item-label">نوع المعدن</div>
          <div className="info-item-value text-sm">
            {percentage > 50 ? "حديدي" : percentage > 20 ? "غير حديدي" : "—"}
          </div>
        </div>
        
        <div className="info-item">
          <div className="info-item-label">العمق التقديري</div>
          <div className="info-item-value text-sm">
            {percentage > 10 ? `${Math.round(30 - percentage * 0.25)} سم` : "—"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TargetAnalysis;
