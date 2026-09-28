import { useState } from 'react';
import { ChevronLeft, ChevronRight, CloudSun, LineChart } from 'lucide-react';
import { type useDashboard } from '@/data';
import { Panel } from '@/components/dashboard/panel';
import { FetchLine, SourceGate, StaleNote, StatusBadge } from '@/components/dashboard/source-state';
import { WeatherDayColumn } from '@/components/dashboard/weather-day';
import { WeatherTrendChart } from '@/components/dashboard/charts';
import { ChartDisplay } from '@/components/dashboard/chart-display';
import { ForecastNotice } from '@/components/dashboard/summaries';
import { splitForecast } from '@/lib/select';
import { t, useLanguage } from '@/lib/i18n';

type D = ReturnType<typeof useDashboard>;
const PAGE = 2;

export function WeatherView({ d }: { d: D }) {
  useLanguage();
  const [page, setPage] = useState(0);
  return (
    <SourceGate state={d.weather} onRetry={d.refresh} lines={5}>
      {(w) => {
        const { today, following } = splitForecast(w.days);
        const all = [today, ...following].filter((x): x is NonNullable<typeof x> => x !== null);
        const pages = Math.ceil(all.length / PAGE);
        const p = Math.min(page, Math.max(pages - 1, 0));
        return (
          <div className="flex flex-col gap-3 lg:h-full lg:min-h-0">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge state={d.weather} />
              <FetchLine state={d.weather} />
              <span className="font-mono text-[10.5px] text-muted-foreground">{t('Referenzpunkt:')} {w.reference}</span>
              <div className="ml-auto max-w-md"><ForecastNotice /></div>
            </div>
            <StaleNote state={d.weather} />
            <div className="hidden grid-cols-8 gap-2 lg:grid">
              {all.map((day, i) => <WeatherDayColumn key={day.date} day={day} isToday={!!today && day.date === today.date} index={i} />)}
            </div>
            <div className="lg:hidden">
              <div className="grid grid-cols-2 gap-2">
                {all.slice(p * PAGE, p * PAGE + PAGE).map((day, i) => <WeatherDayColumn key={day.date} day={day} isToday={!!today && day.date === today.date} index={i} />)}
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <button data-testid="button-prev-days" disabled={p === 0} onClick={() => setPage(p - 1)} className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 disabled:opacity-40"><ChevronLeft className="size-3.5" />{t('Zurück')}</button>
                <span className="font-mono text-muted-foreground">{t('Seite')} {p + 1} / {pages}</span>
                <button data-testid="button-next-days" disabled={p >= pages - 1} onClick={() => setPage(p + 1)} className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 disabled:opacity-40">{t('Weiter')}<ChevronRight className="size-3.5" /></button>
              </div>
            </div>
            <Panel testId="panel-weather-trend" className="lg:flex-1" title={t('Verlauf der Prognose')} accent="weather" icon={<LineChart />}>
              {all.length ? <ChartDisplay id="detail-weather" label={t('Wetterprognose heute bis +7 Tage')}><WeatherTrendChart days={all} todayDate={today?.date} /></ChartDisplay> : <p className="text-sm text-muted-foreground">{t('Keine Prognosedaten.')}</p>}
            </Panel>
            {all.length < 8 && <p className="text-xs text-muted-foreground"><CloudSun className="mr-1 inline size-3" />{t('Nur')} {all.length} {t('von 8 benötigten Kalendertagen geliefert.')}</p>}
          </div>
        );
      }}
    </SourceGate>
  );
}
