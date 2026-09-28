import { ErrorBoundary, type ErrorFallbackProps } from '@/components/error-boundary';
import { useAuth } from '@/lib/auth';
import { LoginPage } from '@/pages/login';
import { DashboardPage } from '@/pages/dashboard';
import { t, useLanguage } from '@/lib/i18n';

function CrashFallback({ error, resetError }: ErrorFallbackProps) {
  useLanguage();
  return (
    <div className="grid min-h-[100dvh] place-items-center bg-background p-6">
      <div role="alert" className="max-w-md rounded-lg border border-card-border bg-card p-6">
        <div className="eyebrow">{t('Lageübersicht Berlin')}</div>
        <h1 className="mt-1 text-lg font-semibold">{t('Die Ansicht konnte nicht dargestellt werden')}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button data-testid="button-reset-error" onClick={resetError} className="mt-4 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">{t('Erneut laden')}</button>
      </div>
    </div>
  );
}

function App() {
  const { authenticated, login, logout } = useAuth();
  return (
    <ErrorBoundary FallbackComponent={CrashFallback}>
      {authenticated ? <DashboardPage onLogout={logout} /> : <LoginPage onLogin={login} />}
    </ErrorBoundary>
  );
}

export default App;
