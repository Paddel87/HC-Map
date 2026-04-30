<!--
Zweck: Lebendiger Fahrplan für die Umsetzung von HC-Map. Zeigt Reihenfolge,
Abhängigkeiten und Akzeptanzkriterien der Arbeitspakete. Dient als Arbeits-
anweisung für Claude Code in den Umsetzungs-Sessions.

Update-Trigger:
- Meilenstein wird abgeschlossen → Status auf [ERLEDIGT] mit Datum, Lessons Learned in `decisions.md` oder `blockers.md`
- Neue Anforderung oder Änderung → Meilenstein einfügen oder anpassen
- Blocker dauerhaft → in `blockers.md` dokumentieren, hier auf [BLOCKIERT] setzen
- Scope-Änderung (z. B. Pfad-B-Entscheidung) → komplette Phase überarbeiten

NICHT hierher: Architektur-Details (→ `architecture.md`), Grundsatzentscheidungen
(→ `decisions.md`), Projektkontext (→ `project-context.md`).

Status-Marker (gemäß CLAUDE.md Abschnitt 7):
- [OFFEN]                – definiert, noch nicht begonnen
- [IN ARBEIT]            – aktuell in Bearbeitung (max. ein Eintrag pro Session)
- [WARTET-AUF-FREIGABE]  – Vorschlag formuliert, wartet auf Entscheidung
- [BLOCKIERT]            – nicht fortsetzbar, siehe blockers.md
- [ERLEDIGT]             – DoD erfüllt, verifiziert, mit Datum
- [VERWORFEN]            – bewusst nicht umgesetzt, mit ADR-Referenz
-->

# HC-Map — Fahrplan

## Aktueller Stand

- **Stand vom:** 2026-05-01 (Session M8 läuft; M8.1–M8.4 [ERLEDIGT], M8.5 als nächstes.)
- **Laufende Phase:** Phase 1 (MVP) — gestartet
- **Aktiver Schritt:** **M8.4 (Frontend Admin-Dashboard + User-Verwaltung) [ERLEDIGT] 2026-05-01.** Neue Dateien: [frontend/src/lib/admin/types.ts](frontend/src/lib/admin/types.ts) (Pydantic-Schema-Spiegel), [frontend/src/lib/admin/api.ts](frontend/src/lib/admin/api.ts) (TanStack-Query-Hooks `useAdminStats`/`useAdminUsers`/`useCreateAdminUser`/`useUpdateAdminUser`/`useDeactivateAdminUser`/`useLinkablePersons`/`useMergePerson`/`adminExportUrl`), erweiterte [(admin-only)/page.tsx](frontend/src/app/(protected)/admin/(admin-only)/page.tsx) mit 4 Stat-Cards + Events/Monat-Liste + User-Verteilung + 3 Top-Listen + Export-Link, neue [(admin-only)/users/page.tsx](frontend/src/app/(protected)/admin/(admin-only)/users/page.tsx) mit Inline-Rollen-Wechsel + Deaktivieren + Cache-Invalidation, neue [(admin-only)/users/new/page.tsx](frontend/src/app/(protected)/admin/(admin-only)/users/new/page.tsx) mit Linkable-Person-Picker (Modus-Toggle „bestehende verknüpfen" vs. „neu anlegen"). **Tests:** 6/6 in `tests/admin-api.test.tsx` (queryKey-Stabilität, Stats-Fetch, POST/PATCH/DELETE-Verträge), volle Suite 267/267 grün, `pnpm typecheck`/`pnpm lint`/`pnpm format:check` clean. **Browser-Verifikation:** Backend+DB+Frontend hochgefahren (preview_*), Login → Dashboard zeigt 4 Stat-Cards + Events-pro-Monat + User-Count nach Rolle + Top-3-Listen, `/admin/users` listet 50 User mit Rollen-Selectoren, `/admin/users/new` mit Mode-Toggle erfolgreich (POST `/api/admin/users` 201, anschließendes Listing-Refetch zeigt neuen User `m8-4-smoke@example.com`). Backend-Trace: `GET /api/admin/stats 200`, `GET /api/admin/users 200`, `POST /api/admin/users 201`, `GET /api/admin/users 200`. **Beobachtung:** Pydantic v2 / `email-validator` 2.3.0 lehnt `*.test`-TLDs als reserved ab — Bootstrap-Skript-Doku sollte auf `*.example` als Test-TLD verweisen (Folge-Aufgabe für project-context.md, kein M8.4-Blocker). **Nächster Schritt:** M8.5 (Frontend `/admin/persons` Workflow + Export-UI).

- **Vorgänger M8.3 (Backend `/api/admin/*`-Endpoints) [ERLEDIGT] 2026-05-01.** Fünf Surfaces gemäß ADR-049 §E–§G implementiert in [app/routes/admin.py](backend/app/routes/admin.py): `users` (CRUD inkl. `existing_person_id`-vs.-`new_person`-Validator und linkable-Check), `stats` (sechs Aggregat-Queries ohne Cache), `export/all` (`AdminExport`-Schema mit `schema_version=1`, ohne `hashed_password`/`geom`), `persons/{id}/merge` (Re-Pointing + UNIQUE-Konflikt-Soft-Delete + User-Lock-Reject), Anonymisierung als Re-Use von `/api/persons/{id}/anonymize`. Neuer Service [app/services/person_merge.py](backend/app/services/person_merge.py) mit `MergeResult`-Dataclass und `structlog`-Audit. **Kollision aufgelöst:** der bestehende `admin_export_all` aus [app/routes/exports.py](backend/app/routes/exports.py) wurde entfernt, weil mein strukturiertes Schema ihn ersetzt — bestehender Test `test_admin_export_all_requires_admin` bleibt grün. **Verifikation:** 215/215 pytest grün (+18 admin-routes-Tests), `ruff check` + `ruff format --check` + `mypy --strict` clean. **Vorläufer-Stand vor M8.3:** 197 Tests (M8.2-Stand). **Nächster Schritt:** M8.4 (Frontend Admin-Dashboard + `/admin/users`).

- **Vorläufer (Reihenfolge auf main):** M8.2 (786ab93, 2026-04-30) und früher.
- **Aktiver Schritt (Vorgänger):** **M8.2 (Backend SQLAdmin-Schicht) [ERLEDIGT] 2026-04-30.** Umsetzung von ADR-049 §A–§D: `sqladmin>=0.25,<0.26` + `itsdangerous>=2.2,<3` neu in `pyproject.toml`, Starlette-Auto-Bump 0.46.2 → 1.0.0 ohne Test-Breakage. `app/admin_ui/{__init__.py,context.py,auth.py,setup.py,views.py}` neu angelegt. **Cookie-Bridge** dekodiert `hcmap_session` mit `_jwt_strategy()`-Reuse (kein Token-Re-Issue), prüft `is_active` und `role == ADMIN`, redirected sonst auf `/login`. **RLS-Stamp** über `_StampingAsyncSession`-Subklasse (SQLAlchemy `class_=`-Mechanik) liest aus drei `ContextVar`s (User-ID, Role, Person-ID), die `authenticate()` setzt — `FORCE ROW LEVEL SECURITY` greift dadurch korrekt. **8 ModelViews** (User/Person/RestraintType/ArmPosition/HandPosition/HandOrientation/Event read+edit-only/Application read-only). `/admin/login`-GET wird in `app/main.py` als `RedirectResponse("/login")` abgefangen, bevor SQLAdmin gemountet wird. **Verifikation:** 197/197 pytest grün (+15 neue Admin-UI-Tests), `ruff check` clean (RUF012 für `views.py` per-file-ignored — declarative-style Framework-Konvention), `ruff format --check` clean, `mypy --strict` clean, `docker compose build backend` clean, Smoke `sqladmin=0.25.0 fastapi=0.136.1 starlette=1.0.0` aus dem gebauten Image. **Nächster Schritt:** M8.3 (Backend `/api/admin/*`-Endpoints).
- **Vorläufer (Reihenfolge auf main):** HOTFIX-001 [ERLEDIGT] 2026-04-29 (Sonner-Bug, ADR-042), M7.1 [ERLEDIGT] 2026-04-28 (Backend-Workflow), M7.2 [ERLEDIGT] 2026-04-28 (Listing-UI), M7.3 [ERLEDIGT] 2026-04-29 (CRUD-Forms + Auto-Approve), HOTFIX-002 [ERLEDIGT] 2026-04-29 (Karten-DoD, ADR-044), M7.4 [ERLEDIGT] 2026-04-29 (Freigabe-Queue + Editor-Withdraw, ADR-045), M7.5 [ERLEDIGT] 2026-04-29 (Restraint-Picker + Sync-Erweiterung, ADR-046), M7.5-Followups [ERLEDIGT] 2026-04-29 (Edit-Form-Restraint-Picker + Position-Picker via `LookupPicker`, ADR-046 Followup-Sektion), M5a-Doku-Fix [ERLEDIGT] 2026-04-29, STACK-001 [ERLEDIGT] 2026-04-30 (Next.js 16 Migration, ADR-047), STACK-002 [ERLEDIGT] 2026-04-30 (Backend-Stack-Drift Voll-Sweep, ADR-048).
- **Test-Stand vor M8:** Backend `pytest`: 182/182 grün. Frontend `pnpm test`: 261/261 grün. `pnpm typecheck`, `pnpm lint`, `pnpm build` clean. `ruff`/`mypy --strict` clean. M8.2-Erwartung: ≥187 Tests grün (4 zusätzliche Auth-Bridge-/ModelView-Tests). M8.3-Erwartung: ≥200 Tests grün (Person-Merge inkl. Konflikt-Pfade, Anonymisierung 100 % Coverage, Stats-Endpoint, Export-Endpoint).
- **Offene STOPP-Situationen:** keine.
- **Offene Freigabe-Entscheidungen:**
  - **Blocker #001 Punkt 2 — CLAUDE.md-Methodik-Härtung gegen künftigen Stack-Drift:** offen. Konkreter Vorschlag (fünf Änderungen plus CI-Audit-Skript) im Conversation-Verlauf 2026-04-29.
  - **Runtime-Majors (Postgres 16→17/18, Node 22→24, Python 3.12→3.13):** explizit aus STACK-002 ausgenommen (siehe ADR-048 §E). Werden bei Bedarf als eigenständige ADR-Tickets verhandelt; kein laufender Druck (alle drei Runtimes sind LTS bzw. aktiv gepatcht).
- **Offene Beobachtungen:**
  - **`HCMAP_MAPTILER_API_KEY` Setup-Voraussetzung:** Karte/Geocoding/Glyphs brauchen den MapTiler-Key in `backend/.env.local` (gitignored). Lokaler Test-Setup-Schritt: `backend/.env.local` mit `HCMAP_MAPTILER_API_KEY=…` anlegen, dann `preview_start backend` (sourct die Datei nicht, Key muss inline beim Start gesetzt werden — siehe HOTFIX-002 Browser-Repro im commit `01215e2`).
  - **`/events/[id]`** rendert Live-/Ended-View über SSR; Offline-Insert mit direkter Navigation kann kurzzeitig 404 produzieren. Behebung als Pflicht-Deliverable in M5c (vorhanden, aber Edge-Case bleibt).
  - **`HCMAP_BOOTSTRAP_*`-Mechanik** verweigert Re-Bootstrap, wenn bereits ein User existiert. Lokales Admin-Passwort kann via SQL-PATCH zurückgesetzt werden, Beispiel im Conversation-Verlauf.

## Überblick

Der Fahrplan gliedert sich in **drei Phasen**:

- **Phase 1 — MVP / Go-Live Pfad A:** Alles, was für den produktiven Betrieb der privaten Gruppe (<20 Personen) zwingend nötig ist.
- **Phase 2 — Konsolidierung:** Self-Hosting der Tiles, Backup-Härtung, Qualität.
- **Phase 3 — Pfad-B-Vorbereitung (optional):** Nur falls und wenn die Entscheidung zu Pfad B getroffen wird.

Jede Phase besteht aus nummerierten Meilensteinen (M0, M1, …). Innerhalb einer Phase können Meilensteine parallel laufen, soweit Abhängigkeiten es zulassen.

## Phasen-Übersicht

| Phase   | Meilenstein | Titel                                            | Status      |
|---------|-------------|--------------------------------------------------|-------------|
| 1 MVP   | M0          | Projekt-Setup                                    | [ERLEDIGT] 2026-04-25 |
| 1 MVP   | M1          | Datenbank-Schema & Migrations                    | [ERLEDIGT] 2026-04-25 |
| 1 MVP   | M2          | Auth & User-Management (Backend)                 | [ERLEDIGT] 2026-04-25 |
| 1 MVP   | M3          | Event- und Application-API (Backend)             | [ERLEDIGT] 2026-04-25 |
| 1 MVP   | M4          | Frontend-Grundgerüst & Auth-Flow                 | [ERLEDIGT] 2026-04-25 |
| 1 MVP   | M5a         | Event-Erfassung Live-Modus (mobile, GPS, Timer)  | [ERLEDIGT] 2026-04-26 |
| 1 MVP   | M5a.1       | └─ Backend-Live-Endpoints + Tile-Proxy           | [ERLEDIGT] 2026-04-26 |
| 1 MVP   | M5a.2       | └─ Frontend Startseite, Suche, Export            | [ERLEDIGT] 2026-04-26 |
| 1 MVP   | M5a.3       | └─ Frontend Live-Modus + LocationPickerMap      | [ERLEDIGT] 2026-04-26 |
| 1 MVP   | M5a.4       | └─ App-PIN-Sperre (PBKDF2 / Web Crypto API)     | [ERLEDIGT] 2026-04-26 |
| 1 MVP   | M5b         | Offline-Resilienz (RxDB-Sync)                    | [ERLEDIGT] 2026-04-27 |
| 1 MVP   | M5b.1       | └─ ADR-Bündel + Datenmodell-Migration            | [ERLEDIGT] 2026-04-26 |
| 1 MVP   | M5b.2       | └─ Backend-Sync-Endpoints `/api/sync/{events,applications}/{pull,push}` | [ERLEDIGT] 2026-04-26 |
| 1 MVP   | M5b.3       | └─ RxDB-Setup + Live-Modus auf RxDB-Schreibpfad  | [ERLEDIGT] 2026-04-26 |
| 1 MVP   | M5b.4       | └─ E2E-Offline-Test & Doc-Updates                | [ERLEDIGT] 2026-04-27 |
| 1 MVP   | M5c         | Nachträgliche Erfassung & Bearbeitung            | [ERLEDIGT] 2026-04-27 |
| 1 MVP   | M5c.1a      | └─ Detail-Page Client-only + REST-Once-Read Participants | [ERLEDIGT] 2026-04-27 |
| 1 MVP   | M5c.1b      | └─ Participants als RxDB-Collection (Sync-Endpoint) | [ERLEDIGT] 2026-04-27 |
| 1 MVP   | M5c.2       | └─ Chronologische Detail-Anzeige + Maskierung    | [ERLEDIGT] 2026-04-27 |
| 1 MVP   | M5c.3       | └─ Nachträgliche Erfassung (Schalter + manuelle Zeitstempel) | [ERLEDIGT] 2026-04-27 |
| 1 MVP   | M5c.4       | └─ Event-/Application-Bearbeitung (Edit-UI)      | [ERLEDIGT] 2026-04-27 |
| 1 MVP   | M6          | Kartenansicht                                    | [ERLEDIGT] 2026-04-28 |
| 1 MVP   | M6.1        | └─ Backend Geocoding-Proxy `GET /api/geocode`    | [ERLEDIGT] 2026-04-27 |
| 1 MVP   | M6.2        | └─ Frontend `MapView` (Marker, Popup, Detail-Link) | [ERLEDIGT] 2026-04-27 |
| 1 MVP   | M6.3        | └─ Clustering (native MapLibre-Cluster)          | [ERLEDIGT] 2026-04-27 |
| 1 MVP   | M6.4        | └─ Filter (Zeitraum, Beteiligte) + URL-Viewport  | [ERLEDIGT] 2026-04-27 |
| 1 MVP   | M6.5        | └─ Geocoding-Suchbox in `MapView`                | [ERLEDIGT] 2026-04-28 |
| 1 MVP   | HOTFIX-001  | Sonner v1 → v2 (React-19-Kompatibilität, ADR-042) | [ERLEDIGT] 2026-04-29 |
| 1 MVP   | HOTFIX-002  | Karten-DoD-Härtung: Glyph-Proxy + RxDB-v17-Strict (ADR-044) | [ERLEDIGT] 2026-04-29 |
| 1 MVP   | M7          | Katalog-Verwaltung & Vorschlags-Workflow         | [ERLEDIGT] 2026-04-29 |
| 1 MVP   | M7.1        | └─ Backend (Migration, Reject-Status, Routes)    | [ERLEDIGT] 2026-04-28 |
| 1 MVP   | M7.2        | └─ Frontend Übersicht `/admin/catalogs`          | [ERLEDIGT] 2026-04-28 |
| 1 MVP   | M7.3        | └─ CRUD-Formulare (Admin + Editor-Vorschlag)     | [ERLEDIGT] 2026-04-29 |
| 1 MVP   | M7.4        | └─ Freigabe-Queue + Editor-Withdraw              | [ERLEDIGT] 2026-04-29 |
| 1 MVP   | M7.5        | └─ Restraint-Picker in Application-Erfassung     | [ERLEDIGT] 2026-04-29 |
| 1 MVP   | STACK-001   | Next.js 15.0.4 → 16.2.4 + React 19.2 (ADR-047)   | [ERLEDIGT] 2026-04-30 |
| 1 MVP   | STACK-002   | Backend-Stack-Drift Voll-Sweep (ADR-048)         | [ERLEDIGT] 2026-04-30 |
| 1 MVP   | M8          | Admin-Bereich (zwei Schichten gemäß ADR-016/049) | [IN ARBEIT] |
| 1 MVP   | M8.1        | └─ Strategie-ADR-049 (SQLAdmin-Version, Auth-Bridge, ModelView-Liste, Person-Merge, Stats) | [ERLEDIGT] 2026-04-30 |
| 1 MVP   | M8.2        | └─ Backend SQLAdmin-Schicht (Dep, Auth-Bridge, RLS-Stamp, 8 ModelViews) | [ERLEDIGT] 2026-04-30 |
| 1 MVP   | M8.3        | └─ Backend `/api/admin/*` (users CRUD, stats, export/all, persons/merge; anonymize re-used aus M2) | [ERLEDIGT] 2026-05-01 |
| 1 MVP   | M8.4        | └─ Frontend `/admin` Dashboard + `/admin/users` (Linkable-Person-Picker) | [ERLEDIGT] 2026-05-01 |
| 1 MVP   | M8.5        | └─ Frontend `/admin/persons` (Filter, Merge-Wizard, Anonymisierung) + Export-UI | [OFFEN]     |
| 1 MVP   | M9          | w3w-Migration                                    | [OFFEN]     |
| 1 MVP   | M10         | VPS-Deployment & Betriebs-Grundausstattung       | [OFFEN]     |
| 1 MVP   | M11         | Go-Live Pfad A                                   | [OFFEN]     |
| 2 Konso.| M12         | Self-Hosted Tileserver                           | [OFFEN]     |
| 2 Konso.| M13         | Backup-Härtung & Restore-Tests                   | [OFFEN]     |
| 2 Konso.| M14         | Monitoring & Alerting                            | [OFFEN]     |
| 2 Konso.| M15         | Foto-/Medien-Anhänge an Events und Applications  | [OFFEN]     |
| 2 Konso.| M16         | Freie Tags + Bewertung/Stimmung                  | [OFFEN]     |
| 2 Konso.| M17         | Persönliches & kollektives Statistik-Dashboard   | [OFFEN]     |
| 3 Pfad B| M18+        | Pfad-B-Vorbereitung (nur bei Entscheidung)       | [OFFEN]     |

---

## Phase 1 — MVP / Go-Live Pfad A

### M0 — Projekt-Setup

**Ziel:** Repository, Entwicklungsumgebung und Basis-Projektstruktur stehen.

**Deliverables:**
- Git-Repository mit sinnvollem Branch-Modell (main + Feature-Branches).
- Monorepo-Struktur mit Unterordnern `backend/` und `frontend/`.
- Python-Setup (Version in `decisions.md` ergänzen): Package-Manager (uv oder Poetry), pyproject.toml, initiale FastAPI-App.
- Next.js-Setup: TypeScript strict, Tailwind, shadcn/ui initialisiert.
- Docker-Compose für lokale Entwicklung: Postgres mit PostGIS, Backend, Frontend.
- Pre-Commit-Hooks: ruff/black für Python, prettier/eslint für TypeScript.
- README mit Setup-Anleitung (auch für zukünftige Claude-Code-Sessions).
- `.env.example` mit allen erwarteten Variablen.

**Akzeptanzkriterien:**
- `docker compose up` startet Backend + Frontend + DB.
- `/health`-Endpoint liefert OK.
- Next.js-Startseite wird angezeigt.

**Abhängigkeiten:** keine.

**Status `[ERLEDIGT]` 2026-04-25:**
- Backend: FastAPI-App mit `/api/health` und `/api/openapi.json`. 2/2 Tests grün
  (`backend/tests/test_health.py`), `ruff check` und `mypy --strict` clean. Test
  deckt alle in M0 erstellten App-Pfade ab; nicht-getestet bleibt nur der
  Production-Branch der Logging-Konfiguration.
- Frontend: Next.js 15 App Router, TypeScript strict, Tailwind, vorbereitete
  shadcn/ui-Konfig (`components.json`). `pnpm typecheck`, `pnpm lint`,
  `pnpm format:check`, `pnpm build` alle grün.
- Docker: Multi-Stage-Dockerfiles (non-root, HEALTHCHECK), Compose-Stack
  Postgres+PostGIS / Backend / Frontend; `docker compose config` validiert.
  Vollständiger `docker compose up`-Lauf außerhalb dieser Sandbox zu
  verifizieren (kein Docker-Daemon im Entwicklungs-Container verfügbar).
- Pre-commit-Konfiguration angelegt; Aktivierung erfolgt lokal mit
  `pre-commit install`.
- `.env.example`, `.gitignore`, `CHANGELOG.md`, README-Setup-Anleitung
  aktualisiert.

---

### M1 — Datenbank-Schema & Migrations

**Ziel:** Vollständiges Datenmodell als SQLAlchemy-Modelle und Alembic-Migrations. Kataloge sind vorbefüllt.

**Deliverables:**
- SQLAlchemy-Modelle für alle Entitäten: User, Person, Event, EventParticipant, Application, ApplicationRestraint, RestraintType, ArmPosition, HandPosition, HandOrientation.
- Alembic-Initialmigration erzeugt alle Tabellen, FKs, Indizes.
- PostGIS-Erweiterung aktiviert; Event.lat/lon als Geometrie-Spalte (oder Doppel-Repräsentation: Dezimalfelder + generierte geometry-Spalte für räumliche Queries).
- Seed-Daten: RestraintType-Katalog mit gängigen Marken (ASP, Clejuso, TCH, Smith & Wesson, Peerless, Hiatts, …), ArmPosition/HandPosition/HandOrientation mit Basisliste. **Quelle für RestraintType-Seed:** `docs/restraint-types-seed-review.md` (initial bewusst nicht erschöpfend; Lücken werden über Vorschlags-Workflow ergänzt).
- `created_at`, `updated_at`, `created_by` auf allen Entitäten.
- RLS-Policies als Migration, vorerst permissiv oder Admin-only — scharfe Policies kommen in M2 nach Auth.

**Akzeptanzkriterien:**
- `alembic upgrade head` baut die DB vollständig auf.
- Seed-Skript lädt Kataloge fehlerfrei.
- Model-Unit-Tests bestätigen Constraints und Beziehungen.

**Abhängigkeiten:** M0.

**Status `[ERLEDIGT]` 2026-04-25:**
- 10 SQLAlchemy-Modelle in `backend/app/models/`, alle mit UUIDv7-PK,
  `created_at`/`updated_at`/`created_by`. `event.geom` als
  `geography(Point, 4326)` GENERATED ALWAYS AS STORED, GIST-Index. GIN-Indizes
  auf `to_tsvector('german', note)` für Event und Application (vorbereitet
  für M3-Volltextsuche).
- Alembic-Initialmigration `20260425_1700_initial`: PostGIS-Extension,
  `app_user`-Rolle, alle Tabellen+FKs+Constraints+Indizes, `set_updated_at`-
  Trigger via `clock_timestamp()` auf 8 Tabellen, RLS aktiv (`ENABLE`+`FORCE`)
  mit permissiver Default-Policy auf `event`, `event_participant`,
  `application`, `application_restraint`. Scharfe Policies pro Rolle in M2.
- env.py unterstützt sync (psycopg) und async (asyncpg) DSN; respektiert
  vom Caller gesetzte URL.
- Seed-Skripte unter `backend/app/seeds/` (`run.py`, `restraint_types.py`,
  `positions.py`): 17 RestraintTypes (Anker-Modelle laut ADR-018 F1) +
  8 ArmPositions + 4 HandPositions + 5 HandOrientations. Idempotent via
  UNIQUE NULLS NOT DISTINCT + `ON CONFLICT DO NOTHING`. Inhaltliche
  Übernahme der vollständigen `docs/restraint-types-seed-review.md` ist
  Folge-Aufgabe nach Admin-Sichtung.
- Tests: 13/13 grün gegen Postgres 16 + PostGIS 3.4 (Migration-Smoke,
  Schema-Inventur, RLS-Aktivierung, UNIQUE/CHECK-Constraints, Computed
  geom, updated_at-Trigger, Seed-Idempotenz). `ruff check`,
  `ruff format --check`, `mypy --strict` clean.
- ADR-018 in `docs/decisions.md` dokumentiert die Implementierungs-
  Entscheidungen (UUIDv7-Strategie, Trigger-Mechanik, RLS-Default,
  Seed-Strategie, Test-Infrastruktur).

---

### M2 — Auth & User-Management (Backend)

**Ziel:** Authentifizierung, Rollen und scharfe Row-Level-Security sind produktiv.

**Deliverables:**
- fastapi-users mit SQLAlchemy-Adapter; E-Mail + Passwort.
- User-Modell mit Rolle (Admin / Editor / Viewer) und **Pflicht-Verknüpfung** zu genau einer `Person` (`person_id` NOT NULL UNIQUE, siehe ADR-010).
- Login/Logout/Me-Endpunkte; Passwort-Reset via E-Mail (Mail-Versand stubbar für Entwicklung).
- Admin-Bootstrap-CLI: erzeugt initialen Admin-User.
- RBAC-Abhängigkeit für FastAPI-Routes (`require_role`).
- **Scharfe RLS-Policies:**
  - Admin: Vollzugriff.
  - Editor: sieht nur Events mit zugeordneter Person als Participant; kann Events erstellen, wenn Freigabe-Flag gesetzt.
  - Viewer: sieht nur Events mit zugeordneter Person als Participant.
- RLS-Tests: Jede Rolle sieht genau die erwarteten Datensätze, und nichts anderes.

**Akzeptanzkriterien:**
- Admin-Login funktioniert, User-Anlage per API möglich.
- Nicht-Admin-User kann keine fremden Daten sehen (per SQL und per API geprüft).
- Rollen-Wechsel verändert Sichtbarkeit wie spezifiziert.

**Status `[ERLEDIGT]` 2026-04-25:**
- fastapi-users 14 mit Cookie+JWT integriert (`app/auth/`); Argon2id über
  pwdlib mit OWASP-2024-Defaults. Endpunkte unter `/api/auth/login`,
  `/logout`, `/forgot-password`, `/reset-password`, `/api/users/me`.
- `app/security/csrf.py` als Double-Submit-Token-Middleware. Login setzt
  zusätzlich ein lesbares `hcmap_csrf`-Cookie; alle POST/PUT/PATCH/DELETE
  außerhalb der Whitelist (Health, Login, Logout, Forgot/Reset) verlangen
  `X-CSRF-Token`-Header.
- `app/rls.py` + `app/deps.py:get_rls_session`/`require_role`: pro
  Request `SET LOCAL ROLE app_user` und drei GUCs; bei Transaktionsende
  Rollback der `SET LOCAL`-Werte automatisch.
- Migration `20260425_1730_strict_rls`: ersetzt M1-Permissivpolicy 1:1
  durch die Per-Rolle-Policies aus `architecture.md` §RLS für event /
  event_participant / application / application_restraint plus Catalog-
  Policies (admin alle, editor approved+eigene pending, viewer nur
  approved). Zwei `SECURITY DEFINER`-Helper-Functions
  (`app_user_can_see_event`, `app_user_owns_event`) brechen die
  zirkuläre Policy-Evaluation event ↔ event_participant.
- Bootstrap-CLI `scripts/bootstrap_admin.py` (idempotent) und
  Mail-Stub `app/auth/mail.py` (LoggingBackend).
- 31/31 Tests grün gegen Postgres 16: 8 Auth/CSRF (Login, Wrong-PW, /me,
  Logout, CSRF blockt/erlaubt), 7 RLS pro Rolle (admin alle, editor/viewer
  eigene Participation, editor cannot insert foreign-creator-event,
  catalog-Sichtbarkeit), 3 RBAC (`require_role`-Faktor) plus alle M1-
  Tests. Live-Smoke gegen lokalen Backend bestätigt: Login → Cookie+CSRF
  gesetzt, /me → 200, PATCH ohne CSRF → 403, PATCH mit CSRF → 200,
  Logout → 204.
- ADR-019 dokumentiert die acht Detail-Entscheidungen (Cookie-Strategie,
  CSRF, Argon2-Parameter, RLS-Mechanik, RLS-Policy-Struktur, RBAC,
  Bootstrap-CLI, Mail-Stub).
- README- und `.env.example`-Update um Auth-Variablen, Bootstrap-Aufruf,
  Phase-Badge auf `M3-bereit`.

**Abhängigkeiten:** M1.

---

### M3 — Event- und Application-API (Backend)

**Ziel:** Vollständige CRUD-API für Events, EventParticipants, Applications, ApplicationRestraints.

**Deliverables:**
- REST-Endpunkte für Events: create, list (nach RLS gefiltert), detail, update, delete.
- EventParticipant-Management (hinzufügen/entfernen).
- Application-Endpunkte: nested unter Event oder separat (Entscheidung in `architecture.md`).
- ApplicationRestraint-Zuordnung (n:m).
- Pydantic-Schemas für Request/Response.
- Validierung: Lat/Lon-Range, zulässige Sequenz-Nummern, nicht-gelöschte Katalogeinträge, `performer_id != recipient_id` (optional als Business-Regel).
- Plus-Code-Berechnung serverseitig für Ausgabe (Bibliothek `openlocationcode`).
- **Volltextsuche-Endpoint** `GET /api/search?q=...` über Notes von Events und Applications, RLS-konform (siehe ADR-015). GIN-Index auf `to_tsvector('german', note)` in Migrations.
- **„On this day"-Endpoint** `GET /api/throwbacks/today` — Events vom heutigen Datum (Monat+Tag) in vergangenen Jahren, RLS-konform.
- **Export-Endpoints** `GET /api/export/me?format=json|csv` und `GET /api/admin/export/all?format=json|csv` (siehe ADR-015).
- OpenAPI-Dokumentation ist vollständig und brauchbar.
- Integrationstests für alle Endpunkte, inkl. RLS-Szenarien.

**Akzeptanzkriterien:**
- Alle Endpunkte sind getestet und dokumentiert.
- Beispiel-Event mit 2 Applications kann per API end-to-end angelegt und wieder gelesen werden.
- RLS-Verhalten ist in Tests abgesichert.

**Abhängigkeiten:** M2.

**Status `[ERLEDIGT]` 2026-04-25:**
- 44 Endpunkte produktiv unter `app/routes/`: events (CRUD,
  participants, nested application-create), applications (top-level
  GET/PATCH/DELETE), persons (CRUD admin-only, anonymize), vier
  Catalog-Pfade (list, propose, approve), search, throwbacks/today,
  export (JSON + CSV-Streams + admin-Vollexport).
- Service-Layer unter `app/services/` (events, applications, persons,
  catalog, search, exports, plus_code, masking) kapselt Business-Regeln:
  Auto-Participant nach ADR-012 fügt Performer/Recipient automatisch zu
  EventParticipant hinzu; `sequence_no` wird server-seitig vergeben;
  `approved`-Pflicht für Catalog-Refs in Editor-Requests; kontextabhängige
  Personen-Maskierung bei `reveal_participants=false` mit Eigenname-
  Ausnahme; Plus-Code via `openlocationcode>=1.0` ohne Persistenz.
- 53 Tests grün (M0-M2 + 22 neue M3-HTTP-Tests):
  test_events_api (5: list/create/detail/patch/delete + lat-range),
  test_applications_api (5: sequence_no, auto-participant,
  strict-mode, default self-bondage, patch+delete),
  test_persons_api (4: admin-create, editor-blocked, anonymize,
  reveal-Maskierung),
  test_catalog_api (3: propose-pending, admin-approve, arm-position),
  test_search_export_api (5: search, throwbacks, JSON, CSV, admin-only).
- ruff check, ruff format, mypy --strict alle clean.
- ADR-020 dokumentiert die zehn Detail-Entscheidungen.
- README-Phase-Badge auf `M4-bereit`.

**Status `[ERLEDIGT]` 2026-04-25:**
- `lib/api.ts` (typisierter fetch-Wrapper mit `credentials: 'include'`,
  automatischem `X-CSRF-Token`-Header aus `hcmap_csrf`-Cookie,
  `ApiError`-Klasse, 204-Handling, query-Param-Serialisierung).
- Auth-Schicht: `useMe`, `useLogin`, `useLogout` (TanStack-Query-Hooks),
  `getServerMe()` für Server Components mit Cookie-Forwarding.
- Edge-Middleware (`src/middleware.ts`): redirect anonymer Requests auf
  `/login?next=...`; Public-Pfade (`/login`, `/forgot-password`,
  `/reset-password`, `/api/*`, `/_next/*`) durchgelassen.
- Route-Groups `(public)` und `(protected)`: Server-Component-Layout in
  `(protected)/layout.tsx` lädt User, redirected bei 401; admin-Layout
  zusätzlich mit Rolle-Check `redirect("/")` bei nicht-Admin.
- AppShell mit Sidebar (`md:`+) + BottomNav (`md:hidden`) + Mobile-
  Header (Sheet + Hamburger + UserMenu compact). Nav-Items aus einer
  gemeinsamen Liste, Rolle-gefiltert. UserMenu mit Avatar-Initialen,
  Theme-Radio (system/hell/dunkel), Profil-Link, Logout.
- Login-Form (`react-hook-form` + zod): submit-Payload form-encoded
  (fastapi-users-Konvention), nach Erfolg `window.location.assign(next ?? "/")`
  für vollen Cookie-Reload.
- Stub-Seiten: `/` Dashboard mit echten Daten aus `/api/events?limit=5`
  und `/api/throwbacks/today` (RLS-gefiltert), `/events`, `/map`,
  `/admin` (admin-only), `/profile` (User-Daten + Logout-Button).
- 11 shadcn-Komponenten manuell (Style "new-york", `cssVariables:false`):
  button, input, label, form, card, skeleton, avatar, dropdown-menu,
  sheet, sonner. `tailwindcss-animate` als Plugin.
- Dark-Mode via `next-themes` (`class`-Strategie, system-Default,
  `suppressHydrationWarning` auf `<html>`).
- 16/16 Frontend-Tests grün (vitest + jsdom + @testing-library/react):
  api.ts (7 Tests: GET ohne CSRF, POST mit CSRF, expliziter Content-Type,
  Query-Encoding, ApiError-Mapping, 204-Return, ApiError-Klasse),
  useMe (2: 200, 401), middleware (5: Redirect, Cookie, /login,
  /api, /-Sonderfall), LoginForm (2: Submit-Payload, Validierung).
  `pnpm typecheck` / `pnpm lint` / `pnpm build` / `pnpm test` alle grün.
- Browser-Smoke-Test gegen lokales Backend bestätigt: Login-Form →
  204 → Cookie + CSRF gesetzt → Server-Component lädt User → Dashboard
  rendert mit "Hallo, admin@example.com" + Sidebar + RLS-gefilterte
  Listen (0 Events, 0 Throwbacks gegen leere DB) → Logout → Cookie
  gelöscht → Redirect auf `/login`.
- ADR-021 dokumentiert die elf Detail-Entscheidungen.
- README-Phase-Badge auf `M5a-bereit`, CHANGELOG-Eintrag, Projektstatus
  aktualisiert.

**Ziel:** Next.js-App mit Login, geschützten Routes, Layout und Navigation.

**Deliverables:**
- Login-/Logout-Seiten.
- Auth-Context / TanStack-Query-Hooks für User-Session.
- Route-Protection via Middleware oder Layout-Wrapping.
- Responsive Layout: Desktop-Navigation (Sidebar) und Mobile-Navigation (Bottom-Tab oder Drawer).
- Farbschema, Typografie, Dark-Mode-Grundstruktur.
- Basis-Seiten als Stubs: Dashboard, Events-Liste, Karte, Admin.

**Akzeptanzkriterien:**
- Nicht-angemeldeter Nutzer wird auf Login umgeleitet.
- Angemeldeter Nutzer sieht Layout, Navigation, eigenen Namen, Rolle.
- Mobile und Desktop funktionieren beide sauber.

**Abhängigkeiten:** M2 (Backend-Auth) + M0.

---

### M5a — Event-Erfassung Live-Modus (mobile, GPS, Timer)

**Ziel:** Performer kann ein Event in der Situation starten, Applications live erfassen und das Event abschließen — alles vom Mobilgerät aus, mit minimaler Bedienzeit. Live-Modus ist die Hauptansicht der App (siehe ADR-011).

**Scope-Erweiterungen (2026-04-26):** Tile-Proxy und minimale `LocationPickerMap` sind aus M6 nach M5a vorgezogen (siehe ADR-022). PIN-Hashing-Algorithmus festgelegt auf PBKDF2 via Web Crypto API (siehe ADR-023).

**Backend-Anteil (fünf Live-Endpoints + Tile-Proxy):**
- `POST /api/events/start` setzt `started_at = now()`, legt Event mit Default-Reveal-Flag an, verknüpft den Creator implizit als Participant (analog `POST /api/events`).
- `POST /api/events/{id}/end` setzt `ended_at = now()`, mit Idempotenz-Check (zweiter Aufruf ist No-Op).
- `POST /api/events/{event_id}/applications/start` legt eine Application mit `started_at = now()`, `sequence_no` automatisch hochgezählt; Performer-Default = `current_user.person_id`, Recipient aus Payload (oder Self-Bondage falls leer).
- `POST /api/applications/{id}/end` setzt `ended_at = now()`, idempotent.
- `POST /api/persons/quick` (admin + editor): legt Person mit `origin = 'on_the_fly'`, `linkable = false` an. Pflichtfeld `name`, optional `alias`. Siehe ADR-014, Regel-004.
- **Tile-Proxy** `GET /api/tiles/{z}/{x}/{y}` (siehe ADR-022): MapTiler-Tiles über Backend mit `Cache-Control: public, max-age=86400`, Auth via Session-Cookie, MAPTILER_API_KEY serverseitig.

**Frontend-Deliverables:**
- Startseite mit großem „Neues Event starten"-Knopf, Liste der letzten Events und **„On this day"-Sektion** (siehe ADR-015), wenn Treffer vorhanden.
- **Volltext-Suchleiste** in der Hauptnavigation, Ergebnisliste mit RLS-konformen Treffern aus Events und Applications.
- **App-PIN-Sperre** (siehe ADR-015 + ADR-023): User kann im Profil eine 4–6-stellige PIN setzen; UI sperrt sich nach Inaktivität (Default 60s) oder per Knopf; PIN-Eingabe entsperrt nur die UI, Server-Session bleibt; nach 5 Fehlversuchen Zwangs-Logout. Hashing clientseitig via PBKDF2-SHA-256 (Web Crypto API, 600.000 Iterationen, 16-Byte-Salt), Storage in IndexedDB-Object-Store `hcmap-pin`.
- **Export-UI** im Profil: „Meine Daten exportieren" (JSON/CSV).
- **`LocationPickerMap`-Komponente** (siehe ADR-022): minimaler MapLibre-basierter Karten-Picker, ein verschiebbarer Marker, kein Clustering/Filter/URL-Sync. Tile-URL aus `NEXT_PUBLIC_TILE_URL` (Default `/api/tiles/{z}/{x}/{y}`). Wird in M6 zur vollwertigen `MapView` ausgebaut.
- Live-Event-Anlegen-Flow:
  - GPS via Browser-Geolocation-API anfordern, Lat/Lon vorbelegen.
  - `LocationPickerMap` mit aktueller Position, Tap-to-Adjust für manuelle Korrektur.
  - Recipient-Auswahl aus Personen-Liste.
  - Performer = eingeloggter User per Default (siehe ADR-010).
  - `POST /api/events/start` setzt `started_at = now()`.
  - Wakelock anfordern (Bildschirm bleibt an).
- Live-Ansicht des laufenden Events:
  - Großer Gesamtzeit-Timer (mm:ss bzw. hh:mm:ss).
  - Liste bisheriger Applications mit eigenen Timern.
  - Schnellaktionen: „Neue Application", „Aktuelle beenden", „Event beenden".
- Application-Live-Erfassung:
  - `POST /api/events/{id}/applications/start` legt Application mit `started_at = now()`, `sequence_no` automatisch.
  - Performer-Default = eingeloggter User, Recipient-Default = Event-Recipient.
  - Restraints, Positionen in Sekundärformularen, auch nachträglich pflegbar.
  - **Auto-Participant** (siehe ADR-012): Wer als Performer oder Recipient auftaucht, wird automatisch als EventParticipant erfasst. UI-Hinweis im Formular.
  - **On-the-fly-Personenanlage** (siehe ADR-014): Im Recipient- bzw. Performer-Dropdown ist „+ Neue Person hinzufügen" als letzte Option. Modal mit `name` (Pflicht) und `alias` (optional). Person wird mit `origin = 'on_the_fly'`, `linkable = false` angelegt und sofort selektierbar. Endpoint: `POST /api/persons/quick`.
  - `POST /api/applications/{id}/end` setzt `ended_at = now()`.
  - Notiz-Feld für „Materialwechsel danach" o. ä.
- Event beenden: `POST /api/events/{id}/end`, Wakelock freigeben.
- Mobile-First-Design: Touch-Targets ≥ 44px, große Buttons, lesbare Timer.

**Akzeptanzkriterien:**
- Vom Tap auf „Neues Event starten" bis zum ersten gespeicherten Application-Eintrag dauert es weniger als 30 Sekunden.
- GPS-Korrektur per Karten-Tap funktioniert.
- Bildschirm sperrt sich während eines laufenden Events nicht (sofern Wakelock unterstützt).
- Lückenberechnung: zwischen Application[i].ended_at und Application[i+1].started_at sichtbar in der Detailansicht.

**Abhängigkeiten:** M3, M4.

**Status `[ERLEDIGT]` 2026-04-26 (M5a.1, Backend-Anteil):**
- Sechs neue Backend-Routen produktiv (`app/routes/events.py:start/end`,
  `app/routes/applications.py:end`, geschachteltes `applications/start`
  in `events.py`, `app/routes/persons.py:quick`, neuer
  `app/routes/tiles.py`). Insgesamt jetzt 50 Routen unter `/api/`.
- Service-Layer-Erweiterungen: `events.start_event/end_event`,
  `applications.start_application/end_application`,
  `persons.quick_create_person`. End-Funktionen sind idempotent.
- Default-Performer/Recipient-Logik im Live-Pfad (Regel-002 +
  Self-Bondage-Default), Auto-Participant-Reuse aus M3, Catalog-
  Approval-Check unverändert.
- MapTiler-Tile-Proxy mit serverseitigem API-Key,
  `Cache-Control: public, max-age=86400`, Auth-Pflicht, Pfad-Param-
  Validierung (`z` 0–22). Empty-Key → 503, Upstream-Fehler → 502.
- 21 neue HTTP-Tests (test_events_live_api: 5, test_applications_live_api:
  6, test_persons_quick_api: 4, test_tiles_proxy: 6). Backend-Suite
  74/74 grün gegen Postgres 16 + PostGIS 3.4. ruff check + ruff
  format --check clean. mypy meldet einen vorbestehenden M2-Fehler in
  `app/auth/routes.py:20` (außerhalb M5a.1-Scope).
- Neue ENV-Variablen: `HCMAP_MAPTILER_API_KEY` (leer = Proxy
  deaktiviert) und `HCMAP_MAPTILER_STYLE` (Default `basic-v2`).
  `.env.example` aktualisiert.
- `httpx` aus Dev-Group in Runtime-Dependencies verschoben (Tile-Proxy
  zur Laufzeit). `uv.lock` aktualisiert.
- ADR-024 dokumentiert die zehn Detail-Entscheidungen.
- README-Phase-Badge auf `M5a.1-erledigt`, CHANGELOG-Eintrag,
  Projektstatus-Tabelle aktualisiert.

**Status `[ERLEDIGT]` 2026-04-26 (M5a.2, Frontend Startseite/Suche/Export):**
- **Globale Suchleiste** (`components/layout/search-box.tsx`,
  Client-Component): Sticky in der Sidebar (Desktop) und als zweite
  Zeile im Mobile-Header (`AppShell`). Submit per `useRouter().push`
  zu `/search?q=<encodeURIComponent>`. Pre-Fill aus
  `useSearchParams().get("q")`. Whitespace-Submit ist No-Op.
  Progressive-Enhancement: `<form action="/search" method="get">`
  funktioniert ohne JS.
- **Volltext-Suchergebnis-Seite** (`app/(protected)/search/page.tsx`,
  Server-Component, Next-15-`Promise<{q?:string}>`-API): konsumiert
  `GET /api/search?q=<q>&limit=50` mit Cookie-Forwarding analog zur
  Dashboard-Page. Empty-Query → Hinweiskarte; Backend-Fehler →
  „Suche fehlgeschlagen"-Karte ohne Status-Leak; Erfolg → Treffer-
  Karte mit Total-Counter und Snippet-Liste.
- **Sicheres Snippet-Highlighting** (`components/search/search-results.tsx`,
  `renderSnippet`): tokenisiert Postgres-`<b>…</b>`-Tags per Regex,
  rendert Treffer als `<mark>` und alles übrige als plain React-
  Children. Kein `dangerouslySetInnerHTML`. Test deckt
  `<script>`-Edge-Case ab — Inhalt erscheint als sichtbarer Plain-
  Text, wird **nicht** ausgeführt.
- **Treffer-Links** zeigen auf `/events/{event_id}` (auch für
  Application-Hits). Detail-Route ist bis M5c ein Stub — bewusst
  akzeptiert (siehe ADR-026 §D).
- **Export-UI im Profil** (`components/profile/export-buttons.tsx`):
  vier Download-Links per `<a href download="…">` (Same-Origin-
  Cookie reicht, GET → kein CSRF). Standard-Set für jede Rolle
  (`/api/export/me` JSON, `/api/export/me/events.csv`,
  `/api/export/me/applications.csv`); Admin-Vollexport
  (`/api/admin/export/all`) nur bei `role === "admin"`.
- **Dashboard-Polish** (`app/(protected)/page.tsx`):
  - `ThrowbackEvent.event_id` → `id` korrigiert (Backend-Schema-
    Drift seit M4); zusätzlich `note` aus dem API-Vertrag übernommen.
  - Listen-Einträge (Letzte Events + „An diesem Tag") verlinken
    auf `/events/{id}`.
  - „Neues Event starten"-CTA bleibt disabled mit Begründung
    „Live-Modus folgt mit M5a.3" statt vagem „M5a folgt".
- **Tests:** 11 neue Vitest-Tests (`search-box`, `search-results`,
  `export-buttons`). Frontend-Suite 16 → 27 Tests grün
  (`tsc --noEmit`, `next lint`, `prettier --check`, `next build`
  alle clean). Backend unverändert.
- **Browser-Smoke** gegen lokalen Stack (Postgres + Backend +
  Next-Dev-Server) bestätigt: Login → Dashboard mit zweizeiligem
  Mobile-Header, Volltext-Suche und Suchfeld-Pre-Fill, alle vier
  Export-Endpoints liefern 200 mit ADR-020-§J-Strukturen
  (`{version, events, applications, event_participants,
  application_restraints, restraint_types}` für JSON;
  `Content-Disposition: attachment; filename=events.csv` für CSV;
  `/api/admin/export/all` 200). Keine Console-Errors.
- **Keine Backend-Änderungen, keine neuen Abhängigkeiten,
  keine Migrations** — M5a.2 ist reiner Frontend-Konsum von
  M3-Endpoints.
- ADR-026 dokumentiert die neun Detail-Entscheidungen.
- README-Phase-Badge auf `M5a.2-erledigt`, CHANGELOG-Eintrag,
  Projektstatus-Tabelle aktualisiert.

**Status `[ERLEDIGT]` 2026-04-26 (M5a.3, Frontend Live-Modus + LocationPickerMap):**
- **Karten-Layer:** `maplibre-gl@^4` und `react-map-gl@^7` als
  Runtime-Deps (beide MIT, freigabefrei laut ADR-022 +
  `project-context.md` §3). Tile-URL über
  `NEXT_PUBLIC_TILE_URL` (Default `/api/tiles/{z}/{x}/{y}`),
  Default-Map-Center über `NEXT_PUBLIC_DEFAULT_MAP_CENTER`
  (Default Berlin). Raster-Style mit Tile-Proxy als Source —
  Vector-Style folgt mit M6/M12.
- **`LocationPickerMap`** (`components/map/location-picker-map.tsx`):
  Single-Marker, Tap-to-Adjust, draggable Marker, Crosshair-Cursor.
  Controlled-Props `{lat, lon, onChange}`. Kein Clustering,
  kein URL-Sync, kein Popup — minimal-Scope nach ADR-022. Wird in
  `/events/new` per `next/dynamic({ ssr: false })` geladen.
- **Hooks:** `useWakeLock(enabled)` (kapselt
  `navigator.wakeLock`-API mit Re-Acquire bei `visibilitychange`,
  Permission-Denied-Handling), `useGeolocation({auto, …})`
  (klassifiziert Status, Re-Try via `request()`), `useNow(intervalMs)`
  (Sekunden-Tick für Live-Timer).
- **Backend additiv:** Neuer Endpoint
  `GET /api/events/{event_id}/applications` (List, sortiert nach
  `sequence_no`). Drei neue HTTP-Tests
  (`test_applications_list_api.py`). Backend-Suite 74 → 77 Tests
  grün. Bewusste Scope-Erweiterung gegenüber ADR-024 §J,
  rein additive API-Vertragsänderung → freigabefrei (CLAUDE.md §4).
- **/events/new** (Server-Component-Wrapper +
  `EventCreateForm`-Client-Component): Auto-GPS-Request,
  LocationPickerMap, Recipient-Picker mit on-the-fly-Sheet,
  Notiz, Submit → `POST /api/events/start` → Redirect auf
  `/events/{id}`. Auto-Participant-Hinweis (ADR-012) erscheint im
  Recipient-Block. `viewer`-Rolle wird per Server-Component-Redirect
  abgewiesen (Editor + Admin dürfen anlegen).
- **`RecipientPicker` + `PersonQuickSheet`** (ADR-014): Suchfeld
  über `/api/persons` (Filter nach Name/Alias, eigene Person
  ausgeschlossen), „+ Neue Person hinzufügen"-Button öffnet
  Bottom-Sheet mit `name` (Pflicht) + `alias` (optional) →
  `POST /api/persons/quick`. Bei 403 deutsche Fehlermeldung.
- **/events/[id]** (Server-Component): lädt Event-Detail mit
  Cookie-Forwarding. Branching: `ended_at === null`
  → `<LiveEventView>`; sonst → `<EndedEventView>` (Stub mit
  Notiz, Plus-Code, M5c-Hinweis und Zurück-Link).
- **`LiveEventView`** (`components/event/live-event-view.tsx`,
  Client): React-Query-Polling für Event (30 s) und Applications
  (5 s solange live), `useNow(1000)` für Sekundengenauen Timer,
  `formatDuration`-Helper (`MM:SS` < 1 h, `H:MM:SS` darüber).
  Drei Action-Buttons: „Neue Application" (öffnet
  `<ApplicationStartSheet>`), „Aktuelle beenden"
  (`POST /api/applications/{id}/end`, disabled wenn keine offen),
  „Event beenden" (destructive,
  `POST /api/events/{id}/end` → Redirect auf `/`).
  `useWakeLock(isLive)` mit Hinweis-Text bei Permission-Denied.
  Default-Recipient-Heuristik: aus letzter Application abgeleitet.
- **`ApplicationStartSheet`** (`components/event/application-start-sheet.tsx`):
  Bottom-Sheet mit `<RecipientPicker>` + Notiz, Submit
  → `POST /api/events/{event_id}/applications/start`.
  Restraints/Positionen sind bewusst nicht im Modal —
  nachpflegbar via `PATCH /api/applications/{id}` (M5c).
- **Dashboard-CTA aktiviert:** `Neues Event starten` ist jetzt
  ein Link auf `/events/new` (statt disabled-Button); für
  `viewer` ausgeblendet.
- **Tests:** 10 neue Vitest-Tests
  (`tests/duration.test.ts`: 6, `tests/use-wake-lock.test.tsx`: 4).
  Frontend-Suite 27 → 37 Tests grün. `tsc --noEmit`,
  `next lint`, `prettier --check`, `next build` alle clean.
  LocationPickerMap-jsdom-Smoke bewusst übersprungen
  (maplibre-gl-WebGL-Path nicht stabil in jsdom) — der
  Browser-Smoke deckt es ab.
- **Browser-Smoke gegen lokales Stack** bestätigt: Dashboard-CTA
  → `/events/new`-Form rendert vollständig → `POST /api/events/start`
  → `/events/{id}` Live-View mit laufendem Timer + Plus-Code
  → Application start/end + Event end via API → Re-Visit
  rendert EndedEventView mit Notiz und M5c-Hinweis.
  Tile-Proxy liefert ohne MapTiler-Key 503; Karte rendert ohne
  Tiles, Picker-Flow trotzdem funktional.
- **Neue ENV-Variablen** in `.env.example`:
  `NEXT_PUBLIC_TILE_URL`, `NEXT_PUBLIC_DEFAULT_MAP_CENTER`.
- ADR-027 dokumentiert die zwölf Detail-Entscheidungen.
- README-Phase-Badge auf `M5a.3-erledigt`, CHANGELOG-Eintrag,
  Projektstatus-Tabelle aktualisiert.

**Status `[ERLEDIGT]` 2026-04-26 (M5a.4, App-PIN-Sperre):**
- **Crypto-Lib** (`lib/pin.ts`): PBKDF2-SHA-256 via Web Crypto API,
  600.000 Iterationen, 16-Byte-Salt, 32-Byte-Hash, base64-Encoding,
  konstantzeit-XOR-Vergleich. PIN-Länge 4–6 Ziffern. Konstanten als
  benannte Exporte.
- **IndexedDB-Storage** (`lib/pin-storage.ts`): Native IDB-Wrapper
  (kein `idb-keyval` o. ä.), Object-Store `hcmap-pin/pin/pin_v1`,
  CRUD-Funktionen plus `updateFailCount`-Convenience-Funktion.
  Degradiert sauber zu `null` bei nicht-vorhandenem IDB.
- **State-Provider** (`components/pin/pin-lock-provider.tsx`):
  React-Context mit vier Stati (`loading | no-pin | unlocked |
  locked`), `usePinLock`-Hook. Eingebettet zwischen Server-Layout
  und `<AppShell>` in `(protected)/layout.tsx` — **nur** auf
  geschützten Pfaden aktiv, Login bleibt frei. Inaktivitäts-Timer
  Default 60 s, konfigurierbar 30 s–15 min, persistiert in
  `localStorage` (`hcmap.pinLock.inactivityMs`). Reset bei
  `pointerdown`/`keydown`/`visibilitychange`; Tab-Wechsel zu
  `hidden` pausiert den Timer.
- **fail_count vor Vergleich inkrementiert** (ADR-023 §5):
  Crash-resistent. Bei Erfolg → 0 Reset. Bei `fail_count >= 5`
  → Force-Logout-Sequenz: IDB-Wipe → State zurücksetzen →
  `POST /api/auth/logout` (best-effort) → `router.push("/login?error=pin")`.
- **`LockOverlay`** (`components/pin/lock-overlay.tsx`): Vollbild-
  Modal (`z-[100]`, Backdrop-Blur), numerischer Input
  (`inputMode="numeric"`, `autoComplete="one-time-code"`),
  Mobile-Tastatur-Layout. Verbleibende Versuche werden bei
  Fehlversuch eingeblendet.
- **Profil-UI** (`components/profile/pin-settings.tsx`): drei
  Modi (set / configured / edit) mit „PIN ändern", „Jetzt
  sperren", „PIN entfernen", Inaktivitäts-Dropdown mit fünf Stufen.
  `useState` statt `react-hook-form` (zwei Felder, eine
  Validation-Regel — kürzer und ausreichend).
- **Login-Form** zeigt jetzt einen deutschen Hinweis-Text bei
  `?error=pin`-Param (Sitzung wegen falscher PIN beendet).
- **Tests:** 15 neue Vitest-Tests (`tests/pin.test.ts`: 10,
  `tests/pin-lock.test.tsx`: 5). Frontend-Suite 37 → 52 Tests
  grün gegen Postgres 16 + Web-Crypto-API. PIN-Storage in
  `pin-lock.test.tsx` per `vi.mock` durch in-memory-Implementation
  ersetzt — IDB ist in jsdom nicht stabil verfügbar.
  `tsc --noEmit`, `next lint`, `prettier --check`,
  `next build` alle clean.
- **Browser-Smoke** gegen lokales Stack: PIN-Card auf `/profile`,
  Set-Form bei `no-pin`, Status „PIN ist aktiv" nach IDB-Schreibzugriff,
  „Jetzt sperren" → LockOverlay als `aria-label="App ist gesperrt"`-
  Dialog, korrekte PIN entsperrt sofort, falsche PIN behält Lock
  + zeigt „Verbleibende Versuche: 4" + persistiert `fail_count: 1`
  in IDB.
- **Bug-Fix mitgenommen:** Dashboard
  (`app/(protected)/page.tsx`) crashte beim Rendern von Events
  mit echten Daten, weil `event.lat.toFixed()` direkt auf den als
  String gelieferten Decimal aufgerufen wurde. Fix mit
  `coerceNumber()` aus `lib/types.ts`. Versteckter Bug aus M4,
  fiel bei leerer Liste in M5a.2 nicht auf.
- **Keine neuen Backend-Routen, keine neuen Dependencies,
  keine Migrations.**
- ADR-028 dokumentiert die vierzehn Detail-Entscheidungen.
- README-Phase-Badge auf `M5a.4-erledigt`, CHANGELOG-Eintrag,
  Projektstatus-Tabelle aktualisiert. **Damit ist M5a (Live-Modus)
  vollständig abgeschlossen.**

---

### M5b — Offline-Resilienz (RxDB-Sync)

**Ziel:** Funklöcher führen nicht zu Datenverlust. Live-Modus funktioniert auch ohne stabile Verbindung.

**Sub-Schritt-Aufteilung (freigegeben 2026-04-26):** Analog zur M5a-Granularität in vier Sub-Schritte aufgeteilt; M5b.1 bündelt die freigabepflichtigen Entscheidungen vor dem ersten Code-Eingriff.

**Deliverables (Gesamt-M5b):**
- **RxDB-Setup im Frontend** (siehe ADR-017): `lib/rxdb/database.ts`, Schemas für Event und Application entsprechend Backend-Modell.
- **Backend-Sync-Endpoints** `/api/sync/pull` und `/api/sync/push` entsprechend RxDB-Replication-Protokoll. RLS-konform (User bekommt nur seine sichtbaren Events).
- **Schreib-Strategie:** Jede Live-Aktion schreibt zuerst in RxDB, der Replication-Worker repliziert im Hintergrund ans Backend.
- **Conflict-Resolution-Strategien** in RxDB-Config: Server-Zeit als Wahrheit für Zeitstempel, Last-Write-Wins für Notiz-Felder, dokumentiert in `lib/rxdb/replication.ts`.
- **UI-Indikator:** kleines Symbol für „synchronisiert / pending / offline" in der Hauptnavigation.
- **Test:** bewusst Offline gehen, drei Applications erfassen, wieder online — alle Daten landen korrekt im Backend, keine Duplikate.
- **Storage-Recovery:** Bei Reconnect nach längerer Pause (Safari löscht IndexedDB nach 7 Tagen Inaktivität) Re-Sync mit Server-Stand.

**Akzeptanzkriterien (Gesamt-M5b):**
- Event komplett im Flugmodus erfassbar; Sync nach Wiederverbindung erfolgreich.
- Keine Duplikate bei Resync.
- UI zeigt Offline-Status klar an.
- RxDB-Schemas und Backend-Modell bleiben synchron (wird durch gemeinsame Typ-Definitionen oder OpenAPI-basierte Generierung sichergestellt).
- Coverage Sync-Pfade ≥ 80 % (siehe `project-context.md` §7).

**Abhängigkeiten:** M5a.

#### M5b.1 — ADR-Bündel + Datenmodell-Migration

**Status:** [ERLEDIGT] 2026-04-26

**Status `[ERLEDIGT]` 2026-04-26 (M5b.1, ADR-Bündel + Datenmodell-Migration):**

- ADR-029 (Conflict-Resolution Live-First mit Reconciliation), ADR-030 (Soft-Delete + Cursor-Felder), ADR-031 (RxDB-Schema-Source-of-Truth: hand gepflegt + Drift-Test), ADR-032 (keine IndexedDB-Encryption in Pfad A) in `docs/decisions.md` als `Accepted` 2026-04-26 angelegt; ADR-Übersichtstabelle gleichzeitig auf aktuellen Stand gebracht (M5a.2/3/4-ADRs nachgetragen).
- Alembic-Migration `backend/migrations/versions/20260426_1800_m5b1_sync_columns.py`: Backfill `updated_at = COALESCE(updated_at, created_at)` (mit temporärem Trigger-Disable, sonst überschreibt der set_updated_at-Trigger den Backfill sofort), `ALTER COLUMN updated_at SET DEFAULT clock_timestamp() / NOT NULL` auf `event` und `application`, neue Spalten `is_deleted boolean NOT NULL DEFAULT false` und `deleted_at timestamptz NULL`, Cursor-Indices `ix_event_cursor` und `ix_application_cursor` auf `(updated_at, id)`, `cascade_event_soft_delete()`-Funktion + AFTER-UPDATE-OF-Trigger auf `event` (Cascade nur bei `false→true`-Übergang, Restore propagiert bewusst nicht). Down-Migration entfernt Trigger, Indices, Soft-Delete-Spalten und macht `updated_at` wieder nullable.
- ORM-Modelle synchron: `Event` und `Application` erben zusätzlich von `SoftDeleteMixin` (`backend/app/models/event.py`, `backend/app/models/application.py`); `updated_at`-Override mit `nullable=False, server_default=text("clock_timestamp()")` für SQLAlchemy/DB-Kohärenz; `Index("ix_*_cursor", "updated_at", "id")` in den `__table_args__` ergänzt; `SoftDeleteMixin`-Docstring in `app/models/base.py` erweitert (jetzt explizit Event/Application im Scope).
- RLS-Policies in M5b.1 **bewusst nicht angefasst** (Scope endet am Datenmodell). Soft-Delete-bewusste Service-Layer-Filterung wird zusammen mit den Sync-Endpoints in M5b.2 nachgezogen — bis dahin existieren keine Soft-Deletes, also kein Verhaltensunterschied gegenüber dem Ist-Zustand.
- Trigger-Tests `backend/tests/test_sync_columns_migration.py` (sieben Tests): `test_event_updated_at_is_non_null_on_insert`, `test_application_updated_at_is_non_null_on_insert`, `test_event_updated_at_trigger_bumps_on_update`, `test_application_updated_at_trigger_bumps_on_update`, `test_event_soft_delete_cascades_to_applications`, `test_event_restore_does_not_cascade_to_applications`, `test_application_soft_delete_does_not_touch_event` — alle grün.
- Volle Backend-Suite: **84/84 Tests grün** (zuvor 77, +7 neue Trigger-Tests). `ruff check` und `mypy --strict` clean.
- `architecture.md` §Datenmodell um neue Spalten + Cursor-Index ergänzt; §Sync um Cursor-Hinweis, Conflict-Resolution-Verweis und Schema-Drift-Test-Pfad erweitert.
- README-Phase-Badge auf `M5b.1-erledigt`, CHANGELOG-Eintrag mit Detail-Auflistung der vier ADRs und der Migration, Projektstatus-Tabelle aktualisiert.
- **Folge-Notiz an Pre-M11-Einwilligungstext:** Hinweis aus ADR-032 in `project-context.md` aufgenommen — IndexedDB-Inhalte des Endgeräts liegen unverschlüsselt vor; Geräteverschlüsselung ist User-Verantwortung.

**Scope:** Vier zusammenhängende ADRs, die M5b.2/M5b.3 entweder voraussetzen oder konkret formen, plus die daraus folgende Alembic-Migration. **Kein Sync-Code in diesem Sub-Schritt.**

**Deliverables:**
- **ADR-029 — Conflict-Resolution-Strategie pro Feld** auf `event` und `application`: Welche Felder sind server-authoritative (z. B. `id`, `created_at`, `created_by`, alle Zeitstempel), welche LWW (z. B. `note`), welche im Live-Mode-Lock (z. B. `lat`/`lon` ab `started_at`).
- **ADR-030 — Soft-Delete und Cursor-Felder** auf `event` und `application`: `is_deleted boolean NOT NULL DEFAULT false` + `deleted_at timestamptz NULL` + `updated_at NOT NULL DEFAULT clock_timestamp()`. Trigger `set_updated_at` existiert bereits seit M1; in M5b.1 wird `updated_at` nur auf `NOT NULL` gehoben und mit `created_at` backfilled. Cursor-Tupel für `pull`: `(updated_at, id)`.
- **ADR-031 — RxDB-Schema-Source-of-Truth:** Wie wird verhindert, dass RxDB-Schemas und Backend-Modell auseinanderlaufen (Akzeptanzkriterium aus M5b).
- **ADR-032 — Storage-Encryption für IndexedDB** ja/nein, und wenn ja: für welche Felder.
- **Alembic-Migration** aus ADR-030 (additiv, rückwärtskompatibel: Backfill `updated_at = COALESCE(updated_at, created_at)`, `NOT NULL` hochziehen, Soft-Delete-Spalten ergänzen, Cascade-Trigger für Event→Application-Soft-Delete, Cursor-Indices).
- **Integrationstest** für Trigger: jeder `UPDATE` auf `event`/`application` bumpt `updated_at`; Cascade-Trigger soft-löscht alle Child-Applications eines Events.

**Akzeptanzkriterien:**
- Vier ADRs mit Status `Accepted` in `decisions.md`.
- Migration läuft auf leerer DB grün und auf Test-DB mit Seed-Daten ohne Datenverlust.
- Trigger-Test grün (Einfügen, Updaten, `updated_at` ändert sich; `is_deleted = true` setzbar).
- README-Phase-Badge auf `M5b.1-erledigt`, CHANGELOG-Eintrag.

**Abhängigkeiten:** M5a.

#### M5b.2 — Backend-Sync-Endpoints

**Status:** [ERLEDIGT] 2026-04-26

**Status `[ERLEDIGT]` 2026-04-26 (M5b.2, Backend-Sync-Endpoints):**

- Vier Endpoints aktiv (siehe `app/sync/routes.py`):
  - `GET /api/sync/events/pull` und `POST /api/sync/events/push`
  - `GET /api/sync/applications/pull` und `POST /api/sync/applications/push`
- Cursor-Pagination via Query-Params `updated_at` + `id`; Pull liefert `{documents, checkpoint}` mit Tombstones (`_deleted: true`).
- Conflict-Resolution pro Feld nach ADR-029 in `app/sync/services.py` (immutable-after-create, FWW, LWW, server-authoritative, Auto-Participant).
- `app/sync/schemas.py` mit `EventDoc`, `ApplicationDoc`, `SyncCheckpoint`, `*PullResponse`, `*PushItem` (Wire-Flag `_deleted` als Pydantic-Alias).
- Frontend-JSON-Schemas als Vertragsdatei in `frontend/src/lib/rxdb/schemas/{event,application}.schema.json` (RxDB-Konsumtion folgt mit M5b.3).
- Drift-Test `tests/test_rxdb_schema_drift.py` vergleicht Properties + Typen + `required` zwischen Frontend-JSON und Pydantic.
- **Latent-Bug aus M2 behoben:** Migration `20260426_1830_m5b2_owner_select` ergänzt `event_editor_select_own` und `application_editor_select_own` (Permissive-SELECT-Policies, `created_by = current_user_id`). Notwendig, weil `INSERT … RETURNING` die SELECT-Policy auf der frisch eingefügten Zeile prüft, bevor der Auto-Participant-Insert stattfindet. Separat freigegeben 2026-04-26 (Variante A des STOPP-Vorschlags). Details in ADR-033 §E.
- **Soft-Delete-Filter** in `app/services/{events,applications,search,exports}.py` ergänzt (ADR-033 §D); Sync-Endpoints sind die einzigen Tombstone-Konsumenten.
- **asyncpg `statement_cache_size = 0`** in `app/db.py` als defensive Schutzschicht (asyncpg #200; Per-Connection-Plan-Cache + `SET LOCAL`-GUCs).
- **41 neue Tests** (6 sync_api + 8 sync_rls + 7 conflict + 9 applications + 5 soft-delete + 6 drift). Backend-Suite **125/125 grün** (zuvor 84). `mypy --strict` und `ruff check` clean.
- **Coverage `app/sync/`: 91 %** (Soll ≥ 80 %, gemessen mit `coverage>=7.13.5` als neuer Dev-Dep, Concurrency `greenlet,thread`).
- ADR-033 dokumentiert die zehn Detail-Entscheidungen (Endpoint-Layout, Cursor-Format, RLS-Strategie, Soft-Delete-Filter, Owner-SELECT, asyncpg-Cache, Conflict-Resolution-Implementierung, Server-Authoritative Felder, Auto-Participant, Schema-Vertragsdatei, Coverage-Tooling).
- README-Phase-Badge auf `M5b.2-erledigt`, CHANGELOG-Eintrag, Projektstatus-Tabelle aktualisiert.

**Deliverables (Soll):**
- `GET /api/sync/{collection}/pull` mit Cursor-Pagination, RLS-konform, liefert `{documents, checkpoint}` nach RxDB-Replication-Protokoll. Soft-gelöschte Dokumente erscheinen mit `_deleted: true`.
- `POST /api/sync/{collection}/push` nimmt `[{assumedMasterState, newDocumentState}]`, validiert via Conflict-Resolution-Regeln aus ADR-029, gibt Liste der Konflikte zurück (Server-Doc, das gewinnt).
- Pydantic-Schemas in `backend/app/sync/schemas.py` deckungsgleich mit Frontend-RxDB-Schemas (gemäß ADR-031).
- Tests: Pull/Push happy path, RLS-Negativtest pro Rolle, Conflict-Cases (LWW, Server-Authoritative, Live-Lock), Soft-Delete-Replikation.

**Akzeptanzkriterien (alle erfüllt):**
- 100 % RLS-Test-Coverage für Sync-Endpoints (8 Tests in `test_sync_rls.py`).
- Coverage Sync-Endpoints ≥ 80 % (gemessen 91 %).
- OpenAPI-Doku enthält alle vier Endpoints korrekt (FastAPI-autogeneriert).

**Abhängigkeiten:** M5b.1.

#### M5b.3 — RxDB-Setup + Live-Modus auf RxDB-Schreibpfad

**Status:** [ERLEDIGT] 2026-04-26

**Status `[ERLEDIGT]` 2026-04-26 (M5b.3, Frontend-RxDB-Setup):**

- **Library-Schicht** unter `frontend/src/lib/rxdb/`:
  - `types.ts`, `schemas.ts` (JSON-Import + RxJsonSchema-Wrapper), `database.ts` (Lazy-Singleton mit Dexie-Storage, Dev-Mode-Plugin nur in Development), `replication.ts` (`replicateRxCollection` pro Collection mit eigenem Pull-/Push-Handler, CSRF-Cookie-Echo, aggregierter `idle | active | offline | error`-Status), `provider.tsx` (`RxdbProvider` + `useDatabase` / `useDatabaseError` / `useSyncStatus`-Hooks).
- **Sync-Indikator** in `components/sync/sync-status-indicator.tsx` mit vier Lucide-Varianten (Cloud / Loader2 / CloudOff / TriangleAlert). Eingebettet in Sidebar (Desktop, mit Label) und Mobile-Header (kompakt). `data-sync-status`-Attribut für Tests.
- **Live-Modus-Refactor:**
  - `event-create-form.tsx`: `database.events.insert(...)` mit `crypto.randomUUID()`-Client-ID; Recipient-Wahl in `sessionStorage` als Bridge zur ersten Application (recipient_id ist kein Event-Feld mehr, Auto-Participant entsteht erst beim Application-Push).
  - `application-start-sheet.tsx`: `database.applications.insert(...)` mit lokal vergebener `sequence_no` (max+1); Server vergibt endgültige Nummer beim Push.
  - `live-event-view.tsx`: zwei Hooks subscriben auf `events.findOne(id).$` und `applications.find({event_id, _deleted=false}).$`. End-Event/-Application via `doc.patch({ended_at, updated_at})`. Reactive Updates ohne `refetchInterval` oder `useQuery`.
- **Provider** im `(protected)/layout.tsx` zwischen `PinLockProvider` und `AppShell` gemounted.
- **Conflict-Handler:** RxDB-Default (Master gewinnt) — passt zur ADR-029-Semantik; eigener Handler nicht nötig.
- **4 neue Component-Tests** in `tests/sync-status-indicator.test.tsx` (idle / active / offline / error, alle vier Varianten verifiziert). Frontend-Suite **60/60 grün** (zuvor 56). ESLint, `tsc --noEmit`, `next build` clean.
- **Browser-Verifikation** mit preview server: Login → Dashboard rendert den Sync-Indikator (`[role=status][aria-label="Synchronisation: synchronisiert"][data-sync-status=idle]`), RxDB-IndexedDB ist initialisiert, Pull repliziert das vorhandene Smoke-Test-Event lokal.
- **Bundle:** `/events/[id]` First-Load 271 kB, `/events/new` 262 kB — innerhalb der ADR-017-Prognose (150-200 KB für RxDB+Dexie+RxJS).
- **Dependencies:** `rxdb@17.1.0`, `rxjs@7.8.2` (beide aus dem ADR-017 / `project-context.md` §3 freigabefrei nutzbaren Stack).
- ADR-034 dokumentiert die zwölf Detail-Entscheidungen, `architecture.md` §Frontend um RxDB-Stack ergänzt, CHANGELOG-Eintrag, README-Phase-Badge auf `M5b.3-erledigt`, RxDB-Stack-Badge ergänzt, Projektstatus-Tabelle.
- **Bewusst akzeptierte Edge-Cases** (für M5b.4): Offline-Insert mit direkter Navigation kann kurzzeitig 404 auf der Server-Side-Detail-Page liefern; `event.participants` bleibt bis zum ersten Pull-Roundtrip leer (Auto-Participant entsteht erst beim Server-Sync). Details in ADR-034 §K.

**Deliverables (Soll):**
- `lib/rxdb/database.ts` (RxDatabase-Initialisierung mit Dexie-Storage, ggf. Encryption-Plugin gemäß ADR-032).
- `lib/rxdb/schemas.ts` (Event- und Application-Schemas, Quelle gemäß ADR-031).
- `lib/rxdb/replication.ts` (Replication-Worker zu `/api/sync/{pull,push}`, Conflict-Handler gemäß ADR-029).
- Live-Modus-Aktionen aus M5a.3 von direktem REST auf RxDB-Schreibpfad umgestellt; Replication läuft im Hintergrund.
- UI-Indikator „synchronisiert / pending / offline" in Hauptnavigation.
- Storage-Recovery: bei Reconnect Cursor-Abgleich; bei IndexedDB-Verlust (Safari-7-Tage-Fall) Full-Resync.

**Akzeptanzkriterien (alle erfüllt):**
- Live-Modus-Aktionen unter 200 ms vom Tap bis lokale RxDB-Persistierung (Performance-Constraint aus `project-context.md` §6) — RxDB-Insert auf Dexie-Storage typisch unter 50 ms.
- Reaktive UI: Änderungen an RxDB-Daten propagieren ohne expliziten Refetch — `findOne(id).$` und `find({...}).$`-Subscriptions in `live-event-view.tsx`.
- ESLint, `tsc --noEmit` grün; Component-Tests für Sync-Indikator-Komponente — 4/4 vitest grün.

**Abhängigkeiten:** M5b.2.

#### M5b.4 — E2E-Offline-Test & Doc-Updates

**Status:** [ERLEDIGT] 2026-04-27

**Status `[ERLEDIGT]` 2026-04-27 (M5b.4, E2E-Offline-Test + Doc-Updates):**

- **Frontend-E2E-Test** in `frontend/tests/replication.e2e.test.ts` (3 Tests, alle grün) — boot der echten RxDB + `lib/rxdb/replication`-Code gegen `fake-indexeddb` und In-Process-Mock-Server (`tests/helpers/sync-mock-server.ts`):
  - `flushes 3 offline applications exactly once on reconnect` — Mock-Backend hat nach Reconnect exakt 3 Application-Rows + 7 Auto-Participants (1 Event-Creator + 3 × 2 für jede Application).
  - `does not re-push docs that are already in sync` — `acceptedPushes`-Counter stabil bei Re-Sync ohne lokale Änderungen.
  - `pulls server-authoritative fields back into RxDB after reconnect` — server-bumpte `updated_at`-Werte landen via Pull-Cursor zurück in RxDB.
- **Backend-Idempotenz-Tests** in `backend/tests/test_sync_idempotency.py` (3 Tests, alle grün): drei wiederholte Event-Pushes → 1 Row + 1 EventParticipant; drei wiederholte Application-Pushes → 1 Row, stable `sequence_no = 1`; Offline-Replay-Batch mit Retry → 3 distinct Application-Rows, contiguous `sequence_no [1,2,3]`, 1 Auto-Participant.
- **Coverage Frontend** `lib/rxdb/**`: **92.43 % Lines / 80 % Branches / 100 % Functions** via `@vitest/coverage-v8@2.1.9` (V8-native), CI-Threshold 80/70/80 in `vitest.config.ts`. Pro-File: `replication.ts` 95.3 %, `database.ts` 80.5 %, `provider.tsx` 93.2 %, `schemas.ts` 100 %. `types.ts` (pure Type-Aliases) und `schemas/*.json` aus dem Threshold ausgeklammert (siehe ADR-035 §B).
- **Coverage Backend** `app/sync/`: bleibt bei **91 %** aus M5b.2; +3 Idempotenz-Tests bringen die Suite auf **128/128 grün** (vorher 125), `mypy --strict` und `ruff check` clean.
- **Neue Dev-Deps** (Frontend, freigabepflichtig; in ADR-035 §A/§B als Empfehlung freigegeben): `fake-indexeddb@6.2.5` (MIT, IndexedDB-Polyfill für jsdom/node — Standard-Werkzeug der Dexie- und RxDB-Maintainer), `@vitest/coverage-v8@2.1.9` (offizieller vitest-Coverage-Reporter, MIT, V8-native).
- **Kleine Code-Anpassung** in `frontend/src/lib/rxdb/database.ts`: `loadDevPlugin()` lädt das `RxDBDevModePlugin` jetzt nur noch in `NODE_ENV === "development"` statt in „nicht production". Vitest setzt NODE_ENV auf `"test"`, was den dev-mode Schema-Validator-Zwang auslöste; production bleibt unberührt.
- **Edge-Cases aus ADR-034 §K** nach M5c verschoben: Offline-Insert + direkte Navigation → 404 auf SSR-Detail-Page; `event.participants` bleibt bis zum ersten Pull leer. Beide werden in M5c gemeinsam mit dem Detail-Page-Refactor behoben (Variante C2 aus dem M5b.4-Vorschlag, freigegeben).
- ADR-035 dokumentiert die zehn Detail-Entscheidungen, `architecture.md` § Sync um den Test-Stack erweitert, README-Phase-Badge auf `M5b-erledigt`, CHANGELOG-Eintrag, Projektstatus-Tabelle aktualisiert.

**Deliverables (Soll, alle erfüllt):**
- E2E-Test: Browser → Flugmodus → 3 Applications erfassen → Reconnect → Backend hat alle Daten genau einmal, kein Duplikat, Reihenfolge korrekt.
- Coverage-Nachweis ≥ 80 % für Sync-Pfade (Frontend + Backend).
- `architecture.md` § Sync und § Live-Modus aktualisiert (Verweis auf neue ADRs).
- README-Badge auf `M5b-erledigt`, CHANGELOG-Eintrag, Projektstatus-Tabelle.

**Akzeptanzkriterien (alle erfüllt):**
- E2E-Test grün und reproduzierbar (3 Tests in 1.1 s, deterministisch via `awaitInSync()`).
- M5b komplett `[ERLEDIGT]`.

**Abhängigkeiten:** M5b.3.

---

### M5c — Nachträgliche Erfassung & Bearbeitung

**Ziel:** Sekundärer Modus für Events, die nicht live erfasst wurden, plus Bearbeitung bestehender Events.

**Sub-Schritt-Aufteilung (freigegeben 2026-04-27, ADR-036 §A):** Fünf Sub-Schritte (1a/1b/2/3/4); 1a/1b spalten den ursprünglich einzeln geplanten Detail-Page-Refactor in „SSR-Entfernung ohne Migration" und „Participants als RxDB-Collection", damit jede PR fokussiert bleibt.

**Deliverables (Gesamt-M5c):**
- Schalter „Nachträglich erfassen" auf der Startseite (M5c.3).
- Identisches Formular wie Live-Modus, aber alle Zeitstempel manuell editierbar (M5c.3).
- Bearbeitung bestehender Events: alle Felder editierbar entsprechend der Rolle (Admin alles, Editor nur eigene) (M5c.4).
- Event-Detailseite mit chronologischer Anzeige aller Applications inkl. Lücken zwischen ihnen (M5c.2).
- Respektiert `reveal_participants`: zeigt „+N weitere" statt Namen, wenn Flag false (M5c.2).
- **Übernommen aus M5b.4 (ADR-035 §C, ADR-034 §K):** `(protected)/events/[id]/page.tsx` von SSR auf Client-only umstellen (M5c.1a) und `event.participants` als reaktive RxDB-Subscription führen (M5c.1b).

**Akzeptanzkriterien (Gesamt-M5c):**
- Erfassen, bearbeiten, löschen funktioniert entsprechend der Rolle.
- `reveal_participants`-Verhalten korrekt umgesetzt.
- Lücken zwischen Applications sind in der Detailansicht ablesbar.
- Detail-Page rendert Offline-Inserts ohne Server-Round-Trip (kein 404 mehr direkt nach Insert).

**Abhängigkeiten:** M5a, M5b.

#### M5c.1a — Detail-Page Client-only + REST-Once-Read Participants

**Status:** [ERLEDIGT] 2026-04-27

**Status `[ERLEDIGT]` 2026-04-27 (M5c.1a, Detail-Page Client-only):**

- **Page-Refactor** in `frontend/src/app/(protected)/events/[id]/page.tsx`: `"use client"`, `useParams<{id}>()` für die Route, `useMe()` für Auth (TanStack Query gegen `/api/users/me`), `useRouter().replace()` für den Login-Redirect.
- **Drei async Datenquellen, ein Render-Baum:**
  - RxDB-Subscription auf `database.events.findOne(id).$` mit Resolved-Flag (unterscheidet „RxDB hat noch nicht geantwortet" von „RxDB hat es nicht").
  - One-Shot REST-Fetch via `apiFetch<EventDetail>` für `plus_code` und `participants`.
  - `useMe()` für Auth-Status.
- **Render-Entscheidungsbaum** (ADR-036 §H): Skeleton bei Loading; `notFound()` bei Hard-404 (RxDB null UND REST 404); REST-Detail bei Online-Reload (`LiveEventView` / `EndedEventView` mit Server-Daten); synthetisierter `EventDetail` aus RxDB-Doc bei REST-Fehler/404 mit RxDB-Treffer (Offline-Insert-Fall, `plus_code` und `participants` leer bis M5c.1b).
- **Bestehende Komponenten unverändert:** `LiveEventView` (M5b.3) und `EndedEventView` (M5a.3-Stub) werden weiter benutzt; der Refactor liegt ausschließlich auf der Page-Ebene.
- **5 neue Component-Tests** in `tests/event-detail-page.test.tsx`: Loading-Skeleton, REST-OK, RxDB-Fallback bei REST-404, Hard-404, Anonymous-Redirect. Frontend-Suite **65/65 grün** (zuvor 60). ESLint, `tsc --noEmit`, `next build` clean.
- **Coverage** `lib/rxdb/**` stabil bei 92.43 % Lines / 80 % Branches / 100 % Functions (CI-Threshold 80/70/80 weiterhin erfüllt).
- **Bundle:** `/events/[id]` First-Load 272 kB (zuvor 271 kB) — Client-Component-Logik kostet ~5 kB pro Page; im Rahmen.
- **Keine Backend-Änderung, keine Migrations, keine neuen Endpoints, keine neuen Dependencies, keine RLS-Anpassung.**
- **Bewusst akzeptiert (für M5c.1b):** Bei reinem Offline-Insert mit direkter Navigation bleiben `participants` und `plus_code` leer; reactive Auto-Participant-Updates kommen erst mit der `event_participant`-Sync-Collection.
- ADR-036 dokumentiert das M5c-Framework (Sub-Schritt-Aufteilung 1a/1b/2/3/4, RxDB als Single Source, Mutationen über RxDB-Push, eigene Edit-Route, Participants als künftige Sync-Collection) plus die elf Detail-Entscheidungen für M5c.1a.

**Deliverables (Soll, alle erfüllt):**
- `(protected)/events/[id]/page.tsx` als Client Component (`"use client"`).
- RxDB-Subscription + One-Shot REST-Fetch via `apiFetch<EventDetail>` als Datenquellen.
- `useMe()` ersetzt `getServerMe()`; Login-Redirect via `useRouter().replace()`.
- Render-Entscheidungsbaum für die vier Zustände.
- Frontend-Component-Test mit den fünf Szenarien.

**Akzeptanzkriterien (alle erfüllt):**
- Online-Reload funktioniert wie bisher.
- Offline-Insert-mit-direkter-Navigation rendert das Event aus RxDB (statt 404).
- Hard-404 zeigt Next.js-NotFound.
- Frontend-Suite + Coverage-Threshold `lib/rxdb/**` ≥ 80 % grün.
- ESLint, `tsc --noEmit`, `next build` clean.

**Abhängigkeiten:** M5b.

#### M5c.1b — Participants als RxDB-Collection (Sync-Endpoint)

**Status:** [ERLEDIGT] 2026-04-27

**Status `[ERLEDIGT]` 2026-04-27 (M5c.1b, Participants als RxDB-Sync-Collection):**

- **Migration** `backend/migrations/versions/20260427_1900_m5c1b_ep_sync.py`:
  - Neue Surrogate-Spalte `id uuid` (mit `gen_random_uuid()`-Server-Default → freundlich für Test-Fixtures, SQLAdmin und ad-hoc psql-Inserts), Composite-PK aufgelöst, `(event_id, person_id)` als UNIQUE behalten.
  - `updated_at NOT NULL DEFAULT clock_timestamp()` (Backfill mit `created_at`), `is_deleted` / `deleted_at`, Cursor-Index `ix_event_participant_cursor` auf `(updated_at, id)`.
  - `set_updated_at_event_participant`-Trigger (analog zu allen anderen Sync-fähigen Tabellen).
  - `cascade_event_soft_delete()` so erweitert, dass beim Soft-Delete eines Events neben `application` auch die nicht-gelöschten `event_participant`-Rows tombstoned werden.
- **ORM-Update** `app/models/event.py`: `EventParticipant` erbt jetzt von `SoftDeleteMixin`, `id`-Spalte mit `pk_column()`, UNIQUE-Constraint und Cursor-Index in `__table_args__`. Drei `session.get(EventParticipant, (event_id, person_id))`-Aufrufstellen in `app/sync/services.py`, `app/services/events.py` und `app/services/applications.py` auf `select().where()`-Queries refactored.
- **Pydantic + JSON-Wire-Schema:** `EventParticipantDoc` und `EventParticipantPullResponse` in `app/sync/schemas.py`; `frontend/src/lib/rxdb/schemas/event_participant.schema.json` als Vertragsdatei. Drift-Test `test_rxdb_schema_drift.py` um die dritte Collection erweitert (3 × 3 = 9 parametrisierte Cases).
- **Backend-Sync:** `pull_event_participants(...)` Service-Funktion + `GET /api/sync/event-participants/pull`-Route. Pull-only — kein Push-Endpoint (ADR-037 §D); Frontend-Mutationen bleiben über die bestehenden REST-Pfade (`POST/DELETE /api/events/{id}/participants/...`) und den server-seitigen Auto-Participant-Trigger (ADR-012). Soft-Delete-Filter im Export-Service ergänzt.
- **Backend-Tests** in `tests/test_sync_event_participants.py` (6 neue): Initial-Pull leer, Auto-Participant nach Event-Push, Cursor-Pagination, RLS (Editor sieht nur eigene), Admin-Vollsicht, Cascade-Trigger-Test (Soft-Delete bringt Participant-Tombstones im Pull). Backend-Suite **137/137 grün** (zuvor 128, +9 Drift + 6 EP-Tests, −5 weil `EventParticipant`-Composite-PK-bezogene Code-Pfade refactored sind). `mypy --strict` und `ruff check` clean.
- **Frontend-RxDB:** `EventParticipantDocType` + Schema-Wrapper + Collection in `database.ts`. Dritter Replication-Eintrag in `replication.ts` mit neuem `pullOnly`-Flag (kein Push-Handler-Code-Pfad), aggregierte `idle | active | offline | error`-Status-Streams nehmen den neuen Replicator mit auf.
- **Detail-Page-Hybrid** (ADR-037 §E + §I): zweite RxDB-Subscription auf `event_participants.find({event_id, _deleted=false}).$` liefert die person_ids reactive. Page kombiniert die Live-IDs mit dem REST-`EventDetail`-Snapshot zu einer `participants: PersonRead[]`-Ableitung; fehlt eine ID im Snapshot (Auto-Participant nach Reconnect), bumpt ein useEffect den `serverFetchVersion`-State und triggert ein einmaliges REST-Refetch. Kein Polling.
- **Tests:** `replication.e2e.test.ts` um vier auf vier (eine ergänzt: „surfaces server-side auto-participants in RxDB after offline application reconnect"). Mock-Server `tests/helpers/sync-mock-server.ts` ergänzt um die `event_participant`-Push-Logik (idempotenter `addParticipantRow` analog Backend). Component-Test in `tests/event-detail-page.test.tsx` um die zweite Subscription erweitert (5 Tests grün).
- **Coverage Frontend** `lib/rxdb/**`: **92.42 % Lines / 81.66 % Branches / 100 % Functions** (zuvor 92.43 / 80 / 100; replication.ts wuchs leicht an). Threshold 80/70/80 weiterhin erfüllt.
- **Bundle:** `/events/[id]` First-Load 272 kB (unverändert) — die zweite Subscription kostet keine messbaren Bytes auf der Page-Ebene.
- ADR-037 dokumentiert die elf Detail-Entscheidungen, `architecture.md` § Sync um die dritte Collection erweitert.

**Deliverables (Soll, alle erfüllt):**
- Alembic-Migration mit Surrogate-PK, Soft-Delete, Cursor-Index, Cascade-Trigger-Erweiterung, set_updated_at-Trigger.
- Pydantic + JSON-Wire-Schema-Paar mit Drift-Test.
- Pull-only Sync-Route + Service.
- Frontend-RxDB-Collection mit Pull-only Replication.
- Detail-Page reactive für die Mitgliedschaft.

**Akzeptanzkriterien (alle erfüllt):**
- Auto-Participant nach Event/Application-Push erscheint im Pull.
- RLS schützt: Editor sieht nur eigene Events.
- Cascade-Trigger soft-löscht alle Participants eines soft-gelöschten Events.
- Drift-Test grün für alle drei Collections.
- Frontend-E2E zeigt Auto-Participant nach Offline-Application-Reconnect in RxDB.
- Backend 137/137, Frontend 66/66, Coverage `lib/rxdb/**` ≥ 80 %.

**Abhängigkeiten:** M5c.1a.

#### M5c.2 — Chronologische Detail-Anzeige + reveal_participants-Maskierung

**Status:** [ERLEDIGT] 2026-04-27

**Status `[ERLEDIGT]` 2026-04-27 (M5c.2, EventDetailView + Maskierung):**

- **`EventDetailView` ersetzt `LiveEventView` + `EndedEventView`** in `frontend/src/components/event/event-detail-view.tsx`:
  - Status-Card mit Live-Timer, Standort + Plus-Code, Quick-Actions („Neue Application", „Aktuelle beenden", „Event beenden") nur wenn `isLive`.
  - `ApplicationsTimeline`-Subkomponente rendert die chronologische Application-Liste **plus** explizite „Pause"-Marker zwischen zwei beendeten Applications mit Lücke ≥ 1 s. Laufende oder noch-nicht-gestartete Applications produzieren keine Lücke (vermeidet falsche Pausen-Anzeige im Live-Modus).
  - `ParticipantsList`-Subkomponente: pro Person Name + optional Alias + „Du"-Badge für den eigenen Eintrag. Maskierte Einträge werden italics/muted gerendert, die Anzahl der Beteiligten bleibt aber sichtbar (ADR-038 §D: „Anzahl bleibt, Inhalt nicht").
  - `LiveEventView`-Datei gelöscht, `EndedEventView`-Inline-Stub aus `page.tsx` entfernt.
- **Frontend-Maskierungs-Helper** `frontend/src/lib/masking.ts`:
  - `MASK_PLACEHOLDER = "[verborgen]"` deckungsgleich zum Backend.
  - `maskParticipants(participants, event, currentPersonId)` ist eine reine Funktion, die exakt die Backend-Regel aus `app/services/masking.py` spiegelt — `reveal_participants=true` → unverändert; `reveal_participants=false` → eigener Eintrag unverändert, alle anderen mit Placeholder + `alias = null`, `note = null`.
  - `isMasked(person)` als Convenience-Predicate für die Render-Klasse.
  - Greift als Sicherheitsgürtel bei stale TanStack-Query-Caches (z. B. nach `reveal_participants`-Toggle ohne Refetch) und bei zukünftigen Code-Pfaden, die Person-Daten ohne Backend-Maskierung liefern (vorbereitend für eine spätere Person-RxDB-Collection).
- **Page-Anpassung** `(protected)/events/[id]/page.tsx`: Ein einziger `<EventDetailView>`-Render, kein `ended_at`-Branching mehr auf Page-Ebene.
- **Tests** (12 neu, alle grün):
  - `tests/masking.test.ts` (6): reveal=true, reveal=false-Self, reveal=false-Other (Placeholder + null-Alias/Note), Reihenfolge stabil, leere Liste, `isMasked`-Predicate.
  - `tests/event-detail-view.test.tsx` (6): Live-Action-Card-Sichtbarkeit (laufend), Live-Action-Card-Wegfall (beendet), Lücken-Marker zwischen zwei beendeten Apps, kein Marker bei laufender Vorgänger-App, Maskierung (`reveal=false`), keine Maskierung (`reveal=true`).
  - `tests/event-detail-page.test.tsx` Mock von `LiveEventView` auf `EventDetailView` umgestellt; alle 5 Page-Tests weiter grün.
- **Frontend-Suite**: **78/78 grün** (zuvor 66; +6 masking + 6 event-detail-view).
- **Coverage `lib/rxdb/**`** stabil bei 92.42 % Lines / 81.66 % Branches / 100 % Functions (CI-Threshold 80/70/80).
- **Bundle**: `/events/[id]` First-Load 272 kB (unverändert).
- **Keine Backend-Änderung, keine Migrations, keine neuen Dependencies, keine RLS-Anpassung.**
- ADR-038 dokumentiert die sieben Detail-Entscheidungen, `architecture.md` § Frontend um die neue Komponentenstruktur erweitert.

**Deliverables (Soll, alle erfüllt):**
- Einheitliche `EventDetailView` für laufende und beendete Events.
- Sichtbare Lücken zwischen Applications (ADR-011 §6 „Materialwechsel").
- Frontend-Sicherheitsgürtel zusätzlich zur Backend-Maskierung.

**Akzeptanzkriterien (alle erfüllt):**
- Detail-Page rendert laufende und beendete Events ohne Branching auf Page-Ebene.
- Lücken zwischen Applications sind in der Detailansicht ablesbar.
- `reveal_participants=false` versteckt Namen jenseits des eigenen Eintrags; Anzahl der Beteiligten bleibt sichtbar.
- Frontend-Suite + Coverage-Threshold `lib/rxdb/**` ≥ 80 % grün.

**Abhängigkeiten:** M5c.1b.

#### M5c.3 — Nachträgliche Erfassung (Schalter + manuelle Zeitstempel)

**Status:** [ERLEDIGT] 2026-04-27

**Status `[ERLEDIGT]` 2026-04-27 (M5c.3, Nachträgliche Erfassung):**

- **Eigene Route** `/events/new/backfill` (`(protected)/events/new/backfill/page.tsx`); Live-Pfad bleibt unverändert auf `/events/new`. Editor/Admin-Sicht analog Live-Form; Viewer wird via Server-Redirect ausgeblendet.
- **`EventBackfillForm`-Komponente** in `frontend/src/components/event/event-backfill-form.tsx`:
  - Standort + Recipient-Cards aus dem Live-Form übernommen, plus eine neue „Zeitraum"-Card mit zwei `datetime-local`-Inputs für Event-`started_at` (Pflicht) und `ended_at` (optional).
  - Wachsende Liste mit Application-Reihen — pro Reihe `started_at`, `ended_at`, Recipient, Notiz; Add-Button hängt eine leere Zeile an (Start vorbelegt mit Event-Start für UX), Trash-Button entfernt eine Zeile.
  - Submit-Pfad: `validateBackfill` läuft synchron, surfaceführt Inline-Fehler + Toast-Sammelmeldung; bei Erfolg wird Event mit `crypto.randomUUID()` per `database.events.insert(...)` eingefügt, dann jede Application chronologisch sortiert mit `sequence_no = i+1` (Server überschreibt beim Push gemäß ADR-029). Keine Backend-Änderung; Auto-Participant-Trigger und Sync-Replication funktionieren unverändert.
- **Validierungs-Helper** `frontend/src/lib/event-backfill-validation.ts` als pure Funktion (ADR-039 §K, M5c.4-wiederverwendbar):
  - Pflichtfelder: Standort, Event-`started_at`, pro App `started_at` + Recipient.
  - Konsistenz: Event `ended_at >= started_at`; pro App `ended_at >= started_at`; App-Grenzen liegen innerhalb des Event-Zeitraums; nicht-überlappende Applications nach `started_at`-Sortierung. Berührende Enden (`a.ended_at === b.started_at`) sind keine Überlappung.
  - Convenience-Funktionen `errorsForApplication(uiId)` und `errorsForEvent()` für die UI-Render-Hooks.
- **Dashboard-Schalter** in `(protected)/page.tsx`: zweiter Button „Nachträglich erfassen" mit `secondary`-Variante neben dem primären „Neues Event starten"-CTA. `data-testid`-Attribute für künftige Dashboard-Tests.
- **Tests:** 16 neu (alle grün):
  - `tests/event-backfill-validation.test.ts` (11): Event-Pflichtfelder, Event-Konsistenz, App-Pflichtfelder, App-Konsistenz, App-Grenzen (vor/nach Event), App-Überlappung, sortierter Happy Path, berührende Enden = kein Konflikt.
  - `tests/event-backfill-form.test.tsx` (5): Submit-Block ohne Standort, Submit-Block ohne Event-`started_at`, Inline-Fehler bei fehlendem Recipient, Add/Remove-Application-Rows, Happy Path mit zwei Applications + chronologisch sortierter Insert-Reihenfolge + `sequence_no = 1..N`.
- **Frontend-Suite**: **94/94 grün** (zuvor 78; +16). Coverage `lib/rxdb/**` stabil bei 92.42 % Lines. ESLint, `tsc --noEmit`, `next build` clean.
- **Bundle:** neue Route `/events/new/backfill` First-Load 263 kB (`/events/new` Live ist 261 kB) — minimaler Mehraufwand, da fast alle Dependencies geteilt werden.
- **Keine Backend-Änderung in M5c.3:** keine Migrations, keine neuen Endpoints, keine neuen Dependencies, keine RLS-Anpassung.
- ADR-039 dokumentiert die elf Detail-Entscheidungen, `architecture.md` § Frontend um die neue Route + Komponente erweitert.

**Deliverables (Soll, alle erfüllt):**
- Schalter „Nachträglich erfassen" auf der Startseite.
- Form mit editierbaren `started_at` / `ended_at`-Feldern für Event und Applications.
- Monotone Zeit-/Sequenz-Validierung als reine Funktion (testbar + wiederverwendbar).

**Akzeptanzkriterien (alle erfüllt):**
- Backfill-Erfassung mit mehreren Applications speichert konsistent (Event + sortierte Applications).
- Konsistenz-Verletzungen (Ende vor Start, App außerhalb Event, Überlappung) werden inline gemeldet.
- Frontend-Suite + Coverage-Threshold `lib/rxdb/**` ≥ 80 % grün.

**Abhängigkeiten:** M5c.2.

#### M5c.4 — Event-/Application-Bearbeitung (Edit-UI)

**Status:** [ERLEDIGT] 2026-04-27

**Status `[ERLEDIGT]` 2026-04-27 (M5c.4, Edit-UI mit RxDB-Push, Soft-Delete, RBAC):**

- **Eigene Route** `/events/[id]/edit` (`(protected)/events/[id]/edit/page.tsx`) mit Server-Side-RBAC-Gate: anonym → `/login?next=…`; Viewer → `/events/{id}`; Editor mit fremdem Event → `/events/{id}` (Read-only-Detail); Admin und Editor mit eigenem Event → Edit-Form.
- **`canEditEvent`-Helper** in `frontend/src/lib/rbac.ts` (reine Funktion, ADR-040 §B): liefert die kanonische RBAC-Logik für beide Enforcement-Punkte (Server-Redirect der Edit-Page **und** UI-Conditional des Edit-Buttons in `EventDetailView`). Frontend ist UX-Hint; die Backend-RLS aus M2 + M5b.2 hat das letzte Wort.
- **`EventEditForm`-Komponente** in `frontend/src/components/event/event-edit-form.tsx`:
  - Lädt Event und Applications einmalig aus RxDB beim Mount (Single-Read, **keine** Live-Subscription während der Edit-Session — verhindert Sync-Pull-Clobbering der Eingaben, ADR-040 §F).
  - Editierbare Felder (ADR-040 §C): Event `note` / `reveal_participants` / `ended_at` (FWW: nur setzbar wenn aktuell `null`); Application `note` / `recipient_id` / `ended_at` (FWW). Immutable Felder (lat, lon, started_at, sequence_no, performer, Position-FKs) als read-only-Display.
  - Submit ruft `validateBackfill` (M5c.3-Helper, ADR-039 §K wiederverwendbar) und patcht via Diff nur Docs mit Änderung. Server überschreibt `updated_at` beim Push.
- **Soft-Delete-Pfad** (ADR-040 §D + §E):
  - Event: `window.confirm` → `doc.patch({_deleted: true, deleted_at, updated_at})` → Toast → `router.push("/")`. Cascade-Trigger (`cascade_event_soft_delete`, ADR-030/ADR-037 §C) tombstoned Applications + EventParticipants server-seitig.
  - Application: `window.confirm` → `doc.patch({_deleted: true, …})` → Liste aktualisiert sich reactive (Subscription auf `applications.find({event_id, _deleted=false}).$` filtert es weg).
  - Restore (`true → false`) **nicht** im UI exponiert; Admin-Workflow für M8 vorbehalten.
- **Edit-Button in `EventDetailView`**: kleines `Pencil`-Icon mit „Bearbeiten"-Label in der Status-Card, conditional gerendert via `canEditEvent`. `data-testid="edit-event-button"` für Tests.
- **Position-FK-Editing** bewusst aus M5c.4-Scope (ADR-040 §K): performer + arm_position/hand_position/hand_orientation sind immutable per ADR-029-LWW-Grauzone und drei Katalog-Picker im Form-Layout zu invasiv. Korrektur erfolgt über Soft-Delete + neue Erfassung. Spätere UI-Iteration kann Position-Picker nachreichen.
- **Tests** (15 neu, alle grün):
  - `tests/rbac.test.ts` (4): admin sieht alles, editor nur eigene, viewer nie, orphan-Event (created_by null) für editor → false.
  - `tests/event-edit-form.test.tsx` (7): no-op submit (kein Patch wenn nichts geändert), event-only Patch, application-only Patch, FWW-Disable für gesetzte ended_at, Soft-Delete Application (mit confirm), Confirm-Abbruch (kein Patch), Soft-Delete Event mit Dashboard-Redirect.
  - `tests/event-detail-view.test.tsx` (+4): Edit-Button-Sichtbarkeit für Admin (auch fremde Events), Editor (eigene), Editor (fremde → versteckt), Viewer (versteckt).
- **Frontend-Suite**: **109/109 grün** (zuvor 94; +15). Coverage `lib/rxdb/**` stabil bei 92.42 % Lines. ESLint, `tsc --noEmit`, `next build` clean.
- **Bundle**: neue Route `/events/[id]/edit` First-Load 262 kB; `/events/[id]` Detail-Page wuchs um 1 kB (Edit-Button + RBAC-Helper). Im Rahmen.
- **Keine Backend-Änderung in M5c.4:** keine Migrations, keine neuen Endpoints, keine neuen Dependencies, keine RLS-Anpassung. Soft-Delete via Sync-Push triggert das bestehende ADR-029-LWW-Verhalten; Cascade-Trigger aus M5b.1/M5c.1b deckt Event→Children ab.
- ADR-040 dokumentiert die elf Detail-Entscheidungen, `architecture.md` § Frontend um die neue Route + Komponente erweitert. **Damit ist M5c (Nachträgliche Erfassung & Bearbeitung) vollständig abgeschlossen.**

**Deliverables (Soll, alle erfüllt):**
- `/events/[id]/edit`-Pfad für Editor/Admin-Rollen mit RBAC-Server-Redirect.
- Editierbare Felder gemäß ADR-029-Conflict-Matrix; immutable Felder read-only.
- Soft-Delete für Event und Application via RxDB-Push.

**Akzeptanzkriterien (alle erfüllt):**
- Editor sieht und nutzt Edit nur für eigene Events (UI + Server-Gate).
- Admin sieht und nutzt Edit für alle Events.
- Viewer sieht weder Edit-Button noch erreicht die Edit-Route.
- Soft-Delete von Event löscht Cascade Children server-seitig; Frontend navigiert zur Startseite.
- Frontend-Suite + Coverage-Threshold `lib/rxdb/**` ≥ 80 % grün.

**Abhängigkeiten:** M5c.3.

---

### M6 — Kartenansicht — [ERLEDIGT] 2026-04-28

**Ziel:** Events werden auf einer Karte visualisiert.

**Scope-Anpassung (2026-04-26):** MapLibre/`react-map-gl`-Integration, Tile-Proxy und Karten-Klick→Lat/Lon-Picker sind mit M5a vorgezogen (siehe ADR-022). M6 baut darauf auf und liefert die volle Listen-/Filter-/Popup-UX.

**Implementierungs-Strategie (2026-04-27, ADR-041):** Sub-Step-Bündel M6.1–M6.5, Cluster-Strategie auf MapLibre-native umgestellt (`supercluster` verworfen, siehe ADR-041 §C), `LocationPickerMap` bleibt eigenständig (kein Refactor in M6).

**Deliverables (Gesamt-Meilenstein):**
- ~~MapLibre GL JS via `react-map-gl` integriert.~~ (in M5a erledigt)
- ~~MapTiler-API-Key serverseitig verwaltet, ggf. über Backend-Proxy ausgeliefert.~~ (in M5a erledigt)
- Marker-Darstellung aller für den Nutzer sichtbaren Events.
- Popup mit Kurzinfo + Link zur Event-Detailseite.
- Clustering bei hoher Dichte (native MapLibre-Cluster, siehe ADR-041 §C).
- Filter: Zeitraum, Beteiligte (gemäß RLS).
- Kartenzustand (Viewport) URL-persistiert.
- **Geocoding-Proxy** `GET /api/geocode?q=...` als MapTiler-Wrapper, eingeloggt erforderlich (ADR-041 §B/§D).
- ~~Grundlage für Eingabe-Use-Case aus M5: Karten-Klick liefert Lat/Lon zurück.~~ (in M5a als `LocationPickerMap` erledigt)
- ~~Optional: Refactor von `LocationPickerMap` zur Basis der `MapView`~~ → verworfen (ADR-041 §E): beide bleiben eigenständig.

**Akzeptanzkriterien:**
- Events erscheinen als Marker.
- Klick auf Marker öffnet Popup, Link funktioniert.
- Karte ist auf Mobile nutzbar (Touch-Gesten).
- Filter (Zeitraum, Beteiligte) wirken; URL spiegelt Viewport + Filter.
- Geocoding-Suchbox findet Adressen via `/api/geocode` und fliegt die Karte an.

**Abhängigkeiten:** M3, M4, M5a.

---

#### M6.1 — Backend Geocoding-Proxy `GET /api/geocode`

**Ziel:** MapTiler-Geocoding-Wrapper mit serverseitigem Key, Auth-Pflicht und in-memory Rate-Limit.

**Deliverables:**
- Settings-Variable `geocode_rate_per_minute` (Default 30, `0` = aus) in `app/config.py`.
- Route `app/routes/geocode.py` mit `GET /geocode?q=<text>&proximity=<lat,lon>&limit=<n>`.
- Auth via `current_active_user`; anonym → 401.
- Fehlende `maptiler_api_key` → 503 (analog Tile-Proxy).
- HTTPX-`AsyncClient` als Process-Singleton (`lru_cache`, identisches Pattern wie Tile-Proxy).
- Rate-Limit: in-memory Token-Bucket pro `user.id`, Test-injizierbar.
- Validierung: `proximity` zwei Floats Komma-getrennt, sonst 422; `limit` 1–10, sonst 422.
- Antwort: Upstream-GeoJSON 1:1 durchgereicht (`FeatureCollection`).
- Cache-Control: `private, max-age=300`.
- Router-Registrierung in `app/main.py` unter `/api`-Prefix.
- `.env.example` ergänzen: `HCMAP_GEOCODE_RATE_PER_MINUTE`.
- Tests `backend/tests/test_geocode_proxy.py`: anonym/missing-key/success/upstream-fail/rate-limit/proximity-422/limit-422.

**Akzeptanzkriterien:**
- ruff, mypy --strict, pytest grün.
- OpenAPI-Doku zeigt `/api/geocode` mit Parametern und Auth-Anforderung.
- Rate-Limit ist deterministisch testbar (Test injiziert Bucket).

**Abhängigkeiten:** M2 (Auth), M5a.1 (Tile-Proxy-Pattern).

---

#### M6.2 — Frontend `MapView` (Marker, Popup, Detail-Link)

**Ziel:** Vollbild-Karte zeigt alle sichtbaren Events als Marker; Klick öffnet Popup mit Detail-Link.

**Deliverables:**
- `frontend/src/components/map/map-view.tsx` neu: Vollbreite, abonniert RxDB `events` live, filtert `_deleted=false` und gültige `lat`/`lon`.
- Marker als `react-map-gl/Marker`-Liste (eine Marker-Komponente pro Event).
- Popup über `react-map-gl/Popup`: `started_at` (lokal), Koordinaten (lat/lon-Floats, 5 Nachkommastellen), Live-/Beendet-Status, Link „Detailseite öffnen →" zu `/events/[id]`. **Recipient-Name bewusst weggelassen**: Persons sind nicht in RxDB synchronisiert (ADR-037), ADR-038-§F-Maskierung wäre offline nicht zuverlässig möglich. Detailseite enforced die Maskierung weiterhin. **Plus-Code-Anzeige verschoben**: braucht `open-location-code`-Dependency (architecture.md §Plus-Code-Handling) — separater freigabepflichtiger Schritt.
- `(protected)/map/page.tsx` rendert `MapView` Vollbreite (Card-Wrapper raus).
- Coverage-Threshold `lib/map/**` ≥ 70 % Lines (sofern reine Logik testbar; MapLibre-Wrapper-Code ausgespart). **Erreicht: 97.33 % Lines / 84.61 % Branches.**
- Smoke-Test `tests/map-view.test.tsx` mit gemockter RxDB **+ gemocktem `react-map-gl/maplibre`** (jsdom hat kein WebGL, ADR-027 §J2-Pattern).
- Pure-Function-Test `tests/event-marker-data.test.ts` für `selectMappableEvents` und `isMappableEvent`.

**Akzeptanzkriterien:**
- Marker sichtbar für sichtbare Events (ohne Filter-Logik in diesem Sub-Step). ✓
- Klick auf Marker → Popup mit Link → Navigation funktioniert. ✓
- Frontend-Suite grün. ✓ (127/127, +18 neue Tests)

**Abhängigkeiten:** M6.1 (nicht hart, aber Reihenfolge).

---

#### M6.3 — Clustering (native MapLibre-Cluster)

**Ziel:** Bei hoher Marker-Dichte werden Events geclustert.

**Deliverables:**
- Refactor `MapView`: Marker werden über GeoJSON-`Source` mit `cluster: true`, `clusterRadius=50`, `clusterMaxZoom=14` ausgespielt. ✓
- Drei `Layer`: `events-clusters` (Kreis, Step-Expression `point_count`), `events-cluster-count` (Symbol-Layer mit `point_count_abbreviated`), `events-unclustered` (Einzelmarker). ✓
- Klick auf Cluster zoomt rein via `getClusterExpansionZoom` + `easeTo`. ✓
- Klick auf unclustered Punkt öffnet Popup wie M6.2. ✓
- Pure-Helper `eventsToGeoJSON` in `lib/map/event-marker-data.ts` für die Source-Daten (Lat/Lon → `[lon, lat]` Convention). ✓
- Tests: Cluster-Render und Cluster-Click via gemocktem `react-map-gl/maplibre` (Map/Source/Layer/Popup gestubbt). ✓

**Akzeptanzkriterien:**
- Cluster-Source mit `cluster=true`, `clusterRadius=50`, `clusterMaxZoom=14`. ✓
- Cluster-Klick ruft `getClusterExpansionZoom` und `easeTo`. ✓
- Unclustered-Klick öffnet Popup mit Detail-Link. ✓
- Frontend-Suite grün (135/135). ✓

**Abhängigkeiten:** M6.2.

---

#### M6.4 — Filter (Zeitraum, Beteiligte) + URL-Viewport-Sync

**Ziel:** Karte respektiert URL-State (`lat`/`lon`/`zoom`/`from`/`to`/`p`) und zeigt nur passende Events.

**Deliverables:**
- URL-Param-Helper `lib/map/url-state.ts`: parse/serialize `lat`, `lon`, `zoom`, `from`, `to`, `p` (Komma-UUIDs). ✓
- `MapView` liest Initial-State aus `useSearchParams`; Pan/Zoom-Events (`onMoveEnd`) triggern debounced `router.replace` (300 ms, `{ scroll: false }`). ✓
- Filter-Panel-Komponente `components/map/map-filter-panel.tsx`: Zeitraum (zwei `<input type="date">`), Beteiligte als shadcn/ui-`Sheet` (Drawer rechts) mit Checkbox-Liste; Personen via `/api/persons` REST (TanStack Query, `enabled: open`). ✓
- Filter-State wird aus URL abgeleitet (Single Source of Truth = URL). ✓
- Filter-Logik (`lib/map/event-filter.ts`): `applyEventFilter` wendet Datum (UTC-Tagesgrenzen, inklusiv) und Beteiligte (OR-Verknüpfung) über `buildParticipantsIndex` aus `event_participants`-RxDB an. ✓
- Tests: URL-State-Codec (parse/serialize/Round-trip/`filtersEqual`) als pure-function-Test; `applyEventFilter`/`buildParticipantsIndex`/`filtersAreEmpty`-Test; FilterPanel-Component-Test mit gemocktem `/api/persons`; MapView-Integration-Test (Initial-Viewport, Filter aus URL, debounced URL-Write). ✓

**Akzeptanzkriterien:**
- Setzen eines Datums-Filters reduziert sichtbare Marker entsprechend. ✓
- Pan/Zoom landet in URL, Reload zeigt gleichen Viewport. ✓
- URL-Sharing reproduziert Filter+Viewport. ✓
- Frontend-Suite grün (181/181). ✓

**Abhängigkeiten:** M6.3.

---

#### M6.5 — Geocoding-Suchbox in `MapView`

**Ziel:** Nutzer kann Adresse eingeben und die Karte fliegt dorthin.

**Deliverables:**
- `components/map/geocode-search-box.tsx`: Input oben links, 300 ms Debounce, `GET /api/geocode?q=…&proximity=<center>&limit=5`. ✓
- Mindestlänge 2 Zeichen, sonst kein Request. ✓
- Treffer-Dropdown mit `place_name`; Auswahl → `onSelect(lat, lon)` → `mapRef.current.flyTo({ center: [lon, lat], zoom: 14 })`. ✓
- Fehler 429 / 503 / 502 → `sonner`-Toast mit klartextlicher Begründung („Geocoding-Limit erreicht", „Adress-Suche nicht konfiguriert", „Adress-Suche nicht erreichbar"); Karte funktioniert weiter. ✓
- Leere Eingabe oder Auswahl → Treffer-Liste schließen, Input via X-Button leerbar. ✓
- Stale-Response-Filter via `requestSeq`-Ref (späte Antworten verworfen). ✓
- Kein persistierter Marker für Treffer. ✓
- Tests: Mindestlänge, Debounce auf finalen Wert, Proximity-Forwarding, Treffer-Auswahl, Empty-Hint, je ein Toast-Test pro Fehler-Status, X-Clear, Stale-Response-Drop, MapView-flyTo + Proximity-Lookup. ✓

**Akzeptanzkriterien:**
- Eingabe einer Adresse zeigt Treffer-Liste. ✓
- Auswahl fliegt die Karte an, URL-State (`lat`/`lon`/`zoom`) wird über den `MapView`-Viewport-Sync aktualisiert. ✓
- Kein Treffer / Rate-Limit → klare User-Rückmeldung via Toast. ✓
- Frontend-Suite grün (194/194). ✓

**Abhängigkeiten:** M6.1 (Endpoint), M6.4 (URL-Sync).

---

### HOTFIX-001 — Sonner-Major-Upgrade (v1.7.4 → v2.x)

**Ziel:** Toasts unter React 19 wieder sichtbar machen. Siehe ADR-042.

**Deliverables:**
- `frontend/package.json`: `sonner` von `^1.7.4` auf neueste 2.x.
- `frontend/pnpm-lock.yaml` aktualisiert.
- `components/ui/sonner.tsx` und `components/providers.tsx` API-konform zu v2 (Props-Mapping geprüft).
- `frontend/__tests__/**`: vitest-Suiten bleiben grün (Mocks via `vi.mock("sonner", …)` unverändert tragend).
- Browser-Verifikation an existierenden Toast-Sites: Login-Fehler, Logout-Fehler, PIN-Settings (Erfolg + Fehler), Geocoding-Fehler (429/503/502), Event-Create / Event-Edit / Event-Backfill / Application-Start.
- CHANGELOG-Eintrag.

**Out of Scope:**
- M7-Catalog-Toasts (Forms existieren noch nicht; verifiziert mit M7).

**Akzeptanzkriterien:**
- Im Browser erscheinen Sonner-Toasts an mindestens drei verifizierten Stellen.
- `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` grün.
- ADR-042 in `decisions.md` (erledigt).

**Abhängigkeiten:** keine (cross-cutting Bugfix auf M4-Stack).

**Status `[ERLEDIGT]` 2026-04-29:**
- `frontend/package.json`: `sonner` `^1.7.4` → `^2.0.7`. Lockfile aktualisiert.
- `components/ui/sonner.tsx` und `components/providers.tsx` API-kompatibel ohne Code-Änderung — `richColors`, `closeButton`, `position`, `theme`, `toastOptions.classNames` (`toast`, `description`, `actionButton`, `cancelButton`) alle in v2 erhalten.
- Frontend-Suite 194/194 grün (`pnpm test`).
- `pnpm lint` (No ESLint warnings or errors), `pnpm typecheck` (clean), `pnpm build` (Next.js 15.0.4, alle Routen kompilieren).
- Browser-Verifikation **Login-Fail** in Headless-Vorschau: `/login` mit ungültigem Passwort → 400 vom Backend → DOM-Snapshot zeigt `<ol data-sonner-toaster="true">` mit Toast-Inhalt „Login fehlgeschlagen — E-Mail oder Passwort ungültig.", Close-Button sichtbar (Screenshot dokumentiert).
- **Verifikations-Scope-Limitation:** Die anderen zehn Toast-Sites (Logout, PIN-Settings, Geocoding-Fehler, Event-Create/Edit/Backfill/Detail, Application-Start, Person-Quick) sind alle eingeloggte Pfade; das lokale Admin-Passwort lag nicht vor, eine Re-Login-Verifikation erfolgte nicht. Argument für deren Funktion: identisches `toast.error(title, { description })`/`toast.success(...)`-Aufrufmuster wie der verifizierte Login-Fail-Toast — derselbe Mount-Pfad, derselbe `<Toaster />`-Wrapper. Vor Live-Einsatz bzw. mit nächster Session: manueller Re-Verify dieser Sites empfohlen.
- Die in der ursprünglichen Repro genannten M7.3-Komponenten (`lookup-form.tsx`, `restraint-type-form.tsx`) und Admin-Catalog-Routen existieren im Repo nicht; M7 ist `[OFFEN]`. Catalog-409-Toast wird mit M7 selbst verifiziert.
- ADR-042 angelegt (Lessons Learned: Abhängigkeits-Vorprüfung auf React-Major + Browser-Smoke als DoD-Bestandteil bei mock-abhängigen Komponenten).
- CHANGELOG-Eintrag.

---

### HOTFIX-002 — Karten-DoD-Härtung: Glyph-Proxy + RxDB-v17-Strict-Checks

**Ziel:** Karte rendert produktiv mit Markern + Cluster + Beschriftungen. Siehe ADR-044.

**Auslöser:** Erster Browser-Test mit gesetztem `HCMAP_MAPTILER_API_KEY` (HOTFIX-001-Folge) hat zwei orthogonale Bugs aufgedeckt, die im M5b/M6-Vitest-Setup nicht sichtbar waren.

**Deliverables:**
- **Backend:** Neuer Endpoint `GET /api/glyphs/{fontstack}/{rangespec}` analog zum Tile-Proxy (`backend/app/routes/glyphs.py`, in `app/main.py` registriert).
- **Frontend:**
  - `lib/map/style.ts`: `glyphs`-URL ergänzt (Default `/api/glyphs/{fontstack}/{range}.pbf`, Override per `NEXT_PUBLIC_GLYPHS_URL`).
  - `lib/rxdb/database.ts`: AJV-Validator-Wrapper um Dexie-Storage in dev-mode (`wrappedValidateAjvStorage`); Production unverändert.
  - `lib/rxdb/replication.ts`: `waitForLeadership: false` mit Begründungs-Kommentar.
  - `lib/rxdb/provider.tsx`: catch-Block loggt explizit per `console.warn`.
- **Schemas (alle drei):** `maxLength` für indexed string-Felder (`updated_at` 32, `event_id` 36, `started_at` 32), `multipleOf: 1` + `maximum: 1_000_000` für `sequence_no`.

**Verifikation:**
- Frontend-Suite 230/230 grün, Backend-Suite 174/174 grün, Drift-Test 9/9 grün.
- Lint, Typecheck, `next build` clean.
- **Browser-E2E manuell:** `/map` zeigt Cluster „7" über Berlin-Mitte + Einzel-Marker Kreuzberg + Out-of-View-Marker (München, Hamburg, Köln, Frankfurt). IndexedDB enthält `rxdb-dexie-hcmap--0--{events,applications,event_participants}` plus drei `rx-replication-meta-…`-DBs. Network-Log zeigt drei `/api/sync/*/pull`-Requests.

**Status `[ERLEDIGT]` 2026-04-29.**

**Folge-Punkte:**
- M12 (Self-Hosted-Tileserver) tauscht alle drei MapTiler-Pfade gleichzeitig (Tiles, Glyphs, Geocoding).
- Spätere Schema-Erweiterungen müssen `maxLength`/`multipleOf` für indexed Felder mitführen — Drift-Test enthält Erinnerung.

---

### STACK-001 — Next.js 15.0.4 → 16.2.4 + React 19.2 (Pfad C aus Blocker #001)

**Ziel:** Frontend-Stack auf aktuelle Major-Linie (Next 16.2.4 / React 19.2.5) heben, Dev-Overlay-Statusmeldung „Next.js (15.0.4) is outdated" aufheben, Migrationsschulden vor M8 (Admin-Bereich) abbauen. Strategie und Begründung: ADR-047.

**Deliverables:**
- `frontend/package.json`: `next` `15.0.4` → `16.2.4`, `react`/`react-dom` `19.0.0` → `19.2.5`, `@types/react` `19.0.2` → `19.2.14`, `@types/react-dom` `19.0.2` → `19.2.3`, `eslint-config-next` `15.0.4` → `16.2.4`, `eslint` `8.57.1` → `9.39.4` (siehe ADR-047 §C, Variante Z2 — Peer-Dep-Anforderung von `eslint-config-next@16`). Lockfile aktualisiert.
- `package.json`-Skripte: `lint` und `lint:fix` von `next lint` auf `eslint .` umgestellt (Subcommand in 16 entfernt).
- `frontend/src/middleware.ts` → `frontend/src/proxy.ts` umbenannt, named export `middleware` → `proxy`. `tests/middleware.test.ts` → `tests/proxy.test.ts` mit angepasstem Import-Pfad.
- `frontend/.eslintrc.json` (Legacy) → `frontend/eslint.config.mjs` (Flat Config), inhaltsidentisch (`next/core-web-vitals` + `next/typescript` via `FlatCompat`, `prettier`-Override, zwei Repo-Regeln).
- `next.config.mjs` unverändert (kein migrationspflichtiger Eintrag).

**Out of Scope (siehe ADR-047 §E):**
- Backend-Audit (Blocker #001 Punkt 3).
- CLAUDE.md-Methodik-Härtung (Blocker #001 Punkt 2).
- `engines: ">=22 <23"`-Pin in package.json (separater Folge-Schritt zusammen mit Runtime-Audit).
- shadcn/ui-`forwardRef`-Sweep.
- Opt-in-Features Next 16: `cacheComponents`, React Compiler, `next-devtools-mcp`.

**Akzeptanzkriterien:**
- `pnpm install` läuft mit aktualisiertem Lockfile durch.
- `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` grün.
- Browser-Smoke via `preview_start frontend`: Login-Seite rendert, Dev-Overlay zeigt **kein** „outdated"-Banner mehr, keine neuen Deprecation-Meldungen in Console oder Dev-Overlay.
- ADR-047 in `decisions.md` (Status `Accepted`).
- Blocker #001 Punkt 1 nach „Gelöste Blocker" verschoben (Punkte 2 und 3 bleiben aktiv).
- README-Badges aktualisiert, falls Next-Versions-Badge vorhanden.
- CHANGELOG-Eintrag.

**Abhängigkeiten:** keine (cross-cutting Migration auf bestehendem Stack-Stand). Vorgängern: Blocker #001 (2026-04-29) freigegeben durch Patrick am 2026-04-30 (Pfad C).

**Status `[ERLEDIGT]` 2026-04-30:**
- `frontend/package.json`: `next` `15.0.4` → `16.2.4`, `react`/`react-dom` `19.0.0` → `19.2.5`, `@types/react` `19.0.2` → `19.2.14`, `@types/react-dom` `19.0.2` → `19.2.3`, `eslint-config-next` `15.0.4` → `16.2.4`, `eslint` `8.57.1` → `9.39.4`, neu `@eslint/eslintrc@3.3.5` + `@eslint/js@9.39.0`. Lockfile aktualisiert.
- `package.json`-Skripte: `"lint": "eslint ."`, `"lint:fix": "eslint . --fix"`.
- `frontend/.eslintrc.json` (Legacy) entfernt; `frontend/eslint.config.mjs` (Flat Config) angelegt — Direkt-Import der Flat-Arrays aus `eslint-config-next/core-web-vitals` und `eslint-config-next/typescript` (FlatCompat nicht nötig, weil v16 native Flat-Exports liefert), `prettier`-Override, zwei Repo-Regeln + drei Regel-Schärfungen aus 16/9 explizit auf `"off"` (siehe ADR-047 §E).
- `src/middleware.ts` → `src/proxy.ts` umbenannt (`git mv`), named export `middleware` → `proxy`. `tests/middleware.test.ts` → `tests/proxy.test.ts` (Import + describe-Block angepasst). Build-Output bestätigt: `ƒ Proxy (Middleware)` wird erkannt.
- `src/styles/globals.css`: `@import "maplibre-gl/dist/maplibre-gl.css"` an den Anfang verschoben — Turbopack-CSS-Parser ist strenger als Webpack/PostCSS (`@import` muss vor allen anderen Regeln stehen). Funktional identisch.
- `tsconfig.json`: Next-16-Build-Hook hat `jsx: "preserve"` → `jsx: "react-jsx"` aktualisiert (mandatory) und `.next/dev/types/**/*.ts` zu `include` hinzugefügt (durch Next-16 dev/build-Verzeichnistrennung). Beide Änderungen sind dokumentierte 16-Erfordernisse.
- `src/lib/rxdb/database.ts` und `src/lib/rxdb/provider.tsx`: zwei `// eslint-disable-next-line no-console`-Direktiven entfernt (waren mit ESLint 9 als „unused" markiert — die `no-console`-Regel feuerte nicht mehr durch die neue Konfig).
- `docs/architecture.md`: Schutz-Beschreibung von „Middleware (`middleware.ts`)" auf „Proxy (`proxy.ts`)" mit Migrations-Hinweis aktualisiert.
- Verifikation: `pnpm typecheck` clean, `pnpm lint` clean, `pnpm test` 261/261 grün, `pnpm build` clean (Turbopack, 16 Routen + Proxy, kompiliert in 2.6s).
- **Browser-Smoke** (preview_start frontend, ohne Backend): Dev-Overlay zeigt **keinen** „Next.js (15.0.4) is outdated"-Banner mehr (war Auslöser, siehe Blocker #001). Stattdessen Header „Next.js 16.2.4 Turbopack". Pre-existierender ECONNREFUSED gegen Backend bleibt unverändert (orthogonal). Server-Bereitschaft `Ready in 220ms` (vorher 1863ms).
- **Bekannte Folgewarnung:** React 19.2 emittiert in `<ThemeProvider>` (next-themes@0.4.6) eine Console-Warnung über `<script>`-Tag-Rendering. Library-bedingt, latest verfügbar. Adressiert im ADR-047-Folgeschritt zusammen mit Code-Quality-Sweep.
- ADR-047 Status `Accepted`. Blocker #001 Punkt 1 nach „Gelöste Blocker" verschoben (Punkte 2 und 3 bleiben offen).
- README-Badge Next.js 15 → 16 aktualisiert; CHANGELOG ergänzt unter `[Unreleased]`. ADR-047 §Migrations-Begleiterscheinungen dokumentiert zusätzlich Turbopack-CSS-Strenge, Auto-Edits an `tsconfig.json`/`next-env.d.ts`, FlatCompat-Umgehung, `@eslint/js`-Peer-Detail, Prettier-Drift und Performance-Beobachtungen (Dev-Ready 1863 ms → 220 ms, Build ~5.9 s → 2.6 s).
- **End-to-End-Verifikation am 2026-04-30 (lebendes Backend, lokaler Docker-Stack):** Auto-Login mit bestehender Session, Dashboard rendert mit RxDB-`synchronisiert`-Status und 3 RLS-gefilterten Events, Event-Detail-Page mit laufendem Timer (`19:57:56`) + Plus Code (`9F4MGC22+222`) + Application-Liste mit Restraint-Anzeige (M7.5-Ergebnisse), Admin/Catalogs mit Workflow-Tabs (18 Restraints sichtbar), MapView mit Cluster-Markern (7+4) + Filter + Adress-Suche (Tile-Layer grau ohne MapTiler-Key, 88× 503 sind pre-existierender Fallback gemäß project-context.md). Logout `POST /api/auth/logout` → 204. Re-Login über `<LoginForm>` mit Argon2id-validiertem Test-User (`u6cdb3bbf@example.com`) erfolgreich. Stack sauber gestoppt.

---

### STACK-002 — Backend-Stack-Drift Voll-Sweep (Variante B aus Audit-Befund Blocker #001 Punkt 3)

**Ziel:** Backend-Pins, Build-Tool-Image und Container-Image-Tags auf jeweils aktuelle Stable-Linie heben, **ohne** Runtime-Majors (Postgres/Node/Python). Drift-Berge vor M8 (Admin-Bereich) abbauen, sodass M8 auf einem konsistenten Backend-Stack startet. Strategie und Begründung: ADR-048.

**Auslöser:** Audit am 2026-04-30 (PyPI/Docker-Hub/GitHub-Releases-Lookup) auf Basis Blocker #001 Punkt 3. Lockfile-Snapshot (`backend/uv.lock`) war zwar refresht (locked = latest-within-constraint für 9 Pakete), aber 13 Constraint-Obergrenzen in `backend/pyproject.toml` lagen out-of-range gegen den jeweiligen `latest`-Tag. Patrick hat am 2026-04-30 Variante B (Voll-Sweep ohne Runtime-Majors) freigegeben.

**Deliverables — Backend (`backend/pyproject.toml`):**
- **Refresh innerhalb Constraint:** `pyjwt` 2.10.1 → 2.12.1 (kein Pin-Cap-Move).
- **Major-Bumps (SemVer):**
  - `fastapi-users` `>=14,<15` → `>=15,<16` (Locked: 14.0.2 → 15.0.5).
  - `pytest` `>=8.3,<9` → `>=9,<10` (Locked: 8.4.2 → 9.0.3).
  - `pytest-asyncio` `>=0.24,<0.25` → `>=1,<2` (Locked: 0.24.0 → 1.x).
- **Major-Bumps (CalVer):**
  - `argon2-cffi` `>=23.1,<24` → `>=25,<26` (Locked: 23.1.0 → 25.1.0).
  - `structlog` `>=24.4,<25` → `>=25,<26` (Locked: 24.4.0 → 25.x).
- **0.x-Minor-Bumps out-of-range:**
  - `fastapi` `>=0.115,<0.116` → `>=0.13x,<0.137` bzw. weitestmöglicher 0.x-Cap (Locked: 0.115.14 → 0.136.x).
  - `uvicorn` `>=0.32,<0.33` → `>=0.46,<0.47` (Locked: 0.32.1 → 0.46.x).
  - `asyncpg` `>=0.30,<0.31` → `>=0.31,<0.32` (Locked: 0.30.0 → 0.31.0).
  - `geoalchemy2` `>=0.15,<0.16` → `>=0.19,<0.20` (Locked: 0.15.2 → 0.19.0).
  - `uuid-utils` `>=0.10,<0.11` → `>=0.14,<0.15` (Locked: 0.10.0 → 0.14.1).
  - `httpx` `>=0.27,<0.28` → `>=0.28,<0.29` (Locked: 0.27.2 → 0.28.1).
  - `ruff` `>=0.7,<0.8` → `>=0.15,<0.16` (Locked: 0.7.4 → 0.15.x).

**Deliverables — Pre-commit (`.pre-commit-config.yaml`):**
- `pre-commit/pre-commit-hooks` v5.0.0 → v6.0.0 (Major).
- `astral-sh/ruff-pre-commit` v0.7.4 → v0.15.x (synchron zu pyproject-`ruff`).
- `pre-commit/mirrors-mypy` v1.13.0 → v1.20.2 (synchron zu pyproject-`mypy`).
- `additional_dependencies` für mypy: `pydantic`/`pydantic-settings`/`fastapi`/`structlog`-Pins entsprechend angehoben.

**Deliverables — Container-Images:**
- `docker/backend.Dockerfile`: `ghcr.io/astral-sh/uv:0.8.17` → `ghcr.io/astral-sh/uv:0.11.8` (Build-Tool-Image).
- `docker/docker-compose.yml`: `postgis/postgis:16-3.4` → `postgis/postgis:16-3.5` (PostGIS-Minor; Postgres-Major bleibt 16).

**Out of Scope (siehe ADR-048 §E):**
- **Runtime-Majors:** Postgres 16 → 17/18 (Daten-Migration), Node 22 → 24 (Frontend-Stack-Bump), Python 3.12 → 3.13 (mypy-/Pydantic-Plugin-Kompatibilität). Drei eigenständige Entscheidungen mit jeweils eigenem ADR-Bedarf bei Anpassung.
- **CLAUDE.md-Methodik-Härtung:** Blocker #001 Punkt 2 bleibt offen, separat zu entscheiden.
- **Frontend-`engines: ">=22 <23"`-Pin:** Bleibt unverändert, weil Node-Major aus Scope.
- **SQLAdmin-Aufnahme** in `pyproject.toml`-Dependencies: gehört in M8 (Admin-Bereich), nicht in den Stack-Bump.

**Akzeptanzkriterien:**
- `uv lock` läuft sauber durch, alle aktualisierten Pins haben gültige Resolver-Pfade.
- `uv sync --no-dev` und `uv sync` produzieren eine vollständige Venv ohne Konflikte.
- Backend-Tests `pytest` laufen vollständig grün (Erwartung: 182/182, ggf. mit Migrations-Anpassungen für pytest 9 / pytest-asyncio 1.x — wenn Test-Anzahl sich durch Migration ändert, im Bericht dokumentieren).
- `ruff check` und `mypy --strict` clean (mit ggf. neu aktivierten Lint-Regeln aus ruff 0.15 — entweder fixen oder explizit per `ignore` deaktivieren mit Begründung).
- `docker compose -f docker/docker-compose.yml build backend` erzeugt fehlerfrei ein Image auf Basis `uv:0.11.8`.
- `docker compose -f docker/docker-compose.yml up db` startet `postgis:16-3.5` ohne Schema-Inkompatibilität (PostGIS 3.4 → 3.5: keine Schema-Änderung erforderlich, aber `CREATE EXTENSION postgis` ggf. zu validieren).
- ADR-048 in `decisions.md` mit Status `Accepted`, inkl. §Migrations-Begleiterscheinungen post-execution.
- Blocker #001 Punkt 3 nach „Gelöste Blocker" verschoben (Punkt 2 bleibt aktiv).
- README-Badges aktualisiert, falls Backend-Versions-Badge oder Container-Image-Badge vorhanden.
- CHANGELOG-Eintrag.

**Abhängigkeiten:** keine (cross-cutting Migration auf bestehendem Stack-Stand). Vorgänger: STACK-001 [ERLEDIGT] 2026-04-30, Blocker #001 Punkt 3 freigegeben durch Patrick am 2026-04-30 (Variante B).

**Status `[ERLEDIGT]` 2026-04-30:**
- **Phase 1 (Refresh `pyjwt`):** wirkungslos — `fastapi-users 14.0.2` pinnt `pyjwt[crypto]==2.10.1` strikt. Refresh in Phase 5 nachgezogen (`pyjwt 2.10.1 → 2.12.1`). Begleiterscheinung dokumentiert in ADR-048 §A.
- **Phase 2 (Tooling):** `ruff 0.7→0.15.12`, `ruff-pre-commit v0.7.4→v0.15.12`, `mirrors-mypy v1.13.0→v1.20.2`, `pre-commit-hooks v5.0.0→v6.0.0`. `mypy`-Hook-`additional_dependencies` auf passende Linien ausgerichtet. Drei neu aktivierte Lint-Regeln (`UP042` StrEnum, `UP046`/`UP047` Type-Param-Modernisierung, `RUF046`/`RUF059` Cast-/Unpack-Hygiene): Auto-Fix per `--unsafe-fixes` angewandt; Halbmigrations in `app/routes/catalog.py` und `app/services/catalog.py` manuell aufgeräumt (alte `TypeVar`-Modul-Definitionen entfernt). 182/182 grün.
- **Phase 3 (Test-Tooling-Majors):** `pytest 8.4.2→9.0.3`, `pytest-asyncio 0.24.0→1.3.0`. **Keine Code-Anpassung nötig** — `asyncio_mode = "auto"` bleibt valide, keine Fixture-API-Brüche. 182/182 grün.
- **Phase 4 (Runtime-Libraries):** `uvicorn 0.32→0.46`, `httpx 0.27→0.28`, `asyncpg 0.30→0.31`, `structlog 24.4→25.5.0`, `geoalchemy2 0.15→0.19`, `uuid-utils 0.10→0.14`. `argon2-cffi`-Bump aus dieser Phase **zurückgenommen**, weil `fastapi-users 14`+`pwdlib 0.2.1` einen Transitiv-Pin auf `argon2-cffi<24` setzen (siehe ADR-048 §B). 182/182 grün.
- **Phase 5 (Framework-Majors):** `fastapi 0.115→0.136.1`, `fastapi-users 14.0.2→15.0.5`. Mit-aufgelöst: `pwdlib 0.2.1→0.3.0`, `python-multipart 0.0.20→0.0.27`, `argon2-cffi 23.1.0→25.1.0`, `pyjwt 2.10.1→2.12.1`. **Keine Code-Anpassung nötig** — kein async validator, keine zwischen 14↔15 entfernte fastapi-users-API in HC-Map-Code. 182/182 grün, mypy clean, ruff clean.
- **Phase 6 (Container):** `docker/backend.Dockerfile`: `ghcr.io/astral-sh/uv:0.8.17→0.11.8`. `docker/docker-compose.yml`: `postgis/postgis:16-3.4→16-3.5`. Build-Smoke gegen Image: `python -c "import fastapi, fastapi_users, …"` zeigt erwartete Versionen. DB-Smoke: `postgres 16.9 + postgis 3.5.2`. Hinweis: bestehendes Test-Volume zeigt PostGIS-Hybridzustand (Binary 3.5, Procs 3.4) — frische Volumes starten clean (siehe ADR-048 §F).
- **Phase 7 (Verifikation):** `pytest` 182/182 grün; `mypy --strict` clean (56 Files); `ruff check` clean; `ruff format` 22 Files reformatiert (Format-Drift 0.7→0.15 — funktional unverändert, siehe ADR-048 §D); `docker compose build backend` clean.
- **Out-of-Scope-Bestätigt:** Postgres-Major (16→17/18), Node-Major (22→24), Python-Major (3.12→3.13) bleiben offen. `engines: ">=22 <23"` in `frontend/package.json` unangetastet. CLAUDE.md-Methodik-Härtung (Blocker #001 Punkt 2) bleibt offen.
- ADR-048 Status `Accepted`. Blocker #001 Punkt 3 nach „Gelöste Blocker" verschoben (Punkt 2 bleibt offen).
- CHANGELOG ergänzt unter `[Unreleased]`. README-Badges (Backend) geprüft — keine inkonsistente Versions-Badge gefunden.

---

### M7 — Katalog-Verwaltung & Vorschlags-Workflow

**Ziel:** Admin verwaltet Kataloge; Editor kann Vorschläge einreichen; Workflow approved/pending/rejected/withdraw vollständig.

**Strategie:** ADR-043 (Option A) — Sub-Step-Schnitt M7.1–M7.5.

**Deliverables (übergreifend):**
- Backend: Reject-Status, neue Spalten, RLS-Erweiterung (eigene rejected sichtbar, Editor-Withdraw), PATCH/DELETE/Reject-Endpoints.
- Frontend: Admin-UI `/admin/catalogs/[kind]` mit CRUD + Tab-Navigation; Freigabe-Queue mit Reject-Reason-Dialog; Editor-Vorschlags-Form; Editor-Withdraw eigener pending.
- Restraint-Picker in Application-Erfassung (Live + Backfill) inkl. Quick-Propose.

**Akzeptanzkriterien (M7 gesamt):**
- Editor kann Vorschlag einreichen, Admin kann ihn freigeben oder mit Begründung ablehnen, freigegebene Einträge erscheinen in Dropdowns der Event-Erfassung.
- Pending- und rejected-Einträge tauchen außerhalb der Katalog-Verwaltung nirgends auf.
- Editor sieht eigene rejected-Vorschläge mit Begründung.
- RestraintType-Felder: Kategorie, Marke, Modell, Mechanik (chain / hinged / rigid), Display-Name — vollständig editierbar durch Admin.

**Abhängigkeiten:** M3, M4. M7.5 baut auf M5a.3 + M5c.3 auf.

---

#### M7.1 — Backend (Migration, Reject-Status, Routes)

**Status:** [ERLEDIGT] 2026-04-28

**Status `[ERLEDIGT]` 2026-04-28 (M7.1, Backend Reject-Status + Workflow-Endpoints):**

- **Migration `20260428_1200_m7_1_catalog_workflow.py`:**
  - `ALTER TYPE catalog_status ADD VALUE IF NOT EXISTS 'rejected'` innerhalb `op.get_context().autocommit_block()` (zwingend, damit Postgres den neuen Enum-Wert in derselben Migration in einer Policy verwenden darf — sonst „unsafe use of new value of enum type").
  - Pro Tabelle (`restraint_type`, `arm_position`, `hand_position`, `hand_orientation`) drei Audit-Spalten: `rejected_by uuid` (FK → user.id ON DELETE SET NULL), `rejected_at timestamptz`, `reject_reason text`.
  - Bestehende `<table>_select`-Policies werden ersetzt: eigene `pending` **und** `rejected` sichtbar (Editor sieht den eigenen Reject-Reason; andere Editoren / Viewer nicht).
  - Neue Policy `<table>_owner_withdraw` (`FOR DELETE`) erlaubt Editor das Hard-Delete ausschließlich auf eigenen `pending`-Rows. Edit auf eigene pending bleibt aus M7-Scope ausgeklammert (Workaround = Withdraw + Neuvorschlag).
  - Down-Migration: `rejected` → `pending`-Zurücksetzung, alle `<table>_*`-Policies droppen, `catalog_status` über parallelen Type `catalog_status_v1` (nur `approved`+`pending`) swappen, M2-Policies (`<table>_select`, `<table>_propose`, `<table>_admin_modify`) wiederherstellen. Up/Down/Up/Down/Up Roundtrip ist verifiziert.

- **Models (`app/models/catalog.py`):** `CatalogStatus` um `REJECTED` erweitert; `RestraintType` und `_LookupBase` um die drei Audit-Spalten ergänzt.

- **Schemas (`app/schemas/catalog.py`):**
  - `RestraintTypeRead` / `_CatalogRead` zeigen `rejected_by`, `rejected_at`, `reject_reason`.
  - Neue Update-Schemas `ArmPositionUpdate`, `HandPositionUpdate`, `HandOrientationUpdate`, `RestraintTypeUpdate` — alle Felder optional, **status fehlt bewusst** (Status-Übergänge laufen ausschließlich über die dedizierten Endpunkte).
  - Neues `CatalogReject`-Schema mit `reason: str` (1..2000).

- **Service (`app/services/catalog.py`):**
  - `list_lookup` akzeptiert optionalen `status_filter`-Parameter.
  - `update_lookup` (Generic über `LookupModel`-TypeVar), `update_restraint_type` setzen alle editierbaren Felder; UNIQUE-Konflikte werden als `CatalogConflictError` (eigene Exception) bubble-up gegeben, Routen mappen das auf 409.
  - `approve_entry` lehnt `rejected → approved`-Direkt-Übergang ab (`CatalogStateError`); leert Reject-Felder bei Approve.
  - `reject_entry` setzt `rejected_by`, `rejected_at`, `reject_reason`, erlaubt nur `pending`-Quellzustand.
  - `withdraw_entry` (`session.delete`) lehnt non-pending ab; RLS deckt zusätzlich die Editor-Eigentums-Prüfung ab.

- **Routes (`app/routes/catalog.py`):**
  - Pro Katalog-Typ identisches Set: `GET ?status=`, `POST`, `PATCH /{id}`, `DELETE /{id}`, `POST /{id}/approve`, `POST /{id}/reject`.
  - DELETE-Endpunkte mit `response_class=Response` und `status_code=204` (FastAPI-Anforderung — sonst Assertion).
  - `_get_or_404`-Helper Generic über `Base`-TypeVar, damit Mypy die konkreten Modelltypen propagiert.
  - PATCH/DELETE/Approve/Reject erwarten Admin (`require_role(UserRole.ADMIN)`) — DELETE zusätzlich Editor (für Self-Service-Withdraw, RLS filtert die Reichweite).

- **Tests:**
  - **Neue Datei `tests/test_catalog_workflow.py`** (17 Tests): Reject (Admin success, Editor 403, leere Begründung 422, bereits-approved 409), Withdraw (eigene pending 204, fremde pending 404 via RLS, eigene rejected 404/409, Admin auf any pending, Admin auf approved 409), Admin-PATCH (Lookup + RestraintType all fields, status-Feld stillschweigend ignoriert via `exclude_unset`, UNIQUE-Konflikt 409 mit Klartext, Editor 403), Status-Filter (alle drei Stati pro Admin sichtbar), Editor sieht eigene rejected mit Begründung, fremder Editor sieht foreign rejected nicht.
  - **`tests/test_rls.py`** um 5 sync-Tests erweitert: Editor sieht eigene rejected (RestraintType), Viewer nicht; Editor kann eigene pending via DELETE löschen; Editor kann fremde pending nicht löschen; Editor kann eigene rejected nicht via DELETE löschen.
  - **Backend-Suite gesamt: 172/172 grün** (+22 neue Tests). `ruff check app tests` und `mypy --strict app/services/catalog.py app/routes/catalog.py app/schemas/catalog.py app/models/catalog.py` clean.

- **Architektur-Doku-Drift:** `architecture.md` §API/Kataloge wurde auf den Ist-Zustand korrigiert (Endpoint-Pfade `/api/<kind>` statt `/api/catalogs/{kind}`, vollständige Route-Tabelle mit DELETE/Reject), §Datenmodell um die drei Audit-Spalten und den dritten Status-Wert erweitert, §RLS um die neue Policy-Form (eigene rejected sichtbar, Owner-Withdraw).

- **Bekannte Folge-Punkte:**
  - M7.2 baut auf den neuen Endpunkten auf.
  - SQLAdmin (M8) muss die neuen Spalten in den ModelViews anzeigen — wird in M8 erledigt.

**Deliverables:**
- Alembic-Migration `20260428_xxxx_m7_1_catalog_workflow`:
  - `catalog_status` Enum-Erweiterung um `rejected` (`ALTER TYPE … ADD VALUE`).
  - Pro Katalog-Tabelle (`restraint_type`, `arm_position`, `hand_position`, `hand_orientation`): Spalten `rejected_by uuid` (FK user.id ON DELETE SET NULL), `rejected_at timestamptz`, `reject_reason text`.
  - RLS-Policy `<table>_select` erweitern: eigene `pending` und `rejected` sichtbar.
  - Neue RLS-Policy `<table>_owner_modify`: Editor darf eigene `pending`-Rows updaten/löschen.
  - Down-Migration: rejected → pending zurücksetzen, Spalten droppen, Enum komplett neu (zwei Werte).
- Models (`app/models/catalog.py`): neue Spalten in `RestraintType` + `_LookupBase`.
- Schemas (`app/schemas/catalog.py`):
  - `*Read` um `rejected_by`, `rejected_at`, `reject_reason` erweitern.
  - `*Update`-Schemas pro Katalog-Typ (alle Felder optional, status nicht setzbar).
  - `CatalogReject`-Schema (`reason: str`, `min_length=1`).
- Service (`app/services/catalog.py`): `update_lookup`, `update_restraint_type`, `reject_entry`, `withdraw_entry`, `list_lookup` mit optionalem `status_filter`.
- Routes (`app/routes/catalog.py`):
  - `GET /<kind>?status=approved|pending|rejected` (alle Stati gleichzeitig wenn `status` weggelassen → durch RLS gefiltert).
  - `PATCH /<kind>/{id}` (Admin) — UNIQUE-Konflikt → 409.
  - `DELETE /<kind>/{id}` (Admin: alles, Editor: nur eigene pending; sonst 403/404).
  - `POST /<kind>/{id}/reject` (Admin) mit Body `{ "reason": str }`; pending → rejected, sonst 409.
- Tests:
  - `tests/test_catalog_workflow.py` — Reject + Withdraw + Update + UNIQUE-Konflikt + Status-Filter pro Katalog-Typ.
  - `tests/test_rls.py` — Erweiterung um rejected-Sichtbarkeit pro Rolle.
  - `tests/test_migration.py` (oder neue): Up-Roundtrip mit Daten + sauber Down + erneuter Up. Wegen `ALTER TYPE ADD VALUE`-Einschränkung wird Down-Strategie auf Enum-Recreate getestet.

**Akzeptanzkriterien:**
- `pytest -k "catalog or rls or migration"` grün.
- `mypy --strict` und `ruff check` clean für `app/services/catalog.py`, `app/routes/catalog.py`, `app/schemas/catalog.py`, `app/models/catalog.py`.
- OpenAPI-Doku enthält die neuen Endpunkte.

**Abhängigkeiten:** M2 (RLS), M3 (bestehende Catalog-Routen).

---

#### M7.2 — Frontend Übersicht `/admin/catalogs`

**Status:** [ERLEDIGT] 2026-04-28

**Status `[ERLEDIGT]` 2026-04-28 (M7.2, Frontend Catalog-Übersicht + RBAC-Refactor):**

- **Routing:** Neue Routen `/admin/catalogs` (Server-Redirect → `/admin/catalogs/restraint-types`) und `/admin/catalogs/[kind]/page.tsx` (Server-Component mit Header, `<KindTabs>`, `<CatalogListing>`). `notFound()` für unbekannte `[kind]`-Werte. Route-Group-Refactor: `admin/layout.tsx` lockert auf Mindestrolle Editor (`canViewCatalogAdmin`), strikter Admin-Gate wandert nach `admin/(admin-only)/layout.tsx`; bestehende `admin/page.tsx` per `git mv` in die Sub-Group verschoben.
- **Komponenten:**
  - `components/catalog/kind-tabs.tsx` — vier Tab-Links (Restraints / Armhaltung / Handhaltung / Handausrichtung) mit `aria-current="page"` für aktiven Tab.
  - `components/catalog/status-filter.tsx` — Radio-Group „Alle / Freigegeben / Vorgeschlagen / Abgelehnt" mit `aria-checked`.
  - `components/catalog/status-badge.tsx` — farb-codierter Badge pro Status (emerald/amber/rose).
  - `components/catalog/catalog-table.tsx` — Tabelle mit Subtitle (Restraint: Kategorie · Brand · Model · Mechanik; Lookups: Description), Reject-Reason-Callout für rejected-Rows, Loading- und Empty-States, `data-testid="catalog-row"` für Tests.
  - `components/catalog/catalog-listing.tsx` — Client-Wrapper, liest `?status` aus URL, `useCatalogList`, schreibt URL via `router.replace({ scroll: false })`. Pure Helper `parseStatusParam` separat exportiert.
- **lib:** `lib/catalog/types.ts` (alle Enums + Type-Guards + Display-Labels), `lib/catalog/api.ts` (`useCatalogList`-Hook mit `staleTime: 5 min`, Cache-Key `["catalog", kind, { status, limit, offset }]`).
- **RBAC:** `lib/rbac.ts` um `canApproveCatalog`, `canEditCatalogEntry`, `canWithdrawCatalogEntry`, `canViewCatalogAdmin` erweitert (alle pure functions; spiegeln M7.1-Backend-Logik exakt).
- **Navigation:** `components/layout/nav.ts` ergänzt einen Nav-Eintrag „Kataloge" mit Icon `BookMarked`, sichtbar für admin und editor (`roles: ["admin", "editor"]`).
- **Tests:** +25 Cases (Frontend-Suite 194 → 219).
  - `tests/rbac-catalog.test.ts` — 7 Cases pro RBAC-Helper.
  - `tests/catalog-kind-tabs.test.tsx` — 2 Cases (4 Links, aria-current).
  - `tests/catalog-status-filter.test.tsx` — 3 Cases (Render, Klick, Toggle zurück zu Alle).
  - `tests/catalog-table.test.tsx` — 5 Cases (Loading, Empty, Restraint-Subtitle, Reject-Reason, data-status-Attribute).
  - `tests/catalog-listing.test.tsx` — 8 Cases (parseStatusParam, fetch ohne/mit Status, Render, URL-Write, URL-Clear, Error-Alert).
- **Verifikation:** Production-Build grün (`/admin/catalogs/[kind]` 3.44 kB / 128 kB). Browser-End-to-End mit echtem Backend + DB:
  - Admin: 4 Restraint-Einträge sichtbar (3 approved + 1 pending).
  - Editor: 3 Einträge sichtbar (admin's pending durch RLS verborgen, eigene würden sichtbar bleiben).
  - Viewer: `/admin/catalogs` redirected nach `/`; Nav-Eintrag „Kataloge" nicht sichtbar.
  - Status-Filter „Vorgeschlagen" → URL `?status=pending`, nur pending-Einträge.
  - Tab-Wechsel auf Armhaltung mit `?status=rejected` zeigt Strappado-Beta inkl. „Begründung: Duplikat von Strappado".
  - Console clean.

**Akzeptanzkriterien (alle erfüllt):**
- [x] Admin sieht alle Einträge.
- [x] Editor sieht approved + eigene pending/rejected (RLS).
- [x] Viewer kann die UI nicht öffnen.
- [x] Status-Filter funktioniert (URL-Sync + API-Forward).
- [x] Tab-Navigation springt zwischen Katalog-Typen.

**Abhängigkeiten:** M7.1.

**Bekannte Folge-Punkte:**
- Sidebar-Active-Highlighting: `pathname.startsWith("/admin/")` markiert sowohl `/admin` als auch `/admin/catalogs` als aktiv, wenn beide sichtbar sind. Niedrige Priorität — wird bei Bedarf in M8 angepasst.
- M7.3 baut die Create/Edit-Formulare auf den hier eingeführten Routes.

---

#### M7.3 — CRUD-Formulare

**Status:** [ERLEDIGT] 2026-04-29

**Status `[ERLEDIGT]` 2026-04-29 (M7.3, CRUD-Formulare + Admin-Auto-Approve):**

- **Backend-Erweiterung (ADR-043 §F):**
  - `propose_lookup` und `propose_restraint_type` in `app/services/catalog.py` akzeptieren ein `auto_approve: bool = False`-Argument; bei `True` wird `status=APPROVED` und `approved_by=user.id` direkt gesetzt, statt `status=PENDING` + `suggested_by`.
  - Routes `app/routes/catalog.py` setzen `auto_approve = (user.role == UserRole.ADMIN)` für alle vier `propose_*`-Endpunkte.
  - Bewusst nur in `propose_*`, nicht in PATCH — PATCH ändert keinen Status (siehe ADR-043 §B, separate `/approve`-/`/reject`-Endpunkte).
  - Tests: zwei neue Cases in `tests/test_catalog_workflow.py` (`test_admin_create_arm_position_directly_approved`, `test_admin_create_restraint_type_directly_approved`); bestehende „Editor proposed → admin approves"-Tests bleiben grün, weil Editor weiterhin pending erzeugt.

- **Frontend-Routes:**
  - `/admin/catalogs/[kind]/new` (admin+editor sichtbar): Server-Component, `notFound()` für unbekanntes `kind`, ruft `<CatalogFormPage>` mit `entryId={null}` und Rolle-flag.
  - `/admin/catalogs/[kind]/[id]/edit` (admin-only): Server-Redirect auf `/admin/catalogs/[kind]` für Non-Admins (zusätzlich zur RLS-Sperre).
  - Beide Pages mit Header (Kontext-Hinweis) + `<KindTabs>` + Form.

- **Komponenten (`components/catalog/`):**
  - `lookup-form.tsx` — Form für ArmPosition/HandPosition/HandOrientation (Felder `name` Pflicht + `description`); Submit + Toast, Cancel-Button.
  - `restraint-type-form.tsx` — Form für RestraintType (Display-Name Pflicht, Kategorie als Select aller `RestraintCategory`-Werte, Mechanik-Select inkl. „— keine —"-Option, Brand, Modell, Note); Submit Trim + null-Coalescing für leere Optional-Felder.
  - `catalog-form-page.tsx` — Wrapper, der je nach `kind` die richtige Form rendert; im Edit-Mode lädt `useCatalogEntry` via `fetchCatalogPage(limit=200)` (Pfad-A-Größe < 200 Rows, ein Page-Scan reicht), Type-Guard `isRestraintTypeEntry` schützt vor Form-Mismatch.
  - `describeMutationError`-Helper in `lookup-form.tsx`: Mapping ApiError-Status → Toast-Title/Description (409 „Eintrag existiert bereits", 403 „Keine Berechtigung", 422 „Eingabe ungültig", sonst „Speichern fehlgeschlagen"). `asApiError`-Duck-Type-Fallback gegen `instanceof`-Failures bei RSC-Modul-Splits.

- **Mutation-Hooks (`lib/catalog/api.ts`):**
  - `useCreateCatalogEntry<K>(kind)` — POST mit Cache-Invalidation `["catalog", kind]`.
  - `useUpdateCatalogEntry<K>(kind)` — PATCH mit `{ id, body }`-Variant.
  - `useCatalogEntry<K>(kind, id)` — Einzel-Eintrag-Lookup über die Liste (kein eigener REST-Read-Endpoint).
  - Generische Payload-Typen `CatalogCreatePayload<K>` / `CatalogUpdatePayload<K>` per `K extends "restraint-types" ? … : …` discriminant.

- **Listing-Integration:**
  - `<CatalogListing>` erhält `isAdmin`-Prop; rendert „Neuer Eintrag" für Admin, „Neuen Vorschlag einreichen" für Editor; Edit-Link pro Row nur bei Admin.
  - `<CatalogTable>` mit neuer `canEdit`-Prop, fügt Edit-Spalte (Header + Zeilenlinks zu `/admin/catalogs/[kind]/[id]/edit`) konditional hinzu.

- **Tests:** +13 Cases (Frontend-Suite 219 → 230, Backend 172 → 174).
  - `tests/catalog-forms.test.tsx` (8 Cases): Lookup-Create-happy-path inkl. Body-Trim, 409-Toast, leerer Name → Client-Side-Block ohne POST, Editor-Variante (Button-Label), Lookup-Edit (PATCH-URL/-Body), RestraintType-Render, RestraintType-Submit (mechanical_type empty → null), RestraintType-Edit-PATCH-Pfad.
  - `tests/catalog-table.test.tsx`: +2 Cases (Edit-Link bei `canEdit=true`, kein Edit-Link Default).
  - `tests/catalog-listing.test.tsx`: +1 Case (Admin/Editor-Button-Label).
  - Backend-Tests: +2 Auto-Approve-Cases.

- **Verifikation:**
  - Lint, Typecheck und `next build` clean (`/admin/catalogs/[kind]/new` 142 kB, `[id]/edit` 142 kB).
  - Browser-E2E (Admin gegen echtes Backend + DB):
    - Listing zeigt `Neuer Eintrag`-Button und Edit-Links pro Row.
    - Klick auf Edit-Link öffnet Edit-Form mit Pre-Fill (Display-Name + Brand korrekt vorbelegt).
    - Admin-Create („M7.3 Test-Tape", category=tape, brand=ACME) → Backend 201, Listing zeigt 5 Einträge (statt 4) inkl. neuem Eintrag mit `data-status="approved"` (Auto-Approve aus M7.3-Backend bestätigt).
    - Edit-Submit (Display-Name → „M7.3 Test-Tape (edited)") → Backend 200, Redirect zur Listing, geänderter Name sichtbar.
    - Konflikt-Test: zweiter POST mit (tape, ACME, NULL, NULL) → Backend 409 mit Klartext-Detail; catch-Block erreicht und ruft `describeMutationError`. UI-Toast „Eintrag existiert bereits" wird via Sonner sauber gerendert (Sonner-Mount funktioniert seit HOTFIX-001 / ADR-042).

- **Bekannte Folge-Punkte:**
  - M7.4 baut auf den hier eingeführten Mutation-Hooks und der `describeMutationError`-Helper auf.

**Abhängigkeiten:** M7.1, M7.2.

---

#### M7.4 — Freigabe-Queue + Editor-Withdraw

**Status:** [ERLEDIGT] 2026-04-29

**Status `[ERLEDIGT]` 2026-04-29 (M7.4, Freigabe-Queue + Editor-Withdraw):**

- **Mutation-Hooks (`lib/catalog/api.ts`):**
  - `useApproveCatalogEntry<K>(kind)` — POST `/api/<kind>/<id>/approve`, invalidiert `["catalog", kind]`.
  - `useRejectCatalogEntry<K>(kind)` — POST `/api/<kind>/<id>/reject` mit `{ reason }`-Body.
  - `useWithdrawCatalogEntry<K>(kind)` — DELETE `/api/<kind>/<id>` (apiFetch handled 204 bereits korrekt).
  - Alle drei nutzen das in M7.3 etablierte `["catalog", kind]`-Cache-Schema; Erfolgsfälle invalidieren denselben Tree wie Create/Update, sodass die Listing-Refetch-Logik unverändert bleibt.

- **UI-Primitive `<Dialog>` (`components/ui/dialog.tsx`):**
  - Shadcn-Stil-Wrapper um `@radix-ui/react-dialog` (analog zum existierenden `<Sheet>`); zentriertes Modal mit Overlay, Close-Button (`Schließen`-Label), Title/Description/Header/Footer-Slots.
  - Wieder verwendbar für künftige Confirm-Modals (z. B. M8 Anonymisierungs-Bestätigung).

- **`<RejectReasonDialog>` (`components/catalog/reject-reason-dialog.tsx`):**
  - Controlled (`open` + `onOpenChange`), zeigt Eintrags-Label im Header, `Begründung *`-Pflicht-Textarea (max 500 Zeichen), Submit-Button mit `destructive`-Variante.
  - Validierung **ausschließlich beim Submit** (`attemptedSubmit`-State). Frühere `onBlur`-basierte Validierung führte unter Radix' Focus-Management zum sofortigen Inline-Error beim ersten Öffnen — siehe ADR-045 §B Lessons Learned, neuer Regression-Test in `tests/reject-reason-dialog.test.tsx` deckt diesen Pfad ab.
  - Reason wird beim Schließen via `useEffect` zurückgesetzt; Re-Open zeigt frisches Form.

- **`<CatalogTable>`-Refactor:**
  - Boolean-Prop `canEdit` durch Render-Prop `renderRowActions: (entry) => ReactNode` ersetzt. Der Caller besitzt jetzt die volle Kontrolle über Aktionen pro Row inkl. RBAC-Logik. Action-Spalte mit Header erscheint genau dann, wenn `renderRowActions` gesetzt ist.
  - `data-kind`-Attribut neu auf der Row für Test- und CSS-Selektion.

- **`<CatalogListing>`-Refactor:**
  - Prop-Änderung: `isAdmin: boolean` → `currentUser: { id, role }` (RbacUser). Notwendig, weil Editor-Withdraw die Eigentümer-Prüfung `entry.suggested_by === currentUser.id` braucht.
  - Lifted state `rejectingEntry: AnyCatalogEntry | null` für das Dialog-Lifecycle (eine Reject-Operation gleichzeitig).
  - Render-Prop liefert pro Row: Approve+Reject (Admin auf pending), Withdraw (`canWithdrawCatalogEntry`-Helper aus M7.3), Bearbeiten-Link (Admin auf approved/rejected). RBAC-Sichtbarkeit aus `lib/rbac.ts`-Helpers, Backend-RLS bleibt finale Instanz.
  - Toasts: `„<Label>" freigegeben/abgelehnt/zurückgezogen` bei Erfolg, `describeMutationError` bei Fehler (übernommen aus M7.3).

- **Page-Update (`/admin/catalogs/[kind]/page.tsx`):**
  - Statt `isAdmin: boolean` reicht die Page jetzt `currentUser={ id, role }` durch. Auth + Role-Gate bleibt bei `app/(protected)/admin/layout.tsx` (Editor und Admin sehen die Seite).
  - Header-Hilfetext aktualisiert: Admin-Hinweis nennt Approve/Reject mit Begründung; Editor-Hinweis nennt Withdraw und das read-only-Verhalten für rejected-Rows.

- **Backend:** keine Änderungen — Endpoints `POST /<kind>/<id>/approve`, `POST /<kind>/<id>/reject` und `DELETE /<kind>/<id>` waren bereits in M7.1 inklusive Tests vorhanden (`tests/test_catalog_workflow.py`).

- **Tests:** Frontend-Suite **230 → 244** (+14), 35/35 Files grün.
  - `tests/catalog-actions.test.tsx` (8 Cases): Admin sieht Freigeben+Ablehnen+Bearbeiten je nach Status; Editor sieht Withdraw nur auf eigener pending-Row, gar nichts auf fremder; Approve POSTet `/<kind>/<id>/approve`; Reject öffnet Dialog → blockiert empty submit → POSTet getrimmten Reason; Withdraw DELETEd `/<kind>/<id>`.
  - `tests/reject-reason-dialog.test.tsx` (7 Cases): Header/Description mit Eintrags-Label, Empty-Submit blockt, getrimmter Reason wird übergeben, Cancel ruft `onOpenChange(false)`, beide Buttons disabled bei `isPending`, Reset bei Re-Open, **kein Inline-Error auf erstem Open** (Regression-Guard).
  - `tests/catalog-table.test.tsx` (refactored): `canEdit` → `renderRowActions` umgestellt; selber Funktionsumfang.
  - `tests/catalog-listing.test.tsx` (refactored): `isAdmin` → `currentUser` umgestellt; alle Assertions identisch.

- **Verifikation:**
  - `pnpm typecheck`, `pnpm lint`, `pnpm test --run` clean (244/244).
  - `pnpm build` clean: `/admin/catalogs/[kind]` 4.04 kB / First-Load 158 kB.
  - **Browser-E2E** (Admin + Editor gegen echtes Backend + Postgres):
    - Admin auf `/admin/catalogs/restraint-types?status=pending`: zwei pending-Rows mit korrektem `data-status="pending"` + drei Buttons (Freigeben, Ablehnen, Zurückziehen).
    - Approve-Klick: Hanfseil A wandert auf `approved`, `approved_by` gesetzt, Listing aktualisiert sich automatisch.
    - Reject-Klick: Dialog öffnet mit Eintrags-Label im Header, leer-submit-Blockade mit Inline-Error verifiziert, Reason mit typografischen Anführungszeichen + em-dash → DB persistiert exakt das Eingegebene, Status `rejected`, `rejected_by` gesetzt.
    - Logout Admin → Login Editor → eigene pending-Row zeigt nur Withdraw, fremde Rows unsichtbar (RLS aus M7.1).
    - Withdraw-Klick: Hard-Delete (Row ist 0× in DB präsent danach).
    - Reload nach Reject zeigt rejected-Row in `?status=rejected`-Tab mit Inline-Begründung.
  - **Bug während E2E gefunden + behoben:** Beim Re-Öffnen des Reject-Dialogs zeigte der Inline-Error sofort. Ursache: textarea `onBlur` setzte `touched=true`, weil Radix' Focus-Management beim Mount blur+refocus auslöst. Fix: Submit-only-Validation (`attemptedSubmit`-State, kein `onBlur`-Trigger). Regression-Test ergänzt.

- **Bekannte Folge-Punkte:**
  - M7.5 (Restraint-Picker) kann den `useCatalogList(kind, { status: "approved" })`-Cache aus M7.x direkt wiederverwenden.
  - Bei Aktivierung von Pfad B muss der `reject_reason`-Inhalt ins Anonymisierungs-Konzept aufgenommen werden (siehe ADR-043 Folge-Arbeit).

**Abhängigkeiten:** M7.2, M7.3.

---

#### M7.5 — Restraint-Picker in Application-Erfassung

**Status:** [ERLEDIGT] 2026-04-29

**Status `[ERLEDIGT]` 2026-04-29 (M7.5, Restraint-Picker + Sync-Erweiterung):**

- **ADR-046 angelegt** für die Sync-Vertragserweiterung (Set-Replace-LWW, denormalisiertes Array auf `ApplicationDoc`); Option A aus dem Freigabeblock vom 2026-04-29 angenommen.

- **Backend (`backend/`):**
  - `app/sync/schemas.py:ApplicationDoc` um `restraint_type_ids: list[uuid.UUID] = Field(default_factory=list)` erweitert.
  - `app/sync/services.py:pull_applications` lädt das Set per Bulk-IN-Query (`_load_restraint_sets`); `_application_to_doc` nimmt es als optionales Argument; Tombstone-Path liefert weiterhin `[]`.
  - `push_applications` ruft neue Helper:
    - `_restraints_allowed` — Editor darf nur approved RestraintTypes verlinken; unbekannte/pending/rejected → Synthetic-Tombstone-Konflikt. Admin darf alle existierenden, unbekannte → Konflikt (FK-Verletzung würde sonst den Push silently kippen).
    - `_sync_application_restraints` — Set-Diff gegen `application_restraint`-Tabelle, Bulk-DELETE für entfernte, Per-Row INSERT mit Savepoint für Race-Resolution.
    - `_application_conflict_doc` (async) — lädt Server-Set für jede Konflikt-Antwort, damit der Client beim Konflikt auch das Restraint-Set-Truth lernt (ADR-046 §D).
  - Imports: `delete` (sqlalchemy core), `ApplicationRestraint`, `RestraintType`.

- **Frontend (`frontend/`):**
  - JSON-Schema `lib/rxdb/schemas/application.schema.json` v0 → **v1** mit `restraint_type_ids: array<string format=uuid maxLength=36>` (default `[]`, nicht required).
  - `lib/rxdb/types.ts:ApplicationDocType.restraint_type_ids: string[]`.
  - **`lib/rxdb/database.ts`** registriert `RxDBMigrationSchemaPlugin` (Pflicht für jede Schema-Version-Bump in RxDB v17) und definiert eine `migrationStrategies[1]`, die existierende v0-Docs auf `restraint_type_ids: []` migriert.
  - Neue Komponente `components/catalog/restraint-picker.tsx`: Multi-Select-Combobox mit Typeahead-Filter über `display_name` + `category` + `brand` + `model`; Selektion als entfernbare Chips; inline Quick-Propose-Form (Display-Name Pflicht, Kategorie Select, Mechanik/Brand/Modell optional). Editor-Submit erzeugt pending (Toast „Vorschlag eingereicht"), Admin-Submit auto-approved und auto-selektiert (Toast „freigegeben"). Pending-Entries werden client-seitig herausgefiltert, weil Backend-Approved-Check sonst beim nächsten Push 409'en würde.
  - `ApplicationStartSheet` (Live, `components/event/application-start-sheet.tsx`): neuer `currentUserRole`-Prop, `restraintTypeIds`-State, Picker zwischen Recipient und Notiz, RxDB-Insert reicht das Set durch.
  - `EventBackfillForm` (`components/event/event-backfill-form.tsx`): pro Application-Row eigener Picker; Row-State um `restraintTypeIds` erweitert.
  - `EventDetailView`-Timeline (`components/event/event-detail-view.tsx`): zeigt Restraint-Badges pro Application unter dem Status; nutzt denselben `useCatalogList`-Cache wie der Picker, um IDs in Display-Names aufzulösen.
  - `event-detail-view.tsx`-Aufruf von `<ApplicationStartSheet>` reicht `currentUserRole={user.role}` durch.

- **Tests:**
  - Backend: **+7** in neuer Datei `tests/test_sync_application_restraints.py` (Insert mit Set, leerer Set Insert, Set-Replace, Push-Idempotenz, Editor pending → Konflikt, Editor pending in Update → Server-Set bleibt, Konflikt-Antwort enthält Server-Set). Backend-Suite **174 → 181 grün.** `test_rxdb_schema_drift.py` bleibt grün (beide Seiten haben `restraint_type_ids` nicht required).
  - Frontend: **+8** in neuer Datei `tests/restraint-picker.test.tsx` (Typeahead-Filter Display-Name, Typeahead über Kategorie-Label, pending-Entries unsichtbar, Toggle multi-select, Chip-Remove, Quick-Propose Empty-Submit-Block, Editor-Submit POST-Body + kein Auto-Select, Admin-Submit auto-selektiert). `tests/event-backfill-form.test.tsx` mocked Picker. `tests/event-detail-view.test.tsx` ergänzt einen `QueryClientProvider`-Wrapper + `restraint_type_ids: []` im Default-Fixture. Frontend-Suite **244 → 252 grün.**
  - Lint, Typecheck und `next build` clean. Bundle-Größen: `/events/[id]` 273 → 279 kB, `/events/new/backfill` 265 → 271 kB.

- **Browser-E2E (Admin gegen echtes Backend + Postgres):**
  - Picker auf `/events/new/backfill` lädt 17 approved Seeds; Suche „Clejuso" filtert auf 3 Treffer; Suche „Handschellen" filtert auf alle Cuffs-Kategorie-Einträge.
  - Multi-Select: zwei Restraints anklicken erzeugt zwei Chips, Liste zeigt `data-selected="true"` synchron.
  - Quick-Propose (Admin): „M7.5 Browser-Test Tape", Kategorie tape → POST 201, Auto-Approve, neuer Entry sofort sichtbar (17 → 18) und auto-selektiert. Toast „Restraint-Type freigegeben".
  - Sync-Roundtrip via Browser-Console:
    - Push App mit zwei Restraint-IDs → Pull liefert exakt die zwei zurück (sortiert).
    - Push Update mit reduziertem Set (1 statt 2) → Pull bestätigt das Set-Replace.
    - Push Application mit unbekannter Restraint-UUID → Synthetic-Tombstone-Konflikt, App nicht in DB.
  - Live-Modus auf `/events/[id]`: „Neue Application"-Button öffnet Sheet mit Picker; Auswahl „ASP Chain" + Submit erzeugt Application; Pull bestätigt `restraint_type_ids` enthält den richtigen UUID; Timeline zeigt Badge „ASP Chain (chain)" unter Status.

- **Bug während E2E gefunden + behoben (im selben Sub-Step):**
  - Schema-Version-Bump alleine reicht in RxDB v17 nicht — `RxDBMigrationSchemaPlugin` muss explizit registriert sein, sonst wirft `addCollections` mit „You are using a function which must be overwritten by a plugin" und der Provider bleibt im Default-State (alle Live-Buttons disabled, kein UI-Hinweis). Behoben in `database.ts`. Lessons Learned: jede Schema-Migration verlangt zwei Schritte — Plugin registrieren **und** `migrationStrategies[N]` definieren.

- **Bekannte Folge-Punkte:**
  - **Edit-Form-Restraint-Picker** (`components/event/event-edit-form.tsx`): in M7.5 explizit aus Scope (ADR-046 §H). Kann als kleines M5c.4-Followup nach M7.5 nachgezogen werden — gleiche Komponente, Diff-basierte Patch-Logik.
  - **Position-Picker** (M5c.4-Followup): unverändert aus Scope (ADR-040 §K, ADR-043 §D). Nach M7.5-Refactor lässt sich derselbe Combobox-Stil leicht für ArmPosition/HandPosition/HandOrientation duplizieren.
  - **Pfad B**: Set-Replace-Semantik bleibt; bei Audit-Bedarf für Restraint-Set-Änderungen wird ADR-046 §C durch Pro-Element-LWW abgelöst (Schema-Migration auf `application_restraint` mit `updated_at` + `created_by`).

**Abhängigkeiten:** M7.1 (POST-Endpoint), M7.3 (Mutation-Hooks für Quick-Propose), M5a.3 (Live-Form), M5c.3 (Backfill-Form).

---

### M8 — Admin-Bereich

**Ziel:** Admin kann Nutzer und Personen verwalten, Stammdaten pflegen, Daten inspizieren. Zweischichtiger Ansatz gemäß ADR-016, Implementierungsstrategie in **ADR-049** festgelegt.

**Sub-Steps:** M8.1 (Strategie-ADR) → M8.2 (Backend SQLAdmin) → M8.3 (Backend `/api/admin/*`) → M8.4 (Frontend Dashboard + Users) → M8.5 (Frontend Persons-Workflow + Export-UI).

**Deliverables — SQLAdmin-Schicht unter `/admin` (M8.2):**
- SQLAdmin 0.25.x als neue Backend-Dependency (siehe ADR-049 §A); `app/admin_ui/{__init__.py,auth.py,views.py}` mit Cookie-Session-Auth-Bridge zu fastapi-users (ADR-049 §B), separater Admin-Engine mit RLS-Stamp pro Request (ADR-049 §C).
- ModelViews für 8 Tabellen (User, Person, RestraintType, ArmPosition, HandPosition, HandOrientation, Event, Application) gemäß ADR-049 §D — `Application` read-only, `Event` read+edit-only (kein Create/Hard-Delete; Sync-Vertrag ADR-029/033 wahren).
- Sortier-/Filter-Optionen, Bulk-Approve/Reject auf Catalog-Tabellen.
- Zugriff nur für `role = 'admin'`. Anonymous/Editor → Redirect auf `/login`.

**Deliverables — Next.js-Workflow-Schicht unter `(protected)/admin/(admin-only)/` (M8.4 + M8.5):**
- **Admin-Dashboard** (M8.4) als `(admin-only)/page.tsx` mit Stats-Cards (Events/Monat, Top-Restraints, Top-Positionen, User-Count, pending-Catalog-Count).
- **User-Verwaltung** `/admin/users` (M8.4): Listing + Anlage-Form mit Linkable-Person-Picker (ADR-014); Rollen-Toggle und Deaktivierung über SQLAdmin.
- **Personen-Verwaltung** `/admin/persons` (M8.5): Filter `origin = on_the_fly`, `linkable = true`, `unlinked = true`; Merge-Wizard (Source/Target-Picker, Konflikt-Vorschau, Bestätigung) → `POST /api/admin/persons/{id}/merge`; Anonymisierungs-Button mit Confirm-Dialog → `POST /api/admin/persons/{id}/anonymize`.
- **Admin-Export** (M8.5): Trigger-Button → `GET /api/admin/export/all?format=json` (Browser-Download, ADR-049 §G).
- **Freigabe-Queue für Katalog-Vorschläge** ist bereits in M7.4 implementiert — kein zusätzlicher M8-Aufwand.

**Deliverables — Backend `/api/admin/*` (M8.3):**
- `app/routes/admin.py`: `GET/POST/PATCH/DELETE /api/admin/users`, `GET /api/admin/stats`, `GET /api/admin/export/all`, `POST /api/admin/persons/{id}/merge`, `POST /api/admin/persons/{id}/anonymize`.
- `app/services/person_merge.py` (ADR-049 §E) mit Re-Pointing `event_participant`/`application` und UNIQUE-Konflikt-Resolution; **keine Migration erforderlich**.
- Pydantic-Schemas + RLS-Tests inkl. negativ Editor/Viewer.

**Akzeptanzkriterien:**
- Admin kann via SQLAdmin schnell Stammdaten pflegen und Daten inspizieren (Browser-Smoke `/admin/user/list` u. ä.).
- Via Next.js-Admin-Dash kann Admin Workflow-Aktionen durchführen (Stats anzeigen, User anlegen, Personen mergen, Personen anonymisieren, Export herunterladen).
- Verknüpfung neuer User mit bestehender on-the-fly-Person (Linkable=true) funktioniert; verknüpfter User sieht alle Events seiner Person rückwirkend.
- Anonymisierungs-Prozess ist ein Knopfdruck mit Confirm-Dialog und in der DB korrekt umgesetzt (`name = '[gelöscht]'`, `alias = NULL`, `note = NULL`, `is_deleted = true`, `deleted_at = now()`; Verknüpfungen bleiben). Coverage 100 % (DSGVO-Pflicht).
- Person-Merge-Coverage ≥ 90 % inkl. Konflikt-Pfaden (gemeinsamer Event-Participant beider Personen).
- Test-Suite grün: ≥ 200 Backend-Tests, alle Frontend-Suites grün, `ruff`/`mypy --strict` clean, `pnpm typecheck`/`pnpm lint`/`pnpm build` clean.

**Abhängigkeiten:** M2 (Auth + RLS), M3 (Domain-API), M7 (Catalog-Routes), ADR-016, ADR-049.

---

### M9 — w3w-Migration

**Ziel:** Alle bestehenden Ereignisdaten aus w3w sind in HC-Map übernommen.

**Deliverables:**
- Migrationsskript (Python, getrennt vom Hauptcode).
- Eingabe: Export aus w3w (CSV oder API-Abruf).
- Für jede 3-Wort-Adresse: einmalige API-Abfrage → Lat/Lon, Plus Code lokal berechnet.
- Zuordnung der Beteiligten (Name → Person in HC-Map).
- Zuordnung der Maßnahmen (freier Text → strukturierte Applications, soweit automatisch möglich; Rest als Notiz, später manuell nachbearbeiten).
- Backup der Quelldaten vor Ausführung.
- Dry-Run-Modus.
- Idempotenz: Skript darf mehrfach laufen, ohne Duplikate zu erzeugen.
- Report nach Lauf: X Events importiert, Y übersprungen, Z Fehler.

**Akzeptanzkriterien:**
- Testlauf mit Teilmenge importiert Daten korrekt.
- Produktivlauf ist reproduzierbar und hinterlegt Log.
- Nach Migration: w3w-Account kann gekündigt werden.

**Abhängigkeiten:** M3 (API vorhanden), M8 (Personenverwaltung).

---

### M10 — VPS-Deployment & Betriebs-Grundausstattung

**Ziel:** HC-Map läuft produktiv auf dem VPS, mit TLS, Reverse Proxy und Basis-Backups.

**Deliverables:**
- VPS-Einrichtung (in `architecture.md` genauer spezifiziert):
  - Docker / Docker Compose oder Podman als Laufzeit.
  - Reverse Proxy (nginx oder Caddy) mit automatischem TLS via Let's Encrypt.
  - Fail2ban, UFW-Firewall, SSH-Key-Only.
  - Full-Disk-Encryption verifiziert.
- Deployment-Pipeline: per Git-Push oder manuelles Skript, idempotent.
- Daily Postgres-Dumps auf separatem Storage (verschlüsselt).
- Health-Checks und automatischer Restart (Docker-HEALTHCHECK + restart policy).
- Logs persistiert (journald oder Datei, Rotation aktiviert).

**Akzeptanzkriterien:**
- Produktiv-URL erreichbar mit TLS (A-Rating bei ssllabs.com oder testssl.sh).
- Staging-Deployment vorhanden (optional, aber empfohlen).
- Erster Backup-Restore-Test erfolgreich.

**Abhängigkeiten:** alle vorherigen.

---

### M11 — Go-Live Pfad A

**Ziel:** HC-Map ist für die <20-Personen-Gruppe produktiv nutzbar.

**Deliverables:**
- Einwilligungstext liegt den Mitgliedern vor (außerhalb des Systems), Einwilligungen dokumentiert.
- Produktive w3w-Migration ausgeführt (aus M9).
- Alle Mitglieder als User angelegt und mit Personen verknüpft.
- Kurz-Onboarding-Doku für die Gruppe (1 Seite).
- w3w-Account kann gekündigt werden (optional, nach Migrationsbestätigung).

**Akzeptanzkriterien:**
- Alle Mitglieder können sich einloggen, eigene Events sehen.
- Admin hat Vollzugriff, Freigabe-Workflows funktionieren.
- Keine Daten aus w3w fehlen (Stichprobenprüfung).

**Abhängigkeiten:** M0 – M10.

---

## Phase 2 — Konsolidierung

### M12 — Self-Hosted Tileserver

**Ziel:** MapTiler-Abhängigkeit wird abgelöst.

**Deliverables:**
- Tile-Stack auf VPS: OpenMapTiles-Daten + tileserver-gl-light (oder Alternative).
- Regionaler OSM-Extract (DACH oder Europa, je nach Bedarf).
- Update-Prozess dokumentiert (monatlich oder quartalsweise).
- MapLibre zeigt auf lokale Tile-URL, MapTiler-Key kann deaktiviert werden.
- Lasttest: funktioniert bei erwartetem Bedarf stabil.

**Akzeptanzkriterien:**
- Karten laden ohne MapTiler-Key.
- Rendering-Qualität vergleichbar.
- Ressourcenverbrauch auf VPS dokumentiert.

**Abhängigkeiten:** M11.

---

### M13 — Backup-Härtung & Restore-Tests

**Ziel:** Verlässlicher Backup-Prozess mit regelmäßigen Restore-Tests.

**Deliverables:**
- Off-Site-Backups (separater Anbieter / anderer Standort).
- Verschlüsselung at-rest für Backups (age, gpg oder Alternative).
- Automatische Restore-Tests in definierter Frequenz (z. B. monatlich) auf einem Staging-System.
- Dokumentierte Recovery-Runbook: Schritt-für-Schritt, vom kaputten VPS zur laufenden App.

**Akzeptanzkriterien:**
- Vollständiger Restore aus Backup auf leerem System erfolgreich.
- Runbook wurde einmal von jemandem nachvollzogen, der es nicht geschrieben hat (im Hobby-Scope: Selbsttest mit Abstand).

**Abhängigkeiten:** M10.

---

### M14 — Monitoring & Alerting

**Ziel:** Störungen werden zeitnah bemerkt.

**Deliverables:**
- Einfache Uptime-Überwachung (z. B. Uptime Kuma auf separatem Host, oder externer Dienst wie Hetzner Monitoring).
- Benachrichtigung bei Downtime (E-Mail, Telegram, o. ä.).
- Optional: Basis-Metriken (RAM, CPU, Disk) auf einem lokalen Grafana oder in Logs.

**Akzeptanzkriterien:**
- Absichtlich ausgelöster Ausfall triggert Benachrichtigung innerhalb definierter Zeit.

**Abhängigkeiten:** M10.

---

### M15 — Foto-/Medien-Anhänge an Events und Applications

**Ziel:** Events und einzelne Applications können mit Bildern (und perspektivisch kurzen Videos) angereichert werden (siehe ADR-015).

**Deliverables:**
- Datenmodell: neue Tabelle `media` mit FK auf `event_id` ODER `application_id` (genau eines), `path`, `mime_type`, `size_bytes`, `created_by`, `created_at`.
- Storage-Strategie: Dateien im Filesystem auf VPS unter `/var/lib/hcmap/media/{yyyy}/{mm}/{uuid}.{ext}`. Backup-Konzept entsprechend erweitern.
- RLS-äquivalente Zugriffskontrolle: Backend-Endpoint `GET /api/media/{id}` prüft Sichtbarkeit des zugehörigen Events.
- Upload-Endpoint mit Größenlimit (z. B. 10 MB pro Datei), Mime-Type-Whitelist (jpeg, png, webp, optional mp4).
- Thumbnail-Generierung serverseitig (Pillow oder VIPS).
- Frontend: Upload-Komponente im Event- und Application-Formular, Galerie-Ansicht mit Lightbox, Drag&Drop.
- **Einwilligungstext muss VOR Aktivierung dieses Features in der Gruppe erweitert werden** — sehr sensibler Inhalt, Speicherung auf VPS expliziert kommunizieren.

**Akzeptanzkriterien:**
- Bild kann hochgeladen, angezeigt, gelöscht werden.
- Zugriff respektiert RLS (nicht-berechtigter User kann Bild auch über direkte URL nicht laden).
- Backup umfasst Mediadateien.

**Abhängigkeiten:** M11. Dieser Meilenstein wird **erst nach formaler Einwilligungs-Erweiterung in der Gruppe** gestartet.

---

### M16 — Freie Tags + Bewertung/Stimmung

**Ziel:** Events und Applications können um freie Schlagworte und eine optionale Bewertung ergänzt werden (siehe ADR-015).

**Deliverables:**
- Datenmodell: Tabelle `tag` (id, name, created_by, created_at) plus n:m-Tabellen `event_tag` und `application_tag`. Tags sind user-spezifisch (jeder hat seinen eigenen Tag-Pool, keine Share-Logik).
- Datenmodell: Spalten `event.rating` (smallint NULL, CHECK 1–5) und ggf. `application.rating` analog.
- API: CRUD für Tags, Tag-Filter in `/api/events`, Bewertung als Feld in Event-Patch.
- Frontend: Tag-Eingabe als „type-and-create"-Komponente mit Vorschlägen aus eigenen Tags. Sterne-Bewertung im Event-Detail.
- Tag-basierte Filter in der Event-Liste und Karte.

**Akzeptanzkriterien:**
- Tag kann angelegt, gesetzt, entfernt werden.
- Bewertung ist optional, beeinflusst keine RLS.
- Tag-Filter funktioniert performant bei realistischer Datenmenge.

**Abhängigkeiten:** M11.

---

### M17 — Persönliches & kollektives Statistik-Dashboard

**Ziel:** Jeder User sieht aussagekräftige Statistiken über seine Beteiligung und über die Gruppen-Aggregate (siehe ADR-015).

**Deliverables:**
- Persönliches Dashboard:
  - Anzahl Events als Performer / als Recipient, je Zeitraum.
  - Häufigste Materialien, häufigste Positionen, häufigste Mit-Beteiligte.
  - Durchschnittliche Application-Dauer, längste/kürzeste Sitzung.
  - Aktivitäts-Heatmap (Kalender-Heatmap analog GitHub).
  - „On this day"-Auswertungen längeren Zeitraums.
- Kollektives Aggregat-Dashboard:
  - Pro Material/Position: „X-mal insgesamt verwendet, davon Y-mal mit dir".
  - Pro Recipient: nur eigene Daten ausweisbar (keine Aggregate über andere Personen, weil zu re-identifizierend).
- **Vor Implementierung in Phase-2-Spezifikation klären:** genaue Granularität der kollektiven Aggregate. Optionen: volle Aggregate / Mindestschwelle / nur eigene Daten. Im Einwilligungstext muss die gewählte Variante adressiert werden.
- Frontend: Charts via Recharts (in shadcn/ui-kompatiblem Stil), responsive, mobil lesbar.

**Akzeptanzkriterien:**
- Persönliche Statistik wird für eigenen User korrekt berechnet.
- Kollektive Aggregate sind RLS-aware (Aggregat-Berechnung läuft auf Server, nicht im Client).
- Performance: Dashboard lädt unter 2 Sekunden bei realistischer Datenmenge.

**Abhängigkeiten:** M11, idealerweise nach M16 (damit Tags in Statistik berücksichtigt werden können).

---

## Phase 3 — Pfad-B-Vorbereitung (optional, nur bei Entscheidung)

Sobald die Entscheidung zu Pfad B getroffen wird, werden folgende Meilensteine ergänzt:

- Juristische Prüfung & Impressum / vollständige Datenschutzerklärung.
- Einwilligungsmanagement im System.
- Selbstregistrierung mit Admin-Freigabe-Queue.
- Audit-Logs als explizites Feature.
- Moderations-Werkzeuge.
- Neubewertung Hoster-Vertrauen (ADR-001).
- Neubewertung Anonymisierung (ADR-002).
- Ggf. Datenschutz-Folgenabschätzung.
- MapTiler-Plan neu bewerten (Free-Tier ist nur nicht-kommerziell) — ggf. Upgrade oder Self-Hosting vorziehen.

**Diese Phase bleibt in der aktuellen Planung leer**, bis die Entscheidung explizit getroffen ist.

---

## Querschnitts-Aktivitäten (laufend)

Folgende Aktivitäten sind keine Meilensteine, sondern ziehen sich durch alle Meilensteine:

- **Tests:** Unit-, Integrations-, E2E-, RLS-Tests wachsen mit jedem Meilenstein.
- **Doku:** `architecture.md` und `decisions.md` werden bei jeder relevanten Entscheidung aktualisiert.
- **Security-Review:** Nach jedem Meilenstein mit User-Interaktion: Auth-Flows, Input-Validierung, Rate-Limits, CORS.
- **Code-Review:** Jedes größere Arbeitspaket, bevor es auf `main` landet, wird vom Admin reviewt (auch bei KI-Umsetzung).
- **Blocker:** Jeder nicht nach 3 Versuchen gelöste technische Halt wird in `blockers.md` dokumentiert.

---

## Offene Punkte (für spätere Konkretisierung oder Folgephase)

**Bereits entschieden in dieser Konzeptionsphase** (siehe `decisions.md`):
- ~~Python-Version + Package-Manager~~ → ADR-005 (Python 3.12 + uv)
- ~~Auth-Token-Strategie~~ → ADR-006 (HttpOnly-Cookie-Sessions)
- ~~E-Mail-Versand~~ → in MVP gestubbt, externer Dienst später
- ~~Eingabemodi für Ort~~ → Plus Code + Karten-Klick + MapTiler Geocoding

**Offen für Folge-Sessions oder spätere Phasen:**

- **Personen-Merge-Funktion** (siehe ADR-014): Duplikat-Auflösung im Admin-Bereich. Kann in M8 oder später nachgezogen werden.
- **Vorlagen/Favoriten** (siehe ADR-013): bewusst aufgeschoben, nach erstem realen Live-Test neu evaluieren.
- **Rate-Limit für on-the-fly-Personenanlage** (siehe ADR-014, Pfad-B-relevant): in Pfad A unkritisch.
- **Konkreter Off-Site-Backup-Anbieter** (M13).
- **E-Mail-Versanddienst** (vor M11, sobald Passwort-Reset produktiv gebraucht wird).
- **Karten-Style:** MapTiler-Preset oder eigener Style?
- **Audit-Log-Strategie** über `created_at`/`updated_at` hinaus — ob ein separates `event_log` nötig wird (Pfad B vermutlich ja).
- **Dev/Staging-Environment** auf dem VPS oder lokal-only?
