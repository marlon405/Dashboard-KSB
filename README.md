Berlin · Lageübersicht (Dashboard-KSB)
Ein Dashboard für den Katastrophenschutz in Berlin: Auf einer einzigen Webseite sieht man auf einen Blick,
wie die Lage in der Stadt gerade aussieht – mit Feuerwehr-Einsätzen, dem Wasserstand der Spree und der
Wettervorhersage.
> **Wichtig:** Das ist ein **Schulprojekt und ein Prototyp**. Es ist **kein amtliches Warnsystem** und
> darf nicht für echte Warnungen oder Einsatzentscheidungen verwendet werden.
---
Inhaltsverzeichnis
Ausprobieren
Was kann das Dashboard?
Woher kommen die Daten?
So bedient man das Dashboard
Selbst auf dem eigenen Computer starten
Aufbau des Projekts
Verwendete Technik
Grenzen und Hinweise
Kleines Wörterbuch
---
1. Ausprobieren
Das Dashboard ist im Internet erreichbar. Man muss nichts installieren und sich nicht anmelden:
https://marlon405.github.io/Dashboard-KSB/
Die Seite funktioniert am Computer, Tablet und Smartphone.
---
2. Was kann das Dashboard?
Das Dashboard hat sechs Bereiche. Man wechselt zwischen ihnen über die Navigation
(am Computer links am Rand, auf dem Handy unten).
Bereich	Was man dort sieht
Übersicht	Die wichtigsten Zahlen aus allen drei Datenquellen auf einen Blick. Ein Klick führt zum jeweiligen Detailbereich.
Wetter	Die Vorhersage für Berlin für die kommenden Tage: Temperatur (höchste und niedrigste), Regenwahrscheinlichkeit, Niederschlagsmenge und Wind.
Feuerwehr	Wie viele Brandeinsätze es am Vortag in Berlin gab, dazu der Verlauf der letzten 14 Tage als Diagramm.
Pegelstand	Der aktuelle Wasserstand an der Messstelle Berlin-Köpenick und sein Verlauf über die letzten 7 Tage.
Notizen	Eigene Beobachtungen zur aktuellen Lage aufschreiben. Zu jeder Notiz wird automatisch eine Momentaufnahme der Daten gespeichert, außerdem kann man Antworten schreiben.
Quellen	Zeigt, woher die Daten stammen, wann sie zuletzt erfolgreich geladen wurden und ob es Probleme gab.
Außerdem gibt es:
Hell- und Dunkel-Design zum Umschalten (Voreinstellung: dunkel)
Deutsch und Englisch als Sprache
Zurück-Button in den Detailbereichen, um schnell zur Übersicht zurückzukehren
Aktualisieren-Button, um alle Daten sofort neu zu laden
Verfügbarkeitsanzeige der letzten 24 Stunden: Für jede Datenquelle sieht man, ob sie in den vergangenen
24 Stunden erreichbar war (Details in Abschnitt 8)
---
3. Woher kommen die Daten?
Alle Daten stammen aus öffentlichen, frei zugänglichen Quellen. Es werden keine geheimen oder
personenbezogenen Daten verwendet.
Bereich	Quelle	Wie oft wird automatisch aktualisiert?
Feuerwehr	Berliner Feuerwehr – BF-Open-Data	jede Stunde
Pegelstand	PEGELONLINE der Wasserstraßen- und Schifffahrtsverwaltung des Bundes	alle 15 Minuten
Wetter	Open-Meteo	jede Stunde
Die Daten werden direkt im Browser abgerufen. Es gibt keinen eigenen Server dazwischen und keine Datenbank.
---
4. So bedient man das Dashboard
Seite öffnen (Link in Abschnitt 1). Man landet direkt auf der Übersicht.
Bereich wählen über die Navigation.
Zurück zur Übersicht mit dem Zurück-Button oben.
Daten neu laden mit dem Aktualisieren-Symbol oben.
Design oder Sprache ändern mit den Schaltern oben rechts.
Notiz schreiben: Bereich „Notizen“ öffnen, „Neue Notiz“ wählen, Titel, Beschreibung und einen frei
wählbaren Namen eingeben und speichern.
---
5. Selbst auf dem eigenen Computer starten
Das ist nur nötig, wenn man am Projekt weiterarbeiten oder den Code ausprobieren möchte.
Zum reinen Ansehen reicht der Link aus Abschnitt 1.
Was man vorher braucht: Node.js in Version 20 oder neuer
(damit läuft das Projekt auf dem eigenen Rechner).
Schritt für Schritt:
Das Projekt herunterladen und entpacken (oder mit `git clone` holen).
Ein Terminal bzw. die Eingabeaufforderung öffnen und in den Projektordner wechseln.
Die benötigten Zusatzprogramme installieren (nur beim ersten Mal):
```
   npm install
   ```
Das Dashboard starten:
```
   npm run dev
   ```
Im Browser diese Adresse öffnen: http://localhost:5173
Beenden kann man das Programm im Terminal mit `Strg + C`.
Fertige Version bauen
Soll aus dem Code eine fertige Webseite entstehen, die man auf einen Server legen kann:
```
npm run build      # erzeugt die fertige Webseite im Ordner "dist"
npm run preview    # zeigt die fertige Webseite lokal zur Kontrolle an
```
Automatische Veröffentlichung
Sobald neuer Code auf den Zweig `main` hochgeladen wird, baut GitHub Actions die Seite automatisch neu und
veröffentlicht sie auf GitHub Pages. Die Einstellungen dafür stehen in `.github/workflows/deploy.yml`.
Nach dem Hochladen dauert es deshalb ein bis zwei Minuten, bis die Live-Seite aktuell ist.
---
6. Aufbau des Projekts
```
Dashboard-KSB/
├── .github/workflows/   Automatische Veröffentlichung auf GitHub Pages
├── public/              Dateien, die unverändert ausgeliefert werden (z. B. das Symbol im Browser-Tab)
├── src/                 Der eigentliche Programmcode
│   ├── components/      Wiederverwendbare Bausteine (Diagramme, Karten, Navigation, Buttons, ...)
│   ├── data/            Abruf, Prüfung und Aufbereitung der Daten aus den drei Quellen
│   ├── hooks/           Kleine Hilfsfunktionen für die Oberfläche
│   ├── lib/             Hilfsfunktionen: Formatierung, Übersetzungen, Design, Notizen, Verfügbarkeit
│   ├── pages/           Der Rahmen der Seite (Navigation, Kopfzeile, Inhalt)
│   └── views/           Die einzelnen Bereiche: Übersicht, Wetter, Feuerwehr, Pegel, Notizen, Quellen
├── index.html           Startseite, die den Programmcode lädt
├── package.json         Liste der benötigten Zusatzprogramme und der Befehle (dev, build, ...)
├── vite.config.ts       Einstellungen für das Bauwerkzeug
└── README.md            Diese Datei
```
---
7. Verwendete Technik
Technik	Wofür wird sie benutzt?
React	Baut die Oberfläche aus kleinen, wiederverwendbaren Bausteinen auf
TypeScript	Wie JavaScript, prüft aber schon beim Schreiben auf Fehler
Vite	Startet das Projekt zum Entwickeln und baut die fertige Webseite
Tailwind CSS	Gestaltung (Farben, Abstände, Hell-/Dunkel-Design)
Recharts	Zeichnet die Diagramme
PapaParse	Liest die CSV-Datei der Feuerwehr ein
Zod	Prüft gespeicherte Notizen auf gültige Inhalte
GitHub Actions / Pages	Baut und veröffentlicht die Webseite automatisch
---
8. Grenzen und Hinweise
Kein amtliches Warnsystem. Für echte Warnungen gelten nur offizielle Stellen, zum Beispiel die
Warn-App NINA oder der Deutsche Wetterdienst.
Feuerwehr-Zahlen gelten für den Vortag, nicht für „jetzt“. Fehlen die Daten für den Vortag, zeigt das
Dashboard das ausdrücklich an, statt etwas zu schätzen.
Veraltete Daten werden gekennzeichnet. Wenn eine Quelle nicht erreichbar ist, zeigt das Dashboard die
zuletzt bekannten Daten mit dem Hinweis „veraltet“ an. Beim Pegelstand gilt ein Wert nach einer Stunde
ohne neue Messung als veraltet.
Notizen und Verfügbarkeitsverlauf liegen nur im eigenen Browser. Sie werden nicht auf einen Server
hochgeladen. Andere Personen sehen sie nicht. Wer die Browserdaten löscht oder ein anderes Gerät benutzt,
sieht sie nicht mehr.
Kein Login. Die Seite ist öffentlich und zeigt ausschließlich öffentliche Daten. Bitte keine
vertraulichen Informationen in Notizen eintragen.
Abhängig von Fremdquellen. Fällt einer der Datendienste aus oder ändert sein Format, kann der
entsprechende Bereich vorübergehend nicht funktionieren.
---
9. Kleines Wörterbuch
Begriff	Bedeutung
Dashboard	Eine Übersichtsseite, die wichtige Zahlen und Diagramme an einem Ort zeigt
Katastrophenschutz	Maßnahmen, um Menschen bei großen Gefahren wie Hochwasser, Unwettern oder Großbränden zu schützen
Pegelstand	Die Höhe des Wasserspiegels in einem Fluss, gemessen an einer festen Messstelle
Open Data	Daten, die jede und jeder frei einsehen und verwenden darf
CSV-Datei	Eine einfache Tabelle als Textdatei, die zum Beispiel in Excel geöffnet werden kann
Prototyp	Eine erste, noch nicht fertige Version zum Ausprobieren
Frontend	Der Teil einer Anwendung, den man im Browser sieht und bedient
GitHub Pages	Ein kostenloser Dienst von GitHub, der Webseiten direkt aus einem Projekt veröffentlicht
