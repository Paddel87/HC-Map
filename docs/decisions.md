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
| ADR-026 | Implementierungsstrategie M5a.2 (Frontend Startseite, Suche, Export) | Accepted | 2026-04-26 |
| ADR-027 | Implementierungsstrategie M5a.3 (Frontend Live-Modus + LocationPickerMap) | Accepted | 2026-04-26 |
| ADR-028 | Implementierungsstrategie M5a.4 (App-PIN-Sperre)                | Accepted | 2026-04-26  |
| ADR-029 | Conflict-Resolution-Strategie M5b (Live-First mit Reconciliation) | Accepted | 2026-04-26 |
| ADR-030 | Soft-Delete und Cursor-Felder auf event/application (M5b)       | Accepted | 2026-04-26  |
| ADR-031 | RxDB-Schema-Source-of-Truth: hand gepflegt + Drift-Test         | Accepted | 2026-04-26  |
| ADR-032 | IndexedDB-Storage-Encryption: keine Encryption in Pfad A        | Accepted | 2026-04-26  |
| ADR-033 | Implementierungsstrategie M5b.2 (Sync-Endpoints + Owner-SELECT-Policy) | Accepted | 2026-04-26 |
| ADR-034 | Implementierungsstrategie M5b.3 (RxDB-Frontend-Setup + Live-Modus-Refactor) | Accepted | 2026-04-26 |
| ADR-035 | Implementierungsstrategie M5b.4 (E2E-Offline-Test + Coverage-Tooling)   | Accepted | 2026-04-27 |
| ADR-036 | M5c-Framework + Implementierungsstrategie M5c.1a (Detail-Page Client-only) | Accepted | 2026-04-27 |
| ADR-037 | Implementierungsstrategie M5c.1b (Participants als RxDB-Sync-Collection) | Accepted | 2026-04-27 |
| ADR-038 | Implementierungsstrategie M5c.2 (EventDetailView, Lücken-Anzeige, Frontend-Maskierung) | Accepted | 2026-04-27 |
| ADR-039 | Implementierungsstrategie M5c.3 (Nachträgliche Erfassung)                | Accepted | 2026-04-27 |
| ADR-040 | Implementierungsstrategie M5c.4 (Edit-UI mit RxDB-Push, Soft-Delete, RBAC) | Accepted | 2026-04-27 |

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

## ADR-028 — Implementierungsstrategie M5a.4 (App-PIN-Sperre)

**Status:** Akzeptiert (2026-04-26)

**Kontext:** ADR-023 hat das PIN-Verfahren festgelegt (PBKDF2-SHA-256
via Web Crypto API, 600.000 Iterationen, 16-Byte-Salt, IndexedDB-
Storage `hcmap-pin/pin_v1`, Inaktivitäts-Timer 60 s, Zwangs-Logout
nach 5 Fehlversuchen). M5a.4 setzt diese Spezifikation als
Frontend-Modul um — kein Backend-Anteil, keine neuen Dependencies,
querliegend zu allen `(protected)`-Routen.

**Entscheidungen:**

1. **Modul-Aufteilung (A):** Vier Dateien als saubere Schichten:
   - `lib/pin.ts` (Crypto): PBKDF2-Wrapper, base64-Helper,
     `constantTimeEqual`. Reine Funktionen, ohne State, ohne
     IndexedDB. Direkt mit Vitest testbar gegen Node-Crypto.
   - `lib/pin-storage.ts` (Persistence): IndexedDB-CRUD für den
     `hcmap-pin/pin/pin_v1`-Eintrag. Mockable per `vi.mock`.
   - `components/pin/pin-lock-provider.tsx` (State): React-Context
     mit `usePinLock`-Hook, Inaktivitäts-Timer, fail-counter,
     Force-Logout.
   - `components/pin/lock-overlay.tsx` (UI): Vollbild-PIN-Eingabe,
     wird vom Provider gerendert, sobald `status === "locked"`.
   Trennung erlaubt unabhängige Tests und macht den späteren
   Algorithmus-Wechsel auf Argon2id (ADR-023 §8) auf einen
   Crypto-File begrenzt.

2. **Crypto-Parameter (B):** Wie ADR-023 §2 festgelegt
   (`PIN_VERSION=1`, `PIN_ALGORITHM="PBKDF2-SHA256"`,
   `PIN_ITERATIONS=600_000`, `PIN_SALT_BYTES=16`,
   `PIN_HASH_BYTES=32`, `PIN_FAIL_LIMIT=5`). Konstanten als
   benannte Exporte, damit Tests sie referenzieren und nicht
   duplizieren. PIN-Länge wird auf 4–6 Ziffern validiert
   (`hashPin` wirft sonst). `constantTimeEqual` vergleicht die
   abgeleiteten Bytes XOR-akkumuliert — kein early-exit. Der
   Vergleich auf base64-Strings wäre ebenfalls möglich, aber die
   Byte-Variante ist robuster gegen Padding-Edge-Cases.

3. **IndexedDB-Wrapper (C):** `pin-storage.ts` nutzt das native
   `indexedDB`-API ohne Fremd-Library. Helper-Function `withStore`
   öffnet die DB, startet eine Transaktion, ruft die übergebene
   Operation auf und schließt die DB nach `oncomplete`.
   `loadPinRecord` gibt `null` zurück, wenn IDB nicht verfügbar
   ist (z. B. Server-Side oder in jsdom) — der Provider
   degradiert dann sauber zum `no-pin`-Zustand. Verworfen wurde
   `idb-keyval` als Convenience-Lib: zusätzliche Dependency,
   freigabepflichtig nach CLAUDE.md §4, sparte ~30 Zeilen Code.

4. **Provider-Pattern (D):** `PinLockProvider` ist eine
   Client-Component, die in `app/(protected)/layout.tsx` zwischen
   die Server-Layout-Logik und `<AppShell>` gewickelt wird. Damit
   ist `usePinLock()` in jedem geschützten Pfad verfügbar — auch
   in der Sidebar/UserMenu, falls dort später ein „Sperren"-Knopf
   eingebaut wird. Auf `(public)`-Routen (Login, Forgot-Password)
   ist der Provider absichtlich nicht aktiv: sperren ohne Session
   ergibt keinen Sinn, und das Login-Form muss frei zugänglich
   bleiben.

5. **State-Maschine (E):** Vier Status-Werte, klar voneinander
   abgegrenzt:
   - `loading` (Initial-Load aus IDB läuft).
   - `no-pin` (kein Record vorhanden — UI-Sperre deaktiviert).
   - `unlocked` (Record vorhanden, App ist nutzbar).
   - `locked` (Record vorhanden, LockOverlay rendert).
   Übergänge:
   - `loading → no-pin | unlocked` nach erstem IDB-Read.
   - `no-pin → unlocked` durch `setPin()`.
   - `unlocked → locked` durch `lock()` oder Inaktivitäts-Timer.
   - `locked → unlocked` durch `tryUnlock()` mit korrekter PIN.
   - `unlocked|locked → no-pin` durch `clearPin()`.
   - `locked → no-pin` durch Force-Logout (5× falsch).

6. **fail_count vor Vergleich inkrementiert (F):** ADR-023 §5
   verlangt, dass `fail_count` **vor** dem Hash-Vergleich erhöht
   und persistiert wird. Damit überlebt ein Crash mitten im
   Vergleich (z. B. Tab schließen) den Anti-Brute-Force-Schutz.
   Bei Erfolg wird `fail_count` auf 0 zurückgesetzt; bei
   Erreichen von `PIN_FAIL_LIMIT=5` triggert `forceLogout` den
   Zwangs-Logout.

7. **Force-Logout-Sequenz (G):** Reihenfolge:
   1. `clearPinRecord()` (best-effort) — entfernt den
      IndexedDB-Eintrag, damit der Angreifer nicht durch
      Reload weiter probieren kann.
   2. Provider-State auf `no-pin` setzen — UI-Sperre löst sich,
      bevor der Logout-Roundtrip zurückkehrt.
   3. `POST /api/auth/logout` (best-effort, Fehler ignoriert).
   4. `router.push("/login?error=pin")` + `router.refresh()` —
      die LoginForm zeigt einen deutschen Hinweis, dass die
      Sitzung wegen falscher PINs beendet wurde.

8. **Inaktivitäts-Timer (H):** Default 60.000 ms, konfigurierbar
   im Profil aus einem Dropdown mit fünf Stufen (30 s, 1 min,
   2 min, 5 min, 15 min). Der Wert wird in `localStorage` unter
   `hcmap.pinLock.inactivityMs` persistiert (geräte-, nicht
   user-spezifisch — der nächste User auf demselben Gerät erbt
   die Einstellung). Server-seitiges Persistieren wäre eine
   API-Vertragsänderung außerhalb M5a.4-Scope.
   Timer-Reset bei `pointerdown`, `keydown`, `visibilitychange`.
   `visibilitychange` mit `document.visibilityState === "visible"`
   resettet, mit `"hidden"` clearet — d. h. ein Tab-Wechsel
   pausiert den Timer (sonst würde ein langer Tab-Wechsel zur
   instant-Sperre nach Rückkehr führen). Werte werden auf das
   Intervall [15 s, 15 min] geclamped — kürzer macht die App
   unnutzbar, länger entspricht keinem realistischen
   Schutzziel mehr.

9. **LockOverlay-UI (I):** Fixed-position Vollbild-Modal mit
   `z-[100]`, Backdrop-Blur, dunklem Card und numerischem Input
   (`inputMode="numeric"`, `pattern="[0-9]*"`,
   `autoComplete="one-time-code"`). Auf Mobile öffnet sich
   automatisch das Zahlentastatur-Layout. Konstantzeit-Render
   auch im Wrong-PIN-Fall (kein „Versuch X von Y"-Spinner-Flackern).
   Verbleibende Versuche werden nach dem ersten Fehlschlag
   eingeblendet. Eingabe wird beim Submit auf reine Ziffern
   gefiltert (`replace(/[^0-9]/g, "")`).

10. **Profil-UI (J):** `PinSettings`-Component zeigt drei
    Modi:
    - **no-pin:** Form mit „neue PIN" + „PIN bestätigen", Submit
      → `setPin`. Bei Mismatch deutsche Toast-Meldung.
    - **configured:** drei Buttons („PIN ändern" → Edit-Mode,
      „Jetzt sperren" → `lock()`, „PIN entfernen" → `clearPin()`)
      plus Inaktivitäts-Dropdown.
    - **edit:** wie no-pin, plus „Abbrechen"-Button.
    react-hook-form wird hier bewusst nicht verwendet — die Form
    hat nur zwei Felder mit einfacher Validation, ein direkter
    `useState`-Pfad ist kürzer und vermeidet eine doppelte
    Validation-Schicht.

11. **Tests (K):** 15 neue Vitest-Tests:
    - `tests/pin.test.ts` (10): hashPin produziert dokumentierte
      Parameter; verifyPin korrekt für richtige/falsche PIN;
      zwei hashPin-Calls für gleiche PIN haben verschiedene
      Salts/Hashes; verifyPin lehnt unbekannten Algorithmus
      ab; hashPin lehnt zu kurze/lange PINs ab; base64-
      Round-Trip; constantTimeEqual für gleiche/verschiedene/
      unterschiedlich-lange Arrays.
    - `tests/pin-lock.test.tsx` (5): Initial-no-pin,
      `setPin`-Transition, korrekte PIN unlocks + reset
      fail_count, falsche PIN inkrementiert + bleibt locked,
      5× falsch triggert Force-Logout mit
      `/login?error=pin`-Push und IDB-Wipe.
    Frontend-Suite 37 → 52 Tests grün. PIN-Storage wird per
    `vi.mock` durch in-memory-Implementation ersetzt — IDB ist
    in jsdom nicht stabil verfügbar. LockOverlay-UI-Tests
    werden im Browser-Smoke verifiziert.

12. **Browser-Smoke (L):** Lokales Stack (Postgres + Backend +
    Next-Dev-Server) bestätigt:
    - `/profile` rendert App-PIN-Card mit Set-Form, wenn keine
      PIN existiert.
    - PIN-Record direkt in IDB schreiben (PBKDF2 mit korrekten
      Parametern) → Reload → Provider lädt Record → Card zeigt
      „PIN ist aktiv" mit drei Action-Buttons + Timeout-
      Dropdown („1 Minute (Default)").
    - „Jetzt sperren" → LockOverlay rendert über allem als
      Dialog `aria-label="App ist gesperrt"`.
    - Korrekte PIN „1234" → Dialog verschwindet, App entsperrt.
    - Falsche PIN „9999" → Dialog bleibt, Fehler-Hinweis
      „PIN ist falsch. Verbleibende Versuche: 4.", IDB
      `fail_count: 1`.
    Force-Logout-Pfad ist im Vitest-Test abgedeckt — kein
    weiterer Browser-Smoke nötig.

13. **Dashboard-Bug aus M4 mitgefixt (M):** Beim Browser-Smoke
    crashte `/` mit `event.lat.toFixed is not a function`. Das
    Backend serialisiert Decimals als String (Pydantic v2
    Default), das Dashboard rief aber `.toFixed()` direkt auf —
    ein versteckter Bug aus M4, der bei leerer Liste in M5a.2
    nicht auffiel und in M5a.3 nur live war, weil das Smoke-
    Event auf `/dashboard` nicht aufgerufen wurde. Fix mit
    `coerceNumber()`-Helper aus M5a.3 (`lib/types.ts`). Das ist
    keine Scope-Erweiterung, sondern ein offensichtlicher Bug
    in einer Komponente, deren Hinweis-Text ich in M5a.4
    ohnehin überschritten hätte.

14. **Scope-Abgrenzung (N):**
    - **M5a.4 (dieser ADR):** App-PIN-Sperre, Frontend-only.
    - **M5b:** Offline-Sync via RxDB. Wird beim Force-Logout
      ebenfalls IDB-leeren müssen — der `forceLogout`-Pfad
      bekommt dann einen weiteren `await rxdb.removeDatabase()`-
      Aufruf. M5a.4 nimmt das nicht vorweg, weil RxDB noch nicht
      eingerichtet ist.
    - **M11:** Vor Go-Live wird die PIN-Doku Teil der
      Onboarding-Anleitung („PIN setzen empfohlen, schützt
      vor Schulterblick").

**Konsequenzen:**

- App-PIN-Schicht ist produktiv und über alle geschützten Routen
  aktiv. Schutzziel aus ADR-023 (Schulterblick + kurze fremde
  Übernahme) ist erreicht.
- Keine neuen Backend-Routen, keine neuen Dependencies, keine
  Migrations.
- Frontend-Suite 37 → 52 Tests grün; tsc/eslint/prettier/build
  alle clean.
- Dashboard-Bug aus M4 ist im Vorbeigehen behoben — Listen mit
  echten Lat/Lon-Werten rendern wieder.
- `forceLogout` setzt UI-State **vor** dem Server-Logout-Roundtrip
  zurück. Auch bei Backend-Ausfall ist die UI nach dem 5. Versuch
  unverzüglich entsperrt (auf `/login` redirectet) — der
  Server-Cookie wird durch die Middleware oder beim nächsten
  authenticated Request invalidiert.
- LocalStorage-basierte Inaktivitäts-Konfiguration ist
  geräte-, nicht user-gebunden. Bei mehreren Usern auf einem
  Gerät teilen sie die Einstellung. Akzeptiert für Pfad A
  (Hobby-Setup); für Pfad B müsste das in den User-Profil-
  Endpoint gehen.

**Verworfene Alternativen:**

- C2 (`idb-keyval` als Convenience-Library): zusätzliche
  Dependency, freigabepflichtig — der native IDB-Wrapper sind
  ~70 Zeilen, die ich verstehe und teste.
- D2 (Provider in `RootLayout` statt `(protected)/layout`):
  würde den Login-Pfad ebenfalls einbinden, der aber kein PIN
  haben darf.
- E2 (zwei States `lockState`/`hasPin` statt Single-Status):
  unnötig, weil ein gültiger Status `locked` ohne `hasPin`
  semantisch unmöglich ist und durch das Type-System schöner
  ausgeschlossen wird.
- I2 (Web-Worker für PBKDF2): laut ADR-023 §7 nicht
  erforderlich, weil die UI während des Hash-Vergleichs ohnehin
  unbenutzbar ist (LockOverlay).
- J2 (react-hook-form für PIN-Setting): zwei Felder, eine
  Validation-Regel — overengineering für den Use Case.

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

## ADR-029 — Conflict-Resolution-Strategie M5b (Live-First mit Reconciliation)

**Status:** Accepted
**Datum:** 2026-04-26

### Kontext
ADR-017 hat RxDB als Sync-Schicht festgelegt und Conflict-Resolution mit zwei Stichworten umrissen („Server-Zeit als Wahrheit für Zeitstempel, Last-Write-Wins für Notiz-Felder"). M5b verlangt eine Pro-Feld-Festlegung für `event` und `application`, weil sich daraus die Validierungs-Logik der `POST /api/sync/push`-Route ergibt.

### Entscheidung
Pro-Feld-Strategie nach **Variante B (Live-First mit Reconciliation)** aus dem M5b.1-Vorschlagspaket.

**Strategie-Klassen:**
- **server-authoritative:** Server ignoriert Client-Wert, schreibt eigenen.
- **immutable-after-create:** Nach erstem Push fix; Server lehnt Änderungen mit Konflikt ab.
- **first-write-wins (FWW):** Erster Nicht-NULL-Push gewinnt; Folge-Push mit anderem Wert ist Konflikt.
- **last-write-wins (LWW):** Bei Konflikt entscheidet höheres `updated_at`; bei Gleichstand Server. Server überschreibt `updated_at` immer mit eigener Uhr beim Schreiben.

**Pro-Feld-Tabelle `event`:**

| Feld | Strategie |
|---|---|
| `id` | immutable-after-create |
| `started_at` | immutable-after-create |
| `lat`, `lon` | immutable-after-create |
| `geom` | server-authoritative (generiert aus `lat`/`lon`) |
| `w3w_legacy` | server-authoritative (Migrations-Artefakt) |
| `ended_at` | first-write-wins |
| `reveal_participants` | LWW |
| `note` | LWW |
| `created_by`, `created_at` | immutable-after-create |
| `updated_at` | server-authoritative |
| `is_deleted`, `deleted_at` | server-authoritative auf `false→true`-Übergang per dedizierter Operation; `true→false` nur durch Admin-Route, **nicht** über Sync. |

**Pro-Feld-Tabelle `application`:**

| Feld | Strategie |
|---|---|
| `id` | immutable-after-create |
| `event_id` | immutable-after-create |
| `sequence_no` | immutable-after-create + UNIQUE-Konflikt-Handling: Bei `UNIQUE(event_id, sequence_no)`-Verletzung im `push` antwortet der Server mit Konflikt + nächster freier `sequence_no`; Client schreibt lokal um. |
| `started_at` | immutable-after-create |
| `ended_at` | first-write-wins |
| `performer_id`, `recipient_id` | LWW |
| `arm_position_id`, `hand_position_id`, `hand_orientation_id` | LWW |
| `note` | LWW |
| `created_by`, `created_at` | immutable-after-create |
| `updated_at` | server-authoritative |
| `is_deleted`, `deleted_at` | siehe `event` |

### Konsequenzen für die Sync-Endpoint-Implementierung (M5b.2)
- `push` erwartet pro Dokument `{assumedMasterState, newDocumentState}`. Vergleich gegen aktuellen DB-Zustand entscheidet pro Feld nach obiger Tabelle.
- Bei jedem Konflikt antwortet der Server mit dem aktuellen Server-Zustand des betroffenen Dokuments; der Client merged lokal und re-pushed beim nächsten Zyklus.
- Server überschreibt `updated_at` und `created_at` und `id` immer mit eigenem Wert; `geom` wird generiert.
- Live-Lock-Felder (alle als `immutable-after-create` markierten) werden nach erstem erfolgreichen Push als unveränderbar betrachtet — gilt insbesondere für `lat`/`lon`/`started_at`. Nachträgliche Korrekturen sind nur über die Admin-Route in M5c möglich.
- Seq-No-Konflikt ist im Solo-Live-Modus extrem selten (pro Client zur Zeit eine Application). Er kann theoretisch eintreten, wenn ein Editor parallel auf zwei Geräten Applications erfasst — sauberes Re-Numbering durch den Server löst das deterministisch.

### Begründung
- Passt zum Live-Modus-Vertrag aus ADR-011: Event-Start (`started_at`, `lat`, `lon`) ist ein einmaliger Akt, sollte nicht versehentlich über LWW überschrieben werden.
- LWW dort, wo Bearbeitung legitim ist (Notizen, Beteiligte, Positionen). Verlust durch parallele Edits ist tolerabel und durch Konflikt-Antwort sichtbar.
- Server bleibt Single Source of Truth für alle Zeitstempel (`updated_at`, `created_at`, `geom`).

### Verworfene Alternativen
- **Variante A (strikt):** Hätte den Live-Modus-Schreibpfad „Client schreibt zuerst" gebrochen — jeder Geo-Punkt müsste vom Server bestätigt werden, bevor er stabil ist.
- **Variante C (vollständig LWW):** Risiko versehentlich überschriebener Geo-Daten und sequence_no-Kollisionen ohne Schutz.

---

## ADR-030 — Soft-Delete und Cursor-Felder auf event/application (M5b)

**Status:** Accepted
**Datum:** 2026-04-26

### Kontext
Das RxDB-Replication-Protokoll braucht zwei Bausteine, die das aktuelle Schema (Initial-Migration `20260425_1700_initial`) nicht in der nötigen Form bietet:

1. **Monoton wachsender Cursor pro Dokument** für `GET /api/sync/pull`. `event.updated_at` und `application.updated_at` sind aktuell `NULL`-fähig — der bestehende Trigger `set_updated_at` setzt zwar bei jedem `UPDATE` `clock_timestamp()`, aber bei `INSERT` bleibt der Wert `NULL`. Damit ist kein verlässlicher Cursor möglich.
2. **Soft-Delete-Tombstones**, damit gelöschte Dokumente repliziert werden können. Aktuell gibt es weder `is_deleted` noch `deleted_at` auf `event`/`application` (nur auf `user`/`person`).

### Entscheidung

**Datenmodell-Änderungen** auf `event` und `application` (rückwärtskompatibel-additiv):

1. **`updated_at`:** Default auf `clock_timestamp()` setzen, Backfill `UPDATE … SET updated_at = COALESCE(updated_at, created_at)`, dann `SET NOT NULL`.
2. **Soft-Delete:** Neue Spalten `is_deleted boolean NOT NULL DEFAULT false` und `deleted_at timestamptz NULL`.
3. **Cursor-Index:** Composite-Index `(updated_at, id)` für Pull-Cursor-Performance.

**Cascade-Regel** (Variante A des M5b.1-Vorschlags):
- Trigger `cascade_event_soft_delete` (BEFORE UPDATE OF is_deleted ON event): bei Übergang `is_deleted false→true` werden alle nicht-gelöschten Child-Applications dieses Events ebenfalls auf `is_deleted = true`, `deleted_at = NEW.deleted_at` gesetzt. Restore (`true→false`) propagiert **nicht** automatisch — manuelles Restore pro Application bleibt bewusst Admin-Aufgabe.

**Cursor-Tupel für `pull`:** `(updated_at ASC, id ASC)`. `id` als deterministischer Tiebreaker bei mehreren Updates in derselben Mikrosekunde.

**RLS-Policies:** In M5b.1 **nicht angefasst**. Die bestehenden Policies aus `20260425_1730_strict_rls` filtern `is_deleted` nicht, aber solange keine Soft-Deletes existieren, ist das Verhalten identisch zum Ist-Zustand. Soft-Delete-bewusste Filterung der CRUD-Routen wird zusammen mit den Sync-Endpoints in M5b.2 nachgezogen (Service-Layer-Filter `WHERE is_deleted = false` für Member-Sicht; Sync-Endpoints liefern Tombstones bewusst auch an Member, damit RxDB Lokal-Stand abgleichen kann).

### Konsequenzen
- Bestehende Daten bleiben sichtbar und unverändert (Backfill setzt `updated_at = created_at` für Altdatensätze).
- Die initial-Migration legt `set_updated_at` mit `clock_timestamp()` an (deterministisch über Multi-Statement-Transaktionen). Das wird in M5b.1 nicht angefasst.
- Cursor-Pagination performant via `idx_event_cursor` und `idx_application_cursor`.
- Cascade-Trigger sorgt für vollständige Tombstone-Replikation: RxDB sieht jedes gelöschte Application-Dokument als eigenständigen `_deleted: true`-Eintrag.
- Restore eines Events erfordert separaten Admin-Workflow (M5c-Scope), der pro Application explizit entscheidet — bewusste Vorsicht gegen versehentliches Massen-Restore.

### Verworfene Alternativen
- **Cascade via JOIN-Filter (Variante B des Vorschlags):** Hätte RxDB-Replikation gebrochen, weil Applications „verschwinden" ohne dokumenteneigenen Tombstone — Datenleichen im Frontend wären die Folge.
- **Hard-Delete:** Inkompatibel mit RxDB-Replication-Protokoll, das Tombstones erwartet.
- **`updated_at` weiter `NULL`-fähig:** Cursor-Pagination wäre brüchig, NULL-Sortier-Reihenfolge unterscheidet sich zwischen DB-Engines.

### Migration
Datei: `backend/migrations/versions/20260426_1800_m5b1_sync_columns.py`. Down-Migration entfernt Spalten, Indices und Cascade-Trigger; lässt `updated_at` auf `NOT NULL` (kein Datenverlust durch Downgrade).

---

## ADR-031 — RxDB-Schema-Source-of-Truth: hand gepflegt + Drift-Test

**Status:** Accepted
**Datum:** 2026-04-26

### Kontext
Akzeptanzkriterium aus M5b ([fahrplan.md M5b](../docs/fahrplan.md)) verlangt: „RxDB-Schemas und Backend-Modell bleiben synchron." Drift = Live-Modus-Bruch im Funkloch (Client pusht, Backend lehnt mit 422 ab — User merkt es nach Wiederverbindung, Daten gehen ggf. verloren).

### Entscheidung
RxDB-Schemas im Frontend und Pydantic-Schemas im Backend werden **manuell parallel gepflegt**. Drift wird durch einen automatisierten Test in der Backend-Suite verhindert.

**Konkret:**
- **Frontend:** `frontend/src/lib/rxdb/schemas/event.schema.json` und `application.schema.json` (RxDB-natives JSON-Schema-Format). `frontend/src/lib/rxdb/schemas.ts` importiert die JSON-Files und übergibt sie an die RxCollection.
- **Backend:** Pydantic-Schemas der Sync-Endpoints in `backend/app/sync/schema.py`.
- **Drift-Test:** `backend/tests/test_rxdb_schema_drift.py` lädt das Frontend-JSON-Schema (relativer Pfad), extrahiert `properties` + `required` und vergleicht Felder + JSON-Schema-Typen mit den Pydantic-Schemas. Schlägt fehl, sobald ein Feld auf einer Seite fehlt oder einen abweichenden Typ hat. Test gehört zur Standard-CI-Suite.

### Begründung
- **Pragmatisch und M5b-Scope-passend:** Setup-Aufwand ist ein einziger Test; kein Codegen-Tool, kein Build-Step.
- **Test schützt vor stiller Drift:** PR mit Schema-Änderung in nur einer Hälfte schlägt fehl.
- **Migration auf vollautomatischen Codegen bleibt offen** (etwa wenn weitere Entitäten offline-fähig werden).

### Konsequenzen
- Jede Änderung am `event`/`application`-Modell muss synchron in Backend-Pydantic + Frontend-JSON-Schema landen, sonst CI-Fehler.
- Test muss Edge-Cases abdecken: optionale Felder (`required`-Liste), Enums, geschachtelte Objekte. Wird im Test mit konkreten Assertions belegt.
- Bei späterem Schema-Wachstum kann auf Codegen migriert werden, der Drift-Test bleibt parallel als Sicherheitsnetz.

### Verworfene Alternativen
- **OpenAPI-Codegen + `openapi-typescript`:** Setup-Komplexität (Build-Step, generierte Files in Git, CI-Drift-Check) für M5b nicht gerechtfertigt. Bleibt offene Option für später.
- **Geteiltes JSON-Schema in `shared/`:** Würde Pydantic-Schemas auf JSON-Schema-First umbauen — größerer Refactor, bricht Type-First-Stil aus ADR-005.

---

## ADR-032 — IndexedDB-Storage-Encryption: keine Encryption in Pfad A

**Status:** Accepted
**Datum:** 2026-04-26

### Kontext
RxDB persistiert Events und Applications im Browser-IndexedDB. Sensitiv sind insbesondere Plus-Code (Geo-Lokation), Notizen und Personen-IDs. `project-context.md` §6/Sicherheit nennt App-PIN clientseitig (M5a.4), aber keine Storage-Encryption. Vertrauensmodell ([project-context.md:238](../docs/project-context.md)) deckt Hoster und Admin als vertraut, sagt aber nichts zum Endgeräte-Storage.

**Bedrohungsmodell:**
- Schulterblick / kurzer fremder Zugriff bei entsperrtem Gerät → durch App-PIN abgedeckt (M5a.4).
- Devtools/Forensik bei beschlagnahmtem entsperrtem Gerät → Klartext-IndexedDB lesbar.
- Forensik bei beschlagnahmtem gesperrtem Gerät → durch Geräte-FDE (FileVault / BitLocker / Android FBE / iOS Data Protection) abgedeckt, sofern aktiviert.

### Entscheidung
**Keine Storage-Encryption** in Pfad A (Variante C des M5b.1-Vorschlags).

### Begründung
- **Geräteverschlüsselung ist Standard und User-Verantwortung** — analog zu localStorage in jeder Web-App. Pfad-A-Mitglieder werden im Einwilligungstext explizit auf diese Verantwortung hingewiesen.
- **Bundle-Größen-Constraint:** ADR-017 nennt 150–200 KB für RxDB+Dexie+RxJS. Encryption-Plugin würde ~20–40 KB draufsetzen. Mobile-First-Bundle ist bereits grenzwertig.
- **Performance-Constraint:** `project-context.md` §6 fordert Live-Modus-Aktionen unter 200 ms. RxDB-Encryption kostet 10–30 ms pro Schreib-/Lesevorgang — komfortabler Headroom geht verloren.
- **Praktischer Mehrwert in Pfad A gering:**
  - **Login-Token-Schlüssel (Variante A):** Schützt nur bis Logout. Realistisch loggen sich Mitglieder selten aus — Mehrwert minimal.
  - **PIN-abgeleiteter Schlüssel (Variante B):** 4–6-stelliger PIN bietet schwachen lokalen Brute-Force-Schutz. Bei 5-Fehlversuche-Reset (M5a.4) muss IndexedDB komplett verworfen werden — Resync der Live-Modus-Daten als Folge.
- **App-PIN deckt das primäre Bedrohungsmodell** („Schulterblick / kurzer fremder Zugriff") bereits ab.

### Konsequenzen
- **Einwilligungstext (Pre-M11 Go-Live, [project-context.md:247](../docs/project-context.md))** muss explizit ergänzt werden:
  - Hinweis: „IndexedDB-Inhalte des eigenen Endgeräts liegen unverschlüsselt vor; Geräteverschlüsselung wird vom User selbst sichergestellt."
- **Bei Wechsel zu Pfad B neu zu bewerten** (DSFA-Kontext, größere Nutzerzahl, höheres Risiko von beschlagnahmten Geräten ohne Geräte-FDE).
- **Phase-2-Foto-Anhänge (M15):** Bilder landen vermutlich nicht in IndexedDB, sondern als Server-URL-Referenzen. Sollte beim M15-Design noch einmal geprüft werden.

### Verworfene Alternativen
- **Variante A (Login-Token-Schlüssel):** Mehrwert nur bis zum nächsten Logout, reale Logout-Disziplin ist gering.
- **Variante B (PIN-abgeleiteter Schlüssel):** PIN ist zu kurz für robusten lokalen Schutz; PIN-Reset-Flow wird komplex.

---

## ADR-033 — Implementierungsstrategie M5b.2 (Sync-Endpoints + Owner-SELECT-Policy)

**Status:** Accepted
**Datum:** 2026-04-26

### Kontext
M5b.1 hat das Datenmodell für die RxDB-Replication vorbereitet (ADR-029…ADR-032). M5b.2 setzt die Backend-Endpoints `GET /api/sync/{collection}/pull` und `POST /api/sync/{collection}/push` für `event` und `application` um. Während der Implementierung sind sechs Detail-Entscheidungen getroffen worden, die in dieser ADR gebündelt dokumentiert sind.

### Entscheidungen

**A. Endpoint-Layout: pro Collection ein eigener Endpoint.**
Architecture.md hatte „/api/sync/pull" und „/api/sync/push" generisch beschrieben. RxDB-Replication arbeitet pro Collection — daher gibt es vier Endpoints:
- `GET /api/sync/events/pull`, `POST /api/sync/events/push`
- `GET /api/sync/applications/pull`, `POST /api/sync/applications/push`

**B. Cursor-Format: Query-Parameter `updated_at` und `id`.**
Pull-Cursor wird als zwei separate Query-Params übergeben (`updated_at` als ISO-Timestamp, `id` als UUID, beide optional). Composite-Vergleich `(updated_at, id) > (cp.updated_at, cp.id)` ist im Service-Layer als `OR(updated_at > x, AND(updated_at == x, id > y))` ausgeschrieben (statt SQLAlchemy `tuple_()`), weil Letzteres mit mypy-Strict + datetime/UUID-Argumenten nicht typeable war. Funktional identisch.

**C. Sync-Endpoints respektieren bestehende RLS, Tombstones inklusive.**
Kein BYPASSRLS-User. Tombstones (`is_deleted = true`) bleiben für jeden User sichtbar, der den Datensatz vorher schon gesehen hat (via `event_participant`-Verknüpfung — die Verknüpfung bleibt beim Soft-Delete bestehen). Soft-gelöschte Events des Editors sind zusätzlich über die neue `event_editor_select_own`-Policy sichtbar (siehe E).

**D. Soft-Delete-Filter im Service-Layer der bestehenden Routes.**
ADR-030 hatte angekündigt, die Soft-Delete-bewusste Filterung in M5b.2 nachzuziehen. Konkret umgesetzt:
- `app/services/events.py`: `list_events` und `get_event` filtern `is_deleted = false`.
- `app/services/applications.py`: `get_application` und `list_applications_for_event` analog.
- `app/services/search.py`: Volltextsuche und Throwbacks filtern beide Collections.
- `app/services/exports.py`: JSON- und CSV-Export filtern.
- **RLS-Policies bleiben unverändert** — der Filter ist zusätzlicher Service-Layer-Filter; Defense-in-Depth-Erweiterung der RLS würde Sync-Pulls brechen, weil die Endpoints Tombstones explizit zurückliefern müssen.

**E. Owner-SELECT-Policy für Editor (freigegeben separate Anfrage 2026-04-26).**
Während der Test-Implementierung trat ein latent-Bug aus M2 zutage: `INSERT … RETURNING` triggert die SELECT-Policy auf der frisch eingefügten Zeile, und die `event_member_select`-Policy verlangt `event_participant`-Mitgliedschaft, die der Auto-Participant-Insert erst nach dem Event-Insert anlegt. Im bisherigen Code-Stand war kein HTTP-Test als Editor-INSERT auf `event` betroffen — daher unentdeckt. Sync-Endpoints sind die ersten Editor-Inserts via HTTP.

Lösung in Migration `20260426_1830_m5b2_owner_select`: zwei additive Permissive-SELECT-Policies, die einem Editor erlauben, seine eigenen Events/Applications zu sehen (gleiches Predicate wie die bestehenden `_editor_update`/`_editor_delete`-Policies):
```sql
CREATE POLICY event_editor_select_own ON event
    FOR SELECT TO app_user
    USING (
        current_setting('app.current_role', true) = 'editor'
        AND created_by = current_setting('app.current_user_id', true)::uuid
    );
-- analog application_editor_select_own
```
Verworfen: (B) Auto-Participant via DB-Trigger — Trigger müsste sich mit Application-Auto-Participant koordinieren, deutlich invasiver. (C) ORM-Insert ohne RETURNING — Service-Layer-Refactor erforderlich, plus zwei Roundtrips pro Insert; Bug bliebe latent für andere Stellen.

**F. asyncpg `statement_cache_size = 0`.**
Während der Diagnose des E-Befunds wurde sicherheitshalber der asyncpg-Statement-Cache deaktiviert (siehe `app/db.py`-Docstring). Per-Connection-Plan-Cache von asyncpg kann mit Per-Request-`SET LOCAL`-GUCs interagieren — Hintergrund: asyncpg #200, SQLAlchemy-Doku. Cost ist niedrig (Mikrosekunden pro Query) und der Workaround ist dokumentiert. Bleibt als Schutzschicht erhalten, auch nachdem das eigentliche Problem über (E) gelöst wurde.

**G. Conflict-Resolution-Implementierung.**
Pro Push-Item:
1. `session.get(Model, id)` — RLS-gefiltert.
2. Wenn Server-Doc existiert, Client-`assumedMasterState` ist `None` → Konflikt: server master returned.
3. Wenn Server-Doc nicht existiert, Client-`assumedMasterState` ist gesetzt → synthetischer Tombstone returned.
4. Wenn Server-Doc nicht existiert, Client-`assumedMasterState` ist `None` → Insert-Pfad. Insert in `begin_nested()`-Savepoint; bei `IntegrityError`/`ProgrammingError` (RLS, FK, UNIQUE): synthetischer Tombstone.
5. Wenn Server-Doc existiert, Client-`assumedMasterState` gesetzt → Update-Pfad mit Pro-Feld-Validation aus ADR-029. Konflikt: server master returned. OK: ORM-Apply + Flush.

`(IntegrityError, ProgrammingError)` als Catch-Tupel — ProgrammingError fängt asyncpg's `InsufficientPrivilegeError` (RLS-Verletzung), IntegrityError fängt FK/UNIQUE.

**H. Server-authoritative Felder beim Insert.**
- `created_by = user.id` (RLS-Policy verlangt das ohnehin; Client-Wert wird ignoriert; Test `test_editor_cannot_push_event_owned_by_someone_else` belegt das).
- `created_at`, `updated_at`, `geom`: DB-Defaults / generated.
- `Application.sequence_no`: server-vergeben über `_next_sequence_no(event_id)`; Client-Wert wird ignoriert (Test belegt das).
- `id`: vom Client gesetzt (UUIDv7 im Frontend), Server akzeptiert wenn frei.

**I. Auto-Participant beim Sync-Insert.**
- Event-Insert: Creator's person_id wird `event_participant`.
- Application-Insert: performer_id und recipient_id (sofern unterschiedlich) werden `event_participant`. Idempotent über PK-Konflikt-Catch (Race-Safety).
Spiegelt die Logik aus `app/services/events.py:start_event` und `app/services/applications.py:start_application`. Konsistent mit ADR-012.

**J. Frontend-JSON-Schemas als Vertragsdatei in `frontend/src/lib/rxdb/schemas/`.**
ADR-031 sah vor, dass die Schemas im Frontend liegen. Da der Drift-Test sie braucht, sind die JSON-Files in M5b.2 angelegt — als reine Daten/Vertragsdatei, ohne Code-Verbindung zu RxDB selbst. Die RxDB-Konsumtion (`schemas.ts`) erfolgt erst in M5b.3. Diese Vorabanlage ist keine Modulgrenz-Verletzung, weil JSON-Schema die Schnittstelle zwischen Backend und Frontend definiert.

**K. Coverage-Tooling.**
`coverage>=7.13.5` als Dev-Abhängigkeit hinzugefügt — Test-Infrastruktur, vergleichbar mit dem schon existierenden `pytest`/`pytest-asyncio`/`testcontainers`-Set in der `[dependency-groups.dev]`-Section. project-context.md §3 listet Test-Bibliotheken als „freigabefrei nutzbar". Verwendet mit `--concurrency=greenlet,thread` (SQLAlchemy 2.x Async nutzt greenlet intern).

### Ergebnis
- Alle vier Sync-Endpoints lauffähig, OpenAPI-Doku automatisch generiert.
- 116 → 125 Backend-Tests (+ 41 für M5b.2: 6 sync_api + 8 sync_rls + 7 conflict + 9 applications + 5 soft-delete + 6 drift). 100 % grün.
- Coverage `app/sync/`: 91 % (Soll ≥ 80 %).
- Latent M2-Bug bei Editor-INSERT-via-HTTP behoben.
- `mypy --strict` und `ruff` clean.

### Verworfene Alternativen
Siehe Punkte E (Owner-SELECT) für die kompletten Optionen.

### Folge-Arbeit (M5b.3+)
- M5b.3: RxDB-Setup im Frontend nutzt die hier angelegten JSON-Schemas.
- M5b.4: E2E-Offline-Test verifiziert die End-to-End-Replikation.

---

## ADR-034 — Implementierungsstrategie M5b.3 (RxDB-Frontend-Setup + Live-Modus-Refactor)

**Status:** Accepted
**Datum:** 2026-04-26

### Kontext
M5b.1 hat das Datenmodell für die RxDB-Replication vorbereitet, M5b.2 die Backend-Endpoints geliefert. M5b.3 schließt die Sync-Schicht im Frontend: lokale RxDB-Datenbank, Replication-Worker gegen die Sync-Endpoints, Live-Modus-Refactor von REST auf RxDB-Schreibpfad, UI-Indikator für den Sync-Status.

### Entscheidungen

**A. RxDB-Version 17 + Dexie-Storage.**
Aktuell stable (Apache 2.0). Free-Tier-Storage-Adapter `dexie` (IndexedDB-basiert) wie ADR-017 vorgibt. Keine Premium-Plugins, keine Encryption (ADR-032). Bundle-Größe nach Build: First-Load-JS für `/events/[id]` 271 kB, für `/events/new` 262 kB — innerhalb des in ADR-017 prognostizierten Rahmens (150-200 KB für RxDB+Dexie+RxJS gzipped).

**B. Schema-Konsumtion via JSON-Import.**
Die Frontend-JSON-Schemas aus M5b.2 (`frontend/src/lib/rxdb/schemas/{event,application}.schema.json`) werden direkt importiert, durch `unknown`-Cast als `RxJsonSchema<T>` typisiert, an `addCollections` übergeben. TypeScript-Document-Types in `lib/rxdb/types.ts` manuell deckungsgleich; Drift fängt der Backend-Drift-Test aus M5b.2 ab.

**C. Lazy DB-Singleton.**
`getDatabase()` in `lib/rxdb/database.ts` gibt eine memoisierte `Promise<RxDatabase>` zurück. Server-side Aufrufe werden mit `Error("RxDB is browser-only")` abgewiesen. `RxDBDevModePlugin` wird nur in Development geladen (dynamic import), spart Bundle-Größe in Production.

**D. Replication via `replicateRxCollection` mit eigenem `pullHandler` / `pushHandler`.**
Standardweg für Custom-REST-Backends. Zwei separate Replikationen (events, applications), jede mit eigenem `replicationIdentifier`. `waitForLeadership: true` verhindert, dass mehrere Browser-Tabs parallel pushen. `retryTime: 5_000` für graceful Reconnect-Verhalten.

**E. CSRF-Cookie-Echo im Push-Handler.**
Die Sync-Endpoints sind durch die globale CSRF-Middleware geschützt (ADR-019). Der Push-Handler liest das `hcmap_csrf`-Cookie via `document.cookie` und setzt es als `X-CSRF-Token`-Header. Fehlt das Cookie (z. B. nach Logout), wirft der Handler — RxDB schiebt den Push automatisch in die Retry-Queue.

**F. Conflict-Handler: RxDB-Default (Master gewinnt).**
ADR-029 verlangt „Server gewinnt bei Konflikt". RxDB's Default-Conflict-Handler liefert exakt diese Semantik: Der Server-`master`-Doc gewinnt gegen den lokalen `newDocumentState`, wenn beide non-equal sind. Backend gibt seine Master-Doc als Konflikt-Antwort zurück (siehe ADR-029, ADR-033 §G); RxDB übernimmt sie, schreibt sie in IndexedDB und feuert die Reactive-Subscriptions. Kein eigener `conflictHandler` nötig.

**G. Globaler Sync-Status `idle | active | error | offline`.**
`startReplication(database)` in `lib/rxdb/replication.ts` aggregiert die `active$`/`error$`-Streams beider Replikationen plus `navigator.onLine`. Lokale Snapshots (statt `getValue()`, weil RxDB `active$`/`error$` als plain Observables exponiert, nicht als BehaviorSubject) werden in `BehaviorSubject<SyncStatus>` gemappt. `online`/`offline`-Window-Events triggern Recompute.

**H. React-Provider in `(protected)/layout.tsx`.**
`RxdbProvider` mountet zwischen `PinLockProvider` (M5a.4) und `AppShell`. Provider initialisiert die DB einmalig, startet die Replication, liefert `useDatabase()`, `useDatabaseError()`, `useSyncStatus()`-Hooks. Cleanup auf Unmount cancelt die Replication, lässt aber die DB-Singleton bestehen (Modul-Level).

**I. Sync-Indikator als kleine Pill in der App-Shell.**
`SyncStatusIndicator`-Komponente mit vier Lucide-Icons (Cloud / Loader2 / CloudOff / TriangleAlert) und Tailwind-Farben (emerald / sky / amber / red). Sidebar (Desktop): mit Label, am unteren Rand neben `UserMenu`. Mobile-Header: kompakt (nur Icon), neben dem `UserMenu compact`-Avatar. `data-sync-status`-Attribut hilft Tests.

**J. Live-Modus-Refactor: alle Mutations + Reads via RxDB.**
- `event-create-form.tsx`: `database.events.insert({...})` mit `crypto.randomUUID()` als Client-ID. Server überschreibt `created_by` (ADR-029). Recipient-Wahl wird in `sessionStorage` als Hint für die erste Application gespeichert (Bridge, weil `recipient_id` kein Event-Feld mehr ist — Auto-Participant ergibt sich erst aus der Application).
- `application-start-sheet.tsx`: `database.applications.insert({...})` mit lokal vergebener `sequence_no` (max+1 aus RxDB-Query). Server vergibt eine endgültige Nummer beim Push und liefert sie über den nächsten Pull zurück.
- `live-event-view.tsx`: zwei Hooks `useEventDoc(id)` / `useApplications(eventId)` subscriben auf `events.findOne(id).$` und `applications.find({event_id, _deleted=false}).$`. End-Event/End-Application via `doc.patch({ ended_at, updated_at })`. Reactive Updates ohne `refetchInterval`.
- TanStack-Query-Mutations (`useMutation` / `useQuery` / `useQueryClient`) entfernt für die Live-Modus-Pfade. Server-Reads für `plus_code` und `participants` bleiben (initial-event vom Server-Side-Render der Detail-Page).

**K. Edge-Cases bewusst akzeptiert.**
- **Offline-Insert mit direkter Navigation:** Aktuell macht `(protected)/events/[id]/page.tsx` einen Server-Side-Fetch; im Offline-Fall liefert der 404. Real auftretendes Risiko gering, weil der Push direkt nach Insert ausgelöst wird (`waitForLeadership` + `autoStart: true`). Saubere Lösung verlangt Client-only-Detail-Page — Scope für M5b.4 oder M5c.
- **Participants-Anzeige bis erster Pull:** `event.participants` bleibt leer, bis das Event vom Backend zurückgesynct wird (Backend macht Auto-Participant beim Push). Der Live-Modus toleriert das — `pickRecipientPerson` greift auf `sessionStorage`-Draft zurück, wenn applications/participants leer sind.
- **`crypto.randomUUID()` statt UUIDv7:** Backend nutzt UUIDv7-Defaults (`uuid_utils.uuid7()`, ADR-018), aber das ist nur intern wichtig (Sortierbarkeit beim Insert). Wenn der Client eine UUIDv4 liefert, übernimmt der Server sie. `(updated_at, id)`-Cursor sortiert nach `updated_at`, nicht nach `id` — ID-Form irrelevant.

**L. Component-Test mit gemocktem `useSyncStatus`-Hook.**
`tests/sync-status-indicator.test.tsx` mockt `@/lib/rxdb/provider` direkt und prüft alle vier Status-Varianten (idle / active / offline / error). 4/4 grün. Die echte Replication-Logik wird nicht getestet (würde Backend + IndexedDB-Mock benötigen) — der E2E-Offline-Test in M5b.4 schließt diese Lücke.

### Ergebnis
- 56 → 60 Frontend-Tests grün (+ 4 für SyncStatusIndicator).
- ESLint, `tsc --noEmit`, `next build` clean.
- **Browser-Verifikation:** Login → Dashboard rendert Sync-Indikator (DOM `[role=status][aria-label="Synchronisation: synchronisiert"][data-sync-status=idle]`), RxDB-IndexedDB ist initialisiert (`indexedDB.databases()` enthält `hcmap`), Pull replizierte das vorhandene Smoke-Test-Event lokal.
- Bundle: `/events/[id]` 271 kB First-Load (RxDB ~150 KB gzipped) — innerhalb der ADR-017-Grenze.

### Verworfene Alternativen
- **Premium-Replication-Plugins (`replication-rest`):** Wären für Custom-Backends einfacher, aber kostenpflichtig. Selbst-implementierte Pull/Push-Handler reichen vollständig aus.
- **Custom `conflictHandler`:** Würde redundante Logik zum Server-Konflikt-Resolver duplizieren. ADR-029 wird im Backend autoritativ entschieden; Frontend nimmt das Ergebnis als Master.
- **Codegen aus JSON-Schemas:** Hätte den Drift-Test überflüssig gemacht, aber Tooling-Setup für M5b.3 nicht gerechtfertigt. Manuelle Synchronisation bleibt schmerzfrei dank des Backend-Drift-Tests aus M5b.2.
- **Client-only Detail-Page:** Hätte den Offline-Insert-Edge-Case behoben, aber den Server-Side-Render-Vorteil (SEO, schneller Initial-Load) für eine seltene Race-Condition aufgegeben. Bleibt offen für M5b.4 oder M5c.

### Folge-Arbeit (M5b.4)
- E2E-Offline-Test: Browser → Flugmodus → 3 Applications erfassen → Reconnect → Backend hat alle Daten genau einmal, kein Duplikat, Reihenfolge korrekt.
- Coverage-Nachweis Frontend ≥ 80 % für Sync-Pfade.

---

## ADR-035 — Implementierungsstrategie M5b.4 (E2E-Offline-Test + Coverage-Tooling)

**Status:** Accepted
**Datum:** 2026-04-27

### Kontext
M5b.1–M5b.3 haben das Datenmodell, die Backend-Sync-Endpoints und den Frontend-RxDB-Stack geliefert. M5b.4 schließt den Sub-Schritt-Block mit dem End-to-End-Beweis: „Browser → Flugmodus → 3 Applications erfassen → Reconnect → Backend hat alle Daten genau einmal" plus Coverage-Nachweis ≥ 80 % für die Sync-Pfade. Backend-Coverage `app/sync/` lag aus M5b.2 schon bei 91 %; der eigentliche Engpass ist `frontend/src/lib/rxdb/replication.ts`, das bisher nur indirekt über das Component-Sync-Indicator-Test getestet war. Der Frontend-Test-Stack hatte weder Coverage-Reporter noch eine IndexedDB-fähige Umgebung.

### Entscheidungen

**A. Test-Stack: Vitest + `fake-indexeddb` + In-Process-Mock-Server (Hybrid A4 aus dem M5b.4-Vorschlag).**
Statt Playwright (architecture.md sagt explizit „Phase 2 sinnvoll, MVP optional") wird der Replication-Roundtrip in jsdom/Vitest gefahren. `fake-indexeddb@6.x` (MIT, ~80 KB, Standard-IndexedDB-Polyfill der Dexie- und RxDB-CIs) ersetzt den fehlenden Browser-IndexedDB; ein in-Process-Mock-Server in `frontend/tests/helpers/sync-mock-server.ts` reimplementiert die vier Sync-Endpoints deterministisch in-memory. Die Tests verwenden den **echten** Replication-Code aus `lib/rxdb/replication.ts` und die echte Database aus `lib/rxdb/database.ts` — kein Code-Pfad-Bypass.

**B. Coverage-Tooling: `@vitest/coverage-v8`.**
Offizieller Coverage-Reporter im vitest-Ökosystem (MIT, V8-native). Konfiguration in `vitest.config.ts`: `coverage.provider = 'v8'`, `coverage.include = ['src/lib/rxdb/**']` für den M5b.4-Nachweis, plus `coverage.thresholds.lines = 80` als CI-Gate auf den Sync-Pfaden. `pnpm test -- --coverage` erzeugt einen JSON-Summary, gegen den der Akzeptanz-Wert gemessen wird.

**C. Edge-Cases ADR-034 §K nach M5c verschoben.**
Die zwei in M5b.3 bewusst akzeptierten Edge-Cases (Server-Side-Detail-Page liefert 404 bei Offline-Insert mit direkter Navigation; `event.participants` bleibt bis zum ersten Pull leer) werden **nicht** in M5b.4 behoben. Die saubere Lösung verlangt eine Architekturänderung (`/events/[id]` auf Client-only umstellen), die dieselbe Detail-Page in M5c (Nachträgliche Erfassung & Bearbeitung) ohnehin anfasst. Eine kombinierte Refactor-Runde ist sauberer als zwei aufeinanderfolgende. Eintrag in `fahrplan.md` § M5c als Pflicht-Deliverable hinzugefügt.

**D. Backend-Idempotenz-Test als Ergänzung zu Frontend-E2E.**
`backend/tests/test_sync_idempotency.py` deckt die zweite Hälfte des Akzeptanzkriteriums „genau einmal" ab: drei Pushes desselben Application-Documents (assumedMasterState wird zwischen den Pushes mitgeführt) → exakt eine Row in der DB, `sequence_no` stabil, kein zweites `EventParticipant`-Insert. Kein neuer Dep, ergänzt `test_sync_conflict_resolution.py`.

**E. Mock-Server-Scope.**
Der Mock-Server bildet das Replication-Protokoll ab, nicht die volle Backend-Logik:
- **Pull:** Filter `(updated_at, id) > checkpoint`, ASC-Sortierung, Limit, Tombstone-Reflection.
- **Push (events):** Insert wenn nicht vorhanden; bei Re-Push mit gleichem `assumedMasterState` (idempotent) keine zweite Row, keine Konflikt-Antwort.
- **Push (applications):** wie events, plus Auto-Bump der `sequence_no` analog zum Server.
- **CSRF:** Wird gegen das in `document.cookie` gesetzte Test-Token verglichen, fehlt der Header, antwortet der Mock mit 403 (analog Backend-Verhalten).
Der Mock implementiert **nicht** die volle Pro-Feld-Konfliktauflösung aus ADR-029 — die ist Backend-Pflicht und im pytest-Suite vollständig gecovert.

**F. Offline-Simulation via globaler `fetch`-Stub + `navigator.onLine`-Toggle.**
Der Test ersetzt `globalThis.fetch` mit einem Stub, der bei `online === false` `TypeError("Network request failed")` wirft (entspricht dem Browser-Verhalten bei deaktiviertem Netz). Zusätzlich wird `Object.defineProperty(navigator, 'onLine', ...)` und `window.dispatchEvent(new Event('offline'/'online'))` getoggelt, damit `replication.ts`-`recompute()` den Status korrekt aufnimmt.

**G. Kein BroadcastChannel-Workaround nötig.**
Node 22 (per `package.json` engines) liefert `BroadcastChannel` global, RxDB's `waitForLeadership: true` erkennt im Single-Tab-Test sofort den Leader. Kein Test-spezifischer Override des Replication-Configs.

**H. Test-Isolation: Datenbank-Reset zwischen Tests.**
`afterEach`: `database.remove()` löscht die RxDB-Instanz inkl. IndexedDB-State; `_resetDatabaseForTests()` aus `database.ts` setzt das Modul-Singleton zurück. `globalThis.fetch` wird auf den Original-Wert zurückgesetzt, damit andere Tests nicht beeinflusst werden.

**I. Verlässliche Async-Stabilisierung statt blinder Sleeps.**
Der Test wartet auf `replication.events.awaitInSync()` (RxDB-Standard) statt fester Timeouts. Damit ist der Test deterministisch reproduzierbar und vermeidet die in CLAUDE.md §6 verbotene Flakiness.

**J. Doc-Updates.**
`architecture.md` § Sync wird um den Test-Stack ergänzt; `README.md` Phase-Badge wechselt auf `M5b-erledigt` (M5b komplett); `CHANGELOG.md` erhält den Sub-Schritt-Eintrag mit den vier ADR-Detailpunkten; `docs/fahrplan.md` setzt M5b.4 auf `[ERLEDIGT]` und propagiert den Edge-Case-Übertrag in M5c.

### Ergebnis
- **Frontend-Replication-E2E-Test** in `frontend/tests/replication.e2e.test.ts` mit drei Szenarien: (1) `offline → 3 application inserts → reconnect → mock backend hat genau drei rows`, (2) `re-trigger replication → keine Doppelten`, (3) `pull-after-reconnect repliziert Server-Master-Werte zurück in RxDB`.
- **Backend-Idempotenz-Test** in `backend/tests/test_sync_idempotency.py`: drei wiederholte Pushes → 1 Row, 1 EventParticipant, stable `sequence_no`.
- **Coverage Frontend** für `lib/rxdb/**`: Ziel ≥ 80 %, gemessen via `pnpm test -- --coverage`.
- **Backend-Suite** weiterhin grün (125 + neue Idempotenz-Tests).
- **Edge-Cases ADR-034 §K** explizit nach M5c überstellt, dort als Pflicht-Deliverable hinterlegt.

### Verworfene Alternativen
- **A1 — Playwright + headless Chromium:** Würde Browser-Binary (~150 MB), CI-Job-Erweiterung und ~30 s/Test in den MVP zwingen, ohne dass eine M5b.4-spezifische Lücke bliebe. architecture.md hatte Playwright bewusst auf Phase 2 verschoben.
- **A3 — Backend-Only-Test ohne Frontend-Coverage:** Verfehlt das Akzeptanzkriterium „Coverage Sync-Pfade ≥ 80 % (Frontend + Backend)" und lässt `replication.ts` ungetestet — der Test würde genau das nicht prüfen, wofür er da ist.
- **B2 — `@vitest/coverage-istanbul`:** Robuster bei Source-Map-Edge-Cases, aber ~50 % langsamer und liefert für reine TS-Files keinen Mehrwert gegenüber V8-Native. Bei späteren Tooling-Problemen jederzeit wechselbar.
- **B3 — Verzicht auf Coverage-Reporter, manuelle Test-Mapping-Tabelle:** Verfehlt CLAUDE.md §9 („konkrete Zahl, nicht ‚ausreichend'") und gibt CI keinen Schutz gegen Coverage-Regression.
- **C1 — Offline-Insert-Edge-Case in M5b.4 mitnehmen:** Architekturänderung (Detail-Page Client-only) wäre freigabepflichtig (CLAUDE.md §4.1) und überschreibt den Test-/Doku-Scope von M5b.4 deutlich.

### Folge-Arbeit (M5c)
- `(protected)/events/[id]/page.tsx` von Server-Side-Render auf Client-only umstellen, damit Offline-Inserts ohne 404-Race direkt navigierbar sind.
- `event.participants` als reaktive RxDB-Subscription statt Server-Side-Snapshot, sodass Auto-Participants vom ersten Pull-Roundtrip on-the-fly sichtbar werden.

---

## ADR-036 — M5c-Framework + Implementierungsstrategie M5c.1a (Detail-Page Client-only)

**Status:** Accepted
**Datum:** 2026-04-27

### Kontext
M5c (Nachträgliche Erfassung & Bearbeitung) ist als Gesamtmilestone zu groß für einen Sub-Schritt: sieben Deliverables aus dem Fahrplan plus die zwei aus M5b.4 übernommenen Edge-Cases (ADR-035 §C / ADR-034 §K) berühren Architektur, API-Vertrag und Sicherheit zugleich. Diese ADR legt den **Framework-Rahmen für M5c** fest (Sub-Schritt-Aufteilung, Datenpfad-Architektur, Edit-UX) und konkretisiert die **Implementierungsstrategie M5c.1a** als ersten Sub-Schritt — den reinen SSR-Refactor der Detail-Page ohne neue Sync-Collection.

### Framework-Entscheidungen (gelten für M5c.1a–4)

**A. Sub-Schritt-Aufteilung (analog M5a/M5b).**
M5c zerfällt in fünf Sub-Schritte (M5c.1 wurde nach Risikoanalyse in 1a/1b geteilt):

- **M5c.1a — Detail-Page Client-only + REST-Once-Read Participants** (dieser Sub-Schritt). Beendet die SSR-Detail-Page; Participants und `plus_code` kommen weiter über REST `/api/events/{id}`, aber nur als One-Shot-Fetch beim Mount, nicht via SSR. Behebt den 404-Race aus ADR-035 §C im häufigen Fall (Online-Reload nach Offline-Insert), nicht im seltenen Fall (echte Offline-Navigation auf direkt eingefügte Events).
- **M5c.1b — Participants als RxDB-Collection (eigener Sync-Endpoint).** Beendet den 404-Race vollständig: `event_participant` wird sync-fähig (Migration mit `updated_at`/`is_deleted`/Cursor-Index/Cascade), eigene Pull/Push-Endpoints, Frontend-RxDB-Collection, Drift-Test-Erweiterung. M5c.1a setzt damit die Vorbereitung in einem reviewbaren Schritt ohne Migration.
- **M5c.2 — Chronologische Detail-Anzeige + reveal_participants-Maskierung.** Einheitliche `EventDetailView` für laufende und beendete Events, Lücken-Anzeige zwischen Applications, Frontend-Sicherheitsgürtel zusätzlich zur Backend-Maskierung in `app/services/masking.py`.
- **M5c.3 — Nachträgliche Erfassung (Schalter + manuelle Zeitstempel).** Startseiten-Schalter, editierbare `started_at`/`ended_at`-Felder, monotone Zeitvalidierung ohne Sequenz-Überlappung.
- **M5c.4 — Event-/Application-Bearbeitung (Edit-UI).** `/events/[id]/edit`-Pfad, Inline-Application-Edit via Sheet, Soft-Delete via RxDB-Push (gemäß ADR-029 LWW).

**B. Datenpfad: RxDB als Single Source of Truth (Variante B1 aus dem M5c-Vorschlag).**
Detail-Page liest ausschließlich aus RxDB für die in `EventDocType` und `ApplicationDocType` enthaltenen Felder. `plus_code` und `participants` (M5c.1a) werden über einen einmaligen REST-Fetch geholt und nicht reactive — bis M5c.1b die Participants-Sync-Collection einführt. Hybrid-Lesepfade (B2) und REST-Only (B3) verworfen; sie würden die Single-Source-Eigenschaft der M5b-Sync-Architektur aufbrechen.

**C. Mutations-Datenpfad: RxDB-Push (Variante C1).**
Edits gehen ausschließlich über RxDB-Push, mit den ADR-029-LWW-Regeln. Die in M3 erstellten REST-PATCH-Endpoints (`PATCH /api/events/{id}`, `PATCH /api/applications/{id}`) bleiben für SQLAdmin/Admin-UI erhalten, werden aber vom Frontend nicht mehr genutzt. Dadurch ist Offline-Bearbeitung „kostenlos" und der Schreibpfad bleibt einheitlich.

**D. Edit-UX: dedizierte Route `/events/[id]/edit` (Variante D1).**
`architecture.md` § Routing sieht den Pfad bereits vor. Detail-Page bleibt read-only-View, Edit-Variante ist eine eigene Route mit eigenem Form-State. Vermeidet doppelte Komponentenlogik und macht den State testbarer als ein Inline-Toggle.

**E. Backend-Anpassungen: Participants als RxDB-Collection (Variante E3, nur in M5c.1b).**
Die saubere Lösung für reactive Participants ist eine eigene Sync-Collection — identisches Muster wie `events`/`applications` aus M5b.2. M5c.1b adressiert die Migration (`event_participant` bekommt `id` (surrogate UUID), `updated_at`, `is_deleted`, `deleted_at`, Cursor-Index, Cascade-Trigger Event→Participants), das Pydantic/JSON-Schema-Paar, Pull/Push-Routen, RLS-Policy, Drift-Test. Das ist freigegeben, aber nicht Teil von M5c.1a.

### M5c.1a — Konkrete Implementierungsstrategie

**F. Page als Client Component.**
`(protected)/events/[id]/page.tsx` wird `"use client"`. Kein `getServerMe()` mehr — stattdessen `useMe()` aus `lib/auth.ts` (TanStack-Query-Hook, der `/api/users/me` befragt). Loading-State bis User aufgelöst ist, dann je nach Auth-Zustand entweder Skeleton, Login-Redirect oder echter Render.

**G. Drei Datenquellen, ein Render-Baum.**
- `useEventDoc(id)` — RxDB-Subscription auf `database.events.findOne(id).$`. Gibt `EventDocType | null` plus `resolved`-Flag zurück (so können wir „RxDB hat ja noch nicht angetwortet" von „RxDB hat nichts gefunden" unterscheiden).
- `useEventDetailFetch(id)` — One-Shot REST-Fetch via `apiFetch<EventDetail>` mit Status `"loading" | "ok" | "not-found" | "error"`.
- `useMe()` — bestehender Auth-Hook.

**H. Render-Entscheidungsbaum.**
1. `me.isPending` → Skeleton.
2. `me.data === null` → Login-Redirect via `window.location.replace`.
3. RxDB nicht resolved UND REST loading → Skeleton.
4. RxDB null UND REST 404 → `notFound()`.
5. REST ok → übergibt `EventDetail` an `LiveEventView` / `EndedEventView` (existierende Komponenten, unverändert).
6. REST not-found ODER REST error UND RxDB hat doc → synthetisiert `EventDetail` aus dem RxDB-Doc mit `plus_code = ""` und `participants = []`. Damit ist der Offline-Insert-Fall gerendert; Participants und Plus-Code holt M5c.1b nach.

**I. Keine Architektur- oder Datenmodell-Änderung in M5c.1a.**
- Keine neuen Routen.
- Keine Schema-Migrationen.
- Keine neuen Dependencies.
- Keine neuen Sync-Collections.
- Bestehender Backend-Code bleibt unberührt.
- Live-Modus-Verhalten unverändert (LiveEventView und EndedEventView werden weiter benutzt).

**J. Tests.**
- Frontend-Component-Test (`tests/event-detail-page.test.tsx`): vier Szenarien — Loading, REST-OK, RxDB-Fallback nach REST-404, Hard-404.
- Bestehende Test-Suite bleibt grün; Coverage `lib/rxdb/**` aus M5b.4 bleibt aktiv (≥ 80 % CI-Threshold).
- E2E-Erweiterung in `replication.e2e.test.ts` ist bewusst nicht Teil von M5c.1a — sie macht erst mit M5c.1b (Participants in RxDB) wirklich Sinn.

**K. Edge-Cases bewusst akzeptiert (für M5c.1b):**
- Bei Offline-Insert + direkter Navigation **ohne** Server-Roundtrip dauerhaft: Participants bleiben leer (keine reaktive Update-Quelle bis M5c.1b), Plus-Code bleibt leer (Backend-generiert). Acceptable, weil der Offline-Insert-Pfad bisher 404 lieferte; jetzt rendert er das Event.
- Reactive Participants-Update bei Backend-Auto-Participant-Trigger ist bis M5c.1b nicht möglich — dafür braucht es die Sync-Collection.

### Begründung der Aufteilung 1a/1b
Die Risiko-Note in der M5c-Empfehlung („Nicht-trivialer Refactor in M5c.1: Server→Client + neue Sync-Collection in einem Sub-Schritt") wurde durch die Codebase-Inspektion bestätigt: Die SSR-Entfernung allein hat zwölf bis fünfzehn Render-Pfad-Konsequenzen (Skeleton, Auth-Loading, REST-Failure-Handling, Hard-404). Eine Sync-Collection mit eigener Migration und neuer RLS dazu zu legen, würde die PR-Größe verdoppeln und den Review erschweren. M5c.1a liefert den Architektur-Refactor isoliert; M5c.1b folgt mit der Migration als zweiter Schritt.

### Verworfene Alternativen
- **B2 / B3:** würden den Live-Modus-Reactive-Pfad aus M5b.3 brechen oder eine zweite Datenquelle in einer Komponente einführen.
- **C2:** würde Offline-Bearbeitung verbieten und zwei Mutation-Quellen schaffen.
- **D2 (Inline-Edit):** verdoppelt die Komponentenlogik der Detail-Page.
- **E1 (gar keine Backend-Änderung):** Participants blieben dauerhaft nicht reactive, der Auto-Participant-Trigger würde nie sichtbar.
- **E2 (Soft-Delete-REST-Endpoint statt Sync-Push):** zweigleisige Mutation-Quelle, widerspricht ADR-029.
- **Denormalisierte `participant_ids: list[uuid]` auf `EventDoc`:** kürzere Migration, aber mischt Concerns und macht künftige Participant-Properties (z. B. Beitrittszeit, geladen_durch) zu Event-Schema-Änderungen. Bleibt als „letzte Reserve", falls E3 in M5c.1b zu sperrig wird.

### Folge-Arbeit (M5c.1b)
- Migration `event_participant`: surrogate `id uuid` PK, `updated_at`, `is_deleted`, `deleted_at`, `(updated_at, id)`-Cursor-Index, Cascade-Trigger Event→Participants beim Soft-Delete.
- Pydantic `EventParticipantDoc` + JSON-Schema, Pull/Push-Routen `/api/sync/event-participants/{pull,push}`.
- RLS-Policy für `event_participant`-Sync (Member sieht eigene Participants des Events).
- Frontend-RxDB-Collection `event_participants`, Replication-Eintrag in `lib/rxdb/replication.ts`.
- Detail-Page von REST-One-Shot auf RxDB-Subscription für Participants umstellen.
- Drift-Test um die neue Collection erweitern.

---

## ADR-037 — Implementierungsstrategie M5c.1b (Participants als RxDB-Sync-Collection)

**Status:** Accepted
**Datum:** 2026-04-27

### Kontext
M5c.1a hat die Detail-Page client-only gemacht; `participants` und `plus_code` werden weiter über einen REST-One-Shot geholt, sind also nicht reactive. Das ADR-035-§C-Akzeptanzkriterium („`event.participants` als reaktive RxDB-Subscription, sodass Auto-Participants vom ersten Pull-Roundtrip on-the-fly sichtbar werden") wird in M5c.1b erfüllt: Die Junction-Tabelle `event_participant` wird sync-fähig.

### Entscheidungen

**A. Surrogate UUID-PK auf `event_participant`.**
RxDB-Collections brauchen einen einzigen String-PK. Die bestehende Composite-PK `(event_id, person_id)` wird durch eine neue Spalte `id uuid` ersetzt; die Eindeutigkeit bleibt über einen UNIQUE-Constraint auf `(event_id, person_id)`. ORM-Code, der bisher `session.get(EventParticipant, (event_id, person_id))` nutzt, wird auf `select(EventParticipant).where(event_id=…, person_id=…)` umgestellt (drei Aufrufstellen: `app/sync/services.py`, `app/services/events.py`, `app/services/applications.py`).

**B. Soft-Delete + Cursor-Felder analog ADR-030.**
`updated_at timestamptz NOT NULL DEFAULT clock_timestamp()`, `is_deleted boolean NOT NULL DEFAULT false`, `deleted_at timestamptz NULL`. Cursor-Index `(updated_at, id)` für `GET /api/sync/event-participants/pull`. Backfill `updated_at = COALESCE(updated_at, created_at)` für bestehende Rows. Der bestehende `set_updated_at()`-Trigger (M1) wird auf `event_participant` ausgedehnt, damit jede Modifikation den Cursor bumpt.

**C. Cascade-Trigger erweitert.**
`cascade_event_soft_delete()` aus M5b.1 hat bisher nur `application` mitgenommen. Die Funktion wird so erweitert, dass beim Soft-Delete eines Events auch die nicht-gelöschten `event_participant`-Rows desselben Events auf `is_deleted = true` gesetzt werden. Restore (true→false) propagiert weiterhin nicht.

**D. Pull-only Replication.**
`event_participant` ist eine derived Junction-Tabelle: Inserts entstehen serverseitig durch den Auto-Participant-Trigger (ADR-012, beim Application-Push), Deletes laufen entweder über das bestehende REST-Endpoint `DELETE /api/events/{id}/participants/{person_id}` oder den Cascade beim Event-Soft-Delete. Es gibt keinen sinnvollen Frontend-Push-Pfad in M5c.1b. Daher: **Pull-only**, kein `/push`-Endpoint. RxDB-`replicateRxCollection` lässt das `push`-Feld weg. Falls M5c.4 (Bearbeitung) Frontend-getriebenes Hinzufügen/Entfernen will, wird Push dort nachgezogen — die Server-RLS lässt das zu, wir würden nur Wire-Schema und Service ergänzen.

**E. Hybrid-Name-Resolution: RxDB für Mitgliedschaft, REST für Person-Details.**
Die `EventParticipantDoc`-Wire-Form trägt nur `id`, `event_id`, `person_id`, plus die Sync-Standardfelder (`created_at`, `updated_at`, `deleted_at`, `_deleted`). Person-Details (`name`, `alias`) werden weiter über den bestehenden `EventDetail`-REST-Aufruf geholt, weil `Person` in M5c.1b **nicht** in eine RxDB-Collection promotet wird (das wäre eigener Sub-Schritt mit eigener RLS-Diskussion).

Konsequenz: Die Detail-Page subscribet auf `event_participants.find({event_id, _deleted=false}).$` als Quelle der Wahrheit für die **Mitgliedschaft** und nutzt den REST-Snapshot als Lookup-Tabelle für **Namen**. Sobald die RxDB-Subscription eine person_id liefert, die der REST-Snapshot nicht kennt (Auto-Participant nach Reconnect), triggert ein useEffect ein einmaliges REST-Refetch von `EventDetail`.

Damit ist der Akzeptanz-Pfad „Offline-Application-Insert → Reconnect → Auto-Participant erscheint reactive in der Detail-Page" geschlossen, ohne `Person` in die Sync-Schicht zu ziehen.

**F. RLS-Policies bleiben unverändert.**
Die in M2 (Migration `20260425_1730_strict_rls`) angelegten Policies — `event_participant_admin_all`, `event_participant_member_select` (über `app_user_can_see_event`), `event_participant_editor_modify` — passen unverändert. Der Pull-Endpoint nutzt `get_rls_session`, sodass Member nur ihre sichtbaren Participants bekommen.

**G. JSON-Schema + Pydantic parallel zu ADR-031.**
`backend/app/sync/schemas.py` bekommt `EventParticipantDoc` und `EventParticipantPullResponse`. Die Wire-Form-Datei liegt unter `frontend/src/lib/rxdb/schemas/event_participant.schema.json`. Der bestehende Drift-Test (`backend/tests/test_rxdb_schema_drift.py`) wird um die dritte Collection erweitert.

**H. Frontend-RxDB-Collection ohne Push-Handler.**
`lib/rxdb/types.ts` bekommt `EventParticipantDocType`, `lib/rxdb/schemas.ts` den neuen Schema-Wrapper, `lib/rxdb/database.ts` die Collection. `lib/rxdb/replication.ts` ergänzt einen dritten Replication-Eintrag mit nur `pull`-Konfiguration; die aggregierten `idle | active | offline | error`-Status-Streams nehmen den neuen Replicator mit auf.

**I. Detail-Page-Anpassung.**
`useEventParticipantIds(eventId)` (RxDB-Subscription) ersetzt die statische `participants`-Liste auf der Page. Aus dem RxDB-Result wird ein `Set<string>` von person_ids gebaut. Die Page kombiniert die Live-IDs mit dem REST-Snapshot zu einer `participants: PersonRead[]`-Ableitung; fehlt eine ID im Snapshot, wird ein REST-Refetch angestoßen.

**J. Bundle- und Performance-Annahmen.**
Die neue Collection ist klein (drei Feld-Properties + Sync-Standard); Bundle-Auswirkung erwartet < 1 KB. Cursor-Pull ist O(log N) durch den neuen Index.

**K. Tests.**
- Backend: Migration-Test für die neuen Trigger (Cascade-Trigger-Erweiterung, set_updated_at), Pull-Endpoint-Tests (Cursor, Tombstones), RLS-Test (Member sieht nur eigene Events), Drift-Test-Erweiterung.
- Frontend: Component-Test der RxDB-Subscription, Erweiterung der `replication.e2e.test.ts` um den Auto-Participant-Roundtrip (Application offline → Reconnect → EventParticipant erscheint).
- Coverage-Threshold `lib/rxdb/**` bleibt aktiv (≥ 80 %).

### Verworfene Alternativen

- **Push-Endpoint mit `_deleted`-Toggle:** Würde M5c.4-Funktionalität vorziehen, ohne klare RLS-Validierung der Insert-Branch (dort ginge es nicht über den Auto-Participant-Trigger). Bewusst auf M5c.4 verschoben.
- **Person als RxDB-Collection in M5c.1b mitnehmen:** Hätte vollständig reaktive Names ermöglicht, aber öffnet eine eigene RLS-Diskussion (Person ist global sichtbar, Maskierungs-Logik aus `app/services/masking.py` müsste abgebildet werden) und sprengt den Sub-Schritt. Verlagert nach M5c.2 oder einen späteren Zeitpunkt.
- **`participant_ids: list[uuid]` direkt auf `EventDoc` denormalisieren:** Hätte ohne neue Collection auskommen, mischt aber Concerns und macht künftige EventParticipant-Properties (Beitrittszeit, geladen_durch, Linkable-Status) zu Event-Schema-Änderungen — die RxDB-Replication-Architektur ist explizit row-orientiert (ADR-030).
- **Composite-PK behalten + RxDB-Schlüssel synthetisieren (z. B. `${event_id}__${person_id}`):** Funktional, aber gegen die Konventionen von M5b und schwer mit `id`-Indizes/-Joins zu kombinieren. Surrogate-PK ist die saubere Lösung.

### Folge-Arbeit

- M5c.2: Detail-Page-Refresh als unified `EventDetailView` (laufend + beendet), `reveal_participants`-Maskierung im Frontend.
- M5c.4: bei Bedarf Push-Endpoint für `event_participant` (ADR-036 §E2-Variante), wenn Editor/Admin die Teilnehmer-Liste manuell editieren sollen.
- Mittelfristig (kein eigener Sub-Schritt geplant): Person als RxDB-Collection, sobald die Maskierungs-Logik vom Backend-Service in einen Wire-Format-äquivalenten Pfad übersetzt ist.

---

## ADR-038 — Implementierungsstrategie M5c.2 (EventDetailView, Lücken-Anzeige, Frontend-Maskierung)

**Status:** Accepted
**Datum:** 2026-04-27

### Kontext
M5c.1a/1b haben die Detail-Page client-only und reactive gemacht; die eigentliche Detail-Anzeige hängt aber noch an der M5a.3-Aufteilung in `LiveEventView` (laufend) und `EndedEventView` (Stub). M5c.2 liefert das Fahrplan-Akzeptanzkriterium „Event-Detailseite mit chronologischer Anzeige aller Applications inkl. Lücken zwischen ihnen" und „Respektiert `reveal_participants`: zeigt ‚+N weitere‘ statt Namen, wenn Flag false".

### Entscheidungen

**A. Eine einheitliche `EventDetailView` ersetzt `LiveEventView` + `EndedEventView`.**
Datei `frontend/src/components/event/event-detail-view.tsx` (neu); `live-event-view.tsx` wird gelöscht. Die neue Komponente orchestriert dieselben drei Abschnitte für laufende **und** beendete Events:
1. Status-Card (Standort, Plus-Code, Live-Timer wenn laufend, Quick-Actions nur wenn `isLive`).
2. Applications-Timeline (chronologische Liste, Lücken-Visualisierung).
3. Beteiligte (Participants-Liste mit Frontend-Maskierung).

**B. Lücken-Anzeige zwischen Applications.**
Zwischen `app[i].ended_at` und `app[i+1].started_at` wird ein dünnes „Lücke" -Element gerendert, wenn die Lücke ≥ 1 Sekunde beträgt. Die Lücke trägt die Dauer (gleicher `formatDuration`-Helper wie sonst) und einen leichten visuellen Trenner, sodass „Materialwechsel"-Phasen erkennbar werden. Lücken erscheinen nur zwischen vollständig beendeten Applications — laufende oder noch nicht-gestartete Applications produzieren keine Lücke.

**C. Frontend-Maskierungs-Helper als Sicherheitsgürtel.**
Neue Datei `lib/masking.ts` mit `maskParticipants(participants, event, currentPersonId)`. Die Logik spiegelt `backend/app/services/masking.py`:
- `event.reveal_participants === true` → unverändert.
- Person mit `id === currentPersonId` → unverändert.
- Sonst → `name = "[verborgen]"`, `alias = null`, `note = null`.
Der Backend-Pfad maskiert weiterhin als primäre Schicht; der Frontend-Helper läuft beim Render und greift auch dann, wenn:
- Eine veraltete REST-Snapshot-Antwort im TanStack-Query-Cache liegt, die noch nicht das aktualisierte `reveal_participants=false` reflektiert.
- Künftige Code-Pfade (z. B. Person-RxDB-Collection in einem späteren Sub-Schritt) Person-Daten ohne Backend-Maskierung liefern.
Konstante `PLACEHOLDER = "[verborgen]"` deckungsgleich zum Backend.

**D. Maskierte Anzeige in der ParticipantsList.**
Die Teilnehmer-Liste rendert pro Person: Name (oder Placeholder), Alias-Zeile (nur wenn vorhanden), und ein „Du"-Badge für den eigenen Eintrag. Maskierte Einträge werden visuell zurückgenommen (italics + muted color) und nicht klickbar. Die Frage „+N weitere statt Namen" aus dem Fahrplan ist damit implizit erfüllt: Wenn drei Beteiligte alle bis auf den Anwender maskiert sind, sieht man drei Einträge mit `[verborgen]` als Label — die Anzahl bleibt sichtbar, die Namen nicht.

**E. Keine Backend-Änderungen, keine neuen Endpoints.**
Backend-Maskierung in `app/services/masking.py` bleibt unverändert; sie ist die primäre Sicherheitsschicht. Auch der `mask_event_view`-Helper im REST-Detail-Endpoint bleibt wie er ist.

**F. Tests.**
- `tests/masking.test.ts` für die neue Pure-Funktion (vier Fälle: reveal=true, reveal=false-Self, reveal=false-Other, leere Liste).
- `tests/event-detail-view.test.tsx` für die neue Komponente: Status-Card-Rendering, Live-Action-Card-Sichtbarkeit (laufend vs. beendet), Lücken-Visualisierung, Participants-Maskierung.
- `tests/event-detail-page.test.tsx` Mock-Update auf den neuen Komponenten-Namen.
- `replication.e2e.test.ts` und `tests/sync-status-indicator.test.tsx` bleiben unverändert.
- Coverage `lib/rxdb/**` bleibt aktiv; neuer Coverage-Block für `lib/masking.ts` wird nicht eingeführt — der Threshold-Block deckt Sync-Pfade, nicht alle Lib-Dateien.

**G. Migration der Hooks.**
`useEventDoc`, `useApplications` und `pickRecipientPerson` ziehen mit in `event-detail-view.tsx`. `LiveEventViewProps` wird zu `EventDetailViewProps`. `page.tsx` ändert nur den Import + die JSX-Verwendung; der bisherige `EndedEventView`-Inline-Stub wird entfernt.

### Verworfene Alternativen

- **`LiveEventView` parallel behalten und nur `EndedEventView` auf die neue Detail-View umlenken:** Doppelte Quelle der Wahrheit für die Application-Liste — bei späterem Drift unweigerlich Inkonsistenz.
- **„+N weitere"-Aggregat statt einzelner Maskierungen:** Spart einen Listeneintrag pro Verborgenem, verschleiert aber die tatsächliche Beteiligten-Anzahl. Die per-Eintrag-Maskierung ist transparenter und passt zum Backend-Verhalten („Anzahl bleibt, Inhalt nicht").
- **Frontend-Maskierung in der Komponente statt in `lib/masking.ts`:** Erschwert Tests und macht das Wiederverwenden in M5c.4 (Edit-UI) und M6 (Map-Popup) später aufwändiger.

### Folge-Arbeit

- M5c.3 (Nachträgliche Erfassung) nutzt dieselbe `EventDetailView` als Read-Pfad nach dem Speichern.
- M5c.4 (Edit-UI) ergänzt einen separaten Edit-Pfad `/events/[id]/edit`; `EventDetailView` bleibt Read-only.
- M6 (Karte) kann den `maskParticipants`-Helper im Popup-Renderer wiederverwenden.

---

## ADR-039 — Implementierungsstrategie M5c.3 (Nachträgliche Erfassung)

**Status:** Accepted
**Datum:** 2026-04-27

### Kontext
Der Live-Modus (M5a.3) ist die primäre Erfassungsansicht; nachträgliche Erfassung wurde von Anfang an als sekundärer Modus gescoped (ADR-011, Fahrplan §M5c). M5c.3 schließt diese Lücke: Events ohne GPS-now-Workflow erfassen können, mit selbst gesetzten Zeitstempeln für Event und Applications.

### Entscheidungen

**A. Eigene Route `/events/new/backfill` statt Query-Param.**
Der Live-Pfad bleibt unverändert auf `/events/new`. Die nachträgliche Erfassung bekommt einen eigenen Pfad, weil das Form-Verhalten (editierbare Zeitstempel, mehrere Applications direkt im Submit) deutlich abweicht. Sauberer Test-Anker (`event-backfill-form.test.tsx`), klare Navigation, kein konditionaler Render-Pfad in einer Datei.

**B. Eigene Komponente `EventBackfillForm`.**
Datei `frontend/src/components/event/event-backfill-form.tsx` (neu); `EventCreateForm` bleibt als Live-Form unangetastet. Doppelter Code für die Cards (Standort, Recipient) ist akzeptabel — beide Formulare könnten in M5c.4 oder später zu einem gemeinsamen Form-Skelett zusammengeführt werden, falls die Pflege der zwei Formulare lästig wird. Aktuell überwiegt die Klarheit pro Form.

**C. Zeitstempel-Inputs als HTML5 `datetime-local`.**
Standard-Browser-Widget, keine zusätzliche Dependency. Kommt mit Mobile-Datepickern auf iOS/Android gratis. Konvertierung zu/von ISO-8601 in der Form-Logik. Edge-Case: Browsern, die `datetime-local` nicht unterstützen, fällt das Widget auf ein Text-Feld zurück — akzeptabel für die kleine Pfad-A-Gruppe.

**D. Application-Erfassung als wachsende Liste.**
Innerhalb des Backfill-Forms ist eine Liste von Applications, jede mit `started_at`, `ended_at`, `recipient`, `note`. Ein „+ Application hinzufügen"-Button hängt eine leere Zeile an; ein „Entfernen"-Button (Trash-Icon) löscht eine Zeile. Mindestens null Applications erlaubt (manche Events sind nur Marker ohne Sequenz).

**E. Submit-seitige Validierung mit inline-Fehlermeldungen + Toast-Zusammenfassung.**
Zwei Ebenen:
1. **Pflichtfelder:** Standort gesetzt, Event-`started_at` gesetzt; pro Application: `started_at` + Recipient.
2. **Konsistenz:**
   - Event: `ended_at >= started_at`, falls beide gesetzt.
   - Applications: `ended_at >= started_at`, falls beide gesetzt.
   - Applications: `started_at >= event.started_at` und `ended_at <= event.ended_at`, falls beide Event-Grenzen gesetzt.
   - Applications: nicht-überlappend in Reihenfolge ihrer `started_at`. `app[i].ended_at <= app[i+1].started_at`. Bei Verletzung: präzise Zeile + Lücke benannt.
Validierung läuft synchron im Submit-Handler, nicht reactive — ergibt klare Toast-Sammelmeldung („3 Probleme: …") plus per-Zeile-Markierung.

**F. Server-vergebene `sequence_no`.**
Der Client sortiert die Applications beim Submit nach `started_at` und sendet sie mit lokaler `sequence_no = index+1`. Backend überschreibt die Nummer wie immer (ADR-029 §sequence_no). Heißt: die UI zeigt ein „Nr."-Label nicht — die Reihenfolge ergibt sich beim Speichern aus der `started_at`-Sortierung.

**G. Schreibpfad: dieselbe RxDB-Insertion wie Live.**
`database.events.insert(...)` mit den editierten Zeitstempeln, dann sequenziell `database.applications.insert(...)` pro Anwendung. Auto-Participant-Trigger und Sync-Replication funktionieren unverändert. Offline-Fähigkeit kommt damit kostenlos: Backfill-Inserts landen erst in IndexedDB, dann beim nächsten Push auf dem Server.

**H. Dashboard-Schalter.**
Auf der Startseite (`(protected)/page.tsx`) wird der bestehende „Neues Event starten"-Button als primärer Call-to-Action belassen; daneben kommt ein sekundärer Button „Nachträglich erfassen" mit ghost/secondary-Variante. Roll-out-Sichtbarkeit für Editor und Admin (analog Live-Form); Viewer sehen den Schalter nicht.

**I. Bestehende Routen unverändert.**
Keine Backend-Änderung, keine API-Vertragsänderung. Backend RLS und Sync-Push akzeptieren Events mit beliebigen Zeitstempeln (ADR-029 §immutable-after-create — der erste Push fixiert; spätere Edits sind M5c.4-Territorium).

**J. Tests.**
- `tests/event-backfill-form.test.tsx`: Pflichtfeld-Validierung (Standort fehlt, started_at fehlt), Konsistenz-Validierung (`ended_at < started_at`, App-Überlappung), erfolgreicher Submit-Flow mit zwei Applications (verifiziert RxDB-Insertion und sortierte sequence_no), Recipient-Default (Self-Bondage wenn Recipient leer).
- Dashboard-Test (`tests/dashboard-buttons.test.tsx` — neu): die zwei Buttons existieren für Editor/Admin, fehlen für Viewer. Falls die Snapshot-Pflege zu sperrig wird, kann dieser Test auch entfallen — der Live-Button-Pfad ist bereits implizit getestet.

**K. Validierungs-Helper als reine Funktion.**
`lib/event-backfill-validation.ts`: `validateBackfill(input): { valid: true } | { valid: false; errors: BackfillError[] }`. Trennt Validierung von der Komponente — testbarer und in M5c.4 (Edit-UI) wiederverwendbar.

### Verworfene Alternativen

- **Mode-Prop auf `EventCreateForm`:** Hätte einen Toggle in einer Komponente erfordert, mit konditionalen Inputs und Submit-Pfaden. Schnell unübersichtlich. Eigene Komponente bleibt schlanker.
- **react-hook-form + zod:** Beide Bibliotheken sind bereits Deps, würden aber das bestehende `EventCreateForm`-Pattern (raw `useState` + Submit-Validierung) brechen. Konsistenz schlägt Eleganz hier.
- **Custom Calendar-Picker-Lib:** Neuer Dev-Dep nicht gerechtfertigt für eine niedrigfrequente Erfassung. Browser-natives `datetime-local` reicht.
- **Sequenz-Editor mit Drag-and-Drop:** Über-engineered. Beim Submit nach `started_at` sortieren ist deterministisch und scheidet Anwender-Fehlbedienung aus.

### Folge-Arbeit

- M5c.4 (Bearbeitung) kann den `validateBackfill`-Helper für die Edit-UI wiederverwenden.
- Spätere UI-Iteration kann `EventCreateForm` und `EventBackfillForm` zu einem gemeinsamen Skelett zusammenfassen, sobald die Anforderungen stabilisiert sind.

---

## ADR-040 — Implementierungsstrategie M5c.4 (Edit-UI mit RxDB-Push, Soft-Delete, RBAC)

**Status:** Accepted
**Datum:** 2026-04-27

### Kontext
M5c.1–M5c.3 haben Read-Pfad und Backfill-Anlage abgedeckt; M5c.4 schließt M5c mit der Bearbeitung bestehender Events und Applications. Mutationen laufen gemäß ADR-036 §C ausschließlich über RxDB-Push; die in M3 erstellten REST-PATCH-Endpoints bleiben für SQLAdmin/Admin-Workflows erhalten, werden aber vom Frontend nicht mehr genutzt.

### Entscheidungen

**A. Eigene Route `/events/[id]/edit` (ADR-036 §D bestätigt).**
`(protected)/events/[id]/edit/page.tsx` neu; Detail-Page bleibt read-only. Der Edit-Pfad spiegelt das Routing aus `architecture.md` § Routing („/events/[id]/edit — Bearbeiten"). RBAC-Gate via Server-Redirect: anonyme User → `/login?next=…`; Viewer → `/?error=role`; Editor mit fremdem Event → `/events/{id}` (Read-only-Detail).

**B. RBAC-Helper `canEditEvent(user, event)` als reine Funktion.**
`frontend/src/lib/rbac.ts` (neu) liefert `canEditEvent({ role, id }, { created_by })`:
- `role === "admin"` → `true`.
- `role === "editor"` und `created_by === user.id` → `true`.
- sonst → `false`.
Gleiche Logik landet im Edit-Button-Conditional auf der Detail-Page **und** im Server-Redirect der Edit-Page. Eine reine Funktion macht beide Pfade testbar und konsistent.

**C. Editierbare Felder folgen ADR-029 (Conflict-Resolution).**
Nicht alle Felder sind editierbar — die in ADR-029 als `immutable-after-create` markierten bleiben read-only:
- **Event editierbar:** `note` (LWW), `reveal_participants` (LWW), `ended_at` (FWW — nur setzbar, wenn aktuell `null`).
- **Event read-only:** `lat`, `lon`, `started_at`, `created_by`, `created_at`, `updated_at`.
- **Application editierbar:** `note` (LWW), `recipient_id` (LWW), `ended_at` (FWW — nur setzbar, wenn aktuell `null`).
- **Application read-only:** `started_at`, `event_id`, `sequence_no`, `performer_id` (Performer-Wechsel ändert Semantik „wer hat es gemacht" zu stark; bewusst nicht in M5c.4), Position-FKs (`arm_position_id`, `hand_position_id`, `hand_orientation_id`) — UI-Komplexität bei drei Katalog-Pickern; Schritt für M6/M7 oder einen späteren Sub-Schritt.
Die Position-FKs sind technisch LWW per ADR-029, werden aber **nicht** im Edit-UI exponiert — `_deleted` und neu setzen ist der Pfad, falls Korrektur nötig wird. Dokumentiert in §C, sodass der Scope explizit ist.

**D. Soft-Delete via `doc.patch({ _deleted: true })`.**
Sowohl Event- als auch Application-Soft-Delete erfolgen direkt über die RxDB-Mutation (nicht über REST DELETE). Cascade-Trigger (`cascade_event_soft_delete`, ADR-030/ADR-037 §C) sorgt server-seitig dafür, dass Applications und EventParticipants automatisch tombstoned werden, sobald das Event-Tombstone synchronisiert ist. Restore (`true → false`) ist Admin-only per ADR-029 und in M5c.4 **nicht** im UI exponiert — der Pfad ist absichtlich asymmetrisch (Löschen einfach, Wiederherstellen bewusst Hürde).

**E. Confirmation via `window.confirm`.**
Bewusste Reduktion: Pfad-A-Gruppe ist <20 User, native Browser-Bestätigung ist barrierefrei und kostet keine neue UI-Library. Eine schicke Custom-Dialog-Komponente kann später in einer UI-Iteration nachgelegt werden, ohne die Edit-Logik zu ändern. Im Code: `if (!window.confirm("Event endgültig löschen?")) return;`. Umgehbarer Edge-Case (User dismisst): klar dokumentiert, keine Datenverluste.

**F. Submit-Pfad: Diff-basiertes Patchen.**
`EventEditForm` lädt Event und Applications einmal aus RxDB beim Mount in lokalen State (Single-Read, **keine** Subscription während der Edit-Session, damit gleichzeitige Sync-Pull-Updates die Eingabe nicht clobbern). Beim Submit:
1. Vergleicht lokalen State mit RxDB-Initialwerten.
2. Patch-Calls nur für Docs mit Änderung.
3. Soft-Delete-Aktionen sind separat und sofort (nicht im Submit-Pfad gebündelt) — Click → confirm → `doc.patch({ _deleted: true })` → Liste aktualisiert sich reactive (Application) bzw. Page navigiert weg (Event).

**G. Validierung: `validateBackfill`-Wiederverwendung.**
ADR-039 §K hat das vorausgesehen. Der Edit-Form ruft `validateBackfill` mit den aktuellen Werten auf — `started_at` der Apps und des Events ist immutable, also identisch zu den RxDB-Originalwerten; nur `ended_at` und Recipient ändern sich. Konsistenz-Verstöße (z. B. neuer `ended_at` vor `started_at`, oder ended_at überlappt mit nächster App) werden inline gemeldet. Kein zweiter Validator nötig.

**H. Edit-Button in `EventDetailView`.**
Sichtbar wenn `canEditEvent(user, event)`. Kleines Icon-Button-Trio in der Status-Card-Header-Zeile (oder unter der CardDescription). Routing per `Link` zu `/events/[id]/edit`. `data-testid="edit-event-button"` für Tests.

**I. Tests.**
- `tests/rbac.test.ts` (neu): `canEditEvent` für die drei Rollen + Edge-Case (admin sieht eigene und fremde, editor nur eigene, viewer nie).
- `tests/event-edit-form.test.tsx`: Render mit pre-filled values aus RxDB-Mock; Submit ruft `doc.patch` nur für geänderte Felder; Soft-Delete-Button (mit gemocktem `window.confirm`) ruft `doc.patch({_deleted: true})`; immutable Felder sind read-only oder nicht im DOM.
- `tests/event-detail-view.test.tsx`: Erweiterung um Edit-Button-Sichtbarkeit (Editor own / Editor fremd / Admin / Viewer).
- Coverage `lib/rxdb/**` bleibt aktiv.

**J. Backend bleibt unangetastet.**
Keine neuen Endpoints, keine Migrations, keine RLS-Anpassung. Soft-Delete der Application via Sync-Push triggert das bestehende ADR-029-Verhalten („`_deleted` true ist LWW-Übergang"). Das Cascade-Trigger-Verhalten von M5b.1/M5c.1b deckt Event-Soft-Delete ab.

**K. Position-FK-Editing als bewusste Lücke.**
Wenn ein Editor bemerkt, dass die Position falsch ist, ist der dokumentierte Workaround: Application soft-deleten, neue erfassen. Im Live-Modus ist das zumutbar; im Backfill ohnehin. Eine spätere UI-Iteration kann Position-Picker im Edit-Form nachreichen, sobald die Kategorie-Auswahl-Komponente aus M7 (Katalog-Verwaltung) ausgereift ist.

### Verworfene Alternativen
- **Inline-Edit-Modus auf der Detail-Page** statt eigene Route: doppelt der UI-Komplexität, harder zu testen — ADR-036 §D-Begründung gilt unverändert.
- **Custom-Confirm-Dialog mit shadcn/ui-`Dialog`**: würde eine neue UI-Komponente ergänzen. Für M5c.4-Scope übertrieben; `window.confirm` reicht.
- **Restore-UI für Admin im Edit-Form**: erweitert die Komplexität um eine asymmetrische Operation, die nur einmal im Admin-Workflow gebraucht wird. Bleibt M8 (Admin-Bereich) vorbehalten.
- **Live-Subscription während der Edit-Session**: bringt Race-Condition-Komplexität (gleichzeitige Pulls clobbern Eingaben). Single-Read beim Mount ist robuster.

### Folge-Arbeit
- M8 (Admin-Bereich) bringt Restore-UI für soft-gelöschte Events/Applications.
- Spätere UI-Iteration kann Position-FK-Picker im Edit-Form nachreichen (siehe §K).

---

**Hinweis zur Initialisierungs-Entscheidung:** Die initiale Anpassung der Vorlagen-Dokumente an HC-Map-Komplexität ist in **ADR-009 (Vorgehensmodell: Vision-driven Scoping vor Code)** dokumentiert. Diese ADR übernimmt die Funktion, die in der generischen Vorlage für ADR-001 vorgesehen war.
