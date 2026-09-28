import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type Accent = 'fire' | 'water' | 'weather' | 'neutral';

const accentVar: Record<Accent, string> = {
  fire: 'var(--fire)',
  water: 'var(--water)',
  weather: 'var(--weather)',
  neutral: 'var(--primary)',
};

interface PanelProps {
  title: string;
  icon?: ReactNode;
  accent?: Accent;
  aside?: ReactNode;
  footer?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
  testId?: string;
}

/** Einheitliche Karte mit Fachfarbe (Feuer / Wasser / Wetter) als Kennung. */
export function Panel({ title, icon, accent = 'neutral', aside, footer, className, bodyClassName, children, testId }: PanelProps) {
  const c = accentVar[accent];
  return (
    <section data-testid={testId} style={{ ['--acc' as string]: c }}
      className={cn('rise relative flex min-h-0 min-w-0 flex-col overflow-visible rounded-xl border border-card-border bg-card shadow-[0_1px_0_hsl(var(--foreground)/.03)]', className)}>
      <span aria-hidden className="absolute inset-x-4 top-0 h-[2px] rounded-b bg-[hsl(var(--acc))] opacity-80" />
      <header className="flex items-center justify-between gap-3 px-4 pb-2 pt-3">
        <div className="flex min-w-0 items-center gap-2.5">
          {icon && <span className="grid size-7 shrink-0 place-items-center rounded-md bg-[hsl(var(--acc)/.14)] text-[hsl(var(--acc))] [&_svg]:size-4">{icon}</span>}
          <h2 className="truncate text-[13.5px] font-semibold tracking-tight">{title}</h2>
        </div>
        {aside && <div className="shrink-0">{aside}</div>}
      </header>
      <div className={cn('flex min-h-0 flex-1 flex-col px-4 pb-3.5 pt-1', bodyClassName)}>{children}</div>
      {footer && <footer className="border-t border-border/70 px-4 py-2">{footer}</footer>}
    </section>
  );
}
