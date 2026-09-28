import { Droplets, Umbrella, Wind } from 'lucide-react';
import type { WeatherDay } from '@/data';
import { WeatherIcon } from '@/lib/weather-icon';
import { dayMonth, num, weekdayLong, weekdayShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { localizedWeatherDescription, t, useLanguage } from '@/lib/i18n';

/** Kompakte Kachel für Übersichtsstreifen. */
export function WeatherDayChip({ day, index }: { day: WeatherDay; index: number }) {
  useLanguage();
  return (
    <div data-testid={`chip-day-${day.date}`} className="rise flex min-w-0 flex-col items-center gap-1 rounded-md border border-border/80 bg-muted/40 px-2 py-2 text-center" style={{ animationDelay: `${index * 30}ms` }}>
      <div className="text-[11px] font-semibold">{weekdayShort(day.date)} <span className="font-mono font-normal text-muted-foreground">{dayMonth(day.date)}</span></div>
      <WeatherIcon code={day.code} className="size-6 text-[hsl(var(--weather))]" strokeWidth={1.6} aria-label={localizedWeatherDescription(day.description)} />
      <div className="font-mono text-xs tnum"><span className="font-semibold text-[hsl(var(--fire))]">{num(day.max)}°</span> <span className="text-muted-foreground">{num(day.min)}°</span></div>
      <div className="flex items-center gap-0.5 font-mono text-[10.5px] text-[hsl(var(--water))] tnum"><Umbrella className="size-3" />{num(day.rainProbability, 0)} %</div>
    </div>
  );
}

function Row({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 border-t border-border/60 py-1 text-[11.5px]">
      <span className="flex items-center gap-1 text-muted-foreground">{icon}{label}</span>
      <span className="font-mono tnum">{value}</span>
    </div>
  );
}

/** Vollständige Tagesspalte mit allen Pflichtfeldern. */
export function WeatherDayColumn({ day, isToday, index }: { day: WeatherDay; isToday?: boolean; index: number }) {
  useLanguage();
  return (
    <article data-testid={`card-day-${day.date}`} className={cn('rise flex min-w-0 flex-col rounded-lg border bg-card p-3', isToday ? 'border-[hsl(var(--weather)/.55)] bg-[hsl(var(--weather)/.06)]' : 'border-card-border')} style={{ animationDelay: `${index * 35}ms` }}>
      <div className="flex items-baseline justify-between">
        <span className="text-[13px] font-semibold">{isToday ? t('Heute') : weekdayLong(day.date)}</span>
        <span className="font-mono text-[11px] text-muted-foreground">{dayMonth(day.date)}</span>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <WeatherIcon code={day.code} className="size-7 shrink-0 text-[hsl(var(--weather))]" strokeWidth={1.5} />
        <span className="line-clamp-2 text-[11.5px] leading-snug">{localizedWeatherDescription(day.description || 'keine Angabe')}</span>
      </div>
      <div className="mt-2 font-mono tnum"><span className="text-xl font-semibold text-[hsl(var(--fire))]">{num(day.max)}°</span> <span className="text-sm text-primary">/ {num(day.min)}°C</span></div>
      <div className="mt-2">
        <Row icon={<Umbrella className="size-3" />} label={t('Wahrsch.')} value={`${num(day.rainProbability, 0)} %`} />
        <Row icon={<Droplets className="size-3" />} label={t('Menge')} value={`${num(day.rain)} mm`} />
        <Row icon={<Wind className="size-3" />} label={t('Wind')} value={`${num(day.wind, 0)} km/h`} />
        <Row label={t('Böen')} value={`${num(day.gusts, 0)} km/h`} />
      </div>
    </article>
  );
}
