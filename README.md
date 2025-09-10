# Wort-des-Tages AI – Personalisierter Vokabel-Coach für Fortgeschrittene

## Projektbeschreibung

Wort-des-Tages AI ist eine lernzentrierte App für fortgeschrittene Sprachlernende, die ihren aktiven Wortschatz gezielt und effizient erweitern möchten. Die App generiert täglich mehrere, auf den Nutzer zugeschnittene Wörter, liefert prägnante Kontexte & Kollokationen und erstellt KI-gestützte Übungen, damit neue Wörter nicht nur verstanden, sondern richtig angewendet werden. Durch Erinnerungen/Benachrichtigungen bleibt das tägliche Lernen leicht und konstant.

## Projektziele (nicht-technisch)

1. **Gezielte Wortschatz-Erweiterung statt Grundwortschatz**  
   Fokus auf fortgeschrittene, nützliche Wörter inkl. Register, Synonyme, Antonyme, Kollokationen und typische Fehlerquellen.

2. **Tägliche Lernroutine etablieren**  
   Sanfte, konfigurierbare Benachrichtigungen, Streaks und Mini-Sessions (≤5 Min) senken die Einstiegshürde.

3. **Vom Verstehen zum Anwenden**  
   Beispiele in natürlichen Kontexten, kurze Erklärungen zur Nuance und produktive Übungen (z. B. Lückentexte, Paraphrasen, Micro-Writing).

4. **Personalisierung & Kontrolle**  
   Anzahl, Wortarten & Themen sind einstellbar; Vorschläge passen sich an Lernfortschritt und Fehlermuster an.

5. **Nachhaltige Festigung**  
   Spaced-Repetition-Wiederholungen, adaptive Abstände, aktive Abrufübungen.

## USP – Warum unser Produkt?

- **Lücke im Markt:** Fortgeschrittene Lernende finden kaum Apps, die gezielt anspruchsvollen Wortschatz trainieren.  

- **Besser als Alternativen:**  
  - *Duden Wort des Tages*: liefert einzelne Wörter ohne Personalisierung, Kontexttiefe oder Übungen.  
  - *Lesen/Hören/Schreiben*: effektiv, aber zeitintensiv, wenn es „nur“ um neue Wörter geht.  
  - *Personal Language Coach*: wirksam, aber teuer.  

Wort-des-Tages AI kombiniert Personalisierung, Kontextqualität und Übungen in einem kompakten, täglichen Format.

## Zielgruppe

- Fortgeschrittene Sprachlernende (C1/C2-Ambition), die ihren Wortschatz gezielt & aktiv ausbauen möchten  
- Berufstätige und Studierende mit knapper Zeit, die dennoch täglich dranbleiben wollen  
- Sprachliebhaber:innen, die Präzision, Stil und Registernuancen schätzen  

## Anforderungen an die Applikation

### Funktionale Anforderungen
- Tägliche Generierung neuer Wörter (mehrere pro Tag)  
- Konfiguration von Menge, Wortarten, Themen, Schwierigkeitsgrad  
- Benachrichtigungen (mobil & optional Desktop/PWA)  
- Kontextdarstellung (Beispielsätze, Kollokationen, Register, typische Fehler)  
- KI-Übungen zur aktiven Anwendung (Lückentexte, Umschreibungen, Mini-Aufsätze, Synonym/Antonym-Checks)  
- Spaced-Repetition mit adaptiver Wiederholungsplanung  
- Fortschrittsanzeige (Streaks, Mastery-Score, Fehlertrends)  
- Favoriten & Wortlisten (Themenordner, Export)  
- Mehrsprachige UI (de/en) und Mehrsprach-Zielsprache (konfigurierbar)  
- Datenschutz & Offline-Modus light (Lernen mit zuletzt synchronisierten Items)  

### Nicht-funktionale Anforderungen
- Einfach & fokussiert: 1-Tap-Session ≤5 Min  
- Responsiv & performant (Mobile-First, PWA-fähig)  
- Skalierbarkeit (mehr Nutzer, neue Sprachen/Modelle)  
- Wartbarkeit (modulare Architektur, klare Domänen)  
- Datenschutz by Design (minimale Speicherung, transparente Opt-ins)  
- Zuverlässige Benachrichtigungen (Retry, stille Pushes für SRS-Fälligkeiten)  

## Probleme, die gelöst werden

- Mangel an fortgeschrittenem Wortschatztraining: kuratiert & personalisiert statt Zufallswörter  
- „Kenne ich, nutze ich aber nicht“-Effekt: produktive Übungen + Kontext = aktive Beherrschung  
- Zeitknappheit: kurze, tägliche Mikrosessions mit Push-Reminder  
- Vergessen ohne System: Spaced-Repetition mit adaptiven Intervallen  

## Go-to-Market & Stakeholder

- **Wer profitiert?** Fortgeschrittene Lernende, die Präzision & Registersicherheit wollen  
- **Wer hilft beim Verbessern?** Unsere Kund:innen (In-App-Feedback, A/B-Tests)  
- **Wer hilft beim Vertrieb?** Mein Assistent, Privatschulen, Online-Sprachcoaches  
- **Wer hilft bei der Herstellung?** Claude, Gemini, Grok, Nando Sterki  

## Architektur & Technologie (Vorschlag)

- **App (Mobile & PWA):** Flutter (Dart) → iOS/Android/Web aus einem Code-Base, schnelle UI, Push-Support  
- **Backend:** Python (FastAPI) oder Node.js (NestJS) für klare APIs & schnelle Iteration  
- **KI-Schicht:** Anbindung an LLM-Provider (z. B. Claude, Gemini, Grok) über abstrakte Model-Adapter  
- **Datenbank:** PostgreSQL (Core), Redis (Queues/SRS), optional Elasticsearch (Suche)  
- **Auth:** OAuth 2.1 / OIDC (Passkeys wo möglich)  
- **Push:** Firebase Cloud Messaging (Android/Web), Apple Push Notification service (iOS)  
- **Infra:** Docker, CI/CD (GitHub Actions), IaC (Terraform), Observability (OpenTelemetry)  
- **Datenschutz:** Verschlüsselung at rest & in transit, Region-Locking (EU), minimal PII  
