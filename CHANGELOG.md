# Changelog

Alle nutzerrelevanten Änderungen werden hier dokumentiert.
Format folgt [Keep a Changelog](https://keepachangelog.com/de/1.1.0/),
Versionierung folgt [SemVer](https://semver.org/lang/de/).
Bis zum ersten Go-Live (M11) bleibt das Projekt auf `0.0.0`.

## [Unreleased]

### Added

- **M2 — Auth & User-Management (Backend):** fastapi-users-Integration mit
  HttpOnly-Cookie + JWT (Cookie-Name `hcmap_session`), Argon2id-Hashing
  (OWASP-2024-Defaults), Login/Logout/Me/Forgot-Password/Reset-Password,
  Self-Registration deaktiviert. Doppel-Cookie-CSRF-Schutz mit
  `hcmap_csrf` + `X-CSRF-Token`-Header für alle State-Changing-Methoden.
  `app_user`-Postgres-Rolle plus per-Request-GUCs setzen RLS aktiv;
  scharfe Per-Rolle-Policies aus `architecture.md` §RLS ersetzen die
  permissive M1-Default-Policy. RLS-Hilfsfunktionen
  `app_user_can_see_event` / `app_user_owns_event` als `SECURITY DEFINER`
  vermeiden zirkuläre Policy-Auswertung. Strukturierter Mail-Stub
  (`structlog`-Output) für Reset-Tokens; SMTP folgt vor M11. Idempotente
  Bootstrap-CLI `python -m scripts.bootstrap_admin` legt den ersten
  Admin-User samt verlinkter Person an.
- ADR-019 dokumentiert die M2-Entscheidungen
  (Cookie-Strategie, CSRF-Mechanik, Argon2-Parameter, RLS-Setup,
  Bootstrap-CLI, Mail-Stub).

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
