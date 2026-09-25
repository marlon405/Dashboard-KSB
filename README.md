# Katastrophenschutz-Dashboard Berlin

Ein Lagebild-Dashboard mit drei Widgets: **Wetter**, **Pegelstand Spree** und
**Einsätze der Berliner Feuerwehr**. Reines Frontend-Projekt (HTML/CSS/JS),
läuft komplett im Browser und kann kostenlos über **GitHub Pages** veröffentlicht
werden.

## Dateien

| Datei | Zweck |
|---|---|
| `index.html` | Struktur der Seite, Login-Formular, Widget-Gerüst |
| `style.css` | Design, Layout, Farben, Responsivität |
| `app.js` | Login-Logik, Sprachumschaltung, API-Anbindung, Rendering |

## 1. Online stellen mit GitHub Pages (für die Schulabgabe)

1. Bei [github.com](https://github.com) einloggen (kostenloses Konto reicht).
2. Neues **Repository** erstellen, z. B. `katastrophenschutz-dashboard`
   (öffentlich/„Public“, damit dein Lehrer es ohne Login sehen kann).
3. Die drei Dateien `index.html`, `style.css`, `app.js` in das Repository
   hochladen (per „Add file → Upload files“ im Browser, oder per `git push`).
4. Im Repository zu **Settings → Pages** gehen.
5. Unter „Build and deployment“ als Quelle **„Deploy from a branch“**
   auswählen, Branch `main` und Ordner `/ (root)` wählen, dann **Save**.
6. Nach ca. 1–2 Minuten ist die Seite erreichbar unter:
   `https://<dein-github-nutzername>.github.io/<repository-name>/`

Diesen Link kannst du direkt bei deinem Lehrer abgeben.

## 2. Für den Lehrer: Dashboard öffnen

1. Den erhaltenen Link öffnen (funktioniert in jedem aktuellen Browser,
   keine Installation nötig).
2. Auf dem Login-Bildschirm anmelden:
   - login daten sind in Moodle
3. Das Dashboard zeigt drei Kacheln (Wetter, Pegelstand, Einsätze). Jede
   Kachel hat oben rechts einen **Status-Badge** mit dem Datenstand
   (Datum/Uhrzeit der letzten erfolgreichen Abfrage), damit erkennbar ist,
   wie aktuell die Anzeige ist.
4. Über den Button oben rechts kann zwischen **Deutsch/Englisch**
   umgeschaltet werden.

## 3. Wichtiger Hinweis zum Login (bitte im Unterricht erwähnen)

GitHub Pages liefert **nur statische Dateien aus** – es gibt kein Backend,
das ein Passwort geheim halten könnte. Jeder, der die Seite öffnet, kann
sich den Quellcode ansehen und das Passwort darin finden. Der Login ist
deshalb **kein echter Schutzmechanismus**, sondern eine reine
Demo-/Übungsfunktion, wie sie für dieses Schulprojekt verlangt war. Für ein
echtes Login mit sicherer Passwortprüfung bräuchte man einen echten Server
(Backend), der hier bewusst nicht Teil der Aufgabe war.

## 4. Datenquellen und ihre Grenzen

| Widget | Quelle | Eigenschaften |
|---|---|---|
| Wetter | [Open-Meteo](https://open-meteo.com) (nutzt für Deutschland das **DWD-ICON-Modell**) | Kostenlos, kein API-Key nötig, aktuelle Temperatur + 7-Tage-Vorhersage, direkt im Browser abrufbar |
| Pegelstand | [PegelOnline (WSV)](https://www.pegelonline.wsv.de), Station Köpenick/Spree | Echtzeitdaten (meist alle 15 Min.), letzte 30 Tage abrufbar. Amtliche Hochwasser-Meldestufen sind über diese API nicht automatisiert abrufbar — die Anzeige „niedrig/normal/erhöht/kritisch“ bezieht sich deshalb auf die **Schwankungsbreite der letzten 30 Tage**, nicht auf offizielle Alarmstufen |
| Einsätze | [Berliner Feuerwehr Open Data](https://github.com/Berliner-Feuerwehr/BF-Open-Data) | Liefert **aggregierte** CSV-Datensätze (keine Einzelmeldungen, kein Live-Feed für „gestern“). Das Dashboard zeigt daher den **letzten verfügbaren Zeitraum** mit Datumsstempel — nicht zwingend „gestern“ |

⚠️ **Das Dashboard ist ein Schulprojekt und keine Grundlage für echte
Katastrophenschutz-Entscheidungen.** Für reale Einsatzlagen gelten die
offiziellen Kanäle von Feuerwehr, THW und Senatsverwaltung.

## 5. Lokal testen (optional)

Da die Seite `fetch()` verwendet, sollte sie über einen kleinen lokalen
Server statt per Doppelklick auf `index.html` geöffnet werden, z. B.:

```bash
cd katastrophenschutz-dashboard
python3 -m http.server 8000
```

Danach im Browser `http://localhost:8000` öffnen.

## 6. Mögliche Erweiterungen

- Eigene Einsatzkarte mit Standorten (Berliner Feuerwehr stellt auch
  Geodaten zu Standorten bereit).
- Push-/Browser-Benachrichtigung bei kritischem Pegelstand.
- Mehrere Pegel-Stationen zur Auswahl (z. B. zusätzlich Mühlendamm, Charlottenburg).
