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

### 2.1 Übersicht User Stories

| User Story                                       | Anzahl Kriterien | Abdeckung |
| ------------------------------------------------ | ---------------- | --------- |
| **#4** Tägliche Auto-Generierung von Vokabeln    | 4                | ✅ 100%   |
| **#6** Tägliche Lern-Erinnerungen                | 3                | ✅ 100%   |
| **#7** Kontext- und Anwendungsbeispiele          | 4                | ✅ 100%   |
| **#8** Konfiguration der Wortgenerierung         | 4                | ✅ 100%   |
| **#10** KI-generierte Aufgaben                   | 5                | ✅ 100%   |
| **#26** Expo-Entwicklungsumgebung mit TypeScript | 6                | ✅ 100%   |
| **#56** KI Infrastruktur aufsetzen               | 4                | ✅ 100%   |
| **Gesamt**                                       | **30**           | ✅ 100%   |

### 2.2 Traceability Matrix

Die folgende Matrix ordnet jedes Akzeptanzkriterium einem oder mehreren Testfällen zu.

**Legende:** ✅ Automatisiert | ⚠️ Manuell

#### #4 Tägliche Auto-Generierung anspruchsvoller Vokabeln

| Akzeptanzkriterium                                                       | Testfall-ID(s)  | Testart     |
| ------------------------------------------------------------------------ | --------------- | ----------- |
| Die App generiert jeden Tag neue, nützliche Wörter                       | WS-08, IT-02    | ✅ Unit/Int |
| Die Wörter sind für ambitionierte Personen mit guten Kenntnissen         | WS-04, IT-04    | ✅ Unit/Int |
| Die Wörter helfen, die Sprachfertigkeiten auf das nächste Level zu heben | WC-01 bis WC-05 | ✅ Unit     |
| Die tägliche Generierung erfolgt automatisch                             | IT-02           | ✅ Int      |

#### #6 Tägliche Lern-Erinnerungen per Benachrichtigung

| Akzeptanzkriterium                                                     | Testfall-ID(s) | Testart    |
| ---------------------------------------------------------------------- | -------------- | ---------- |
| Die App sendet täglich Benachrichtigungen                              | MT-04          | ⚠️ Manuell |
| Die Benachrichtigungen erinnern an das Lernen der neuen Wörter         | MT-04          | ⚠️ Manuell |
| Die Benachrichtigungen helfen, eine konsequente Lernroutine aufzubauen | MT-04          | ⚠️ Manuell |

#### #7 Kontext- und Anwendungsbeispiele für neue Wörter

| Akzeptanzkriterium                                             | Testfall-ID(s) | Testart    |
| -------------------------------------------------------------- | -------------- | ---------- |
| Zu jedem Wort werden Verwendungsbeispiele gezeigt              | MT-05          | ⚠️ Manuell |
| Der Kontext der Wortverwendung wird erklärt                    | MT-05          | ⚠️ Manuell |
| Praktische Anwendungsszenarien werden aufgezeigt               | MT-05          | ⚠️ Manuell |
| Die Erklärungen ermöglichen es, die Wörter richtig einzusetzen | MT-05          | ⚠️ Manuell |

#### #8 Konfiguration der täglichen Wortgenerierung

| Akzeptanzkriterium                                                 | Testfall-ID(s)      | Testart        |
| ------------------------------------------------------------------ | ------------------- | -------------- |
| Die Anzahl der täglich generierten Wörter kann konfiguriert werden | IT-01, WS-06, MT-03 | ✅ Unit/Int/⚠️ |
| Die Art/Kategorie der Wörter kann ausgewählt werden                | WS-04, IT-04, MT-03 | ✅ Unit/Int/⚠️ |
| Die Einstellungen werden gespeichert und täglich angewendet        | IT-03, MT-03        | ✅ Int/⚠️      |
| Eine benutzerfreundliche Konfigurationsoberfläche ist verfügbar    | MT-03               | ⚠️ Manuell     |

#### #10 KI-generierte Aufgaben zur Anwendung neuer Wörter

| Akzeptanzkriterium                                                | Testfall-ID(s) | Testart    |
| ----------------------------------------------------------------- | -------------- | ---------- |
| Die App erstellt mithilfe von KI interaktive Aufgaben             | MT-05          | ⚠️ Manuell |
| Die Aufgaben unterstützen dabei, die Wörter korrekt anzuwenden    | MT-05          | ⚠️ Manuell |
| Verschiedene Aufgabentypen sind verfügbar (Multiple Choice, etc.) | MT-05          | ⚠️ Manuell |
| Die Aufgaben sind auf das Sprachniveau abgestimmt                 | MT-05          | ⚠️ Manuell |
| Feedback wird zu den Aufgaben gegeben                             | MT-05          | ⚠️ Manuell |

#### #26 Expo-Entwicklungsumgebung mit TypeScript aufsetzen

| Akzeptanzkriterium                                    | Testfall-ID(s) | Testart        |
| ----------------------------------------------------- | -------------- | -------------- |
| Das Projekt ist als Expo-Projekt initialisiert        | CI Pipeline    | ✅ Automatisch |
| Die expo-cli funktioniert im Projektverzeichnis       | CI Pipeline    | ✅ Automatisch |
| Die App lässt sich lokal mit `npx expo start` starten | MT-01          | ⚠️ Manuell     |
| Die Verbindung via Expo Go App funktioniert           | MT-01          | ⚠️ Manuell     |
| TypeScript ist konfiguriert und kompiliert fehlerfrei | CI Pipeline    | ✅ Automatisch |
| Das Vorgehen ist dokumentiert                         | README.md      | ✅ Vorhanden   |

#### #56 KI Infrastruktur aufsetzen

| Akzeptanzkriterium                                    | Testfall-ID(s) | Testart        |
| ----------------------------------------------------- | -------------- | -------------- |
| Supabase Projekt erstellt                             | IT-05          | ✅ Integration |
| Edge Funktionen erstellt                              | IT-05          | ✅ Integration |
| OpenAI API eingebunden                                | MT-05          | ⚠️ Manuell     |
| KI Features für Entwicklungsumgebungen freigeschaltet | MT-05          | ⚠️ Manuell     |

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

### Unit Tests - wordService (17 Tests)

| ID    | Testfall                                       | Erwartetes Ergebnis           |
| ----- | ---------------------------------------------- | ----------------------------- |
| WS-01 | Keine Wörter für heute vorhanden               | Leeres Array zurückgeben      |
| WS-02 | Wörter für heute existieren                    | Wörter aus DB laden           |
| WS-03 | Alle Word-IDs sind 0                           | Leeres Array zurückgeben      |
| WS-04 | Gemischte Word-IDs (valid + 0)                 | Nur valide IDs laden          |
| WS-05 | Zufällige Wörter mit Filtern                   | Gefilterte Wörter zurückgeben |
| WS-06 | Filter nach Worttypen und Frequenzklassen      | Korrekte SQL-Query            |
| WS-07 | Keine Worttypen ausgewählt                     | Leeres Array zurückgeben      |
| WS-08 | Keine Frequenzklassen ausgewählt               | Leeres Array zurückgeben      |
| WS-09 | Keine Wörter verfügbar                         | Leeres Array zurückgeben      |
| WS-10 | Wörter speichern mit Padding                   | IDs mit Nullen auffüllen      |
| WS-11 | Mehr als 5 Wörter speichern                    | Auf 5 Wörter kürzen           |
| WS-12 | Heutigen Eintrag löschen                       | DELETE Query ausgeführt       |
| WS-13 | Löschen mit Fehler                             | AppError mit db_clear_failed  |
| WS-14 | getOrGenerateTodaysWords mit vorhandenen Daten | Existierende Wörter laden     |
| WS-15 | getOrGenerateTodaysWords ohne Daten            | Neue Wörter generieren        |
| WS-16 | Wortanzahl aus Settings verwenden              | Settings-Wert anwenden        |
| WS-17 | Keine generierbaren Wörter                     | Leeres Array, kein Speichern  |

### Unit Tests - settingsService (12 Tests)

| ID    | Testfall                                   | Erwartetes Ergebnis             |
| ----- | ------------------------------------------ | ------------------------------- |
| SS-01 | Keine Settings gespeichert                 | Default-Settings zurückgeben    |
| SS-02 | Settings mit Defaults mergen               | Partial merge funktioniert      |
| SS-03 | Ungültiges JSON                            | Fallback zu Defaults            |
| SS-04 | Migration von frequencyRange (singular)    | Zu frequencyRanges (array)      |
| SS-05 | Settings speichern                         | AsyncStorage.setItem aufgerufen |
| SS-06 | Speichern fehlgeschlagen                   | AppError settings_save_failed   |
| SS-07 | getFrequencyClasses für "selten"           | ['0', '1'] zurückgeben          |
| SS-08 | getFrequencyClasses für "mittel"           | ['2', '3'] zurückgeben          |
| SS-09 | getFrequencyClasses für "haeufig"          | ['4', '5', '6'] zurückgeben     |
| SS-10 | getFrequencyClasses für mehrere Bereiche   | Kombinierte Liste               |
| SS-11 | getFrequencyClasses für leeren Input       | Leeres Array                    |
| SS-12 | getSelectedWordTypes mit aktivierten Typen | Nur aktivierte Typen            |

### Unit Tests - deviceService (4 Tests)

| ID    | Testfall                            | Erwartetes Ergebnis         |
| ----- | ----------------------------------- | --------------------------- |
| DS-01 | Gecachte ID ohne Storage-Zugriff    | Cache wird verwendet        |
| DS-02 | Android-ID generieren und speichern | ID wird persistiert         |
| DS-03 | iOS Vendor ID verwenden             | iOS-spezifische ID          |
| DS-04 | Fallback bei nativen Fehlern        | Generierte ID mit Timestamp |

### Unit Tests - updateService (3 Tests)

| ID    | Testfall                           | Erwartetes Ergebnis    |
| ----- | ---------------------------------- | ---------------------- |
| US-01 | Nested Update-Message aus Manifest | Deep message bevorzugt |
| US-02 | Fallback zu Top-Level Message      | Top level message      |
| US-03 | Komplette Update-Info mit Defaults | Alle Felder korrekt    |

### Unit Tests - database (17 Tests)

| ID    | Testfall                          | Erwartetes Ergebnis      |
| ----- | --------------------------------- | ------------------------ |
| DB-01 | Wort Interface Properties         | Alle Felder vorhanden    |
| DB-02 | Wort Typ-Validierung              | Korrekte Typen           |
| DB-03 | WortDesTages Interface Properties | Alle FK-Felder vorhanden |
| DB-04 | FK-Felder erlauben 0-Werte        | Null-Wörter möglich      |
| DB-05 | UserSettings Properties           | id und anzahl_woerter    |
| DB-06 | Verschiedene Wortanzahlen         | 1-5 unterstützt          |
| DB-07 | Positive anzahl_woerter           | Validierung funktioniert |
| DB-08 | Datenbank-Name korrekt            | dwds.db                  |
| DB-09 | Datenbank-Dateiendung             | .db Extension            |
| DB-10 | Word-IDs positiv oder 0           | Validierung funktioniert |
| DB-11 | Datumsformat YYYY-MM-DD           | Regex-Validierung        |
| DB-12 | Ungültige Datumsformate           | Werden abgelehnt         |
| DB-13 | Gültige Wortklassen               | String-Validierung       |
| DB-14 | Gültige Frequenzklassen           | 1-5 und n/a              |

### Unit Tests - WordCard (22 Tests)

| ID    | Testfall                      | Erwartetes Ergebnis     |
| ----- | ----------------------------- | ----------------------- |
| WC-01 | URL vorhanden                 | Link-Button anzeigen    |
| WC-02 | URL leer                      | Link-Button verstecken  |
| WC-03 | URL null                      | Falsy erkannt           |
| WC-04 | Verschiedene URL-Typen        | Korrekte Erkennung      |
| WC-05 | Wort-Struktur validieren      | Alle Felder vorhanden   |
| WC-06 | Frequenzklasse "n/a"          | Frequenz nicht anzeigen |
| WC-07 | Gültige Frequenzklasse        | Frequenz anzeigen       |
| WC-08 | Frequenz-Anzeigelogik         | Korrekte Entscheidung   |
| WC-09 | Frequenz-Formatierung         | "Frequenz: X" Format    |
| WC-10 | Alle Display-Felder vorhanden | lemma, wortklasse       |
| WC-11 | Wortklassen-Anzeige           | Korrekt angezeigt       |
| WC-12 | Lemma-Anzeige                 | Korrekter Text          |
| WC-13 | Multiple Wortklassen          | Adjektiv, Verb, etc.    |
| WC-14 | Multiple Frequenzklassen      | 1-5 unterstützt         |
| WC-15 | URL-Check vor Öffnen          | canOpenUrl Funktion     |
| WC-16 | Link-Text vorhanden           | DWDS Referenz           |
| WC-17 | Verschiedene Worttypen        | Properties konsistent   |
| WC-18 | Lemma-Formatierung            | Nicht-leerer String     |
| WC-19 | Wortklassen-Tag               | String vorhanden        |
| WC-20 | Frequenz mit Label            | Formatierung korrekt    |
| WC-21 | Properties erhalten           | Keine Datenverluste     |

### Unit Tests - QuizCard (17 Tests)

| ID    | Testfall                        | Erwartetes Ergebnis             |
| ----- | ------------------------------- | ------------------------------- |
| QC-01 | Quiz-Frage validieren           | Nicht-leerer String             |
| QC-02 | Genau 4 Optionen                | Array-Länge 4                   |
| QC-03 | Eindeutige Option-IDs           | Keine Duplikate                 |
| QC-04 | Gültige korrekte Option-ID      | In Options enthalten            |
| QC-05 | Nicht-leere Option-Texte        | Alle Texte vorhanden            |
| QC-06 | Korrekte Antwort erkennen       | true bei Übereinstimmung        |
| QC-07 | Falsche Antworten erkennen      | false bei Nicht-Übereinstimmung |
| QC-08 | Verschiedene korrekte Antworten | Flexibles correctOptionId       |
| QC-09 | Option-Auswahl erkennen         | isSelected Funktion             |
| QC-10 | Null-Auswahl behandeln          | Keine Option ausgewählt         |
| QC-11 | Korrektes Ergebnis-Message      | "✓ Richtig!"                    |
| QC-12 | Falsches Ergebnis-Message       | "✗ Leider falsch"               |
| QC-13 | Korrekte Option hervorheben     | isCorrectOption                 |
| QC-14 | Falsch gewählte Option          | isIncorrectlySelected           |
| QC-15 | Submit ohne Auswahl deaktiviert | canSubmit false                 |
| QC-16 | Nach Ergebnis keine Änderung    | canChangeSelection false        |
| QC-17 | Reset-Funktionalität            | Zustand zurücksetzen            |

### Unit Tests - Button (7 Tests)

| ID    | Testfall                   | Erwartetes Ergebnis      |
| ----- | -------------------------- | ------------------------ |
| BT-01 | Button mit Titel rendern   | Text sichtbar            |
| BT-02 | onPress aufrufen           | Callback ausgeführt      |
| BT-03 | Disabled Button            | onPress nicht aufgerufen |
| BT-04 | Loading State              | Kein Crash               |
| BT-05 | Alle Varianten rendern     | primary, secondary, etc. |
| BT-06 | Button mit Icon            | Icon angezeigt           |
| BT-07 | Custom Accessibility Label | Label korrekt            |

### Unit Tests - EmptyState (5 Tests)

| ID    | Testfall                 | Erwartetes Ergebnis      |
| ----- | ------------------------ | ------------------------ |
| ES-01 | Default Message rendern  | "Keine Wörter verfügbar" |
| ES-02 | Custom Message rendern   | Benutzerdefinierter Text |
| ES-03 | Settings Button anzeigen | Button vorhanden         |
| ES-04 | Navigation zu Settings   | router.push aufgerufen   |
| ES-05 | Empty Icon anzeigen      | Ionicons gerendert       |

### Unit Tests - ErrorState (4 Tests)

| ID    | Testfall              | Erwartetes Ergebnis |
| ----- | --------------------- | ------------------- |
| ER-01 | Fehlermeldung rendern | Message angezeigt   |
| ER-02 | Retry Button anzeigen | Button vorhanden    |
| ER-03 | onRetry aufrufen      | Callback ausgeführt |
| ER-04 | Error Icon anzeigen   | Ionicons gerendert  |

### Unit Tests - useDailyRefresh Hook (5 Tests)

| ID    | Testfall                        | Erwartetes Ergebnis       |
| ----- | ------------------------------- | ------------------------- |
| DR-01 | onNewDay bei neuem Tag          | Callback aufgerufen       |
| DR-02 | Kein Aufruf am selben Tag       | Callback nicht aufgerufen |
| DR-03 | AppState Listener Setup/Cleanup | Korrekte Registrierung    |
| DR-04 | State-Transitions behandeln     | inactive -> active        |
| DR-05 | Background zu Active            | Korrekte Erkennung        |

### Unit Tests - appError (3 Tests)

| ID    | Testfall                           | Erwartetes Ergebnis     |
| ----- | ---------------------------------- | ----------------------- |
| AE-01 | AppError mit Code und Message      | Properties erhalten     |
| AE-02 | Unknown Errors wrappen             | Fallback Code verwendet |
| AE-03 | Existierenden AppError zurückgeben | Keine Doppel-Wrapping   |

### Unit Tests - dateUtils (8 Tests)

| ID    | Testfall                         | Erwartetes Ergebnis     |
| ----- | -------------------------------- | ----------------------- |
| DU-01 | Datumsformat YYYY-MM-DD          | Regex-Match             |
| DU-02 | Konsistentes Datum am selben Tag | Gleiche Strings         |
| DU-03 | Spezifisches Datum formatieren   | Korrektes Format        |
| DU-04 | Einstellige Monate/Tage          | Mit führender 0         |
| DU-05 | Zweistellige Monate/Tage         | Korrekt formatiert      |
| DU-06 | Datumsvergleich gleich           | true                    |
| DU-07 | Datumsvergleich unterschiedlich  | false                   |
| DU-08 | Mitternacht-Übergang             | Korrekter Datumswechsel |

### Integration Tests (24 Tests)

| ID    | Testfall                                     | Erwartetes Ergebnis            |
| ----- | -------------------------------------------- | ------------------------------ |
| IT-01 | Wortanzahl 1-5 unterstützt                   | Alle Werte funktionieren       |
| IT-02 | Default Wortanzahl-Setting                   | 3 als Standard                 |
| IT-03 | Verschiedene Tage generieren unterschiedlich | Datumserkennung funktioniert   |
| IT-04 | Gleicher Tag generiert gleich                | Konsistenz                     |
| IT-05 | Datumsvergleich unterstützt                  | today != yesterday             |
| IT-06 | Word-ID Konsistenz                           | Padding auf 5 Felder           |
| IT-07 | Wortfilterung nach Typ                       | Affix/Konjunktion ausschließen |
| IT-08 | Wortfilterung nach Frequenz                  | n/a ausschließen               |
| IT-09 | Default Settings bei fehlenden Daten         | Standardwerte angewendet       |
| IT-10 | Custom Settings                              | Benutzerwerte übernommen       |
| IT-11 | anzahl_woerter Bereichsvalidierung           | 1-5 erlaubt                    |
| IT-12 | Frequenz-Anzeige für gültige Klassen         | true                           |
| IT-13 | Frequenz-Anzeige für n/a                     | false                          |
| IT-14 | Frequenz-Anzeige für undefined               | false                          |
| IT-15 | Frequenz-Anzeigetext                         | "Frequenz: X"                  |
| IT-16 | Wortklasse immer anzeigen                    | truthy                         |
| IT-17 | Lemma immer anzeigen                         | Nicht-leerer String            |
| IT-18 | URL-Check für vorhandene URLs                | canOpen true                   |
| IT-19 | URL-Check für leere URLs                     | canOpen false                  |
| IT-20 | URL-Check für null                           | canOpen false                  |
| IT-21 | Gültige URL-Formate                          | https:// Prefix                |
| IT-22 | Leeres Array bei keinen Daten                | [] zurückgeben                 |
| IT-23 | Null Settings Fallback                       | Default verwenden              |
| IT-24 | Fehlende Word-Daten behandeln                | Nur valide IDs                 |

### Manuelle Tests (Blackbox-Testfälle)

Die folgenden Testfälle sind als ausführbare Blackbox-Tests formuliert. Für jeden Test wird ein Testprotokoll gemäss Abschnitt 11 erstellt.

---

#### MT-01: App-Start ohne Netzwerk (Offline-Modus)

**Vorbedingung:** App ist installiert, Wörter wurden mindestens einmal geladen.

| Schritt | Aktion                             | Erwartetes Ergebnis                            |
| ------- | ---------------------------------- | ---------------------------------------------- |
| 1       | Flugmodus auf dem Gerät aktivieren | Keine Internetverbindung vorhanden             |
| 2       | App starten                        | App öffnet ohne Absturz                        |
| 3       | Homescreen prüfen                  | Wörter des Tages werden angezeigt              |
| 4       | Auf ein Wort tippen                | WordCard öffnet mit Details (Wortklasse, etc.) |
| 5       | Prüfen ob DWDS-Link sichtbar ist   | Link-Button ist sichtbar                       |
| 6       | Flugmodus deaktivieren             | App funktioniert weiterhin normal              |

**Bestanden wenn:** Schritte 2-5 erfolgreich, keine Fehlermeldungen oder Abstürze.

---

#### MT-02: Pull-to-Refresh (Tägliche Aktualisierung)

**Vorbedingung:** App ist gestartet, aktuelles Datum ist ein neuer Tag.

| Schritt | Aktion                                     | Erwartetes Ergebnis                          |
| ------- | ------------------------------------------ | -------------------------------------------- |
| 1       | App öffnen                                 | Homescreen wird angezeigt                    |
| 2       | Aktuelle Wörter notieren (z.B. Screenshot) | Wörter sind dokumentiert                     |
| 3       | Nach unten ziehen (Pull-to-Refresh)        | Ladeindikator erscheint kurz                 |
| 4       | Wörter nach Refresh prüfen                 | Neue Wörter werden angezeigt (bei neuem Tag) |
| 5       | Wörter vergleichen                         | Wörter unterscheiden sich vom Vortag         |

**Bestanden wenn:** Bei neuem Tag werden neue Wörter generiert; am gleichen Tag bleiben Wörter gleich.

---

#### MT-03: Einstellungen ändern

**Vorbedingung:** App ist gestartet, Standardeinstellungen sind aktiv.

| Schritt | Aktion                                      | Erwartetes Ergebnis                     |
| ------- | ------------------------------------------- | --------------------------------------- |
| 1       | Einstellungen-Tab öffnen                    | Einstellungsseite wird angezeigt        |
| 2       | Anzahl der Wörter ändern (z.B. von 3 auf 5) | Slider bewegt sich, Wert wird angezeigt |
| 3       | Wortart-Toggle ändern (z.B. Verben aus)     | Toggle wechselt visuell                 |
| 4       | Frequenzbereich ändern                      | Auswahl wird visuell bestätigt          |
| 5       | App komplett schliessen (aus Recent Apps)   | App ist geschlossen                     |
| 6       | App erneut öffnen                           | App startet                             |
| 7       | Einstellungen prüfen                        | Alle Änderungen sind gespeichert        |
| 8       | Homescreen prüfen                           | Wortanzahl entspricht Einstellung       |

**Bestanden wenn:** Einstellungen bleiben nach App-Neustart erhalten und werden angewendet.

---

#### MT-04: Benachrichtigung empfangen

**Vorbedingung:** App ist installiert, Benachrichtigungen sind systemseitig erlaubt.

| Schritt | Aktion                                     | Erwartetes Ergebnis               |
| ------- | ------------------------------------------ | --------------------------------- |
| 1       | Einstellungen öffnen                       | Einstellungsseite wird angezeigt  |
| 2       | Benachrichtigungen aktivieren (Toggle)     | Toggle ist aktiv                  |
| 3       | Uhrzeit auf 1 Minute in der Zukunft setzen | Uhrzeit ist gesetzt               |
| 4       | App schliessen                             | App läuft im Hintergrund          |
| 5       | Warten bis zur eingestellten Zeit          | Benachrichtigung erscheint        |
| 6       | Auf Benachrichtigung tippen                | App öffnet sich                   |
| 7       | Homescreen prüfen                          | Wörter des Tages werden angezeigt |

**Bestanden wenn:** Benachrichtigung erscheint zur eingestellten Zeit und öffnet die App.

---

#### MT-05: Premium/KI-Inhalte aktivieren (Entwicklungsumgebung)

**Vorbedingung:** App läuft in Entwicklungsumgebung (`__DEV__ = true`), Supabase ist konfiguriert.

| Schritt | Aktion                                    | Erwartetes Ergebnis                    |
| ------- | ----------------------------------------- | -------------------------------------- |
| 1       | App starten                               | Homescreen wird angezeigt              |
| 2       | Wort antippen                             | WordCard öffnet sich                   |
| 3       | KI-Bereich suchen                         | Bereich für KI-Inhalte ist sichtbar    |
| 4       | KI-Definition prüfen                      | Definition wird angezeigt (von OpenAI) |
| 5       | Beispielsatz prüfen                       | Beispielsatz wird angezeigt            |
| 6       | Quiz/Aufgabe suchen (falls implementiert) | Multiple-Choice-Aufgabe wird angezeigt |
| 7       | Aufgabe beantworten                       | Feedback (richtig/falsch) wird gegeben |

**Bestanden wenn:** KI-Inhalte (Definition, Beispielsatz) werden geladen und angezeigt.

---

#### MT-06: DWDS-Link öffnen

**Vorbedingung:** App ist gestartet, Internetverbindung vorhanden.

| Schritt | Aktion              | Erwartetes Ergebnis                       |
| ------- | ------------------- | ----------------------------------------- |
| 1       | Homescreen öffnen   | Wörter werden angezeigt                   |
| 2       | Auf ein Wort tippen | WordCard öffnet sich                      |
| 3       | DWDS-Link suchen    | Link-Button ist sichtbar                  |
| 4       | Auf Link tippen     | Browser öffnet sich                       |
| 5       | URL prüfen          | URL beginnt mit `https://www.dwds.de/wb/` |
| 6       | Inhalt prüfen       | DWDS-Seite zeigt das korrekte Wort        |

**Bestanden wenn:** Browser öffnet die korrekte DWDS-Seite für das angezeigte Wort.

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
  frequencyRanges: ['mittel'],
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

### Manuelle Testdokumentation

Für manuelle Tests (MT-01 bis MT-06) wird folgende Testprotokoll-Vorlage verwendet:

#### Testprotokoll-Vorlage

```markdown
# Testprotokoll

| Feld        | Wert                        |
| ----------- | --------------------------- |
| Datum       | YYYY-MM-DD                  |
| Tester      | Name                        |
| Testfall-ID | MT-XX                       |
| App-Version | x.x.x (aus app.json)        |
| Gerät       | z.B. Android 14 / iPhone 15 |
| Build-Typ   | Debug / Release             |

## Durchführung

| Schritt | Aktion | Erwartetes Ergebnis | Tatsächliches Ergebnis | Status |
| ------- | ------ | ------------------- | ---------------------- | ------ |
| 1       | ...    | ...                 | ...                    | ✅/❌  |
| 2       | ...    | ...                 | ...                    | ✅/❌  |

## Gesamtergebnis

- [ ] Bestanden
- [ ] Fehlgeschlagen

## Beobachtungen / Bemerkungen

(Freitext für Auffälligkeiten, Performance, UX-Feedback)

## Screenshots (falls relevant)

(Bilder einfügen oder Pfad angeben)
```

### Kommunikation von Fehlern

| Fehlertyp      | Aktion                                                   | Verantwortlich |
| -------------- | -------------------------------------------------------- | -------------- |
| Kritischer Bug | GitHub Issue mit Labels `bug` + `critical`               | Finder         |
| Normaler Bug   | GitHub Issue mit Label `bug`                             | Finder         |
| Testbericht    | Als Kommentar in PR oder als separates Issue             | Tester         |
| CI-Fehler      | PR blockiert, Entwickler wird automatisch benachrichtigt | GitHub Actions |

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

| Testart               | Beschreibung                                     | Umfang        |
| --------------------- | ------------------------------------------------ | ------------- |
| **Unit Tests**        | Isolierte Tests einzelner Funktionen/Komponenten | 112 Tests     |
| **Integration Tests** | Tests der Zusammenarbeit mehrerer Module         | 24 Tests      |
| **Manuelle Tests**    | Explorative und Akzeptanztests                   | 6 Testfälle   |
| **Static Analysis**   | Automatische Code-Prüfung (Lint, Types)          | Jeder Commit  |
| **Gesamt**            | Automatisierte Tests                             | **136 Tests** |

### Testpyramide

```
        /\
       /  \      Manuelle Tests (6)
      /----\
     /      \    Integration Tests (24)
    /--------\
   /          \  Unit Tests (112)
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

### Detaillierter Testzeitplan

| Zeitpunkt                  | Welche Tests                              | Verantwortlich     | Dokumentation         |
| -------------------------- | ----------------------------------------- | ------------------ | --------------------- |
| **Vor jedem Commit**       | Unit Tests lokal (`npm test`)             | Entwickler         | Terminal-Output       |
| **Bei Push/PR**            | Lint + Type-Check + Unit/Int Tests        | GitHub Actions     | CI-Log                |
| **Vor PR-Merge**           | Smoke Tests (MT-01, MT-02, MT-06)         | PR-Reviewer        | PR-Kommentar          |
| **Nach Feature-Abschluss** | Zugehörige manuelle Tests (gemäss Matrix) | Feature-Entwickler | Testprotokoll         |
| **Vor Release (Tag)**      | Alle manuellen Tests (MT-01 bis MT-06)    | QA (Raphael)       | Release-Checklist     |
| **Wöchentlich**            | Explorative Tests                         | Rotierend          | GitHub Issue bei Bugs |

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

### Manuelle Tests pro Release-Phase

| Phase              | Tests                            | Ziel                                |
| ------------------ | -------------------------------- | ----------------------------------- |
| **Development**    | MT-01, MT-02                     | Grundfunktionen während Entwicklung |
| **Feature-Review** | Relevante MT-Tests gemäss Matrix | Feature-spezifische Validierung     |
| **Pre-Release**    | MT-01 bis MT-06 komplett         | Vollständige Abnahme                |
| **Post-Release**   | MT-01, MT-05                     | Smoke Test nach Deployment          |

### Übersicht

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Entwickeln │────▶│   Commit    │───▶│   Push/PR   │───▶│   Merge     │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
      │                   │                   │                   │
      ▼                   ▼                   ▼                   ▼
  Manuelles           Lokale              CI Tests            Release
  Testen              Tests               (GitHub)            Build
  (MT-01, MT-02)      (npm test)          (Automatisch)       (MT-01-06)
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
