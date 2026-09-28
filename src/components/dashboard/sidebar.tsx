import { BookOpen, CloudSun, FileText, Flame, LayoutGrid, LogOut, Waves } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getLanguage, t, useLanguage } from '@/lib/i18n';

export type ViewId = 'overview' | 'weather' | 'fire' | 'water' | 'notes' | 'sources';

export const VIEWS: { id: ViewId; label: string; short: string; icon: typeof Flame }[] = [
  { id: 'overview', label: 'Übersicht', short: 'Übersicht', icon: LayoutGrid },
  { id: 'weather', label: 'Wetter und 7-Tage-Prognose', short: 'Wetter', icon: CloudSun },
  { id: 'fire', label: 'Feuerwehr', short: 'Feuerwehr', icon: Flame },
  { id: 'water', label: 'Pegelstand', short: 'Pegel', icon: Waves },
  { id: 'notes', label: 'Notizen', short: 'Notizen', icon: FileText },
  { id: 'sources', label: 'Quellen und Informationen', short: 'Quellen', icon: BookOpen },
];
const labelFor = (id: ViewId, text: string) => id === 'notes' && getLanguage() === 'en' ? 'Notes' : t(text);

function Mark() {
  return (
    <div className="grid size-9 place-items-center rounded-md bg-sidebar-primary font-mono text-[11px] font-bold text-sidebar-primary-foreground" aria-hidden>
      B
    </div>
  );
}

export function Sidebar({ view, onChange, onLogout }: { view: ViewId; onChange: (v: ViewId) => void; onLogout: () => void }) {
  useLanguage();
  return (
    <>
      <nav aria-label={t('Hauptnavigation')} className="hidden w-[76px] shrink-0 flex-col items-center gap-1 border-r border-sidebar-border bg-sidebar py-3 lg:flex">
        <Mark />
        <div className="my-2 h-px w-8 bg-sidebar-border" />
        {VIEWS.map(({ id, short, label, icon: Icon }) => {
          const active = view === id;
          return (
            <button
              key={id}
              data-testid={`nav-${id}`}
              onClick={() => onChange(id)}
              aria-current={active ? 'page' : undefined}
              title={labelFor(id, label)}
              className={cn(
                'relative flex w-[64px] flex-col items-center gap-1 rounded-md px-1 py-2 text-[10px] font-medium transition-colors',
                active ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
              )}
            >
              {active && <span className="absolute left-[-6px] top-2 bottom-2 w-[3px] rounded-r bg-sidebar-primary" />}
              <Icon className="size-[18px]" strokeWidth={1.75} />
              <span className="leading-tight">{labelFor(id, short)}</span>
            </button>
          );
        })}
        <button data-testid="button-logout" onClick={onLogout} title={t('Abmelden')} className="mt-auto flex w-[64px] flex-col items-center gap-1 rounded-md py-2 text-[10px] text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground">
          <LogOut className="size-[18px]" strokeWidth={1.75} />{t('Abmelden')}
        </button>
      </nav>

      <nav aria-label={t('Hauptnavigation mobil')} className="fixed inset-x-0 bottom-0 z-30 flex border-t border-sidebar-border bg-sidebar lg:hidden">
        {VIEWS.map(({ id, short, icon: Icon }) => (
          <button key={id} data-testid={`nav-mobile-${id}`} onClick={() => onChange(id)} aria-current={view === id ? 'page' : undefined}
            className={cn('flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px]', view === id ? 'text-sidebar-accent-foreground' : 'text-sidebar-foreground/65')}>
            <Icon className={cn('size-[18px]', view === id && 'text-sidebar-primary')} strokeWidth={1.75} />{labelFor(id, short)}
          </button>
        ))}
      </nav>
    </>
  );
}
