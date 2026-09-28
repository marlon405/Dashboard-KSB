import type { ReactNode } from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';
import { formatTime, type SourceState } from '@/data';
import { cn } from '@/lib/utils';
import { t, translateError, useLanguage } from '@/lib/i18n';

type Tone = 'ok' | 'stale' | 'error' | 'loading';

export function toneOf(s: SourceState<unknown>): Tone {
  if (s.loading && !s.data) return 'loading';
  if (!s.data && s.error) return 'error';
  if (s.stale || (s.data && s.error)) return 'stale';
  if (s.data) return 'ok';
  return 'loading';
}

const toneStyle: Record<Tone, { dot: string; label: string; text: string }> = {
  ok: { dot: 'bg-[hsl(var(--ok))]', label: 'Aktuell', text: 'text-[hsl(var(--ok))]' },
  stale: { dot: 'bg-[hsl(var(--warn))]', label: 'Möglicherweise veraltet', text: 'text-[hsl(var(--warn))]' },
  error: { dot: 'bg-destructive', label: 'Abruf fehlgeschlagen', text: 'text-destructive' },
  loading: { dot: 'bg-muted-foreground/50 animate-pulse', label: 'Wird geladen', text: 'text-muted-foreground' },
};

export function StatusBadge({ state, testId }: { state: SourceState<unknown>; testId?: string }) {
  useLanguage();
  const style = toneStyle[toneOf(state)];
  return (
    <span data-testid={testId} className={cn('inline-flex items-center gap-1.5 rounded-full border border-current/25 bg-current/[0.07] px-2 py-0.5 text-[11px] font-medium', style.text)}>
      <span className={cn('size-1.5 rounded-full', style.dot)} />
      {t(state.loading && state.data ? 'Aktualisiere…' : style.label)}
    </span>
  );
}

/** Kompakte Abrufzeile: letzter Erfolg / letzter Fehlversuch. */
export function FetchLine({ state, className }: { state: SourceState<unknown>; className?: string }) {
  useLanguage();
  return (
    <div className={cn('flex flex-wrap items-center gap-x-4 gap-y-0.5 font-mono text-[10.5px] text-muted-foreground tnum', className)}>
      <span>{t('Abruf ok:')} <span className="text-foreground/80">{state.lastSuccess ? formatTime(state.lastSuccess) : '–'}</span></span>
      <span>{t('Fehlversuch:')} <span className={state.lastFailure ? 'text-destructive' : 'text-foreground/80'}>{state.lastFailure ? formatTime(state.lastFailure) : t('keiner')}</span></span>
    </div>
  );
}

export function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} />;
}

export function LoadingBody({ lines = 3 }: { lines?: number }) {
  useLanguage();
  return (
    <div className="flex flex-1 flex-col gap-3" aria-busy="true" aria-label={t('Daten werden geladen')}>
      <SkeletonBlock className="h-9 w-2/5" />
      {Array.from({ length: lines }).map((_, i) => <SkeletonBlock key={i} className={cn('h-3', i % 2 ? 'w-3/5' : 'w-4/5')} />)}
      <SkeletonBlock className="mt-auto min-h-[60px] flex-1" />
    </div>
  );
}

export function ErrorBody({ message, onRetry }: { message: string | null; onRetry: () => void }) {
  useLanguage();
  return (
    <div role="alert" className="flex flex-1 flex-col items-start justify-center gap-2 rounded-md border border-dashed border-destructive/40 bg-destructive/[0.04] p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-destructive"><AlertTriangle className="size-4" />{t('Quelle derzeit nicht erreichbar')}</div>
      <p className="text-xs text-muted-foreground [overflow-wrap:anywhere]">{message ? translateError(message) : t('Unbekannter Fehler beim Abruf.')} {t('Die übrigen Quellen sind davon nicht betroffen.')}</p>
      <button data-testid="button-retry" onClick={onRetry} className="mt-1 inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium hover:bg-muted">
        <RotateCw className="size-3.5" />{t('Erneut versuchen')}
      </button>
    </div>
  );
}

export function StaleNote({ state }: { state: SourceState<unknown> }) {
  useLanguage();
  if (!state.data || !(state.stale || state.error)) return null;
  return (
    <p className="rounded-md border border-[hsl(var(--warn)/.4)] bg-[hsl(var(--warn)/.1)] px-2 py-1 text-[11px] text-[hsl(var(--warn))] [overflow-wrap:anywhere]">
      {t('Letzter Abruf fehlgeschlagen')}{state.error ? ` (${translateError(state.error)})` : ''}. {t('Angezeigt werden die Werte vom')} {state.lastSuccess ? formatTime(state.lastSuccess) : t('letzten Erfolg')}.
    </p>
  );
}

/** Rendert Laden / Fehler / Daten für eine Quelle. */
export function SourceGate<T>({ state, onRetry, lines, children }: { state: SourceState<T>; onRetry: () => void; lines?: number; children: (data: T) => ReactNode }) {
  if (state.data) return <>{children(state.data)}</>;
  if (state.error) return <ErrorBody message={state.error} onRetry={onRetry} />;
  return <LoadingBody lines={lines} />;
}
