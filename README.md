# Berlin · Lageübersicht (Dashboard-KSB)

Deutschsprachiges Dashboard für eine katastrophenschutzrelevante Lageübersicht der Stadt Berlin.
Die Anwendung ruft öffentliche Datenquellen direkt im Browser ab und stellt Feuerwehr-Einsätze,
Pegelstände und Wetterprognose übersichtlich dar.

> Schulprojekt / Prototyp. Kein amtliches Warnsystem und nicht für den Umgang mit vertraulichen Daten vorgesehen.

## Live-Ansicht

Über GitHub Pages: `https://marlon405.github.io/Dashboard-KSB/`

## Demo-Zugang

- Benutzername: `admin`
- Passwort: `BerlinDemo2026!`

## Funktionen

- Übersicht mit den wichtigsten Kennzahlen der drei Datenquellen
- Feuerwehr: Brandeinsätze des vorherigen Berliner Kalendertags inkl. 14-Tage-Verlauf
- Pegelstand: aktueller Wasserstand der Station Berlin-Köpenick mit 7-Tage-Verlauf
- Wetter: 8-Tage-Prognose für Berlin (Temperatur, Niederschlag, Wind)
- Quellenansicht mit Endpunkten und Verarbeitungshinweisen
- Umschaltbares Hell-/Dunkel-Design, responsive für Desktop und Mobilgeräte

## Datenquellen

| Bereich | Quelle |
| --- | --- |
| Feuerwehr | Berliner Feuerwehr – BF-Open-Data |
| Pegelstand | PEGELONLINE (WSV) |
| Wetter | Open-Meteo Forecast API |

Alle Quellen werden direkt und ohne Zwischenserver aus dem Browser geladen. Es gibt kein Backend
und keine Datenbank.

## Lokale Entwicklung

Voraussetzung: Node.js 20 oder neuer.

```sh
npm install
npm run dev
```

Die Anwendung ist anschließend unter `http://localhost:5173` erreichbar.

## Produktions-Build

```sh
npm run build      # erzeugt statische Dateien im Ordner dist/
npm run preview    # baut und zeigt den Build lokal an
```

Der Build wird bei jedem Push auf `main` automatisch über GitHub Actions gebaut und auf
GitHub Pages veröffentlicht (siehe `.github/workflows/deploy.yml`).

## Demo-Zugang

- Benutzername: `admin`
- Passwort: `BerlinDemo2026!`

## Technologie

React, TypeScript, Vite, Tailwind CSS, Recharts (Diagramme) und PapaParse (CSV-Verarbeitung).

## Projektstruktur

```
src/
  components/   Wiederverwendbare UI- und Dashboard-Komponenten
  data/         Datentypen, Quellenkonfiguration, Abruf und Validierung
  hooks/        React-Hooks
  lib/          Formatierung, Login-Status, Übersetzungen, Hilfsfunktionen
  pages/        Login und Dashboard-Rahmen
  views/        Übersicht, Wetter, Feuerwehr, Pegel, Quellen
```
