# Changelog

Alle nutzerrelevanten Änderungen werden hier dokumentiert.
Format folgt [Keep a Changelog](https://keepachangelog.com/de/1.1.0/),
Versionierung folgt [SemVer](https://semver.org/lang/de/).
Bis zum ersten Go-Live (M11) bleibt das Projekt auf `0.0.0`.

## [Unreleased]

### Added

- **M1 — Datenbank-Schema & Migrations:** Vollständiges initiales Schema
  als SQLAlchemy-2.0-Modelle (User, Person, Event, EventParticipant,
  Application, ApplicationRestraint, RestraintType, ArmPosition,
  HandPosition, HandOrientation), Alembic-Initialmigration mit PostGIS-
  Aktivierung, `app_user`-Rolle, `updated_at`-Trigger via
  `clock_timestamp()`, GIST-Index auf `event.geom`, GIN-Indizes für
  deutsche Volltextsuche auf `note`, RLS aktiv mit permissiver
  Default-Policy auf den datenführenden Tabellen (M2 ersetzt mit
  scharfen Policies).
- Seed-Skripte für RestraintType-Anker-Modelle und alle Position-
  Lookups (`uv run python -m app.seeds.run`), idempotent via
  UNIQUE NULLS NOT DISTINCT + ON CONFLICT DO NOTHING.
- Test-Infrastruktur mit sync-DB-Fixture (psycopg) und optionalem
  testcontainers-Fallback; 13/13 Tests grün gegen echtes Postgres+PostGIS.
- ADR-018 dokumentiert die M1-Implementierungsentscheidungen
  (UUIDv7 client-seitig via uuid-utils, Trigger statt ORM-onupdate,
  permissive RLS-Default, Seed-Strategie).

- **M0 — Projekt-Setup:** Lauffähiges Skeleton aus FastAPI-Backend
  (`/api/health`, OpenAPI unter `/api/docs`), Next.js-Frontend (App Router,
  TypeScript strict, Tailwind, vorbereitetes shadcn/ui), Postgres+PostGIS-
  Container und Docker-Compose-Stack für die lokale Entwicklung.
- Backend-Tooling: ruff, mypy strict, pytest mit `httpx.AsyncClient`,
  structlog-Setup ohne PII.
- Frontend-Tooling: ESLint (next/core-web-vitals + next/typescript +
  prettier), Prettier mit Tailwind-Plugin, `pnpm typecheck`.
- Top-Level: `.env.example`, `.gitignore`, `.pre-commit-config.yaml`.
- Konzeptionsdokumente nach `docs/` verschoben (CLAUDE.md-konform).
