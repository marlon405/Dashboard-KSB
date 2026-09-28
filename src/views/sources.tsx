import { ExternalLink, KeyRound, ShieldAlert } from 'lucide-react';
import type { SourceState, useDashboard } from '@/data';
import { SOURCE_LINKS } from '@/config';
import { Panel, type Accent } from '@/components/dashboard/panel';
import { FetchLine, StatusBadge } from '@/components/dashboard/source-state';
import { t, translateError, useLanguage } from '@/lib/i18n';

type D = ReturnType<typeof useDashboard>;

function SourceCard({ id, title, what, state, extra, accent }: { accent: Accent; id: keyof typeof SOURCE_LINKS; title: string; what: string; state: SourceState<unknown>; extra: string }) {
  useLanguage();
  const s = SOURCE_LINKS[id];
  return (
    <Panel testId={`panel-source-${id}`} accent={accent} title={t(title)} aside={<StatusBadge state={state} />}>
      <div className="flex flex-1 flex-col gap-2 text-xs">
        <div className="font-medium">{s.name}</div>
        <p className="leading-relaxed text-muted-foreground">{t(what)}</p>
        <p className="leading-relaxed text-muted-foreground">{t(extra)}</p>
        {state.error && <p className="text-destructive">{t('Letzte Meldung:')} {translateError(state.error)}</p>}
        <FetchLine state={state} className="mt-auto" />
        <div className="flex flex-wrap gap-2 pt-1">
          <a data-testid={`link-data-${id}`} href={s.data} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 font-medium text-primary hover:bg-muted">{t('Datenquelle anzeigen')}<ExternalLink className="size-3" /></a>
          {id === 'water' && <a data-testid="link-data-water-history" href={SOURCE_LINKS.water.history} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 font-medium text-primary hover:bg-muted">{t('Messverlauf')}<ExternalLink className="size-3" /></a>}
          <a data-testid={`link-doc-${id}`} href={s.docs} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 font-medium text-primary hover:bg-muted">{t('Dokumentation')}<ExternalLink className="size-3" /></a>
        </div>
      </div>
    </Panel>
  );
}

export function SourcesView({ d }: { d: D }) {
  useLanguage();
  return (
    <div className="grid gap-3 lg:h-full lg:min-h-0 lg:grid-rows-[1fr_auto]">
      <div className="grid gap-3 lg:min-h-0 lg:grid-cols-3">
        <SourceCard accent="fire" id="fire" title="Feuerwehr" state={d.fire} what="Tägliche Einsatzdaten als CSV. Ausgewertet wird ausschließlich die Spalte mission_count_fire für den vorherigen Kalendertag (Europe/Berlin)." extra="Fehlt der Vortag, wird dies ausdrücklich angezeigt. Doppelte oder ungültige Datensätze werden nicht ungeprüft summiert." />
        <SourceCard accent="water" id="water" title="Pegelstand" state={d.water} what="Offizielle REST-Schnittstelle der Wasserstraßen- und Schifffahrtsverwaltung. Messgröße Wasserstand (W) der Station BERLIN-KÖPENICK." extra="Angezeigt werden Rohwert, Einheit und Messzeitpunkt laut Quelle. Keine Gefahreneinschätzung." />
        <SourceCard accent="weather" id="weather" title="Wetter" state={d.weather} what="Tagesprognose für Berlin (heute und sieben Folgetage). Wettercodes nach WMO-Schlüssel der Open-Meteo-Dokumentation." extra="Prognosen sind Modellwerte und keine amtlichen Unwetterwarnungen. Amtliche Warnungen gibt der Deutsche Wetterdienst heraus." />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <section className="rise flex gap-3 rounded-lg border border-accent/30 bg-accent/[0.04] p-3.5">
          <ShieldAlert className="size-5 shrink-0 text-accent" />
          <div className="text-xs leading-relaxed">
            <div className="font-semibold">{t('Prototyp, keine amtliche Gefahreninformation')}</div>
            <p className="text-muted-foreground">{t('Dieses Dashboard bündelt öffentlich verfügbare Daten zur Orientierung. Es ersetzt weder amtliche Warnungen noch Lagemeldungen der zuständigen Stellen.')}</p>
          </div>
        </section>
        <section className="rise flex gap-3 rounded-lg border border-border bg-card p-3.5">
          <KeyRound className="size-5 shrink-0 text-primary" />
          <div className="text-xs leading-relaxed">
            <div className="font-semibold">{t('Anmeldung ist nur simuliert')}</div>
            <p className="text-muted-foreground">{t('Die Demo-Zugangsdaten liegen im Frontend-Code (src/config.ts). In der Browser-Sitzung wird nur der Anmeldestatus gespeichert, nie das Passwort. Kein wirksamer Schutz vertraulicher Daten.')}</p>
          </div>
        </section>
      </div>
      <span className="sr-only">{t('Stand:')} {d.lastCompiledAt ?? t('noch nicht zusammengestellt')}</span>
    </div>
  );
}
