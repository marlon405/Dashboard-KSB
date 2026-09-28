import { useState, type FormEvent } from 'react';
import { AlertTriangle, ArrowRight, CloudSun, Eye, EyeOff, Flame, Lock, Waves } from 'lucide-react';
import { BerlinClock } from '@/components/dashboard/clock';
import { DisplayToggles } from '@/components/dashboard/theme-toggle';
import { t, useLanguage } from '@/lib/i18n';

const DOMAINS = [
  { label: 'Feuerwehr', text: 'Brandeinsätze des Vortags', icon: Flame, color: 'var(--fire)' },
  { label: 'Pegelstand', text: 'Messstelle Berlin-Köpenick', icon: Waves, color: 'var(--water)' },
  { label: 'Wetter', text: 'Heute und sieben Folgetage', icon: CloudSun, color: 'var(--weather)' },
];

export function LoginPage({ onLogin }: { onLogin: (u: string, p: string) => boolean }) {
  useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!username || !password) return setError('Bitte Benutzername und Passwort eingeben.');
    if (!onLogin(username, password)) {
      setError('Benutzername oder Passwort ist nicht korrekt.');
      setPassword('');
    }
  }

  const field = 'w-full rounded-lg border border-input bg-background/60 px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-4 focus:ring-primary/15';

  return (
    <div className="grid min-h-[100dvh] bg-background lg:grid-cols-[1.15fr_1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-sidebar-border bg-sidebar p-10 text-sidebar-foreground lg:flex">
        <div className="login-grid pointer-events-none absolute inset-0" aria-hidden />
        <div aria-hidden className="pointer-events-none absolute -left-24 top-1/3 size-[420px] rounded-full bg-[hsl(var(--water)/.10)] blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 right-0 size-[380px] rounded-full bg-[hsl(var(--fire)/.10)] blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-lg bg-sidebar-primary font-mono text-sm font-bold text-sidebar-primary-foreground">B</div>
          <div className="eyebrow !text-sidebar-foreground/80">{t('Katastrophenschutz · Land Berlin')}</div>
        </div>

        <div className="relative max-w-lg">
          <div className="eyebrow !text-[hsl(var(--water))]">{t('Interner Prototyp')}</div>
          <h1 className="mt-3 text-[52px] font-semibold leading-[1.02] tracking-tight text-sidebar-accent-foreground">{t('Lageübersicht Berlin')}</h1>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed">{t('Drei öffentliche Quellen auf einem Bildschirm, jeweils mit Datenstand und Abrufstatus.')}</p>
          <ul className="mt-8 grid gap-2.5">
            {DOMAINS.map(({ label, text, icon: Icon, color }) => (
              <li key={label} className="flex items-center gap-3.5 rounded-lg border border-sidebar-border bg-sidebar-accent/50 px-4 py-3">
                <span className="grid size-9 place-items-center rounded-md" style={{ background: `hsl(${color} / .15)`, color: `hsl(${color})` }}><Icon className="size-[18px]" /></span>
                <div>
                  <div className="text-sm font-semibold text-sidebar-accent-foreground">{t(label)}</div>
                  <div className="text-xs">{t(text)}</div>
                </div>
                <span className="ml-auto h-8 w-[3px] rounded-full" style={{ background: `hsl(${color})` }} />
              </li>
            ))}
          </ul>
        </div>

        <div className="relative text-sidebar-accent-foreground [&_span]:!text-sidebar-foreground"><BerlinClock /></div>
      </aside>

      <main className="relative flex flex-col items-center justify-center p-6">
        <DisplayToggles className="absolute right-5 top-5" />
        <form onSubmit={submit} className="rise w-full max-w-[380px]" noValidate>
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="grid size-9 place-items-center rounded-lg bg-sidebar-primary font-mono text-sm font-bold text-sidebar-primary-foreground">B</div>
            <div className="text-sm font-semibold">{t('Lageübersicht Berlin')}</div>
          </div>
          <h2 className="text-[28px] font-semibold tracking-tight">{t('Anmelden')}</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">{t('Zugang für Mitarbeitende des Krisenstabs (Demo).')}</p>

          <label className="mt-7 block text-xs font-medium text-foreground/85" htmlFor="username">{t('Benutzername')}</label>
          <input id="username" data-testid="input-username" autoComplete="username" value={username}
            onChange={(e) => { setUsername(e.target.value); setError(null); }} className={`mt-1.5 ${field}`} aria-invalid={!!error} />

          <label className="mt-4 block text-xs font-medium text-foreground/85" htmlFor="password">{t('Passwort')}</label>
          <div className="relative mt-1.5">
            <input id="password" data-testid="input-password" type={show ? 'text' : 'password'} autoComplete="current-password" value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null); }} className={`${field} pr-11`} aria-invalid={!!error} />
            <button type="button" data-testid="button-toggle-password" onClick={() => setShow(!show)} aria-label={t(show ? 'Passwort verbergen' : 'Passwort anzeigen')}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>

          {error && <p role="alert" data-testid="text-login-error" className="mt-3 flex items-center gap-1.5 rounded-md bg-destructive/10 px-2.5 py-1.5 text-xs font-medium text-destructive"><AlertTriangle className="size-3.5" />{t(error)}</p>}

          <button type="submit" data-testid="button-login" className="group mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
            {t('Anmelden')}<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </button>

          <div className="mt-7 flex gap-2.5 rounded-lg border border-[hsl(var(--warn)/.4)] bg-[hsl(var(--warn)/.08)] p-3.5 text-[12px] leading-relaxed text-foreground/85">
            <Lock className="mt-0.5 size-4 shrink-0 text-[hsl(var(--warn))]" />
            <p><strong className="text-[hsl(var(--warn))]">{t('Nur Zugangssimulation.')}</strong> {t('Dieses Login läuft ausschließlich im Browser, die Demo-Zugangsdaten stehen im Quellcode. Es ist unsicher und kein Schutz vertraulicher Daten. Keine amtliche Gefahreninformation.')}</p>
          </div>
        </form>
      </main>
    </div>
  );
}
