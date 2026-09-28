import { Download, LogOut, RotateCw } from 'lucide-react';
import { formatTime } from '@/data';
import { BerlinClock } from './clock';
import { DisplayToggles } from './theme-toggle';
import { t, useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export function TopBar({ title, lastCompiledAt, busy, onRefresh, onLogout, onExport }: { title: string; lastCompiledAt: string | null; busy: boolean; onRefresh: () => void; onLogout: () => void; onExport?: () => void }) {
  useLanguage();
  return (
    <header className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-border bg-card/60 backdrop-blur px-4 py-2.5 lg:px-5">
      <div className="min-w-0">
        <div className="eyebrow">{t('Lageübersicht Berlin · Prototyp')}</div>
        <h1 className="truncate text-[17px] font-semibold tracking-tight" data-testid="text-view-title">{title}</h1>
      </div>
      <div className="ml-auto flex flex-wrap items-center gap-x-5 gap-y-2">
        <BerlinClock />
        <div className="hidden h-8 w-px bg-border md:block" />
        <div className="text-right leading-tight">
          <div className="eyebrow">{t('Daten zusammengestellt')}</div>
          <div className="font-mono text-xs tnum" data-testid="text-last-compiled">{lastCompiledAt ? formatTime(lastCompiledAt) : t('noch nicht')}</div>
        </div>
        <DisplayToggles />
        {onExport && <button data-testid="button-export-csv" onClick={onExport}
          aria-label={`${title} ${t('als CSV exportieren')}`}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary">
          <Download className="size-3.5" />{t('CSV exportieren')}
        </button>}
        <button data-testid="button-refresh" onClick={onRefresh} disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-70">
          <RotateCw className={cn('size-3.5', busy && 'animate-spin')} />{t('Aktualisieren')}
        </button>
        <button data-testid="button-logout-top" onClick={onLogout} className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs lg:hidden">
          <LogOut className="size-3.5" />{t('Abmelden')}
        </button>
      </div>
    </header>
  );
}
