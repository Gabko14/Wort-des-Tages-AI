# CLAUDE.md

German "Word of the Day" app (Expo Router / React Native). Daily words from a bundled SQLite DB (`assets/database/dwds.db`); premium users get AI enrichment via Supabase Edge Functions.

## Non-Negotiables

- **Offline-first**: local DB and core app flow must work without network.
- **Services throw, UI catches**: services (`services/`) never show UI or navigate; screens catch `AppError` and decide.
- **No new dependencies** without a clear, documented reason.

## Commands

```bash
npm test
npm run lint
npm run type-check
```

## Supabase

Two projects: prod `otiioifscvmgcsywiarz`, dev `dclszvpstwnkzqfjvxwa`. Link via `npm run supabase:link:dev|prod`, then `supabase:push` / `supabase:deploy`. Always deploy to dev first. Migrations are append-only.
