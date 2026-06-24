import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.dps.damanjodi.erp",
  appName: "DPS Damanjodi ERP",
  webDir: "out",
  server: {
    url: "https://dps-damanjodi-erp.vercel.app",
    cleartext: true
  }
};

export default config;
