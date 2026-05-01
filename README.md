# HC-Map

**Selbst gehostetes, geo-referenziertes Logbuch für Fesselungs-Ereignisse einer geschlossenen Gruppe.**

[![Status](https://img.shields.io/badge/status-mvp--phase--1-yellow)](./docs/fahrplan.md)
[![Phase](https://img.shields.io/badge/phase-M10.4--erledigt-blue)](./docs/fahrplan.md#phasen-übersicht)
[![Version](https://img.shields.io/badge/version-v0.0.0-lightgrey)](./docs/project-context.md#1-kerndaten)
[![Lizenz](https://img.shields.io/badge/lizenz-AGPL--3.0--only-blue)](./LICENSE)
[![Docs](https://img.shields.io/badge/docs-deutsch-yellow)](./docs/project-context.md)
[![Scope](https://img.shields.io/badge/scope-Pfad%20A%20(%3C20%20Nutzer)-informational)](./docs/project-context.md#pfad-a-vs-pfad-b-zwei-scope-stufen)

**Stack (real verbaut):**
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)](./docs/decisions.md#adr-005--backend-stack-fastapi--sqlalchemy--postgrespostgis)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.136-009688?logo=fastapi&logoColor=white)](./docs/decisions.md#adr-005--backend-stack-fastapi--sqlalchemy--postgrespostgis)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-D71F00)](./docs/decisions.md#adr-005--backend-stack-fastapi--sqlalchemy--postgrespostgis)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](./docs/decisions.md#adr-005--backend-stack-fastapi--sqlalchemy--postgrespostgis)
[![PostGIS](https://img.shields.io/badge/PostGIS-3-336791)](./docs/decisions.md#adr-005--backend-stack-fastapi--sqlalchemy--postgrespostgis)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)](./docs/decisions.md#adr-007--frontend-stack-nextjs--typescript--tailwind--shadcnui)
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
  - Caddy / Traefik (TLS-Reverse-Proxy, Wahl pro Instanz)  → mit M10.5
  - GitHub-Actions-CI + GHCR-Multi-Arch-Image-Pull         → mit M10.7
  - aiosmtplib (Mail-Backend) — produktiv seit M10.2, Badge-würdig sobald die README einen "Test-Status"-Badge bekommt
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
| Phase 1 — MVP / Go-Live Pfad A | M0–M8 erledigt, M9 verworfen (ADR-050), **M10 in Arbeit** (RC-Bündel: M10.1–M10.4 erledigt, M10.5–M10.9 offen). M11 (Go-Live) folgt nach RC-Stabilisierung. |
| Phase 2 — Konsolidierung (Tileserver, Backups, Monitoring, Medien, Statistik) | offen |
| Phase 3 — Pfad-B-Vorbereitung | nicht aktiviert |

Der vollständige Meilensteinplan liegt in [`fahrplan.md`](./docs/fahrplan.md), die Architektur-Entscheidungen in [`decisions.md`](./docs/decisions.md). Aktueller Test-Stand: Backend pytest **231/231 grün**, Frontend vitest **278/278 grün**, `ruff`/`mypy --strict`/`tsc --noEmit`/`eslint` clean.

**Kurzüberblick erledigte Phase-1-Meilensteine:**

- **M0–M4** — Setup, DB-Schema mit RLS, Auth+CSRF+RBAC (fastapi-users, Cookie-Sessions, Argon2id), Domain-API (Events, Applications, Persons, Catalog, Search, Export, Throwbacks), Next.js-Frontend mit Login, geschütztem Layout (Sidebar Desktop / Bottom-Nav Mobile) und Dark-Mode.
- **M5a** — Live-Modus mobil: GPS, `LocationPickerMap` (MapLibre), `/events/new`-Flow mit on-the-fly-Personenanlage, Sekunden-Timer + Wakelock, MapTiler-Tile-Proxy `/api/tiles/{z}/{x}/{y}`, App-PIN-Sperre (PBKDF2 via Web Crypto API, Inaktivitäts-Timer, Zwangs-Logout).
- **M5b** — Offline-Resilienz: vier Backend-Sync-Endpoints `/api/sync/{events,applications}/{pull,push}` mit Cursor-Pagination, Tombstones und Pro-Feld-Conflict-Resolution; RxDB v17 mit Dexie-Storage im Frontend; Live-Modus läuft auf RxDB-Schreibpfad mit reactive Subscriptions; End-to-End-Offline-Tests + Idempotenz-Tests gegen die „exakt einmal"-Eigenschaft.
- **M5c** — Nachträgliche Erfassung und Bearbeitung: Detail-Page client-only, `event_participant` als RxDB-Collection, unified `EventDetailView` mit Applications-Timeline und Frontend-Maskierung, `EventBackfillForm`, `/events/[id]/edit` mit RBAC-Server-Gate und Diff-basiertem Patchen, Soft-Delete via RxDB-Push.
- **M6** — Kartenansicht: Backend-Geocoding-Proxy `/api/geocode` mit Token-Bucket-Rate-Limit pro User; Frontend-`MapView` mit RxDB-Marker-Subscription, nativen MapLibre-Clustern, Popup-Detail-Link, URL-State, Filter-Drawer (Zeitraum + Beteiligte) und Geocoding-Suchbox.
- **HOTFIX-001/002, STACK-001/002** — Karten-DoD-Härtung (Glyph-Proxy + RxDB-v17-Strict-Checks; ADR-044), Sonner v1→v2 (React-19-Kompat; ADR-042), Frontend-Voll-Sweep auf Next.js 16.2.4 + React 19.2 (ADR-047), Backend-Voll-Sweep mit aktuellen Pin-Bumps (ADR-048).
- **M7** — Katalog-Verwaltung & Vorschlags-Workflow: Editoren schlagen Restraints/Positionen vor, Admin gibt frei oder lehnt ab (Status-Maschine `proposed` → `approved`/`rejected`); Restraint-Picker und Positionen-Picker in Application-Erfassung über `LookupPicker`.
- **M8** — Admin-Bereich (zwei-schichtig nach ADR-016/049): Backend-SQLAdmin für Stammdaten-CRUD und Daten-Inspektion; Next.js-Workflow-UI mit Dashboard (Statistik), `/admin/users` (Linkable-Person-Picker), `/admin/persons` (Filter, Merge-Wizard, Anonymisierungs-Dialog) und Admin-Export.
- **M9** — Verworfen (ADR-050). Datenbestand wird manuell über die M5c-Backfill-UI nachgetragen, kein Migrationsskript. Spalte `event.legacy_external_ref` (ehemals `w3w_legacy`) bleibt als optionales Feld erhalten; UI-Anbindung folgt als M5c-NACH (nicht-blockierend für M10/M11).
- **M10 (in Arbeit, Release-Candidate-Bündel — ADR-051):**
  - **M10.1** ✅ Strategie-ADR-051 freigegeben — Multi-Instanz-Anspruch („deployment-ready durch jedermann"), AGPLv3, Caddy + Traefik wahlweise via Compose-Overlays, Mail-Backend `aiosmtplib`, Backup `pg_dump | age | rclone`, GHCR Multi-Arch public, RC-Versionsschema `v0.1.0-rc.1`.
  - **M10.2** ✅ Mail-Backend SMTP produktiv: `aiosmtplib` + `SMTPMailer` neben bestehendem `LoggingBackend`, Frontend-Pages `/forgot-password` + `/reset-password` mit no-enumeration-Verhalten, „Passwort vergessen?"-Link in Login-Form, voller Browser-Smoke-Roundtrip lokal verifiziert.
  - **M10.3** ✅ Projektlizenz AGPLv3 — `LICENSE`-File, SPDX-Identifier in `pyproject.toml`/`package.json`, README-Lizenz-Block; Compliance-Check über 76 Backend- + Frontend-Prod-Pakete ohne GPL-/proprietäre Treffer.
  - **M10.4** ✅ Einwilligungs-Vorlage [`docs/templates/consent-de.md`](./docs/templates/consent-de.md) mit acht Platzhaltern und 12 Abschnitten, deckt ADR-001/002/014/015/032 + Phase-2-Foto-Platzhalter + Auskunfts-/Widerrufsrechte ab.
  - **M10.5–M10.9** ⏳ offen: `compose.prod.yml` + Caddy/Traefik-Overlays + Migrations-Auto-Run mit Advisory-Lock; Backup-Service-Container; GitHub-Actions-CI mit GHCR-Push (Multi-Arch); `ops/runbook.md` + README-Operator-Quickstart; RC-Voll-Smoke + Tag `v0.1.0-rc.1` + GitHub-Pre-Release.

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
| Admin-UI | Zwei Schichten: SQLAdmin im Backend (Stammdaten-Pflege) + Next.js-Workflow-UI im Frontend (Dashboard, User-Verwaltung, Personen-Merge, Anonymisierung); siehe ADR-016, ADR-049 |
| Mail-Versand | SMTP via `aiosmtplib` (Passwort-Reset und Verify); LoggingBackend als Default in Dev/Test (ADR-051 §C) |
| Reverse Proxy | Caddy oder Traefik — Wahl pro Instanz via Compose-Overlay, beide mit Auto-TLS via Let's Encrypt (ADR-051 §B) |
| Laufzeit | Docker Compose (lokal und VPS-Produktion); Multi-Arch-Images (`linux/amd64`, `linux/arm64`) auf GHCR ab M10.7 |

**Explizit nicht erlaubt:** Google Maps, Mapbox GL ab v2, externe Cloud-Services für Datenhaltung, what3words (Migrations-Brücke ursprünglich für M9 geplant, verworfen mit ADR-050), proprietäre/kommerzielle Abhängigkeitslizenzen. GPL-/AGPL-Abhängigkeiten sind seit ADR-051 (AGPLv3-Hauptlizenz) zulässig. Details in [`project-context.md`](./docs/project-context.md#3-technischer-stack).

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

**Stand:** `backend/`, `frontend/` und `docker/` sind voll umgesetzt. Backend liefert Schema/Migrations/RLS, Auth, Domain-API, Sync-Endpoints, Tile-/Geocoding-Proxy, Admin-API, Mail-Backend (M10.2). Frontend bietet Login + Reset-Flow, Dashboard, Live-Modus, Backfill, Detail- und Edit-Pages, Vollbild-Karte mit Cluster und Suchbox, Admin-Dashboard mit User-/Personen-Verwaltung. Lokale Compose-Konfig in `docker/`; Produktiv-Compose mit Caddy-/Traefik-Overlays folgt mit M10.5. `ops/` (Backup-Skripte, Runbook) wird mit M10.6/M10.8 angelegt. Self-hosted Tileserver bleibt Phase 2 (M12).

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
# Pflicht für Kartenfunktion: HCMAP_MAPTILER_API_KEY in .env eintragen
# (Free-Tier-Key auf https://cloud.maptiler.com — leer lassen = Karten zeigen 503).
# Optional für Mail-Versand: HCMAP_SMTP_HOST setzen — sonst loggt der
# LoggingBackend Reset-/Verify-Links nur ins Backend-Log (Dev-Default).

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
- **Auth:** fastapi-users mit Cookie-Sessions, CSRF-Schutz via Double-Submit-Token, Argon2id für Passwörter (min. 12 Zeichen). Passwort-Reset per Mail produktiv (`aiosmtplib`-SMTP-Backend, no-enumeration-Verhalten — siehe M10.2).
- **Zugriffskontrolle:** Row-Level-Security auf DB-Ebene, GUC-basierte User-Identität pro Request (100 % Test-Abdeckung für RLS-Policies vorgeschrieben).
- **Client-Härtung:** App-PIN mit Zwangs-Logout nach 5 Fehlversuchen, Sperre nach Inaktivität.
- **Logging:** Strukturiertes Logging mit Redaction-Liste — **keine personenbezogenen Daten in Logs** (Namen, Notizen, Koordinaten werden entfernt).
- **Anonymisierung:** DSGVO-Art.-17-Endpunkt, Namensersatz bei Ausscheiden, Verknüpfungen bleiben erhalten (siehe [ADR-002](./docs/decisions.md#adr-002--anonymisierung-beim-ausscheiden-von-mitgliedern)).
- **Keine App-seitige Verschlüsselung** der Nutzdaten — bewusste Entscheidung für Pfad A, dokumentiert in [ADR-001](./docs/decisions.md#adr-001--hoster-vertrauen-und-verzicht-auf-app-seitige-verschlüsselung).

**Vor Go-Live (M11)** muss ein schriftlicher Einwilligungstext vorliegen, der Vertrauensmodell, Anonymisierungs-Kompromiss, On-the-fly-Personenanlage und Aggregat-Statistik explizit benennt. HC-Map liefert dafür eine deutschsprachige Vorlage in [`docs/templates/consent-de.md`](./docs/templates/consent-de.md) — Operator passt Platzhalter (`[GRUPPENNAME]`, `[ADMIN-NAME]`, `[INSTANZ-URL]`, `[HOSTING-PROVIDER]`, `[HOSTING-STANDORT]`, `[BACKUP-ZIEL]`) an die eigene Instanz an. Die Vorlage ist keine Rechtsberatung; bei Bedarf juristisch prüfen lassen.

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

HC-Map steht unter der **GNU Affero General Public License, Version 3 (AGPLv3)** — siehe [`LICENSE`](./LICENSE).

Kurz zusammengefasst:

- **Du darfst** HC-Map verwenden, modifizieren, weiterverteilen und auf einem eigenen Server (Multi-Instanz-Modell) für eine eigene Gruppe betreiben.
- **Du musst** den Quellcode samt eigener Änderungen unter derselben AGPLv3-Lizenz weitergeben — auch wenn du HC-Map nur als Netzwerkdienst (z. B. eigene Web-Instanz) für andere bereitstellst (das ist die spezifische AGPLv3-Klausel).
- Diese Wahl ist Konsequenz aus dem Multi-Instanz-Anspruch (ADR-051): jeder darf HC-Map deployen, niemand darf eine geschlossene proprietäre Variante daraus machen.

Diese Zusammenfassung ist nicht rechtsverbindlich; verbindlich ist ausschließlich der englische Originaltext in [`LICENSE`](./LICENSE).
