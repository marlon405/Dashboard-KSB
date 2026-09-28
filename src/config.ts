/**
 * Zentrale Frontend-Konfiguration.
 *
 * ACHTUNG: Die Demo-Zugangsdaten liegen bewusst im Client-Bundle. Dieses Login
 * ist ausschließlich eine Zugangssimulation für den Prototyp und bietet KEINEN
 * wirksamen Schutz vertraulicher Daten. Jede Person mit Zugriff auf den
 * ausgelieferten Code kann die Werte auslesen.
 */
export const DEMO_CREDENTIALS = {
  username: 'admin',
  password: 'BerlinDemo2026!',
} as const;

/** sessionStorage-Schlüssel. Gespeichert wird nur ein Boolean, nie das Passwort. */
export const AUTH_SESSION_KEY = 'berlin-dashboard.authenticated';

export const TIMEZONE = 'Europe/Berlin';

import { FIRE_CSV_URL, FIRE_REPO_URL, WATER_BASE_URL, WEATHER_URL } from './data/config';

export const SOURCE_LINKS = {
  fire: {
    name: 'Berliner Feuerwehr · BF-Open-Data',
    repo: FIRE_REPO_URL,
    data: FIRE_CSV_URL,
    docs: FIRE_REPO_URL,
  },
  water: {
    name: 'PEGELONLINE · WSV',
    repo: 'https://www.pegelonline.wsv.de/',
    data: `${WATER_BASE_URL}/W/currentmeasurement.json`,
    history: `${WATER_BASE_URL}/W/measurements.json?start=P7D`,
    docs: 'https://www.pegelonline.wsv.de/webservice/dokuRestapi',
  },
  weather: {
    name: 'Open-Meteo Forecast API',
    repo: 'https://open-meteo.com/',
    data: WEATHER_URL,
    docs: 'https://open-meteo.com/en/docs',
  },
} as const;
