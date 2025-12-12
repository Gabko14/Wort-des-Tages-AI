# Versionierung und Artefakt-Verwaltung

## 1. Versionierungsstrategie: Semantic Versioning (SemVer)

Dieses Projekt verwendet **Semantic Versioning 2.0.0** nach dem Schema `MAJOR.MINOR.PATCH`.

### Versionsschema

| Komponente | Bedeutung                                     | Beispiel                              |
| ---------- | --------------------------------------------- | ------------------------------------- |
| **MAJOR**  | Breaking Changes, inkompatible API-Änderungen | `2.0.0` - Neue Datenbank-Struktur     |
| **MINOR**  | Neue Features, abwärtskompatibel              | `1.1.0` - Premium-Feature hinzugefügt |
| **PATCH**  | Bugfixes, abwärtskompatibel                   | `1.0.1` - Crash-Fix beim Start        |

### Versionierung im Projekt

Die Version wird an zwei Stellen gepflegt:

1. **`package.json`** - npm-Paketversion

   ```json
   { "version": "1.0.0" }
   ```

2. **`app.json`** - Expo/App-Store-Version
   ```json
   { "expo": { "version": "1.0.0" } }
   ```

### Git-Tags für Releases

Releases werden durch Git-Tags ausgelöst:

```bash
# Neues Release erstellen
git tag v1.0.1
git push --tags
```

**Wichtig**: Der Tag-Name muss dem Format `v*.*.*` entsprechen (z.B. `v1.0.0`, `v2.1.3`).

---

## 2. Artefakt-Verwaltung

### Artefakt-Typen

| Artefakt    | Format         | Speicherort        | Zweck                |
| ----------- | -------------- | ------------------ | -------------------- |
| APK-Datei   | `.apk`         | GitHub Releases    | Android-Installation |
| OTA-Bundle  | JS-Bundle      | Expo Update Server | Over-the-Air Updates |
| Source Code | Git Repository | GitHub             | Versionskontrolle    |

### Artefakt-Repository

- **GitHub Releases**: Offizielle APK-Downloads unter `/releases`
- **Expo Update Server**: OTA-Updates unter `https://u.expo.dev/[project-id]`

---

## 3. CI/CD-Integrationsprozesse

### Pipeline-Übersicht

```
┌─────────────────────────────────────────────────────────────────┐
│                        GitHub Actions                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Push/PR → [CI Workflow] → Lint → Type-Check → Tests → Build   │
│                                                                 │
│  Push main → [EAS Update] → OTA-Update auf alle Geräte         │
│                                                                 │
│  Tag v*.*.* → [EAS Build] → APK erstellen → GitHub Release     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Workflow 1: Continuous Integration (`ci.yml`)

**Trigger**: Jeder Push und Pull Request

**Schritte**:

1. Code auschecken
2. Node.js 20 einrichten
3. Dependencies installieren (`npm ci`)
4. ESLint ausführen (`npm run lint`)
5. TypeScript prüfen (`npm run type-check`)
6. Jest-Tests ausführen (`npm test`)
7. Web-Export erstellen (`expo export`)

### Workflow 2: EAS CI/CD (`eas-update.yml`)

#### OTA-Update (bei Push auf `main`)

**Trigger**: Push auf `main`-Branch

**Schritte**:

1. Code auschecken
2. EAS CLI einrichten
3. Dependencies installieren
4. Update veröffentlichen (`eas update --branch preview`)

**Ergebnis**: App aktualisiert sich automatisch beim nächsten Start

#### APK-Build (bei Version-Tag)

**Trigger**: Git-Tag mit Format `v*.*.*`

**Schritte**:

1. Code auschecken
2. EAS CLI einrichten
3. Dependencies installieren
4. Version in `app.json` aus Tag setzen
5. APK bauen (`eas build --platform android`)
6. APK von EAS herunterladen
7. GitHub Release mit APK erstellen

**Ergebnis**: Neue APK-Datei unter GitHub Releases verfügbar

---

## 4. Checkliste: Neues Release erstellen

### Vor dem Release

- [ ] Alle Features für das Release sind gemerged
- [ ] CI-Pipeline ist grün (Lint, Tests, Type-Check bestanden)
- [ ] CHANGELOG/Release Notes vorbereitet (optional)
- [ ] Version in `package.json` aktualisiert (optional, wird automatisch aus Tag gesetzt)

### Release durchführen

- [ ] Git-Tag erstellen:
  ```bash
  git tag v1.x.x
  ```
- [ ] Tag pushen:
  ```bash
  git push --tags
  ```
- [ ] GitHub Actions überwachen (Build dauert ca. 10-15 Min)

### Nach dem Release

- [ ] GitHub Release wurde erstellt
- [ ] APK-Datei ist im Release verfügbar
- [ ] APK auf Testgerät installieren und testen
- [ ] Release Notes ergänzen (falls nötig)

---

## 5. Checkliste: OTA-Update veröffentlichen

### Vor dem Update

- [ ] Änderungen sind auf `main` gemerged
- [ ] CI-Pipeline ist grün
- [ ] Keine Breaking Changes (erfordern neuen APK-Build)

### Update durchführen

- [ ] Push auf `main` (automatisch bei Merge)
  ```bash
  git push origin main
  ```
- [ ] EAS Update Workflow überwachen

### Nach dem Update

- [ ] Update in Expo Dashboard sichtbar
- [ ] App auf Testgerät neu starten
- [ ] Update wird automatisch geladen

---

## 6. Umgebungsvariablen und Secrets

### GitHub Secrets (Repository Settings → Secrets)

| Secret       | Beschreibung                  |
| ------------ | ----------------------------- |
| `EXPO_TOKEN` | Expo Access Token für EAS CLI |

### Lokale Entwicklung (`.env.local`)

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=xxx
```

---

## 7. Verwendete Tools

| Tool           | Version | Zweck                     |
| -------------- | ------- | ------------------------- |
| GitHub Actions | -       | CI/CD-Plattform           |
| EAS Build      | latest  | Cloud-basierter App-Build |
| EAS Update     | latest  | OTA-Update-Distribution   |
| npm            | 10.x    | Package Manager           |
| Node.js        | 20.x    | JavaScript Runtime        |
