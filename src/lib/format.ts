import { TIMEZONE } from '@/config';
import { getLocale } from './i18n';


/** Fehlende Werte werden nie als 0 dargestellt. */
export function num(value: number | null | undefined, digits: 0 | 1 = 1): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '–';
  return new Intl.NumberFormat(getLocale(), { maximumFractionDigits: digits }).format(value);
}

function isoDay(date: string) {
  return new Date(`${date.slice(0, 10)}T12:00:00Z`);
}

export function weekdayShort(date: string) {
  return new Intl.DateTimeFormat(getLocale(), { weekday: 'short', timeZone: 'UTC' }).format(isoDay(date)).replace('.', '');
}
export function weekdayLong(date: string) {
  return new Intl.DateTimeFormat(getLocale(), { weekday: 'long', timeZone: 'UTC' }).format(isoDay(date));
}
export function dayMonth(date: string) {
  return new Intl.DateTimeFormat(getLocale(), { day: '2-digit', month: '2-digit', timeZone: 'UTC' }).format(isoDay(date));
}
export function tsDayMonth(timestamp: string) {
  return new Intl.DateTimeFormat(getLocale(), { day: '2-digit', month: '2-digit', timeZone: TIMEZONE }).format(new Date(timestamp));
}
export function tsFull(timestamp: string) {
  return new Intl.DateTimeFormat(getLocale(), { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: TIMEZONE }).format(new Date(timestamp));
}

export function tsWeekdayDay(timestamp: string) {
  return new Intl.DateTimeFormat(getLocale(), { weekday: 'short', day: '2-digit', month: '2-digit', timeZone: TIMEZONE }).format(new Date(timestamp)).replace('.,', ',');
}
export function dayLabel(date: string) {
  return `${weekdayShort(date)} ${dayMonth(date)}`;
}
