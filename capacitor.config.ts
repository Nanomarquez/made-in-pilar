import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.madeinpilar.app',
  appName: 'madeinpilar',
  webDir: 'out',
  server: {
    cleartext: true,
    allowNavigation: ["made-in-pilar-swfo.vercel.app"], // Permitir navegación a tu dominio
  },
};

export default config;
