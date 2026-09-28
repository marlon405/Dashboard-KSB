import { z } from 'zod';
import type { useDashboard, SourceState } from '@/data';

export const NOTES_KEY = 'berlin-dashboard.notes.v1';
const text = (max: number) => z.string().min(1).max(max);
const timestamp = z.string().datetime({ offset: true });
const value = z.number().finite().nullable();
const sourceMeta = z.object({
  lastSuccess: timestamp.nullable(),
  stale: z.boolean(),
  loading: z.boolean(),
  error: z.string().max(1000).nullable(),
}).strict();
const snapshotSchema = z.object({
  fire: sourceMeta.extend({ date: z.string().max(32).nullable(), count: value, latestDate: z.string().max(32).nullable(), latestCount: value }),
  water: sourceMeta.extend({ station: z.string().max(150).nullable(), measuredAt: timestamp.nullable(), value, unit: z.string().max(40).nullable() }),
  weather: sourceMeta.extend({
    reference: z.string().max(150).nullable(), date: z.string().max(32).nullable(),
    description: z.string().max(150).nullable(), min: value, max: value,
    rainProbability: value, wind: value,
  }),
}).strict();
const replySchema = z.object({ id: z.string().uuid(), author: text(80), body: text(2000), createdAt: timestamp }).strict();
const noteSchema = z.object({
  id: z.string().uuid(), title: text(140), description: text(4000),
  author: text(80), createdAt: timestamp, snapshot: snapshotSchema,
  replies: z.array(replySchema).max(2000),
}).strict();
const documentSchema = z.object({ version: z.literal(1), notes: z.array(noteSchema).max(5000) }).strict();
export type Note = z.infer<typeof noteSchema>;
export type NoteSnapshot = Note['snapshot'];
export type NotesDocument = z.infer<typeof documentSchema>;
export type NoteInput = Pick<Note, 'title' | 'description' | 'author'>;
export type ReplyInput = Pick<Note['replies'][number], 'author' | 'body'>;
type Dashboard = ReturnType<typeof useDashboard>;

export class NotesStoreError extends Error {
  constructor(public readonly code: 'unavailable' | 'corrupt' | 'write' | 'invalid', message: string) { super(message); }
}
const clean = (s: string, max: number) => s.trim().slice(0, max);
const meta = (s: SourceState<unknown>) => ({
  lastSuccess: s.lastSuccess, stale: s.stale, loading: s.loading, error: s.error ? clean(s.error, 1000) : null,
});

/** Deliberately copies only concise source observations. No histories or live state references. */
export function captureSnapshot(d: Dashboard): NoteSnapshot {
  const f = d.fire.data, w = d.water.data, day = d.weather.data?.days[0];
  return {
    fire: { ...meta(d.fire), date: f?.date ?? null, count: f?.count ?? null, latestDate: f?.latest?.date ?? null, latestCount: f?.latest?.count ?? null },
    water: { ...meta(d.water), station: w?.station ?? null, measuredAt: w?.measuredAt ?? null, value: w?.value ?? null, unit: w?.unit ?? null },
    weather: {
      ...meta(d.weather), reference: d.weather.data?.reference ?? null, date: day?.date ?? null,
      description: day?.description ?? null, min: day?.min ?? null, max: day?.max ?? null,
      rainProbability: day?.rainProbability ?? null, wind: day?.wind ?? null,
    },
  };
}
export function readNotes(storage: Pick<Storage, 'getItem'> = localStorage): NotesDocument {
  let raw: string | null;
  try { raw = storage.getItem(NOTES_KEY); }
  catch { throw new NotesStoreError('unavailable', 'Local browser storage cannot be read. Check browser permissions.'); }
  if (raw === null) return { version: 1, notes: [] };
  try {
    const parsed = documentSchema.safeParse(JSON.parse(raw));
    if (parsed.success) return parsed.data;
  } catch { /* malformed data is retained, never reset */ }
  throw new NotesStoreError('corrupt', 'Stored notes are invalid or from an unsupported version. No changes were made; preserve or export the browser storage before proceeding.');
}
function save(doc: NotesDocument, storage: Pick<Storage, 'setItem'>) {
  try { storage.setItem(NOTES_KEY, JSON.stringify(doc)); }
  catch { throw new NotesStoreError('write', 'Could not save to this browser (storage blocked or full). Your entry has not been posted.'); }
}
function required(input: string, max: number, field: string) {
  const trimmed = input.trim();
  if (!trimmed || trimmed.length > max) throw new NotesStoreError('invalid', `${field} must contain 1–${max} characters.`);
  return trimmed;
}
export function addNote(input: NoteInput, dashboard: Dashboard, storage: Pick<Storage, 'getItem' | 'setItem'> = localStorage): NotesDocument {
  const title = required(input.title, 140, 'Title');
  const description = required(input.description, 4000, 'Description');
  const author = required(input.author, 80, 'Display name');
  const current = readNotes(storage); // always reread just before append
  const note: Note = {
    id: crypto.randomUUID(), title, description, author, createdAt: new Date().toISOString(),
    snapshot: captureSnapshot(dashboard), replies: [],
  };
  const next = documentSchema.parse({ version: 1, notes: [...current.notes, note] });
  save(next, storage); // never show success before the write completes
  return next;
}
export function addReply(noteId: string, input: ReplyInput, storage: Pick<Storage, 'getItem' | 'setItem'> = localStorage): NotesDocument {
  const author = required(input.author, 80, 'Display name');
  const body = required(input.body, 2000, 'Reply');
  const current = readNotes(storage);
  if (!current.notes.some((n) => n.id === noteId)) throw new NotesStoreError('invalid', 'This note no longer exists in local storage.');
  const next = documentSchema.parse({
    version: 1,
    notes: current.notes.map((n) => n.id === noteId
      ? { ...n, replies: [...n.replies, { id: crypto.randomUUID(), author, body, createdAt: new Date().toISOString() }] }
      : n),
  });
  save(next, storage);
  return next;
}