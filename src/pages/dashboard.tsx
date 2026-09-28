import { useState } from 'react';
import { useDashboard } from '@/data';
import { Sidebar, VIEWS, type ViewId } from '@/components/dashboard/sidebar';
import { TopBar } from '@/components/dashboard/top-bar';
import { OverviewView } from '@/views/overview';
import { WeatherView } from '@/views/weather';
import { FireView } from '@/views/fire';
import { WaterView } from '@/views/water';
import { SourcesView } from '@/views/sources';
import { NotesView } from '@/views/notes';
import { exportDashboardCsv } from '@/lib/export-csv';
import { t, useLanguage } from '@/lib/i18n';

export function DashboardPage({ onLogout }: { onLogout: () => void }) {
  const { language } = useLanguage();
  const [view, setView] = useState<ViewId>('overview');
  const d = useDashboard();
  const busy = d.fire.loading || d.water.loading || d.weather.loading;
  const title = view === 'notes' ? (language === 'en' ? 'Notes' : 'Notizen') : t(VIEWS.find((v) => v.id === view)?.label ?? '');

  return (
    <div className="flex min-h-[100dvh] bg-background lg:h-[100dvh]">
      <Sidebar view={view} onChange={setView} onLogout={onLogout} />
      <div className="flex min-w-0 flex-1 flex-col lg:min-h-0">
        <TopBar title={title} lastCompiledAt={d.lastCompiledAt} busy={busy} onRefresh={d.refresh} onLogout={onLogout} onExport={view === 'notes' ? undefined : () => exportDashboardCsv(view, d)} />
        <main key={view} className="flex flex-1 flex-col p-3 pb-20 lg:min-h-0 lg:p-4 lg:pb-4" data-testid={`view-${view}`}>
          {view === 'overview' && <OverviewView d={d} onNavigate={setView} />}
          {view === 'weather' && <WeatherView d={d} />}
          {view === 'fire' && <FireView d={d} />}
          {view === 'water' && <WaterView d={d} />}
          {view === 'sources' && <SourcesView d={d} />}
          {view === 'notes' && <NotesView d={d} />}
        </main>
        <footer className="hidden border-t border-border px-4 py-1 text-[10.5px] text-muted-foreground lg:block">
          {t('Prototyp · keine amtliche Gefahreninformation · Frontend-Login ohne wirksamen Schutz')}
        </footer>
      </div>
    </div>
  );
}
