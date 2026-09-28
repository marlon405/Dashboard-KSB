import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSnow, CloudSun, HelpCircle, Sun, type LucideProps } from 'lucide-react';

/** Symbolzuordnung nach WMO-Wettercodes (Open-Meteo-Dokumentation). */
export function WeatherIcon({ code, ...props }: { code: number | null } & LucideProps) {
  if (code === null) return <HelpCircle {...props} />;
  if (code === 0) return <Sun {...props} />;
  if (code <= 2) return <CloudSun {...props} />;
  if (code === 3) return <Cloud {...props} />;
  if (code === 45 || code === 48) return <CloudFog {...props} />;
  if (code >= 51 && code <= 57) return <CloudDrizzle {...props} />;
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return <CloudRain {...props} />;
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return <CloudSnow {...props} />;
  if (code >= 95) return <CloudLightning {...props} />;
  return <Cloud {...props} />;
}
