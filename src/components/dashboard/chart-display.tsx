import { useEffect, useId, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Minus, Plus, RotateCcw, X } from 'lucide-react';
import type { ViewId } from './sidebar';
import { ChartLink } from './chart-link';
import { t, useLanguage } from '@/lib/i18n';

const SIZES = [60, 80, 100] as const;
const OVERLAY_SIZES = [70, 85, 100] as const;

/** A chart grows in a viewport-fitted dialog, never by stretching the dashboard.
 * Shrinking works inline; plus at 100% opens the larger dialog. Controls are
 * siblings of the overview chart's navigation button, never nested inside it. */
export function ChartDisplay({
  id, label, children, view, onNavigate,
}: {
  id: string;
  label: string;
  children: ReactNode;
  view?: ViewId;
  onNavigate?: (view: ViewId) => void;
}) {
  useLanguage();
  const titleId = useId();
  const [inlineIndex, setInlineIndex] = useState(2);
  const [overlayIndex, setOverlayIndex] = useState<number | null>(null);
  const expanded = overlayIndex !== null;

  useEffect(() => {
    if (!expanded) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOverlayIndex(null);
    };
    window.addEventListener('keydown', escape);
    const close = document.getElementById(`close-chart-${id}`);
    close?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', escape);
      previousFocus?.focus();
    };
  }, [expanded, id]);

  function smaller() {
    if (overlayIndex !== null) {
      if (overlayIndex === 0) setOverlayIndex(null);
      else setOverlayIndex(overlayIndex - 1);
    } else setInlineIndex((n) => Math.max(0, n - 1));
  }

  function larger() {
    if (overlayIndex !== null) setOverlayIndex((n) => Math.min(OVERLAY_SIZES.length - 1, (n ?? 0) + 1));
    else if (inlineIndex < SIZES.length - 1) setInlineIndex(inlineIndex + 1);
    else setOverlayIndex(1);
  }

  function reset() {
    setInlineIndex(2);
    setOverlayIndex(null);
  }

  const controls = (overlay: boolean) => (
    <div className="flex shrink-0 items-center justify-end gap-1">
      <span className="mr-1 font-mono text-[10px] tabular-nums text-muted-foreground" aria-live="polite">
        {overlay ? `${t('Fenster')} ${OVERLAY_SIZES[overlayIndex ?? 1]} %` : `${t('Größe')} ${SIZES[inlineIndex]} %`}
      </span>
      <button type="button" data-testid={`button-chart-minus-${id}${overlay ? '-large' : ''}`}
        aria-label={`${label} ${t('verkleinern')}`} title={t('Diagramm verkleinern')}
        disabled={!overlay && inlineIndex === 0} onClick={smaller}
        className="grid size-6 place-items-center rounded border border-border text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-35">
        <Minus className="size-3.5" />
      </button>
      <button type="button" data-testid={`button-chart-plus-${id}${overlay ? '-large' : ''}`}
        aria-label={`${label} ${t('vergrößern')}`} title={t(overlay ? 'Diagramm vergrößern' : inlineIndex === 2 ? 'Vergrößern – Fensteransicht öffnen' : 'Diagramm vergrößern')}
        disabled={overlay && overlayIndex === OVERLAY_SIZES.length - 1} onClick={larger}
        className="grid size-6 place-items-center rounded border border-border text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-35">
        <Plus className="size-3.5" />
      </button>
      <button type="button" data-testid={`button-chart-reset-${id}${overlay ? '-large' : ''}`}
        aria-label={`${label} ${t('auf Standardgröße zurücksetzen')}`} title={t('Größe zurücksetzen')}
        disabled={!overlay && inlineIndex === 2} onClick={reset}
        className="grid size-6 place-items-center rounded border border-border text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-35">
        <RotateCcw className="size-3" />
      </button>
    </div>
  );

  return (
    <>
      <div className="flex min-h-0 w-full flex-1 flex-col">
        {controls(false)}
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
          <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col transition-transform duration-200"
            style={{ transform: `scale(${SIZES[inlineIndex] / 100})` }}>
            {!expanded && (view && onNavigate
              ? <ChartLink view={view} label={label} onNavigate={onNavigate}>{children}</ChartLink>
              : children)}
          </div>
        </div>
      </div>
      {expanded && createPortal(
        <div className="fixed inset-0 z-[100] grid place-items-center bg-[hsl(var(--background)/.88)] p-3 backdrop-blur-sm"
          onMouseDown={(event) => { if (event.target === event.currentTarget) setOverlayIndex(null); }}>
          <div role="dialog" aria-modal="true" aria-labelledby={titleId}
            onKeyDown={(event) => {
              if (event.key !== 'Tab') return;
              const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));
              const first = buttons[0], last = buttons[buttons.length - 1];
              if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
              if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
            }}
            className="flex max-h-[calc(100dvh-24px)] min-h-0 max-w-[calc(100vw-24px)] flex-col rounded-xl border border-border bg-card p-3 shadow-2xl sm:p-5"
            style={{ width: `${OVERLAY_SIZES[overlayIndex ?? 1]}vw`, height: `${OVERLAY_SIZES[overlayIndex ?? 1]}dvh` }}>
            <div className="mb-3 flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
              <h2 id={titleId} className="text-sm font-semibold">{label} · {t('vergrößerte Ansicht')}</h2>
              <div className="flex items-center gap-2">
                {controls(true)}
                <button id={`close-chart-${id}`} type="button" data-testid={`button-chart-close-${id}`}
                  aria-label={t('Vergrößertes Diagramm schließen')} onClick={() => setOverlayIndex(null)}
                  className="grid size-7 place-items-center rounded border border-border hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary">
                  <X className="size-4" />
                </button>
              </div>
            </div>
            <div className="flex min-h-0 flex-1 flex-col">{children}</div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}