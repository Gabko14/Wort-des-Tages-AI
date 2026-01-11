# Pitch-Informationen: Wort des Tages AI

> Dieses Dokument sammelt alle Infos für den Gate 2 Pitch.
> Status: IN ARBEIT

---

## Folie 0: Titelfolie

| Feld | Info |
|------|------|
| Projektname | Wort des Tages AI |
| Schlagzeile | „1 Wort besser am Tag" |
| Datum | 11. Januar 2026 |
| Team | Gabriel, Ayan, Raphael |
| Kontakt | gabkolistiak@gmail.com |
| Logo | Vorhanden in `/assets/` |

---

## Folie 1: Das Problem

| Aspekt | Beschreibung |
|--------|--------------|
| Problem | Fortgeschrittene Sprachlernende haben keinen strukturierten Weg, ihren Wortschatz aktiv zu erweitern |
| Wen betrifft es? | Ambitionierte Personen mit bereits guten Deutschkenntnissen (Studierende, Berufstätige, Lehrpersonen) |
| Warum ist das ein Problem? | Bestehende Apps fokussieren auf Anfänger; "Wort des Tages"-Dienste bieten nur passive Infos ohne Übungen |

---

## Folie 2: Unsere Lösung

**Produktname:** Wort des Tages AI

**Zielgruppe (bestätigt):**
> Ambitionierte Personen mit guten Sprachkenntnissen, die ihren deutschen Wortschatz erweitern wollen, um ihre Sprachfertigkeiten auf das nächste Level zu bringen.

**Sprache:** Vorerst nur Deutsch

**Hauptziele (aus Realisierungskonzept):**
| Ziel | Beschreibung |
|------|--------------|
| Tägliches Lernen | Die App generiert jeden Tag mehrere nützliche Wörter, die sich der Nutzer merken kann |
| Erinnerung | Die App erinnert den Nutzer täglich an das Lernen (Benachrichtigungen) |
| Kontextverständnis | Die App zeigt, wie und in welchem Kontext die Wörter verwendet werden |

**Funktionale Anforderungen (aus Realisierungskonzept):**
- Tägliche Generierung neuer Wörter
- Einstellbare Menge und Art der Wörter
- Benachrichtigungsfunktion
- KI-gestützte Aufgaben zur korrekten Wortanwendung (Premium)
- Streak-Tracking für tägliche Nutzung
- In-App-Subscriptions für Premium-Features
- OTA-Updates für schnelle Bugfixes

**USPs (bestätigt):**
1. Tägliche Wortgenerierung
2. Personalisierung
3. Praxisnahe Übungen für Fortgeschrittene

**Screenshots für Präsentation:**
| Folie | Screenshot | Pfad |
|-------|------------|------|
| Jede Folie | Logo | `assets/images/logo.png` |
| Folie 2 | Premium mit KI-Quiz | `docs/screenshots/homescreen-premium.png` |
| Folie 3 | Einstellungen | `docs/screenshots/settings.png` |

**Schutzstrategie:**

| Strategie | Beschreibung |
|-----------|--------------|
| KI-Alleinstellung | Wir sind die einzige "Wort des Tages"-App mit KI-Integration – selbst englische Apps bieten das nicht |
| First Mover | Als Erste am Markt für diese Nische können wir Nutzer gewinnen, bevor Konkurrenz entsteht |
| Nutzerbindung | Streaks, Lernfortschritt und personalisierte Wortlisten schaffen Wechselkosten – Nutzer verlieren ihre Daten bei einem Wechsel |

---

## Folie 3: Warum es funktioniert

**Technologie (aus Realisierungskonzept):**

Frontend:
- React Native 0.81
- Expo SDK 54
- TypeScript 5.9
- expo-sqlite (lokale Datenbank)
- expo-iap (In-App Purchases)

Backend:
- Supabase Edge Functions
- OpenAI API (gpt-4o-mini)
- PostgreSQL (Entitlements)

**Architektur:** 3-Schichten-Architektur
- Präsentationsschicht (React Native)
- Geschäftslogik (Services)
- Datenschicht (SQLite, AsyncStorage, Supabase)

**Architekturentscheidungen (aus Realisierungskonzept):**
| Entscheidung | Begründung |
|--------------|------------|
| Lokale SQLite-Datenbank | Offline-Fähigkeit, schnelle Abfragen, keine Serverkosten für Wortdaten |
| Supabase Edge Functions | Serverless, skalierbar, einfache Deployment |
| AsyncStorage für Caching | Persistenter Cache für Settings, Premium-Status, AI-Responses |
| Device-basierte Entitlements | Keine Benutzerregistrierung nötig, einfache UX |

---

## Folie 4: Der Markt

| Aspekt | Daten |
|--------|-------|
| Gesamtmarkt (TAM) | [TODO: z.B. "X Mio. Deutschlernende weltweit"] |
| Zielmarkt (SAM) | [TODO: z.B. "Fortgeschrittene im DACH-Raum"] |
| Erreichbarer Markt (SOM) | [TODO: z.B. "X Nutzer im ersten Jahr"] |
| Marktwachstum | [TODO: z.B. "X% jährlich"] |

**Ansatz:** Bottom-Up (aus Canvas: 10'000 Nutzer Jahr 1 → 100'000 Jahr 5)

**Markteinführungsstrategie:**
- App Store Launch (Android zuerst)
- Social Media Marketing
- Kooperationen mit Sprachschulen

---

## Folie 5: Die Mitbewerber

**Direkte Konkurrenz:**
| Anbieter | Angebot | Schwäche |
|----------|---------|----------|
| Duden "Wort des Tages" | Tägliches Wort per Newsletter/Website | Passiv, keine Übungen, keine Personalisierung |

**Indirekte Konkurrenz (andere Lösungen für dasselbe Problem):**
| Alternative | Schwäche |
|-------------|----------|
| Duolingo, Babbel etc. | Fokus auf Anfänger, nicht für Fortgeschrittene |
| Bücher lesen | Kein strukturierter Weg, keine aktiven Übungen |

**Warum wir besser sind:**
- KI-gestützte, personalisierte Wörter
- Aktive Übungen statt passives Lesen
- Speziell für Fortgeschrittene entwickelt

**Preisvergleich:**
| Anbieter | Preis |
|----------|-------|
| Duden | Kostenlos (aber passiv) |
| Wort des Tages AI | Freemium, Premium 25 CHF/Jahr |

---

## Folie 6: Geschäftsmodell

**Modell:** Freemium mit Premium-Abo

**Free Features (aus Realisierungskonzept):**
- Tägliche Wörter
- Einstellungen (Wortanzahl, Typen)
- Benachrichtigungen
- Streaks

**Premium Features (aus Realisierungskonzept):**
- KI-Definitionen
- Beispielsätze
- Erweiterte Statistiken

**Abo-Optionen (aus Realisierungskonzept):**
| SKU | Laufzeit |
|-----|----------|
| wdt_premium_monthly | Monatlich |
| wdt_premium_yearly | Jährlich |

**Preise (bestätigt):**
- Premium-Abo: **25 CHF/Jahr** (später steigend auf 35 CHF)
- Keine In-App-Käufe für Themenpakete

**Vertrieb (aus Canvas):**
- App-Stores (iOS und Android)

**Marketing (aus Canvas):**
- Social Media (Instagram, LinkedIn)
- Online-Marketing-Kampagnen
- Kooperationen mit Sprachcoaches und Privatschulen
- Newsletter
- Push-Benachrichtigungen
- Empfehlungsprogramme
- Affiliate-Partnerschaften mit Schulen

*→ Noch zu bestätigen: Vorerst nur Android?*

**Kosten (bestätigt):**
- Server & Lizenzen: <100 CHF/Monat
- Marketing: variabel

**Partner:**
- Sprachschulen
- Online-Sprachcoaches
- Technologiepartner (OpenAI)

**Entwicklung:** Intern (ganzes Team)

---

## Folie 7: Die Umsetzung

**Bisherige Meilensteine:**

| Meilenstein | Status |
|-------------|--------|
| Environment Setup | ✅ Erledigt |
| Grundfunktionen | ✅ Erledigt |

**Projektstart:** August 2025

**Nächste Schritte (nach Gate 2):**

| Schritt | Ziel |
|---------|------|
| Technische Entwicklung abschliessen | Alle Features implementieren |
| KI-Integration | OpenAI-Anbindung für personalisierte Inhalte |
| Premium & In-App Purchases | Monetarisierung einbauen |
| Beta-Testing | Feedback von echten Nutzern sammeln |
| App Store Launch | Android-Release vorbereiten |

---

## Folie 8: Finanzen

**Laufende Kosten (aus Realisierungskonzept):**
| Ressource | Kosten |
|-----------|--------|
| Supabase | Free Tier |
| Expo/EAS | Free Tier |
| OpenAI API | Pay-as-you-go |

**5-Jahres-Prognose (bestätigt):**

| Jahr | Nutzer | Premium % | Zahlend | Preis | Einnahmen |
|------|--------|-----------|---------|-------|-----------|
| 2025 | 10'000 | 10% | 1'000 | 25 CHF | 25'000 CHF |
| 2026 | 25'000 | 15% | 3'750 | 25 CHF | 93'750 CHF |
| 2027 | 50'000 | 20% | 10'000 | 30 CHF | 300'000 CHF |
| 2028 | 75'000 | 25% | 18'750 | 30 CHF | 562'500 CHF |
| 2029 | 100'000 | 30% | 30'000 | 35 CHF | 1'050'000 CHF |

**Break-even:** 2026
**Startliquidität benötigt:** 60'000 CHF

---

## Folie 9: Team

**Rollen:**
| Name | Fokus | Aufgaben |
|------|-------|----------|
| Gabriel | Entwicklung & DevOps | Code, CI/CD, Infrastruktur |
| Ayan | Projektmanagement | Planung, Koordination, Dokumentation |
| Raphael | Qualitätsmanagement | Testing, Code Review, QA |

> Alle Teammitglieder arbeiten auch bereichsübergreifend.

**Belbin-Rollen (bestätigt):**
| Name | Belbin-Rolle | Punkte | Stärken |
|------|--------------|--------|---------|
| Ayan | Umsetzer (Implementer) | 13 | Strukturiert, zuverlässig |
| Gabriel | Koordinator (Co-ordinator) | 10 | Übersicht, Zielorientierung |
| Raphael | Umsetzer (Implementer) | 11 | Technisch versiert, lösungsorientiert |

**Stärken/Schwächen:**
| Name | Stärken | Schwächen |
|------|---------|-----------|
| Gabriel | [TODO] | [TODO] |
| Ayan | [TODO] | [TODO] |
| Raphael | [TODO] | [TODO] |

**Team-Werte:** Lernen, Verlässlichkeit, Kreativität, Ehrlichkeit, Empathie

---

## Folie 10: Fazit

**Warum dieses Projekt?**

Wir haben eine echte Marktlücke entdeckt: Es gibt keine App, die Fortgeschrittenen hilft, ihren Wortschatz aktiv zu erweitern. Duden bietet nur passive Infos, Duolingo ist für Anfänger – wir schliessen diese Lücke.

**Warum wir?**

- Wir sind selbst die Zielgruppe und kennen das Problem
- Wir haben bereits einen funktionierenden Prototyp entwickelt
- Unser Team vereint Entwicklung, Projektmanagement und Qualitätssicherung

**Unsere Vision:**

Mit "Wort des Tages AI" wird jeder Tag eine Chance, die eigene Sprache zu verbessern – ein Wort nach dem anderen.

**„1 Wort besser am Tag"**

---

## Präsentationsaufteilung

| Folien | Thema | Präsentator | Zeit |
|--------|-------|-------------|------|
| 0-1 | Titel & Problem | Gabriel | ~1.5 min |
| 2-3 | Lösung & Technologie | Ayan | ~2 min |
| 4-5 | Markt & Mitbewerber | Raphael | ~2 min |
| 6-7 | Geschäftsmodell & Umsetzung | Gabriel | ~2 min |
| 8-9 | Finanzen & Team | Ayan | ~1.5 min |
| 10 | Fazit | Raphael | ~1 min |

**Gesamtzeit:** ~10 Minuten

---

## Offene Punkte (TBD)

- [x] Folie 1: Problem-Definition
- [ ] Folie 2: USPs
- [ ] Folie 4: Marktdaten
- [ ] Folie 5: Mitbewerber-Analyse
- [ ] Folie 6: Abo-Preise
- [ ] Folie 8: 5-Jahres-Finanzplan
- [ ] Folie 9: Belbin-Rollen, Stärken, Schwächen
- [ ] Folie 10: Fazit / Warum wir
- [ ] Schutzstrategie (wird irgendwo gebraucht)

---

## Nach Canvas noch zu klären

*(Nicht im Canvas enthalten - müssen separat besprochen werden)*

- [ ] **Folie 0:** Logo vorhanden? Präsentationsdatum? Kontaktinfo?
- [x] **Folie 1:** Problem-Definition (komplett)
- [ ] **Folie 4:** Marktdaten/Marktgrösse (Recherche nötig?)
- [ ] **Folie 7:** Nächste Schritte nach aktuellem Stand
- [ ] **Folie 10:** Fazit / "Warum wir"
- [ ] **Schutzstrategie:** Wie schützt ihr euch vor Nachahmern?
- [ ] **Screenshots:** Welche für die Präsentation verwenden?
- [ ] **Wer präsentiert was?** (für Script)
