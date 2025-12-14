# Testkonzept und Qualitätssicherung

## 1. Kritikalität der Funktionseinheiten

### Kritikalitätsstufen

| Stufe       | Beschreibung       | Auswirkung bei Fehler  |
| ----------- | ------------------ | ---------------------- |
| **Hoch**    | Kernfunktionalität | App unbenutzbar        |
| **Mittel**  | Wichtige Features  | Eingeschränkte Nutzung |
| **Niedrig** | Nice-to-have       | Minimale Auswirkung    |

### Bewertung der Funktionseinheiten

| Funktionseinheit               | Kritikalität | Begründung                          |
| ------------------------------ | ------------ | ----------------------------------- |
| Datenbank-Initialisierung      | Hoch         | Ohne DB keine Wörter                |
| Wort-Generierung (wordService) | Hoch         | Kernfunktion der App                |
| Wort-Anzeige (WordCard)        | Hoch         | Hauptinteraktion des Nutzers        |
| Einstellungen speichern/laden  | Mittel       | App funktioniert mit Defaults       |
| Tägliche Aktualisierung        | Mittel       | Manueller Refresh möglich           |
| Benachrichtigungen             | Niedrig      | Nutzer kann App manuell öffnen      |
| KI-Anreicherung                | Niedrig      | Premium-Feature, Fallback vorhanden |
| Premium-System                 | Niedrig      | Nur für erweiterte Features         |

---

## 2. Akzeptanzkriterien und Testabdeckung

### User Stories mit Akzeptanzkriterien

| User Story                                  | Akzeptanzkriterien                                                        | Testabdeckung                   |
| ------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------- |
| **#4 Tägliche Vokabel-Generierung**         | App generiert täglich neue Wörter; Wörter für Fortgeschrittene geeignet   | ✅ Unit Tests (wordService)     |
| **#34 Wort-Auswahl und Anzeige**            | Wörter werden ausgewählt; UI zeigt Wörter ansprechend                     | ✅ Unit Tests (WordCard)        |
| **#35 Automatische Aktualisierung**         | Wörter aktualisieren sich täglich; Zeitstempel-Logik funktioniert         | ✅ Unit Tests (useDailyRefresh) |
| **#36 Unit Tests**                          | Tests für Wort-Generierung existieren; Tests laufen erfolgreich           | ✅ CI Pipeline                  |
| **#37 Einstellungen-UI**                    | Konfigurationsoptionen funktionieren; Einstellungen bleiben nach Neustart | ✅ Integration Tests            |
| **#38 Wort-Generierung nach Einstellungen** | Generierte Wörter entsprechen Einstellungen                               | ✅ Unit Tests (wordService)     |
| **#39 Täglicher Lern-Reminder**             | Benachrichtigungen ein/aus; Lokale Notifications; Konfigurierbare Zeit    | ⚠️ Manueller Test               |
| **#40 Kontext-Informationen**               | AI liefert Definition und Beispielsatz; Übersichtliche Anzeige            | ⚠️ Manueller Test               |
| **#56 KI-Infrastruktur**                    | Supabase Projekt erstellt; Edge Functions; OpenAI eingebunden             | ✅ Integration Test             |

**Legende:** ✅ Automatisiert | ⚠️ Manuell

---

## 3. Anforderungen an die Tests

### Funktionale Anforderungen

| Anforderung        | Beschreibung                                              |
| ------------------ | --------------------------------------------------------- |
| Reproduzierbarkeit | Tests liefern bei gleichen Bedingungen gleiche Ergebnisse |
| Isolation          | Tests sind unabhängig voneinander ausführbar              |
| Schnelligkeit      | Unit Tests laufen in unter 30 Sekunden                    |
| Aussagekraft       | Fehlgeschlagene Tests zeigen klar die Ursache             |

### Nicht-funktionale Anforderungen

| Anforderung | Beschreibung                                        |
| ----------- | --------------------------------------------------- |
| Wartbarkeit | Tests sind einfach zu verstehen und anzupassen      |
| Lesbarkeit  | Testbeschreibungen erklären das erwartete Verhalten |
| Abdeckung   | Kritische Pfade sind vollständig getestet           |

---

## 4. Testziele

| Ziel                    | Beschreibung                      | Messkriterium                  |
| ----------------------- | --------------------------------- | ------------------------------ |
| Funktionale Korrektheit | App verhält sich wie spezifiziert | Alle Tests grün                |
| Regressionsvermeidung   | Neue Änderungen brechen nichts    | CI blockiert fehlerhafte PRs   |
| Code-Qualität           | Code ist typsicher und formatiert | Lint + Type-Check bestanden    |
| Stabilität              | App stürzt nicht ab               | Keine unbehandelten Exceptions |

---

## 5. Testfälle

### Unit Tests - wordService

| ID    | Testfall                             | Erwartetes Ergebnis           |
| ----- | ------------------------------------ | ----------------------------- |
| WS-01 | Keine Wörter für heute vorhanden     | Leeres Array zurückgeben      |
| WS-02 | Wörter für heute existieren          | Wörter aus DB laden           |
| WS-03 | Gemischte Word-IDs (valid + 0)       | Nur valide IDs laden          |
| WS-04 | Zufällige Wörter mit Filtern         | Gefilterte Wörter zurückgeben |
| WS-05 | Keine Worttypen ausgewählt           | Leeres Array zurückgeben      |
| WS-06 | Wörter speichern mit Padding         | IDs mit Nullen auffüllen      |
| WS-07 | Mehr als 5 Wörter speichern          | Auf 5 Wörter kürzen           |
| WS-08 | Neue Wörter generieren nach Settings | Settings werden angewendet    |

### Unit Tests - WordCard

| ID    | Testfall                 | Erwartetes Ergebnis     |
| ----- | ------------------------ | ----------------------- |
| WC-01 | URL vorhanden            | Link-Button anzeigen    |
| WC-02 | URL leer                 | Link-Button verstecken  |
| WC-03 | Frequenzklasse "n/a"     | Frequenz nicht anzeigen |
| WC-04 | Gültige Frequenzklasse   | Frequenz anzeigen       |
| WC-05 | Verschiedene Wortklassen | Korrektes Tag anzeigen  |

### Integration Tests

| ID    | Testfall                                    | Erwartetes Ergebnis           |
| ----- | ------------------------------------------- | ----------------------------- |
| IT-01 | Wortanzahl 1-5 unterstützt                  | Alle Werte funktionieren      |
| IT-02 | Datumsvergleich für tägliche Aktualisierung | Unterschiedliche Tage erkannt |
| IT-03 | Settings-Defaults bei fehlenden Daten       | Standardwerte angewendet      |
| IT-04 | Wortfilterung nach Typ und Frequenz         | Korrekte Filterung            |

### Manuelle Tests

| ID    | Testfall                   | Erwartetes Ergebnis                 |
| ----- | -------------------------- | ----------------------------------- |
| MT-01 | App-Start ohne Netzwerk    | Wörter werden angezeigt (offline)   |
| MT-02 | Pull-to-Refresh            | Neue Wörter bei neuem Tag           |
| MT-03 | Einstellungen ändern       | Änderungen werden übernommen        |
| MT-04 | Benachrichtigung empfangen | Notification zur eingestellten Zeit |
| MT-05 | Premium aktivieren (Dev)   | KI-Inhalte werden geladen           |
| MT-06 | DWDS-Link öffnen           | Browser öffnet korrekte URL         |

---

## 6. Testdaten

### Quellen

| Datenquelle    | Beschreibung                             | Verwendung       |
| -------------- | ---------------------------------------- | ---------------- |
| DWDS-Datenbank | Gebündelte SQLite-DB mit ~10'000 Wörtern | Produktionsdaten |
| Mock-Objekte   | Statische Testdaten im Code              | Unit Tests       |

### Mock-Daten

```typescript
// Beispiel Mock-Wort (aus Tests)
const mockWort = {
  id: 1,
  lemma: 'Beispiel',
  url: 'https://dwds.de/example',
  wortklasse: 'Substantiv',
  artikeldatum: '2024-01-01',
  artikeltyp: 'Artikel',
  frequenzklasse: '3',
};

// Beispiel Mock-Settings
const mockSettings = {
  wordCount: 3,
  wordTypes: { substantiv: true, verb: true, adjektiv: true },
  frequencyRange: 'mittel',
  notificationsEnabled: false,
  notificationTime: '09:00',
};
```

---

## 7. Erwartete Testergebnisse

| Testart           | Erwartung                 | Akzeptanzkriterium    |
| ----------------- | ------------------------- | --------------------- |
| Unit Tests        | Alle grün                 | 100% Erfolgsrate      |
| Integration Tests | Alle grün                 | 100% Erfolgsrate      |
| Lint              | Keine Fehler              | 0 Errors, 0 Warnings  |
| Type-Check        | Keine Fehler              | 0 TypeScript Errors   |
| Manuelle Tests    | Funktioniert wie erwartet | Keine kritischen Bugs |

---

## 8. Testumgebung und Testinfrastruktur

### Lokale Entwicklungsumgebung

| Komponente     | Tool/Version  |
| -------------- | ------------- |
| Test-Framework | Jest 29.7     |
| Test-Preset    | jest-expo 54  |
| Mocking        | Jest Mocks    |
| Assertions     | Jest Matchers |

### CI/CD Umgebung

| Komponente   | Konfiguration       |
| ------------ | ------------------- |
| Plattform    | GitHub Actions      |
| Runner       | ubuntu-latest       |
| Node Version | 20.x                |
| Trigger      | Push & Pull Request |

### Testinfrastruktur-Diagramm

```
┌─────────────────────────────────────────────────────┐
│                   GitHub Actions                    │
├─────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │   Lint      │  │ Type-Check  │  │    Test     │  │
│  │  (ESLint)   │  │ (tsc)       │  │   (Jest)    │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  │
│         │                │                │         │
│         └────────────────┼────────────────┘         │
│                          ▼                          │
│                 ┌─────────────────┐                 │
│                 │  CI Status      │                 │
│                 │  (Pass/Fail)    │                 │
│                 └─────────────────┘                 │
└─────────────────────────────────────────────────────┘
```

---

## 9. Testverfahren

### Automatisierte Verfahren

| Verfahren           | Beschreibung                         | Wann          |
| ------------------- | ------------------------------------ | ------------- |
| Unit Testing        | Isolierte Tests einzelner Funktionen | Jeder Push/PR |
| Integration Testing | Tests der Komponenten-Interaktion    | Jeder Push/PR |
| Static Analysis     | ESLint Regelprüfung                  | Jeder Push/PR |
| Type Checking       | TypeScript Kompilierung              | Jeder Push/PR |

### Manuelle Verfahren

| Verfahren           | Beschreibung                | Wann                |
| ------------------- | --------------------------- | ------------------- |
| Exploratives Testen | Freies Testen der App       | Während Entwicklung |
| Smoke Test          | Grundfunktionen prüfen      | Vor Release         |
| Akzeptanztest       | User Story Kriterien prüfen | Vor PR Merge        |

---

## 10. Erstellung der Testdaten

### Automatisch (Mocks)

Mock-Objekte werden direkt in den Testdateien definiert:

```typescript
// services/__tests__/wordService.test.ts
const mockWort = {
  id: 1,
  lemma: 'Beispiel',
  // ...
};

jest.mock('../database');
(database.getDatabase as jest.Mock).mockResolvedValue(mockDb);
```

### Manuell (Fixtures)

Für komplexere Szenarien können JSON-Fixtures erstellt werden:

```
__tests__/
  fixtures/
    words.json
    settings.json
```

### Produktionsdaten

Die DWDS-Datenbank (`assets/database/dwds.db`) dient als realistische Datenbasis für manuelle Tests.

---

## 11. Dokumentation der Testergebnisse

### Automatische Dokumentation

| Wo             | Was                                       |
| -------------- | ----------------------------------------- |
| GitHub Actions | CI-Logs mit detaillierten Testergebnissen |
| PR Checks      | Status-Badge (Pass/Fail)                  |
| Jest Output    | Testbericht mit Erfolg/Fehler pro Test    |

### Bei Fehlern

1. **CI schlägt fehl** → PR kann nicht gemerged werden
2. **Fehlerlog prüfen** → GitHub Actions zeigt Details
3. **Lokal reproduzieren** → `npm test` ausführen
4. **Fix implementieren** → Neuer Commit triggert CI erneut

### Beispiel Jest-Output

```
PASS  services/__tests__/wordService.test.ts
  wordService
    getTodaysWords
      ✓ should return empty array when no entry exists (3 ms)
      ✓ should return words for today (2 ms)
    selectRandomWords
      ✓ should select random words with filters (1 ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
```

---

## 12. Testarten

| Testart               | Beschreibung                                     | Umfang       |
| --------------------- | ------------------------------------------------ | ------------ |
| **Unit Tests**        | Isolierte Tests einzelner Funktionen/Komponenten | ~50 Tests    |
| **Integration Tests** | Tests der Zusammenarbeit mehrerer Module         | ~20 Tests    |
| **Manuelle Tests**    | Explorative und Akzeptanztests                   | Bei Bedarf   |
| **Static Analysis**   | Automatische Code-Prüfung (Lint, Types)          | Jeder Commit |

### Testpyramide

```
        /\
       /  \      Manuelle Tests (wenige)
      /----\
     /      \    Integration Tests (einige)
    /--------\
   /          \  Unit Tests (viele)
  /------------\
```

---

## 13. Testaktivitäten

| Aktivität               | Beschreibung                  | Verantwortlich |
| ----------------------- | ----------------------------- | -------------- |
| Tests schreiben         | Neue Tests für neue Features  | Entwickler     |
| Tests ausführen (lokal) | `npm test` vor Commit         | Entwickler     |
| Tests ausführen (CI)    | Automatisch bei Push/PR       | GitHub Actions |
| Tests pflegen           | Veraltete Tests aktualisieren | Entwickler     |
| Testabdeckung prüfen    | Kritische Pfade abgedeckt?    | QA (Raphael)   |
| Manuelle Tests          | App durchklicken              | Entwickler     |

---

## 14. Testzeitpunkte

### Während der Entwicklung

| Zeitpunkt         | Aktion                      |
| ----------------- | --------------------------- |
| Vor jedem Commit  | `npm test` lokal ausführen  |
| Bei neuem Feature | Tests für Feature schreiben |
| Bei Bugfix        | Regressionstest hinzufügen  |

### Im CI/CD Prozess

| Zeitpunkt         | Aktion                       |
| ----------------- | ---------------------------- |
| Bei Push          | Lint + Type-Check + Tests    |
| Bei Pull Request  | Vollständige CI-Pipeline     |
| Vor Merge         | Alle Checks müssen grün sein |
| Bei Tag (Release) | CI + Build                   |

### Übersicht

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Entwickeln │────▶│   Commit    │────▶│   Push/PR   │────▶│   Merge     │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
      │                   │                   │                   │
      ▼                   ▼                   ▼                   ▼
  Manuelles           Lokale              CI Tests            Release
  Testen              Tests               (GitHub)            Build
```

---

## 15. Benötigte Personen

| Rolle                   | Person                 | Verantwortlichkeiten                       |
| ----------------------- | ---------------------- | ------------------------------------------ |
| **Entwickler**          | Gabriel, Ayan, Raphael | Tests schreiben, lokal testen, Bugs fixen  |
| **QA-Verantwortlicher** | Raphael                | Testabdeckung prüfen, Testqualität sichern |
| **DevOps**              | Gabriel                | CI/CD Pipeline warten, Testinfrastruktur   |

### Aufwand

| Aktivität            | Geschätzter Aufwand       |
| -------------------- | ------------------------- |
| Unit Tests schreiben | ~15% der Entwicklungszeit |
| Manuelle Tests       | ~5% der Entwicklungszeit  |
| CI Wartung           | Minimal (automatisiert)   |
