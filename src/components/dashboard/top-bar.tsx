import { ArrowLeft, RotateCw } from 'lucide-react';
import { formatTime, type SourceState } from '@/data';
import { BerlinClock } from './clock';
import { GlobalStatus } from './source-state';
import { DisplayToggles } from './theme-toggle';
import { t, useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export function TopBar({ title, lastCompiledAt, busy, onRefresh, onBack, sources }: { title: string; lastCompiledAt: string | null; busy: boolean; onRefresh: () => void; onBack?: () => void; sources: SourceState<unknown>[] }) {
  useLanguage();
  return (
    <header className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-border bg-card/60 backdrop-blur px-4 py-2.5 lg:px-5">
      <div className="flex min-w-0 items-center gap-3">
        {onBack && (
          <button type="button" data-testid="button-back-overview" onClick={onBack}
            aria-label={t('Zurück zur Übersicht')} title={t('Zurück zur Übersicht')}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary">
            <ArrowLeft className="size-3.5" />{t('Zur Übersicht')}
          </button>
        )}
        <div className="min-w-0">
          <div className="eyebrow">{t('Lageübersicht Berlin · Prototyp')}</div>
          <h1 className="truncate text-[17px] font-semibold tracking-tight" data-testid="text-view-title">{title}</h1>
        </div>
      </div>
      <div className="ml-auto flex flex-wrap items-center gap-x-5 gap-y-2 lg:flex-nowrap">
        <BerlinClock />
        <GlobalStatus sources={sources} />
        <div className="hidden h-8 w-px bg-border md:block" />
        <div className="min-w-[9.5rem] text-right leading-tight">
          <div className="eyebrow whitespace-nowrap">{t('Daten zusammengestellt')}</div>
          <div className="font-mono text-xs tnum" data-testid="text-last-compiled">{lastCompiledAt ? formatTime(lastCompiledAt) : t('noch nicht')}</div>
        </div>
        <DisplayToggles />
        <button data-testid="button-refresh" onClick={onRefresh} disabled={busy}
          className="inline-flex min-w-[8.5rem] shrink-0 items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-70">
          <RotateCw className={cn('size-3.5', busy && 'animate-spin')} />{t('Aktualisieren')}
        </button>
      </div>
    </header>
  );
}
