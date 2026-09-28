import { berlinDate, type WeatherDay } from '@/data';

/** Tage anhand ihres Datums wählen: heute + exakt die sieben folgenden Kalendertage. */
export function splitForecast(days: WeatherDay[]) {
  const today = berlinDate();
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  return {
    today: sorted.find((d) => d.date === today) ?? null,
    following: sorted.filter((d) => d.date > today).slice(0, 7),
  };
}
