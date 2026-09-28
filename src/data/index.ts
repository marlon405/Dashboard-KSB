import { useCallback, useEffect, useRef, useState } from "react";
import { REFRESH_MS, WATER_STALE_MS } from "./config";
import { addDays, berlinDate, formatDate, formatTime } from "./dates";
import { fetchFire } from "./fire";
import { fetchWater } from "./water";
import { fetchWeather } from "./weather";
import { failure, success } from "./state";
import type { FireData, SourceState, WaterData, WeatherData } from "./types";

export { berlinDate, formatDate, formatTime };
export { FIRE_CSV_URL, FIRE_REPO_URL, WATER_STATION_UUID, WATER_STATION_NAME, WEATHER_URL, WEATHER_REFERENCE, REFRESH_MS } from "./config";
export type { FireData, WaterData, WeatherData, WeatherDay, SourceState } from "./types";

type Key = "fire" | "water" | "weather";
const empty = <T,>(): SourceState<T> => ({
  data: null, loading: false, error: null, lastSuccess: null, lastFailure: null, stale: false,
});

export function isWaterStale(data: WaterData, now: Date = new Date()): boolean {
  return !data.measuredAt || data.value === null ||
    now.getTime() - Date.parse(data.measuredAt) > WATER_STALE_MS;
}

export function useDashboard(): {
  fire: SourceState<FireData>;
  water: SourceState<WaterData>;
  weather: SourceState<WeatherData>;
  refresh: () => void;
  lastCompiledAt: string | null;
} {
  const [fire, setFire] = useState<SourceState<FireData>>(empty);
  const [water, setWater] = useState<SourceState<WaterData>>(empty);
  const [weather, setWeather] = useState<SourceState<WeatherData>>(empty);
  const [lastCompiledAt, setLastCompiledAt] = useState<string | null>(null);
  const sequence = useRef<Record<Key, number>>({ fire: 0, water: 0, weather: 0 });
  const controllers = useRef<Partial<Record<Key, AbortController>>>({});
  const calendar = useRef(berlinDate());

  const run = useCallback(<T,>(
    key: Key, setter: React.Dispatch<React.SetStateAction<SourceState<T>>>,
    fetcher: (signal: AbortSignal) => Promise<T>, isStale: (data: T) => boolean,
  ) => {
    controllers.current[key]?.abort();
    const controller = new AbortController();
    controllers.current[key] = controller;
    const version = ++sequence.current[key];
    setter((previous) => ({ ...previous, loading: true }));
    void fetcher(controller.signal).then((data) => {
      if (version !== sequence.current[key] || controller.signal.aborted) return;
      const at = new Date().toISOString();
      setter((previous) => success(data, at, isStale(data), previous));
      setLastCompiledAt(at);
    }).catch((reason: unknown) => {
      if (version !== sequence.current[key] || controller.signal.aborted) return;
      const message = reason instanceof Error ? reason.message : "Unbekannter Abruffehler";
      setter((previous) => failure(previous, message, new Date().toISOString()));
    });
  }, []);

  const reloadFire = useCallback(() => {
    const today = berlinDate();
    run("fire", setFire, (signal) => fetchFire(today, signal),
      (data) => data.count === null || data.date !== addDays(berlinDate(), -1));
  }, [run]);
  const reloadWater = useCallback(() => {
    run("water", setWater, fetchWater, isWaterStale);
  }, [run]);
  const reloadWeather = useCallback(() => {
    const today = berlinDate();
    run("weather", setWeather, (signal) => fetchWeather(today, signal),
      (data) => data.days[0]?.date !== berlinDate());
  }, [run]);

  const refresh = useCallback(() => {
    reloadFire();
    reloadWater();
    reloadWeather();
  }, [reloadFire, reloadWater, reloadWeather]);

  useEffect(() => {
    refresh();
    const fireTimer = setInterval(reloadFire, REFRESH_MS.fire);
    const waterTimer = setInterval(reloadWater, REFRESH_MS.water);
    const weatherTimer = setInterval(reloadWeather, REFRESH_MS.weather);
    // A new Berlin calendar day invalidates yesterday's count and the eight-day forecast.
    // This timer checks only local time; the running clock in the UI never triggers requests.
    const dateTimer = setInterval(() => {
      const today = berlinDate();
      if (today !== calendar.current) {
        calendar.current = today;
        setFire((state) => ({ ...state, stale: state.data !== null }));
        setWeather((state) => ({ ...state, stale: state.data !== null }));
        reloadFire();
        reloadWeather();
      }
      setWater((state) =>
        state.data && isWaterStale(state.data) && !state.stale ? { ...state, stale: true } : state);
    }, 30_000);
    return () => {
      [fireTimer, waterTimer, weatherTimer, dateTimer].forEach(clearInterval);
      (Object.keys(controllers.current) as Key[]).forEach((key) => {
        sequence.current[key]++;
        controllers.current[key]?.abort();
      });
    };
  }, [refresh, reloadFire, reloadWater, reloadWeather]);

  return { fire, water, weather, refresh, lastCompiledAt };
}