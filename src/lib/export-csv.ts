import type { ViewId } from "../components/dashboard/sidebar";
import type { useDashboard } from "../data";
import { FIRE_CSV_URL, FIRE_REPO_URL, WATER_BASE_URL, WEATHER_URL } from "../data/config";
import { berlinDate } from "../data/dates";
import type { SourceState } from "../data/types";

type Dashboard = ReturnType<typeof useDashboard>;
export type CsvCell = string | number | null | undefined;
export type CsvRows = CsvCell[][];

const metadata = [
  "Letzter erfolgreicher Abruf", "Letzter Fehler", "Fehlermeldung", "Veraltet", "Status", "URL",
];

function status(state: SourceState<unknown>): string {
  if (state.error && state.data !== null) return "Veraltet (Abruffehler)";
  if (state.error) return "Fehler";
  if (state.stale) return "Veraltet";
  if (state.data !== null) return "Aktuell";
  if (state.loading) return "Wird geladen";
  return "Keine Daten";
}

function meta(state: SourceState<unknown>, url: string): CsvCell[] {
  return [state.lastSuccess, state.lastFailure, state.error, state.stale ? "Ja" : "Nein", status(state), url];
}

const sources = [
  { key: "weather", name: "Open-Meteo", url: WEATHER_URL },
  { key: "fire", name: "Berliner Feuerwehr", url: FIRE_CSV_URL },
  { key: "water", name: "PEGELONLINE · BERLIN-KÖPENICK", url: `${WATER_BASE_URL}/W/currentmeasurement.json` },
] as const;

/** Produces rows (including the German header) from the currently normalized dashboard state. */
export function buildExportRows(view: ViewId, d: Dashboard): CsvRows {
  if (view === "weather") {
    const header = ["Quelle", "Datum", "Wettercode", "Beschreibung", "Minimum (°C)", "Maximum (°C)",
      "Regenwahrscheinlichkeit (%)", "Niederschlag (mm)", "Wind (km/h)", "Böen (km/h)", "Referenz", ...metadata];
    const days = d.weather.data?.days ?? [];
    return [header, ...days.map((day) => [
      "Open-Meteo", day.date, day.code, day.description, day.min, day.max,
      day.rainProbability, day.rain, day.wind, day.gusts, d.weather.data?.reference,
      ...meta(d.weather, WEATHER_URL),
    ]), ...(!days.length ? [["Open-Meteo", ...Array(10).fill(null), ...meta(d.weather, WEATHER_URL)]] : [])];
  }

  if (view === "fire") {
    const header = ["Quelle", "Datentyp", "Datum", "Brandeinsätze", ...metadata];
    const state = d.fire;
    const data = state.data;
    return [header,
      ["Berliner Feuerwehr", "Vortag (Zieldatum)", data?.date, data?.count, ...meta(state, FIRE_CSV_URL)],
      ...(data?.latest ? [["Berliner Feuerwehr", "Letzter verfügbarer Tag", data.latest.date, data.latest.count, ...meta(state, FIRE_CSV_URL)]] : []),
      ...(data?.history ?? []).map((item) =>
        ["Berliner Feuerwehr", "Verlauf", item.date, item.count, ...meta(state, FIRE_CSV_URL)]),
    ];
  }

  if (view === "water") {
    const header = ["Quelle", "Datentyp", "Station", "Stations-UUID", "Messzeitpunkt", "Wasserstand",
      "Einheit", ...metadata];
    const state = d.water;
    const data = state.data;
    return [header,
      ["PEGELONLINE", "Aktueller Messwert", data?.station, data?.uuid, data?.measuredAt,
        data?.value, data?.unit, ...meta(state, `${WATER_BASE_URL}/W/currentmeasurement.json`)],
      ...(data?.history ?? []).map((item) =>
        ["PEGELONLINE", "Verlauf", data?.station, data?.uuid, item.timestamp,
          item.value, data?.unit, ...meta(state, `${WATER_BASE_URL}/W/measurements.json?start=P7D`)]),
    ];
  }

  if (view === "sources") {
    const header = ["Quelle", "Datentyp", "URL", "Letzter erfolgreicher Abruf",
      "Letzter Fehler", "Fehlermeldung", "Veraltet", "Status"];
    const links = [
      { key: "weather", name: "Open-Meteo", urls: [
        ["Prognose-Endpunkt", WEATHER_URL], ["Dokumentation", "https://open-meteo.com/en/docs"],
      ] },
      { key: "fire", name: "Berliner Feuerwehr", urls: [
        ["CSV-Endpunkt", FIRE_CSV_URL], ["Projektseite", FIRE_REPO_URL],
      ] },
      { key: "water", name: "PEGELONLINE · BERLIN-KÖPENICK", urls: [
        ["Stations-Endpunkt", `${WATER_BASE_URL}.json?includeTimeseries=true`],
        ["Aktueller Messwert", `${WATER_BASE_URL}/W/currentmeasurement.json`],
        ["Verlauf", `${WATER_BASE_URL}/W/measurements.json?start=P7D`],
        ["Dokumentation", "https://www.pegelonline.wsv.de/webservice/dokuRestapi"],
      ] },
    ] as const;
    return [header, ...links.flatMap(({ key, name, urls }) => urls.map(([kind, url]) => {
      const state = d[key];
      return [name, kind, url, state.lastSuccess, state.lastFailure, state.error,
        state.stale ? "Ja" : "Nein", status(state)];
    }))];
  }

  if (view === "overview") {
    const header = ["Quelle", "Datentyp", "Datum", "Messgröße", "Wert", "Einheit", ...metadata];
    const rows: CsvRows = [header];
    const add = (name: string, type: string, date: CsvCell, measure: string, value: CsvCell,
      unit: string, state: SourceState<unknown>, url: string) => {
      rows.push([name, type, date, measure, value, unit, ...meta(state, url)]);
    };
    for (const { key, name, url } of sources) {
      const state = d[key];
      if (!state.data || (key === "weather" && d.weather.data?.days.length === 0))
        add(name, "Quellenstatus", null, "Keine Daten", null, "", state, url);
    }
    if (d.fire.data) {
      add("Berliner Feuerwehr", "Vortag", d.fire.data.date, "Brandeinsätze",
        d.fire.data.count, "Einsätze", d.fire, FIRE_CSV_URL);
      if (d.fire.data.latest) add("Berliner Feuerwehr", "Letzter verfügbarer Tag",
        d.fire.data.latest.date, "Brandeinsätze", d.fire.data.latest.count, "Einsätze", d.fire, FIRE_CSV_URL);
    }
    if (d.water.data) {
      add(`PEGELONLINE · ${d.water.data.station}`, "Aktueller Messwert", d.water.data.measuredAt,
        "Wasserstand", d.water.data.value, d.water.data.unit, d.water,
        `${WATER_BASE_URL}/W/currentmeasurement.json`);
    }
    if (d.weather.data) {
      for (const day of d.weather.data.days) {
        for (const [measure, value, unit] of [
          ["Wettercode", day.code, "WMO-Code"], ["Beschreibung", day.description, ""],
          ["Minimum", day.min, "°C"], ["Maximum", day.max, "°C"],
          ["Regenwahrscheinlichkeit", day.rainProbability, "%"], ["Niederschlag", day.rain, "mm"],
          ["Wind", day.wind, "km/h"], ["Böen", day.gusts, "km/h"],
        ] as const) add("Open-Meteo", "Tagesprognose", day.date, measure, value, unit, d.weather, WEATHER_URL);
      }
    }
    return rows;
  }

  throw new Error(`Unbekannte Dashboard-Ansicht: ${view}`);
}

/** UTF-8 BOM, semicolon-separated German Excel CSV with CRLF and spreadsheet-safe text. */
export function serializeCsv(rows: CsvRows): string {
  return "\uFEFF" + rows.map((row) => row.map((cell) => {
    if (cell == null) return "";
    if (typeof cell === "number") {
      if (!Number.isFinite(cell)) throw new Error("Ungültiger numerischer CSV-Wert");
      return String(cell);
    }
    const safe = /^[\u0000-\u0020\u007f-\u009f\uFEFF]*[=+\-@]/u.test(cell) ? `'${cell}` : cell;
    return /[;"\r\n]/u.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  }).join(";")).join("\r\n") + "\r\n";
}

/** Initiates a download from a user click; no credentials or browser state are serialized. */
export function exportDashboardCsv(view: ViewId, d: Dashboard): void {
  const names: Record<ViewId, string> = {
    overview: "Übersicht", weather: "Wetter", fire: "Feuerwehr",
    water: "Pegelstand", sources: "Quellen", notes: "Notizen",
  };
  const filename = `Berlin-${names[view]}-${berlinDate()}.csv`;
  const blob = new Blob([serializeCsv(buildExportRows(view, d))], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  try {
    anchor.click();
  } finally {
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
  }
}