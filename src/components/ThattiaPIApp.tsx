import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  RefreshCw, Bluetooth, BluetoothOff, Volume2, VolumeX,
  Radio, Loader2, Wifi, WifiOff, Smartphone
} from 'lucide-react';
import SignalGauge from './SignalGauge';
import SignalBar from './SignalBar';
import ControlSlider from './ControlSlider';
import TargetIDBox from './TargetIDBox';
import InfoPanel from './InfoPanel';
import { useBluetooth } from '@/hooks/useBluetooth';

const ThattiaPIApp: React.FC = () => {
  const { signal, isConnected, isConnecting, connect, disconnect, isDemo } = useBluetooth();
  
  const [frequency, setFrequency] = useState(100);
  const [sensitivity, setSensitivity] = useState(80);
  const [offset, setOffset] = useState(0);
  const [groundStability, setGroundStability] = useState(100);
  const [audioEnabled, setAudioEnabled] = useState(true);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Calculate adjusted signal - ESP32 sends values 0-100 typically
  // Apply offset and sensitivity scaling
  const rawAdjusted = Math.max(0, signal - offset);
  // Scale based on sensitivity: higher sensitivity = lower max threshold
  const maxSignal = 100 * (100 / sensitivity);
  const percentage = Math.min(100, Math.max(0, (rawAdjusted / maxSignal) * 100));
  
  // Debug log to verify signal flow
  console.log('Signal:', signal, 'Adjusted:', rawAdjusted, 'Percentage:', percentage);
  
  // Estimate depth based on signal strength
  const estimatedDepth = percentage > 10 ? Math.round(35 - percentage * 0.3) : 0;

  // Audio feedback based on signal strength
  useEffect(() => {
    if (!audioEnabled || percentage < 5) {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current = null;
      }
      return;
    }

    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }

    const ctx = audioCtxRef.current;
    
    if (!oscillatorRef.current) {
      oscillatorRef.current = ctx.createOscillator();
      gainNodeRef.current = ctx.createGain();
      oscillatorRef.current.connect(gainNodeRef.current);
      gainNodeRef.current.connect(ctx.destination);
      oscillatorRef.current.type = 'sine';
      oscillatorRef.current.start();
    }

    // Frequency based on signal (200Hz - 1200Hz)
    const freq = 200 + (percentage * 10);
    oscillatorRef.current.frequency.setValueAtTime(freq, ctx.currentTime);
    
    // Volume based on signal
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setValueAtTime(percentage / 250, ctx.currentTime);
    }

    return () => {
      if (oscillatorRef.current && percentage < 5) {
        oscillatorRef.current.stop();
        oscillatorRef.current = null;
      }
    };
  }, [percentage, audioEnabled]);

  // Simulate ground stability changes
  useEffect(() => {
    if (!isConnected) return;
    
    const interval = setInterval(() => {
      setGroundStability(prev => {
        const change = (Math.random() - 0.5) * 8;
        return Math.max(0, Math.min(100, prev + change));
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isConnected]);

  const handleCalibrate = useCallback(() => {
    setOffset(signal);
    setGroundStability(100);
    
    // Confirmation beep using Web Audio API
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    // Double beep for confirmation
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
    
    // Second beep
    setTimeout(() => {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.frequency.setValueAtTime(1100, ctx.currentTime);
      gain2.gain.setValueAtTime(0.3, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc2.start();
      osc2.stop(ctx.currentTime + 0.15);
    }, 120);
  }, [signal]);

  const toggleAudio = () => {
    setAudioEnabled(prev => !prev);
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current = null;
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 py-6">
      <div className="device-frame">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="logo-badge">
              <Radio className="text-primary-foreground" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black text-foreground tracking-tight">
                THATTIA-PI
              </h1>
              <span className="text-[8px] text-primary font-bold uppercase tracking-[0.15em]">
                Pulse Induction
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={toggleAudio}
              className="control-button"
              aria-label={audioEnabled ? "كتم الصوت" : "تشغيل الصوت"}
            >
              {audioEnabled ? (
                <Volume2 size={18} className="text-primary" />
              ) : (
                <VolumeX size={18} className="text-muted-foreground" />
              )}
            </button>
            
            <button 
              onClick={isConnected ? disconnect : connect}
              disabled={isConnecting}
              className={`bluetooth-button ${
                isConnected ? 'bluetooth-connected' : 'bluetooth-disconnected'
              }`}
            >
              {isConnecting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : isConnected ? (
                <Bluetooth size={18} />
              ) : (
                <BluetoothOff size={18} />
              )}
              <span className="text-xs font-bold">
                {isConnecting ? "جاري..." : isConnected ? "متصل" : "إقران"}
              </span>
            </button>
          </div>
        </div>

        {/* Connection Status */}
        <div className="flex justify-center mb-4">
          <div className={`status-indicator ${
            isConnected ? 'status-connected' : 'status-disconnected'
          }`}>
            {isConnected ? (
              <>
                {isDemo ? <Smartphone size={12} /> : <Wifi size={12} />}
                <span>{isDemo ? 'وضع العرض' : 'ESP32 متصل'}</span>
              </>
            ) : (
              <>
                <WifiOff size={12} />
                <span>غير متصل</span>
              </>
            )}
          </div>
        </div>

        {/* Main Gauge */}
        <SignalGauge percentage={percentage} />

        {/* Horizontal Signal Bar */}
        <SignalBar percentage={percentage} />

        {/* Target ID Box */}
        <TargetIDBox percentage={percentage} rawSignal={signal} />

        {/* Info Panel */}
        <InfoPanel 
          groundStability={groundStability}
          rawSignal={signal}
          depth={estimatedDepth}
        />

        <div className="section-divider" />

        {/* Controls */}
        <div className="space-y-3 mb-5">
          <ControlSlider
            label="الحساسية"
            value={sensitivity}
            min={10}
            max={100}
            unit="%"
            onChange={setSensitivity}
          />
          
          <ControlSlider
            label="التردد"
            value={frequency}
            min={50}
            max={200}
            unit=" Hz"
            onChange={setFrequency}
          />
        </div>

        {/* Calibrate Button */}
        <button 
          onClick={handleCalibrate}
          className="calibrate-button"
          disabled={!isConnected}
        >
          <RefreshCw size={22} />
          معايرة التربة
        </button>

        {/* Footer */}
        <div className="mt-5 text-center">
          <p className="text-[9px] text-muted-foreground">
            v2.1 • Capacitor + BLE
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThattiaPIApp;
