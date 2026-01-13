import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  RefreshCw, Bluetooth, BluetoothOff, Volume2, VolumeX,
  Radio, Loader2, Wifi, WifiOff
} from 'lucide-react';
import SignalGauge from './SignalGauge';
import ControlSlider from './ControlSlider';
import TargetAnalysis from './TargetAnalysis';

// Type definitions for Web Bluetooth API
interface BluetoothDeviceType {
  id: string;
  name?: string;
  gatt?: {
    connected: boolean;
    connect(): Promise<BluetoothGATTServerType>;
    disconnect(): void;
  };
  addEventListener(type: string, listener: () => void): void;
}

interface BluetoothGATTServerType {
  getPrimaryService(service: string): Promise<BluetoothGATTServiceType>;
}

interface BluetoothGATTServiceType {
  getCharacteristic(characteristic: string): Promise<BluetoothGATTCharacteristicType>;
}

interface BluetoothGATTCharacteristicType {
  value?: DataView;
  startNotifications(): Promise<BluetoothGATTCharacteristicType>;
  addEventListener(type: string, listener: (event: Event) => void): void;
}

const ThattiaPIApp: React.FC = () => {
  const [signal, setSignal] = useState(0);
  const [frequency, setFrequency] = useState(100);
  const [sensitivity, setSensitivity] = useState(80);
  const [offset, setOffset] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [groundStability, setGroundStability] = useState(100);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [device, setDevice] = useState<BluetoothDeviceType | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Calculate adjusted signal
  const rawAdjusted = Math.max(0, signal - offset);
  const maxSignal = 30000 / (sensitivity / 100);
  const percentage = Math.min(100, (rawAdjusted / maxSignal) * 100);

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
      gainNodeRef.current.gain.setValueAtTime(percentage / 200, ctx.currentTime);
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
        const change = (Math.random() - 0.5) * 10;
        return Math.max(0, Math.min(100, prev + change));
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isConnected]);

  const connectBluetooth = async () => {
    if (isConnecting) return;
    
    setIsConnecting(true);
    
    try {
      // Check if Web Bluetooth is supported
      if (!navigator.bluetooth) {
        // Demo mode for unsupported browsers
        setIsConnected(true);
        setIsConnecting(false);
        
        // Simulate signal data in demo mode
        const demoInterval = setInterval(() => {
          setSignal(prev => {
            const change = (Math.random() - 0.3) * 2000;
            return Math.max(0, Math.min(30000, prev + change));
          });
        }, 100);
        
        return () => clearInterval(demoInterval);
      }

      const selectedDevice = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['0000ffe0-0000-1000-8000-00805f9b34fb']
      });

      const server = await selectedDevice.gatt?.connect();
      const service = await server?.getPrimaryService('0000ffe0-0000-1000-8000-00805f9b34fb');
      const characteristic = await service?.getCharacteristic('0000ffe1-0000-1000-8000-00805f9b34fb');

      setDevice(selectedDevice);
      setIsConnected(true);

      characteristic?.startNotifications();
      characteristic?.addEventListener('characteristicvaluechanged', (event: Event) => {
        const target = event.target as unknown as BluetoothGATTCharacteristicType;
        if (target.value) {
          const value = new TextDecoder().decode(target.value);
          const numValue = parseInt(value.trim());
          if (!isNaN(numValue)) setSignal(numValue);
        }
      });

      selectedDevice.addEventListener('gattserverdisconnected', () => {
        setIsConnected(false);
        setDevice(null);
        setSignal(0);
      });

    } catch (error) {
      console.error("خطأ في الاتصال:", error);
      
      // Fallback to demo mode on error
      setIsConnected(true);
      const demoInterval = setInterval(() => {
        setSignal(prev => {
          const change = (Math.random() - 0.3) * 2000;
          return Math.max(0, Math.min(30000, prev + change));
        });
      }, 100);
      
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    if (device?.gatt?.connected) {
      device.gatt.disconnect();
    }
    setIsConnected(false);
    setDevice(null);
    setSignal(0);
  };

  const handleCalibrate = useCallback(() => {
    setOffset(signal);
    setGroundStability(100);
    
    // Confirmation beep
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  }, [signal]);

  const toggleAudio = () => {
    setAudioEnabled(prev => !prev);
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current = null;
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 py-8">
      <div className="device-frame">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="logo-badge">
              <Radio className="text-primary-foreground" size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                THATTIA-PI
              </h1>
              <span className="text-[9px] text-primary font-bold uppercase tracking-[0.2em]">
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
              {audioEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            
            <button 
              onClick={isConnected ? disconnect : connectBluetooth}
              disabled={isConnecting}
              className={`bluetooth-button ${
                isConnected 
                  ? 'bluetooth-button-connected' 
                  : 'bluetooth-button-disconnected'
              }`}
            >
              {isConnecting ? (
                <Loader2 size={20} className="animate-spin" />
              ) : isConnected ? (
                <Bluetooth size={20} />
              ) : (
                <BluetoothOff size={20} />
              )}
              <span className="text-[10px] font-bold">
                {isConnecting ? "جاري..." : isConnected ? "متصل" : "إقران"}
              </span>
            </button>
          </div>
        </div>

        {/* Connection Status */}
        <div className="flex justify-center mb-4">
          <div className={`status-badge ${
            isConnected ? 'status-badge-success' : 'status-badge-muted'
          }`}>
            {isConnected ? (
              <span className="flex items-center gap-1">
                <Wifi size={12} /> متصل بالجهاز
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <WifiOff size={12} /> غير متصل
              </span>
            )}
          </div>
        </div>

        {/* Main Gauge */}
        <SignalGauge percentage={percentage} />

        {/* Target Analysis */}
        <TargetAnalysis 
          percentage={percentage}
          groundStability={groundStability}
          rawSignal={signal}
        />

        <div className="section-divider" />

        {/* Controls */}
        <div className="space-y-3 mb-6">
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
          className="primary-action-button text-primary-foreground"
          disabled={!isConnected}
        >
          <RefreshCw size={24} />
          معايرة التربة
        </button>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-[10px] text-muted-foreground">
            الإصدار 2.0 • نظام كشف المعادن بالنبض الحثي
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThattiaPIApp;
