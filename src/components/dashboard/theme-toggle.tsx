import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';
import { t, useLanguage } from '@/lib/i18n';

export function DisplayToggles({ className }: { className?: string }) {
  const { language, setLanguage } = useLanguage();
  return <div className={cn('flex shrink-0 items-center gap-2', className)}>
    <button type="button" data-testid="button-language-toggle" onClick={() => setLanguage(language === 'de' ? 'en' : 'de')}
      aria-label={t(language === 'de' ? 'Sprache wechseln: Englisch' : 'Sprache wechseln: Deutsch')}
      title={t(language === 'de' ? 'Sprache wechseln: Englisch' : 'Sprache wechseln: Deutsch')}
      className="inline-flex h-8 items-center rounded-full border border-border bg-muted px-2 font-mono text-[11px] font-semibold hover:bg-secondary focus-visible:outline-2 focus-visible:outline-primary">
      <span className={language === 'de' ? 'text-foreground' : 'text-muted-foreground'}>DE</span>
      <span className="mx-1 text-muted-foreground">/</span>
      <span className={language === 'en' ? 'text-foreground' : 'text-muted-foreground'}>EN</span>
    </button>
    <ThemeToggle />
  </div>;
}

export function ThemeToggle({ className }: { className?: string }) {
  useLanguage();
  const { theme, toggle } = useTheme();
  const dark = theme === 'dark';
  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label={t(dark ? 'Zum hellen Design wechseln' : 'Zum dunklen Design wechseln')}
      title={t(dark ? 'Helles Design' : 'Dunkles Design')}
      data-testid="button-theme-toggle"
      onClick={toggle}
      className={cn('relative inline-flex h-8 w-[60px] shrink-0 items-center rounded-full border border-border bg-muted p-0.5 transition-colors', className)}
    >
      <span className={cn('absolute top-0.5 size-[26px] rounded-full bg-card shadow-sm ring-1 ring-border transition-transform duration-200', dark ? 'translate-x-[28px]' : 'translate-x-0')} />
      <Sun className={cn('relative z-10 ml-[5px] size-4', dark ? 'text-muted-foreground' : 'text-[hsl(var(--weather))]')} />
      <Moon className={cn('relative z-10 ml-auto mr-[5px] size-4', dark ? 'text-primary' : 'text-muted-foreground')} />
    </button>
  );
}
