# Changelog

Alle nutzerrelevanten Änderungen werden hier dokumentiert.
Format folgt [Keep a Changelog](https://keepachangelog.com/de/1.1.0/),
Versionierung folgt [SemVer](https://semver.org/lang/de/).
Bis zum ersten Go-Live (M11) bleibt das Projekt auf `0.0.0`.

## [Unreleased]

### Added

- **M5c.1b — Participants als RxDB-Sync-Collection (ADR-037):**
  Zweiter Sub-Schritt von M5c. Schließt den von ADR-035 §C / ADR-034 §K
  benannten Akzeptanz-Pfad „event.participants reactive nach Offline-
  Application + Reconnect" ohne `Person` selbst in eine Sync-Collection
  zu promoten.
  - **Backend-Migration**
    `backend/migrations/versions/20260427_1900_m5c1b_ep_sync.py`:
    - Neue Surrogate-Spalte `id uuid` (mit `gen_random_uuid()`-Server-
      Default), Composite-PK aufgelöst, `(event_id, person_id)` als
      UNIQUE behalten — RxDB verlangt einen einzelnen String-PK.
    - `updated_at NOT NULL DEFAULT clock_timestamp()` (Backfill mit
      `created_at`), `is_deleted` / `deleted_at`, Cursor-Index
      `(updated_at, id)`, `set_updated_at_event_participant`-Trigger.
    - `cascade_event_soft_delete()` bringt jetzt neben `application`
      auch `event_participant` mit (ADR-037 §C).
  - **Backend-Sync** — Pydantic `EventParticipantDoc` +
    `EventParticipantPullResponse` in `app/sync/schemas.py`,
    `pull_event_participants(...)` in `app/sync/services.py`, neue
    Route `GET /api/sync/event-participants/pull`. **Pull-only**
    (ADR-037 §D); Mutationen laufen weiter über die REST-Endpoints
    `POST/DELETE /api/events/{id}/participants/...` und den
    serverseitigen Auto-Participant-Trigger (ADR-012).
  - **Backend-Refactor:** drei `session.get(EventParticipant,
    (event_id, person_id))`-Aufrufstellen (`app/sync/services.py`,
    `app/services/events.py`, `app/services/applications.py`) auf
    `select().where()`-Queries umgestellt. Soft-Delete-Filter im
    Export-Service ergänzt.
  - **Backend-Tests** in `tests/test_sync_event_participants.py`
    (6 neue): Initial-Pull leer, Auto-Participant nach Event-Push,
    Cursor-Pagination, RLS (Editor sieht nur eigene), Admin-Vollsicht,
    Cascade-Trigger-Test (Soft-Delete bringt Participant-Tombstones im
    Pull). Drift-Test um die dritte Collection erweitert (3 × 3 = 9
    parametrisierte Cases). Backend-Suite **137/137 grün** (zuvor 128;
    Composite-PK-Code-Pfade sind aufgelöst). `mypy --strict` und
    `ruff check` clean.
  - **Frontend-RxDB:** dritte Collection `event_participants` in
    `lib/rxdb/database.ts` (Schema-Wrapper in `schemas.ts`,
    Document-Type in `types.ts`). Replication-Worker ergänzt mit
    neuem `pullOnly`-Flag — kein Push-Handler-Code-Pfad. Aggregierte
    `idle | active | offline | error`-Status-Streams nehmen den neuen
    Replicator mit auf.
  - **Detail-Page-Hybrid** (ADR-037 §E + §I): zweite RxDB-Subscription
    auf `event_participants.find({event_id, _deleted=false}).$` liefert
    die `person_ids` reactive. Page kombiniert die Live-IDs mit dem
    REST-`EventDetail`-Snapshot zu einer `participants:
    PersonRead[]`-Ableitung; fehlt eine ID im Snapshot
    (Auto-Participant nach Reconnect), bumpt ein useEffect den
    `serverFetchVersion`-State und triggert ein einmaliges
    REST-Refetch. Kein Polling.
  - **Tests:** `replication.e2e.test.ts` von 3 auf 4 Tests gewachsen
    („surfaces server-side auto-participants in RxDB after offline
    application reconnect"). Mock-Server `tests/helpers/sync-mock-
    server.ts` ergänzt um die idempotente `addParticipantRow`-Logik
    und das `event-participants/pull`-Routing. Component-Test in
    `tests/event-detail-page.test.tsx` um die zweite Subscription
    erweitert. Frontend-Suite **66/66 grün** (zuvor 65). Coverage
    `lib/rxdb/**` **92.42 % Lines / 81.66 % Branches / 100 %
    Functions** (zuvor 92.43 / 80 / 100); CI-Threshold 80/70/80
    weiterhin erfüllt. ESLint, `tsc --noEmit`, `next build` clean.
  - **Bundle:** `/events/[id]` First-Load 272 kB (unverändert). Die
    zweite Subscription kostet keine messbaren Bytes auf der
    Page-Ebene.
  - **Architektur-Hinweis** (ADR-037 §E): `Person`-Objekte werden
    bewusst noch **nicht** als RxDB-Collection geführt — die
    Maskierungs-Logik aus `app/services/masking.py` müsste sonst
    wire-format-äquivalent abgebildet werden. M5c.2 oder später kann
    das nachziehen, falls die Hybrid-Lösung im Betrieb auffällig wird.
  - ADR-037 dokumentiert die elf Detail-Entscheidungen,
    `architecture.md` § Sync um die dritte Collection erweitert.

- **M5c.1a — Detail-Page Client-only + REST-Once-Read Participants (ADR-036):**
  Erster Sub-Schritt von M5c. Beendet die SSR-Detail-Page; das M5b.4-
  Offline-Insert-mit-direkter-Navigation-Symptom (404 auf der
  Server-Side-Detail-Page, ADR-035 §C / ADR-034 §K) ist damit für den
  häufigen Fall (Online-Reload nach Offline-Insert) behoben.
  - **Page als Client Component:** `(protected)/events/[id]/page.tsx`
    nutzt jetzt `"use client"`, `useParams<{id}>()` für die Route,
    `useMe()` für Auth (statt `getServerMe()`), `useRouter().replace()`
    für den Login-Redirect.
  - **Drei Datenquellen, ein Render-Baum:** RxDB-Subscription auf
    `events.findOne(id).$` mit Resolved-Flag, One-Shot-REST-Fetch auf
    `/api/events/{id}` für `plus_code` und `participants`, Auth-Hook.
    Der Entscheidungsbaum (ADR-036 §H) deckt vier Zustände ab:
    Skeleton bei Loading, `notFound()` bei Hard-404 (beide Quellen
    leer), REST-Daten bei Online-Reload, oder synthetisierter
    `EventDetail` aus dem RxDB-Doc bei REST-Fehler/404 mit RxDB-
    Treffer (Offline-Insert-Fall).
  - **Bestehende Komponenten unverändert:** `LiveEventView` und
    `EndedEventView` werden weiter benutzt — der Refactor liegt
    ausschließlich auf der Page-Ebene.
  - **5 neue Component-Tests** in `tests/event-detail-page.test.tsx`
    pinnen den Entscheidungsbaum: Loading-Skeleton, REST-OK,
    RxDB-Fallback bei REST-404, Hard-404, Anonymous-Redirect.
    Frontend-Suite **65/65 grün** (zuvor 60), Coverage `lib/rxdb/**`
    stabil bei 92.43 % Lines / 80 % Branches / 100 % Functions.
    ESLint, `tsc --noEmit`, `next build` clean.
  - **Bewusst noch offen (für M5c.1b):** `participants` und `plus_code`
    bleiben bei reinem Offline-Insert leer, bis die `event_participant`-
    Sync-Collection nachgezogen wird. Backend-Auto-Participant-Trigger
    erscheint erst nach erstem Event-Pull-Roundtrip.
  - **Keine Backend-Änderung in M5c.1a:** keine Migrations, keine neuen
    Endpoints, keine neuen Dependencies, keine RLS-Policies. ADR-036
    legt den Framework-Rahmen für M5c (Sub-Schritt-Aufteilung 1a/1b/2/
    3/4, RxDB als Single Source of Truth, Mutationen via RxDB-Push,
    eigene Edit-Route, Participants als künftige Sync-Collection) als
    Dach für die folgenden Sub-Schritte fest.

- **M5b.4 — E2E-Offline-Test + Coverage-Tooling (ADR-035):**
  Schließt die M5b-Sub-Schritt-Reihe. Damit ist die Offline-Resilienz
  von Live-Modus → RxDB → Backend End-to-End nachgewiesen.
  - **Frontend-E2E-Test** (`frontend/tests/replication.e2e.test.ts`,
    3 Tests grün):
    - `flushes 3 offline applications exactly once on reconnect` —
      Offline-Insert × 3 → Reconnect → Mock-Backend hat exakt 3
      Application-Rows + 7 Auto-Participants (1 Event-Creator + 3 × 2
      pro Application).
    - `does not re-push docs that are already in sync` —
      `acceptedPushes`-Counter stabil bei Re-Sync ohne lokale
      Änderungen.
    - `pulls server-authoritative fields back into RxDB after
      reconnect` — server-bumpte `updated_at`-Werte landen via
      Pull-Cursor zurück in RxDB.
    - Test bootet die echten `lib/rxdb/{database,replication}` gegen
      `fake-indexeddb` (jsdom-IndexedDB-Polyfill) und einen
      In-Process-Mock-Server (`tests/helpers/sync-mock-server.ts`),
      der die vier Sync-Endpoints deterministisch in-memory
      abbildet. Async-Stabilisierung über
      `replication.{events,applications}.awaitInSync()` statt
      Timeouts (kein Flakiness-Risiko).
  - **Provider-Smoke-Test** (`tests/rxdb-provider.test.tsx`):
    Verifiziert, dass `RxdbProvider` `useDatabase()` /
    `useDatabaseError()` / `useSyncStatus()` korrekt exponiert.
  - **Backend-Idempotenz-Tests** (`backend/tests/test_sync_idempotency.py`,
    3 Tests grün):
    - Drei wiederholte Event-Pushes → 1 Row + 1 EventParticipant.
    - Drei wiederholte Application-Pushes → 1 Row, stable
      `sequence_no = 1`.
    - Offline-Replay-Batch mit Retry → 3 distinct Application-Rows,
      contiguous `sequence_no [1,2,3]`, 1 Auto-Participant.
  - **Coverage Frontend** `lib/rxdb/**`: **92.43 % Lines / 80 %
    Branches / 100 % Functions** via `@vitest/coverage-v8@2.1.9`
    (V8-native), CI-Threshold 80/70/80 in `vitest.config.ts`.
    Pro-File: `replication.ts` 95.3 %, `database.ts` 80.5 %,
    `provider.tsx` 93.2 %, `schemas.ts` 100 %.
  - **Coverage Backend** `app/sync/`: bleibt bei **91 %** aus M5b.2;
    +3 Idempotenz-Tests bringen die Suite auf **128/128 grün**.
    `mypy --strict` und `ruff check` clean.
  - **Edge-Cases aus ADR-034 §K** explizit nach M5c verschoben
    (Variante C2 aus dem M5b.4-Vorschlag, freigegeben):
    Offline-Insert + direkte Navigation → 404 auf SSR-Detail-Page
    sowie leere `event.participants` bis zum ersten Pull. Behebung
    als Pflicht-Deliverable im M5c-Eintrag des Fahrplans
    festgehalten — gemeinsamer Refactor mit der M5c-Detail-Page.
  - **Neue Dev-Deps** (Frontend, freigegeben über ADR-035 §A/§B):
    `fake-indexeddb@6.2.5` (MIT, Standard-IndexedDB-Polyfill der
    Dexie- und RxDB-Maintainer) und `@vitest/coverage-v8@2.1.9`
    (offizieller vitest-Coverage-Reporter, MIT, V8-native).
  - **Kleine Code-Anpassung** in `frontend/src/lib/rxdb/database.ts`:
    `loadDevPlugin()` lädt das `RxDBDevModePlugin` jetzt nur noch in
    `NODE_ENV === "development"` statt in „nicht production". Vitest
    setzt NODE_ENV auf `"test"`, was den dev-mode
    Schema-Validator-Zwang auslöste; production bleibt unberührt.
  - ADR-035 dokumentiert die zehn Detail-Entscheidungen,
    `architecture.md` § Sync um den Test-Stack erweitert,
    README-Phase-Badge auf `M5b-erledigt`.

- **M5b.3 — RxDB-Setup im Frontend + Live-Modus auf RxDB-Schreibpfad (ADR-034):**
  Frontend-Sync-Schicht. Live-Modus arbeitet ab sofort lokal-zuerst,
  Replication läuft asynchron im Hintergrund.
  - **Library-Schicht** unter `frontend/src/lib/rxdb/`:
    - `types.ts` — TS-Document-Types deckungsgleich mit den JSON-
      Schemas aus M5b.2.
    - `schemas.ts` — RxJsonSchema-Wrapper über die JSON-Files.
    - `database.ts` — Lazy-Singleton `getDatabase()` mit
      Dexie-Storage-Adapter; Dev-Mode-Plugin nur in Development.
    - `replication.ts` — `replicateRxCollection` pro Collection,
      eigene Pull-/Push-Handler gegen `/api/sync/{events,applications}/
      {pull,push}`, CSRF-Cookie-Echo im Push, aggregierter Sync-Status
      `idle | active | offline | error`.
    - `provider.tsx` — `RxdbProvider` + `useDatabase()` /
      `useDatabaseError()` / `useSyncStatus()`-Hooks; mountet im
      `(protected)/layout.tsx` zwischen `PinLockProvider` und
      `AppShell`.
  - **Sync-Indikator** (`components/sync/sync-status-indicator.tsx`):
    Kleine Pill mit Lucide-Icon (Cloud / Loader2 / CloudOff /
    TriangleAlert) in Sidebar (Desktop, mit Label) und Mobile-Header
    (kompakt). `data-sync-status`-Attribut für Tests.
  - **Live-Modus-Refactor** auf RxDB-Schreibpfad:
    - `event-create-form.tsx`: `database.events.insert(...)` mit
      `crypto.randomUUID()`-Client-ID, server-authoritative
      `created_by`. Recipient-Wahl in `sessionStorage` als Bridge zur
      ersten Application.
    - `application-start-sheet.tsx`: `database.applications.insert(...)`
      mit lokal vergebener `sequence_no` (max+1); Server vergibt
      endgültige Nummer beim Push.
    - `live-event-view.tsx`: `useEventDoc` / `useApplications`-Hooks
      subscriben auf `findOne(id).$` und `find({...}).$`. End-Aktionen
      via `doc.patch({ended_at, updated_at})`. Reactive Updates ohne
      `refetchInterval`.
  - **Conflict-Handler:** RxDB-Default (Master gewinnt) — passt zur
    ADR-029-Semantik; eigener Handler nicht nötig.
  - **Tests:** 4 neue Tests in
    `tests/sync-status-indicator.test.tsx` (idle / active / offline /
    error). Frontend-Suite **60/60 grün** (zuvor 56). ESLint clean,
    `tsc --noEmit` clean, `next build` clean.
  - **Browser-Verifikation** (preview server): Login → Dashboard
    rendert den Sync-Indikator im DOM
    (`[role=status][data-sync-status=idle]`), RxDB-IndexedDB
    initialisiert sich, Pull repliziert vorhandene Events lokal.
  - **Bundle:** `/events/[id]` First-Load 271 kB, `/events/new` 262 kB
    — innerhalb der in ADR-017 prognostizierten 150-200 KB für
    RxDB+Dexie+RxJS gzipped.
  - **Dependencies:** `rxdb@17.1.0`, `rxjs@7.8.2` (beide aus dem in
    `project-context.md` §3 als „freigabefrei nutzbar" gelisteten
    Stack-Set; ADR-017 hatte RxDB bereits als Sync-Schicht gewählt).
  - **Offene Edge-Cases** (bewusst, mit M5b.4 zu adressieren): Offline-
    Insert mit direkter Navigation auf die Server-Side-Detail-Page
    liefert kurzzeitig 404, weil der Push noch nicht durch ist.
    `event.participants` bleibt bis zum ersten Pull-Roundtrip leer
    (Auto-Participant entsteht erst beim Server-Sync). Details in
    ADR-034 §K.

- **M5b.2 — Backend-Sync-Endpoints (ADR-033):**
  Vier RxDB-Replication-Endpoints und der zugehörige Service-/Test-/
  Doku-Stack. Erste Editor-INSERT-via-HTTP-Pfade im Repo.
  - **Endpoints:** `GET /api/sync/{events,applications}/pull` und
    `POST /api/sync/{events,applications}/push` mit Cursor-Pagination
    `(updated_at, id)`, Tombstone-Replikation via `_deleted`-Wire-Flag,
    Conflict-Resolution pro Feld nach ADR-029 (immutable-after-create,
    first-write-wins, last-write-wins, server-authoritative). Sequence-
    Nummern und `created_by` sind beim Application-Insert server-
    authoritativ; Auto-Participant für Performer/Recipient (ADR-012)
    mitgezogen.
  - **Pydantic-Schemas** (`app/sync/schemas.py`): `EventDoc`,
    `ApplicationDoc`, `SyncCheckpoint`, `*PullResponse`, `*PushItem`.
    Wire-Flag `_deleted` als Pydantic-Alias zu intern `deleted`.
  - **Frontend-JSON-Schemas** als Vertragsdatei in
    `frontend/src/lib/rxdb/schemas/{event,application}.schema.json`
    (RxDB-natives Format mit `primaryKey`, `version`, `indexes`).
    RxDB-Konsumtion folgt mit M5b.3.
  - **Drift-Test** (`tests/test_rxdb_schema_drift.py`, ADR-031): lädt
    die Frontend-JSON-Schemas und vergleicht Properties + Typen +
    `required`-Listen mit den Pydantic-`model_json_schema(by_alias=True,
    mode='serialization')`. Schlägt bei jeder Drift-Änderung fehl.
  - **Migration `20260426_1830_m5b2_owner_select`:** Neue Permissive-
    SELECT-Policies `event_editor_select_own` und
    `application_editor_select_own` (USING `created_by =
    current_user_id`). Behebt einen latent-Bug aus der M2-Strict-RLS,
    den die Sync-Endpoints aufgedeckt haben (`INSERT … RETURNING`
    triggert die SELECT-Policy auf der frisch eingefügten Zeile vor dem
    Auto-Participant-Insert). Freigegeben separat 2026-04-26 als
    minimal-invasive Variante. Details in ADR-033 §E.
  - **Soft-Delete-Filter im Service-Layer** (ADR-033 §D): `events`,
    `applications`, `search`, `exports`-Services filtern
    `is_deleted = false`. Sync-Endpoints sind die einzigen Konsumenten,
    die Tombstones zurückliefern.
  - **asyncpg `statement_cache_size = 0`** in `app/db.py` als
    defensive Schutzschicht gegen Per-Connection-Plan-Cache-
    Interaktionen mit Per-Request-`SET LOCAL`-GUCs (asyncpg #200).
  - **Tests:** 41 neue Tests (6 sync_api, 8 sync_rls, 7 conflict, 9
    applications, 5 soft-delete-filter-regression, 6 drift). Backend-
    Suite **125/125 grün** (zuvor 84). `mypy --strict` clean,
    `ruff check` clean. Coverage `app/sync/`: **91 %** (Soll ≥ 80 %).
  - **Dev-Dependency:** `coverage>=7.13.5` für die Sync-Coverage-
    Messung.

- **M5b.1 — Sync-Datenmodell-Vorbereitung (ADR-029…ADR-032):**
  Datenmodell-Fundament für die RxDB-Replication aus M5b.2/M5b.3.
  Reine Backend-/DB-Änderung, kein Sync-Code.
  - **ADR-029 — Conflict-Resolution-Strategie (Live-First mit
    Reconciliation):** Pro-Feld-Tabelle für `event` und `application`.
    Identitäts-/Zeit-/Geo-Felder sind nach erstem Push immutable;
    `ended_at` ist First-Write-Wins; Notizen, Beteiligte und Positionen
    sind Last-Write-Wins; `sequence_no`-Konflikte löst der Server durch
    Re-Numbering. Konkret prägt das die `POST /api/sync/push`-Logik in
    M5b.2.
  - **ADR-030 — Soft-Delete und Cursor-Felder:** `event` und
    `application` erhalten `is_deleted boolean NOT NULL DEFAULT false`
    + `deleted_at timestamptz NULL`, `updated_at` wird auf `NOT NULL`
    mit `DEFAULT clock_timestamp()` gehoben (Backfill mit `created_at`),
    Cursor-Indices `(updated_at, id)` für `/api/sync/pull`. Cascade-
    Trigger `cascade_event_soft_delete` propagiert Soft-Delete eines
    Events auf alle nicht-gelöschten Child-Applications; Restore
    propagiert bewusst nicht. RLS-Policies bleiben in M5b.1 unverändert
    — Soft-Delete-bewusste Service-Filterung kommt mit M5b.2.
  - **ADR-031 — RxDB-Schema-Source-of-Truth:** Frontend-RxDB-Schemas
    und Backend-Pydantic-Schemas werden manuell parallel gepflegt;
    Drift wird in M5b.2 durch einen automatisierten Test in der
    Backend-Suite verhindert.
  - **ADR-032 — Keine IndexedDB-Encryption in Pfad A:** Storage bleibt
    unverschlüsselt; Geräteverschlüsselung ist User-Verantwortung. App-
    PIN aus M5a.4 deckt das primäre Bedrohungsmodell. Einwilligungstext
    (Pre-M11) wird entsprechend ergänzt.
  - **Alembic-Migration** `20260426_1800_m5b1_sync_columns`: Backfill
    `updated_at`, `NOT NULL`-Hochzug, Soft-Delete-Spalten, Cursor-
    Indices, Cascade-Trigger. Down-Migration vollständig reversibel.
  - **ORM-Modelle:** `Event` und `Application` erben jetzt zusätzlich
    von `SoftDeleteMixin`, mit explizitem `updated_at`-Override
    (`nullable=False`, `server_default=text("clock_timestamp()")`).
    `SoftDeleteMixin`-Docstring erweitert (M5b-Scope dokumentiert).
  - **Tests:** Sieben neue Trigger-Tests in
    `tests/test_sync_columns_migration.py` decken Insert-Default,
    Update-Bump auf `event` und `application`, Soft-Delete-Cascade,
    Restore-No-Cascade und Application-Soft-Delete-Isolation ab.
    Backend-Suite 84/84 grün, `mypy` und `ruff` clean.

### Fixed

- **M2 — fastapi-users-Typing:** `app/auth/routes.py:20` warf seit M2
  `Value of type variable "models.UP" of "FastAPIUsers" cannot be "User"`
  unter `mypy --strict`. Behoben durch Vererbung von
  `SQLAlchemyBaseUserTableUUID` (ADR-025); Spalten-Overrides in einem
  `if not TYPE_CHECKING`-Block halten Schema und Verhalten identisch
  (UUIDv7-Default per ADR-018, server_default auf den Boolean-Flags,
  benannter UniqueConstraint statt inline `unique=True/index=True`).
  Fünf bisherige `# type: ignore[type-var]`-Workarounds in
  `app/auth/manager.py` sind entfernt. `mypy --strict` clean
  (50 Source-Files, 0 Errors). Schema-Drift verifiziert: keine
  Migration nötig. Backend-Suite 74/74 grün.

### Added

- **M5a.4 — App-PIN-Sperre (PBKDF2 / Web Crypto API):** Clientseitige
  UI-Sperre nach ADR-023, querliegend zu allen `(protected)`-Routen.
  Frontend-only, kein Backend-Anteil (Fahrplan §M5a, ADR-028).
  - **Crypto-Lib** (`lib/pin.ts`): PBKDF2-SHA-256, 600.000 Iterationen,
    16-Byte-Salt, 32-Byte-Hash, base64-Encoding, konstantzeit-XOR-
    Vergleich. PIN-Länge 4–6 Ziffern.
  - **Storage** (`lib/pin-storage.ts`): native IndexedDB-CRUD im
    Object-Store `hcmap-pin/pin/pin_v1`. Schema-Versionierung erlaubt
    späteren Algorithmus-Wechsel (ADR-023 §8).
  - **Provider** (`components/pin/pin-lock-provider.tsx`): React-Context
    + `usePinLock`-Hook. Inaktivitäts-Timer Default 60 s, konfigurierbar
    30 s–15 min, persistiert in `localStorage`. Reset bei
    `pointerdown`/`keydown`/`visibilitychange`. Eingebettet
    zwischen Server-Layout und `<AppShell>` in
    `app/(protected)/layout.tsx` — Login bleibt frei.
  - **`fail_count`-Schutz:** vor Hash-Vergleich inkrementiert
    (Crash-resistent). Bei Erfolg auf 0 Reset. Bei 5 Fehlversuchen
    Zwangs-Logout: IDB-Wipe + State-Reset + `POST /api/auth/logout` +
    Redirect auf `/login?error=pin` mit deutschem Hinweistext.
  - **`LockOverlay`-UI** (`components/pin/lock-overlay.tsx`): Vollbild-
    Modal mit numerischem Input, Mobile-Tastatur, verbleibende
    Versuche bei Fehlschlag.
  - **Profil-UI** (`components/profile/pin-settings.tsx`): PIN
    setzen/ändern/entfernen, Inaktivitäts-Dropdown mit fünf Stufen,
    „Jetzt sperren"-Knopf.
  - 15 neue Vitest-Tests (`pin`: 10 inkl. Determinismus + falsche-
    PIN + Salt-Variabilität, `pin-lock`: 5 inkl. Force-Logout-Pfad).
    Frontend-Suite 37 → 52 Tests grün. `tsc --noEmit`, `next lint`,
    `prettier --check`, `next build` alle clean.
  - Browser-Smoke gegen lokales Stack bestätigt: Set/Lock/Wrong/Right
    end-to-end, fail-counter persistiert in IDB. Force-Logout-Pfad
    in Vitest abgedeckt.
  - **Keine neuen Backend-Routen, keine neuen Dependencies, keine
    Migrations.**
  - ADR-028 dokumentiert die vierzehn Detail-Entscheidungen.

### Fixed

- **Dashboard — Decimal-Serialisierung:** `app/(protected)/page.tsx`
  crashte mit `event.lat.toFixed is not a function`, weil das Backend
  Decimals als String liefert (Pydantic v2 Default), die Listen-
  Item-Komponente aber `.toFixed()` direkt aufrief. Bei leerer Liste
  fiel der Bug seit M4 nicht auf. Fix: `coerceNumber()`-Helper aus
  `lib/types.ts` (M5a.3) wird jetzt auch im Dashboard verwendet.

- **M5a.3 — Frontend Live-Modus + LocationPickerMap:** Live-Erfassung
  end-to-end im Frontend, plus eine kleine additive Backend-Erweiterung
  für die Application-Liste pro Event (Fahrplan §M5a, ADR-027).
  - **Karten:** `maplibre-gl@^4` und `react-map-gl@^7` als Runtime-Deps
    (beide MIT, freigabefrei nach ADR-022). Tile-URL aus
    `NEXT_PUBLIC_TILE_URL` (Default `/api/tiles/{z}/{x}/{y}`),
    Default-Center aus `NEXT_PUBLIC_DEFAULT_MAP_CENTER`. Raster-Style
    mit Tile-Proxy als Source.
  - **`LocationPickerMap`-Komponente:** Single-Marker, Tap-to-Adjust,
    draggable, controlled `{lat, lon, onChange}`. Kein Clustering,
    kein URL-Sync — minimal-Scope nach ADR-022; `MapView`-Vollausbau
    folgt mit M6.
  - **Hooks:** `useWakeLock`, `useGeolocation`, `useNow` in
    `src/hooks/`. Wakelock mit Re-Acquire bei `visibilitychange` und
    Permission-Denied-Hinweis.
  - **`/events/new`-Flow:** GPS-Auto-Request, Karten-Picker,
    Recipient-Combobox mit On-the-fly-Sheet (`POST /api/persons/quick`,
    ADR-014), Notiz, Submit → `POST /api/events/start` → Redirect.
    Auto-Participant-Hinweis (ADR-012) bei gewähltem Recipient.
    `viewer`-Rolle wird abgewiesen.
  - **`/events/[id]`-Live-Ansicht:** Server-Component lädt das Event,
    branched zwischen Live (Wakelock + Sekunden-Timer + Action-Buttons
    + Application-Liste) und Ended (Stub mit Notiz, Plus-Code,
    M5c-Hinweis). Action-Buttons: „Neue Application", „Aktuelle
    beenden", „Event beenden" — verbunden mit den drei Live-POSTs aus
    M5a.1 (`/applications/start`, `/applications/{id}/end`,
    `/events/{id}/end`).
  - **Dashboard-CTA aktiviert:** „Neues Event starten" ist jetzt ein
    funktionaler Link auf `/events/new` (ersetzt den disabled-Button
    aus M5a.2).
  - **Backend additiv:** Neuer Endpoint
    `GET /api/events/{event_id}/applications` (List sortiert nach
    `sequence_no`). Schließt eine Lücke aus ADR-024 §J — rein additiv,
    freigabefrei. Drei neue HTTP-Tests; Backend-Suite 74 → 77 Tests
    grün.
  - 10 neue Vitest-Tests (`duration` 6 + `use-wake-lock` 4).
    Frontend-Suite 27 → 37 Tests grün. `tsc --noEmit`, `next lint`,
    `prettier --check`, `next build` alle clean.
  - **Browser-Smoke** gegen lokales Stack bestätigt: Anlegen → Live
    mit Timer + Plus-Code → Application start/end → Event end →
    EndedView. Wakelock-Permission im Headless verweigert (erwartet),
    Tile-Proxy liefert ohne `HCMAP_MAPTILER_API_KEY` 503 — Karte
    rendert ohne Tiles, Picker-Flow trotzdem funktional.
  - Zwei neue ENV-Variablen: `NEXT_PUBLIC_TILE_URL`,
    `NEXT_PUBLIC_DEFAULT_MAP_CENTER`.
  - ADR-027 dokumentiert die zwölf Detail-Entscheidungen.

- **M5a.2 — Frontend Startseite, Suche, Export:** Reiner Frontend-Konsum
  bestehender M3-Endpoints (Fahrplan §M5a, ADR-026).
  - **Globale Suchleiste** im AppShell (Sidebar auf Desktop, zweite
    Header-Zeile auf Mobile). Submit navigiert zu `/search?q=…`,
    Pre-Fill aus dem aktuellen Query-Param. Funktioniert auch ohne JS
    (Progressive-Enhancement-Form-Action).
  - **/search-Seite** (Server-Component, RLS-konform via
    Cookie-Forwarding) zeigt Treffer aus `GET /api/search` mit
    Total-Counter, Limit-Hinweis und Snippet-Liste. Empty-Query und
    Backend-Fehler werden als Hinweiskarten gerendert.
  - **Sicheres Snippet-Highlighting:** Postgres-`<b>…</b>`-Tags werden
    per Tokenizer in React-`<mark>`-Elemente überführt; Plain-Text
    wird von React automatisch escaped. Test deckt
    `<script>`-Injection-Edge-Case explizit ab.
  - **Export-UI im Profil:** Vier Download-Links per
    `<a href download="…">` für `/api/export/me` (JSON),
    `/api/export/me/events.csv`, `/api/export/me/applications.csv`
    plus admin-only `/api/admin/export/all`. Same-Origin-Cookie
    reicht, GET → kein CSRF.
  - 11 neue Vitest-Tests (`search-box`, `search-results`,
    `export-buttons`). Frontend-Suite 16 → 27 Tests grün.
    `tsc --noEmit`, `next lint`, `prettier --check`, `next build`
    alle clean.
  - **Keine Backend-Änderungen, keine neuen Abhängigkeiten,
    keine Migrations.**
  - ADR-026 dokumentiert die neun Detail-Entscheidungen (Searchbox-
    Pattern, /search-Page-Lade-Strategie, Snippet-Tokenisierung,
    Treffer-Link-Ziel, Export-Download-Pattern, Dashboard-Polish,
    Tests, Browser-Smoke, Scope-Abgrenzung).

### Fixed

- **Dashboard — Throwback-Schema-Drift:** Die Sektion „An diesem Tag"
  rendete `throwback.event_id`; das Backend liefert seit M3 das Feld
  `id` (siehe `backend/app/schemas/search.py:21`). Frontend-Schema an
  Backend angepasst (`note`-Feld zusätzlich übernommen). Listen-
  Einträge im Dashboard verlinken jetzt zusätzlich auf
  `/events/{id}` (Detail-Route bleibt bis M5c ein Stub — bewusste
  ADR-026 §D-Konsequenz).

- **M5a.1 — Backend-Live-Endpoints + Tile-Proxy:** Sechs neue Backend-
  Routen für die Live-Erfassung (Fahrplan §M5a, ADR-022/-024).
  - `POST /api/events/start` setzt `started_at = now()`, fügt den Creator
    automatisch als Participant hinzu und nimmt optional einen Recipient
    direkt mit auf.
  - `POST /api/events/{id}/end` und `POST /api/applications/{id}/end`
    sind idempotent: ein zweiter Aufruf ändert `ended_at` nicht.
  - `POST /api/events/{event_id}/applications/start` startet eine
    Application mit `started_at = now()`, vergibt `sequence_no`
    automatisch und füllt `performer_id`/`recipient_id` mit dem
    eingeloggten User vor (Regel-002, Self-Bondage als Default).
  - `POST /api/persons/quick` (admin + editor): On-the-fly-Person
    mit `origin = on_the_fly`, `linkable = false` (Regel-004).
  - `GET /api/tiles/{z}/{x}/{y}` als MapTiler-Proxy mit
    server-seitigem API-Key, `Cache-Control: public, max-age=86400`,
    Auth-Pflicht. Pfad-Parameter werden auf gültige Tile-Koordinaten
    geprüft (`z` 0–22, `x`/`y` ≥ 0).
  - 21 neue HTTP-Tests (test_events_live_api, test_applications_live_api,
    test_persons_quick_api, test_tiles_proxy). Backend-Suite jetzt
    74/74 grün gegen Postgres 16 + PostGIS 3.4.
  - Neue ENV-Variablen `HCMAP_MAPTILER_API_KEY` und
    `HCMAP_MAPTILER_STYLE` (Default `basic-v2`); leerer Key gibt 503.
  - `httpx` aus den Dev- in die Runtime-Dependencies verschoben (für
    den Tile-Proxy zur Laufzeit).
  - ADR-024 dokumentiert die acht Detail-Entscheidungen
    (Endpoint-Inventar, Idempotenz, Auto-Participant-Reuse, Tile-Proxy-
    Mechanik, Default-Performer/-Recipient, ENV-Schalter, Tests, Scope-
    Abgrenzung gegen M5a.2/.3/.4).
- **M5a-Vorbereitung — ADR-022/-023:** ADR-022 zieht den minimalen
  `LocationPicker` und den Tile-Proxy aus M6 in M5a vor; M6 reduziert
  sich auf Marker-Liste, Clustering, Filter, URL-State und Geocoding.
  ADR-023 legt das App-PIN-Hashing auf PBKDF2-SHA-256 (Web Crypto API,
  600.000 Iterationen, 16-Byte-Salt) fest — keine neue Abhängigkeit.

- **M4 — Frontend-Grundgerüst & Auth-Flow:** Login-, Logout- und
  geschütztes Layout produktiv. `lib/api.ts` als typisierter
  fetch-Wrapper mit `credentials: 'include'`, automatischer
  `X-CSRF-Token`-Header-Anhängung aus dem `hcmap_csrf`-Cookie und
  `ApiError`-Klasse. TanStack-Query-Hooks `useMe` / `useLogin` /
  `useLogout`, server-seitiger `getServerMe()` für Server Components.
  Edge-Middleware redirected anonyme Requests auf `/login` (mit
  `?next=`-Parameter), Server-Component-Layout lädt den User und
  redirected bei Rolle-Mismatch (`/admin` admin-only). `(public)/login`
  und `(protected)`-Route-Group trennen Pfade ohne Layout-Boilerplate.
  Sidebar (Desktop) + Bottom-Nav (Mobile) + UserMenu (Avatar-Initialen,
  Theme-Toggle, Logout) aus einer gemeinsamen Nav-Item-Liste. Stub-Seiten
  für Dashboard, Events, Karte, Admin, Profil. Dark-Mode via
  `next-themes` (system / hell / dunkel). 11 shadcn-Komponenten
  (button, input, label, card, skeleton, avatar, dropdown-menu, sheet,
  sonner, form) mit Style "new-york" und `cssVariables: false`.
- Frontend-Tests: vitest + jsdom + @testing-library/react. 16/16 Tests
  grün gegen api.ts (CSRF/method/query/204), useMe (200/401),
  middleware (Redirect-Verhalten, Public-Pfade, `?next=`),
  LoginForm (Submit-Payload, Validierung blockt Mutation-Call).
  `pnpm typecheck`, `pnpm lint`, `pnpm build`, `pnpm test` alle grün.
- ADR-021 dokumentiert die elf Detail-Entscheidungen (API-Rewrite-
  Strategie, fetch-Wrapper, Server-State, Route-Protection-Hybrid,
  Login-Submission, Layout, Dark-Mode-Lib, shadcn-Set, Stub-Umfang,
  Test-Setup, neue Dependencies).

- **M3 — Event- und Application-API (Backend):** Vollständige Domain-CRUD
  unter `/api/events`, `/api/applications`, `/api/persons` (admin-only
  Schreibzugriff plus Anonymisierung gemäß ADR-002), vier Catalog-Pfade
  mit Vorschlags-/Approve-Workflow, Volltextsuche `/api/search` (German
  tsvector über Event- und Application-Notes), Throwbacks
  `/api/throwbacks/today`, JSON- und CSV-Exporte
  (`/api/export/me`, `/api/export/me/events.csv`,
  `/api/export/me/applications.csv`, `/api/admin/export/all`).
  44 Endpunkte gesamt, alle RLS-konform via `get_rls_session`.
- Service-Layer unter `backend/app/services/` (events, applications,
  persons, catalog, search, exports, plus_code, masking) kapselt
  Business-Regeln: Auto-Participant nach ADR-012, server-vergebene
  `sequence_no`, approved-only-Catalog-Refs für Editor, kontextabhängige
  Personen-Maskierung bei `reveal_participants=false`, server-seitige
  Plus-Code-Berechnung via `openlocationcode`.
- 53/53 Tests grün, davon 22 neue M3-HTTP-Tests
  (test_events_api, test_applications_api, test_persons_api,
  test_catalog_api, test_search_export_api). ruff, mypy --strict, format
  alle clean.
- ADR-020 dokumentiert die Implementierungs-Entscheidungen
  (Scope-Schnitt M3↔M5a, Pagination, Service-Layer, Auto-Participant,
  Plus-Code, Volltextsuche, Maskierung, Export-Format).

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
