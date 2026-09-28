import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { t, useLanguage } from '@/lib/i18n';

export type LegendKind = 'bar' | 'line' | 'hatch' | 'tick';
export interface LegendItem { label: string; color: string; kind: LegendKind }

function Swatch({ color, kind }: { color: string; kind: LegendKind }) {
  if (kind === 'line') return <span className="h-[3px] w-4 rounded-full" style={{ background: color }} />;
  if (kind === 'hatch') return <span className="gap-hatch size-3 rounded-[2px] border border-dashed border-muted-foreground/70" />;
  if (kind === 'tick') return <span className="h-[3px] w-3 rounded-sm" style={{ background: color }} />;
  return <span className="size-3 rounded-[2px]" style={{ background: color }} />;
}

export function ChartLegend({ items }: { items: LegendItem[] }) {
  useLanguage();
  return (
    <ul className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[11px] text-muted-foreground" aria-label={t('Legende')}>
      {items.map((i) => (
        <li key={i.label} className="inline-flex items-center gap-1.5"><Swatch color={i.color} kind={i.kind} />{i.label}</li>
      ))}
    </ul>
  );
}

/** Rahmen: Klartext-Titel (Messgröße + Zeitraum), Einheit, Legende, Diagramm. */
export function ChartBlock({ title, unit, legend, children, className, compact }: { title: string; unit?: string; legend?: LegendItem[]; children: ReactNode; className?: string; compact?: boolean }) {
  return (
    <figure className={cn('flex min-h-0 flex-1 flex-col gap-1.5', className)}>
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span className={cn('font-medium text-foreground/90', compact ? 'text-[11.5px]' : 'text-[12.5px]')}>
          {title}{unit && <span className="ml-1.5 font-mono text-[11px] font-normal text-muted-foreground">{t('in')} {unit}</span>}
        </span>
        {legend && <ChartLegend items={legend} />}
      </figcaption>
      {children}
    </figure>
  );
}

export function TipBox({ title, rows }: { title: string; rows: { label: string; value: string; color?: string; muted?: boolean }[] }) {
  return (
    <div className="min-w-[160px] rounded-lg border border-popover-border bg-popover px-3 py-2 text-popover-foreground shadow-lg">
      <div className="mb-1 text-[12px] font-semibold">{title}</div>
      {rows.map((r) => (
        <div key={r.label} className="flex items-center justify-between gap-4 text-[12px]">
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            {r.color && <span className="size-2 rounded-full" style={{ background: r.color }} />}{r.label}
          </span>
          <span className={cn('font-mono tnum', r.muted && 'italic text-muted-foreground')}>{r.value}</span>
        </div>
      ))}
    </div>
  );
}
