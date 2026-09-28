import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function BigNumber({ value, unit, className, testId, color }: { value: string; unit?: string; className?: string; testId?: string; color?: string }) {
  return (
    <div className={cn('flex items-baseline gap-1.5', className)}>
      <span data-testid={testId} style={color ? { color } : undefined} className="font-mono text-[44px] font-semibold leading-none tracking-tight tnum">{value}</span>
      {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
    </div>
  );
}

export function MetaList({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
      {items.map((i) => (
        <div key={i.label} className="contents">
          <dt className="text-muted-foreground">{i.label}</dt>
          <dd className="truncate text-right font-mono tnum" title={typeof i.value === 'string' ? i.value : undefined}>{i.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Notice({ children }: { children: ReactNode }) {
  return <p className="rounded-md bg-secondary/70 px-2.5 py-1.5 text-[11px] leading-snug text-secondary-foreground/85">{children}</p>;
}

export function Segmented<T extends string>({ value, options, onChange, className }: { value: T; options: { id: T; label: string }[]; onChange: (v: T) => void; className?: string }) {
  return (
    <div role="tablist" className={cn('flex gap-1 overflow-x-auto rounded-md border border-border bg-card p-1', className)}>
      {options.map((o) => (
        <button key={o.id} role="tab" aria-selected={value === o.id} data-testid={`tab-${o.id}`} onClick={() => onChange(o.id)}
          className={cn('whitespace-nowrap rounded px-2.5 py-1 text-xs font-medium', value === o.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted')}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
