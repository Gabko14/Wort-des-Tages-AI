# Deployment

## 1. Versionierung (SemVer)

Wir nutzen **Semantic Versioning**: `MAJOR.MINOR.PATCH`

| Teil      | Wann erhöhen?           | Beispiel                  |
| --------- | ----------------------- | ------------------------- |
| **MAJOR** | App funktioniert anders | `2.0.0` - Neues DB-Schema |
| **MINOR** | Neues Feature           | `1.1.0` - Premium hinzu   |
| **PATCH** | Bugfix                  | `1.0.1` - Crash behoben   |

**Wo steht die Version?**

- `package.json` → `"version": "1.0.0"`
- `app.json` → `"expo": { "version": "1.0.0" }`

---

## 2. Integrationspraktik

### Warum GitHub Actions?

Wir haben GitHub Actions als CI/CD-Tool gewählt weil:

- Direkt in GitHub integriert (kein externer Service nötig)
- Kostenlos für Open-Source-Projekte
- Einfache YAML-Konfiguration
- Gute Integration mit Expo/EAS

Alternativen wie Jenkins (zu komplex), GitLab CI (anderer Git-Host) oder CircleCI (zusätzlicher Account) waren für unser Projekt nicht sinnvoll.

### Best Practices für Code-Integration

| Regel             | Beschreibung                                             |
| ----------------- | -------------------------------------------------------- |
| Pull Requests     | Alle Änderungen über PRs, nicht direkt auf `main` pushen |
| CI muss grün sein | Merge erst wenn Lint, Tests und Type-Check bestanden     |
| Kleine PRs        | Lieber mehrere kleine als ein grosser PR                 |

### Was passiert automatisch?

Wir haben zwei GitHub Actions Workflows:

#### Bei jedem Push/PR → Code-Prüfung (`ci.yml`)

Prüft automatisch ob der Code in Ordnung ist:

- Lint (Code-Stil)
- Type-Check (TypeScript-Fehler)
- Tests (Jest)

#### Bei Git-Tag `v*.*.*` → Neues APK (`eas-build.yml`)

Erstellt automatisch eine neue APK und lädt sie auf GitHub Releases hoch.

---

## 3. Artefakte (Was wird wo gespeichert?)

| Was?        | Wo?               | Wofür?            |
| ----------- | ----------------- | ----------------- |
| APK-Datei   | GitHub Releases   | App installieren  |
| Source Code | GitHub Repository | Versionskontrolle |

### Eindeutige Identifizierung

Jede APK ist eindeutig identifizierbar durch:

- **Dateiname**: Enthält Version, z.B. `wort-des-tages-v1.0.1.apk`
- **Git-Tag**: Jedes Release ist mit einem Tag verknüpft (`v1.0.1`)
- **Commit-Hash**: Der Tag zeigt auf einen spezifischen Commit

So kann jederzeit nachvollzogen werden, welcher Code in welcher APK steckt.

### Bereinigung alter Artefakte

Bei Bedarf werden alte Releases manuell auf GitHub gelöscht:

1. Repository → Releases
2. Altes Release auswählen → Delete

Kriterien für Löschung:

- Release älter als 6 Monate und nicht mehr in Verwendung
- Fehlerhafte Builds (z.B. falscher Build-Prozess)

**Warum nicht automatisiert?** Bei einem kleinen Projekt mit wenigen Releases lohnt sich der Aufwand nicht. GitHub Releases haben kein Speicherlimit, daher entsteht kein Druck zur automatischen Bereinigung.

---

## 4. Abhängigkeiten-Management

Alle Abhängigkeiten sind in `package.json` definiert und durch `package-lock.json` auf exakte Versionen fixiert.

| Datei               | Zweck                                          |
| ------------------- | ---------------------------------------------- |
| `package.json`      | Liste der Abhängigkeiten mit Versionsbereichen |
| `package-lock.json` | Exakte Versionen für reproduzierbare Builds    |

### Potenzielle Probleme

| Problem              | Beschreibung                                                  |
| -------------------- | ------------------------------------------------------------- |
| Versions-Divergenz   | Entwickler haben unterschiedliche Versionen lokal installiert |
| Breaking Changes     | Neue Major-Version einer Dependency macht Code kaputt         |
| Phantom Dependencies | Code nutzt Dependency die nur transitiv installiert ist       |

### Strategien zur Minimierung

| Strategie                  | Umsetzung                                                                 |
| -------------------------- | ------------------------------------------------------------------------- |
| Lock-File committen        | `package-lock.json` ist in Git versioniert                                |
| `npm ci` in CI             | Installiert exakt die Versionen aus Lock-File, schlägt fehl bei Divergenz |
| Versionsbereiche begrenzen | Keine `*` oder `latest` in `package.json`                                 |

---

## 5. Servicekonfiguration (Wartbarkeit & Skalierbarkeit)

| Service        | Anbieter       | Zweck                       | Skalierung           |
| -------------- | -------------- | --------------------------- | -------------------- |
| Build-Server   | EAS (Expo)     | APK-Builds in der Cloud     | Automatisch          |
| CI/CD          | GitHub Actions | Tests, Linting, Deployment  | Automatisch          |
| Datenbank      | Supabase       | PostgreSQL für Entitlements | Managed, automatisch |
| Edge Functions | Supabase       | AI-Enrichment API           | Serverless           |
| Releases       | GitHub         | APK-Downloads für Benutzer  | Unbegrenzt           |

**Warum diese Konfiguration wartbar ist:**

- Keine eigenen Server zu verwalten (alles managed/serverless)
- Konfiguration liegt im Code (`eas.json`, `.github/workflows/`, `supabase/`)
- Änderungen an der Infrastruktur sind versioniert in Git

**Warum diese Konfiguration skalierbar ist:**

- Alle Services skalieren automatisch bei mehr Last
- Keine manuellen Anpassungen nötig bei mehr Benutzern
- Kosten steigen nur bei tatsächlicher Nutzung (Pay-as-you-go)

---

## 6. Checkliste: Neues Release

```bash
# 1. Sicherstellen dass CI grün ist (alle Tests bestanden)

# 2. Tag erstellen (z.B. v1.0.1)
git tag v1.0.1

# 3. Tag pushen → startet automatisch den Build
git push --tags

# 4. Warten (~10-15 Min) und auf GitHub Releases prüfen
```

Die Version in `app.json` wird automatisch aus dem Tag-Namen gesetzt.
