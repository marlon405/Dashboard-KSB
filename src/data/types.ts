export interface SourceState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastSuccess: string | null;
  lastFailure: string | null;
  stale: boolean;
}

export interface FireData {
  date: string;
  count: number | null;
  latest: { date: string; count: number } | null;
  history: { date: string; count: number | null }[];
}

export interface WaterData {
  station: string;
  uuid: string;
  unit: string;
  value: number | null;
  measuredAt: string | null;
  history: { timestamp: string; value: number | null }[];
}

export interface WeatherDay {
  date: string;
  code: number | null;
  description: string;
  min: number | null;
  max: number | null;
  rainProbability: number | null;
  rain: number | null;
  wind: number | null;
  gusts: number | null;
}

export interface WeatherData {
  days: WeatherDay[];
  reference: string;
}