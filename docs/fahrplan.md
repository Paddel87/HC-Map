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

- **Stand vom:** 2026-04-27
- **Laufende Phase:** Phase 1 (MVP) — gestartet
- **Aktiver Schritt:** M5c — Sub-Schritte **M5c.1a + M5c.1b [ERLEDIGT] 2026-04-27**. M5c.1b liefert die `event_participant`-Sync-Collection: Backend-Migration mit surrogate UUID-PK + Soft-Delete + Cursor-Index + Cascade-Trigger-Erweiterung; Pydantic + JSON-Wire-Schema + Pull-only Endpoint; Frontend-RxDB-Collection mit Pull-only Replication; Detail-Page kombiniert RxDB-Mitgliedschaft mit REST-Person-Snapshot und triggert ein REST-Refetch, sobald die RxDB-Subscription eine person_id liefert, die der Snapshot nicht kennt. Backend 137/137, Frontend 66/66, Coverage `lib/rxdb/**` 92.42 % Lines, alle Lints clean. ADR-037 dokumentiert die elf Detail-Entscheidungen.
- **Nächster Schritt:** M5c.2 (chronologische Detail-Anzeige + Maskierung) — einheitliche `EventDetailView` für laufende und beendete Events, sichtbare Lücken zwischen Applications, Frontend-Sicherheitsgürtel zusätzlich zur Backend-`reveal_participants`-Maskierung. Danach M5c.3 (nachträgliche Erfassung) und M5c.4 (Edit-UI).
- **Offene STOPP-Situationen:** keine
- **Offene Beobachtungen:** `/events/[id]` rendert Live- und Ended-View weiter über SSR; Offline-Insert mit direkter Navigation kann kurzzeitig 404 produzieren. Behebung als Pflicht-Deliverable in M5c. Tile-Proxy braucht `HCMAP_MAPTILER_API_KEY` — ohne Key liefert er 503 und die Karte rendert ohne Tiles; Picker-Flow funktioniert trotzdem per Tap.

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
| 1 MVP   | M5a         | Event-Erfassung Live-Modus (mobile, GPS, Timer)  | [IN ARBEIT] |
| 1 MVP   | M5a.1       | └─ Backend-Live-Endpoints + Tile-Proxy           | [ERLEDIGT] 2026-04-26 |
| 1 MVP   | M5a.2       | └─ Frontend Startseite, Suche, Export            | [ERLEDIGT] 2026-04-26 |
| 1 MVP   | M5a.3       | └─ Frontend Live-Modus + LocationPickerMap      | [ERLEDIGT] 2026-04-26 |
| 1 MVP   | M5a.4       | └─ App-PIN-Sperre (PBKDF2 / Web Crypto API)     | [ERLEDIGT] 2026-04-26 |
| 1 MVP   | M5b         | Offline-Resilienz (RxDB-Sync)                    | [ERLEDIGT] 2026-04-27 |
| 1 MVP   | M5b.1       | └─ ADR-Bündel + Datenmodell-Migration            | [ERLEDIGT] 2026-04-26 |
| 1 MVP   | M5b.2       | └─ Backend-Sync-Endpoints `/api/sync/{events,applications}/{pull,push}` | [ERLEDIGT] 2026-04-26 |
| 1 MVP   | M5b.3       | └─ RxDB-Setup + Live-Modus auf RxDB-Schreibpfad  | [ERLEDIGT] 2026-04-26 |
| 1 MVP   | M5b.4       | └─ E2E-Offline-Test & Doc-Updates                | [ERLEDIGT] 2026-04-27 |
| 1 MVP   | M5c         | Nachträgliche Erfassung & Bearbeitung            | [IN ARBEIT] |
| 1 MVP   | M5c.1a      | └─ Detail-Page Client-only + REST-Once-Read Participants | [ERLEDIGT] 2026-04-27 |
| 1 MVP   | M5c.1b      | └─ Participants als RxDB-Collection (Sync-Endpoint) | [ERLEDIGT] 2026-04-27 |
| 1 MVP   | M5c.2       | └─ Chronologische Detail-Anzeige + Maskierung    | [OFFEN]     |
| 1 MVP   | M5c.3       | └─ Nachträgliche Erfassung (Schalter + manuelle Zeitstempel) | [OFFEN]     |
| 1 MVP   | M5c.4       | └─ Event-/Application-Bearbeitung (Edit-UI)      | [OFFEN]     |
| 1 MVP   | M6          | Kartenansicht                                    | [OFFEN]     |
| 1 MVP   | M7          | Katalog-Verwaltung & Vorschlags-Workflow         | [OFFEN]     |
| 1 MVP   | M8          | Admin-Bereich                                    | [OFFEN]     |
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

**Status:** [OFFEN]

**Scope:** Einheitliche `EventDetailView` für laufende und beendete Events; sichtbare Lücken zwischen Applications; Frontend-Sicherheitsgürtel zusätzlich zur Backend-Maskierung in `app/services/masking.py`.

**Abhängigkeiten:** M5c.1b.

#### M5c.3 — Nachträgliche Erfassung (Schalter + manuelle Zeitstempel)

**Status:** [OFFEN]

**Scope:** Startseite-Schalter „Nachträglich erfassen", Form mit editierbaren `started_at` / `ended_at`-Feldern für Event und Applications, monotone Zeit-/Sequenz-Validierung.

**Abhängigkeiten:** M5c.2.

#### M5c.4 — Event-/Application-Bearbeitung (Edit-UI)

**Status:** [OFFEN]

**Scope:** `/events/[id]/edit`-Pfad für Editor/Admin-Rollen; Inline-Application-Edit via Sheet; Soft-Delete via RxDB-Push.

**Abhängigkeiten:** M5c.3.

---

### M6 — Kartenansicht

**Ziel:** Events werden auf einer Karte visualisiert.

**Scope-Anpassung (2026-04-26):** MapLibre/`react-map-gl`-Integration, Tile-Proxy und Karten-Klick→Lat/Lon-Picker sind mit M5a vorgezogen (siehe ADR-022). M6 baut darauf auf und liefert die volle Listen-/Filter-/Popup-UX.

**Deliverables:**
- ~~MapLibre GL JS via `react-map-gl` integriert.~~ (in M5a erledigt)
- ~~MapTiler-API-Key serverseitig verwaltet, ggf. über Backend-Proxy ausgeliefert.~~ (in M5a erledigt)
- Marker-Darstellung aller für den Nutzer sichtbaren Events.
- Popup mit Kurzinfo + Link zur Event-Detailseite.
- Clustering bei hoher Dichte (z. B. via `supercluster`).
- Filter: Zeitraum, Beteiligte (gemäß RLS).
- Kartenzustand (Viewport) URL-persistiert.
- **Geocoding-Proxy** `GET /api/geocode?q=...` als MapTiler-Wrapper, eingeloggt erforderlich.
- ~~Grundlage für Eingabe-Use-Case aus M5: Karten-Klick liefert Lat/Lon zurück.~~ (in M5a als `LocationPickerMap` erledigt)
- Optional: Refactor von `LocationPickerMap` zur Basis der `MapView` oder beide eigenständig — Entscheidung in M6, freigabefrei.

**Akzeptanzkriterien:**
- Events erscheinen als Marker.
- Klick auf Marker öffnet Popup, Link funktioniert.
- Karte ist auf Mobile nutzbar (Touch-Gesten).

**Abhängigkeiten:** M3, M4, M5a.

---

### M7 — Katalog-Verwaltung & Vorschlags-Workflow

**Ziel:** Admin verwaltet Kataloge; Editor kann Vorschläge einreichen.

**Deliverables:**
- Admin-UI für RestraintType, ArmPosition, HandPosition, HandOrientation: CRUD.
- Editor-UI: kann Vorschläge einreichen (`status = pending`, `suggested_by = user`).
- Admin-Freigabe-Queue: Liste aller pending-Einträge, Aktion "Freigeben" / "Ablehnen".
- Rollenbasierte Sichtbarkeit: Editor sieht nur approved + eigene pending.
- RestraintType-Felder: Kategorie, Marke, Modell, Mechanik (chain / hinged / rigid), Display-Name.

**Akzeptanzkriterien:**
- Editor kann Vorschlag einreichen, Admin kann ihn freigeben, freigegebene Einträge erscheinen in Dropdowns der Event-Erfassung.
- Pending-Einträge tauchen nirgends in normaler Nutzung auf.

**Abhängigkeiten:** M3, M4.

---

### M8 — Admin-Bereich

**Ziel:** Admin kann Nutzer und Personen verwalten, Stammdaten pflegen, Daten inspizieren. Zweischichtiger Ansatz gemäß ADR-016.

**Deliverables — SQLAdmin-Schicht unter `/admin`:**
- SQLAdmin-Integration im Backend (`app/admin_ui/`), Cookie-Session-Auth-Bridge zu fastapi-users.
- ModelViews für User, Person, RestraintType, ArmPosition, HandPosition, HandOrientation, Event, Application.
- Sortier- und Filter-Optionen, Bulk-Aktionen, CSV-Export via SQLAdmin-Standard.
- Zugriff nur für `role = 'admin'`.

**Deliverables — Next.js-Schicht unter `/admin-dash`** (Workflow-Teile, die über reine CRUD hinausgehen):
- **Admin-Dashboard** als Startseite für Admin-Rolle mit Kennzahlen-Übersicht.
- **Freigabe-Queue** für pending Katalog-Vorschläge (mit Freigabe/Ablehnung und Workflow-Aktionen — SQLAdmin kann CRUD, aber kein spezialisiertes Workflow-UI).
- **Personen-Verwaltung Spezial**: Übersicht „Neue Personen aus Live-Erfassung" (Filter `origin = 'on_the_fly'` und nicht verknüpft), Merge-Funktion für Duplikate, Anonymisierungs-Button mit Bestätigungsdialog.
- **User-Anlage** mit Verknüpfungsmodus (bestehende Person mit `linkable = true` auswählen, siehe ADR-014).
- **Admin-Export aller Daten** (JSON/CSV) als „Notausstieg" und für Backup-Zwecke (siehe ADR-015).
- **Einfache Statistiken**: Events pro Monat, häufigste Positionen, häufigste Restraints.

**Akzeptanzkriterien:**
- Admin kann via SQLAdmin schnell Stammdaten pflegen und Daten inspizieren.
- Via Next.js-Admin-Dash kann Admin Workflow-Aktionen durchführen (Freigaben, Merges, Anonymisierung).
- Verknüpfung neuer User mit bestehender on-the-fly-Person funktioniert; verknüpfter User sieht alle Events seiner Person rückwirkend.
- Anonymisierungs-Prozess ist ein Knopfdruck und in der DB korrekt umgesetzt.

**Abhängigkeiten:** M2, M3, M7.

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
