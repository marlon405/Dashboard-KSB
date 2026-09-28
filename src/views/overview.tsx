import { useState } from 'react';
import { CalendarDays, CloudSun, Flame, Waves } from 'lucide-react';
import type { useDashboard } from '@/data';
import { Panel } from '@/components/dashboard/panel';
import { FetchLine, SourceGate, StaleNote, StatusBadge } from '@/components/dashboard/source-state';
import { FireHistoryChart, WaterHistoryChart, WeatherTrendChart } from '@/components/dashboard/charts';
import { ChartDisplay } from '@/components/dashboard/chart-display';
import type { ViewId } from '@/components/dashboard/sidebar';
import { FireHeadline, ForecastNotice, TodayWeather, WaterHeadline } from '@/components/dashboard/summaries';
import { WeatherDayChip } from '@/components/dashboard/weather-day';
import { Segmented } from '@/components/dashboard/metric';
import { splitForecast } from '@/lib/select';
import { cn } from '@/lib/utils';
import { t, useLanguage } from '@/lib/i18n';

type D = ReturnType<typeof useDashboard>;
type Tab = 'fire' | 'water' | 'today' | 'week';

export function OverviewView({ d, onNavigate }: { d: D; onNavigate: (view: ViewId) => void }) {
  useLanguage();
  const [tab, setTab] = useState<Tab>('fire');
  const hide = (t: Tab) => (tab !== t ? 'hidden lg:flex' : '');
  return (
    <div className="flex flex-col gap-3 lg:h-full lg:min-h-0">
      <Segmented className="lg:hidden" value={tab} onChange={(value) => setTab(value as Tab)} options={[
        { id: 'fire', label: t('Feuerwehr') }, { id: 'water', label: t('Pegel') }, { id: 'today', label: t('Wetter heute') }, { id: 'week', label: t('7 Tage') },
      ]} />
      <div className="grid gap-3 lg:min-h-0 lg:flex-1 lg:grid-cols-3">
        <Panel testId="panel-fire" className={hide('fire')} title={t('Feuerwehr')} accent="fire" icon={<Flame />} aside={<StatusBadge state={d.fire} />} footer={<FetchLine state={d.fire} />}>
          <SourceGate state={d.fire} onRetry={d.refresh}>
            {(f) => (
              <div className="flex min-h-0 flex-1 flex-col gap-2">
                <FireHeadline data={f} />
                <StaleNote state={d.fire} />
                <div className="mt-auto flex min-h-0 flex-1 flex-col pt-1">
                  <ChartDisplay id="overview-fire" label={t('Brandeinsätze je Tag')} view="fire" onNavigate={onNavigate}>
                    <FireHistoryChart title={t('Brandeinsätze je Tag · letzte 14 Tage')} history={f.history.slice(-14)} highlight={f.date} compact />
                  </ChartDisplay>
                </div>
              </div>
            )}
          </SourceGate>
        </Panel>
        <Panel testId="panel-water" className={hide('water')} title={t('Pegelstand Berlin-Köpenick')} accent="water" icon={<Waves />} aside={<StatusBadge state={d.water} />} footer={<FetchLine state={d.water} />}>
          <SourceGate state={d.water} onRetry={d.refresh}>
            {(w) => (
              <div className="flex min-h-0 flex-1 flex-col gap-2">
                <WaterHeadline data={w} />
                <StaleNote state={d.water} />
                <p className="text-[11px] text-muted-foreground">{t('Keine Gefahreneinschätzung, nur Messwert.')}</p>
                <div className="mt-auto flex min-h-0 flex-1 flex-col pt-1">
                  <ChartDisplay id="overview-water" label={t('Wasserstand der letzten sieben Tage')} view="water" onNavigate={onNavigate}>
                    <WaterHistoryChart title={t('Wasserstand · letzte 7 Tage')} history={w.history} unit={w.unit} compact />
                  </ChartDisplay>
                </div>
              </div>
            )}
          </SourceGate>
        </Panel>
        <Panel testId="panel-today" className={hide('today')} title={t('Wetter heute')} accent="weather" icon={<CloudSun />} aside={<StatusBadge state={d.weather} />} footer={<FetchLine state={d.weather} />}>
          <SourceGate state={d.weather} onRetry={d.refresh}>
            {(w) => (
              <div className="flex min-h-0 flex-1 flex-col gap-2">
                <TodayWeather day={splitForecast(w.days).today} />
                <StaleNote state={d.weather} />
                <div className="flex min-h-0 flex-1 flex-col">
                  <ChartDisplay id="overview-weather" label={t('Wetterprognose als Diagramm')} view="weather" onNavigate={onNavigate}>
                    <WeatherTrendChart days={[splitForecast(w.days).today, ...splitForecast(w.days).following].filter((day): day is NonNullable<typeof day> => day !== null)} todayDate={splitForecast(w.days).today?.date} compact />
                  </ChartDisplay>
                </div>
                <ForecastNotice />
              </div>
            )}
          </SourceGate>
        </Panel>
      </div>
      <Panel testId="panel-week" className={cn('shrink-0', hide('week'))} title={t('Prognose der sieben folgenden Tage')} accent="weather" icon={<CalendarDays />} bodyClassName="p-3">
        <SourceGate state={d.weather} onRetry={d.refresh} lines={1}>
          {(w) => {
            const { following } = splitForecast(w.days);
            if (following.length === 0) return <p className="text-sm text-muted-foreground">{t('Keine Prognosetage verfügbar.')}</p>;
            return (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                {following.map((day, i) => <WeatherDayChip key={day.date} day={day} index={i} />)}
                {following.length < 7 && <p className="col-span-full text-xs text-muted-foreground">{t('Nur')} {following.length} {t('von 7 Prognosetagen verfügbar.')}</p>}
              </div>
            );
          }}
        </SourceGate>
      </Panel>
    </div>
  );
}
