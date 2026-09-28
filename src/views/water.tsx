import { Activity, Waves } from 'lucide-react';
import { formatTime, type useDashboard, type WaterData } from '@/data';
import { Panel } from '@/components/dashboard/panel';
import { FetchLine, SourceGate, StaleNote, StatusBadge } from '@/components/dashboard/source-state';
import { WaterHistoryChart } from '@/components/dashboard/charts';
import { ChartDisplay } from '@/components/dashboard/chart-display';
import { WaterHeadline, WaterNotice } from '@/components/dashboard/summaries';
import { MetaList } from '@/components/dashboard/metric';
import { num } from '@/lib/format';
import { t, useLanguage } from '@/lib/i18n';

type D = ReturnType<typeof useDashboard>;

function range(history: WaterData['history']) {
  const vals = history.map((h) => h.value).filter((v): v is number => v !== null);
  if (!vals.length) return null;
  return { min: Math.min(...vals), max: Math.max(...vals), n: vals.length };
}

export function WaterView({ d }: { d: D }) {
  useLanguage();
  return (
    <SourceGate state={d.water} onRetry={d.refresh} lines={5}>
      {(w) => {
        const r = range(w.history);
        return (
          <div className="grid gap-3 lg:h-full lg:min-h-0 lg:grid-cols-[minmax(280px,340px)_1fr]">
            <Panel testId="panel-water-kpi" title={t('Pegelstand')} accent="water" icon={<Waves />} aside={<StatusBadge state={d.water} />} footer={<FetchLine state={d.water} />}>
              <div className="flex flex-1 flex-col gap-4">
                <WaterHeadline data={w} />
                <StaleNote state={d.water} />
                <MetaList items={[
                  { label: t('Station'), value: w.station },
                  { label: t('Einheit (laut Quelle)'), value: w.unit },
                  { label: t('Messzeitpunkt'), value: w.measuredAt ? formatTime(w.measuredAt) : '–' },
                  { label: t('Abruf erfolgreich'), value: d.water.lastSuccess ? formatTime(d.water.lastSuccess) : '–' },
                  { label: 'Stations-UUID', value: <span className="text-[10px]">{w.uuid}</span> },
                  ...(r ? [{ label: t('Spanne 7 Tage'), value: `${num(r.min)} – ${num(r.max)} ${w.unit}` }, { label: t('Messwerte'), value: num(r.n, 0) }] : []),
                ]} />
                <div className="mt-auto"><WaterNotice /></div>
              </div>
            </Panel>
            <Panel testId="panel-water-history" className="min-h-[390px] lg:min-h-0" title={t('Verlauf des Wasserstands')} accent="water" icon={<Activity />}>
              {w.history.length ? <ChartDisplay id="detail-water" label={t('Wasserstand Berlin-Köpenick')}><WaterHistoryChart title={t('Wasserstand am Pegel Berlin-Köpenick · vergangene 7 Tage')} history={w.history} unit={w.unit} /></ChartDisplay> : <p className="text-sm text-muted-foreground">{t('Keine Verlaufsdaten verfügbar.')}</p>}
            </Panel>
          </div>
        );
      }}
    </SourceGate>
  );
}
