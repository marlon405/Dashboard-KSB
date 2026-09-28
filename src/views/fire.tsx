import { BarChart3, Flame } from 'lucide-react';
import { formatDate, type useDashboard, type FireData } from '@/data';
import { Panel } from '@/components/dashboard/panel';
import { FetchLine, SourceGate, StaleNote, StatusBadge } from '@/components/dashboard/source-state';
import { FireHistoryChart } from '@/components/dashboard/charts';
import { ChartDisplay } from '@/components/dashboard/chart-display';
import { FireHeadline } from '@/components/dashboard/summaries';
import { MetaList, Notice } from '@/components/dashboard/metric';
import { num } from '@/lib/format';
import { t, useLanguage } from '@/lib/i18n';

type D = ReturnType<typeof useDashboard>;

/** Kennzahlen ausschließlich aus vorhandenen Tageswerten; Lücken werden gezählt, nicht als 0 gewertet. */
function stats(history: FireData['history']) {
  const vals = history.map((h) => h.count).filter((v): v is number => v !== null);
  if (!vals.length) return null;
  return {
    days: history.length,
    missing: history.length - vals.length,
    min: Math.min(...vals),
    max: Math.max(...vals),
    avg: vals.reduce((a, b) => a + b, 0) / vals.length,
  };
}

export function FireView({ d }: { d: D }) {
  useLanguage();
  return (
    <SourceGate state={d.fire} onRetry={d.refresh} lines={5}>
      {(f) => {
        const s = stats(f.history);
        const first = f.history[0]?.date;
        const last = f.history[f.history.length - 1]?.date;
        return (
          <div className="grid gap-3 lg:h-full lg:min-h-0 lg:grid-cols-[minmax(280px,340px)_1fr]">
            <Panel testId="panel-fire-kpi" title={t('Brandeinsätze gestern')} accent="fire" icon={<Flame />} aside={<StatusBadge state={d.fire} />} footer={<FetchLine state={d.fire} />}>
              <div className="flex flex-1 flex-col gap-4">
                <FireHeadline data={f} />
                <StaleNote state={d.fire} />
                {s && (
                  <div>
                    <div className="eyebrow mb-1.5">{t('Zeitraum im Diagramm')}</div>
                    <MetaList items={[
                      { label: t('Tage'), value: `${first ? formatDate(first) : '–'} – ${last ? formatDate(last) : '–'}` },
                      { label: t('Durchschnitt'), value: `${num(s.avg)} / ${t('Tag')}` },
                      { label: t('Minimum / Maximum'), value: `${num(s.min, 0)} / ${num(s.max, 0)}` },
                      { label: t('Tage ohne Daten'), value: num(s.missing, 0) },
                    ]} />
                  </div>
                )}
                <div className="mt-auto">
                  <Notice>{t('„Gestern“ ist der vorherige Kalendertag in Europe/Berlin. Ältere Werte werden nie als gestriger Wert angezeigt.')}</Notice>
                </div>
              </div>
            </Panel>
            <Panel testId="panel-fire-history" title={t('Verlauf der Brandeinsätze')} accent="fire" icon={<BarChart3 />}>
              {f.history.length ? <ChartDisplay id="detail-fire" label={t('Verlauf der Brandeinsätze')}><FireHistoryChart title={`${t('Brandeinsätze je Kalendertag')} · ${first ? formatDate(first) : '–'} ${t('bis')} ${last ? formatDate(last) : '–'}`} history={f.history} highlight={f.date} /></ChartDisplay> : <p className="text-sm text-muted-foreground">{t('Keine Verlaufsdaten vorhanden.')}</p>}
            </Panel>
          </div>
        );
      }}
    </SourceGate>
  );
}
