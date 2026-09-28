import { useCallback, useState } from 'react';
import { AUTH_SESSION_KEY, DEMO_CREDENTIALS } from '@/config';

function readSession(): boolean {
  try {
    return sessionStorage.getItem(AUTH_SESSION_KEY) === 'true';
  } catch {
    return false;
  }
}

/** Reine Frontend-Simulation. Speichert nur den Anmeldestatus, nie Zugangsdaten. */
export function useAuth() {
  const [authenticated, setAuthenticated] = useState<boolean>(readSession);

  const login = useCallback((username: string, password: string): boolean => {
    const ok = username.trim() === DEMO_CREDENTIALS.username && password === DEMO_CREDENTIALS.password;
    if (ok) {
      try { sessionStorage.setItem(AUTH_SESSION_KEY, 'true'); } catch { /* Sitzung nicht persistierbar */ }
      setAuthenticated(true);
    }
    return ok;
  }, []);

  const logout = useCallback(() => {
    try { sessionStorage.removeItem(AUTH_SESSION_KEY); } catch { /* ignorieren */ }
    setAuthenticated(false);
  }, []);

  return { authenticated, login, logout };
}
