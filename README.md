# HC-Map

**Selbst gehostetes, geo-referenziertes Logbuch für Fesselungs-Ereignisse einer geschlossenen Gruppe.**

[![Status](https://img.shields.io/badge/status-konzeption-orange)](./fahrplan.md)
[![Phase](https://img.shields.io/badge/phase-pre--M0-lightgrey)](./fahrplan.md#phasen-übersicht)
[![Version](https://img.shields.io/badge/version-v0.0.0-lightgrey)](./project-context.md#1-kerndaten)
[![Lizenz](https://img.shields.io/badge/lizenz-offen-red)](./project-context.md#6-constraints-operationalisierbar)
[![Docs](https://img.shields.io/badge/docs-deutsch-yellow)](./project-context.md)
[![Scope](https://img.shields.io/badge/scope-Pfad%20A%20(%3C20%20Nutzer)-informational)](./project-context.md#pfad-a-vs-pfad-b-zwei-scope-stufen)

**Stack:**
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)](./decisions.md#adr-005--backend-stack-fastapi--sqlalchemy--postgrespostgis)
[![FastAPI](https://img.shields.io/badge/FastAPI-modern-009688?logo=fastapi&logoColor=white)](./decisions.md#adr-005--backend-stack-fastapi--sqlalchemy--postgrespostgis)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-D71F00)](./decisions.md#adr-005--backend-stack-fastapi--sqlalchemy--postgrespostgis)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](./decisions.md#adr-005--backend-stack-fastapi--sqlalchemy--postgrespostgis)
[![PostGIS](https://img.shields.io/badge/PostGIS-3-336791)](./decisions.md#adr-005--backend-stack-fastapi--sqlalchemy--postgrespostgis)
[![Next.js](https://img.shields.io/badge/Next.js-App_Router-000000?logo=nextdotjs&logoColor=white)](./decisions.md#adr-007--frontend-stack-nextjs--typescript--tailwind--shadcnui)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](./decisions.md#adr-007--frontend-stack-nextjs--typescript--tailwind--shadcnui)
[![Tailwind](https://img.shields.io/badge/Tailwind-CSS-06B6D4?logo=tailwindcss&logoColor=white)](./decisions.md#adr-007--frontend-stack-nextjs--typescript--tailwind--shadcnui)
[![MapLibre](https://img.shields.io/badge/MapLibre-GL_JS-396CB2)](./decisions.md#adr-008--karten-layer-maplibre-gl-js-maptiler-jetzt-self-host-später)
[![RxDB](https://img.shields.io/badge/RxDB-offline--sync-8D1F89)](./decisions.md#adr-017--rxdb-für-offline-sync-in-live-modus)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](./architecture.md)
[![Caddy](https://img.shields.io/badge/Caddy-TLS_automatisch-1F88C0)](./architecture.md)

---

## Inhalt

- [Worum es geht](#worum-es-geht)
- [Projektstatus](#projektstatus)
- [Technischer Stack](#technischer-stack)
- [Repository-Struktur](#repository-struktur)
- [Setup (geplant ab M0)](#setup-geplant-ab-m0)
- [Sicherheit und Datenschutz](#sicherheit-und-datenschutz)
- [Dokumentation](#dokumentation)
- [Mitwirken](#mitwirken)
- [Lizenz](#lizenz)

---

## Worum es geht

HC-Map ist ein **Full-Stack-Web-Projekt** (Mobile-First-PWA) zur strukturierten Erfassung, Auswertung und kartografischen Darstellung von Fesselungs-Ereignissen (Bondage-Kontext, einvernehmlich, ausschließlich Erwachsene) innerhalb einer **privaten, einander persönlich bekannten Gruppe** mit weniger als 20 Personen.

**Kernmotiv:** Datensouveränität. Das System löst einen vorherigen Einsatz von [what3words](https://what3words.com/) ab und verlagert Speicherung, Zugriff und Auswertung vollständig auf selbst betriebene Infrastruktur.

**Kernbegriffe** (ausführlich in [`project-context.md`](./project-context.md#12-glossar-projektspezifische-begriffe)):

- **Event** — abgeschlossener oder laufender Gesamt-Vorgang an einem Ort mit Start-/Endzeit.
- **Application** — konkrete Fesselungs-Aktion innerhalb eines Events, sequenziert mit eigenen Zeitstempeln, Performer, Recipient, Restraints und Positionen.
- **Live-Modus** — primäre Erfassungsansicht (mobil, GPS, Timer, Offline-fähig).
- **Pfad A / Pfad B** — Scope-Stufen: A = aktive private Gruppe, B = geschlossene Community (aktuell nicht verfolgt).

---

## Projektstatus

| Phase | Stand |
|---|---|
| Phase 1 — MVP / Go-Live Pfad A | M0 steht bevor |
| Phase 2 — Konsolidierung (Tileserver, Backups, Monitoring, Medien, Statistik) | offen |
| Phase 3 — Pfad-B-Vorbereitung | nicht aktiviert |

Der vollständige Meilensteinplan liegt in [`fahrplan.md`](./fahrplan.md). Es gibt aktuell **keine lauffähige Anwendung** — das Repository enthält ausschließlich die Konzeptions- und Planungsdokumente.

---

## Technischer Stack

Die Auswahl ist über ADRs (siehe [`decisions.md`](./decisions.md)) fixiert.

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

**Explizit nicht erlaubt:** Google Maps, Mapbox GL ab v2, externe Cloud-Services für Datenhaltung, what3words in der Produktion nach der Migration, GPL-/AGPL-Abhängigkeiten ohne Freigabe. Details in [`project-context.md`](./project-context.md#3-technischer-stack).

---

## Repository-Struktur

Die finale Struktur gemäß [`architecture.md`](./architecture.md) ist ein Monorepo:

```
hc-map/
├── backend/        # FastAPI-App, SQLAlchemy-Modelle, Alembic-Migrations, Seeds
├── frontend/       # Next.js-App, shadcn/ui-Komponenten, RxDB-Setup
├── docker/         # Dockerfiles, docker-compose.yml, Caddyfile
├── ops/            # Backup-/Restore-Skripte, Runbook
└── docs/           # Projekt-Dokumentation (siehe unten)
```

**Aktuell** existieren nur Konzeptions-Dokumente im Repository-Root. Die `backend/`-, `frontend/`-, `docker/`- und `ops/`-Bereiche werden in M0 angelegt.

---

## Setup (geplant ab M0)

> **Hinweis:** Dieser Abschnitt beschreibt den Zielzustand nach Abschluss von [M0 — Projekt-Setup](./fahrplan.md#m0--projekt-setup). Solange M0 nicht umgesetzt ist, sind die Kommandos unten **nicht ausführbar**.

### Voraussetzungen

- Docker & Docker Compose (aktuelle Stable)
- Python 3.12 + [uv](https://docs.astral.sh/uv/) (für Backend-Tooling außerhalb von Docker)
- Node 20+ und [pnpm](https://pnpm.io/) (für Frontend-Tooling außerhalb von Docker)

### Lokale Entwicklung

```bash
# Repository klonen
git clone https://github.com/Paddel87/hc-map.git
cd hc-map

# Environment vorbereiten
cp .env.example .env
# .env anpassen: DB-Credentials, MapTiler-Key, SECRET_KEY, …

# Stack starten (Backend + Frontend + Postgres/PostGIS)
docker compose up

# Datenbank migrieren und Kataloge seeden (in separater Shell)
docker compose exec backend alembic upgrade head
docker compose exec backend python -m app.seeds

# Admin-User anlegen
docker compose exec backend python scripts/bootstrap_admin.py
```

Nach dem Start:

- Frontend: <http://localhost:3000>
- Backend-API + OpenAPI-Doku: <http://localhost:8000/docs>
- SQLAdmin: <http://localhost:8000/admin>

### Tests

```bash
# Backend
docker compose exec backend pytest

# Frontend
docker compose exec frontend pnpm test
```

### Linting / Formatierung

```bash
# Backend
docker compose exec backend ruff check .
docker compose exec backend mypy --strict app

# Frontend
docker compose exec frontend pnpm lint
docker compose exec frontend pnpm tsc --noEmit
```

---

## Sicherheit und Datenschutz

HC-Map verarbeitet Daten der Kategorie Art. 9 DSGVO (Sexualleben). Die Betriebsgrundlage ist bewusst restriktiv:

- **Hosting:** Eigener VPS mit EU-Standort, Full-Disk-Encryption, TLS-Pflicht, Fail2ban, SSH-Key-Only.
- **Auth:** fastapi-users mit Cookie-Sessions, CSRF-Schutz via Double-Submit-Token, Argon2id für Passwörter (min. 12 Zeichen).
- **Zugriffskontrolle:** Row-Level-Security auf DB-Ebene, GUC-basierte User-Identität pro Request (100 % Test-Abdeckung für RLS-Policies vorgeschrieben).
- **Client-Härtung:** App-PIN mit Zwangs-Logout nach 5 Fehlversuchen, Sperre nach Inaktivität.
- **Logging:** Strukturiertes Logging mit Redaction-Liste — **keine personenbezogenen Daten in Logs** (Namen, Notizen, Koordinaten werden entfernt).
- **Anonymisierung:** DSGVO-Art.-17-Endpunkt, Namensersatz bei Ausscheiden, Verknüpfungen bleiben erhalten (siehe [ADR-002](./decisions.md#adr-002--anonymisierung-beim-ausscheiden-von-mitgliedern)).
- **Keine App-seitige Verschlüsselung** der Nutzdaten — bewusste Entscheidung für Pfad A, dokumentiert in [ADR-001](./decisions.md#adr-001--hoster-vertrauen-und-verzicht-auf-app-seitige-verschlüsselung).

**Vor Go-Live (M11)** muss ein schriftlicher Einwilligungstext vorliegen, der Vertrauensmodell, Anonymisierungs-Kompromiss, On-the-fly-Personenanlage und Aggregat-Statistik explizit benennt.

---

## Dokumentation

Die Pflege der Dokumentation folgt [`CLAUDE.md`](./CLAUDE.md). Für den Einstieg in jeder neuen Arbeitssession **in dieser Reihenfolge** lesen:

| Datei | Zweck |
|---|---|
| [`project-context.md`](./project-context.md) | Projektdefinition, Stack, Constraints, Glossar |
| [`fahrplan.md`](./fahrplan.md) | Meilensteine, Akzeptanzkriterien, aktueller Stand |
| [`architecture.md`](./architecture.md) | Modulgrenzen, Datenmodell, API-Verträge, Repo-Struktur |
| [`decisions.md`](./decisions.md) | ADRs (Architecture Decision Records) |
| [`blockers.md`](./blockers.md) | Offene Probleme, gescheiterte Ansätze |
| [`CLAUDE.md`](./CLAUDE.md) | Arbeitsmethodik für KI-gestützte Entwicklung |
| [`framework-analyse.md`](./framework-analyse.md) | Begleitende Stack-Evaluation |
| [`restraint-types-seed-review.md`](./restraint-types-seed-review.md) | Quelle für den initialen RestraintType-Seed (M1) |

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

**Noch nicht festgelegt.** Die Entscheidung fällt vor M11 (Go-Live Pfad A). Realistische Optionen sind AGPLv3, MIT oder proprietär — abhängig davon, ob eine Multi-Instanz-Variante für andere Gruppen aktiv unterstützt werden soll (siehe [`project-context.md` §6](./project-context.md#6-constraints-operationalisierbar)).

Bis dahin gilt: **Keine öffentliche Veröffentlichung, alle Rechte vorbehalten.**
