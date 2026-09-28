import { WEATHER_REFERENCE, WEATHER_URL } from "./config";
import { addDays, isDate } from "./dates";
import { finite, getJson, object } from "./request";
import type { WeatherData, WeatherDay } from "./types";

const codes: Record<number, string> = {
  0: "Klarer Himmel", 1: "Überwiegend klar", 2: "Teilweise bewölkt", 3: "Bedeckt",
  45: "Nebel", 48: "Raureifnebel", 51: "Leichter Nieselregen",
  53: "Mäßiger Nieselregen", 55: "Starker Nieselregen",
  56: "Leichter gefrierender Nieselregen", 57: "Starker gefrierender Nieselregen",
  61: "Leichter Regen", 63: "Mäßiger Regen", 65: "Starker Regen",
  66: "Leichter gefrierender Regen", 67: "Starker gefrierender Regen",
  71: "Leichter Schneefall", 73: "Mäßiger Schneefall", 75: "Starker Schneefall",
  77: "Schneegriesel", 80: "Leichte Regenschauer", 81: "Mäßige Regenschauer",
  82: "Heftige Regenschauer", 85: "Leichte Schneeschauer", 86: "Starke Schneeschauer",
  95: "Gewitter", 96: "Gewitter mit leichtem Hagel", 99: "Gewitter mit starkem Hagel",
};

export function weatherDescription(code: number | null): string {
  return code === null ? "Keine Angabe" : codes[code] ?? `Wettercode ${code} (nicht zugeordnet)`;
}

const fields = {
  code: ["weather_code", "wmo code"],
  min: ["temperature_2m_min", "°C"],
  max: ["temperature_2m_max", "°C"],
  rainProbability: ["precipitation_probability_max", "%"],
  rain: ["precipitation_sum", "mm"],
  wind: ["wind_speed_10m_max", "km/h"],
  gusts: ["wind_gusts_10m_max", "km/h"],
} as const;

export function parseWeather(raw: unknown, today: string): WeatherData {
  if (!isDate(today)) throw new Error("Ungültiges Bezugsdatum");
  const root = object(raw, "Wetter");
  if (root.timezone !== "Europe/Berlin") throw new Error("Wetter: falsche Zeitzone");
  const daily = object(root.daily, "Wetter-Tagesdaten");
  const units = object(root.daily_units, "Wetter-Einheiten");
  if (units.time !== "iso8601" || !Array.isArray(daily.time))
    throw new Error("Wetter: Tagesdaten oder Datumseinheit fehlen");
  for (const [key, unit] of Object.values(fields)) {
    if (units[key] !== unit) throw new Error(`Wetter: unerwartete Einheit für ${key}`);
    if (!Array.isArray(daily[key]) || daily[key].length !== daily.time.length)
      throw new Error(`Wetter: fehlendes oder unterschiedlich langes Array ${key}`);
  }
  const positions = new Map<string, number>();
  daily.time.forEach((day, index) => {
    if (typeof day !== "string" || !isDate(day) || positions.has(day))
      throw new Error("Wetter: ungültige oder doppelte Tagesdaten");
    positions.set(day, index);
  });
  const value = (key: string, index: number): number | null => {
    const rawValue = (daily[key] as unknown[])[index];
    if (rawValue == null) return null;
    const number = finite(rawValue);
    if (number === null) throw new Error(`Wetter: ungültiger Wert für ${key}`);
    return number;
  };
  const days: WeatherDay[] = Array.from({ length: 8 }, (_, offset) => {
    const date = addDays(today, offset);
    const index = positions.get(date);
    if (index === undefined) throw new Error(`Wetter: Prognose für ${date} fehlt`);
    const code = value("weather_code", index);
    if (code !== null && (!Number.isInteger(code) || code < 0)) throw new Error(`Wetter: ungültiger Wettercode am ${date}`);
    const min = value("temperature_2m_min", index);
    const max = value("temperature_2m_max", index);
    const rainProbability = value("precipitation_probability_max", index);
    const rain = value("precipitation_sum", index);
    const wind = value("wind_speed_10m_max", index);
    const gusts = value("wind_gusts_10m_max", index);
    if ((min !== null && max !== null && min > max) ||
        (rainProbability !== null && (rainProbability < 0 || rainProbability > 100)) ||
        [rain, wind, gusts].some((n) => n !== null && n < 0))
      throw new Error(`Wetter: unplausible Tageswerte am ${date}`);
    return { date, code, description: weatherDescription(code), min, max, rainProbability, rain, wind, gusts };
  });
  return { days, reference: WEATHER_REFERENCE };
}

export async function fetchWeather(today: string, signal?: AbortSignal): Promise<WeatherData> {
  return parseWeather(await getJson(WEATHER_URL, signal), today);
}