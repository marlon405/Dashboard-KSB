import { useSyncExternalStore } from 'react';
import { english } from './translations';

export type Language = 'de' | 'en';
export const LANGUAGE_STORAGE_KEY = 'berlin-dashboard.language';
export function readLanguage(storage?: Pick<Storage, 'getItem'>): Language {
  try {
    return (storage ?? (typeof localStorage !== 'undefined' ? localStorage : undefined))?.getItem(LANGUAGE_STORAGE_KEY) === 'en' ? 'en' : 'de';
  } catch {
    return 'de';
  }
}
let language: Language = readLanguage();
const listeners = new Set<() => void>();
export const getLanguage = () => language;
export const getLocale = () => language === 'en' ? 'en-GB' : 'de-DE';
export function setLanguage(next: Language) {
  if (next === language) return;
  language = next;
  if (typeof document !== 'undefined') document.documentElement.lang = next;
  try { localStorage.setItem(LANGUAGE_STORAGE_KEY, next); } catch { /* storage unavailable */ }
  listeners.forEach((listener) => listener());
}
export function useLanguage() {
  const current = useSyncExternalStore(
    (listener) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    getLanguage,
    () => 'de' as Language,
  );
  return { language: current, setLanguage };
}
export function t(german: string): string {
  return language === 'en' ? english[german] ?? german : german;
}
// Errors originate in the data layer and remain German in state; translate them only at presentation.
export function translateError(message: string): string {
  if (language === 'de') return message;
  const patterns: [RegExp, string][] = [
    [/^Feuerwehr-CSV: /, 'Fire service CSV: '], [/^Pegelstation: /, 'Gauge station: '],
    [/^Pegelstation stimmt nicht mit BERLIN-KÖPENICK überein$/, 'Gauge station does not match BERLIN-KÖPENICK'],
    [/^Aktueller Wasserstand: /, 'Current water level: '],
    [/^Pegelstand: /, 'Water level: '], [/^Pegelverlauf: /, 'Gauge history: '],
    [/^Pegelverlauf (\d+): /, 'Gauge history $1: '],
    [/^Wetter: /, 'Weather: '], [/^Wetter-Tagesdaten: /, 'Weather daily data: '],
    [/^Wetter-Einheiten: /, 'Weather units: '], [/^Feuerwehr: /, 'Fire service: '],
    [/^Pegel: /, 'Water gauge: '], [/^Wasserstand: /, 'Water level: '],
    [/^Ungültiges Kalenderdatum: /, 'Invalid calendar date: '],
    [/^Ungültiges Bezugsdatum$/, 'Invalid reference date'],
    [/ungültiges Antwortformat/g, 'invalid response format'],
    [/benötigte Spalten (.*?) fehlen/g, 'required columns $1 are missing'],
    [/ungültige CSV-Struktur/g, 'invalid CSV structure'],
    [/ungültiges Datum /g, 'invalid date '], [/\(leer\)/g, '(empty)'],
    [/ungültige Brandeinsatzzahl am /g, 'invalid fire incident count on '],
    [/widersprüchliche Duplikate am /g, 'conflicting duplicate records on '],
    [/keine gültigen Tagesdaten/g, 'no valid daily data'],
    [/Messgrößen fehlen/g, 'measurements missing'],
    [/Wasserstand W oder Einheit fehlen/g, 'water level W or unit missing'],
    [/ungültige Messzeit bei Eintrag /g, 'invalid measurement time at entry '],
    [/ungültiger Wert bei Eintrag /g, 'invalid value at entry '],
    [/ungültige Messzeit/g, 'invalid measurement time'],
    [/ungültiger Messwert/g, 'invalid reading'],
    [/Verlauf ist kein Array/g, 'history is not an array'],
    [/falsche Zeitzone/g, 'incorrect time zone'],
    [/Tagesdaten oder Datumseinheit fehlen/g, 'daily data or date unit missing'],
    [/unerwartete Einheit für /g, 'unexpected unit for '],
    [/fehlendes oder unterschiedlich langes Array /g, 'missing or mismatched array '],
    [/ungültige oder doppelte Tagesdaten/g, 'invalid or duplicate daily dates'],
    [/ungültiger Wert für /g, 'invalid value for '],
    [/Prognose für (.*?) fehlt/g, 'forecast for $1 missing'],
    [/ungültiger Wettercode am /g, 'invalid weather code on '],
    [/unplausible Tageswerte am /g, 'implausible daily values on '],
  ];
  let result = t(message);
  for (const [pattern, replacement] of patterns) result = result.replace(pattern, replacement);
  return result;
}
export function localizedWeatherDescription(description: string): string {
  if (language === 'de') return description;
  const match = /^Wettercode (\d+) \(nicht zugeordnet\)$/.exec(description);
  return match ? `${t('Wettercode')} ${match[1]} (${t('nicht zugeordnet')})` : t(description);
}
if (typeof document !== 'undefined') document.documentElement.lang = language;