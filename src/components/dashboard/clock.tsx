import { useEffect, useState } from 'react';
import { TIMEZONE } from '@/config';
import { getLocale, useLanguage } from '@/lib/i18n';

/** Eigene Komponente: tickt jede Sekunde, ohne den Rest (oder Datenabrufe) neu auszulösen. */
export function BerlinClock() {
  useLanguage();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const date = new Intl.DateTimeFormat(getLocale(), { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', timeZone: TIMEZONE }).format(now);
  const time = new Intl.DateTimeFormat(getLocale(), { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: TIMEZONE }).format(now);
  return (
    <div className="flex items-baseline gap-3" data-testid="text-clock">
      <span className="font-mono text-xl font-semibold tabular-nums tracking-tight">{time}</span>
      <span className="hidden text-xs text-muted-foreground sm:inline">{date}</span>
    </div>
  );
}
