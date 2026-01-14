import { useState, useRef, useCallback, useEffect } from 'react';
import { BleClient, dataViewToText } from '@capacitor-community/bluetooth-le';

// ESP32 Service and Characteristic UUIDs
const ESP32_SERVICE_UUID = '0000ffe0-0000-1000-8000-00805f9b34fb';
const ESP32_CHARACTERISTIC_UUID = '0000ffe1-0000-1000-8000-00805f9b34fb';

interface UseBluetoothReturn {
  signal: number;
  isConnected: boolean;
  isConnecting: boolean;
  deviceId: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  isDemo: boolean;
}

export const useBluetooth = (): UseBluetoothReturn => {
  const [signal, setSignal] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const demoIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize BLE on mount
  useEffect(() => {
    const initBle = async () => {
      try {
        await BleClient.initialize();
        console.log('BLE initialized successfully');
      } catch (error) {
        console.log('BLE initialization failed, will use demo mode:', error);
      }
    };
    
    initBle();

    return () => {
      if (demoIntervalRef.current) {
        clearInterval(demoIntervalRef.current);
      }
    };
  }, []);

  const startDemoMode = useCallback(() => {
    setIsDemo(true);
    setIsConnected(true);
    setIsConnecting(false);
    
    demoIntervalRef.current = setInterval(() => {
      setSignal(prev => {
        const change = (Math.random() - 0.3) * 2000;
        return Math.max(0, Math.min(30000, prev + change));
      });
    }, 100);
  }, []);

  const connect = useCallback(async () => {
    if (isConnecting || isConnected) return;
    
    setIsConnecting(true);

    try {
      // Check if we're in a browser without Capacitor
      const isCapacitor = typeof (window as any).Capacitor !== 'undefined';
      
      if (!isCapacitor) {
        // Fallback to Web Bluetooth API for browser testing
        if (navigator.bluetooth) {
          const device = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: [ESP32_SERVICE_UUID]
          });

          const server = await device.gatt?.connect();
          const service = await server?.getPrimaryService(ESP32_SERVICE_UUID);
          const characteristic = await service?.getCharacteristic(ESP32_CHARACTERISTIC_UUID);

          setDeviceId(device.id);
          setIsConnected(true);

          await characteristic?.startNotifications();
          characteristic?.addEventListener('characteristicvaluechanged', (event: any) => {
            const value = new TextDecoder().decode(event.target.value);
            const numValue = parseInt(value.trim());
            if (!isNaN(numValue)) setSignal(numValue);
          });

          device.addEventListener('gattserverdisconnected', () => {
            setIsConnected(false);
            setDeviceId(null);
            setSignal(0);
          });
        } else {
          // Demo mode for unsupported browsers
          startDemoMode();
        }
        return;
      }

      // Capacitor Bluetooth LE
      const isEnabled = await BleClient.isEnabled();
      if (!isEnabled) {
        await BleClient.requestEnable();
      }

      // Request device with modal
      const device = await BleClient.requestDevice({
        services: [ESP32_SERVICE_UUID],
        optionalServices: [],
        namePrefix: '',
      });

      if (!device) {
        throw new Error('No device selected');
      }

      // Connect to device
      await BleClient.connect(device.deviceId, (disconnectedDeviceId) => {
        console.log('Device disconnected:', disconnectedDeviceId);
        setIsConnected(false);
        setDeviceId(null);
        setSignal(0);
      });

      setDeviceId(device.deviceId);

      // Start notifications
      await BleClient.startNotifications(
        device.deviceId,
        ESP32_SERVICE_UUID,
        ESP32_CHARACTERISTIC_UUID,
        (value) => {
          const textValue = dataViewToText(value);
          const numValue = parseInt(textValue.trim());
          if (!isNaN(numValue)) {
            setSignal(numValue);
          }
        }
      );

      setIsConnected(true);
      setIsDemo(false);
      
    } catch (error) {
      console.error('Bluetooth connection error:', error);
      // Fallback to demo mode on error
      startDemoMode();
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting, isConnected, startDemoMode]);

  const disconnect = useCallback(async () => {
    if (demoIntervalRef.current) {
      clearInterval(demoIntervalRef.current);
      demoIntervalRef.current = null;
    }

    if (deviceId) {
      try {
        await BleClient.stopNotifications(
          deviceId,
          ESP32_SERVICE_UUID,
          ESP32_CHARACTERISTIC_UUID
        );
        await BleClient.disconnect(deviceId);
      } catch (error) {
        console.error('Disconnect error:', error);
      }
    }

    setIsConnected(false);
    setDeviceId(null);
    setSignal(0);
    setIsDemo(false);
  }, [deviceId]);

  return {
    signal,
    isConnected,
    isConnecting,
    deviceId,
    connect,
    disconnect,
    isDemo
  };
};
