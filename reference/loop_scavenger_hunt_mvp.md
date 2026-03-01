# The Loop Scavenger Hunt — MVP Task Breakdown
> Target Completion Window: 12–18 Hours

---

## Timeline Overview

| Milestone | Description | Time Block |
|---|---|---|
| M1 | Foundation & Data Layer | Hours 0–3 |
| M2 | Core Backend Logic | Hours 3–7 |
| M3 | External API Integration | Hours 5–9 |
| M4 | Frontend Core Screens | Hours 6–13 |
| M5 | Integration & MVP Polish | Hours 12–18 |

> **Note:** M2/M3 and M3/M4 overlap intentionally — frontend and backend can run in parallel once contracts (API shapes) are agreed upon at the end of M1.

---

## Milestone 1 — Foundation & Data Layer
**Time Block:** Hours 0–3 | **Total Est:** ~3 hours

The entire team should be present for this milestone. Decisions made here ripple everywhere.

### Tasks

#### 1.1 — Project Scaffolding
- **Est: 30 min**
- Initialize Spring Boot project (Java 17+, Maven or Gradle)
- Initialize React/TypeScript frontend project (Vite recommended)
- Set up shared GitHub repo, branch strategy (main + feature branches)
- Configure `.env` / `application.properties` for local Postgres connection

#### 1.2 — Database Schema Design
- **Est: 45 min**
- Define tables: `users`, `point_of_interest`, `train_station`, `stamp_book`, `stamp_book_entry`, `leaderboard`
- Document the `TrainStation` as a subtype of `PointOfInterest` (use single-table or joined inheritance)
- Write initial Flyway or Liquibase migration scripts
- Seed script with a handful of real CTA stations for local testing

#### 1.3 — Java Entity Modeling (JPA)
- **Est: 45 min**
- `PointOfInterest` base entity: `id`, `name`, `pointValue`, `latitude`, `longitude`, `description`, `nearbyLocations`
- `TrainStation extends PointOfInterest`: `lineColor`, `isHub`
- `User`: `id`, `username`, `email`, `passwordHash`, `hiScore`, `weeklyScore`, `createdAt`
- `StampBook`: `userId`, `entries (List<StampBookEntry>)`
- `StampBookEntry`: `locationId`, `visited (boolean)`, `visitedAt`

#### 1.4 — Auth Skeleton
- **Est: 45 min**
- Spring Security config with JWT (use `jjwt` or `spring-security-oauth2`)
- `POST /auth/register` and `POST /auth/login` endpoints (no UI yet)
- Password hashing with BCrypt
- JWT filter wired into the security chain

#### 1.5 — API Contract Agreement (Team Sync)
- **Est: 15 min**
- Agree on request/response shapes for core endpoints
- Document in a shared README or Swagger (`springdoc-openapi` is fast to add)
- Frontend team unblocked from here to build against mocked data

---

## Milestone 2 — Core Backend Logic
**Time Block:** Hours 3–7 | **Total Est:** ~4 hours

The game engine. Think of this as writing the rulebook for your RPG combat system.

### Tasks

#### 2.1 — Check-in Endpoint
- **Est: 1 hour**
- `POST /checkin` — accepts `{ userId, locationId, userLat, userLng }`
- Validate user is authenticated
- Stub geofence check (real integration comes in M3; use a permissive placeholder)
- Calculate points: full value on first visit, 20–50% on repeat
- Persist `StampBookEntry` as visited
- Return `{ pointsEarned, totalScore, isFirstVisit }`

#### 2.2 — Scoring Service
- **Est: 45 min**
- `ScoringService` class to calculate first-visit vs. repeat-visit points
- Update `weeklyScore` and `hiScore` on `User`
- Unit test the scoring logic (edge cases: first visit, repeat, zero-point location)

#### 2.3 — Stamp Book Service + Endpoint
- **Est: 45 min**
- `GET /users/{userId}/stampbook` — returns full stamp book with visited flags
- `StampBookService` handles creation of default unvisited entries when user registers

#### 2.4 — Leaderboard Service + Endpoint
- **Est: 45 min**
- `GET /leaderboard` — top N users by `weeklyScore`
- `@Scheduled(cron = "0 0 0 * * MON")` weekly reset job that zeroes `weeklyScore` (does NOT touch stamp books)
- Confirm stamp book entries survive the reset

#### 2.5 — User Profile Endpoint
- **Est: 30 min**
- `GET /users/{userId}` — returns profile: username, hiScore, weeklyScore, medals (empty list for MVP), friendsList (empty list for MVP)
- `PATCH /users/{userId}` — update username

---

## Milestone 3 — External API Integration
**Time Block:** Hours 5–9 | **Total Est:** ~3.5 hours

The wildcard milestone. External APIs are like that one party member who always shows up late and causes problems.

### Tasks

#### 3.1 — Overpass API Integration
- **Est: 1.5 hours**
- Use `RestTemplate` or `WebClient` to query Overpass API for CTA L stations in Chicago bounding box
- Parse response and map to `TrainStation` entities
- Write a `DataSeeder` (`CommandLineRunner`) that populates DB on first run if empty
- Cache results in DB — do not call Overpass on every request

#### 3.2 — Google Geofencing / Places Integration
- **Est: 1.5 hours**
- On `POST /checkin`, call Google Maps Distance Matrix or Geolocation API to validate user is within acceptable radius (suggest 100–200m) of the target location
- Return `403` with a friendly message if user is too far
- Make the radius configurable via `application.properties` so it can be loosened during demo

#### 3.3 — POI Nearby Relationship Hydration
- **Est: 30 min**
- After seeding stations, compute and persist `nearbyLocations` relationships (e.g., POIs within X km of each station)
- Expose `GET /stations/{id}/nearby` endpoint returning list of nearby POIs

---

## Milestone 4 — Frontend Core Screens
**Time Block:** Hours 6–13 | **Total Est:** ~6 hours

Can start after M1.5 (API contract sync). Build against mocked data until M5 wiring.

### Tasks

#### 4.1 — Auth Flow (Register + Login)
- **Est: 45 min**
- Register form: username, email, password
- Login form: email, password
- Store JWT in `localStorage` or a React context
- Redirect to map view on success

#### 4.2 — Map View
- **Est: 2 hours** *(most complex task on frontend)*
- Integrate Leaflet.js or Google Maps JS SDK
- Render base map centered on Chicago Loop
- Place markers for CTA stations and nearby POIs
- Clicking a marker shows POI name, point value, and a "Check In" button
- Highlight visited locations differently (stamp visual?)

#### 4.3 — Check-in Flow
- **Est: 45 min**
- "Check In" button calls `POST /checkin` with user's current GPS coordinates (browser Geolocation API)
- Display points earned in a toast/modal
- Update map marker to "visited" state after successful check-in

#### 4.4 — Stamp Book View
- **Est: 1 hour**
- Grid of all locations, each with a stamp (filled vs. empty) based on visited status
- Pull from `GET /users/{userId}/stampbook`
- Clicking a stamp shows location name and visit date if visited

#### 4.5 — Leaderboard View
- **Est: 30 min**
- Table of top users with rank, username, weekly score
- Highlight the logged-in user's row
- Pull from `GET /leaderboard`

#### 4.6 — User Profile View
- **Est: 30 min**
- Show username, hi-score, weekly score, stamp book summary
- Link to full stamp book view

---

## Milestone 5 — Integration & MVP Polish
**Time Block:** Hours 12–18 | **Total Est:** ~4–5 hours

The final dungeon. Everyone contributes here.

### Tasks

#### 5.1 — Frontend ↔ Backend Wiring
- **Est: 1.5 hours**
- Replace all mocked API calls with real endpoints
- Handle auth headers (attach JWT to all requests)
- Handle error states: expired token, geofence rejection, server errors

#### 5.2 — Mobile Responsiveness
- **Est: 1 hour**
- The app is meant to be used while walking around Chicago — it must work on a phone
- Test on a real device or browser DevTools mobile emulator
- Fix map sizing, button tap targets, form input UX

#### 5.3 — POI Flavor Text / Descriptions
- **Est: 30 min**
- Manually populate descriptions for at least 5–10 stations (the "tour guide" content)
- Display description in the POI detail modal on the map

#### 5.4 — QA / Happy Path Walkthrough
- **Est: 1 hour**
- One team member walks the full user flow end-to-end:
  - Register → login → find station → check in → view nearby POIs → check in to POI → view stamp book → view leaderboard
- File and fix critical blockers only — polish is post-hackathon

#### 5.5 — Deployment
- **Est: 1–1.5 hours**
- **Backend:** Deploy Spring Boot JAR to Railway or Render; point at a hosted Postgres (Railway provides one free)
- **Frontend:** Deploy React build to Vercel or Netlify; set `VITE_API_BASE_URL` env var
- Smoke test on deployed URLs before demo

---

## Post-MVP Backlog (Do Not Touch During Hackathon)

- Combo/route points system
- Medals and achievements system
- Friends list functionality
- Contact form
- About / Instructions page

---

## Suggested Team Split

| Person | Primary Responsibility | Backup |
|---|---|---|
| Dev A (Backend Lead) | M1 schema, M2 core logic, M3 APIs | M5 deployment |
| Dev B (Backend Support) | M1 auth, M2 leaderboard + scheduling | M5 wiring |
| Dev C (Frontend Lead) | M4 map view, check-in flow | M5 mobile QA |
| Dev D (Frontend Support) | M4 auth UI, stamp book, leaderboard | M5 wiring |
| Dev E (Floater / Full-stack) | M3 data seeding, M5 glue work | Wherever the fire is |

---

*Remember: a working demo beats a perfect codebase every time. Ship the train, polish the seats later.* 🚆
