# Produkt-Export Client

Dieses Projekt ist eine kleine React-Anwendung, die Produktdaten aus einem Backend lädt und dem Benutzer als Tabelle anzeigt. Die Daten können durchsucht, sortiert und als CSV-Datei exportiert werden. Die App basiert auf TypeScript und Vite.

## Funktionen

- Ruft Produktdaten von `http://localhost:3001/api/produkte` ab
- Anzeige der Daten in einer Tabelle
- Suchfeld, um nach Produktnamen zu filtern
- Sortieren der Tabelle durch Klick auf einen Spaltenkopf
- Export der angezeigten Daten als CSV

## Quickstart

1. Node.js installieren (empfohlen ab Version 18)
2. Abhängigkeiten installieren:
   ```bash
   npm install
   ```
3. Entwicklungsserver starten:
   ```bash
   npm run dev
   ```
4. Anschließend ist die Anwendung unter `http://localhost:5173` erreichbar.

## Projektstruktur

- `index.html` – Einstiegspunkt, lädt `src/main.tsx`
- `src/App.tsx` – Hauptkomponente mit Datenabruf, Suche, Sortierung und CSV-Export
- `src/components/Produktsuche.tsx` – separates Beispiel für eine Suchkomponente
- `src/App.css` – Grundlegendes Styling
- Konfigurationen in `vite.config.ts` und den `tsconfig`-Dateien

## Weitere Ideen

- Benutzerfreundlichkeit und Fehlermeldungen verbessern
- Komponenten weiter aufteilen oder ein UI-Framework nutzen
- Backend-URL über Umgebungsvariablen konfigurierbar machen
