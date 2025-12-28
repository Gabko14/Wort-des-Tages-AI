![Coverage](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/Gabko14/Wort-des-Tages-AI/badges/badges/coverage.json&style=for-the-badge)
![Repo Size](https://img.shields.io/github/repo-size/Gabko14/Wort-des-Tages-AI?style=for-the-badge)
![LOC](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/Gabko14/Wort-des-Tages-AI/badges/badges/loc.json&style=for-the-badge)
![Activity](https://img.shields.io/github/commit-activity/m/Gabko14/Wort-des-Tages-AI?style=for-the-badge)

# Wort des Tages AI

Eine mobile App für das tägliche Wort des Tages.

## 📱 App Download

**Android APK:** [Download from GitHub Releases](../../releases/latest)

> Die neueste APK findet ihr immer im neuesten Release. Einfach die `.apk` Datei herunterladen und installieren.

## 🚀 Development

### Pull environment variables

```bash
# if you don't have eas-cli installed
npm install -g eas-cli
```

```bash
# request access to our expo org and then run
eas login
eas env:pull
```

### Running app in dev mode

```bash
# Install dependencies
npm install

# Start development server
npm start
```

## 👨‍💻 Code-Richtlinien

### Standards

> ✅ = Automatisch geprüft (ESLint/Prettier/TypeScript)

#### Code-Formatierung ✅

- **Single Quotes** (`'`) für Strings
- **Semicolons** (`;`) am Zeilenende
- **2 Spaces** für Einrückung
- **Trailing Commas** im ES5-Stil
- **Zeilenlänge**: 80 Zeichen

#### TypeScript ✅

- **Strict Mode** aktiviert
- Explizite Typen für alle Funktionsparameter und Rückgabewerte
- Interfaces für Props und Datenstrukturen (`interface WordCardProps`)
- Type Aliases für Union Types (`type FrequencyRange = 'selten' | 'mittel' | 'haeufig'`)
- Path Alias `@/*` für Imports aus dem Root-Verzeichnis
- Keine `any` Types

#### Namenskonventionen ✅

- **Variablen**: camelCase, UPPER_CASE oder PascalCase
- **Funktionen**: camelCase oder PascalCase (für Komponenten)
- **Typen & Interfaces**: PascalCase

#### Import-Reihenfolge ✅

1. React & React Native Imports
2. Third-Party Libraries (Expo, etc.)
3. Lokale Imports mit `@/` Alias
4. Relative Imports (`./`)
5. Leerzeile zwischen Gruppen

#### Projekt-Struktur

```
/app            - Expo Router Screens & Layouts
/components     - React-Komponenten
/services       - Business-Logik & Datenbank-Zugriff
/hooks          - Custom React Hooks
/constants      - Konstanten (z.B. Colors)
/assets         - Statische Ressourcen (Fonts, Images, Database)
/types          - TypeScript Type Definitions
```

#### Dateinamen

- **Komponenten**: PascalCase (`WordCard.tsx`)
- **Services**: camelCase (`wordService.ts`)
- **Hooks**: camelCase mit `use` Prefix (`useDailyRefresh.ts`)

#### React & React Native Patterns

- **Functional Components** mit TypeScript
- **Named Exports** für Komponenten (`export function WordCard()`)
- **Default Exports** nur für Screens (`export default function HomeScreen()`)
- **StyleSheet.create()** für Styles am Ende der Datei
- **Custom Hooks** für wiederverwendbare Logik
- **Props Destructuring** in Funktionsparametern

#### Datenbank & Services

- **Singleton Pattern** für Database Connection
- **Async/Await** für alle DB-Operationen
- **Type-Safe** Queries mit Generics (`db.getAllAsync<Wort>()`)
- **Service-Funktionen** sind `async` und exportiert
- **Helper-Funktionen** sind nicht exportiert

#### Testing

- Tests in `__tests__` Ordnern neben dem Code
- Testdateien: `*.test.ts` oder `*.test.tsx`
- Jest mit `jest-expo` Preset
- `describe()` Blöcke für Gruppierung
- `it()` für einzelne Tests

#### Fehlerbehandlung

- Services werfen typed `AppError` (`utils/appError.ts`), UI fängt ab und zeigt Fallback/Meldung
- Promises immer behandeln: `await` + `try/catch` oder `.catch()` bei "fire-and-forget"
- Render-Fehler: Expo Router `ErrorBoundary` in `app/_layout.tsx`
- `console.error()` für Fehler-Logging

## 📦 Deployment

Siehe [DEPLOYMENT.md](DEPLOYMENT.md) für:

- Versionierung (SemVer)
- CI/CD Pipelines
- Artefakt-Verwaltung
- Release-Checkliste

## 📖 Realisierungskonzept

Siehe [REALISIERUNGSKONZEPT.md](REALISIERUNGSKONZEPT.md) für:

- Ziele und Anforderungen
- Architektur und Komponenten
- Technologiestack
- Datenmodell (ERD, DSGVO)
- Sicherheit und Verschlüsselung
- Projektorganisation und Meilensteine
- Risiken und Wartungsplan

## 🧪 Testkonzept

Siehe [TESTKONZEPT.md](TESTKONZEPT.md) für:

- Kritikalität der Funktionseinheiten
- Testfälle und Testdaten
- Testumgebung und Testinfrastruktur
- Testarten und Testverfahren
- Testzeitpunkte im CI/CD Prozess
