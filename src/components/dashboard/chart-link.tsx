import type { ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { ViewId } from './sidebar';
import { t, useLanguage } from '@/lib/i18n';

/** The entire chart, not merely an icon, navigates to its detail view. */
export function ChartLink({ view, label, onNavigate, children }: {
  view: ViewId;
  label: string;
  onNavigate: (view: ViewId) => void;
  children: ReactNode;
}) {
  useLanguage();
  return (
    <button
      type="button"
      data-testid={`button-overview-chart-${view}`}
      aria-label={`${label} – ${t('Detailansicht öffnen')}`}
      onClick={() => onNavigate(view)}
      className="group flex min-h-0 w-full flex-1 flex-col rounded-md p-1 text-left transition-colors hover:bg-muted/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <span className="flex min-h-0 w-full flex-1 flex-col">{children}</span>
      <span aria-hidden="true" className="mt-1 flex items-center gap-1 self-end text-[10px] font-medium text-primary group-hover:underline">
        {t('Details')} <ArrowUpRight className="size-3" />
      </span>
    </button>
  );
}