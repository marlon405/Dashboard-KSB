import { CalendarClock, Info } from 'lucide-react';
import { formatDate, formatTime, type FireData, type WaterData, type WeatherDay } from '@/data';
import { WeatherIcon } from '@/lib/weather-icon';
import { num } from '@/lib/format';
import { BigNumber, MetaList, Notice } from './metric';
import { localizedWeatherDescription, t, useLanguage } from '@/lib/i18n';

export const MISSING_YESTERDAY = 'Für gestern noch keine Daten verfügbar';

export function FireHeadline({ data }: { data: FireData }) {
  useLanguage();
  return (
    <div className="flex flex-col gap-1.5">
      <div className="eyebrow">{t('Brandeinsätze gestern ·')} {formatDate(data.date)}</div>
      {data.count !== null ? (
        <BigNumber value={num(data.count, 0)} unit={t('Einsätze')} color="hsl(var(--fire))" testId="text-fire-count" />
      ) : (
        <div className="flex flex-col gap-1">
          <p data-testid="text-fire-missing" className="text-[15px] font-semibold leading-snug">{t(MISSING_YESTERDAY)}</p>
          {data.latest && (
            <p data-testid="text-fire-latest" className="flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarClock className="size-3.5" />{t('Letzter verfügbarer Wert:')} <span className="font-mono text-foreground">{num(data.latest.count, 0)}</span> {t('am')} {formatDate(data.latest.date)}
            </p>
          )}
        </div>
      )}
      <p className="text-[11px] text-muted-foreground">{t('Kennzahl: mission_count_fire (nicht Gesamteinsätze)')}</p>
    </div>
  );
}

export function WaterHeadline({ data }: { data: WaterData }) {
  useLanguage();
  return (
    <div className="flex flex-col gap-1.5">
      <div className="eyebrow">{t('Letzte Rohmessung · Wasserstand ·')} {data.station}</div>
      <BigNumber value={num(data.value)} unit={data.unit} color="hsl(var(--water))" testId="text-water-value" />
      <p className="text-xs text-muted-foreground">{t('Messung:')} <span className="font-mono text-foreground tnum" data-testid="text-water-measured">{data.measuredAt ? formatTime(data.measuredAt) : t('keine Angabe')}</span></p>
    </div>
  );
}

export function WaterNotice() {
  useLanguage();
  return <Notice><Info className="mr-1 inline size-3 -translate-y-px" />{t('Rohwert der Messstelle (Wasserstand am Pegel, weder Wassertiefe noch Höhe über NN). Das Dashboard trifft keine Gefahreneinschätzung.')}</Notice>;
}

export function ForecastNotice() {
  useLanguage();
  return <Notice><Info className="mr-1 inline size-3 -translate-y-px" />{t('Modellprognose, keine amtliche Unwetterwarnung. Amtliche Warnungen: Deutscher Wetterdienst.')}</Notice>;
}

export function TodayWeather({ day }: { day: WeatherDay | null }) {
  useLanguage();
  if (!day) return <p className="text-sm text-muted-foreground">{t('Für heute liegt in der Prognose kein Datensatz vor.')}</p>;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <WeatherIcon code={day.code} className="size-11 shrink-0 text-[hsl(var(--weather))]" strokeWidth={1.4} />
        <div className="min-w-0">
          <div className="font-mono text-[28px] font-semibold leading-none tnum" data-testid="text-today-max"><span className="text-[hsl(var(--fire))]">{num(day.max)}°</span> <span className="text-base text-primary">/ {num(day.min)}°C</span></div>
          <div className="mt-1 truncate text-xs" data-testid="text-today-desc">{localizedWeatherDescription(day.description || 'keine Angabe')}</div>
        </div>
      </div>
      <MetaList items={[
        { label: t('Niederschlagswahrsch.'), value: `${num(day.rainProbability, 0)} %` },
        { label: t('Niederschlagssumme'), value: `${num(day.rain)} mm` },
        { label: t('Wind max. / Böen'), value: `${num(day.wind, 0)} / ${num(day.gusts, 0)} km/h` },
      ]} />
    </div>
  );
}
