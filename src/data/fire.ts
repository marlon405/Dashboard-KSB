import Papa from "papaparse";
import { addDays, isDate } from "./dates";
import { FIRE_CSV_URL } from "./config";
import { getText } from "./request";
import type { FireData } from "./types";

export function parseFire(csv: string, today: string): FireData {
  const yesterday = addDays(today, -1);
  const parsed = Papa.parse<Record<string, string>>(csv.replace(/^\uFEFF/, ""), {
    header: true, skipEmptyLines: "greedy", transformHeader: (name) => name.trim(),
  });
  if (!parsed.meta.fields?.includes("mission_created_date") ||
      !parsed.meta.fields.includes("mission_count_fire"))
    throw new Error("Feuerwehr-CSV: benötigte Spalten mission_created_date oder mission_count_fire fehlen");
  if (parsed.errors.length) throw new Error(`Feuerwehr-CSV: ungültige CSV-Struktur (${parsed.errors[0].message})`);

  const byDate = new Map<string, number>();
  for (const row of parsed.data) {
    const date = row.mission_created_date?.trim();
    const raw = row.mission_count_fire?.trim();
    if (!date || !isDate(date)) throw new Error(`Feuerwehr-CSV: ungültiges Datum ${date || "(leer)"}`);
    if (!raw || !/^\d+$/.test(raw) || !Number.isSafeInteger(Number(raw)))
      throw new Error(`Feuerwehr-CSV: ungültige Brandeinsatzzahl am ${date}`);
    const count = Number(raw);
    if (byDate.has(date) && byDate.get(date) !== count)
      throw new Error(`Feuerwehr-CSV: widersprüchliche Duplikate am ${date}`);
    byDate.set(date, count); // Identical duplicate rows do not inflate counts.
  }
  if (!byDate.size) throw new Error("Feuerwehr-CSV: keine gültigen Tagesdaten");
  const latestDate = [...byDate.keys()].filter((date) => date <= yesterday).sort().at(-1);
  return {
    date: yesterday,
    count: byDate.get(yesterday) ?? null,
    latest: latestDate ? { date: latestDate, count: byDate.get(latestDate)! } : null,
    history: Array.from({ length: 14 }, (_, index) => {
      const date = addDays(yesterday, index - 13);
      return { date, count: byDate.get(date) ?? null };
    }),
  };
}

export async function fetchFire(today: string, signal?: AbortSignal): Promise<FireData> {
  return parseFire(await getText(FIRE_CSV_URL, signal), today);
}