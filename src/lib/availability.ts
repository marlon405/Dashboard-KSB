import { useEffect, useState } from 'react';

/** Frontend-only Verfügbarkeitsverlauf: speichert den Zustand je Quelle für die
 * letzten 24 Stunden in localStorage und liefert 24 Stundenfelder zur Anzeige. */
const HOURS = 24;
const MS = 3_600_000;

export type Bucket = { hour: number; tone: string | null };
type Sample = { t: number; tone: string };

const rank: Record<string, number> = { error: 3, stale: 2, loading: 1, ok: 0 };

function load(key: string): Sample[] {
  try {
    const raw = localStorage.getItem(`ksb.avail.${key}`);
    if (!raw) return [];
    const arr = JSON.parse(raw) as Sample[];
    const cutoff = Date.now() - HOURS * MS;
    return Array.isArray(arr) ? arr.filter((s) => s && typeof s.t === 'number' && s.t >= cutoff) : [];
  } catch {
    return [];
  }
}

function save(key: string, samples: Sample[]) {
  try {
    localStorage.setItem(`ksb.avail.${key}`, JSON.stringify(samples));
  } catch {
    /* Speicher nicht verfügbar – Verlauf bleibt nur im Speicher. */
  }
}

function build(samples: Sample[]): Bucket[] {
  const startHour = Math.floor(Date.now() / MS) - (HOURS - 1);
  const out: Bucket[] = [];
  let last: string | null = null;
  for (let i = 0; i < HOURS; i++) {
    const from = (startHour + i) * MS;
    const inHour = samples.filter((s) => s.t >= from && s.t < from + MS);
    if (inHour.length) {
      last = inHour.reduce((a, b) => ((rank[b.tone] ?? 0) > (rank[a.tone] ?? 0) ? b : a)).tone;
      out.push({ hour: i, tone: last });
    } else {
      out.push({ hour: i, tone: last });
    }
  }
  return out;
}

export function useAvailabilityHistory(key: string, tone: string): Bucket[] {
  const [buckets, setBuckets] = useState<Bucket[]>(() => build(load(key)));

  useEffect(() => {
    if (tone === 'loading') return;
    const samples = load(key);
    samples.push({ t: Date.now(), tone });
    save(key, samples);
    setBuckets(build(samples));
  }, [key, tone]);

  return buckets;
}
