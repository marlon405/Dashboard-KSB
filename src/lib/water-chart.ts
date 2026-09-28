/** Presentation-only Berlin calendar-day aggregation. The source history stays raw. */
export interface WaterReading {
  timestamp: string;
  value: number | null;
}

export interface DailyWaterPoint {
  date: string;
  mean: number | null;
  min: number | null;
  max: number | null;
  count: number;
  /** Downward/upward distance from the mean, for a min/max whisker. */
  range: [number, number] | null;
}

export interface WaterSeriesPoint {
  timestamp: string;
  t: number;
  value: number | null;
  min: number | null;
  max: number | null;
  count: number;
}

const HOUR_MS = 3_600_000;

const berlinDayFormat = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit',
});

export function berlinWaterDay(date: Date): string {
  return berlinDayFormat.format(date);
}

/** Exactly seven Berlin calendar dates including today. Unsorted/null readings
 * are safe; missing dates are explicitly null and zero is a valid reading. */
export function aggregateWaterDaily(history: readonly WaterReading[], now: Date = new Date()): DailyWaterPoint[] {
  const today = berlinWaterDay(now);
  const buckets = new Map<string, number[]>();
  for (const item of history) {
    const instant = new Date(item.timestamp);
    if (!Number.isFinite(instant.getTime()) || item.value === null || !Number.isFinite(item.value)) continue;
    const day = berlinWaterDay(instant);
    const values = buckets.get(day) ?? [];
    values.push(item.value);
    buckets.set(day, values);
  }
  const start = new Date(`${today}T12:00:00Z`);
  start.setUTCDate(start.getUTCDate() - 6);
  return Array.from({ length: 7 }, (_, index) => {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() + index);
    const date = d.toISOString().slice(0, 10);
    const values = buckets.get(date) ?? [];
    if (!values.length) return { date, mean: null, min: null, max: null, count: 0, range: null };
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const min = Math.min(...values), max = Math.max(...values);
    return { date, mean, min, max, count: values.length, range: [mean - min, max - mean] };
  });
}

/** Hourly UTC buckets are chronological; the two Berlin hours at DST fallback
 * remain separate. Empty hours become null points, never interpolated readings. */
export function aggregateWaterHourly(history: readonly WaterReading[]): WaterSeriesPoint[] {
  const buckets = new Map<number, number[]>();
  let first = Infinity, last = -Infinity;
  for (const item of history) {
    const time = Date.parse(item.timestamp);
    if (!Number.isFinite(time)) continue;
    const hour = Math.floor(time / HOUR_MS) * HOUR_MS;
    first = Math.min(first, hour);
    last = Math.max(last, hour);
    if (item.value === null || !Number.isFinite(item.value)) continue;
    const values = buckets.get(hour) ?? [];
    values.push(item.value);
    buckets.set(hour, values);
  }
  if (!Number.isFinite(first)) return [];
  const points: WaterSeriesPoint[] = [];
  for (let t = first; t <= last; t += HOUR_MS) {
    const values = buckets.get(t) ?? [];
    points.push({
      t, timestamp: new Date(t).toISOString(), count: values.length,
      value: values.length ? values.reduce((sum, n) => sum + n, 0) / values.length : null,
      min: values.length ? Math.min(...values) : null,
      max: values.length ? Math.max(...values) : null,
    });
  }
  return points;
}

/** Raw readings sorted without mutating source; long missing intervals receive
 * explicit null markers so a line cannot falsely bridge them. */
export function rawWaterSeries(history: readonly WaterReading[]): WaterSeriesPoint[] {
  const sorted = history
    .map((item) => ({ item, t: Date.parse(item.timestamp) }))
    .filter(({ t }) => Number.isFinite(t))
    .sort((a, b) => a.t - b.t)
    .map(({ item, t }): WaterSeriesPoint => {
      const value = item.value !== null && Number.isFinite(item.value) ? item.value : null;
      return { t, timestamp: item.timestamp, value, min: value, max: value, count: value === null ? 0 : 1 };
    });
  const intervals = sorted.slice(1).map((point, i) => point.t - sorted[i].t)
    .filter((delta) => delta > 0).sort((a, b) => a - b);
  const median = intervals[Math.floor(intervals.length / 2)] ?? 0;
  const points: WaterSeriesPoint[] = [];
  sorted.forEach((point, i) => {
    if (i && median > 0 && point.t - sorted[i - 1].t > 3 * median) {
      const t = sorted[i - 1].t + median;
      points.push({ t, timestamp: new Date(t).toISOString(), value: null, min: null, max: null, count: 0 });
    }
    points.push(point);
  });
  return points;
}