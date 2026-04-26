<!--
Zweck: Architektur- und Grundsatzentscheidungen für HC-Map als ADRs
(Architecture Decision Records). Jede Entscheidung ist nachvollziehbar und
bleibt auch nach Monaten/Jahren verständlich – inkl. Kontext, Begründung,
Konsequenzen und verworfenen Alternativen.

Update-Trigger:
- Neue Grundsatzentscheidung wird getroffen → neuer ADR
- Bestehende Entscheidung wird revidiert → alten ADR auf "superseded" setzen,
  neuen ADR anlegen, im neuen ADR auf den alten verweisen
- Kontextänderung macht Entscheidung fragwürdig → ADR-Review in `fahrplan.md` einplanen

NICHT hierher: Arbeitsstand (→ `fahrplan.md`), Code-Details (→ `architecture.md`),
Projektkontext (→ `project-context.md`), Blocker (→ `blockers.md`).

Status-Legende:
- Proposed   – Entwurf, noch nicht endgültig
- Accepted   – Beschlossen und gültig
- Superseded – Durch späteren ADR ersetzt (Referenz angeben)
- Deprecated – Nicht mehr relevant, aber historisch dokumentiert
-->

# HC-Map — Architecture Decisions

## Übersicht

| ID      | Titel                                                         | Status   | Datum       |
|---------|---------------------------------------------------------------|----------|-------------|
| ADR-001 | Hoster-Vertrauen und Verzicht auf App-seitige Verschlüsselung | Accepted | 2026-04-22  |
| ADR-002 | Anonymisierung beim Ausscheiden von Mitgliedern               | Accepted | 2026-04-22  |
| ADR-003 | Entitätsname „Application" statt Binding/Cuffing              | Accepted | 2026-04-22  |
| ADR-004 | Geokodierung: Abschied von what3words, Lat/Lon + Plus Codes   | Accepted | 2026-04-22  |
| ADR-005 | Backend-Stack: FastAPI + SQLAlchemy + Postgres/PostGIS        | Accepted | 2026-04-22  |
| ADR-006 | Authentifizierung: fastapi-users (integriert)                 | Accepted | 2026-04-22  |
| ADR-007 | Frontend-Stack: Next.js + TypeScript + Tailwind + shadcn/ui   | Accepted | 2026-04-22  |
| ADR-008 | Karten-Layer: MapLibre GL JS, MapTiler jetzt, Self-Host später | Accepted | 2026-04-22  |
| ADR-009 | Vorgehensmodell: Vision-driven Scoping vor Code                | Accepted | 2026-04-22  |
| ADR-010 | User ↔ Person als Pflicht-1:1-Verknüpfung                      | Accepted | 2026-04-22  |
| ADR-011 | Live-Modus als primäres Erfassungsparadigma                    | Accepted | 2026-04-22  |
| ADR-012 | Auto-Participant: Performer/Recipient → EventParticipant        | Accepted | 2026-04-22  |
| ADR-013 | Vorlagen/Favoriten bewusst aufgeschoben                         | Accepted | 2026-04-22  |
| ADR-014 | On-the-fly-Personenanlage und nachträgliche User-Verknüpfung   | Accepted | 2026-04-22  |
| ADR-015 | Feature-Set basierend auf Wettbewerbs- und Tagebuch-App-Analyse| Accepted | 2026-04-22  |
| ADR-016 | SQLAdmin als parallele Admin-Schicht                            | Accepted | 2026-04-22  |
| ADR-017 | RxDB für Offline-Sync in Live-Modus                             | Accepted | 2026-04-22  |
| ADR-018 | Implementierungsstrategie M1 (Schema, Migrations, RLS-Default) | Accepted | 2026-04-25  |
| ADR-019 | Implementierungsstrategie M2 (Auth, CSRF, RLS-Mechanik)         | Accepted | 2026-04-25  |
| ADR-020 | Implementierungsstrategie M3 (Domain-API, Search, Export)       | Accepted | 2026-04-25  |
| ADR-021 | Implementierungsstrategie M4 (Frontend-Grundgerüst, Auth-Flow)  | Accepted | 2026-04-25  |
| ADR-022 | LocationPicker und Tile-Proxy in M5a vorgezogen                 | Accepted | 2026-04-26  |
| ADR-023 | App-PIN-Hashing clientseitig via PBKDF2 (Web Crypto API)        | Accepted | 2026-04-26  |
| ADR-024 | Implementierungsstrategie M5a.1 (Live-Endpoints + Tile-Proxy)   | Accepted | 2026-04-26  |
| ADR-025 | User-Modell erbt von SQLAlchemyBaseUserTableUUID (typing-fix)   | Accepted | 2026-04-26  |

---

## ADR-001 — Hoster-Vertrauen und Verzicht auf App-seitige Verschlüsselung

**Status:** Accepted
**Datum:** 2026-04-22
**Scope:** Pfad A (siehe `project-context.md`). Bei Wechsel in Pfad B zwingend neu zu bewerten.

### Kontext
HC-Map speichert Ereignisdaten mit besonders sensiblem Inhalt (Kategorie Art. 9 DSGVO:
Sexualleben). Hosting erfolgt auf einem eigenen VPS bei einem externen Hoster.
Technisch hat ein Hoster immer Root-Zugriff auf die Hardware und damit auf alle
Daten, die nicht zusätzlich app-seitig verschlüsselt sind.

Die Frage: Sollen Nutzdaten app-seitig (Ende-zu-Ende bzw. Client-Side) verschlüsselt
werden, sodass der Hoster auch bei Rootzugriff nichts Lesbares findet?

### Entscheidung
Keine app-seitige Verschlüsselung der Nutzdaten. Stattdessen Standard-Sicherheitsmaßnahmen:

- TLS auf allen Endpunkten
- Full-Disk-Encryption auf Server-Ebene
- Verschlüsselte, regelmäßig getestete Backups an separatem Standort
- EU-Hoster (Datenschutzniveau, AV-Vertrag)
- Hardening (Fail2ban, minimale offene Ports, SSH-Key-Only, regelmäßige Updates)

### Begründung
- Pfad A hat <20 Mitglieder, die sich persönlich kennen und dem Admin ausdrücklich
  vertrauen. Die Vertrauensbasis ist real und dokumentiert.
- App-seitige Verschlüsselung schränkt zentrale Features stark ein:
  Server-seitige Filter, Volltextsuche in Notizen, aggregierte Statistiken,
  effiziente Indizes auf verschlüsselten Feldern sind nicht oder nur mit erheblichem
  Aufwand möglich (z. B. per homomorpher Verschlüsselung oder deterministischer
  Verschlüsselung mit eigenen Nachteilen).
- Entwicklungsaufwand und Wartungsrisiko steigen deutlich; Key-Management wird
  zu einem eigenen Dauerproblem (Schlüsselverlust = Datenverlust).
- Das Hobby-Scope rechtfertigt diesen Zusatzaufwand aktuell nicht.

### Konsequenzen
**Positiv:**
- Schlanke Architektur, volle Feature-Freiheit (Suche, Filter, Statistiken server-seitig).
- Einfache Backups und Restores.
- Standardwerkzeuge (Postgres, gängige ORMs, Karten-Libraries) bleiben ohne Umweg nutzbar.

**Negativ (bewusst in Kauf genommen):**
- Der Hoster könnte bei Rootzugriff theoretisch alle Nutzdaten lesen.
- Bei Rechtshilfeersuchen gegen den Hoster wären die Daten zugänglich.
- Mitglieder müssen diesem Vertrauensmodell explizit zustimmen (Einwilligungstext).

**Harte Auflagen:**
- Dieser ADR gilt **nur** für Pfad A. **Vor Wechsel zu Pfad B muss neu entschieden werden**, weil die Einwilligung von dann fremden Mitgliedern auf anderer Grundlage steht.
- Einwilligungstext muss das Vertrauensmodell explizit benennen.

### Verworfene Alternativen
- **Volle Ende-zu-Ende-Verschlüsselung (z. B. Clientseitig mit Gruppen-Key):**
  Zu hoher Aufwand, behindert Features, Schlüsselverlust = Totalausfall.
- **Feldweise Verschlüsselung sensibler Felder (z. B. nur Notizen):**
  Halber Gewinn, aber fast der volle Aufwand; verleitet zu falschem Sicherheitsgefühl, weil Metadaten (Beteiligte, Ort, Zeit) weiterhin offen liegen.
- **Self-Hosting auf Hardware zu Hause:**
  Eliminiert das Hoster-Problem, schafft dafür Verfügbarkeits-, Backup- und Netzwerkprobleme, die ein Hobbyprojekt überfordern.

---

## ADR-002 — Anonymisierung beim Ausscheiden von Mitgliedern

**Status:** Accepted
**Scope:** Pfad A. Bei Wechsel in Pfad B zwingend neu zu bewerten.
**Datum:** 2026-04-22

### Kontext
Scheidet ein Mitglied aus und verlangt Löschung seiner personenbezogenen Daten,
kollidiert das mit Events, an denen es als Participant, Performer oder Recipient
beteiligt war. Vollständige Event-Löschung zerstört Daten der anderen Beteiligten;
Nicht-Löschung verletzt die DSGVO-Rechte des Ausscheidenden.

### Entscheidung
Beim Ausscheiden wird der Personendatensatz **anonymisiert**: Namens- und
Identifikationsfelder werden durch Platzhalter ersetzt (`name = "[gelöscht]"`,
Alias leer, Mailadresse null, User-Account deaktiviert). Verknüpfungen in Events,
Applications (als Performer/Recipient) und EventParticipant bleiben bestehen,
zeigen aber auf den anonymisierten Datensatz.

### Begründung
- Die anderen Beteiligten haben ein legitimes Interesse an ihrer eigenen Historie.
- In einer <20-Personen-Gruppe kennt sich ohnehin jeder; echte DSGVO-konforme
  Anonymisierung (Re-Identifikation praktisch ausgeschlossen) ist in diesem
  Setting unmöglich, weil Kontext, Datum, Ort und Mitbeteiligte identifizierend sind.
- Die Einwilligung der Mitglieder beim Eintritt adressiert diesen Fall ausdrücklich.

### Konsequenzen
**Positiv:**
- Datenhistorie der Gruppe bleibt nutzbar.
- Einfache technische Umsetzung (UPDATE statt komplexe Kaskaden-Löschung).

**Negativ (bewusst in Kauf genommen):**
- **Das ist keine Anonymisierung im DSGVO-Sinn, sondern Pseudonymisierung.** Für
  Außenstehende wirkt sie anonymisierend, für Gruppenmitglieder nicht. Der
  Einwilligungstext muss diesen Punkt klar benennen.
- Für Pfad B reicht dieser Ansatz **nicht** — dort muss entweder eine härtere
  Lösung (z. B. Event-Löschung bei Widerspruch eines Beteiligten, kryptografische
  Tombstones, Gruppenbildung mit echter Fremdheit) gewählt werden oder das
  Zugriffsmodell grundlegend anders gedacht werden.

**Harte Auflagen:**
- Einwilligungstext muss den Kompromiss beschreiben.
- Vor Pfad B ist dieser ADR zwingend zu revidieren.

### Verworfene Alternativen
- **Vollständige Kaskadenlöschung aller Events mit dem Ausscheidenden:**
  Beraubt die verbleibenden Beteiligten ihrer eigenen Historie.
- **Admin entscheidet pro Einzelfall:**
  Nicht skalierbar, intransparent für den Ausscheidenden.
- **Keine Löschung, nur Konto-Deaktivierung:**
  Erfüllt keine DSGVO-Mindestanforderung.

---

## ADR-003 — Entitätsname „Application" statt Binding/Cuffing

**Status:** Accepted
**Datum:** 2026-04-22

### Kontext
Die zentrale Entität — eine einzelne Fesselaktion innerhalb eines Events — brauchte
einen eindeutigen, technisch sauberen Namen. Diskutiert wurden: `Binding`
(szenenüblich), `Cuffing` (passt zum Projektnamen HC = Handcuff), `Application`
bzw. `Restraint Application` (neutral-technisch).

### Entscheidung
Datenbank, API, Code und interne Dokumentation verwenden durchgehend `Application`.
Das UI darf szenenahe Label verwenden (z. B. „Binding") — diese werden in der
UI-Schicht als Übersetzung/Anzeigetext gepflegt, ohne das technische Modell zu beeinflussen.

### Begründung
- Neutral-technisch: bildet jede Form von Fesselung ab, nicht nur Handschellen oder Seil.
- Sprachlich präzise: beschreibt die Handlung („das Anlegen"), nicht nur das Resultat.
- Trennung Technik/UI ermöglicht spätere Anpassung des Anzeige-Labels ohne Schema-Migration.

### Konsequenzen
**Positiv:**
- Tabellennamen, Klassen, API-Routen bleiben stabil und aussagekräftig.
- UI kann zielgruppenspezifisch beschriftet werden.

**Negativ:**
- Technische Dokumentation und UI-Sprache weichen voneinander ab → muss in Onboarding erklärt werden.

### Verworfene Alternativen
- **`Binding`:** Mehrdeutig (in IT-Kontext = Variablenbindung, Netzwerk-Binding).
- **`Cuffing`:** Zu eng (passt nicht zu Seil, Manschetten, Klebeband).
- **`Restraint`:** Beschreibt eher den Zustand als die Aktion.

---

## ADR-004 — Geokodierung: Abschied von what3words, Lat/Lon + Plus Codes

**Status:** Accepted
**Datum:** 2026-04-22

### Kontext
Bestehende Ereignisdaten sind bei what3words (w3w) als 3-Wort-Adressen gespeichert.
w3w ist ein proprietäres System: Algorithmus, Wortliste und Zuordnung unterliegen
dem geistigen Eigentum des Anbieters, der in der Vergangenheit rechtlich aggressiv
gegen Open-Source-Reimplementierungen (z. B. WhatFreeWords) vorgegangen ist.
Eine weitere Nutzung ohne w3w-API bedeutet:

- Eigenständige Umrechnung: rechtlich riskant.
- API-Nutzung: Lizenzkosten, laufende Abhängigkeit — kollidiert direkt mit dem
  Kernmotiv des Projekts (Datensouveränität).

### Entscheidung
1. **Einmalige Migration:** Mit dem bestehenden w3w-Zugang werden alle vorhandenen
   3-Wort-Adressen in Lat/Lon-Koordinaten umgewandelt. Die 3-Wort-Strings werden
   optional als Legacy-Label (`w3w_legacy`) mitgeführt, aber nicht mehr funktional genutzt.
2. **Interne Primärspeicherung:** Lat/Lon (Dezimalgrad, WGS84).
3. **Primäres UI-Format:** Plus Codes (Open Location Codes). Lokal aus Lat/Lon
   berechnet, keine API-Abhängigkeit, Apache-2.0-lizenziert. Lat/Lon bleibt
   im UI als technische Zusatzanzeige verfügbar (Export, Developer-Tools).
4. **Eingabemodi:** offen für Plus Code, Karten-Klick und Adress-Suche — konkrete
   Umsetzung wird in `architecture.md` / `fahrplan.md` festgelegt.
5. **Nach Migration:** w3w-Account kann gekündigt werden, keine laufende Abhängigkeit mehr.

### Begründung
- Eliminiert Anbieter-Lock-in und Lizenzkosten.
- Plus Codes bieten die menschenfreundliche Kompaktheit von w3w, ohne dessen
  rechtliche Fallstricke.
- Lat/Lon ist der De-facto-Standard: jede Karten-Library, jedes Geospatial-Tool,
  jede DB (Postgres/PostGIS, SQLite/SpatiaLite) versteht es direkt.
- Plus Codes sind rein rechnerisch aus Lat/Lon ableitbar — keine doppelte
  Wahrheit, keine Konsistenzprobleme.

### Konsequenzen
**Positiv:**
- Datensouveränität ist für Geodaten vollständig gewährleistet.
- Keine laufenden externen Kosten oder API-Abhängigkeiten.
- Karten-Stack bleibt offen (MapLibre + OpenStreetMap-Tiles oder Self-Hosted Tileserver).

**Negativ:**
- Einmaliger Migrationsaufwand: Script, das durch die w3w-Historie läuft und
  Koordinaten abruft. Größe hängt von Datenbestand ab.
- Nutzer müssen sich an Plus Codes gewöhnen — weniger eingängig als 3 Wörter,
  aber kompakter und mit Ortsbezug-Shortcodes gut handhabbar.

### Verworfene Alternativen
- **w3w-API weiter nutzen:** Widerspricht Datensouveränitäts-Motiv, laufende Kosten.
- **Eigene 3-Wort-Implementierung (à la WhatFreeWords):** Rechtlich riskant.
- **Geohash als UI-Primärformat:** Sehr kompakt, aber weniger lesbar; wird ggf.
  trotzdem intern für Indizierung genutzt — das ist eine Architekturfrage, kein Widerspruch.
- **Nur Lat/Lon im UI:** Technisch sauber, aber schlecht für schnelle mündliche oder
  schriftliche Weitergabe zwischen Mitgliedern.

---

## ADR-005 — Backend-Stack: FastAPI + SQLAlchemy + Postgres/PostGIS

**Status:** Accepted
**Datum:** 2026-04-22

### Kontext
Python wurde als Backend-Sprache gewählt. Innerhalb Python stehen zwei
Hauptkandidaten zur Wahl: Django (Batteries-included mit Django Admin) und
FastAPI (API-first, schlank, modern typisiert). Datenbank-Entscheidung Postgres
mit PostGIS stand bereits fest.

### Entscheidung
- **Framework:** FastAPI (aktuelle Major-Version).
- **ORM:** SQLAlchemy 2.0 (moderne getypte Syntax) + Alembic für Migrations.
- **Validierung/Schemata:** Pydantic v2.
- **Datenbank:** PostgreSQL mit PostGIS-Erweiterung.
- **Row-Level-Security:** Postgres-Native-RLS von Anfang an multi-tenant-fähig
  konfiguriert — auch in Pfad A, damit Pfad B ohne Schema-Umbau möglich bleibt.
- **Package-Manager:** uv oder Poetry (wird in `architecture.md` festgelegt).

### Begründung
- FastAPI ist modern typisiert, async-fähig, generiert OpenAPI-Docs automatisch —
  ideal für KI-unterstützte Entwicklung und Review.
- SQLAlchemy 2.0 hat eine saubere, typisierte API, die sich gut mit Pydantic v2 paart.
- Postgres mit PostGIS ist der De-facto-Standard für Geodaten mit erstklassiger RLS-Unterstützung.
- Die Kombination ist in der Python-Community sehr gut dokumentiert, viele Referenzimplementierungen.

### Konsequenzen
**Positiv:**
- Klare Trennung API ↔ UI (Next.js kann ohne Kompromisse als separates Frontend laufen).
- Automatische API-Dokumentation (Swagger/ReDoc) über OpenAPI.
- RLS auf DB-Ebene ist eine harte Isolationsgrenze — selbst ein Bug im Application-Code kann keine Mandantenisolation brechen.
- Gute Test-Werkzeuge (pytest, pytest-asyncio, testcontainers).

**Negativ (bewusst in Kauf genommen):**
- **Kein Admin-Interface out-of-the-box** — muss komplett selbst gebaut werden
  (im Next.js-Frontend als separater Admin-Bereich mit Rolle `Admin`).
- Mehr Boilerplate-Code als Django für Standardaufgaben (User-Management,
  Passwort-Reset, E-Mail-Verifikation) — fastapi-users deckt das weitgehend ab (→ ADR-006).
- RLS-Policies müssen sorgfältig getestet werden (Policy-Lücke = Daten-Leck).

### Verworfene Alternativen
- **Django + Django Ninja + Django Admin:** Admin-UI geschenkt, aber strengere Konventionen und engere Kopplung zwischen ORM und Framework; langfristig weniger Flexibilität.
- **Flask + SQLAlchemy:** Geringerer Komfort bei Typisierung und API-Docs.
- **Node/TypeScript (NestJS):** Einheitlicher Stack mit Frontend, aber Python wurde bereits als Backend-Sprache entschieden.

---

## ADR-006 — Authentifizierung: fastapi-users (integriert)

**Status:** Accepted
**Datum:** 2026-04-22

### Kontext
Auth-Lösung für Pfad A (<20 Nutzer, Admin-gesteuerte User-Anlage) mit
Erweiterbarkeit für Pfad B (Selbstregistrierung + Admin-Freigabe). Drei
Kandidaten: integrierte Lösung (fastapi-users), externer Identity-Provider
(Authentik / Keycloak), oder Magic-Link-Only.

### Entscheidung
- **Library:** fastapi-users mit SQLAlchemy-Adapter.
- **Methoden in Pfad A:** E-Mail + Passwort, JWT-Token (mit Refresh) oder
  HttpOnly-Cookie-Sessions — finale Wahl in `architecture.md`.
- **User-Store:** gleiche Postgres-DB wie Anwendungsdaten, eigenes Schema oder Präfix.
- **Rollen (RBAC):** Admin, Editor, Viewer — direkt am User-Modell als Enum/Flag-Feld.
- **Bootstrap:** Der erste Admin wird über ein CLI-Skript oder initiale Migration erzeugt.
- **Self-Registration:** in Pfad A deaktiviert (Admin legt User an). In Pfad B aktivierbar mit Admin-Freigabe-Flag (`status = pending`) im User-Datensatz.

### Begründung
- fastapi-users ist aktiv gepflegt, gut in FastAPI-Ökosystem integriert, typisiert.
- Deckt Standardfeatures ab: Passwort-Reset, E-Mail-Verifikation, Token-Refresh.
- Unterstützt zukünftig auch OAuth-Provider und Magic Links ohne Umbau.
- Keine zusätzliche Server-Komponente (im Gegensatz zu Keycloak/Authentik).

### Konsequenzen
**Positiv:**
- Alles in einer Codebase, einer DB, einem Deployment-Artefakt.
- Schnelle Inbetriebnahme.
- Pfad-B-Erweiterung (Self-Registration + Queue) ist rein Datenmodell-Erweiterung.

**Negativ:**
- Wechsel auf externen Identity-Provider später erfordert Migration (überschaubar bei <20 Nutzern in Pfad A, größer bei Pfad B).
- Passwort-Hashing, Sessions, Rate-Limiting auf Login-Endpunkten müssen sorgfältig konfiguriert werden — kein „geschenkter" Schutz.

### Verworfene Alternativen
- **Keycloak / Authentik (self-hosted IdP):** Überdimensioniert für <20 Nutzer; zusätzlicher Betriebsaufwand und Ressourcenverbrauch auf dem VPS.
- **Magic-Link-Only:** Eleganter Ansatz für kleine Gruppen, schafft aber Abhängigkeit von zuverlässiger Mailzustellung; bei Mail-Problemen sind Nutzer ausgesperrt. Als zusätzliche Methode später dennoch zuschaltbar.

---

## ADR-007 — Frontend-Stack: Next.js + TypeScript + Tailwind + shadcn/ui

**Status:** Accepted
**Datum:** 2026-04-22

### Kontext
Mobile und Desktop sind gleichwertig wichtig. React wurde als Framework
gewählt; innerhalb React stand Next.js gegen leichtgewichtigere Alternativen.
UI-Komponenten und Styling-Strategie stehen ebenfalls zur Entscheidung.

### Entscheidung
- **Framework:** Next.js (App Router, aktuelle stabile Major-Version).
- **Sprache:** TypeScript (strict mode).
- **Styling:** Tailwind CSS.
- **Komponentenbibliothek:** shadcn/ui (kopierte, selbstgehostete Komponenten, kein NPM-Lock-in).
- **Karten-Integration:** `react-map-gl` mit MapLibre-Adapter (→ ADR-008).
- **State-Management:** TanStack Query für Server-State, React Context/useState für UI-State. Keine globale Store-Library im MVP.
- **Rendering-Strategie:** Default Server Components; Client Components gezielt nur dort, wo nötig (Karte, Formulare mit Live-Validierung).

### Begründung
- Next.js hat das größte React-Ökosystem, viele Referenzen, gute Mobile-First-Patterns.
- Tailwind + shadcn/ui ist aktuell Standard für schnelle, professionell aussehende Oberflächen ohne externe UI-Lib-Abhängigkeit.
- TypeScript ist für KI-unterstützte Entwicklung nahezu Pflicht — ohne Typen läuft Claude Code deutlich öfter auf Halluzinationen.
- TanStack Query löst Caching, Invalidation und Loading-States elegant.

### Konsequenzen
**Positiv:**
- Schnelle Iteration, viele fertige Patterns, große Community.
- Mobile-First-Design mit Tailwind ist geradlinig.
- Bei Pfad-B-Wechsel sind SSR/SEO-Features bereits verfügbar, falls öffentliche Teile nötig werden.

**Negativ:**
- Next.js braucht einen Node-Runtime-Prozess auf dem VPS (nicht reiner Static-Export, sobald Server-Components oder Middleware genutzt werden).
- App Router hat eine steilere Lernkurve als klassisches React-Routing.
- shadcn/ui-Komponenten sind kopiert — Updates nicht automatisch, müssen gezielt eingespielt werden. Das ist gewollt, aber erfordert Disziplin.

### Verworfene Alternativen
- **SvelteKit:** Schlanker und performant, aber kleineres Ökosystem für Karten/UI-Libraries und weniger KI-Trainingsdaten.
- **Vite + React (ohne Next.js):** Einfacher, aber SSR/Routing/API-Proxy müsste selbst konfiguriert werden.
- **Reine Static-Export-Strategie:** würde interaktive Features (Auth-Flows, Live-Daten) ausschließen oder umständlicher machen.

---

## ADR-008 — Karten-Layer: MapLibre GL JS, MapTiler Cloud jetzt, Self-Hosting später

**Status:** Accepted
**Datum:** 2026-04-22
**Scope:** Phase 1 (Go-Live Pfad A) mit geplanter Migration zu Self-Hosting als eigener Meilenstein (→ `fahrplan.md`).

### Kontext
Die Plattform braucht einen Karten-Layer für Eingabe (Event-Ort auswählen) und
Anzeige (Events auf Karte darstellen). Datensouveränität ist Kernmotiv,
Self-Hosting der Tiles ist aber mit spürbarem Setup-Aufwand verbunden.
Kompromiss: schneller Start, saubere Migration später.

### Entscheidung
**Phase 1 (Go-Live Pfad A):**
- **Client-Library:** MapLibre GL JS (BSD-3-lizenzierter Fork von Mapbox GL JS vor v2).
- **Integration in React/Next.js:** `react-map-gl` mit MapLibre-Adapter.
- **Tile-Quelle:** MapTiler Cloud (Free-Tier, 100.000 Requests/Monat, EU-Hoster).
- **API-Key-Handling:** Schlüssel in Server-seitiger Config, Domain-Restriction im MapTiler-Dashboard, ggf. Tile-Proxy über das eigene Backend zur Key-Abschirmung.

**Phase 2 (geplanter Meilenstein in `fahrplan.md`):**
- Umstellung auf Self-Hosted Tileserver auf dem VPS.
- Stack-Kandidat: OpenMapTiles-Daten + tileserver-gl-light oder tegola.
- Regionaler OSM-Extract (z. B. DACH) für geringen Ressourcenverbrauch (~3–6 GB Disk).
- Update-Zyklus: monatlich oder quartalsweise.

### Begründung
- MapLibre ist zukunftssicher, vollständig OSS, kompatibel mit jedem Tile-Format.
- MapTiler: EU-basiert, DSGVO-freundlich, Free-Tier weit oberhalb des Bedarfs einer <20-Personen-Gruppe, keine Kreditkartenpflicht, bei Überschreitung stoppen Karten statt Überraschungsrechnung zu generieren.
- Self-Hosting-Pfad bleibt technisch offen, weil MapLibre nur die Tile-URL wechseln muss — kein Architekturumbau.
- Early-Launch-Vorteil: Karten-Setup blockiert nicht den MVP, Fokus zunächst auf Datenmodell, RLS, Erfassung.

### Konsequenzen
**Positiv:**
- Schneller Start, schöne Karten ohne Setup-Aufwand.
- Klare Migrationsperspektive, im Fahrplan fixiert.
- Kartensouveränität bleibt als explizites Ziel sichtbar und adressierbar.

**Negativ (bewusst in Kauf genommen):**
- Externe Abhängigkeit in Phase 1 — Tile-Requests gehen an MapTiler, inkl. IP-Adressen der Nutzer. Das ist datenminimal (anonyme Tile-Requests ohne App-Daten), aber nicht null.
- MapTiler-Free-Tier ist auf nicht-kommerzielle Nutzung beschränkt — passt für Hobby, muss vor Pfad-B-Wechsel neu bewertet werden (evtl. Upgrade auf Bezahl-Plan oder Self-Hosting vorziehen).
- Der Selbst-Hosting-Meilenstein ist Arbeit, die kommt, aber noch nicht erledigt ist — bewusst in den Fahrplan gestellt, damit sie nicht vergessen wird.

### Verworfene Alternativen
- **Mapbox GL JS (aktuell):** Ab v2 nicht mehr OSS, Lock-in-Risiko.
- **Leaflet:** Älter, kein WebGL-Rendering, schwächer bei Vector-Tiles und Performance auf mobilen Geräten.
- **Google Maps:** Teuer, restriktive ToS, kollidiert massiv mit Datensouveränitäts-Motiv.
- **Self-Hosting sofort:** Würde den MVP um 1–2 Wochen verschieben, ohne in Phase 1 echten Mehrwert zu liefern bei <20 Nutzern.

---

## ADR-009 — Vorgehensmodell: Vision-driven Scoping vor Code

**Status:** Accepted
**Datum:** 2026-04-22

### Kontext
HC-Map wurde in einer einzigen Konzeptions-Session vollständig durchgesprochen,
bevor irgendeine Codezeile geschrieben wurde. Vision, Scope, Threat-Model,
Datenmodell, Stack und Architektur sind in vier Dokumenten festgehalten
(`project-context.md`, `decisions.md`, `fahrplan.md`, `architecture.md`),
aus denen die Umsetzung in einer separaten Claude-Code-Session erfolgt.

Diese Dokumentation dieses Vorgehens als ADR ist bewusst — damit später
nachvollziehbar ist, *warum* das Projekt ohne klassische Sprint-Planung
oder iteratives Prototyping auskommt.

### Entscheidung
HC-Map folgt dreistufigem Vorgehen:

1. **Konzeption** in normalem Chat (200K-Kontext): Vision schärfen,
   Scope-Grenzen ziehen, ADRs treffen, Datenmodell ableiten, Fahrplan schneiden,
   Architektur spezifizieren. Ergebnis: vollständiges Dokumentations-Set.
2. **Härtung** als Entwickler-Review durch den Admin: Plausibilitätscheck der
   Dokumente, Schließen offener Punkte, Anreichern mit projektspezifischem
   Wissen.
3. **Umsetzung** in Claude Code (1M-Kontext, Max-Plan, xhigh Effort default)
   mit Repo-Zugriff inkl. Commits. Claude Code arbeitet die Meilensteine aus
   `fahrplan.md` ab, hält sich an `architecture.md` und `decisions.md`,
   eskaliert in `blockers.md` bei Hindernissen.

Der Admin hat als nicht-Entwickler die Vision und das Engineering-Verständnis,
die KI hat die Umsetzungs-Geschwindigkeit und die technische Tiefe in der Breite.

### Begründung
- **Frühe Klärung schlägt späte Korrektur:** Architektur- und Scope-Fehler sind
  in der Konzeptionsphase mit Kommentaren behebbar, später nur mit Refactor.
- **KI-Umsetzung braucht präzise Spezifikation:** Vagheit in der Vorgabe führt
  zu Halluzinationen und falschen Annahmen. Die vier Dokumente reduzieren
  diesen Spielraum drastisch.
- **Trennung Konzeption ↔ Umsetzung:** Im Konzeptions-Chat steht der gesamte
  Diskurs als Kontext bereit (200K reichen). In der Umsetzung braucht Claude
  Code nur die finalen Dokumente plus den Code (1M-Kontext).
- **Nachvollziehbarkeit:** Auch nach Monaten kann jede Entscheidung über die
  ADRs zurückverfolgt werden.

### Konsequenzen
**Positiv:**
- Architektur-Schäden durch unausgesprochene Annahmen werden früh sichtbar
  (z. B. „Community = 50–500" vs. „kleine Gruppe", erkannt in der Konzeption).
- Claude Code kann autonom arbeiten, weil die Spezifikation trägt.
- Das gleiche Vorlagen-Set ist auf Folgeprojekte übertragbar (siehe sechs
  Dokument-Vorlagen aus dem übergeordneten Workflow).

**Negativ (bewusst in Kauf genommen):**
- Hoher Initialaufwand vor erstem Code — eine ganze Konzeptions-Session,
  bevor irgendetwas „läuft". Bei kleineren Projekten wäre das overkill,
  bei HC-Map mit RLS, Rollen, Multi-Tenant-Vorbereitung und sensiblen Daten
  ist es angemessen.
- Dokumente müssen gepflegt werden — Drift zwischen Doku und Code ist eine
  reale Gefahr und wird durch klare Update-Trigger in den Datei-Headern
  gemindert.

### Verworfene Alternativen
- **Direkter Code-Start ohne Spezifikation:** Bewährt sich bei Throwaway-
  Prototypen, nicht bei einem Projekt mit Sicherheits- und Datenschutz-Fokus.
- **Klassisches Backlog mit User Stories:** Für ein Solo-Hobbyprojekt mit
  einem Admin als einzigem Stakeholder zu schwergewichtig.
- **Pure KI-Codegenerierung aus knappen Prompts:** Funktioniert bei isolierten
  Snippets, scheitert an konsistenter Architektur über mehrere Sessions.

---

## ADR-010 — User ↔ Person als Pflicht-1:1-Verknüpfung

**Status:** Accepted
**Datum:** 2026-04-22

### Kontext
Die ursprüngliche Architektur (Stand `architecture.md` initial) modellierte
`user.person_id` als optionales Feld (`NULLABLE`, `UNIQUE`). Die Annahme dahinter:
„User-Account" und „handelnde Person im Event" sind konzeptuell trennbare
Dinge, manche User könnten reine Zugangs-Accounts ohne Person sein (z. B.
Admin als reiner Verwalter, nicht als Beteiligter).

In der Klärung zur Event-Erfassung wurde deutlich: **Sowohl Admin als auch
Editoren sind in den Events, die sie erfassen, in der Regel selbst Performer.**
Das System wird also nicht von externen Verwaltern bedient, sondern von den
Beteiligten selbst — als Logbuch der eigenen Praxis.

Damit jeder User sich selbst als Performer/Recipient eintragen kann, muss er
zwingend eine zugeordnete Person haben. Die optionale Verknüpfung wäre eine
Quelle für Edge-Cases ohne realen Nutzen in Pfad A.

Auch reine Viewer brauchen die Verknüpfung: Die RLS-Policy für Events filtert
nach `current_person_id` — ohne Person sieht ein Viewer nichts. Eine optionale
Verknüpfung würde also Viewer ohne Person erlauben, die per Definition nichts
sehen können. Das ist kein sinnvoller Zustand.

### Entscheidung
- `user.person_id` ist **`NOT NULL`** und **`UNIQUE`** für alle Rollen
  (Admin, Editor, Viewer). Jeder User hat genau eine Person.
- **Personen können ohne User-Account existieren** (siehe ADR-014: on-the-fly-Anlage). Die Beziehung ist asymmetrisch — der FK geht von User zu Person, nicht umgekehrt. Eine Person kann „verwaist" existieren (sie taucht in Events auf, hat aber niemanden, der sich als sie einloggen könnte).
- Beim Anlegen eines Users wird gleichzeitig eine `Person` erzeugt — **außer** der Admin verknüpft den neuen User mit einer bestehenden Person (Verknüpfungsmodus, siehe ADR-014).
- Das Bootstrap-Skript für den ersten Admin (`scripts/bootstrap_admin.py`)
  legt zuerst die Person an, dann den User mit Verknüpfung.
- Im Application-Erfassungsformular ist `performer_id` per Default mit der
  Person des eingeloggten Users vorbelegt. `recipient_id` bleibt frei wählbar.
  Beide Felder können bei Bedarf überschrieben werden — etwa wenn ein Admin
  nachträglich ein Event ohne eigene Beteiligung erfasst.

### Begründung
- **Konsistenz mit der Realität der Nutzung:** Der typische Workflow ist
  „ich logge mich ein und erfasse, was ich getan habe" — die Person, die das
  System nutzt, ist die Person, die handelt.
- **Vereinfachung der RLS:** Keine Sonderfälle für User ohne Person.
- **Vereinfachung der UX:** Sinnvolle Defaults statt leerer Felder.
- **Kein Verlust von Flexibilität:** Personen ohne User-Zugang bleiben
  weiterhin möglich (z. B. ein gelegentlich Beteiligter, der keinen Zugang
  zum System haben soll). Nur umgekehrt — User ohne Person — wird ausgeschlossen.

### Konsequenzen
**Positiv:**
- Saubereres Datenmodell ohne NULL-Falle in einer zentralen Beziehung.
- Default-belegtes Performer-Feld macht die Erfassung deutlich schneller.
- RLS-Policies bleiben einfach und vorhersehbar.

**Negativ (gering):**
- Das Bootstrap-Skript muss zwei Entitäten in der richtigen Reihenfolge
  anlegen (Person zuerst, dann User).
- User-Anlage über Admin-UI braucht entweder ein zweistufiges Formular
  (Person dann User) oder ein kombiniertes Formular, das beides in einer
  Transaktion erzeugt. Letzteres wird gewählt.

### Verworfene Alternativen
- **`person_id` weiterhin nullable:** Erzeugt Edge-Cases (User sieht via RLS
  nichts, kann sich nicht selbst als Performer wählen) ohne erkennbaren Vorteil.
- **Nur Admin/Editor verknüpft, Viewer optional:** Inkonsistent — Viewer
  brauchen die Verknüpfung für RLS sowieso.
- **Person-Erzeugung als separater Schritt nach User-Anlage:** Erzeugt
  Inkonsistenz-Fenster, in dem ein User existiert, der nichts sehen oder
  tun kann. Wird durch atomare Anlage vermieden.

---

## ADR-011 — Live-Modus als primäres Erfassungsparadigma

**Status:** Accepted
**Datum:** 2026-04-22

### Kontext
Die ursprüngliche Architektur ging implizit davon aus, dass Events nachträglich
am Schreibtisch (oder am Handy in Ruhe) erfasst werden — als Datenbankeingabe
mit Datum, Ortsangabe und Liste von Applications. Dem entsprach das Datenmodell
(`Event.occurred_at` als einzelner Zeitstempel, `Application.applied_at` optional,
`duration_min` als manuelle Eingabe).

In der Klärung zur Erfassungs-Praxis wurde deutlich: Die Hauptnutzung ist nicht
nachträglich, sondern **in der Situation**. Der Performer hat das Handy in der
Hand, startet ein Event live, dokumentiert Applications während sie geschehen,
beendet das Event am Ende. GPS, Timer, Schnellaktionen sind die zentralen
Bedienelemente. Nachträgliche Erfassung wird zum sekundären Modus.

### Entscheidung

1. **Datenmodell anpassen:**
   - `Event.occurred_at` ersetzt durch `Event.started_at` (NOT NULL) und `Event.ended_at` (NULL bis Event abgeschlossen).
   - `Application.applied_at` und `Application.duration_min` ersetzt durch `Application.started_at` und `Application.ended_at` (beide NULL erlaubt — eine Application gilt als „in progress", solange `ended_at` NULL ist).
   - Dauer wird als `ended_at - started_at` berechnet, nicht gespeichert.
   - Lücken zwischen Applications (Materialwechsel, Pausen) werden aus den Zeitstempeln berechnet, nicht als eigene Entität gespeichert. Eine optionale Notiz an der vorherigen Application kann die Lücke beschreiben.

2. **UI-Hierarchie umstellen:**
   - Startseite ist nicht mehr ein „Dashboard mit Zahlen", sondern ein zentraler „Neues Event starten"-Knopf.
   - Live-Ansicht eines laufenden Events ist die häufigste Bildschirmsituation.
   - Nachträgliche Erfassung ist ein expliziter Zweitweg, kein Default.

3. **Browser-APIs einbinden:**
   - Geolocation für GPS-Vorbelegung (HTTPS-Pflicht — durch Caddy gegeben).
   - Wakelock zur Verhinderung von Bildschirmsperre während laufender Events.
   - IndexedDB für Offline-Resilienz.

4. **Fahrplan umstellen:**
   - M5 wird in M5a (Live-Modus), M5b (Offline-Resilienz), M5c (nachträgliche Erfassung) aufgeteilt.
   - M5a kommt vor M5c — der Hauptmodus zuerst.
   - M5b folgt direkt nach M5a, bevor andere Features draufgesetzt werden, weil ein Live-Modus ohne Offline-Resilienz fragiler ist als nützlich.

5. **Mobile-First wird verbindlich:**
   - „Mobile und Desktop gleichwertig" aus `project-context.md` bleibt gültig, aber **mobil ist nicht-verhandelbar**: Touch-Targets ≥ 44px, große Buttons, lesbare Timer, schneller Bedienfluss.

### Begründung
- **Echte Nutzung schlägt vermutete Nutzung.** Die ursprüngliche Annahme „nachträgliche Erfassung" war nie explizit getroffen, sondern implizit aus üblichen Daten-Apps übernommen. Die echte Praxis sieht anders aus.
- **Datenqualität steigt.** Live-erfasste Zeitstempel sind exakter als nachträglich rekonstruierte. Dauerangaben („so 10 Minuten?") werden durch echte Messung ersetzt.
- **Bedienzeit sinkt.** Wenn die App während der Situation funktionieren muss, müssen Defaults sitzen, Klicks minimal sein, Timer automatisch laufen — das macht die App auch für nachträgliche Erfassung besser.
- **Architektur bleibt schlank.** Beide Modi nutzen denselben Datenpfad, nur die Quelle der Zeitstempel unterscheidet sich (Live: `now()`; Nachträglich: User-Eingabe).

### Konsequenzen
**Positiv:**
- App fühlt sich wie ein Werkzeug an, nicht wie eine Datenbank.
- Datenqualität bei Zeit, Reihenfolge und Ort steigt.
- Spätere Statistiken (z. B. „durchschnittliche Application-Dauer pro Restraint-Typ") werden belastbar.

**Negativ (bewusst in Kauf genommen):**
- **Offline-Resilienz wird Pflicht.** Live-Modus ohne IndexedDB-Sync ist im Funkloch fragil. Das ist ein eigener Meilenstein (M5b) und nicht trivial.
- **Browser-API-Abhängigkeiten:** Geolocation, Wakelock, IndexedDB — alle gut unterstützt, aber nicht universell. Fallbacks und Hinweise nötig.
- **Akku-Verbrauch:** Wakelock + GPS während eines langen Events kosten Akku. Performer muss das wissen oder Power Bank dabei haben.
- **Schema-Migration:** Da M0-M4 noch nicht implementiert sind, ist die Schema-Anpassung ohne Daten-Migration möglich. Hätten wir später umgestellt, wäre es teurer gewesen.

### Verworfene Alternativen
- **Beim ursprünglichen Modell bleiben (nachträgliche Erfassung als Hauptmodus):** Hätte zur tatsächlichen Nutzung nicht gepasst.
- **Lücken als eigene Entität (`Gap` oder `Interlude`):** Wäre saubereres explizites Modell, aber unnötig — die Information steckt bereits in den Zeitstempeln. KISS-Prinzip.
- **Material-/Positionswechsel als eigene Application mit Typ „Wechsel":** Verwischt die Semantik von Application (eine konkrete Fesselungsaktion) und bläht das Datenmodell auf. Eine Notiz an der vorherigen Application reicht.
- **Live-Modus erst in Phase 2:** Hätte den MVP-Wert massiv reduziert. Die Mitglieder würden die App so nicht gerne nutzen wollen.

---

## ADR-012 — Auto-Participant: Performer/Recipient → EventParticipant

**Status:** Accepted
**Datum:** 2026-04-22

### Kontext
Das Datenmodell unterscheidet drei Rollen einer Person an einem Event:

- `EventParticipant` — Person ist Beteiligte des Events (Sichtbarkeit via RLS).
- `Application.performer_id` — Person hat eine konkrete Application ausgeführt.
- `Application.recipient_id` — Person war Empfängerin einer konkreten Application.

In der ursprünglichen Spezifikation waren diese drei Sätze unabhängig — Performer in einer Application sein bedeutete nicht zwangsläufig Participant am Event sein. Theoretisch konnte jemand also Performer einer Application sein, das Event aber via RLS nicht sehen, weil er nicht als Participant eingetragen war.

Das ist ein Modellfehler: Wer in einer Application steht, ist faktisch beteiligt — punkt.

### Entscheidung
Sobald in einer Application `performer_id` oder `recipient_id` gesetzt wird, wird die jeweilige Person **automatisch** als `EventParticipant` zum übergeordneten Event hinzugefügt — sofern sie dort noch nicht eingetragen ist.

- Implementierung: serverseitig im Application-Service oder als DB-Trigger — Client kann diese Regel nicht umgehen.
- UI-Hinweis: beim Anlegen einer Application erscheint der Hinweis „Daniela wird als Participant des Events erfasst und kann es später einsehen."
- Manuelles Entfernen aus `EventParticipant` ist nur möglich, wenn die Person in **keiner** Application des Events mehr als Performer oder Recipient auftaucht. Sonst Constraint-Violation, klar kommunizierte Fehlermeldung im UI.

### Begründung
- **Konsistenz mit der Realität:** Wer beteiligt war, war beteiligt. Punktum.
- **Verhindert Inkonsistenz-Bug:** „Application existiert, Recipient existiert, Recipient sieht das Event nicht" wäre für Nutzer unverständlich und hätte echten Datenleck-Charakter (die Daten sind da, aber der Betroffene kann sie nicht einsehen).
- **Vereinfacht UX:** Performer muss nicht in zwei Schritten denken („erst Participant hinzufügen, dann Application anlegen") — das passiert automatisch.

### Konsequenzen
**Positiv:**
- Lückenloser Zusammenhang zwischen „in Application erwähnt" und „sieht das Event".
- Auch der Auto-Verknüpfungs-Effekt aus ADR-014 funktioniert sauber: Wird eine Person später mit einem User verknüpft, sieht sie alle Events, in denen sie als Recipient/Performer auftauchte.

**Negativ:**
- UI muss den Auto-Hinweis sauber kommunizieren, sonst überrascht es Nutzer.
- Trigger-/Service-Logik braucht Tests, die alle Edge-Cases abdecken (Performer hinzufügen, ändern, entfernen, Application löschen — Participant darf nicht versehentlich verschwinden, wenn andere Applications die Person noch referenzieren).

### Verworfene Alternativen
- **Manuelle Pflege durch Performer:** Performer vergisst es, Recipient sieht das Event nicht — schlechtes UX und Datenleck-artiger Bug.
- **Auto-Add nur für Recipient, nicht für Performer:** Inkonsistent. Wenn Performer sich selbst als Person eingetragen hat (Standardfall), ist sie sowieso schon Participant. Aber bei Edge-Cases (Admin trägt für andere ein) müsste die Logik dann doch greifen.

---

## ADR-013 — Vorlagen/Favoriten bewusst aufgeschoben

**Status:** Accepted
**Datum:** 2026-04-22

### Kontext
Im Live-Modus muss die Erfassung schnell gehen. Eine Idee zur Beschleunigung sind Vorlagen („Favoriten"): Performer pflegt für sich Sets aus Restraints, Positionen, Orientierung und ggf. Stamm-Recipient, die er beim Application-Anlegen mit einem Tap einsetzen kann.

Konzeptionell sinnvoll und potenziell sehr nützlich. Im MVP aber bewusst aufgeschoben.

### Entscheidung
Vorlagen/Favoriten werden im MVP **nicht** implementiert. Stattdessen:

- Schema dafür wird nicht angelegt.
- API-Endpoints werden nicht spezifiziert.
- Kein Meilenstein im aktuellen Fahrplan.
- Ein Platzhalter-Hinweis bleibt im `fahrplan.md` (Phase 3 oder eigene Konsolidierungsphase) als „bekannte Folge-Idee".

Sobald das System in Nutzung ist und die Gruppe konkretes Feedback liefert (welche Kombinationen tatsächlich häufig sind, ob ein Stamm-Setup pro User reicht oder mehrere benannte Vorlagen nötig sind), wird das Konzept neu evaluiert und ggf. als ADR-XXX und neuer Meilenstein nachgezogen.

### Begründung
- **Nutzerfeedback schlägt Spekulation:** Welche Vorlagen sich wirklich lohnen, weiß keiner vor dem ersten echten Live-Test. Vorzeitige Implementierung produziert Features, die niemand benutzt.
- **MVP soll laufen, nicht perfekt sein:** Live-Modus ohne Vorlagen ist langsamer, aber funktioniert. Mit Vorlagen wäre es schneller, aber das ist Optimierung, nicht Grundbaustein.
- **Komplexität wächst nicht-linear:** Vorlagen-Modell, UI für Anlage/Pflege/Auswahl, Sync-Verhalten im Offline-Modus — das alles ist nicht trivial. Der Aufwand passt besser in eine spätere Iteration.

### Konsequenzen
**Positiv:**
- MVP-Scope bleibt überschaubar.
- Echte Nutzungs-Daten leiten die spätere Implementierung.

**Negativ:**
- Live-Erfassung ist im MVP langsamer, als sie sein könnte. Performer muss bei jeder Application Restraints und Positionen neu wählen (mit Defaults „letzter Wert", die sich aus der vorigen Application ergeben können — das ist ein kleiner UX-Trick, der ohne Vorlagen-Schema funktioniert).

### Verworfene Alternativen
- **Vorlagen sofort implementieren:** Erhöht MVP-Aufwand spürbar, ohne dass die Feature-Form belastbar ist.
- **Stamm-Recipient als Mini-Vorlage in den User-Stammdaten:** Würde 80 % des Wertes mit 20 % des Aufwands liefern — wird in der späteren Evaluation geprüft, aber erst nach erstem realen Einsatz.

---

## ADR-014 — On-the-fly-Personenanlage und nachträgliche User-Verknüpfung

**Status:** Accepted
**Datum:** 2026-04-22

### Kontext
Im Live-Modus kommt es vor, dass der Performer als Recipient (oder als weiteren Beteiligten) eine Person einsetzen will, die noch nicht im System ist. Möglichkeiten:

- Den Live-Modus verlassen, in den Admin-Bereich gehen, Person anlegen, zurück zum Live-Modus — unrealistisch in der Situation.
- Person nicht erfassen, später nachtragen — verliert die Live-Daten oder den Bezug.
- Person on-the-fly anlegen — pragmatisch, schnell, behält den Bezug.

Außerdem: Wenn diese Person später dann doch einen User-Account bekommt (z. B. tritt der Gruppe bei oder wird vom Admin eingeladen), sollte sie ihre bisherigen Events rückwirkend einsehen können — ohne Daten-Migration, einfach durch Verknüpfung.

### Entscheidung

1. **Im Live-Modus** (sowohl Admin als auch Editor) gibt es im Recipient- und Performer-Dropdown eine Option „+ Neue Person hinzufügen". Modal mit einem Pflichtfeld `name`, optional `alias`. Beim Speichern: `Person` mit `origin = 'on_the_fly'`, `linkable = false`, `created_by = current_user_id`.

2. **Diese Person hat keinen User-Account** und kann sich nicht einloggen. Sie taucht in Events auf, sieht aber selbst nichts.

3. **Im Admin-Bereich** sieht der Admin alle on-the-fly angelegten Personen in einer eigenen Übersicht („Neue Personen aus Live-Erfassung"). Dort kann er pro Person:
   - Daten ergänzen (Alias, Notizen).
   - `linkable = true` setzen, um die Person für eine spätere User-Verknüpfung freizugeben.
   - Person mit einer anderen verschmelzen (falls Duplikat — siehe „Offene Punkte").
   - Person als „bleibt anonym" markieren (kein Flag-Wechsel, einfach lassen).

4. **Beim User-Anlegen** (Admin-UI) gibt es zwei Modi:
   - Standard: neuer User mit neuer Person.
   - Verknüpfungsmodus: neuer User wird mit einer bestehenden Person verknüpft. Im Dropdown erscheinen nur Personen mit `linkable = true`.

5. **Sobald die Verknüpfung hergestellt ist**, sieht der neue User via RLS automatisch alle Events, in denen die Person bereits Participant war — auch rückwirkend, ohne Datenänderung.

### Begründung
- **Live-Modus bleibt im Live-Modus:** Performer muss nicht aus dem Erfassungsfluss raus.
- **Saubere Trennung Person ↔ User:** Wir nutzen die ohnehin asymmetrische Beziehung aus ADR-010 konsequent — Person kann ohne User existieren.
- **Rückwirkende Verknüpfung kostet nichts:** Weil RLS auf `current_person_id` prüft und nicht auf einen Snapshot-Status, funktioniert die nachträgliche Verknüpfung automatisch.
- **`linkable`-Flag schützt vor Versehen:** Im Admin-User-Dropdown erscheinen nicht alle 50+ Personen, sondern nur die paar, bei denen der Admin bewusst gesagt hat „diese ist verknüpfungsbereit".

### Konsequenzen
**Positiv:**
- Live-Modus bleibt schnell und unterbrechungsfrei.
- Spätere Einladung neuer Mitglieder erfolgt sauber, mit voller Historie.
- Personen, die nie einen User-Account brauchen, können dauerhaft ohne existieren — kein Zwang.

**Negativ:**
- **Datenschutz-Implikation:** Personen werden im System erfasst, ohne dass sie selbst eingewilligt haben. In Pfad A ist das durch die Gruppen-Einwilligung gedeckt (alle Mitglieder wissen, dass auch externe Personen on-the-fly erfasst werden können). Der Einwilligungstext muss diesen Fall explizit benennen.
- **Duplikat-Risiko:** Ohne Pflege werden „Daniela", „daniela" und „Dani" als drei verschiedene Personen angelegt. Admin braucht eine Merge-Funktion (siehe „Offene Punkte" in `architecture.md`).
- **Editor kann unbegrenzt Personen anlegen:** Theoretisch könnte ein Editor das System mit Phantom-Personen fluten. In Pfad A unkritisch (eingeschworene Gruppe), in Pfad B müsste das beschränkt werden (z. B. Rate-Limit oder Admin-Freigabe analog zu Katalog-Vorschlägen).

### Harte Auflagen
- **Einwilligungstext für Pfad A muss explizit erwähnen**, dass auch externe Personen on-the-fly im System erfasst werden können, mit Name und Beteiligung an Events.
- **Vor Pfad-B-Wechsel** muss diese Praxis grundsätzlich neu bewertet werden — vermutlich braucht es dort entweder ein Vorschlags-/Freigabe-Modell oder eine deutlich strengere Person-Anlage-Policy.

### Verworfene Alternativen
- **Personen-Anlage nur durch Admin:** Bricht den Live-Modus auf, der explizit auch von Editoren genutzt werden soll.
- **Sofort verknüpfungsbereit (`linkable = true` als Default):** Verschmutzt das User-Anlage-Dropdown im Admin-UI mit allen Personen, die je angelegt wurden.
- **Person an User koppeln (umgekehrte FK-Richtung):** Würde das Modell komplett umdrehen und ADR-010 brechen. Asymmetrie ist hier ein Feature, kein Bug.

---

## ADR-015 — Feature-Set basierend auf Wettbewerbs- und Tagebuch-App-Analyse

**Status:** Accepted
**Datum:** 2026-04-22

### Kontext
Eine gezielte Recherche zu vergleichbaren Apps (BDSM-Tracker wie Bond, Obedience, mysub, xTracker; Tagebuch-Apps wie Day One, Diarium, Momento, StoryPad) zeigte:

- **Direkte Wettbewerber existieren nicht.** Die BDSM-Tracker sind D/s-Habit-Tracker (Regeln, Tasks, Punkte, Belohnungen), nicht Logbücher konkreter Vorgänge.
- **HC-Map ist konzeptionell näher an Tagebuch-Apps**, hat aber eine spezialisierte strukturierte Datendomäne.
- Mehrere Standard-Features moderner Tagebuch-Apps fehlen im bisherigen MVP-Plan.

### Entscheidung

**MVP zusätzlich aufgenommen:**

1. **Volltextsuche** über Notizen aller Events und Applications, unter Beachtung von RLS (User sucht nur in dem, was er sehen darf).
2. **App-PIN-Sperre** (clientseitig, IndexedDB-persistiert) — schnelle Sperre der UI nach Zeitraum-Inaktivität oder explizit per Knopf, unabhängig vom Auth-System. Verhindert Schulterblick-Einsicht ohne komplettes Re-Login.
3. **„On this day"-Anzeige** auf der Startseite — zeigt Events vom gleichen Tag in vergangenen Jahren.
4. **Daten-Export** für jeden User (eigene Events als JSON und CSV, Admin: alle Events).

**Phase 2 fest eingeplant:**

5. **Foto-/Medien-Anhänge** an Events und Applications. Speicherung auf VPS, RLS-äquivalente Zugriffskontrolle, Einwilligungstext muss erweitert werden (sehr sensibles Material in Pfad A grundsätzlich vertretbar, in Pfad B nur unter strengen Auflagen).
6. **Freie Tags** zusätzlich zu strukturierten Katalogen — User können Events mit beliebigen Schlagworten versehen („Geburtstag", „erstes Mal", „besonders gelungen"), Tag-basierte Filter und Suche.
7. **Bewertung/Stimmung** pro Event als optionales Feld — vermutlich Skala (z. B. 1–5 Sterne) oder Smiley-Set. Konkrete Form in Phase-2-Spezifikation.
8. **Persönliches Statistik-Dashboard** mit zwei Ebenen:
   - Eigene Statistik: wie oft als Performer, wie oft als Recipient, häufigste Materialien, durchschnittliche Application-Dauer, Aktivitäts-Trend.
   - **Kollektive Aggregat-Statistik mit persönlicher Gewichtung** — z. B. „TCH 840: 50 Anwendungen gesamt, davon 12 wo du beteiligt warst". Information „38 weitere Anwendungen ohne dich" ist anonym im Sinne, dass sie keine Person nennt.

### Begründung
- **Volltextsuche, App-PIN, „On this day", Export** sind in Tagebuch-Apps so etablierter Standard, dass User sie als selbstverständlich erwarten. Aufwand jeweils gering, Wert hoch.
- **Datensouveränität durch Export ist Pflicht**, nicht Kür — wer ein Logbuch führt, muss es auch wieder mitnehmen können.
- **Foto-Anhänge sind häufig gewünscht** (mysub-Reviewer, allgemeine Tagebuch-Praxis), aber datenschutz-sensibel — gehören in Phase 2 nach erstem Live-Erfahrungssammeln.
- **Tags und Bewertungen** sind klassische Tagebuch-Standards, ergänzen die strukturierten Felder ohne sie zu ersetzen.
- **Aggregat-Statistik** wurde explizit gewünscht und liefert echten Mehrwert für die Gruppe — gemeinsame Erfahrung mit bestimmten Materialien wird sichtbar, ohne Personen offenzulegen.

### Konsequenzen
**Positiv:**
- HC-Map fühlt sich nicht mehr wie eine Datenbankoberfläche an, sondern wie ein vollwertiges Logbuch.
- Standard-Erwartungen erfahrener App-Nutzer werden erfüllt.
- Datensouveränität wird konsequent durchgezogen (Daten rein UND raus).

**Negativ (bewusst in Kauf genommen):**
- **Aggregat-Statistik ist nur scheinbar anonym.** In einer Gruppe von <20 Personen ist Re-Identifikation über Aggregate praktisch möglich (wenn man die Vorlieben einzelner Mitglieder kennt). Der Einwilligungstext muss diesen Punkt explizit benennen, und die genaue Granularität der Statistik (volle Aggregate vs. Mindestschwellen vs. nur eigene Daten) wird in Phase-2-Spezifikation entschieden.
- **App-PIN ist clientseitig** — schützt vor Schulterblick, aber nicht vor jemandem, der das gesamte Gerät übernimmt. Das ist ausreichend für den Einsatzzweck, sollte aber nicht als „Sicherheits-Feature" missverstanden werden.
- **Foto-Anhänge bringen erhebliche neue Komplexität** (Storage, Größenbeschränkung, Formate, Thumbnail-Generierung, Zugriffskontrolle, Backup-Größe). Bewusst auf Phase 2 verschoben.
- **Tags vs. Kataloge:** Es entsteht eine geringe Redundanzgefahr — wenn jemand „Clejuso 13" als Tag tippt statt aus dem Restraint-Katalog zu wählen, geht strukturierte Information verloren. UI muss klar zwischen den beiden Konzepten unterscheiden.

### Bewusst nicht aufgenommen
Aus der Recherche, aber nicht passend für HC-Map:

- Punkte- und Belohnungssysteme (D/s-spezifisch).
- Echtzeit-Chat zwischen Partnern (Recipient nutzt die App während der Sitzung explizit nicht).
- Habit-Tracking, wiederkehrende Tasks (andere App-Klasse).
- Community-Forum / Group-Discussions (sprengt Pfad A).

### Verworfene Alternativen
- **App-PIN serverseitig:** Würde zusätzliche Auth-Schicht bedeuten, ohne klaren Sicherheitsgewinn. Clientseitig reicht für den Schulterblick-Use-Case.
- **Foto-Anhänge im MVP:** Hätte den MVP um Wochen verlängert (Storage-Setup, Backup-Größe, Datenschutz-Re-Evaluation) ohne Kern-Funktion zu ergänzen.
- **Statistik-Dashboard nur für Admin:** Hätte den emotionalen Wert für die Gruppe verfehlt — die Statistik ist gerade für die Beteiligten interessant, nicht für die Verwaltung.
- **Aggregate erst ab Mindestschwelle:** Wäre datenschutz-konservativer, aber bei seltenen Materialien sähe man gar nichts. In Pfad A (eingeschworene Gruppe mit Einwilligung) als bewusste Entscheidung für Vollaggregate.

---

## ADR-016 — SQLAdmin als parallele Admin-Schicht

**Status:** Accepted
**Datum:** 2026-04-22

### Kontext
ADR-005 hat FastAPI gewählt und dabei bewusst in Kauf genommen, dass kein Admin-Interface out-of-the-box verfügbar ist. Die Konsequenz war, dass alle Admin-Funktionen (User-Verwaltung, Personen-Verwaltung, Katalog-Pflege, Datenbank-Inspektion) im Next.js-Frontend selbst gebaut werden müssen.

Die Framework-Analyse (siehe `docs/framework-analyse.md`) hat gezeigt: Es gibt mit **SQLAdmin** ein ausgereiftes, BSD-3-lizenziertes Admin-Panel für FastAPI + SQLAlchemy, das CRUD-Oberflächen für alle Tabellen automatisch generiert — sortier- und durchsuchbar, mit Tabler-UI und WTForms-basierter Formular-Erzeugung.

### Entscheidung
SQLAdmin wird als **parallele Admin-Schicht** unter `/admin` in das Backend integriert, zusätzlich zum Next.js-Frontend.

**Aufgabenverteilung:**

- **SQLAdmin übernimmt** (Backend-Routen unter `/admin`):
  - CRUD für User (inkl. Rolle setzen, deaktivieren, Person verknüpfen)
  - CRUD für Person (inkl. `linkable`-Toggle, Anonymisierung)
  - CRUD für Kataloge (RestraintType, ArmPosition, HandPosition, HandOrientation) — inkl. Freigabe von pending-Einträgen
  - Daten-Inspektion: alle Events und Applications admin-weit lesbar
  - Bulk-Aktionen (mehrere Einträge gleichzeitig bearbeiten)

- **Next.js übernimmt weiterhin** (unter `/`):
  - Kompletter User-Workflow (Live-Modus, Erfassung, Karte, Suche, Export)
  - Eigene UI-Designs, die SQLAdmin nicht leisten kann
  - Spezifische Admin-UIs, die über reine CRUD hinausgehen (Statistik-Dashboards, Freigabe-Queues mit Workflow-Charakter)

**Zugangskontrolle:**
- Der `/admin`-Bereich ist nur für User mit `role = 'admin'` erreichbar.
- SQLAdmin-Auth wird mit der bestehenden fastapi-users-Session verknüpft (SQLAdmin unterstützt Custom-Auth-Backends).
- Kein separater Admin-Login.

### Begründung
- **Massive Aufwandsersparnis** in M8 (Admin-Bereich): geschätzt 60–70 % der reinen CRUD-Arbeit entfällt.
- **Robustheit durch bewährte Bibliothek**: SQLAdmin hat ~2.200 GitHub-Stars, wird aktiv gepflegt, ist BSD-3 (keine AGPL-Falle).
- **Keine Kompromisse bei User-Experience**: Die User-orientierten Workflows bleiben in Next.js und können frei gestaltet werden; SQLAdmin ist nur für den Admin, der ohnehin technisch affin genug ist, um mit einer funktionalen Standard-Oberfläche gut arbeiten zu können.
- **Notfall-Tool**: SQLAdmin dient auch als „Notausstieg" zur Daten-Inspektion, falls das Next.js-Frontend Probleme hat — wertvoll für Debugging und Betrieb.

### Konsequenzen
**Positiv:**
- M8 wird deutlich kleiner und damit schneller und weniger fehleranfällig.
- Admin hat sofort funktionierende Stammdaten-Pflege, auch wenn das Next.js-UI noch lückenhaft ist.
- Zwei-Schichten-Architektur (schnelle Stammdaten-Pflege + sorgfältige User-UX) ist ein etabliertes Muster.

**Negativ (bewusst in Kauf genommen):**
- **Zwei visuelle Stile**: SQLAdmin hat Tabler-UI-Look, Next.js hat shadcn/ui-Look. Für den Admin akzeptabel, da er weiß, zwischen welchen Werkzeugen er wechselt.
- **Zwei Auth-Integrationen**: Cookie-Session muss in SQLAdmin-Auth-Backend eingebunden werden. Geringer einmaliger Aufwand.
- **RLS-Verhalten in SQLAdmin**: Admin hat per RLS ohnehin Vollzugriff, daher kein Konflikt. Wichtig ist nur, dass SQLAdmin die GUC-Variablen (`app.current_role = 'admin'`) setzt, bevor DB-Zugriffe erfolgen.

### Verworfene Alternativen
- **Komplettes Admin-UI in Next.js selbst bauen:** Viel mehr Aufwand, ohne UX-Vorteil für Admin-Routineaufgaben.
- **Django statt FastAPI (hätte Django Admin „geschenkt"):** Hätte ADR-005 umgekehrt. SQLAdmin bietet vergleichbare Funktionalität für FastAPI.
- **Externes CMS wie Directus oder NocoDB:** Überdimensioniert, zusätzlicher Service, neue Auth-Domäne.

---

## ADR-017 — RxDB für Offline-Sync in Live-Modus

**Status:** Accepted
**Datum:** 2026-04-22

### Kontext
ADR-011 hat den Live-Modus als primäres Erfassungsparadigma festgelegt. Damit ergibt sich die Anforderung aus M5b: Events und Applications müssen auch bei Netzausfall erfassbar bleiben und nach Wiederverbindung sauber synchronisiert werden.

Die ursprüngliche Skizze sah „IndexedDB-Zwischenspeicherung und Sync-Worker" als Eigenentwicklung vor. Die Framework-Analyse (siehe `docs/framework-analyse.md`) hat die Optionen strukturiert:

- **RxDB** — reaktive Offline-first-Datenbank mit IndexedDB-Storage-Adapter (Dexie), eingebautes Replication-Protokoll, Conflict-Resolution-Strategien.
- **Dexie.js pur** — schlanker IndexedDB-Wrapper, Sync-Logik selbst schreiben.
- **PouchDB** — CouchDB-Replication, würde CouchDB als Backend verlangen (nicht zu Postgres-Stack passend).
- **Eigenbau auf nativem IndexedDB** — sehr hoher Aufwand.

### Entscheidung
**RxDB** mit **Dexie-Storage-Adapter** wird als Offline-Sync-Schicht eingesetzt.

**Architektur:**

- **Clientseitig:** RxDB verwaltet eine lokale Kopie der für den User sichtbaren Events und Applications. Alle Live-Modus-Aktionen schreiben zuerst in RxDB, der Sync-Worker repliziert mit dem FastAPI-Backend.
- **Backend:** FastAPI-Endpoints folgen dem RxDB-Replication-Protokoll:
  - `GET /api/sync/pull?updatedAt={cursor}&limit=100` — liefert geänderte Dokumente seit Cursor.
  - `POST /api/sync/push` — nimmt clientseitige Änderungen entgegen, gibt Konflikte zurück.
- **Conflict-Resolution:** Server-Zeit ist Wahrheit für Zeitstempel; Last-Write-Wins für Notiz-Felder; spezifische Strategien werden in M5b definiert.
- **Scope:** Nur Events und Applications sind offline-fähig. Kataloge, Personen-Auswahl, User-Verwaltung laufen weiter online-only (werden ohnehin selten geändert).
- **RLS-Durchreichung:** Die Sync-Endpoints respektieren RLS — jeder Client bekommt nur seine sichtbaren Events repliziert.

### Begründung
- **Starke Aufwandsersparnis in M5b** (geschätzt 50–60 %): Replication-Protokoll, Conflict-Resolution, Offline-Queue, Resync-Logik sind in RxDB ausgereift vorhanden.
- **Vermeidet die klassischen Offline-First-Bugs**: Duplikate bei Retry, verlorene Offline-Änderungen, Zeitstempel-Drift — das alles ist in RxDB bereits durchdacht.
- **Aktive, gut dokumentierte Library**: Viele produktive Nutzer, breite Storage-Adapter-Palette, saubere TypeScript-Typen.
- **Zukunftsoffen**: Bei Pfad-B-Wechsel könnte Multi-Device-Sync eines Users (gleiche Daten auf Handy + Desktop synchron) fast geschenkt dazukommen.

### Konsequenzen
**Positiv:**
- M5b bleibt umsetzbar und nicht-trivial, aber deutlich robuster als Eigenbau.
- Reaktive Datenströme vereinfachen auch die UI-Logik: UI reagiert automatisch auf Änderungen, egal ob lokal, von Sync oder von Timer.
- Entwicklungsgeschwindigkeit steigt, weil Edge-Cases (parallel getätigte Änderungen, Retry-Logik) nicht neu gelöst werden müssen.

**Negativ (bewusst in Kauf genommen):**
- **Lernkurve**: RxDB ist ein eigenes Framework mit reaktiven Paradigmen (RxJS-Unterbau). Claude Code muss die Konzepte sauber aufnehmen.
- **Bundle-Größe**: RxDB + Dexie + RxJS kosten ca. 150–200 KB gzipped im Frontend-Bundle. Für Mobile-First grenzwertig, aber akzeptabel.
- **Backend-Endpoints müssen zum Replication-Protokoll passen**: Leichte Anpassung der API-Route-Struktur (separates `/api/sync/`-Präfix statt CRUD-Endpoints für die replizierten Tabellen). Kein großer Aufwand, aber muss in der Architektur entsprechend gepflegt werden.
- **Storage-Limits der Browser**: Safari löscht IndexedDB nach 7 Tagen Inaktivität. Bei seltenen Nutzern relevant — Lösung: bei Reconnect prüfen, ob lokale DB noch mit Server-Stand übereinstimmt, sonst Re-Sync.

### Verworfene Alternativen
- **Dexie.js pur**: Weniger Komplexität im Client, aber Sync-Logik wäre Eigenbau mit allen Edge-Cases. Netto schlechterer Deal.
- **PouchDB + CouchDB**: Würde den DB-Stack komplett umbauen. Bricht ADR-005.
- **Eigenbau auf nativem IndexedDB**: Würde M5b zu einem mehrwöchigen Projekt machen. Nicht vertretbar für Hobby-Scope.
- **Nur Online-Modus mit Aufgabe der Offline-Anforderung**: Hätte den Live-Modus im Funkloch praktisch unbrauchbar gemacht. Bricht ADR-011.

---

## Noch zu entscheiden (Platzhalter)

Folgende Punkte werden als ADRs dokumentiert, sobald sie in der Architekturphase oder bei Start der Umsetzung anstehen:

- Deployment-/Hosting-Setup auf dem VPS (Reverse Proxy, Container-Strategie, Prozessmanagement, TLS-Zertifikate, CI/CD).
- Migrationsstrategie für den w3w-Bestand (Script-Ort, Batch-Größe, Backup vor Migration, Wiederholbarkeit).
- Backup- und Restore-Konzept (Frequenz, Off-Site-Speicherort, Restore-Test-Rhythmus).
- Logging, Monitoring und Alerting.
- Test-Strategie (Unit, Integration, E2E, RLS-Tests).
- Session-/Token-Strategie (JWT vs. Cookie-Session) innerhalb ADR-006.
- Package-Manager und Python-Version innerhalb ADR-005.
- Projektlizenz (vor M11).
- Off-Site-Backup-Anbieter (M13).
- E-Mail-Versanddienst (vor M11).
- Statistik-Granularität in M17 (volle Aggregate vs. Mindestschwelle vs. nur eigene Daten).

---

## ADR-018 — Implementierungsstrategie M1 (Datenmodell, Migrations, Seeds, RLS-Default)

**Status:** Akzeptiert (2026-04-25)

**Kontext:** M1 setzt das in `architecture.md` §Datenmodell spezifizierte Schema
um. Architecture-Doku lässt mehrere Implementierungsdetails offen, die für
einen lauffähigen ersten Migrationsstand entschieden sein müssen.

**Entscheidungen:**

1. **Neue Backend-Dependencies** (alle MIT/BSD/Apache, lizenzkonform §6):
   - `sqlalchemy[asyncio]>=2.0` (ADR-005 explizit)
   - `alembic>=1.14` (ADR-005 explizit)
   - `asyncpg>=0.30` — Standard-Async-Treiber für Postgres
   - `geoalchemy2>=0.15` — PostGIS-Spalten in SQLAlchemy
   - `uuid-utils>=0.10` — UUIDv7-Generation client-seitig
   - `testcontainers[postgresql]>=4` — echtes Postgres+PostGIS in Tests
   - `psycopg[binary]>=3.2` — Sync-Treiber für Alembic-Offline-Operationen

2. **UUIDv7-Strategie:** Client-seitig via `uuid_utils.uuid7()` als
   SQLAlchemy-`default`. Postgres 16 hat keine native v7-Funktion; eine
   PL/pgSQL-Implementierung würde Schema-Komplexität ohne Nutzen einführen.

3. **`updated_at`-Mechanik:** Postgres-Trigger `BEFORE UPDATE` pro Tabelle
   (in der Migration). Greift auch bei direkten SQL-Schreibern (Admin,
   data migrations) und bleibt unabhängig vom ORM.

4. **RLS-Default in M1:** RLS auf allen daten-führenden Tabellen aktivieren
   (`ENABLE` + `FORCE ROW LEVEL SECURITY`) und eine permissive Default-
   Policy für die Anwendungs-Rolle anlegen (USING + WITH CHECK = `true`).
   Dadurch sind RLS-Mechanik, Rolle und Connection-Setup ab M1 produktiv,
   während die scharfen Rollen-Policies aus `architecture.md` §RLS
   gemeinsam mit fastapi-users in M2 nachgezogen werden.

5. **Anwendungs-Rolle:** Neue Postgres-Rolle `app_user` (NOLOGIN, NOSUPERUSER),
   Eigentümer aller Anwendungs-Tabellen bleibt der Migrations-User.
   Backend-Connections setzen `SET ROLE app_user` pro Session (genaue
   Verdrahtung in M2 mit fastapi-users). RLS-Policies adressieren `app_user`.

6. **Seed-Strategie:** Separate Skripte unter `backend/seeds/`, idempotent via
   `INSERT ... ON CONFLICT DO NOTHING` auf den jeweiligen UNIQUE-Constraints.
   CLI-Einstieg `uv run python -m app.seeds.run`. Architecture §Migrations
   verbietet Seeds in Alembic explizit.

7. **RestraintType-Seed-Inhalt:** In M1 nur die in `fahrplan.md` Z. 105
   namentlich genannten Anker-Modelle (siehe `architecture.md` §Katalog-Seed),
   plus die Material-Einträge. Die ausführliche
   `restraint-types-seed-review.md` ist explizit als Vor-Sichtungsliste
   markiert; ihre Übernahme passiert nach inhaltlicher Abnahme durch den
   Admin in einem separaten Schritt.

8. **Test-Infrastruktur:** Tests beziehen ihren Postgres-DSN bevorzugt aus
   `HCMAP_TEST_DATABASE_URL`. Wenn nicht gesetzt, fällt eine Pytest-Fixture
   auf `testcontainers` zurück (benötigt Docker). Dadurch lokale Entwicklung
   und CI gleichermaßen möglich, ohne Code-Änderung.

**Konsequenzen:**
- M1-Migrationen sind in M2 nicht zu re-rollen: scharfe Policies werden als
  zusätzliche Migration eingespielt, nicht durch Down-Migration ersetzt.
- `app_user`-Rolle ist Voraussetzung für alle weiteren RLS-Tests in M2.
- UUIDv7-Wechsel auf eine native Postgres-Funktion (z. B. nach Upgrade auf
  Postgres 18) wäre eine reine Default-Substitution ohne Schema-Migration.

**Verworfene Alternativen:**
- B2 (PL/pgSQL-UUIDv7-Function): zu viel DB-Logik für minimalen Gewinn.
- B3 (Vorerst v4): widerspricht `architecture.md` §Konventionen.
- C2 (`onupdate=func.now()` ORM-seitig): greift nicht bei Direkt-SQL.
- D2 (RLS erst in M2): Risiko, dass M1-Migration substantially geändert
  werden muss.
- E2 (Seeds in Alembic): widerspricht `architecture.md` §Migrations.
- F2 (volle Sichtungsliste ohne Abnahme): widerspricht Datei-Kopfnote.

---

## ADR-019 — Implementierungsstrategie M2 (Auth, CSRF, RLS-Mechanik, Bootstrap)

**Status:** Akzeptiert (2026-04-25)

**Kontext:** M2 setzt Authentifizierung, RBAC, scharfe RLS-Policies und
Admin-Bootstrap um. ADR-006 (fastapi-users + Cookie-Sessions) liefert das
Grobgerüst; mehrere Detailentscheidungen sind für M2 zu fixieren.

**Entscheidungen:**

1. **Cookie + Token-Strategie (B1):** `CookieTransport` mit
   `cookie_name="hcmap_session"`, `cookie_secure=True` (in dev abschaltbar
   per Setting), `cookie_httponly=True`, `cookie_samesite="lax"`,
   Lebensdauer 7 Tage. `JWTStrategy` mit serverseitigem
   `HCMAP_SECRET_KEY`. Stateless — kein zusätzlicher Session-Store. DB-
   backed Sessions wären für eine <20-Personen-Gruppe Overkill.

2. **CSRF (C1):** Eigene schmale Middleware in `app/security/csrf.py`.
   Bei erfolgreichem Login wird zusätzlich ein **nicht** HttpOnly-Cookie
   `hcmap_csrf` mit zufälligem Token (32 Bytes URL-safe) gesetzt. Alle
   State-Changing Methoden (`POST`, `PUT`, `PATCH`, `DELETE`) müssen den
   identischen Wert im Header `X-CSRF-Token` mitschicken; sonst 403.
   `GET`/`HEAD`/`OPTIONS` bleiben CSRF-frei. Auth-Login-Endpoint und
   `/api/health` sind whitelisted. Kein zusätzliches Paket.

3. **Argon2id-Parameter (D):** OWASP-Empfehlung 2024 — `time_cost=2`,
   `memory_cost=19456` (≈19 MiB), `parallelism=1`, `hash_len=32`,
   `salt_len=16`. Konfigurierbar über `Settings` (`HCMAP_ARGON2_*`),
   damit Tests schnellere Parameter setzen können. Mindest-
   Passwortlänge 12 Zeichen, kein Maximum (project-context.md §6).

4. **RLS-Mechanik (E1):** Pro Request öffnet das Backend eine neue
   Transaktion (`BEGIN`), setzt `SET LOCAL ROLE app_user` und drei GUCs
   (`app.current_user_id`, `app.current_role`, `app.current_person_id`).
   Bei Ende der Transaktion verfallen alle `SET LOCAL`-Werte automatisch.
   Implementiert in `app/rls.py` als FastAPI-Dependency, die statt
   `get_session` (M1) verwendet wird, sobald Auth aktiv ist. Anonyme
   Endpoints (Health, Auth-Login) nutzen `get_session` ohne RLS-Setup.

5. **Scharfe RLS-Policies (F):** Eine zweite Alembic-Migration ersetzt
   die permissiven Default-Policies aus M1 1:1 mit den per-Rolle-Policies
   aus `architecture.md` §RLS:
   - Event: admin alle, editor/viewer SELECT nur als Participant,
     editor INSERT/UPDATE/DELETE nur eigene.
   - EventParticipant + Application + ApplicationRestraint spiegeln das
     Event-RLS via Sub-Selects.
   - Catalog-Tabellen (RestraintType, ArmPosition, HandPosition,
     HandOrientation): admin alle, editor approved+eigene pending,
     viewer nur approved.
   Person bleibt ohne DB-RLS; Maskierung von `name` läuft als
   Service-Logik, weil sie kontextabhängig ist (siehe architecture.md).

6. **RBAC (`require_role`):** FastAPI-Dependency-Factory in
   `app/deps.py`. Akzeptiert eine oder mehrere Rollen, prüft den per
   `current_user`-Dependency geladenen User und wirft 403 bei
   Mismatch. Liefert den User-Objekt durch.

7. **Bootstrap-CLI (G1):** `backend/scripts/bootstrap_admin.py`,
   ausführbar via `uv run python -m scripts.bootstrap_admin`. Stdlib
   `argparse`. Idempotent: legt eine Person + den ersten Admin-User an,
   wenn noch keiner existiert; sonst Exit 1 mit klarer Meldung. Liest
   E-Mail/Passwort/Name aus Argumenten oder ENV (`HCMAP_BOOTSTRAP_*`).

8. **Mail-Stub (H):** `app/auth/mail.py` mit Interface
   `EmailBackend.send(...)`. Default-Implementation `LoggingBackend`
   schreibt strukturiertes Log mit Reset-Token-URL — kein PII jenseits
   der ohnehin nötigen Adresse. Echter SMTP-Backend wird vor M11
   eingespielt (Querschnittsaufgabe).

**Abgrenzung gegen M2:** Frontend-Auth-Flow (Login-Seite, Hooks) ist
**M4**. RLS-Tests in M2 testen ausschließlich auf API-/SQL-Ebene.

**Konsequenzen:**
- RLS-Policies sind ab M2 produktiv und werden von M3+ vorausgesetzt.
- Connection-Pool-Konfiguration: jede Anfrage öffnet eine eigene
  Transaktion mit `SET LOCAL`. Pool-Mode: kein expliziter
  PgBouncer-Modus nötig, weil Transaktions-Pooling SET LOCAL respektiert.
- HCMAP_SECRET_KEY wird zur Pflichtvariable. `.env.example` ergänzt.
- Alle Tests, die DB schreiben, müssen entweder als Admin agieren oder
  eine Test-Fixture nutzen, die GUCs richtig setzt.

**Verworfene Alternativen:**
- B2 (DB-backed Sessions): Komplexität ohne Mehrwert in Phase 1.
- C2 (`fastapi-csrf-protect`): externe Dependency für ein paar Zeilen
  Logik nicht gerechtfertigt.
- E2 (Pool-weit `SET ROLE`): Risiko von GUC-Leaks zwischen Requests.
- G2 (Click/Typer-CLI): zusätzliche Abhängigkeit für ein einziges Skript.

---

## ADR-020 — Implementierungsstrategie M3 (Domain-API, Service-Layer, Search, Export)

**Status:** Akzeptiert (2026-04-25)

**Kontext:** M3 setzt die Domain-CRUD-API plus Volltextsuche, Throwbacks
und Export um. `architecture.md` §API-Vertrag liefert das Grobgerüst, M3
braucht konkrete Festlegungen zu Scope-Schnitt, Struktur und Hilfsverhalten.

**Entscheidungen:**

1. **Scope-Schnitt M3 ↔ M5a (A1):** M3 deckt nur die generischen
   CRUD-Endpunkte. Live-Modus-Spezialisierungen
   (`POST /api/events/start`, `/end`, `/applications/start`, `/end`,
   `POST /api/persons/quick`) ziehen mit M5a, weil sie an die UI-Mechanik
   koppeln.

2. **Endpunkt-Inventar (B):** `/api/events`, `/api/applications`,
   `/api/persons`, `/api/restraint-types` + drei weitere Catalog-Pfade,
   `/api/search`, `/api/throwbacks/today`, `/api/export/me`,
   `/api/admin/export/all`. Persons-Schreibzugriff admin-only;
   Anonymisierungs-Endpoint `POST /api/persons/{id}/anonymize`.

3. **Pagination (C1):** Offset/Limit mit `?limit=50&offset=0` (Default 50,
   Max 200). Response-Hülle `{items, total, limit, offset}`. Cursor-
   Pagination wäre für <5000 Events Overkill und kann später ohne
   API-Vertragsbruch als zusätzlicher Modus ergänzt werden.

4. **Service-Layer (D1):** Module unter `backend/app/services/`. Routes
   bleiben dünn (Pydantic-Validierung + Auth-Dependency + Service-
   Aufruf). Services kapseln SQL/ORM und Business-Regeln. Erleichtert
   Tests und CLI-Wiederverwendung (Bootstrap, w3w-Migration).

5. **Auto-Participant-Regel (E1, ADR-012):** Service-Layer
   (`applications.create`) fügt Performer und Recipient implizit als
   `EventParticipant` ein, wenn nicht schon vorhanden. Reversibel,
   testbar, kein DB-Trigger.

6. **Plus-Code (F):** Neues Paket `openlocationcode>=1.0` (BSD-3,
   in `project-context.md` §3 vorgesehen). Berechnung in der Detail-
   Response (`GET /api/events/{id}.plus_code`); nicht in Listenansicht
   (Performance) und nicht persistiert (kein Schema-Change).

7. **Volltextsuche (G):** Direkter Query gegen die GIN-Indizes aus M1
   mit `to_tsvector('german', note) @@ plainto_tsquery('german', :q)`.
   Liefert gemischte Liste mit `{type, id, snippet, event_id?}`. RLS
   greift automatisch via `app_user_can_see_event`. Pagination wie C1.

8. **Personenmaskierung (H):** Service-Layer ersetzt Person-Felder
   (`name`, `alias`) durch Platzhalter (`"[verborgen]"`) in Events mit
   `reveal_participants=false`, **außer** der anfragende User ist
   selbst Participant in genau diesem Event. Maskierung ist kontext-
   abhängig und gehört nicht in eine DB-Policy.

9. **Validierung (I):** Pydantic-Schemas für Request/Response;
   `performer_id != recipient_id` als **Warning** (HTTP 422 nur, wenn
   `?strict=true` gesetzt — Default akzeptiert Self-Bondage). Katalog-
   Einträge in Application müssen `status='approved'` sein
   (Service-Layer-Check). Lat/Lon zusätzlich als Pydantic-Constraint.

10. **Export (J1):**
    - JSON: `application/json`, ein Top-Level-Objekt mit
      Versionsfeld, Sektionen `events`, `applications`,
      `event_participants`, `application_restraints`,
      `restraint_types` (nur referenzierte). Nicht-streaming.
    - CSV: pro Entität ein eigener Endpoint
      (`/api/export/me/events.csv`, `/applications.csv`).
      `StreamingResponse`, ein Header pro Datei.
    - Admin-Export setzt RLS aus über die Admin-Rolle.

11. **OpenAPI-Doku:** alle Routes mit `summary`, `description`,
    `response_model`, `tags`. Beispiele für die Request-Bodies via
    `examples=` an den Pydantic-Feldern.

**Konsequenzen:**
- Keine Schema-Migration in M3 (Plus-Code wird nicht persistiert,
  Volltextsuche nutzt vorhandene Indizes, RLS-Policies bleiben).
- Service-Layer ist die Stelle, an der Auto-Participant, Maskierung,
  Approved-Catalog-Check und Anonymisierung sitzen — Tests müssen die
  Service-Funktionen direkt prüfen können.
- M3 produziert ~25 Endpunkte; OpenAPI bleibt der primäre Doku-
  Anker.

**Verworfene Alternativen:**
- E2 (DB-Trigger Auto-Participant): koppelt Geschäftslogik an Postgres,
  schwer zu testen.
- Cursor-Pagination: Overengineering für Pfad A.
- Plus-Code als generated column: würde Schema-Migration erfordern und
  bei späterem Plus-Code-Algorithmus-Wechsel weitere Migration.

---

## ADR-021 — Implementierungsstrategie M4 (Frontend-Grundgerüst, Auth-Flow)

**Status:** Akzeptiert (2026-04-25)

**Kontext:** M4 baut das Frontend-Grundgerüst auf einem bereits vorhandenen
Next.js-15-Skelett (TypeScript strict, Tailwind 3.4, shadcn-Konfig). ADR-006
(Cookie-Sessions) und ADR-019 (CSRF-Double-Submit) liefern das Backend-
Verhalten; für die Browser-Seite werden elf Detail-Entscheidungen fixiert.

**Entscheidungen:**

1. **Backend-Anbindung in Dev (A1):** `next.config.mjs` rewrite
   `/api/*` → `http://backend:8000/api/*` (lokal über `BACKEND_INTERNAL_URL`
   parametrisiert, Default `http://localhost:8000`). Damit bleiben Cookies
   Same-Origin, kein CORS-Aufwand. Im Produktiv-Deployment übernimmt Caddy
   diese Aufgabe (siehe `architecture.md` §Caddyfile); der Next.js-Rewrite
   ist Dev-only, gesteuert über `process.env.NODE_ENV !== 'production'`.

2. **fetch-Wrapper (B1):** `src/lib/api.ts` als typisierter Wrapper.
   - `credentials: 'include'` immer.
   - Auf Mutations (`POST/PUT/PATCH/DELETE`) liest der Wrapper das
     `hcmap_csrf`-Cookie via `document.cookie`-Parsing und setzt
     `X-CSRF-Token`-Header.
   - Fehler werden als `ApiError`-Klasse (`status`, `code`, `detail`)
     geworfen, JSON-Body wird best-effort geparst.
   - Auf dem Server (Server Components, Middleware) gibt es eine zweite
     Variante, die mit explizit übergebenen Cookie-Headern arbeitet.

3. **Server-State (C1):** `@tanstack/react-query` mit `QueryClient` in
   `src/components/providers.tsx` (Client-Component, in `RootLayout`
   eingebunden). Cache-Keys hierarchisch: `['auth','me']`, `['events']`,
   `['catalogs', kind]`. Default-Stale-Zeit 30 s, Refetch on Window
   Focus aus.

4. **Route-Protection (D3):** Hybrid.
   - `src/middleware.ts` (Edge): prüft Existenz des `hcmap_session`-
     Cookies. Bei fehlendem Cookie auf `/login` umleiten (außer `/login`
     selbst und Public-Pfade).
   - `src/app/(protected)/layout.tsx` (Server-Component): lädt
     `/api/auth/me` mit weitergereichten Cookies; bei 401 `redirect()`
     auf `/login`; bei `role`-Mismatch (z. B. `/admin/*` ohne Admin)
     auf `/`.

5. **Login-Submission (E1):** Client-Component mit `useMutation` →
   `POST /api/auth/login` über fetch-Wrapper. Nach Erfolg
   `router.push('/')` und `queryClient.invalidateQueries({queryKey:
   ['auth','me']})`. Keine Server Action (Cookie-Weitergabe-Aufwand
   nicht gerechtfertigt).

6. **Layout (F1):** Sidebar ab `md:`, Bottom-Tab-Bar darunter, beide aus
   einer gemeinsamen Nav-Item-Liste in `src/components/layout/nav.ts`
   generiert. Komponenten: `AppShell`, `Sidebar`, `BottomNav`,
   `UserMenu`.

7. **Dark-Mode (G1):** `next-themes` mit `attribute="class"`,
   `defaultTheme="system"`, `enableSystem`. Theme-Toggle im UserMenu.
   `suppressHydrationWarning` auf `<html>`.

8. **shadcn-Initialset (H):** Generiert via `pnpm dlx shadcn@latest add`
   (oder bei fehlendem Netzwerk-Zugriff manuell anhand der offiziellen
   Templates kopiert): `button`, `input`, `label`, `form` (inkl.
   `react-hook-form`+`@hookform/resolvers`+`zod` für Validierung),
   `card`, `dropdown-menu`, `avatar`, `sheet`, `sonner`, `skeleton`.
   Style "new-york", `cssVariables: false` (bestehende `components.json`).

9. **Stub-Seiten (I):** `/` Dashboard, `/events`, `/map`, `/admin`,
   `/profile`, `/login`. M4 zeigt End-to-End: Login → Auth-Cookie →
   `/api/auth/me` → Dashboard mit Display-Name + Rolle. Listen
   befüllen sich aus echten Backend-Routen
   (`/api/events?limit=5`, `/api/throwbacks/today`); leere Antworten
   sind erlaubt. Echte Inhalte folgen mit M5a/M5c/M6/M8.

10. **Tests (J1):** `vitest` + `@testing-library/react` +
    `@testing-library/jest-dom` + `jsdom`. Pflicht-Tests in M4:
    - `lib/api.ts`: setzt `X-CSRF-Token` bei Mutations, lässt GET frei.
    - `useMe`-Hook: 200 → User; 401 → null.
    - `middleware.ts`: redirected ohne Session-Cookie auf `/login`.
    - Login-Form: erfolgreicher Submit ruft Wrapper mit korrekter
      Payload, Fehler zeigt Toast.
    Coverage-Ziel laut `project-context.md` §7 (60 % Frontend) ist
    erst nach M5+ abprüfbar; M4 legt nur die Infrastruktur.

11. **Neue Dependencies (K, alle MIT/ISC, lizenzkonform):**
    Runtime: `@tanstack/react-query`, `@tanstack/react-query-devtools`
    (dev-only), `next-themes`, `lucide-react`, `class-variance-authority`,
    `@radix-ui/react-*` (Slot, Dropdown-Menu, Avatar, Dialog, Label),
    `react-hook-form`, `@hookform/resolvers`, `zod`, `sonner`.
    Test/Dev: `vitest`, `@vitejs/plugin-react`, `jsdom`,
    `@testing-library/react`, `@testing-library/jest-dom`,
    `@testing-library/user-event`.

**Konsequenzen:**
- Browser-Side hat genau einen Auth-Pfad: Cookie + CSRF, keine zusätzlichen
  Tokens. Damit deckt M4 alle Pflicht-Sicherheits-Erwartungen aus
  `project-context.md` §6 ab, ohne Wiederholungslogik.
- `lib/api.ts` ist die alleinige Stelle für Mutations-Header; künftige
  Domains erben CSRF- und Credential-Handling automatisch.
- `(protected)`-Route-Group hält öffentliche (`/login`) und
  geschützte Pfade auseinander, ohne dass jeder Layout-Boilerplate
  schreibt.
- M4 ist ein durchgängiger Auth-Vertical-Slice: Login → Session →
  Dashboard mit `useMe`. Spätere Domains (Events, Map, Admin) bauen
  nur Inhalte hinein.

**Verworfene Alternativen:**
- A2 (CORS + Direkt-Aufruf): zusätzlicher Setup ohne Mehrwert in Dev.
- B2 (OpenAPI-Codegen): lohnt erst nach M5/M7, wenn Endpunkt-Anzahl
  hoch ist.
- D1 (Middleware-Only): Edge-Middleware kann nicht zuverlässig
  `/api/auth/me` aufrufen (Body-Streaming-Beschränkung) — Rolle-
  Check gehört in Server-Component.
- D2 (Layout-Only): Edge-Redirect für Anonyme ist deutlich schneller.
- E2 (Server Action für Login): Set-Cookie-Weitergabe macht den
  Code komplizierter ohne UX-Vorteil.
- F2 (Drawer/Hamburger): kollidiert mit ADR-011 — Live-Modus braucht
  schnellen Tab-Wechsel auf Mobile.
- G2 (eigene Tailwind-Class-Strategie): Hydration-Risiko, mehr Code.

---

## ADR-022 — LocationPicker und Tile-Proxy in M5a vorgezogen

**Status:** Akzeptiert (2026-04-26)

**Kontext:** M5a verlangt im Live-Modus eine GPS-Vorbelegung mit
„Tap-to-Adjust"-Korrektur auf einer Karte (siehe `fahrplan.md` §M5a,
Akzeptanzkriterium „GPS-Korrektur per Karten-Tap funktioniert"). Die
vollständige Kartenansicht (Marker-Liste, Clustering, Filter, URL-State,
Popup-Navigation) ist als eigener Meilenstein **M6** definiert. Ohne
Vorentscheidung würde M5a entweder das M6-Akzeptanzkriterium reißen oder
M5a und M6 müssten zu einem schwer abgrenzbaren Block verschmelzen.

**Entscheidungen:**

1. **Scope-Schnitt M5a ↔ M6 (Option A):** M5a liefert eine eigenständige,
   minimale Komponente `LocationPickerMap`: ein einzelner verschiebbarer
   Marker auf einer MapLibre-Karte, kein Clustering, kein Filter, kein
   URL-Sync, kein Popup. Tap setzt `lat`/`lon` im Form-State. M6 baut
   später die vollständige `MapView` (Marker-Liste, Clustering, Filter,
   URL-State, Popup-Navigation) als eigene Komponente — `LocationPickerMap`
   wird in M6 entweder als Basis ausgebaut oder bleibt eigenständig
   bestehen, je nach Refactor-Aufwand. Verworfen wurden Option B
   (M6 vorziehen / mit M5a verschmelzen — macht M5a unabnehmbar) und
   Option C (Karten-Tap streichen, nur Lat/Lon-Felder + Plus Code —
   verletzt Akzeptanzkriterium und ADR-011-UX).

2. **Tile-Proxy in M5a (Option A-Folge):** Da `LocationPickerMap`
   MapLibre-Tiles braucht, wird der in `architecture.md` §API
   skizzierte Tile-Proxy `GET /api/tiles/{z}/{x}/{y}` aus dem M6-Scope
   nach M5a vorgezogen. MapTiler-API-Key bleibt serverseitig in
   `MAPTILER_API_KEY`-ENV. Implementierung: dünner FastAPI-Router
   `app/routes/tiles.py`, der die Tile-URL bei MapTiler abruft und den
   Body mit `Cache-Control: public, max-age=86400` durchreicht; bei
   Upstream-Fehler 502 ohne Detail-Leak. Auth: eingeloggt erforderlich
   (Session-Cookie); RLS-Setup nicht nötig, weil Tiles
   nutzer-unabhängig sind.

3. **MapLibre-Setup im Frontend:** `react-map-gl` + `maplibre-gl`
   werden als Runtime-Dependencies aufgenommen (beide MIT, lizenz-
   konform). `LocationPickerMap` lädt Tiles über
   `process.env.NEXT_PUBLIC_TILE_URL` mit Default
   `'/api/tiles/{z}/{x}/{y}'` (Same-Origin, Cookies werden mitgesendet).
   Map-Style: das in MapTiler kostenlos verfügbare „basic-v2" oder
   Vergleichbares; finale Style-Wahl erfolgt während der Implementierung,
   ohne ADR.

4. **Geocoding bewusst nicht in M5a:** MapTiler-Geocoding-Proxy
   (`GET /api/geocode?q=...`) bleibt im M6-Scope. Im Live-Modus reicht
   GPS + manueller Tap; Adress-Suche ist sekundär.

5. **M6-Restscope:** M6 deckt weiterhin Marker-Liste aller sichtbaren
   Events, Clustering, Zeitraum- und Personen-Filter, URL-State des
   Viewports, Popup mit Detail-Link sowie den Geocoding-Proxy ab. Die
   Tile-Auslieferung ist mit M5a bereits erledigt.

**Konsequenzen:**

- M5a wird um `LocationPickerMap` (Frontend) und Tile-Proxy (Backend)
  erweitert. Aufwand überschaubar (~1 Komponente + 1 Route +
  Tile-Caching).
- M6 wird kleiner, weil Tile-Auslieferung schon vorhanden ist. M6
  konzentriert sich auf Listen-/Filter-/Popup-UX.
- Frontend bekommt zwei neue Runtime-Dependencies (`react-map-gl`,
  `maplibre-gl`). Beide sind in `project-context.md` §3 als „empfohlen"
  geführt — keine Freigabe nötig.
- Backend bekommt eine neue ENV-Variable `MAPTILER_API_KEY`.
  `.env.example` und README werden in M5a entsprechend ergänzt.
- Falls M6 später entscheidet, `LocationPickerMap` zur Basis der
  `MapView` umzubauen, ist das ein Refactor innerhalb des
  Frontend-Map-Moduls und freigabefrei.

**Verworfene Alternativen:**

- B (M6 vorziehen / verschmelzen): macht M5a unabnehmbar groß, schwer
  testbar, schwerer Review.
- C (kein Karten-Tap, nur Lat/Lon-Felder): verletzt M5a-Akzeptanz-
  kriterium und ADR-11-UX (Live-Modus muss in <30s vom Tap zur ersten
  gespeicherten Application kommen — manuelle Lat/Lon-Eingabe ist auf
  Mobile zu langsam).

---

## ADR-023 — App-PIN-Hashing clientseitig via PBKDF2 (Web Crypto API)

**Status:** Akzeptiert (2026-04-26)

**Kontext:** ADR-015 verlangt eine clientseitige App-PIN-Sperre als
Schutz gegen Schulterblick und kurze fremde Geräteübernahme. PIN ist
4–6 Ziffern, wird gehasht in IndexedDB abgelegt, Inaktivitäts-Sperre
nach 60 s, Zwangs-Logout nach 5 Fehlversuchen.
`project-context.md` §6 lässt „PBKDF2 oder Argon2-WASM" zu. Eine
Festlegung war offen.

**Schutzziel** laut `architecture.md` §App-PIN-Sperre: UI-Sperre gegen
Schulterblick und kurze fremde Übernahme eines **entsperrten** Geräts.
**Nicht** im Schutzziel: forensischer Zugriff auf das entsperrte Gerät
oder die IndexedDB. Letzteres ist Job von Geräte-Sperre und Auth-System
(Cookie wird beim Zwangs-Logout invalidiert).

**Entscheidungen:**

1. **Algorithmus:** PBKDF2-SHA-256 via Web Crypto API
   (`crypto.subtle.deriveBits`). Browser-nativ, keine externe
   Dependency, kein WASM-Bundle.

2. **Parameter:**
   - **Iterationen:** 600.000 (OWASP-Empfehlung 2024 für PBKDF2-SHA-256).
   - **Salt:** 16 Byte zufällig per `crypto.getRandomValues`, einmalig
     pro User beim Setzen der PIN, in IndexedDB neben dem Hash gespeichert.
   - **Output-Länge:** 32 Byte (256 Bit).
   - **Encoding:** Base64 für Storage.

3. **Storage-Layout in IndexedDB** (`hcmap-pin`-Object-Store, Key
   `pin_v1`):
   ```json
   {
     "version": 1,
     "algorithm": "PBKDF2-SHA256",
     "iterations": 600000,
     "salt_b64": "...",
     "hash_b64": "...",
     "fail_count": 0,
     "set_at": "ISO-8601"
   }
   ```
   `version` und `algorithm` sind explizit, damit ein späterer Wechsel
   auf Argon2id ohne Datenverlust möglich ist (alter Hash bleibt
   verifizierbar, neuer wird beim nächsten erfolgreichen Entsperren mit
   neuer Algorithmus-Variante geschrieben).

4. **Vergleich:** Konstantzeit-Vergleich der Base64-Strings, um
   Timing-Side-Channels zu vermeiden — auch wenn das Risiko in einer
   reinen Browser-Umgebung niedrig ist.

5. **Fehlversuch-Zähler:** `fail_count` wird **vor** dem Hash-Vergleich
   inkrementiert und persistiert; bei Erfolg auf 0 zurückgesetzt. Bei
   `fail_count >= 5` wird die App den Server-Logout-Endpoint
   (`POST /api/auth/logout`) aufrufen und IndexedDB
   (Pin-Store + RxDB-Daten in M5b) leeren.

6. **Inaktivitäts-Timer:** Default 60 s, aus User-Profil konfigurierbar
   (in M5a-Profil-UI). Timer-Reset bei `pointerdown`, `keydown`,
   `visibilitychange`. Bei Timer-Ablauf wird ein Vollbild-Overlay
   angezeigt; Navigation und Mutations werden blockiert. Implementierung
   in einer eigenen Component `LockOverlay` plus Hook `usePinLock`.

7. **Web-Worker nicht erforderlich:** PBKDF2 mit 600.000 Iterationen
   dauert auf modernem Mobile ~300–500 ms. Das Vollbild-Overlay zeigt
   während dieser Zeit einen Spinner. Ein Web-Worker wäre nur sinnvoll,
   wenn die Hauptseite während des Hashings interaktiv bleiben müsste —
   sie ist es per Design nicht.

8. **Späterer Algorithmus-Wechsel:** Falls das Schutzziel später um
   „verlorenes Gerät" erweitert wird, kann ein Folge-ADR Argon2id-WASM
   einführen. Das `version`/`algorithm`-Feld erlaubt sanfte Migration
   ohne erzwungenes PIN-Zurücksetzen.

**Konsequenzen:**

- Keine neuen externen Abhängigkeiten — `crypto.subtle` ist im
  Browser-Standard. Kein Bundle-Overhead.
- Konsistenz Backend/Frontend ist **algorithmisch unterschiedlich**
  (Backend nutzt Argon2id für Login-Passwörter via pwdlib, ADR-019).
  Das ist akzeptiert: unterschiedliche Schutzziele, unterschiedliche
  Anforderungen. Login-Passwörter sind im worst case auch offline
  angreifbar (Datenbank-Dump), eine PIN nicht (Server-Logout nach 5
  Versuchen).
- Brute-Force-Resistenz für eine 4-stellige PIN bei Datenbank-Dump-
  Szenario ist gering (10⁴ Versuche × 300 ms = ~50 min auf einer GPU
  noch deutlich kürzer). Das ist explizit kein Schutzziel und durch
  den Server-Logout-Mechanismus für Online-Brute-Force gedeckt.
- IndexedDB-Schema bekommt einen neuen Object-Store `hcmap-pin`. Wird
  beim ersten PIN-Setzen erstellt. Migration in M5b nicht nötig
  (RxDB-Object-Stores sind unabhängig).

**Verworfene Alternativen:**

- **Argon2id-WASM** (`hash-wasm` oder `argon2-browser`): überdimensioniert
  für das dokumentierte Schutzziel; 50–200 KB WASM-Bundle, neue
  Abhängigkeit (freigabepflichtig nach CLAUDE.md §4). Sinnvoll, wenn
  Schutzziel um „verlorenes Gerät, IndexedDB lesbar" erweitert wird —
  dann separater ADR.
- **Bcrypt-JS:** weder speicherhart noch durch Web-Crypto unterstützt;
  zusätzliche JS-Dependency ohne Vorteil.
- **Klartext-PIN in IndexedDB:** trivial, aber bricht das minimale
  Sicherheitsversprechen einer PIN-Sperre vollständig.
- **PIN-Verifikation auf Server:** würde funktionieren, aber bricht
  die Offline-Tauglichkeit (RxDB im Funkloch, ADR-017) und macht aus
  der UI-Sperre einen vollwertigen zweiten Auth-Faktor — größere
  Architekturwirkung als gewünscht.

---

## ADR-024 — Implementierungsstrategie M5a.1 (Live-Endpoints + Tile-Proxy)

**Status:** Akzeptiert (2026-04-26)

**Kontext:** M3 lieferte das generische Domain-CRUD; die fünf Live-Modus-
Endpunkte (`POST /api/events/start`, `POST /api/events/{id}/end`,
`POST /api/events/{event_id}/applications/start`,
`POST /api/applications/{id}/end`, `POST /api/persons/quick`) wurden
laut ADR-020 §A1 bewusst in M5a verschoben. Mit ADR-022 kommt zusätzlich
der Tile-Proxy `GET /api/tiles/{z}/{x}/{y}` in den M5a-Scope. M5a.1 setzt
dieses Backend-Paket um.

**Entscheidungen:**

1. **Endpoint-Inventar (A):** Sechs Routen, alle unter `/api/`:
   - `POST /api/events/start` (Live-Event-Anlage, ADR-011)
   - `POST /api/events/{id}/end` (Live-Event-Beendigung, idempotent)
   - `POST /api/events/{event_id}/applications/start` (Live-Application-
     Anlage, ADR-011 + ADR-012)
   - `POST /api/applications/{id}/end` (Live-Application-Beendigung,
     idempotent)
   - `POST /api/persons/quick` (On-the-fly-Person, ADR-014)
   - `GET /api/tiles/{z}/{x}/{y}` (MapTiler-Proxy, ADR-022)

2. **Idempotenz der End-Endpoints (B):** `end_event` und
   `end_application` setzen `ended_at = now()` nur, wenn das Feld noch
   `NULL` ist. Ein zweiter Aufruf liefert denselben Datensatz mit
   demselben `ended_at` zurück. Damit überlebt der Live-Modus
   doppelte Klicks, Reconnect-Retries und RxDB-Replay (ab M5b) ohne
   Sonderbehandlung. Verworfen wurde 409-Conflict bei zweitem End-Call:
   bricht idempotente HTTP-Semantik und zwingt Frontend zu Status-
   Tracking, das es nicht braucht.

3. **Auto-Participant-Wiederverwendung (C):** `start_event` ruft den in
   M3 etablierten `add_participant` auf, um den Creator und (falls
   gesetzt) den Recipient als `EventParticipant` zu hinterlegen.
   `start_application` nutzt den vorhandenen `_ensure_participant` aus
   `services/applications.py`. Keine neue DB-Logik, kein neuer Trigger.
   Verworfen wurde eine Trigger-basierte Variante (zu schwer testbar,
   Regel-003 hängt an der Service-Schicht).

4. **Default-Performer/Recipient für Live-Applications (D):**
   - `performer_id` fehlt → `requester_person_id` (Regel-002).
   - `recipient_id` fehlt → `requester_person_id` (Self-Bondage als
     Default; UI ist verantwortlich, den gewählten Recipient explizit
     zu schicken).
   Diese Defaults gelten **nur** für `applications/start`, nicht für
   `applications` (M3-Pfad), weil dort beide Felder Pflicht sind.
   Bewusst keine Pflicht-Validierung von `recipient_id ≠ performer_id`
   im Live-Pfad — entspricht ADR-020 §I (Self-Bondage erlaubt).

5. **Recipient-Vermerk auf Event (E):** `EventStart` akzeptiert ein
   optionales `recipient_id`-Feld. Wird es übergeben, fügt `start_event`
   die Person als Participant hinzu. **Das Event-Schema bleibt
   unverändert** — kein neues `recipient_id`-Feld auf `event`. Die UI
   merkt sich den ausgewählten Recipient im Client-State und füllt ihn
   in `applications/start` ein. Verworfen wurde eine `event.recipient_id`-
   Spalte (Schema-Migration für ein UI-Convenience-Feld; widerspricht
   ADR-020 §A1, weil das Datenmodell rein per-Application ist).

6. **Tile-Proxy-Mechanik (F, ADR-022):**
   - Auth: `current_active_user`-Dependency. RLS-Session nicht nötig
     (Tiles sind nutzer-unabhängig).
   - Pfad-Parameter werden auf gültige Tile-Koordinaten validiert:
     `z` ∈ [0, 22], `x`/`y` ≥ 0.
   - Upstream-URL aus `MAPTILER_STYLE` und `MAPTILER_API_KEY`
     aufgebaut: `https://api.maptiler.com/maps/{style}/{z}/{x}/{y}.png?key={key}`.
   - HTTP-Client: `httpx.AsyncClient` als Prozess-Singleton via
     `lru_cache(maxsize=1)`, Timeout 10 s (Connect 5 s).
   - Antwort: `StreamingResponse` mit upstream-Content-Type und
     `Cache-Control: public, max-age=86400` (24 h).
   - Fehler-Mapping: Netzwerk-Exception → 502; Upstream-Status ≥ 400 →
     502 (kein Detail-Leak des Upstream-Statuses); leerer API-Key → 503.

7. **httpx als Runtime-Dependency (G):** `httpx` war bislang nur Dev-
   Abhängigkeit (Tests). Für den Tile-Proxy zur Laufzeit wird es in
   `[project.dependencies]` aufgenommen. Lizenz BSD-3-Clause, kompatibel
   mit der Allow-List in `project-context.md` §6 — keine separate
   Lizenz-Freigabe nötig.

8. **CSRF und Whitelist (H):** Alle fünf Live-Endpunkte sind
   state-changing (POST) und werden vom CSRF-Middleware-Schutz
   abgedeckt. Der Tile-Proxy ist ein GET und durchläuft die
   `_SAFE_METHODS`-Ausnahme automatisch. Kein Whitelist-Eintrag nötig.

9. **Tests (I):** 21 neue HTTP-Tests gegen Postgres 16 + PostGIS 3.4:
   - `test_events_live_api.py` (5): start setzt `started_at` ±2 s,
     start mit Recipient fügt beide als Participant hinzu, end setzt
     `ended_at`, end ist idempotent, end auf unbekannte ID → 404.
   - `test_applications_live_api.py` (6): start setzt `started_at` und
     `sequence_no=1`, Default-Self-Bondage ohne Recipient, sequence_no
     inkrementiert, end setzt `ended_at`, end idempotent,
     Auto-Participant funktioniert.
   - `test_persons_quick_api.py` (4): admin und editor erlaubt, viewer
     blockiert (403), `linkable=true` im Body wird ignoriert.
   - `test_tiles_proxy.py` (6): anonym blockiert (401), kein Key → 503,
     Erfolgsfall mit Cache-Header und Upstream-URL-Verifikation,
     Netzwerk-Fehler → 502, Upstream-4xx → 502, Zoom out of range
     → 422.
   Backend-Suite: 53 → 74 Tests, alles grün. ruff und ruff format clean.

10. **Scope-Abgrenzung gegen M5a.2/.3/.4 (J):**
    - **M5a.1 (dieser ADR):** Backend-Live-Endpoints + Tile-Proxy +
      Tests + ENV.
    - **M5a.2:** Frontend Startseite, Suche, Export-UI — konsumiert
      ausschließlich M3-Endpoints, keine Backend-Änderungen.
    - **M5a.3:** Frontend Live-Modus + LocationPickerMap — konsumiert
      die hier gebauten Endpoints + den Tile-Proxy.
    - **M5a.4:** App-PIN-Sperre nach ADR-023, querliegend zu allen
      Frontend-Routen, kein Backend-Anteil.
    Trennung minimiert PR-Größe und macht Reviews abnehmbar.

**Konsequenzen:**

- Live-Modus-Endpoints sind ab M5a.1 produktiv. Frontend kann ohne
  weitere Backend-Arbeit anbinden.
- Tile-Proxy ist betriebsbereit, **aber inaktiv ohne Key** — leerer
  `HCMAP_MAPTILER_API_KEY` liefert 503. Das ist gewollt: Vor M11 muss
  im Deployment der Key konfiguriert werden, sonst zeigt das Frontend
  „Karte nicht verfügbar".
- mypy meldet weiterhin den vorbestehenden M2-Fehler in
  `app/auth/routes.py:20` (TypeVar `models.UP` vs. eigenes User). Der
  Fehler ist nicht durch M5a.1 verursacht und liegt im M2-Modul; eine
  Korrektur wäre Scope-Erweiterung in fremde Modulgrenze (CLAUDE.md
  §6 + §8). Wird separat aufzulösen sein, sobald jemand am Auth-Modul
  arbeitet.

**Verworfene Alternativen:**

- B2 (409-Conflict bei doppeltem End-Call): bricht HTTP-Idempotenz.
- C2 (DB-Trigger für Auto-Participant): widerspricht ADR-020 §E2.
- E2 (`event.recipient_id`-Spalte): Schema-Migration für UI-Komfort
  ohne Datenmodell-Bedarf.
- F2 (Tile-Proxy ohne lru_cache): jede Anfrage mit neuem
  `httpx.AsyncClient`-Instance — Verbindungs-Pool-Verlust.
- G2 (httpx in dev-Group lassen + Production-Imports): bricht Runtime
  in der Produktion.

---

## ADR-025 — User-Modell erbt von SQLAlchemyBaseUserTableUUID (typing-fix)

**Status:** Akzeptiert (2026-04-26)

**Kontext:** `app/auth/routes.py:20` deklariert
`fastapi_users = FastAPIUsers[User, uuid.UUID](...)`. Der TypeVar `UP`
in `FastAPIUsers[UP, ID]` ist an einen Protokoll-Vertrag gebunden, den
unser User-Modell aus M2 nicht statisch erfüllt — User erbte direkt von
`Base, TimestampMixin, SoftDeleteMixin` und deklarierte alle benötigten
Spalten (`id`, `email`, `hashed_password`, `is_active`, `is_superuser`,
`is_verified`) als `Mapped[...]`. Zur Laufzeit funktioniert das via
Duck-Typing; mypy aber sieht nur die `Mapped[...]`-Descriptor-Typen, nicht
die Plain-Types, die das Protokoll erwartet. Resultat: persistenter
mypy-Fehler `Value of type variable "models.UP" of "FastAPIUsers" cannot
be "User"` plus fünf `# type: ignore[type-var]`-Workarounds in
`app/auth/manager.py`. Die DoD aus `project-context.md` §7 verlangt
`mypy --strict` clean — dieser Befund war die einzige Abweichung.

**Entscheidungen:**

1. **Vererbung erweitern (A):** `User` erbt jetzt von
   `SQLAlchemyBaseUserTableUUID, Base, TimestampMixin, SoftDeleteMixin`.
   `SQLAlchemyBaseUserTableUUID` deklariert die fastapi-users-Pflicht-
   Spalten unter `if TYPE_CHECKING` als Plain-Types (`id: UUID_ID`,
   `email: str`, `hashed_password: str`, `is_active: bool`,
   `is_superuser: bool`, `is_verified: bool`) und unter `else` als
   `Mapped[...]`-Spalten — genau das Muster, das mypy als Protokoll-
   Erfüllung sieht.

2. **Spalten-Overrides per `if not TYPE_CHECKING` (B):** Die geerbten
   Spaltendefinitionen passen nicht 1:1 zu unserem Schema:
   - Parent setzt `id` mit `default=uuid.uuid4`. Wir brauchen UUIDv7
     (ADR-018) → `id: Mapped[uuid.UUID] = pk_column()`.
   - Parent setzt `email` mit `unique=True, index=True` direkt am
     Column. Wir haben einen benannten `UniqueConstraint` in
     `__table_args__` → ohne Override gäbe es einen zusätzlichen
     impliziten Index plus einen anonymen Unique-Constraint.
   - Parent setzt `is_active`/`is_superuser`/`is_verified` ohne
     `server_default`. Unser Schema nutzt `server_default="true"`
     bzw. `"false"` → ohne Override würde der Server-Default
     verschwinden.
   Die Overrides werden in einem `if not TYPE_CHECKING:`-Block
   deklariert. Damit sind sie zur Laufzeit für SQLAlchemy aktiv, aber
   für mypy unsichtbar — die Plain-Type-Sicht der Eltern bleibt
   erhalten und das Protokoll wird erfüllt.

3. **type-ignore-Cleanup (C):** Die fünf `# type: ignore[type-var]`-
   Kommentare in `app/auth/manager.py` (UserManager-Bases, get_user_db,
   get_user_manager-Signaturen) sind nicht mehr nötig und werden
   entfernt. mypy meldet sie als `unused-ignore`, sobald der Hauptfehler
   verschwindet.

4. **Schema-Drift-Verifikation (D):** Mit den Overrides bleibt das
   Datenbank-Schema **bit-für-bit identisch**. Verifiziert über:
   `alembic upgrade head` gegen frische Postgres-DB → `\d "user"` in
   psql → CREATE TABLE-Output aus der SQLAlchemy-Metadata. Beide
   stimmen in Spalten (Typ, Nullable, Default), Indizes (`pk_user`,
   `ix_user_role`, `uq_user_email`, `uq_user_person_id`),
   Foreign-Keys und Triggern überein. Keine Migration erforderlich.

5. **Test-Verifikation (E):** Komplette Backend-Suite 74/74 grün
   gegen Postgres 16 + PostGIS 3.4 (M0–M5a.1). RLS-Tests, Auth-Tests,
   und alle Domain-CRUD-Pfade passieren ohne Anpassungen.

**Konsequenzen:**

- `mypy --strict` ist clean (50 Source-Files, 0 Errors).
- DoD aus `project-context.md` §7 wieder vollständig erfüllt.
- Keine `# type: ignore`-Schulden mehr im Auth-Modul.
- Pattern „Override-Spalten in `if not TYPE_CHECKING`" ist
  dokumentiert und kann als Vorlage dienen, falls weitere
  fastapi-users-Erweiterungen (z. B. ein Pfad-B-Audit-Log-Modell)
  ähnliche Override-Bedürfnisse haben.

**Verworfene Alternativen:**

- B (`# type: ignore[type-var]` an Zeile 20 belassen): hätte den
  Designmismatch versteckt und den vorhandenen Workaround-Cluster in
  `app/auth/manager.py` zementiert.
- C (mypy-per-file-Override für `app/auth/routes.py`): Loch in der
  `mypy --strict`-Garantie, gilt für jede zukünftige Änderung an der
  Datei.
- A ohne Spalten-Overrides: hätte einen impliziten zusätzlichen Index
  auf `email`, einen anonymen Unique-Constraint, fehlende
  `server_default`-Werte auf den Boolean-Flags, und UUIDv4 statt
  UUIDv7 für neue User (Bruch von ADR-018) bedeutet —
  Schema-Migration plus ADR-Konflikt.

---

## ADR-026 — Implementierungsstrategie M5a.2 (Frontend Startseite, Suche, Export)

**Status:** Akzeptiert (2026-04-26)

**Kontext:** ADR-024 §J schneidet M5a.2 als reinen Frontend-Konsum
bestehender M3-Endpoints zu: Volltextsuche (`GET /api/search`),
„On this day" (`GET /api/throwbacks/today`), JSON- und CSV-Export
(`/api/export/me`, `/api/export/me/events.csv`,
`/api/export/me/applications.csv`, `/api/admin/export/all`).
Die Sub-Schritte M5a.3 (Live-Modus + LocationPickerMap) und M5a.4
(App-PIN) bleiben bewusst außen vor. M5a.2 fällt vollständig in den
Autonomiebereich (CLAUDE.md §5) — keine neuen Module, keine
Backend-Änderungen, keine neuen Abhängigkeiten.

**Entscheidungen:**

1. **Globale Suchleiste (A):** `components/layout/search-box.tsx` als
   Client-Component (`"use client"`) mit `<form role="search">` und
   `Input type="search" name="q"`. Submit per `useRouter().push` zu
   `/search?q=<encodeURIComponent(value)>`. Defaultwert wird aus
   `useSearchParams().get("q")` gelesen und über `useEffect` an URL-
   Änderungen synchronisiert. Leerer/whitespace-Submit ist No-Op.
   Form hat zusätzlich `action="/search" method="get"` als
   Progressive-Enhancement-Fallback (funktioniert ohne JS).
   - **Platzierung Desktop:** in der Sidebar oberhalb der Nav-Items
     (`Sidebar`-Component).
   - **Platzierung Mobile:** als zweite Zeile im Sticky-Header der
     `AppShell`. Erste Zeile bleibt `Hamburger | Brand | UserMenu`,
     zweite Zeile volle Breite mit `<SearchBox />`.
   Verworfen wurde eine reine Modal-Suche (zusätzlicher Tap, schwerer
   auffindbar) und eine Submit-only-Variante per `<form action>` ohne
   Router (verliert Vorbelegung des Felds beim Pre-Fill, weil bei
   reload das Default-Value hart in den DOM gehen würde).

2. **Search-Page (B):** Neue Route
   `app/(protected)/search/page.tsx` als Server-Component. `searchParams`
   wird gemäß Next 15 als `Promise<{q?: string}>` ge-awaited.
   Empty-Query → Hinweiskarte „Suchbegriff eingeben". Sonst wird
   `/api/search?q=<q>&limit=50` mit Cookie-Forwarding (analog zur
   Dashboard-Page) ge-fetcht; Fehler werden als Karte „Suche
   fehlgeschlagen" gerendert (ohne Backend-Statuscode-Leak), Erfolg
   als Treffer-Liste. Die Hilfs-Function `loadSearch` ist file-lokal
   (kein neues Service-Modul, weil bisher nur diese eine Stelle so
   ein Pattern braucht).

3. **Snippet-Highlighting sicher (C):** Backend liefert via
   `ts_headline('german', …)` HTML-Schnipsel mit `<b>…</b>` um die
   Treffer. Das Frontend rendert `dangerouslySetInnerHTML` **nicht**.
   Stattdessen tokenisiert `renderSnippet` per Regex
   `/<b>(.*?)<\/b>/gi` in plain Strings und `<mark>`-Elemente; der
   Rest wird als React-Children-Strings gerendert (React escaped
   automatisch). Damit wird ein in Notes eingebettetes
   `<script>...</script>` als sichtbarer Plain-Text dargestellt, nicht
   ausgeführt. Test deckt diesen Edge-Case ab. Verworfen wurde eine
   Backend-Änderung (Snippet ohne HTML, mit Match-Positionen) — das
   wäre eine API-Vertragsänderung außerhalb M5a.2-Scope.

4. **Treffer-Link-Ziel (D):** Jeder Hit verlinkt auf
   `/events/{event_id}` — auch Hits vom Typ `application`, weil die
   Detailseite eines Events ohnehin alle zugehörigen Applications
   chronologisch zeigt (M5c). Die `/events/[id]`-Detail-Route ist
   in M5a.2 noch ein Stub; die Links werden in M5c lebendig und
   bleiben bis dahin als toter Link. Akzeptiert, weil ohne sinnvolles
   Link-Ziel die Suche nicht navigierbar wäre.

5. **Export-UI per `<a download>` (E):** `ExportButtons`-Component
   rendert vier Download-Links: drei für jede Rolle (`/api/export/me`,
   `/api/export/me/events.csv`, `/api/export/me/applications.csv`),
   plus `/api/admin/export/all` nur für `role === "admin"`. Jeder
   Link nutzt das native `<a href download="…">`-Pattern, gestylt
   über `buttonVariants(...)`. Same-Origin-Auth-Cookie wird vom
   Browser automatisch mitgeschickt; CSRF entfällt (GET-Requests).
   `download`-Attribut sorgt dafür, dass der Browser auch
   ohne `Content-Disposition`-Header (JSON-Endpoints) speichert
   statt inline zu rendern. Verworfen wurde fetch-Blob-Object-URL —
   bringt nur Loading-Spinner, der bei <5000 Events kaum sichtbar
   wäre; Komplexität ohne Mehrwert.

6. **Dashboard-Polish (F):** Drei kleinere Korrekturen am bestehenden
   Stub aus M4:
   - **Throwback-Bug fixen:** Backend liefert `ThrowbackEvent.id`
     (siehe `backend/app/schemas/search.py:21`); das Dashboard
     rendert seither `tb.event_id`, was undefined ist. Schema im
     Frontend an Backend angepasst, plus `note`-Feld ergänzt.
   - **Dashboard-Treffer verlinken:** Letzte-Events-Liste und
     Throwback-Liste linken auf `/events/{id}` (siehe D).
   - **CTA-Text klarer:** „Neues Event starten" disabled-Button
     trägt jetzt die Begründung „Live-Modus folgt mit M5a.3" statt
     vagem „M5a folgt".
   Diese Punkte sind Bestandteil von „Startseite mit großem
   ‚Neues Event starten'-Knopf, Liste der letzten Events und
   ‚On this day'-Sektion" aus dem M5a-Deliverable und keine
   Scope-Erweiterung.

7. **Tests (G):** 11 neue Vitest-Tests in `frontend/tests/`:
   - `search-box.test.tsx` (3): Submit navigiert mit URL-encoded
     Query, leerer/whitespace-Submit ist No-Op, Pre-Fill aus
     `?q=`-Param.
   - `search-results.test.tsx` (5): Empty-State, Treffer-Links zeigen
     auf `/events/{event_id}`, `<b>`-Tokens werden zu `<mark>`,
     `<script>` wird **nicht** ausgeführt sondern als Plain-Text
     dargestellt, leerer Snippet-String → leeres Array.
   - `export-buttons.test.tsx` (3): Drei Standard-Links mit
     `download`-Attribut für editor/viewer, Admin-Link nur für
     admin, kein Admin-Link für viewer.
   Frontend-Suite: 16 → 27 Tests, alles grün. `tsc --noEmit`,
   `next lint`, `prettier --check` clean. `next build` erstellt
   `/search` als ƒ (Server-rendered on demand).

8. **Browser-Smoke (H):** Lokales Stack (DB + Backend +
   Next-Dev-Server) bestätigt:
   - Login → Dashboard mit Mobile-Header + zweizeiliger Suchleiste.
   - `/search?q=clejuso` rendert „Keine Treffer für ‚clejuso'"
     gegen leere DB; Suchfeld ist mit dem Query vorbelegt.
   - `/profile` zeigt vier Export-Buttons (admin); per
     `fetch('/api/export/me')` aus Browser-Console → 200 mit den
     ADR-020 §J-Top-Level-Keys (`version`, `events`, `applications`,
     `event_participants`, `application_restraints`,
     `restraint_types`); CSV-Endpoint mit
     `Content-Disposition: attachment; filename=events.csv`;
     `/api/admin/export/all` mit 200.
   - Keine Console-Errors in der Session.

9. **Scope-Abgrenzung gegen M5a.3/.4 (I):**
   - **M5a.2 (dieser ADR):** Frontend-Startseite-Polish, globale
     Suche, Export-UI, plus Stub-Detailseite-Link-Ziele.
   - **M5a.3:** Live-Modus mit Wakelock, GPS, Timer, on-the-fly-
     Personenanlage, `LocationPickerMap`. Wird den disabled-CTA
     auf der Startseite aktivieren.
   - **M5a.4:** App-PIN-Sperre nach ADR-023, querliegend zu allen
     Frontend-Routen.
   Die Trennung minimiert PR-Größe und macht Reviews abnehmbar.

**Konsequenzen:**

- Frontend hat ab M5a.2 eine globale, RLS-konforme Suche und einen
  Export-Pfad für jeden User. Datensouveränitäts-Anforderung aus
  ADR-015 ist Frontend-seitig erfüllt.
- `/events/{id}`-Stub-Route wird in M5c lebendig — bis dahin
  produzieren Suche und Dashboard-Listen tote Links. Bewusst
  akzeptiert (siehe D).
- Snippet-Tokenisierung ist getestet gegen `<script>`-Injection.
  Falls Postgres in einer späteren Version andere Marker verwendet,
  brechen die Tests deterministisch — kein Stille.
- Keine neuen Abhängigkeiten, keine Backend-Änderungen, keine
  Migrations.

**Verworfene Alternativen:**

- A2 (Modal-Suche statt Inline-Searchbox): zusätzlicher Tap,
  schlechter auffindbar, kollidiert mit Mobile-First-Prinzip.
- B2 (Client-Side-fetch in Search-Page): kein SSR-Ergebnis,
  Suchparameter müssten zusätzlich im Browser-Hook geladen werden,
  Auth-Cookie-Forwarding nicht nötig — alles ohne Vorteil.
- C2 (`dangerouslySetInnerHTML` mit DOMPurify): zusätzlicher
  Library-Zugriff (freigabepflichtig); Tokenisierung reicht.
- E2 (fetch-Blob-Download mit Spinner): Komplexität ohne UX-Vorteil
  bei <5000-Events-Datenmenge.
- F2 (Throwback-Bug erst in M5c fixen): das Dashboard ist Bestandteil
  von M5a-Deliverables — Bug innerhalb der eigenen Modulgrenze
  fixen statt verschieben.

---

## ADR-027 — Implementierungsstrategie M5a.3 (Frontend Live-Modus + LocationPickerMap)

**Status:** Akzeptiert (2026-04-26)

**Kontext:** ADR-024 §J definierte M5a.3 als „Frontend Live-Modus +
LocationPickerMap, konsumiert die in M5a.1 gebauten Endpoints + den
Tile-Proxy". Bei der Umsetzung zeigte sich, dass die in
`fahrplan.md` §M5a deliverable verlangte „Liste bisheriger
Applications mit eigenen Timern" einen Endpoint braucht, der weder
in M3 noch in M5a.1 vorhanden ist. M5a.3 setzt deshalb (a) den
vollen Frontend-Live-Modus und (b) eine **rein additive**
Backend-Erweiterung um, die diese Lücke schließt.

**Entscheidungen:**

1. **Karten-Setup (A):** `maplibre-gl@^4` und `react-map-gl@^7` als
   Runtime-Deps (beide MIT, in `project-context.md` §3 als „empfohlen"
   gelistet, freigabefrei). Tile-URL wird via
   `NEXT_PUBLIC_TILE_URL`-ENV gesteuert (Default
   `/api/tiles/{z}/{x}/{y}`). Default-Map-Center via
   `NEXT_PUBLIC_DEFAULT_MAP_CENTER` (Default Berlin
   `52.52,13.405`). MapLibre-CSS wird als `@import` in
   `globals.css` geladen — damit braucht keine Komponente einen
   eigenen CSS-Import. Karten-Style ist eine **Raster-Style** mit
   einer Source `hcmap-raster`, die unseren Tile-Proxy als
   Tile-Quelle nutzt — keine Vector-Style, kein Glyph-Loading. Für
   den Picker reicht das; M6/M12 können auf Vector umstellen.

2. **LocationPickerMap (B):** Einzelne `"use client"`-Komponente mit
   einem verschiebbaren Marker (`anchor="bottom"`, `draggable`),
   Tap-to-Adjust und `cursor="crosshair"`. Props sind
   `{lat: number | null, lon: number | null, onChange}` — controlled
   Pattern. Marker erscheint nur, wenn beide Werte gesetzt sind;
   solange null, zeigt die Karte den Default-Center und reagiert
   ausschließlich auf den ersten Tap. Koordinaten werden auf
   6 Nachkommastellen gerundet (Lat/Lon-Schema-Genauigkeit). Kein
   Clustering, kein URL-Sync, kein Popup — bewusst minimaler
   M5a-Scope (siehe ADR-022). Auf der `/events/new`-Seite wird die
   Komponente per `next/dynamic({ ssr: false })` geladen, weil
   maplibre-gl `window` direkt nutzt und Server-Render bricht.

3. **Hooks (C):**
   - **`useWakeLock(enabled)`:** kapselt
     `navigator.wakeLock.request('screen')`, behandelt Re-Acquire
     bei `visibilitychange`, gibt Sentinel beim Unmount frei. Status:
     `idle | requesting | active | released | unsupported | error`.
     Liefert eine deutsche Hinweismeldung in `message`, wenn die
     API fehlt oder die Anfrage scheitert (Headless/Permission).
   - **`useGeolocation({auto, enableHighAccuracy, timeoutMs})`:**
     `navigator.geolocation.getCurrentPosition` mit Klassifizierung
     `success | denied | unavailable | unsupported`. Bei `auto`
     wird einmal beim Mount angefragt; `request()` macht Retry
     möglich.
   - **`useNow(intervalMs=1000)`:** schlanker Sekunden-Tick für
     Live-Timer.
   Beide Hooks sind in `frontend/src/hooks/` abgelegt — neuer
   Sammel-Ordner, der bislang nicht existierte.

4. **Backend-Lücke geschlossen (D):** Neuer Endpoint
   `GET /api/events/{event_id}/applications` (List, sortiert nach
   `sequence_no`). Implementierung in `app/routes/events.py`,
   Service-Methode `application_svc.list_applications_for_event`
   existierte bereits. RLS greift automatisch via Postgres-Policies.
   Drei neue HTTP-Tests in `test_applications_list_api.py`
   (Empty-Event, Sequenz-Order, 404). Backend-Suite 74 → 77 Tests
   grün. **Bewusste Scope-Erweiterung gegenüber ADR-024 §J** —
   API-Vertragsänderung, aber rein additiv und damit nach
   CLAUDE.md §4 freigabefrei. Verworfen wurde die Alternative,
   `EventDetail.applications` als Embedded-Liste zu liefern: das
   würde den Vertrag von `GET /api/events/{id}` ändern (zusätzliches
   Feld) und das Listing-Pagination-Modell für lange Anwendungs-
   ketten ungeschickt mit dem Detail-Endpoint koppeln.

5. **/events/new (E):** Server-Component-Wrapper, der
   `<EventCreateForm user={user} />` einbettet. `viewer`-Rolle
   wird mit `redirect("/?error=role")` abgewiesen (Editor und Admin
   dürfen Events anlegen). Die Form ist eine Client-Component mit:
   - GPS-Auto-Request beim Mount, Re-Try-Button.
   - LocationPickerMap (controlled `coords`-State).
   - RecipientPicker mit Suche + „+ Neue Person hinzufügen".
   - Notiz-Textarea.
   - Submit → `POST /api/events/start` → `router.push('/events/{id}')`.
   - Sticky-Bottom-Submit-Bar auf Mobile, normale Buttons auf
     Desktop.
   Auto-Participant-Hinweis (ADR-012) erscheint sobald ein
   Recipient gewählt wurde („Daniela wird automatisch als
   Beteiligte:r erfasst…").

6. **RecipientPicker + PersonQuickSheet (F, ADR-014):**
   `RecipientPicker` ist eine simple Combobox-Variante: Suchfeld,
   Liste (gefiltert nach `name`/`alias`, exklusive der eigenen
   `person_id`), `+ Neue Person hinzufügen`-Button am Ende.
   `PersonQuickSheet` ist ein Bottom-Sheet mit Pflichtfeld `name`
   und optional `alias`, sendet
   `POST /api/persons/quick`. Bei 403 wird eine deutsche Fehler-
   meldung gezeigt. Verworfen wurde eine vollwertige Combobox-
   Komponente (`@radix-ui/react-popover` + `cmdk`): zusätzliche
   Dependency, freigabepflichtig — die simple Variante reicht für
   <50 Personen.

7. **/events/[id] (G):** Server-Component mit Cookie-Forwarding
   lädt das Event-Detail. Bei 404 → `notFound()`, bei 401/Backend-
   Fehler → Hinweiskarte. Branching im Render:
   - `ended_at === null` → `<LiveEventView>` (Live-Modus mit Timer,
     Buttons, Application-Liste, Wakelock).
   - `ended_at !== null` → `<EndedEventView>` (Stub mit Notiz,
     Plus-Code, Hinweis „Detailansicht folgt mit M5c").

8. **LiveEventView (H):**
   - `useQuery` für Event-Detail (initialData = SSR-Snapshot,
     Refetch alle 30 s).
   - `useQuery` für Applications-Liste (Refetch alle 5 s, solange
     Event live).
   - `useNow(1000)` als Sekunden-Tick für lokale Timer.
   - Timer-Berechnung lokal (`now - Date.parse(started_at)`) mit
     `formatDuration`-Helper aus `lib/duration.ts` (`MM:SS` unter
     einer Stunde, `H:MM:SS` darüber).
   - Drei Action-Buttons:
     - „Neue Application" → öffnet `<ApplicationStartSheet>`.
     - „Aktuelle beenden" → `POST /api/applications/{id}/end`,
       wird disabled, wenn keine offene Application existiert.
     - „Event beenden" (`destructive`) → `POST /api/events/{id}/end`
       → `router.push('/')`.
   - `useWakeLock(isLive)` hält den Bildschirm an; Hinweis-Text bei
     Permission-Denied.
   - Auto-Recipient-Heuristik: Default-Recipient für die nächste
     Application wird aus dem `recipient_id` der letzten
     Application abgeleitet (häufigster Fall: gleiche Person über
     mehrere Applications). Der User kann jederzeit ändern.

9. **ApplicationStartSheet (I):** Bottom-Sheet mit
   `<RecipientPicker>` + Notiz-Textarea. Submit
   → `POST /api/events/{event_id}/applications/start`.
   Restraints/Positionen sind **bewusst nicht** im Modal — das
   spart einen großen Sekundärformular-Block, und das Backend
   erlaubt explizit `PATCH /api/applications/{id}` zum Nachpflegen
   (Fahrplan §M5a: „auch nachträglich pflegbar"). Nachpflege-UI
   kommt in M5c.

10. **Tests (J):** 10 neue Vitest-Tests:
    - `tests/duration.test.ts` (6): `formatDuration` für Sub-Hour-
      und Hour-Spans, Negativ-Clamp, Float-Rounding;
      `diffSeconds` für ISO-Strings, End-vor-Start-Clamp,
      Unparseable-Start.
    - `tests/use-wake-lock.test.tsx` (4): Sentinel-Acquire bei
      Enable, Unsupported-Path ohne API, Release-on-Unmount,
      Idle-while-Disabled.
    Frontend-Suite 27 → 37 Tests grün. **LocationPickerMap-Smoke-
    Test bewusst übersprungen** — maplibre-gl benötigt
    `HTMLCanvasElement.prototype.getContext('webgl')`, das jsdom
    nicht stabil simuliert. Der End-to-End-Browser-Smoke
    verifiziert die Komponente.

11. **Browser-Smoke (K):** Lokales Stack (Postgres + Backend +
    Next-Dev-Server) bestätigt:
    - Dashboard-CTA-Link führt nach `/events/new`.
    - `/events/new` rendert vollständig (Standort-Card mit
      Karte, Recipient-Card mit Picker, Notiz, Submit-Bar).
    - `POST /api/events/start` mit `{lat, lon, note}` → 201,
      Event-ID + `started_at` zurück.
    - `/events/{id}` rendert Live-View mit Timer „00:08",
      Plus-Code „9F4MGCC4+222", Wakelock-Hinweis-Pfad
      (Headless: „Wake Lock permission request denied").
    - `POST /events/{id}/applications/start` (sequence_no=1) +
      `POST /applications/{id}/end` + `POST /events/{id}/end`
      → 201/200/200.
    - Re-Visit `/events/{id}` rendert EndedEventView mit
      Notiz, M5c-Hinweis und Zurück-Link.
    - Wegen leerem `HCMAP_MAPTILER_API_KEY` liefert der
      Tile-Proxy 503 — die Karte rendert ohne Tiles, der
      Picker-Flow funktioniert weiter (User kann auf graue
      Fläche klicken). Erwartetes Verhalten laut ADR-022.

12. **Scope-Abgrenzung gegen M5a.4 (L):**
    - **M5a.3 (dieser ADR):** Frontend Live-Modus + Backend-
      List-Endpoint.
    - **M5a.4:** App-PIN-Sperre nach ADR-023, querliegend zu
      allen Frontend-Routen, kein Backend-Anteil.
    - **M5b:** RxDB-Offline-Resilienz für Live-Modus.
    - **M5c:** Detailseite `/events/{id}` mit chronologischer
      Application-Liste, Lücken-Anzeige, nachträgliche
      Bearbeitung. Stub-EndedEventView aus M5a.3 wird dort durch
      die volle Detailansicht ersetzt.

**Konsequenzen:**

- Live-Modus-Vertical-Slice ist produktiv: Anlegen → Live →
  Application-Erfassung → Beenden — alles ohne Verlassen der App.
- 50 → 51 Backend-Routen (`GET /api/events/{event_id}/applications`).
  Backend-Suite 74 → 77 Tests grün.
- 27 → 37 Frontend-Vitest-Tests grün.
- Zwei neue Frontend-Runtime-Dependencies (`maplibre-gl`,
  `react-map-gl`). Beide MIT, freigabefrei (ADR-022 + project-
  context.md §3).
- Zwei neue ENV-Variablen (`NEXT_PUBLIC_TILE_URL`,
  `NEXT_PUBLIC_DEFAULT_MAP_CENTER`).
- Wakelock-Permission im Headless verweigert — `useWakeLock`
  zeigt deshalb robust eine deutsche Hinweismeldung. Auf echten
  Mobile-Browsern wird der Lock akzeptiert.
- Ohne MapTiler-API-Key (`HCMAP_MAPTILER_API_KEY` leer) zeigt die
  Karte keine Tiles; der Picker-Flow funktioniert per
  Tap-to-Adjust trotzdem. Vor M11 muss der Key konfiguriert sein.

**Verworfene Alternativen:**

- D2 (`EventDetail.applications` als Embedded-Liste statt
  separatem Endpoint): koppelt Detail-Response an Anwendungs-
  Pagination, schlecht skalierbar.
- F2 (Combobox via `cmdk` + Popover): zusätzliche Dependencies,
  freigabepflichtig — der simple Filter-Picker reicht für
  <50 Personen.
- I2 (Restraints/Positions im Application-Start-Modal): macht
  das Modal groß, langsam und kollidiert mit dem 30-Sekunden-
  Akzeptanz­kriterium aus M5a. Nachpflege via PATCH ist
  ausdrücklich vorgesehen.
- J2 (LocationPickerMap-jsdom-Mock-Test): maplibre-gl-WebGL-
  Path ist in jsdom nicht stabil simulierbar; Browser-Smoke
  verifiziert die Komponente realistischer.

---

# Teil B — Entscheidungsregeln

<!-- Wiederkehrende Muster, die aus ADRs hervorgehen.
     Jede Regel verweist auf den ADR, aus dem sie entstanden ist. Damit kann
     Claude in ähnlichen Situationen konsistent und ohne Rückfrage handeln.

     Format pro Regel:
     ### Regel-NNN: [Kurztitel]
     - **Herkunft:** ADR-[Nr.]
     - **Gilt für:** [wann anzuwenden]
     - **Regel:** [was ist zu tun]
     - **Ausnahmen:** [wann gilt sie nicht; leer wenn keine]
     - **Gegenbeispiel:** [was wäre falsch]
-->

## Regeln

### Regel-001: Personenbezogene Daten niemals in Logs

- **Herkunft:** ADR-001 (Hoster-Vertrauen) und Constraint-Abschnitt in `project-context.md`.
- **Gilt für:** Alle Logging-Aufrufe in Backend und Frontend, einschließlich Error-Logs, Debug-Ausgaben, Request-Logs.
- **Regel:** Personennamen, Notizfelder, Lat/Lon, Mailadressen, Plus Codes mit Personenbezug werden vor Log-Ausgabe entweder weggelassen oder durch Platzhalter ersetzt (`<redacted>`). Logger-Wrapper in `app/logging.py` mit Redaction-Liste verwenden.
- **Ausnahmen:** Keine.
- **Gegenbeispiel:** `logger.info(f"Event {event.id} created by {user.email} at {event.lat}/{event.lon}")` — verletzt Regel mehrfach. Korrekt: `logger.info("event_created", event_id=event.id, user_id=user.id)`.

### Regel-002: Application-Default-Performer = eingeloggter User

- **Herkunft:** ADR-010 (User ↔ Person Pflicht-Verknüpfung).
- **Gilt für:** Application-Erfassungsformular im Frontend, sowohl Live-Modus als auch nachträglich.
- **Regel:** `performer_id` wird beim Anlegen einer neuen Application per Default mit der `person_id` des eingeloggten Users vorbelegt. Das Feld bleibt überschreibbar.
- **Ausnahmen:** Wenn der Admin nachträglich für eine Gruppe ein Event erfasst, in dem er nicht beteiligt war — Performer wird dann manuell gewählt.
- **Gegenbeispiel:** Performer-Feld leer lassen und User explizit klicken lassen — bricht den Komfort-Default und macht Live-Modus unnötig langsam.

### Regel-003: Auto-Participant bei Performer/Recipient-Zuordnung

- **Herkunft:** ADR-012 (Auto-Participant).
- **Gilt für:** Backend-Service, der Applications erstellt oder aktualisiert.
- **Regel:** Wird `performer_id` oder `recipient_id` in einer Application gesetzt, wird die jeweilige Person automatisch als `EventParticipant` zum übergeordneten Event hinzugefügt — sofern noch nicht vorhanden. UI-Hinweis: „[Name] wird als Participant des Events erfasst und kann es später einsehen."
- **Ausnahmen:** Keine. Manuelles Entfernen aus EventParticipant nur möglich, wenn Person in keiner Application mehr referenziert wird.
- **Gegenbeispiel:** Application mit Recipient X anlegen, ohne X automatisch als Participant zu erfassen → X sieht das Event via RLS nicht, obwohl er Recipient war. Bug, kein Feature.

### Regel-004: On-the-fly-Personen sind nicht automatisch verknüpfungsbereit

- **Herkunft:** ADR-014 (On-the-fly-Personenanlage).
- **Gilt für:** Person-Anlage über `POST /api/persons/quick` (Live-Modus).
- **Regel:** Person wird mit `origin = 'on_the_fly'` und `linkable = false` angelegt. `linkable = true` setzt ausschließlich der Admin manuell über die Admin-UI, wenn die Person für eine zukünftige User-Verknüpfung freigegeben werden soll.
- **Ausnahmen:** Keine.
- **Gegenbeispiel:** `linkable = true` als Default → Admin-User-Anlage-Dropdown wäre nach kurzer Zeit mit Dutzenden Personen verschmutzt.

### Regel-005: Datums- und Zeit-Felder sind immer `timestamptz`

- **Herkunft:** Konvention im Datenmodell (`architecture.md`).
- **Gilt für:** Alle SQLAlchemy-Modelle, Pydantic-Schemas, API-Verträge.
- **Regel:** Datums- und Zeit-Felder verwenden ausschließlich `timestamptz` (Postgres) bzw. `datetime` mit Timezone (Python) bzw. ISO-8601-Strings mit Timezone (JSON). Keine naiven Datetime-Werte.
- **Ausnahmen:** Keine.
- **Gegenbeispiel:** `Event.started_at = datetime.now()` ohne Timezone → führt zu Zeitzonen-Bugs.

### Regel-006: RLS-Policies haben Pflicht-Tests

- **Herkunft:** Quality-Goals in `project-context.md` und ADR-005 (RLS-Strategie).
- **Gilt für:** Jede neue oder geänderte RLS-Policy auf Tabellen mit Nutzerdaten.
- **Regel:** Pro Policy mindestens ein positiver Test (Rolle X sieht Datensatz Y) und ein negativer Test (Rolle X sieht Datensatz Z nicht). Tests in `tests/test_rls.py`. RLS-Coverage 100 %, sonst kein Merge.
- **Ausnahmen:** Keine.
- **Gegenbeispiel:** Policy hinzufügen ohne Test → Bug bleibt unentdeckt, mögliches Daten-Leck.

---

**Hinweis zur Initialisierungs-Entscheidung:** Die initiale Anpassung der Vorlagen-Dokumente an HC-Map-Komplexität ist in **ADR-009 (Vorgehensmodell: Vision-driven Scoping vor Code)** dokumentiert. Diese ADR übernimmt die Funktion, die in der generischen Vorlage für ADR-001 vorgesehen war.
