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

- **Stand vom:** 2026-04-26
- **Laufende Phase:** Phase 1 (MVP) — gestartet
- **Aktiver Schritt:** keiner (M4 abgeschlossen)
- **Nächster Schritt:** M5a — Event-Erfassung Live-Modus (Scope erweitert per ADR-022/-023)
- **Offene STOPP-Situationen:** keine

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
| 1 MVP   | M5a         | Event-Erfassung Live-Modus (mobile, GPS, Timer)  | [OFFEN]     |
| 1 MVP   | M5b         | Offline-Resilienz (RxDB-Sync)                    | [OFFEN]     |
| 1 MVP   | M5c         | Nachträgliche Erfassung & Bearbeitung            | [OFFEN]     |
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

---

### M5b — Offline-Resilienz (RxDB-Sync)

**Ziel:** Funklöcher führen nicht zu Datenverlust. Live-Modus funktioniert auch ohne stabile Verbindung.

**Deliverables:**
- **RxDB-Setup im Frontend** (siehe ADR-017): `lib/rxdb/database.ts`, Schemas für Event und Application entsprechend Backend-Modell.
- **Backend-Sync-Endpoints** `/api/sync/pull` und `/api/sync/push` entsprechend RxDB-Replication-Protokoll. RLS-konform (User bekommt nur seine sichtbaren Events).
- **Schreib-Strategie:** Jede Live-Aktion schreibt zuerst in RxDB, der Replication-Worker repliziert im Hintergrund ans Backend.
- **Conflict-Resolution-Strategien** in RxDB-Config: Server-Zeit als Wahrheit für Zeitstempel, Last-Write-Wins für Notiz-Felder, dokumentiert in `lib/rxdb/replication.ts`.
- **UI-Indikator:** kleines Symbol für „synchronisiert / pending / offline" in der Hauptnavigation.
- **Test:** bewusst Offline gehen, drei Applications erfassen, wieder online — alle Daten landen korrekt im Backend, keine Duplikate.
- **Storage-Recovery:** Bei Reconnect nach längerer Pause (Safari löscht IndexedDB nach 7 Tagen Inaktivität) Re-Sync mit Server-Stand.

**Akzeptanzkriterien:**
- Event komplett im Flugmodus erfassbar; Sync nach Wiederverbindung erfolgreich.
- Keine Duplikate bei Resync.
- UI zeigt Offline-Status klar an.
- RxDB-Schemas und Backend-Modell bleiben synchron (wird durch gemeinsame Typ-Definitionen oder OpenAPI-basierte Generierung sichergestellt).

**Abhängigkeiten:** M5a.

---

### M5c — Nachträgliche Erfassung & Bearbeitung

**Ziel:** Sekundärer Modus für Events, die nicht live erfasst wurden, plus Bearbeitung bestehender Events.

**Deliverables:**
- Schalter „Nachträglich erfassen" auf der Startseite.
- Identisches Formular wie Live-Modus, aber alle Zeitstempel manuell editierbar.
- Bearbeitung bestehender Events: alle Felder editierbar entsprechend der Rolle (Admin alles, Editor nur eigene).
- Event-Detailseite mit chronologischer Anzeige aller Applications inkl. Lücken zwischen ihnen.
- Respektiert `reveal_participants`: zeigt „+N weitere" statt Namen, wenn Flag false.

**Akzeptanzkriterien:**
- Erfassen, bearbeiten, löschen funktioniert entsprechend der Rolle.
- `reveal_participants`-Verhalten korrekt umgesetzt.
- Lücken zwischen Applications sind in der Detailansicht ablesbar.

**Abhängigkeiten:** M5a.

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
