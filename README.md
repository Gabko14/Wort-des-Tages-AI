# Wort des Tages AI

Eine mobile App für das tägliche Wort des Tages.

## 📱 App Download

**Android APK:** [Download from GitHub Releases](../../releases/latest)

> Die neueste APK findet ihr immer im neuesten Release. Einfach die `.apk` Datei herunterladen und installieren.

## 🚀 Development

```bash
# Install dependencies
npm install

# Start development server
npm start
```

## 📦 CI/CD

| Trigger        | Action                                     |
| -------------- | ------------------------------------------ |
| Push to `main` | OTA Update (automatisch auf allen Geräten) |
| Tag `v*.*.*`   | Neuer APK Build                            |

### OTA Updates

Nach jedem Push auf `main` wird ein Over-the-Air Update veröffentlicht. Die App aktualisiert sich automatisch beim nächsten Start.

### Neuer APK Build

```bash
git tag v1.0.1
git push --tags
```
