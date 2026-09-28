import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowLeft, ArrowRight, FileText, MessageSquare, Plus, ShieldAlert, X } from 'lucide-react';
import type { useDashboard } from '@/data';
import { Form } from '@/components/ui/form';
import { getLanguage, getLocale, translateError, useLanguage } from '@/lib/i18n';
import { num } from '@/lib/format';
import { NOTES_KEY, NotesStoreError, addNote, addReply, readNotes, type Note, type NotesDocument, type NoteSnapshot } from '@/lib/notes-store';

type Dashboard = ReturnType<typeof useDashboard>;
const copy = {
  notes: ['Notizen', 'Notes'], new: ['Neue Notiz', 'New note'],
  intro: ['Beobachtungen und Rückfragen zum Lagebild. Quellenwerte werden beim Erstellen festgehalten.', 'Observations and questions about the situation. Source values are captured when a note is created.'],
  local: ['Nur in diesem Browser gespeichert · nicht geteilt oder synchronisiert. Anzeigenamen sind frei eingegeben und nicht verifiziert.', 'Stored only in this browser · not shared or synced. Display names are freely entered and not verified.'],
  empty: ['Noch keine Notizen', 'No notes yet'], emptyText: ['Beginnen Sie mit einer Beobachtung zum aktuellen Lagebild.', 'Start with an observation about the current situation.'],
  title: ['Titel', 'Title'], description: ['Beschreibung', 'Description'], name: ['Anzeigename (frei eingegeben)', 'Display name (self-entered)'],
  create: ['Notiz speichern', 'Save note'], cancel: ['Abbrechen', 'Cancel'], back: ['Alle Notizen', 'All notes'],
  reply: ['Antwort', 'Reply'], replies: ['Antworten', 'Replies'], respond: ['Antwort schreiben', 'Write a reply'],
  body: ['Ihre Antwort', 'Your reply'], send: ['Antwort speichern', 'Save reply'], saved: ['Lokal gespeichert', 'Saved locally'],
  retry: ['Erneut laden', 'Reload'], snapshot: ['Lagebild beim Erstellen', 'Source values at creation'],
  snapshotInfo: ['Diese Momentaufnahme bleibt unverändert. Mess- und Referenzdaten können älter sein als die Notiz.', 'This snapshot does not change. Measurement and reference dates may predate the note.'],
  fire: ['Feuerwehr · Brandeinsätze', 'Fire service · incidents'], water: ['Pegel · Wasserstand', 'Gauge · water level'],
  weather: ['Wetter · Prognose', 'Weather · forecast'], target: ['Zieldatum', 'Target date'], latest: ['Letzter verfügbarer Wert', 'Latest available value'],
  station: ['Station', 'Station'], measured: ['Messzeitpunkt der Quelle', 'Source measurement time'], forecast: ['Prognosedatum', 'Forecast date'],
  range: ['Temperatur', 'Temperature'], rain: ['Regenwahrscheinlichkeit', 'Rain probability'], wind: ['Wind', 'Wind'],
  fetched: ['Letzter erfolgreicher Abruf', 'Last successful fetch'], noFetch: ['kein Abruf', 'no fetch'],
  missing: ['kein Wert', 'no value'], stale: ['veraltet', 'stale'], current: ['aktuell', 'current'],
  loading: ['Abruf läuft', 'fetching'], error: ['Abruffehler', 'fetch error'], noData: ['keine Daten', 'no data'],
  sourceError: ['Fehler der Quelle', 'Source error'], at: ['Erstellt', 'Created'],
  responseCount: ['Antworten', 'replies'],
  notFound: ['Notiz nicht mehr vorhanden.', 'Note no longer available.'],
  invalid: ['Bitte gültige Eingaben innerhalb der Zeichenlimits eingeben.', 'Please provide valid entries within the character limits.'],
} as const;
type CopyKey = keyof typeof copy;
function n(key: CopyKey) { return copy[key][getLanguage() === 'en' ? 1 : 0]; }
function storageMessage(reason: unknown): string {
  if (!(reason instanceof NotesStoreError)) return reason instanceof Error ? reason.message : String(reason);
  if (getLanguage() === 'en') return reason.message;
  switch (reason.code) {
    case 'corrupt': return 'Gespeicherte Notizen sind beschädigt oder haben eine unbekannte Version. Es wurde nichts verändert. Bitte die Browserdaten sichern, bevor Sie fortfahren.';
    case 'unavailable': return 'Der lokale Browserspeicher kann nicht gelesen werden. Bitte Browsereinstellungen prüfen.';
    case 'write': return 'Speichern im Browser fehlgeschlagen (Speicher gesperrt oder voll). Ihr Beitrag wurde nicht veröffentlicht.';
    case 'invalid': return 'Ungültige Eingabe oder die Notiz ist nicht mehr vorhanden.';
  }
}
function fmtDate(date: string | null) {
  if (!date) return n('missing');
  const parsed = new Date(`${date}T12:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? date : new Intl.DateTimeFormat(getLocale(), { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }).format(parsed);
}
function timestamp(date: string | null) {
  return date ? new Intl.DateTimeFormat(getLocale(), {
    timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
  }).format(new Date(date)) : n('missing');
}
function count(value: number | null, unit = '') { return value === null ? n('missing') : `${num(value)}${unit ? ` ${unit}` : ''}`; }
function sourceStatus(source: { error: string | null; stale: boolean; loading: boolean; lastSuccess: string | null }) {
  if (source.error) return n('error');
  if (source.stale) return n('stale');
  if (source.loading) return n('loading');
  return source.lastSuccess ? n('current') : n('noData');
}
function SnapshotCard({ label, source, children }: { label: string; source: Pick<NoteSnapshot['fire'], 'error' | 'stale' | 'loading' | 'lastSuccess'>; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-card p-4" data-testid={`snapshot-${label}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <h4 className="text-xs font-semibold uppercase tracking-[.12em]">{label}</h4>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">{sourceStatus(source)}</span>
      </div>
      <div className="space-y-2 pt-3 text-xs">{children}</div>
      <div className="mt-3 border-t border-border pt-3 text-[11px] text-muted-foreground">
        {n('fetched')}: <span className="font-mono">{source.lastSuccess ? timestamp(source.lastSuccess) : n('noFetch')}</span>
        {source.error && <div className="mt-1 break-words text-destructive">{n('sourceError')}: {translateError(source.error)}</div>}
      </div>
    </section>
  );
}
function Datum({ label, value }: { label: string; value: string }) {
  return <div className="flex items-start justify-between gap-4"><span className="text-muted-foreground">{label}</span><span className="max-w-[62%] text-right font-mono tabular-nums break-words">{value}</span></div>;
}
function Snapshot({ snapshot }: { snapshot: NoteSnapshot }) {
  const f = snapshot.fire, w = snapshot.water, weather = snapshot.weather;
  return (
    <section className="space-y-3" data-testid="section-note-snapshot">
      <div><h3 className="text-base font-semibold">{n('snapshot')}</h3><p className="mt-1 text-xs text-muted-foreground">{n('snapshotInfo')}</p></div>
      <div className="grid gap-3 xl:grid-cols-3">
        <SnapshotCard label={n('fire')} source={f}>
          <Datum label={n('target')} value={fmtDate(f.date)} />
          <Datum label={n('fire')} value={count(f.count)} />
          <Datum label={n('latest')} value={`${count(f.latestCount)} · ${fmtDate(f.latestDate)}`} />
        </SnapshotCard>
        <SnapshotCard label={n('water')} source={w}>
          <Datum label={n('station')} value={w.station ?? n('missing')} />
          <Datum label={n('water')} value={count(w.value, w.unit ?? '')} />
          <Datum label={n('measured')} value={timestamp(w.measuredAt)} />
        </SnapshotCard>
        <SnapshotCard label={n('weather')} source={weather}>
          <Datum label={n('forecast')} value={fmtDate(weather.date)} />
          <Datum label={n('weather')} value={weather.description ?? n('missing')} />
          <Datum label={n('range')} value={`${count(weather.min, '°C')} – ${count(weather.max, '°C')}`} />
          <Datum label={n('rain')} value={count(weather.rainProbability, '%')} />
          <Datum label={n('wind')} value={count(weather.wind, 'km/h')} />
          <Datum label="Referenz / Reference" value={weather.reference ?? n('missing')} />
        </SnapshotCard>
      </div>
    </section>
  );
}

type NewFields = { title: string; description: string; author: string };
type ReplyFields = { author: string; body: string };
const fieldClass = 'w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring';
function Field({ label, id, error, children }: { label: string; id: string; error?: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><label htmlFor={id} className="block text-xs font-semibold">{label}</label>{children}{error && <p role="alert" className="text-xs text-destructive">{n('invalid')}</p>}</div>;
}

export function NotesView({ d }: { d: Dashboard }) {
  useLanguage();
  const [document, setDocument] = useState<NotesDocument | null>(null);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [composing, setComposing] = useState(false);
  const [replying, setReplying] = useState(false);
  const [saving, setSaving] = useState(false);
  const newForm = useForm<NewFields>({ defaultValues: { title: '', description: '', author: '' } });
  const replyForm = useForm<ReplyFields>({ defaultValues: { author: '', body: '' } });
  const load = () => {
    try { setDocument(readNotes()); setStorageError(null); }
    catch (reason) { setDocument(null); setStorageError(storageMessage(reason)); }
  };
  useEffect(() => {
    load();
    const onStorage = (event: StorageEvent) => { if (event.key === NOTES_KEY || event.key === null) load(); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  const selected = document?.notes.find((note) => note.id === selectedId);
  const sorted = [...(document?.notes ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const create = (fields: NewFields) => {
    setSaving(true); setSubmitError(null);
    try {
      const next = addNote(fields, d);
      setDocument(next); setSelectedId(next.notes[next.notes.length - 1].id);
      setComposing(false); newForm.reset();
    } catch (reason) {
      setSubmitError(storageMessage(reason));
      if (reason instanceof NotesStoreError && reason.code === 'corrupt') load();
    } finally { setSaving(false); }
  };
  const reply = (fields: ReplyFields) => {
    if (!selectedId) return;
    setSaving(true); setSubmitError(null);
    try {
      setDocument(addReply(selectedId, fields));
      setReplying(false); replyForm.reset();
    } catch (reason) {
      setSubmitError(storageMessage(reason));
      if (reason instanceof NotesStoreError && reason.code === 'corrupt') load();
    } finally { setSaving(false); }
  };
  const closeDetail = () => { setSelectedId(null); setReplying(false); setSubmitError(null); };
  const closeCompose = () => { setComposing(false); setSubmitError(null); };
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-border bg-card" data-testid="notes-page">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border bg-muted/35 p-4 sm:p-5">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2 text-primary"><FileText className="size-4" /><span className="text-[10px] font-bold uppercase tracking-[.17em]">LAGE / FIELD LOG</span></div>
          <h2 className="text-xl font-semibold tracking-tight">{n('notes')}</h2>
          <p className="mt-1 max-w-2xl text-xs text-muted-foreground">{n('intro')}</p>
        </div>
        {!selectedId && !composing && document && <button type="button" data-testid="button-new-note" onClick={() => { setComposing(true); setSubmitError(null); }} className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring"><Plus className="size-4" />{n('new')}</button>}
      </div>
      <div className="flex items-start gap-2 border-b border-border bg-secondary/50 px-4 py-3 text-xs text-secondary-foreground sm:px-5" data-testid="notice-local-only">
        <ShieldAlert className="mt-0.5 size-4 shrink-0" /><p>{n('local')}</p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
        {storageError ? <div role="alert" data-testid="error-notes-storage" className="max-w-2xl rounded-md border border-destructive/40 bg-destructive/5 p-5 text-sm"><strong className="block text-destructive">{getLanguage() === 'en' ? 'Storage error' : 'Speicherfehler'}</strong><p className="mt-2 break-words">{storageError}</p><button type="button" data-testid="button-retry-notes" onClick={load} className="mt-4 rounded-md border border-border px-3 py-2 hover:bg-muted">{n('retry')}</button></div>
          : document === null ? <div className="animate-pulse space-y-3" aria-label="Loading"><div className="h-16 rounded bg-muted" /><div className="h-16 rounded bg-muted" /></div>
          : composing ? (
            <div className="mx-auto max-w-2xl">
              <div className="mb-5 flex items-center justify-between"><h3 className="text-lg font-semibold">{n('new')}</h3><button type="button" data-testid="button-cancel-note" onClick={closeCompose} aria-label={n('cancel')} className="rounded p-2 hover:bg-muted"><X className="size-4" /></button></div>
              <Form {...newForm}><form onSubmit={newForm.handleSubmit(create)} className="space-y-5">
                <Field id="note-title" label={n('title')} error={newForm.formState.errors.title?.message}><input id="note-title" data-testid="input-note-title" maxLength={140} className={fieldClass} {...newForm.register('title', { validate: (s) => !!s.trim() && s.trim().length <= 140 })} /></Field>
                <Field id="note-description" label={n('description')} error={newForm.formState.errors.description?.message}><textarea id="note-description" data-testid="input-note-description" rows={7} maxLength={4000} className={fieldClass} {...newForm.register('description', { validate: (s) => !!s.trim() && s.trim().length <= 4000 })} /></Field>
                <Field id="note-author" label={n('name')} error={newForm.formState.errors.author?.message}><input id="note-author" data-testid="input-note-author" maxLength={80} className={fieldClass} autoComplete="off" {...newForm.register('author', { validate: (s) => !!s.trim() && s.trim().length <= 80 })} /></Field>
                {submitError && <p role="alert" data-testid="error-note-submit" className="text-sm text-destructive">{submitError}</p>}
                <div className="flex flex-wrap gap-2"><button type="submit" data-testid="button-save-note" disabled={saving} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">{n('create')}</button><button type="button" data-testid="button-cancel-note-form" onClick={closeCompose} className="rounded-md border border-border px-4 py-2 text-sm">{n('cancel')}</button></div>
              </form></Form>
            </div>
          ) : selectedId ? selected ? (
            <article className="mx-auto max-w-5xl space-y-7" data-testid={`detail-note-${selected.id}`}>
              <button type="button" data-testid="button-back-notes" onClick={closeDetail} className="inline-flex items-center gap-2 rounded text-xs font-semibold text-primary hover:underline focus-visible:ring-2 focus-visible:ring-ring"><ArrowLeft className="size-4" />{n('back')}</button>
              <div className="border-b border-border pb-6">
                <p className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">{n('at')} · {timestamp(selected.createdAt)}</p>
                <h3 className="mt-2 break-words text-2xl font-semibold tracking-tight sm:text-3xl" data-testid="text-note-title">{selected.title}</h3>
                <p className="mt-2 text-xs text-muted-foreground" data-testid="text-note-author">{selected.author} · {n('name')}</p>
                <p className="mt-5 whitespace-pre-wrap break-words text-sm leading-7" data-testid="text-note-description">{selected.description}</p>
              </div>
              <Snapshot snapshot={selected.snapshot} />
              <section className="border-t border-border pt-6">
                <div className="mb-4 flex items-center gap-2"><MessageSquare className="size-4 text-primary" /><h3 className="font-semibold">{n('replies')} <span className="font-mono text-xs text-muted-foreground" data-testid="text-reply-count">({selected.replies.length})</span></h3></div>
                <div className="space-y-2">{selected.replies.map((r) => <div key={r.id} className="rounded-md border border-border bg-muted/30 p-4" data-testid={`reply-${r.id}`}><div className="flex flex-wrap justify-between gap-1 text-xs"><strong className="break-words">{r.author}</strong><span className="font-mono text-muted-foreground">{timestamp(r.createdAt)}</span></div><p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6">{r.body}</p></div>)}</div>
                {!replying ? <button type="button" data-testid="button-write-reply" onClick={() => { setReplying(true); setSubmitError(null); }} className="mt-5 inline-flex items-center gap-2 rounded-md border border-primary px-4 py-2 text-xs font-semibold text-primary hover:bg-muted"><Plus className="size-4" />{n('respond')}</button> :
                  <Form {...replyForm}><form onSubmit={replyForm.handleSubmit(reply)} className="mt-5 max-w-2xl space-y-4 rounded-lg border border-border bg-muted/20 p-4">
                    <h4 className="text-sm font-semibold">{n('respond')}</h4>
                    <Field id="reply-author" label={n('name')} error={replyForm.formState.errors.author?.message}><input id="reply-author" data-testid="input-reply-author" maxLength={80} autoComplete="off" className={fieldClass} {...replyForm.register('author', { validate: (s) => !!s.trim() && s.trim().length <= 80 })} /></Field>
                    <Field id="reply-body" label={n('body')} error={replyForm.formState.errors.body?.message}><textarea id="reply-body" data-testid="input-reply-body" rows={4} maxLength={2000} className={fieldClass} {...replyForm.register('body', { validate: (s) => !!s.trim() && s.trim().length <= 2000 })} /></Field>
                    {submitError && <p role="alert" data-testid="error-reply-submit" className="text-sm text-destructive">{submitError}</p>}
                    <div className="flex gap-2"><button type="submit" data-testid="button-save-reply" disabled={saving} className="rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50">{n('send')}</button><button type="button" data-testid="button-cancel-reply" onClick={() => { setReplying(false); setSubmitError(null); }} className="rounded-md border border-border px-4 py-2 text-xs">{n('cancel')}</button></div>
                  </form></Form>}
              </section>
            </article>
          ) : <div role="status"><p>{n('notFound')}</p><button type="button" data-testid="button-back-missing-note" onClick={closeDetail} className="mt-3 text-primary underline">{n('back')}</button></div>
          : sorted.length === 0 ? <div className="mx-auto flex max-w-md flex-col items-center py-14 text-center"><div className="mb-5 grid size-16 place-items-center rounded-full bg-secondary"><FileText className="size-7 text-primary" /></div><h3 className="text-lg font-semibold">{n('empty')}</h3><p className="mt-2 text-sm text-muted-foreground">{n('emptyText')}</p><button type="button" data-testid="button-first-note" onClick={() => setComposing(true)} className="mt-6 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">{n('new')}</button></div>
          : <div className="mx-auto max-w-5xl space-y-2">{sorted.map((note: Note) =>
            <button key={note.id} type="button" data-testid={`button-note-${note.id}`} onClick={() => { setSelectedId(note.id); setSubmitError(null); }} className="group flex w-full items-center gap-4 rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-primary/50 hover:bg-muted/25 focus-visible:outline-2 focus-visible:outline-primary sm:p-5">
              <span className="grid size-10 shrink-0 place-items-center rounded-md bg-secondary text-primary"><FileText className="size-5" /></span>
              <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold group-hover:text-primary" data-testid={`text-note-list-title-${note.id}`}>{note.title}</span><span className="mt-1 block truncate text-xs text-muted-foreground">{note.author} · <span className="font-mono">{timestamp(note.createdAt)}</span></span></span>
              <span className="hidden shrink-0 items-center gap-1.5 text-xs text-muted-foreground sm:flex"><MessageSquare className="size-3.5" />{note.replies.length} {n('responseCount')}</span><ArrowRight className="size-4 shrink-0 text-muted-foreground" />
            </button>)}</div>}
      </div>
    </div>
  );
}