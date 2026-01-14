import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.2ed139421fbd4f898d6d9ca6a3492a82',
  appName: 'THATTIA-PI',
  webDir: 'dist',
  server: {
    url: 'https://2ed13942-1fbd-4f89-8d6d-9ca6a3492a82.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    BluetoothLe: {
      displayStrings: {
        scanning: 'جاري البحث...',
        cancel: 'إلغاء',
        availableDevices: 'الأجهزة المتاحة',
        noDeviceFound: 'لم يتم العثور على أجهزة'
      }
    }
  }
};

export default config;
