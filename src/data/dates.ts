import { getLocale } from "../lib/i18n";

const berlinCalendar = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Berlin",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Date-only arithmetic is performed in UTC after extracting Berlin's calendar date.
 * This avoids 23/25-hour days at the DST boundary and host timezone dependence. */
export function berlinDate(now: Date = new Date()): string {
  const parts = berlinCalendar.formatToParts(now);
  const part = (type: string) => parts.find((item) => item.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function isDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function addDays(date: string, days: number): string {
  if (!isDate(date)) throw new Error(`Ungültiges Kalenderdatum: ${date}`);
  const timestamp = Date.parse(`${date}T00:00:00Z`) + days * 86_400_000;
  return new Date(timestamp).toISOString().slice(0, 10);
}

export function formatDate(date: string): string {
  if (!isDate(date)) return "–";
  return new Intl.DateTimeFormat(getLocale(), {
    timeZone: "UTC", weekday: "short", day: "2-digit", month: "2-digit", year: "numeric",
  }).format(new Date(`${date}T12:00:00Z`));
}

export function formatTime(timestamp: string | null): string {
  if (!timestamp || !Number.isFinite(Date.parse(timestamp))) return "–";
  return new Intl.DateTimeFormat(getLocale(), {
    timeZone: "Europe/Berlin", day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", timeZoneName: "short",
  }).format(new Date(timestamp));
}