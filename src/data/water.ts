import { WATER_BASE_URL, WATER_STATION_NAME, WATER_STATION_UUID } from "./config";
import { finite, getJson, object, timestamp } from "./request";
import type { WaterData } from "./types";

export function parseWater(stationRaw: unknown, currentRaw: unknown, historyRaw: unknown): WaterData {
  const station = object(stationRaw, "Pegelstation");
  if (station.uuid !== WATER_STATION_UUID || station.shortname !== WATER_STATION_NAME)
    throw new Error("Pegelstation stimmt nicht mit BERLIN-KÖPENICK überein");
  const series = station.timeseries;
  if (!Array.isArray(series)) throw new Error("Pegelstation: Messgrößen fehlen");
  const waterLevel = series.find((entry) =>
    entry && typeof entry === "object" && entry.shortname === "W" &&
    entry.longname === "WASSERSTAND ROHDATEN");
  if (!waterLevel || typeof waterLevel.unit !== "string" || !waterLevel.unit.trim())
    throw new Error("Pegelstation: Wasserstand W oder Einheit fehlen");
  const current = object(currentRaw, "Aktueller Wasserstand");
  const measuredAt = current.timestamp == null ? null : timestamp(current.timestamp);
  if (current.timestamp != null && !measuredAt) throw new Error("Pegelstand: ungültige Messzeit");
  const value = current.value == null ? null : finite(current.value);
  if (current.value != null && (value === null || value < 0))
    throw new Error("Pegelstand: ungültiger Messwert");
  if (!Array.isArray(historyRaw)) throw new Error("Pegelstand: Verlauf ist kein Array");
  const history = historyRaw.map((item, index) => {
    const entry = object(item, `Pegelverlauf ${index}`);
    const time = timestamp(entry.timestamp);
    if (!time) throw new Error(`Pegelverlauf: ungültige Messzeit bei Eintrag ${index}`);
    const number = entry.value == null ? null : finite(entry.value);
    if (entry.value != null && (number === null || number < 0))
      throw new Error(`Pegelverlauf: ungültiger Wert bei Eintrag ${index}`);
    return { timestamp: time, value: number };
  }).sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp));
  return {
    station: WATER_STATION_NAME, uuid: WATER_STATION_UUID, unit: waterLevel.unit,
    value, measuredAt, history,
  };
}

export async function fetchWater(signal?: AbortSignal): Promise<WaterData> {
  const [station, current, history] = await Promise.all([
    getJson(`${WATER_BASE_URL}.json?includeTimeseries=true`, signal),
    getJson(`${WATER_BASE_URL}/W/currentmeasurement.json`, signal),
    getJson(`${WATER_BASE_URL}/W/measurements.json?start=P7D`, signal),
  ]);
  return parseWater(station, current, history);
}