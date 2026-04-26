# Changelog

Alle nutzerrelevanten Änderungen werden hier dokumentiert.
Format folgt [Keep a Changelog](https://keepachangelog.com/de/1.1.0/),
Versionierung folgt [SemVer](https://semver.org/lang/de/).
Bis zum ersten Go-Live (M11) bleibt das Projekt auf `0.0.0`.

## [Unreleased]

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
