import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, ComposedChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { FireData, WaterData, WeatherDay } from '@/data';
import { dayLabel, dayMonth, num, tsFull } from '@/lib/format';
import { cn } from '@/lib/utils';
import { aggregateWaterDaily, aggregateWaterHourly, berlinWaterDay, rawWaterSeries, type DailyWaterPoint, type WaterSeriesPoint } from '@/lib/water-chart';
import { ChartBlock, TipBox } from './chart-parts';
import { getLocale, t, useLanguage } from '@/lib/i18n';

const FIRE = 'hsl(var(--fire))';
const WATER = 'hsl(var(--water))';
const WEATHER = 'hsl(var(--weather))';
const COOL = 'hsl(var(--primary))';

const axis = { fontSize: 11, fill: 'hsl(var(--muted-foreground))', fontFamily: 'IBM Plex Mono, monospace' };
const grid = 'hsl(var(--border))';

function Frame({ children, className }: { children: React.ReactElement; className?: string }) {
  return <div className={cn('min-h-[150px] w-full flex-1', className)}><ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer></div>;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
type TipProps = { active?: boolean; payload?: any[]; label?: any };

/* ---------------- Feuerwehr ---------------- */

/** Ergänzt fehlende Kalendertage als null, damit Lücken sichtbar bleiben (nie als 0). */
function fillDays(history: FireData['history']) {
  const byDate = new Map(history.map((h) => [h.date, h.count]));
  const dates = [...byDate.keys()].sort();
  if (!dates.length) return [];
  const out: { date: string; count: number | null }[] = [];
  const cur = new Date(`${dates[0]}T12:00:00Z`);
  const end = new Date(`${dates[dates.length - 1]}T12:00:00Z`);
  while (cur <= end) {
    const iso = cur.toISOString().slice(0, 10);
    out.push({ date: iso, count: byDate.has(iso) ? (byDate.get(iso) ?? null) : null });
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return out;
}

export function FireHistoryChart({ history, highlight, compact, title }: { history: FireData['history']; highlight?: string; compact?: boolean; title: string }) {
  useLanguage();
  const days = fillDays(history);
  const max = Math.max(1, ...days.map((d) => d.count ?? 0));
  // "gap" ist nur ein Platzhalter-Balken zur Markierung fehlender Tage, kein Messwert.
  const data = days.map((d) => ({ ...d, gap: d.count === null ? max * 0.12 : null }));
  const hasGap = data.some((d) => d.gap !== null);
  const legend = [
    { label: t('Brandeinsätze'), color: FIRE, kind: 'bar' as const },
    ...(highlight ? [{ label: t('Gestern'), color: 'hsl(var(--accent))', kind: 'bar' as const }] : []),
    ...(hasGap ? [{ label: t('Kein Datensatz'), color: '', kind: 'hatch' as const }] : []),
  ];
  return (
    <ChartBlock title={title} legend={compact ? undefined : legend} compact={compact}>
      <Frame className={compact ? 'min-h-[96px]' : ''}>
        <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 0 }} barCategoryGap={compact ? '14%' : '20%'}>
          <defs>
            <pattern id="fire-gap" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="2" height="5" fill="hsl(var(--muted-foreground) / .55)" />
            </pattern>
          </defs>
          <CartesianGrid vertical={false} stroke={grid} strokeDasharray="3 4" />
          <XAxis dataKey="date" tick={axis} tickLine={false} axisLine={{ stroke: grid }} tickFormatter={compact ? dayMonth : dayLabel} minTickGap={compact ? 10 : 18} interval="preserveStartEnd" />
          <YAxis tick={axis} tickLine={false} axisLine={false} width={34} allowDecimals={false} tickCount={compact ? 3 : 5} />
          <Tooltip cursor={{ fill: 'hsl(var(--foreground) / .06)' }} content={({ active, payload }: TipProps) => {
            if (!active || !payload?.length) return null;
            const p = payload[0].payload as { date: string; count: number | null };
            return <TipBox title={`${dayLabel(p.date)}${p.date === highlight ? ` (${t('gestern')})` : ''}`}
              rows={[{ label: t('Brandeinsätze'), value: p.count === null ? t('kein Datensatz') : num(p.count, 0), color: p.count === null ? undefined : FIRE, muted: p.count === null }]} />;
          }} />
          <Bar dataKey="count" stackId="d" isAnimationActive={false}
            shape={(p: any) => {
              const zero = p.payload.count === 0;
              const fill = p.payload.date === highlight ? 'hsl(var(--accent))' : FIRE;
              // Wert 0 erhält eine sichtbare Grundlinie, damit 0 nicht wie "fehlt" aussieht.
              return zero
                ? <rect x={p.x} y={p.y - 2} width={p.width} height={2} fill={fill} />
                : <rect x={p.x} y={p.y} width={p.width} height={Math.max(p.height, 0)} rx={2} fill={fill} fillOpacity={p.payload.date === highlight ? 1 : 0.85} />;
            }} />
          <Bar dataKey="gap" stackId="d" isAnimationActive={false} fill="url(#fire-gap)" stroke="hsl(var(--muted-foreground) / .6)" strokeDasharray="2 2" />
        </BarChart>
      </Frame>
    </ChartBlock>
  );
}

/* ---------------- Pegel ---------------- */

/** Seven zero-based calendar-day bars. The whisker is the actual min/max range;
 * label position is derived from the same linear zero-based scale, not guessed. */
function WaterDayBar(props: any) {
  const { x, y, width, height, payload } = props as {
    x: number; y: number; width: number; height: number; payload: DailyWaterPoint;
  };
  if (payload.mean === null || payload.min === null || payload.max === null) return null;
  const center = x + width / 2;
  const baseline = y + height;
  const pixelsPerUnit = payload.mean > 0 ? height / payload.mean : 0;
  const top = baseline - payload.max * pixelsPerUnit;
  const bottom = baseline - payload.min * pixelsPerUnit;
  const cap = Math.min(7, Math.max(3, width * 0.16));
  return (
    <g>
      <rect x={x} y={payload.mean === 0 ? baseline - 2 : y} width={width}
        height={payload.mean === 0 ? 2 : Math.max(0, height)} rx={3}
        fill={WATER} fillOpacity={payload.date === berlinWaterDay(new Date()) ? 1 : 0.75} />
      <path d={`M${center} ${top}V${bottom} M${center - cap} ${top}H${center + cap} M${center - cap} ${bottom}H${center + cap}`}
        fill="none" stroke="hsl(var(--weather))" strokeWidth={1.8} strokeLinecap="round" />
      <text x={center} y={Math.max(12, top - 7)} textAnchor="middle"
        fill="hsl(var(--foreground))" fontSize={10.5} fontWeight={600} fontFamily="IBM Plex Mono, monospace">
        {num(payload.mean)}
      </text>
    </g>
  );
}

function WaterDailyBars({ history, unit, compact, title }: { history: WaterData['history']; unit: string; compact?: boolean; title: string }) {
  useLanguage();
  const data = aggregateWaterDaily(history);
  const max = Math.max(0, ...data.map((day) => day.max ?? 0));
  const upper = Math.max(10, Math.ceil((max * 1.18) / 10) * 10);
  const missing = data.some((day) => day.mean === null);
  const today = data[6].date;
  return (
    <ChartBlock title={compact ? t('Tagesmittel · 7 Kalendertage') : `${title} · ${t('Tagesmittel')}`} unit={unit} compact={compact}
      legend={[
        { label: t('Tagesmittel'), color: WATER, kind: 'bar' },
        { label: t('Min–Max'), color: 'hsl(var(--weather))', kind: 'tick' },
        ...(missing && !compact ? [{ label: t('Ohne Balken = keine Werte'), color: '', kind: 'hatch' as const }] : []),
      ]}>
      <Frame className={compact ? 'min-h-[105px]' : 'min-h-[185px]'}>
        <BarChart data={data} margin={{ top: compact ? 23 : 27, right: 4, bottom: 1, left: 0 }}
          barCategoryGap="18%">
          <CartesianGrid vertical={false} stroke={grid} strokeDasharray="3 4" />
          <XAxis dataKey="date" tick={axis} tickLine={false} axisLine={{ stroke: grid }}
            interval={0} height={27} tickFormatter={dayMonth} />
          <YAxis type="number" domain={[0, upper]} tick={axis} tickLine={false} axisLine={false}
            width={compact ? 40 : 55} tickCount={compact ? 3 : 5}
            tickFormatter={(value: number) => compact ? num(value, 0) : `${num(value, 0)} ${unit}`} />
          <Tooltip filterNull={false} cursor={{ fill: 'hsl(var(--water)/.08)' }}
            content={({ active, label }: TipProps) => {
              if (!active) return null;
              const p = data.find((day) => day.date === label);
              if (!p) return null;
              return <TipBox title={`${dayLabel(p.date)}${p.date === today ? ` · ${t('Heute (unvollständig)')}` : ''}`} rows={[
                { label: t('Tagesmittel'), value: p.mean === null ? t('keine Messwerte') : `${num(p.mean)} ${unit}`, color: p.mean === null ? undefined : WATER, muted: p.mean === null },
                { label: t('Minimum'), value: p.min === null ? '–' : `${num(p.min)} ${unit}` },
                { label: t('Maximum'), value: p.max === null ? '–' : `${num(p.max)} ${unit}` },
                { label: t('Messwerte'), value: num(p.count, 0) },
              ]} />;
            }} />
          <Bar dataKey="mean" shape={(props: any) => <WaterDayBar {...props} />} isAnimationActive={false} />
        </BarChart>
      </Frame>
      <div className="flex shrink-0 items-center justify-between gap-2 text-[10px] text-muted-foreground">
        <span>{t(missing ? 'Lücke = keine Messwerte' : 'Balken ab 0 · keine Gefahreneinschätzung')}</span>
        <span className="font-medium text-foreground/75">{t('Heute · unvollständig')} ({dayMonth(today)})</span>
      </div>
    </ChartBlock>
  );
}

type WaterMode = 'bars' | 'hourly' | 'raw';

function WaterSeriesChart({ history, unit, mode }: { history: WaterData['history']; unit: string; mode: 'hourly' | 'raw' }) {
  useLanguage();
  const berlinAxisDate = new Intl.DateTimeFormat(getLocale(), { timeZone: 'Europe/Berlin', day: '2-digit', month: '2-digit' });
  const berlinTooltipHour = new Intl.DateTimeFormat(getLocale(), {
    timeZone: 'Europe/Berlin', day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
  });
  const data = mode === 'hourly' ? aggregateWaterHourly(history) : rawWaterSeries(history);
  const values = data.map((p) => p.value).filter((v): v is number => v !== null);
  if (!values.length) return <p className="text-sm text-muted-foreground">{t('Keine Messwerte für den Verlauf verfügbar.')}</p>;
  const first = data[0].t;
  const last = data[data.length - 1].t;
  const low = Math.min(...values), high = Math.max(...values);
  const padding = Math.max(1, (high - low) * .12);
  const domain = [Math.floor(low - padding), Math.ceil(high + padding)];
  const ticks = Array.from({ length: 7 }, (_, i) => first + (last - first) * i / 6);
  const hourly = mode === 'hourly';
  return (
    <ChartBlock title={t(hourly ? 'Wasserstand · Stundenmittel der letzten 7 Tage' : 'Wasserstand · einzelne Rohmessungen der letzten 7 Tage')} unit={unit}
      legend={[
        { label: t(hourly ? 'Mittel je Stunde' : 'Einzelmessung'), color: WATER, kind: 'line' },
        ...(data.some((p) => p.value === null) ? [{ label: t('Lücke = keine Messung'), color: '', kind: 'hatch' as const }] : []),
      ]}>
      <Frame>
        <LineChart data={data} margin={{ top: 12, right: 8, bottom: 3, left: 0 }}>
          <CartesianGrid vertical={false} stroke={grid} strokeDasharray="3 4" />
          <XAxis dataKey="t" type="number" scale="time" domain={[first, last]} ticks={ticks}
            tick={axis} tickLine={false} axisLine={{ stroke: grid }}
            tickFormatter={(t: number) => berlinAxisDate.format(new Date(t))} minTickGap={18} />
          <YAxis type="number" domain={domain} tick={axis} tickLine={false} axisLine={false}
            width={58} tickCount={5} tickFormatter={(v: number) => `${num(v, 0)} ${unit}`} />
          <Tooltip filterNull={false} cursor={{ stroke: 'hsl(var(--water))', strokeDasharray: '3 4' }}
            content={({ active, label }: TipProps) => {
              if (!active) return null;
              const p = data.find((point) => point.t === Number(label)) as WaterSeriesPoint | undefined;
              if (!p) return null;
              return <TipBox title={hourly ? `${t('Stunde ab')} ${berlinTooltipHour.format(new Date(p.t))}` : `${berlinTooltipHour.format(new Date(p.t))}`} rows={[
                { label: t(hourly ? 'Stundenmittel' : 'Rohmessung'), value: p.value === null ? t('keine Messung') : `${num(p.value)} ${unit}`, color: p.value === null ? undefined : WATER, muted: p.value === null },
                ...(hourly ? [
                  { label: t('Messwerte'), value: num(p.count, 0) },
                  { label: t('Minimum'), value: p.min === null ? '–' : `${num(p.min)} ${unit}` },
                  { label: t('Maximum'), value: p.max === null ? '–' : `${num(p.max)} ${unit}` },
                ] : []),
              ]} />;
            }} />
          <Line dataKey="value" type="linear" stroke={WATER} strokeWidth={2} dot={false}
            activeDot={{ r: 4, fill: WATER, stroke: 'hsl(var(--card))', strokeWidth: 2 }}
            connectNulls={false} isAnimationActive={false} />
        </LineChart>
      </Frame>
      <div className="shrink-0 text-[10px] text-muted-foreground">{t('Messzeit Berlin · Lücken werden nicht verbunden · keine Gefahreneinschätzung')}</div>
    </ChartBlock>
  );
}

export function WaterHistoryChart({ history, unit, compact, title }: { history: WaterData['history']; unit: string; compact?: boolean; title: string }) {
  useLanguage();
  const [mode, setMode] = useState<WaterMode>('bars');
  if (compact) return <WaterDailyBars history={history} unit={unit} title={title} compact />;
  return (
    <div className="flex min-h-0 w-full flex-1 flex-col gap-2">
      <div role="group" aria-label={t('Darstellung des Pegelverlaufs')} className="flex shrink-0 flex-wrap gap-1">
        {([
          ['bars', 'Balken'],
          ['hourly', 'Stundenverlauf'],
          ['raw', 'Rohmessungen'],
        ] as const).map(([id, label]) => (
          <button key={id} type="button" data-testid={`button-water-mode-${id}`}
            aria-pressed={mode === id} onClick={() => setMode(id)}
            className={cn('rounded-md border px-2.5 py-1 text-[11px] font-medium focus-visible:outline-2 focus-visible:outline-primary',
              mode === id ? 'border-[hsl(var(--water))] bg-[hsl(var(--water)/.15)] text-[hsl(var(--water))]' : 'border-border text-muted-foreground hover:bg-muted')}>
            {t(label)}
          </button>
        ))}
      </div>
      {mode === 'bars'
        ? <WaterDailyBars history={history} unit={unit} title={title} />
        : <WaterSeriesChart history={history} unit={unit} mode={mode} />}
    </div>
  );
}

/* ---------------- Wetter ---------------- */

export function WeatherTrendChart({ days, todayDate, compact = false }: { days: WeatherDay[]; todayDate?: string; compact?: boolean }) {
  useLanguage();
  const data = days.map((d) => ({ ...d, label: d.date === todayDate ? `${t('Heute')} ${dayMonth(d.date)}` : dayLabel(d.date) }));
  return (
    <ChartBlock title={t(compact ? "Temperatur & Regen · heute bis +7 Tage" : "Temperatur (Min./Max.) und Niederschlagssumme je Tag · heute bis +7 Tage")}
      compact={compact}
      legend={[{ label: t(compact ? 'Max °C' : 'Höchstwert °C'), color: FIRE, kind: 'line' }, { label: t(compact ? 'Min °C' : 'Tiefstwert °C'), color: COOL, kind: 'line' }, { label: t(compact ? 'Regen mm' : 'Niederschlag mm'), color: WATER, kind: 'bar' }]}>
      <Frame className={compact ? 'min-h-[100px]' : undefined}>
        <ComposedChart data={data} margin={{ top: 10, right: 0, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke={grid} strokeDasharray="3 4" />
          <XAxis dataKey="label" tick={axis} tickLine={false} axisLine={{ stroke: grid }} tickFormatter={compact ? (_: string, index: number) => data[index] ? dayMonth(data[index].date) : '' : undefined} interval={compact ? 1 : 0} minTickGap={0} />
          <YAxis yAxisId="t" tick={axis} tickLine={false} axisLine={false} width={compact ? 38 : 44} tickCount={compact ? 3 : 5} tickFormatter={(v: number) => `${num(v, 0)}°C`} />
          <YAxis yAxisId="r" orientation="right" tick={axis} tickLine={false} axisLine={false} width={compact ? 38 : 48} tickCount={compact ? 3 : 5} allowDecimals={false} tickFormatter={(v: number) => `${num(v, 0)} mm`} />
          <Tooltip cursor={{ fill: 'hsl(var(--foreground) / .05)' }} content={({ active, payload }: TipProps) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload as WeatherDay & { label: string };
            const v = (x: number | null, u: string, digits: 0 | 1 = 1) => (x === null ? t('keine Angabe') : `${num(x, digits)} ${u}`);
            return <TipBox title={d.label} rows={[
              { label: t('Höchstwert'), value: v(d.max, '°C'), color: FIRE, muted: d.max === null },
              { label: t('Tiefstwert'), value: v(d.min, '°C'), color: COOL, muted: d.min === null },
              { label: t('Niederschlag'), value: v(d.rain, 'mm'), color: WATER, muted: d.rain === null },
              { label: t('Wahrscheinlichkeit'), value: v(d.rainProbability, '%', 0), muted: d.rainProbability === null },
              { label: t('Wind / Böen'), value: `${num(d.wind, 0)} / ${num(d.gusts, 0)} km/h` },
            ]} />;
          }} />
          <Bar yAxisId="r" dataKey="rain" fill={WATER} fillOpacity={0.45} radius={[3, 3, 0, 0]} maxBarSize={28} isAnimationActive={false} />
          <Line yAxisId="t" dataKey="max" stroke={FIRE} strokeWidth={2.25} dot={{ r: 3, fill: FIRE, strokeWidth: 0 }} connectNulls={false} isAnimationActive={false} />
          <Line yAxisId="t" dataKey="min" stroke={COOL} strokeWidth={2.25} dot={{ r: 3, fill: COOL, strokeWidth: 0 }} connectNulls={false} isAnimationActive={false} />
        </ComposedChart>
      </Frame>
    </ChartBlock>
  );
}

export const CHART_COLORS = { FIRE, WATER, WEATHER, COOL };
