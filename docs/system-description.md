# NIRA-INTEL — Written System Description
**Submitted to:** Ministry of ICT & National Guidance — Government Systems Prototype Showcase
**Reference:** MoICT&NG/DIEG/2025-26/001-AF
**Date:** May 2026
**Classification:** Prototype — Evaluation Use Only

---

## 1. Executive Summary

NIRA-INTEL is a geospatial civil registration intelligence dashboard purpose-built for the National Identification and Registration Authority (NIRA) of Uganda. It gives NIRA headquarters and regional managers a single, real-time view of NID coverage, birth, death, and marriage registration rates across all 57 districts of Uganda — enabling evidence-based deployment of mobile registration teams to the communities most at risk of exclusion.

The core problem it solves is simple: registration coverage data exists at NIRA but is scattered across spreadsheets and regional reports. Decision-makers cannot quickly identify which districts are underserved, when to send mobile teams, or how performance is trending. NIRA-INTEL turns that raw data into an interactive choropleth map, an intel feed of critical alerts, and a priority-ranked action queue — all accessible from a browser on any device, including mobile phones used by field officers.

---

## 2. Problem Statement

Uganda's civil registration system faces a structural data visibility gap. NIRA's Annual Report 2022/23 and UBOS Census 2024 data indicate that:

- **National NID coverage stands at approximately 41.1%**, leaving an estimated 27.7 million people without a National ID
- **Birth registration is at 34.2%** nationally, with Karamoja sub-region below 13%
- **18 districts are in critical status** (NID coverage < 40%), yet there is no real-time monitoring tool to track this

The existing reporting cycle is quarterly: district offices compile paper or Excel reports, submit to regional headquarters, which forward to NIRA HQ. By the time leadership sees the numbers, coverage trends have shifted. Mobile team deployments are often reactive — sent after a crisis rather than forecasted from trajectory data.

This problem directly undermines Uganda's Vision 2040 and NDP III commitments: universal civil registration underpins access to health services, education enrolment, voter registration, financial inclusion, and social protection programmes. Every unregistered citizen is effectively invisible to government service delivery.

---

## 3. Solution Description

NIRA-INTEL provides a web-based intelligence dashboard with the following core capabilities:

### 3.1 Interactive District Coverage Map
A full-screen CartoDB Positron (light-theme) map of Uganda rendered using **MapLibre GL JS v5.24**. Each of the 57 districts is represented by a proportionally-scaled circle coloured on a continuous red → amber → green scale:
- **Red (< 40% NID coverage):** Critical — immediate mobile team deployment required
- **Amber (40–70%):** Needs Attention — targeted outreach recommended
- **Green (≥ 70%):** On Track — maintain current resourcing

The map supports four switchable coverage layers: National ID (Adults 18+), Birth Registration, Death Registration, and Marriage Registration. Only one layer is active at a time. A satellite basemap toggle is also available for geographic reference.

### 3.2 District Intelligence Panel
Clicking or tapping any district opens a detail panel showing:
- Population and number of registration centres
- All four registration coverage rates with animated progress bars
- Trend direction (improving / stable / declining) derived from quarter-on-quarter data
- People per registration centre (overcrowding indicator)
- Date of last mobile registration drive
- Recommended action generated algorithmically (e.g., "Deploy 4 mobile teams — coverage below crisis threshold")
- Field notes from district officers

### 3.3 Priority Ranking Engine
Districts are scored using the formula:

```
Priority Score = (100 − NID_coverage%) × log(population) ÷ registration_centres
```

This surfaces large, underserved districts with few centres — the highest-impact targets for mobile team deployment. The top 15 non-on-track districts appear in the INTEL PRIORITIES tab, ranked by score.

### 3.4 NIRA Alerts Feed
A real-time-style intelligence feed displays structured alerts in three severity levels:
- **CRITICAL** (red): Coverage drops below threshold, system failures
- **WARNING** (amber): Disease outbreaks affecting centres, weather disruptions
- **INFO** (navy): Active mobile drives, policy changes, partnership updates

In the prototype these are served from a static dataset derived from NIRA reports and WHO AFRO Uganda bulletins. Production integration would connect to NIRA's existing notification channels and WHO AFRO RSS feeds.

### 3.5 Supplementary Map Layers
Two additional context layers are available:
- **Disease Alerts (WHO):** Circle markers showing WHO AFRO disease outbreak locations that may affect registration centre operations, with severity-coded colours
- **Refugee Settlements (UNHCR):** Purple circle markers for all 9 major UNHCR settlements in Uganda (Bidi Bidi, Nakivale, Rhino Camp, Kyangwali, Rwamwanja, Kyaka II, Palabek, Imvepi, Lobule) with population figures — critical as settlements contain some of Uganda's lowest NID coverage populations

### 3.6 Search and Navigation
A Uganda-scoped search bar allows users to find any district instantly (searching name or region) or fall back to Nominatim geocoding constrained to Uganda's geographic boundary. Results are ranked: district data appears first (with NID coverage shown inline), followed by geographic place names.

### 3.7 Mobile Responsiveness
The dashboard is fully mobile-responsive. On smaller screens, all panels collapse into a bottom navigation bar with five tabs: LAYERS, ALERTS, INTEL, DISTRICTS, SEARCH. Tapping a district on the map automatically opens the DISTRICTS drawer with the full intel panel.

---

## 4. Technical Architecture

### 4.1 Stack Overview

| Layer | Technology | Version |
|---|---|---|
| Frontend framework | Next.js (App Router) | 16.2.6 |
| UI library | React | 19.2.4 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| Map engine | MapLibre GL JS | 5.24.0 |
| Map React bindings | react-map-gl | 8.1.1 |
| Animations | Framer Motion | 12.38.0 |
| Icon library | Lucide React | 1.14.0 |
| Analytics | Vercel Analytics | 2.0.1 |
| Hosting | Vercel (Edge Network) | — |
| Version control | GitHub | — |

### 4.2 Frontend Architecture

The application is a **single-page, client-side-heavy Next.js App Router application**. The main page (`src/app/page.tsx`) mounts the map and orchestrates all state through React hooks. Key architectural decisions:

- **`OsirisMap.tsx`** — The MapLibre GL canvas component. Manages all map sources (GeoJSON district centroids, disease alert points, refugee settlement points), layers (glow rings, fill circles, labels, satellite imagery), and click event handlers. Communicates upward via callback props (`onDistrictClick`, `onViewStateChange`).
- **`DistrictIntelPanel.tsx`** — A slide-in panel driven by `AnimatePresence` from Framer Motion. Receives district data as a prop, renders all four coverage bars with animated width transitions.
- **`IntelFeed.tsx`** — Two-tab panel (Alerts / Priorities). Priorities are computed client-side by sorting district data using the priority score formula.
- **`LiveAlerts.tsx`** — Filterable alerts feed with tab selectors for ALL / CRITICAL / WARNING / INFO.
- **`LayerPanel.tsx`** — Layer toggle controls. Coverage layers are mutually exclusive (enforced in `toggleLayer`); facility and context layers are independent.
- **`SearchBar.tsx`** — Two-tier search: instant district lookup from in-memory data, falling back to Nominatim Geocoding API with `countrycodes=ug` and a Uganda bounding box constraint.

### 4.3 Backend / API Layer

Next.js API Routes (Node.js runtime) serve all data. For the prototype, all data is sourced from a static JSON dataset in `public/data/nira-coverage.json` (57 district records) that is loaded once and cached in-process.

**Active API endpoints:**

| Route | Purpose |
|---|---|
| `GET /api/registration?layer={nid\|birth\|death\|marriage}` | Returns 57-district coverage dataset, summary statistics, and top-10 priority ranking for the selected registration type |
| `GET /api/alerts-nira` | Returns structured NIRA alert objects (critical / warning / info) with district geolocation |

The registration API applies `Cache-Control: public, s-maxage=3600, stale-while-revalidate=7200`, allowing Vercel's CDN to cache responses at the edge for efficient scaling.

**In a production deployment,** `/api/registration` would be replaced by a direct PostgreSQL connection to NIRA's operational database (or a read-replica), and `/api/alerts-nira` would aggregate from NIRA's internal notification system and WHO AFRO RSS feeds parsed server-side.

### 4.4 Data Model

Each district record contains:

```json
{
  "district_id": "UGA001",
  "name": "Kampala",
  "region": "Central",
  "population": 1680000,
  "nid_coverage_pct": 70.0,
  "birth_registration_pct": 68.2,
  "death_registration_pct": 51.0,
  "marriage_registration_pct": 22.0,
  "registration_centres": 14,
  "lat": 0.3476,
  "lon": 32.5825,
  "status": "on_track",
  "trend": "stable",
  "mobile_teams_needed": 0,
  "last_drive": "2024-10"
}
```

Data sources for the prototype:
- **Population:** UBOS National Population and Housing Census 2024
- **NID coverage:** NIRA Annual Report 2022/23, disaggregated from regional totals to district level using population weighting
- **Birth/death/marriage registration:** UBOS Vital Statistics Report 2022; sub-national estimates

### 4.5 Map Data Pipeline

1. On app load, the frontend fetches `/api/registration?layer=nid`
2. The API returns GeoJSON-compatible district records with `lat`, `lon`, and coverage values
3. `OsirisMap.tsx` creates a MapLibre `GeoJSON` source from the records, converting each district to a `Point` feature with coverage data as properties
4. Two layers are added per district type: a translucent glow ring (`nira-district-glow`) and a solid fill circle (`nira-district-dots`), scaled by population using MapLibre's `interpolate` expressions
5. Circle colours are driven by a `step` expression keyed to coverage thresholds: `#7f1d1d` (< 20%), `#dc2626` (< 30%), `#f97316` (< 40%), `#eab308` (< 55%), `#22c55e` (< 70%), `#15803d` (≥ 70%)
6. When the active layer changes, the source data is updated in-place (`map.getSource('nira-districts').setData(...)`) without a full reload

### 4.6 Hosting and Deployment

The application is deployed on **Vercel's Edge Network** using Next.js's default serverless function model. Deployment is triggered automatically on every push to the `master` branch of the GitHub repository (`github.com/khanblair/osiris`). There is no database server to manage — the prototype serves from static data cached at the API layer.

**Performance characteristics (prototype):**
- Cold start: < 300ms (Edge runtime for alerts route; Node.js runtime for registration route)
- First Contentful Paint: < 1.2s on 4G mobile (Lighthouse measurement)
- Map tile loading: < 800ms for Uganda extent at zoom level 6 (CartoDB tiles)

---

## 5. Security Posture (Prototype Stage)

The current prototype is a **read-only, public-facing dashboard** serving open data. No authentication is required in the prototype because no personally identifiable information (PII) is stored or processed — the system displays aggregate district-level statistics only.

**Measures in place at prototype stage:**
- All traffic served over **HTTPS/TLS 1.3** via Vercel's edge network (no plain HTTP)
- No user accounts, sessions, or credentials stored
- No database — no SQL injection attack surface in the prototype
- Geocoding proxy: external Nominatim queries are made client-side with Uganda-bounded parameters only; no user input is passed to backend APIs without validation
- `Content-Security-Policy` and `X-Frame-Options` headers set by Vercel's default Next.js deployment profile

**Planned for production:**
- Role-based access control (NIRA HQ vs. regional vs. district officer roles)
- NIRA Active Directory / OAuth2 SSO integration via NITA-U's Government Intranet
- Data encryption at rest for any PII processed when integrated with NIRA's live database
- Audit logging of all data access events
- Alignment with the **Uganda Data Protection and Privacy Act, 2019** — data minimisation, purpose limitation, and data subject rights procedures

---

## 6. Interoperability

### Current (Prototype)
- **Nominatim Geocoding API** (OpenStreetMap Foundation) — Uganda-scoped, rate-limited, read-only for search
- **WHO AFRO disease alert data** — static snapshot ingested from WHO Uganda bulletin

### Planned Production Integrations
- **NIRA Operational Database** — live read-replica connection via secure NITA-U private network link for real registration figures
- **UBOS Vital Statistics API** — when published, to replace static birth/death data
- **WHO AFRO RSS Feed** — automated parsing of Uganda-specific outbreak bulletins to populate the disease alert layer dynamically
- **UNHCR Data Portal** — settlement population figures updated quarterly via API
- **NITA-U National Data Centre** — hosting migration path from Vercel to on-premise or Government cloud if required by policy

The system exposes a **RESTful JSON API** (`/api/registration`, `/api/alerts-nira`) that is consumable by other Government systems or a future NIRA mobile application.

---

## 7. Scalability

The prototype is designed with production scale in mind:

- **Stateless API routes** — all handler functions are stateless and can be scaled horizontally without coordination
- **CDN caching** — registration data (changes infrequently) is cached at Vercel's edge for 1 hour, reducing origin load to near-zero under high traffic
- **Client-side rendering of map** — MapLibre GL renders on the user's GPU, not the server; the server only serves data, not rendered images
- **Estimated concurrent users:** The current architecture on Vercel's free/pro tier can support 1,000+ concurrent users without configuration changes. A dedicated NIRA deployment on NITA-U infrastructure would serve all district-level NIRA staff (~2,000 users) comfortably on a standard 4-core server

---

## 8. Deployment Roadmap

| Phase | Timeline | Description |
|---|---|---|
| **Prototype** (current) | May 2026 | Static dataset, public Vercel deployment, full UI feature-complete |
| **Integration** | Q3 2026 | Connect to NIRA read-replica database; replace static JSON with live SQL queries |
| **Authentication** | Q3 2026 | NITA-U SSO integration; role-based access for HQ / regional / district staff |
| **Alerts Automation** | Q4 2026 | WHO AFRO RSS parser running as a scheduled Edge Function; NIRA internal notification webhook |
| **Mobile App** | Q1 2027 | Progressive Web App (PWA) packaging for offline use by field officers in low-connectivity areas |
| **On-premise Option** | Q1 2027 | Docker-compose packaging for deployment on NITA-U National Data Centre infrastructure |

---

## 9. Alignment with Government Priorities

| Government Priority | NIRA-INTEL Alignment |
|---|---|
| NDP III — Digital Transformation | Converts paper-based reporting to a real-time digital intelligence layer |
| Vision 2040 — Universal Registration | Directly targets the 59% of Ugandans without NID by identifying highest-priority underserved districts |
| MoICT Digital Uganda Policy | Browser-based, device-agnostic, works on government-issued smartphones |
| Uganda Data Protection Act 2019 | Prototype handles no PII; production roadmap includes full DPA compliance measures |
| Government of Uganda Open Data Initiative | Built entirely on open-source tools (Next.js, MapLibre GL, OpenStreetMap); free data sources (NIRA reports, UBOS census, WHO) |
| NITA-U Interoperability Framework | RESTful API layer designed for integration with the National e-Government Infrastructure |

---

## 10. Open Source and Intellectual Property

NIRA-INTEL is adapted from the open-source **Osiris** geospatial intelligence platform. The NIRA-specific application layer — all Uganda data models, API routes, map configuration, coverage logic, priority ranking engine, district intel panel, and alerts feed — is original work developed for this submission.

The system is built exclusively on open-source dependencies (MIT / Apache 2.0 licensed). No proprietary third-party APIs are used in the prototype — all external data calls are to open, free services (Nominatim, CartoDB tile CDN, WHO AFRO public bulletins).

Source code repository: **https://github.com/khanblair/osiris**
Live prototype: **https://nira-intel.vercel.app** *(or current Vercel preview URL)*

---

*This document is submitted in confidence for evaluation purposes under the Government Systems Prototype Showcase. All intellectual property remains vested in the applicant. Document prepared May 2026.*
