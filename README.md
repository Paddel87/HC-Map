# HC-Map

**Selbst gehostetes, geo-referenziertes Logbuch für Fesselungs-Ereignisse einer geschlossenen Gruppe.**

[![Status](https://img.shields.io/badge/status-mvp--phase--1-yellow)](./docs/fahrplan.md)
[![Phase](https://img.shields.io/badge/phase-M6--erledigt-blue)](./docs/fahrplan.md#phasen-übersicht)
[![Version](https://img.shields.io/badge/version-v0.0.0-lightgrey)](./docs/project-context.md#1-kerndaten)
[![Lizenz](https://img.shields.io/badge/lizenz-offen-red)](./docs/project-context.md#6-constraints-operationalisierbar)
[![Docs](https://img.shields.io/badge/docs-deutsch-yellow)](./docs/project-context.md)
[![Scope](https://img.shields.io/badge/scope-Pfad%20A%20(%3C20%20Nutzer)-informational)](./docs/project-context.md#pfad-a-vs-pfad-b-zwei-scope-stufen)

**Stack (real verbaut):**
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)](./docs/decisions.md#adr-005--backend-stack-fastapi--sqlalchemy--postgrespostgis)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)](./docs/decisions.md#adr-005--backend-stack-fastapi--sqlalchemy--postgrespostgis)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-D71F00)](./docs/decisions.md#adr-005--backend-stack-fastapi--sqlalchemy--postgrespostgis)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](./docs/decisions.md#adr-005--backend-stack-fastapi--sqlalchemy--postgrespostgis)
[![PostGIS](https://img.shields.io/badge/PostGIS-3-336791)](./docs/decisions.md#adr-005--backend-stack-fastapi--sqlalchemy--postgrespostgis)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs&logoColor=white)](./docs/decisions.md#adr-007--frontend-stack-nextjs--typescript--tailwind--shadcnui)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](./docs/decisions.md#adr-007--frontend-stack-nextjs--typescript--tailwind--shadcnui)
[![Tailwind](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss&logoColor=white)](./docs/decisions.md#adr-007--frontend-stack-nextjs--typescript--tailwind--shadcnui)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-5-FF4154)](./docs/decisions.md#adr-007--frontend-stack-nextjs--typescript--tailwind--shadcnui)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](./docs/architecture.md)

[![RxDB](https://img.shields.io/badge/RxDB-17-8d2089)](./docs/decisions.md#adr-017--rxdb-für-offline-sync-in-live-modus)
[![MapLibre](https://img.shields.io/badge/MapLibre_GL-4-396CB2)](./docs/decisions.md#adr-008--karten-layer-maplibre-gl-js-maptiler-cloud-jetzt-self-hosting-später)
[![react-map-gl](https://img.shields.io/badge/react--map--gl-7-2563EB)](./docs/decisions.md#adr-022--locationpicker-und-tile-proxy-in-m5a-vorgezogen)

<!--
Folgende Stack-Bestandteile sind in ADRs fixiert, aber noch nicht im Code
verbaut. Sie bekommen wieder ein Badge, sobald sie produktiv sind
(CLAUDE.md §6: keine Wunsch-Zustände):
  - Caddy (TLS-Reverse-Proxy)      → mit M10
-->


---

## Inhalt

- [Worum es geht](#worum-es-geht)
- [Projektstatus](#projektstatus)
- [Technischer Stack](#technischer-stack)
- [Repository-Struktur](#repository-struktur)
- [Setup](#setup)
- [Sicherheit und Datenschutz](#sicherheit-und-datenschutz)
- [Dokumentation](#dokumentation)
- [Mitwirken](#mitwirken)
- [Lizenz](#lizenz)

---

## Worum es geht

HC-Map ist ein **Full-Stack-Web-Projekt** (Mobile-First-PWA) zur strukturierten Erfassung, Auswertung und kartografischen Darstellung von Fesselungs-Ereignissen (Bondage-Kontext, einvernehmlich, ausschließlich Erwachsene) innerhalb einer **privaten, einander persönlich bekannten Gruppe** mit weniger als 20 Personen.

**Kernmotiv:** Datensouveränität. Das System löst einen vorherigen Einsatz von [what3words](https://what3words.com/) ab und verlagert Speicherung, Zugriff und Auswertung vollständig auf selbst betriebene Infrastruktur.

**Kernbegriffe** (ausführlich in [`project-context.md`](./docs/project-context.md#12-glossar-projektspezifische-begriffe)):

- **Event** — abgeschlossener oder laufender Gesamt-Vorgang an einem Ort mit Start-/Endzeit.
- **Application** — konkrete Fesselungs-Aktion innerhalb eines Events, sequenziert mit eigenen Zeitstempeln, Performer, Recipient, Restraints und Positionen.
- **Live-Modus** — primäre Erfassungsansicht (mobil, GPS, Timer, Offline-fähig).
- **Pfad A / Pfad B** — Scope-Stufen: A = aktive private Gruppe, B = geschlossene Community (aktuell nicht verfolgt).

---

## Projektstatus

| Phase | Stand |
|---|---|
| Phase 1 — MVP / Go-Live Pfad A | M0–M4 erledigt, M5a komplett, M5b komplett, M5c komplett, M6 komplett, **M7.1 erledigt** (Backend-Catalog-Workflow: `catalog_status += 'rejected'` via `autocommit_block`, drei Audit-Spalten `rejected_by/rejected_at/reject_reason`, RLS für eigene rejected + Editor-Withdraw, neue Endpunkte `PATCH/DELETE /<kind>/{id}` und `POST /<kind>/{id}/reject`, +22 Tests, Backend 172/172 grün); M7.2–M7.5 (Frontend `/admin/catalogs`, Forms, Freigabe-Queue, Restraint-Picker) als nächstes |
| Phase 2 — Konsolidierung (Tileserver, Backups, Monitoring, Medien, Statistik) | offen |
| Phase 3 — Pfad-B-Vorbereitung | nicht aktiviert |

Der vollständige Meilensteinplan liegt in [`fahrplan.md`](./docs/fahrplan.md). M0–M4 sind abgeschlossen: Backend mit Schema/Migrations/RLS, Auth+CSRF+RBAC, Domain-API (Events, Applications, Persons, Catalog, Search, Throwbacks, Export), und ein Next.js-Frontend mit Login, Cookie-Session, geschütztem Layout (Sidebar Desktop / Bottom-Nav Mobile), Dark-Mode und Stub-Seiten für die kommenden Meilensteine. M5a.1 ergänzt sechs Backend-Live-Routen (events/start, events/{id}/end, applications/start, applications/{id}/end, persons/quick) und einen MapTiler-Tile-Proxy (`/api/tiles/{z}/{x}/{y}`). M5a.2 fügt eine globale Volltextsuche (Suchleiste in der App-Shell, `/search?q=…`-Seite mit RLS-konformen Treffern und sicherem Snippet-Highlighting), das Datensouveränitäts-Export-UI im Profil (JSON + CSV, admin-Vollexport) und einen Bug-Fix am Dashboard-Throwback-Schema hinzu — alles als reiner Frontend-Konsum bestehender M3-Endpoints. M5a.3 ergänzt den Frontend-Live-Modus: `LocationPickerMap` (MapLibre + react-map-gl), `/events/new`-Flow mit GPS, Karten-Korrektur, Recipient-Picker und on-the-fly-Personenanlage, sowie `/events/[id]`-Live-Ansicht mit Wakelock, Sekunden-Timer, Application-Erfassung und Schnellaktionen. Eine kleine additive Backend-Erweiterung (`GET /api/events/{event_id}/applications`) liefert die Anwendungs-Liste pro Event. M5a.4 schließt die M5a-Serie mit einer clientseitigen App-PIN-Sperre (PBKDF2-SHA-256 via Web Crypto API, 600.000 Iterationen, 4–6-Ziffern-PIN in IndexedDB, Inaktivitäts-Timer, Zwangs-Logout nach 5 Fehlversuchen) — Schutz gegen Schulterblick und kurze fremde Übernahme eines entsperrten Geräts. M5b.1 legt das Datenmodell-Fundament für die RxDB-Replication: ADR-029 (Conflict-Resolution Live-First mit Reconciliation), ADR-030 (Soft-Delete mit Cascade-Trigger Event→Application + Cursor-Index `(updated_at, id)`), ADR-031 (RxDB-Schema-Source-of-Truth: hand gepflegt + Drift-Test) und ADR-032 (keine IndexedDB-Encryption in Pfad A) plus die zugehörige Alembic-Migration. M5b.2 ergänzt die vier Backend-Sync-Endpoints `GET/POST /api/sync/{events,applications}/{pull,push}` mit Cursor-Pagination, Tombstone-Replikation und Pro-Feld-Conflict-Resolution. Im Zuge der Implementierung wurde ein latent-Bug aus der M2-Strict-RLS aufgedeckt und behoben (neue Owner-SELECT-Policies via Migration `20260426_1830_m5b2_owner_select`); zusätzlich filtern die regulären CRUD-/Search-/Export-Routes ab sofort Soft-Deletes raus, während die Sync-Endpoints Tombstones bewusst durchreichen. Backend-Suite 125/125 grün, `app/sync/`-Coverage 91 %. M5b.3 schließt die Sync-Schicht im Frontend: RxDB v17 mit Dexie-Storage in `lib/rxdb/{database,schemas,replication,provider}.tsx`, Replication-Worker pro Collection mit CSRF-Cookie-Echo und aggregiertem Sync-Status, Live-Modus-Refactor von TanStack-Query/REST auf RxDB-Schreibpfad und reactive Subscriptions (`events.findOne(id).$`, `applications.find({event_id, _deleted=false}).$`), und ein kleiner Sync-Indikator (Cloud / Loader / CloudOff / TriangleAlert) in Sidebar und Mobile-Header. Frontend-Suite 60/60, ESLint und tsc clean, Build und Browser-Verifikation erfolgreich. **M5b.4** schließt die Sub-Schritt-Reihe mit dem End-to-End-Offline-Beweis: Vitest + `fake-indexeddb` + In-Process-Mock-Server fahren drei Replication-Szenarien (offline → reconnect → genau einmal, Re-Sync-Idempotenz, Pull-Round-Trip server-bumpter Felder); Backend ergänzt drei Idempotenz-Tests, die die „exakt einmal"-Eigenschaft auf Protokoll-Ebene festklemmen. Coverage Frontend `lib/rxdb/**` 92.43 % Lines / 80 % Branches / 100 % Functions, Backend 128/128 grün, alle Lints clean. **M5c** schließt die nachträgliche Erfassung und Bearbeitung ab (Detail-Page Client-only, `event_participant` als RxDB-Sync-Collection, unified `EventDetailView` mit Applications-Timeline und Frontend-Maskierung, `EventBackfillForm` für Backfills, `/events/[id]/edit` mit RBAC-Server-Gate, Diff-basiertem Patchen und Soft-Delete via RxDB-Push). **M6 (Kartenansicht)** ergänzt einen Backend-Geocoding-Proxy `GET /api/geocode` mit In-Memory-Token-Bucket pro User (`HCMAP_GEOCODE_RATE_PER_MINUTE`, Default 30) und Frontend-`MapView` mit RxDB-Marker-Subscription, nativen MapLibre-Cluster (kein `supercluster` — ADR-041 §C, `architecture.md` mitgezogen), Popup mit Detail-Link, URL-State (`lat`/`lon`/`zoom`/`from`/`to`/`p`-UUIDs), debounced URL-Sync via `router.replace({ scroll: false })`, Filter-Drawer (Zeitraum + Beteiligte über `/api/persons`-REST) und Geocoding-Suchbox mit `flyTo` zur Adresse + Toast-Mapping für 429/503/502. Coverage `lib/map/**` 99.12 % Lines / 93.1 % Branches, Backend-Suite 150/150, Frontend-Suite 194/194 grün.

---

## Technischer Stack

Die Auswahl ist über ADRs (siehe [`decisions.md`](./docs/decisions.md)) fixiert.

| Schicht | Komponente |
|---|---|
| Backend-Sprache | Python 3.12 (Package-Manager: uv) |
| Web-Framework | FastAPI |
| ORM / Migrations | SQLAlchemy 2.0 / Alembic |
| Validierung | Pydantic v2 |
| Auth | fastapi-users (HttpOnly-Cookie-Sessions, RBAC: Admin / Editor / Viewer) |
| Datenbank | PostgreSQL 16 + PostGIS 3 |
| Frontend | Next.js (App Router) + TypeScript strict |
| Styling | Tailwind CSS + shadcn/ui |
| Server-State | TanStack Query |
| Karten | MapLibre GL JS via `react-map-gl` |
| Karten-Tiles | MapTiler Cloud (Phase 1) → Self-Hosted (Phase 2, M12) |
| Offline-Sync | RxDB + Dexie-Storage (siehe ADR-017) |
| Admin-UI | SQLAdmin unter `/admin` + Next.js-Admin-Dash unter `/admin-dash` (siehe ADR-016) |
| Reverse Proxy | Caddy (automatisches TLS via Let's Encrypt) |
| Laufzeit | Docker Compose (lokal und VPS-Produktion) |

**Explizit nicht erlaubt:** Google Maps, Mapbox GL ab v2, externe Cloud-Services für Datenhaltung, what3words in der Produktion nach der Migration, GPL-/AGPL-Abhängigkeiten ohne Freigabe. Details in [`project-context.md`](./docs/project-context.md#3-technischer-stack).

---

## Repository-Struktur

Die finale Struktur gemäß [`architecture.md`](./docs/architecture.md) ist ein Monorepo:

```
hc-map/
├── backend/        # FastAPI-App, SQLAlchemy-Modelle, Alembic-Migrations, Seeds
├── frontend/       # Next.js-App, shadcn/ui-Komponenten, RxDB-Setup
├── docker/         # Dockerfiles, docker-compose.yml, Caddyfile
├── ops/            # Backup-/Restore-Skripte, Runbook
└── docs/           # Projekt-Dokumentation (siehe unten)
```

M0–M6 sind umgesetzt: `backend/` enthält Schema, Migrations, RLS-Policies, Auth-Layer, Domain-API plus Live-Endpoints, RxDB-Sync-Endpoints, MapTiler-Tile-Proxy, MapTiler-Geocoding-Proxy mit Rate-Limit, Search/Throwbacks/Export; `frontend/` enthält Login-Flow, geschütztes Layout (Sidebar Desktop / Bottom-Nav Mobile mit globaler Suchleiste), Dark-Mode, `/search`-Seite mit sicherem Snippet-Highlighting, Datenexport-UI im Profil, Dashboard mit „Neues Event starten"- und „Nachträglich erfassen"-CTAs, `/events/new`-Live-Erfassung mit MapLibre-Karten-Picker und on-the-fly-Personenanlage, `/events/new/backfill` für nachträgliche Eingaben, einheitliche `/events/[id]`-Detail-Ansicht (live wie beendet), `/events/[id]/edit` mit RBAC-Server-Gate und RxDB-Diff-Patching, Vollbild-`/map` mit nativen MapLibre-Cluster, Filter-Drawer (Zeitraum + Beteiligte) und Geocoding-Suchbox sowie eine clientseitige App-PIN-Sperre als querliegender Schutz gegen Schulterblick; `docker/` startet Postgres+PostGIS, Backend und Frontend lokal. `ops/` und der eigene Tileserver folgen mit M10/M12.

---

## Setup

### Voraussetzungen

- Docker & Docker Compose v2 (aktuelle Stable)
- Python 3.12 + [uv](https://docs.astral.sh/uv/) (für Backend-Tooling außerhalb von Docker)
- Node 22+ und [pnpm](https://pnpm.io/) 10 (für Frontend-Tooling außerhalb von Docker)

### Lokale Entwicklung mit Docker

```bash
# Repository klonen
git clone https://github.com/Paddel87/hc-map.git
cd hc-map

# Environment vorbereiten
cp .env.example .env

# Stack starten (Backend + Frontend + Postgres/PostGIS)
docker compose -f docker/docker-compose.yml up --build

# Schema migrieren, Kataloge seeden, ersten Admin anlegen (in separater Shell)
docker compose -f docker/docker-compose.yml exec backend alembic upgrade head
docker compose -f docker/docker-compose.yml exec backend python -m app.seeds.run
docker compose -f docker/docker-compose.yml exec backend python -m scripts.bootstrap_admin \
    --email admin@example.com --password change-me-12-or-more
```

Nach dem Start (Ports sind nur an `127.0.0.1` gebunden):

- Frontend: <http://localhost:3000>
- Backend-Health: <http://localhost:8000/api/health>
- OpenAPI-Doku: <http://localhost:8000/api/docs>

### Backend ohne Docker

```bash
cd backend
uv sync

# Lokal Postgres+PostGIS auf Port 5432, dann:
export HCMAP_DATABASE_URL='postgresql+asyncpg://hcmap:hcmap@localhost:5432/hcmap'
uv run alembic upgrade head
uv run python -m app.seeds.run

uv run uvicorn app.main:app --reload --port 8000
# Tests gegen einen Test-Postgres:
HCMAP_TEST_DATABASE_URL='postgresql+psycopg://...' uv run pytest
uv run ruff check .
uv run mypy app
```

### Frontend ohne Docker

```bash
cd frontend
pnpm install
pnpm dev          # http://localhost:3000
pnpm lint
pnpm typecheck
pnpm format:check
```

### Pre-commit-Hooks (optional)

```bash
pip install --user pre-commit
pre-commit install
pre-commit run --all-files
```

---

## Sicherheit und Datenschutz

HC-Map verarbeitet Daten der Kategorie Art. 9 DSGVO (Sexualleben). Die Betriebsgrundlage ist bewusst restriktiv:

- **Hosting:** Eigener VPS mit EU-Standort, Full-Disk-Encryption, TLS-Pflicht, Fail2ban, SSH-Key-Only.
- **Auth:** fastapi-users mit Cookie-Sessions, CSRF-Schutz via Double-Submit-Token, Argon2id für Passwörter (min. 12 Zeichen).
- **Zugriffskontrolle:** Row-Level-Security auf DB-Ebene, GUC-basierte User-Identität pro Request (100 % Test-Abdeckung für RLS-Policies vorgeschrieben).
- **Client-Härtung:** App-PIN mit Zwangs-Logout nach 5 Fehlversuchen, Sperre nach Inaktivität.
- **Logging:** Strukturiertes Logging mit Redaction-Liste — **keine personenbezogenen Daten in Logs** (Namen, Notizen, Koordinaten werden entfernt).
- **Anonymisierung:** DSGVO-Art.-17-Endpunkt, Namensersatz bei Ausscheiden, Verknüpfungen bleiben erhalten (siehe [ADR-002](./docs/decisions.md#adr-002--anonymisierung-beim-ausscheiden-von-mitgliedern)).
- **Keine App-seitige Verschlüsselung** der Nutzdaten — bewusste Entscheidung für Pfad A, dokumentiert in [ADR-001](./docs/decisions.md#adr-001--hoster-vertrauen-und-verzicht-auf-app-seitige-verschlüsselung).

**Vor Go-Live (M11)** muss ein schriftlicher Einwilligungstext vorliegen, der Vertrauensmodell, Anonymisierungs-Kompromiss, On-the-fly-Personenanlage und Aggregat-Statistik explizit benennt.

---

## Dokumentation

Die Pflege der Dokumentation folgt [`CLAUDE.md`](./CLAUDE.md). Für den Einstieg in jeder neuen Arbeitssession **in dieser Reihenfolge** lesen:

| Datei | Zweck |
|---|---|
| [`docs/project-context.md`](./docs/project-context.md) | Projektdefinition, Stack, Constraints, Glossar |
| [`docs/fahrplan.md`](./docs/fahrplan.md) | Meilensteine, Akzeptanzkriterien, aktueller Stand |
| [`docs/architecture.md`](./docs/architecture.md) | Modulgrenzen, Datenmodell, API-Verträge, Repo-Struktur |
| [`docs/decisions.md`](./docs/decisions.md) | ADRs (Architecture Decision Records) |
| [`docs/blockers.md`](./docs/blockers.md) | Offene Probleme, gescheiterte Ansätze |
| [`CLAUDE.md`](./CLAUDE.md) | Arbeitsmethodik für KI-gestützte Entwicklung |
| [`docs/framework-analyse.md`](./docs/framework-analyse.md) | Begleitende Stack-Evaluation |
| [`docs/restraint-types-seed-review.md`](./docs/restraint-types-seed-review.md) | Quelle für den initialen RestraintType-Seed (M1) |

---

## Mitwirken

Das Repository wird aktuell von einer Person (Admin, Repository-Eigentümer) betrieben. Beiträge von außen sind in der aktuellen Phase **nicht vorgesehen**.

**Branch-Konvention:**

- Hauptbranch: `main`
- Feature-Branches: `feat/<kurztitel>`, Bugfixes: `fix/<kurztitel>`, Refactorings: `refactor/<kurztitel>`
- Commit-Format und Regeln: siehe [`CLAUDE.md`](./CLAUDE.md#11-commit--und-branch-konvention)
- Keine Force-Pushes auf `main`. Ab M11 nur noch PRs mit Self-Review.

---

## Lizenz

**Noch nicht festgelegt.** Die Entscheidung fällt vor M11 (Go-Live Pfad A). Realistische Optionen sind AGPLv3, MIT oder proprietär — abhängig davon, ob eine Multi-Instanz-Variante für andere Gruppen aktiv unterstützt werden soll (siehe [`project-context.md` §6](./docs/project-context.md#6-constraints-operationalisierbar)).

Bis dahin gilt: **Keine öffentliche Veröffentlichung, alle Rechte vorbehalten.**
