# Chica-Go

**A location-based scavenger hunt built around Chicago's CTA L train system.**

Explore the city's neighborhoods, culture, and hidden gems one station at a time. Check in at CTA stops, discover nearby points of interest, fill your personal stamp book, and compete on the weekly leaderboard.

Originally built for [DePaul University DemonHacks 2026](https://demonhacks.com) by a team of six. This repo is an ongoing continuation of that project.

## How It Works

1. Register and log in
2. Navigate to a CTA L station — physically visit and check in to earn points
3. Discover nearby POIs (museums, landmarks, parks) surfaced from each station hub
4. Check in at POIs for bonus points and explore local history
5. Collect stamps in your personal stamp book — stamps persist forever, even after weekly score resets
6. Climb the leaderboard — weekly scores reset, but your exploration history never does

First-visit points > repeat-visit points. Explore new ground to maximize your score.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Maps | Leaflet, react-leaflet |
| Backend | Spring Boot 4 (Java 21) |
| Database | SQLite via Hibernate JPA |
| POI Data | Overpass / OpenStreetMap API |

## Getting Started

### Prerequisites

- Java 21+
- Node.js 18+

### Install

```bash
./install.sh
```

This installs Maven dependencies, npm packages, and copies `frontend/.env.example` → `frontend/.env`.

### Run

```bash
./start.sh
```

The backend starts on `http://localhost:8080` and the frontend on `http://localhost:5173`. Press `Ctrl+C` to stop both. Logs are written to `/tmp/chicago-backend.log` and `/tmp/chicago-frontend.log`.

To run just the frontend in dev mode:

```bash
cd frontend && npm run dev
```

## Configuration

**`frontend/.env`**

```env
VITE_API_BASE_URL=http://localhost:8080
```

**Google Maps API key** — place your key as plain text in `src/api-keys/google-maps`. The backend reads this file at startup. Check status at `GET /api/test/api-keys/status`.

**Geofence radius** — defaults to 150 m, configured in `src/main/resources/application.properties`. Override at runtime via `POST /api/test/geofence/radius?radiusMeters=N`.

## API

Full interactive docs available at `http://localhost:8080/swagger-ui.html` when the backend is running.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Create account |
| `POST` | `/auth/login` | Log in, receive token |
| `GET` | `/users/{id}` | User profile (username, high score, weekly score) |
| `PATCH` | `/users/{id}` | Update username |
| `GET` | `/users/{id}/stampbook` | Full stamp book with visited flags |
| `GET` | `/api/test/stations` | All CTA stations |
| `GET` | `/pois/{stationId}/nearby` | POIs near a given station |
| `POST` | `/pois/check-in` | Check in at a POI, earn points |
| `GET` | `/leaderboard` | All-time rankings |
| `GET` | `/leaderboard/weekly` | Weekly rankings |

Auth tokens are returned on login/register and sent as `Authorization: Bearer {token}`.

## Database

The database is a single SQLite `.db` file committed directly to the repo (`src/SQL/chica_go.db`). No Postgres install, no credentials, no setup — clone and go.

| Table | Description |
|---|---|
| `profiles` | Player accounts with scores and auth credentials |
| `point_of_interests` | All visitable locations (stations and POIs share this table) |
| `stamp_books` | One per user — the player's personal collection record |
| `stamp_book_entries` | One row per user × POI; tracks `visited` status and timestamp |

A record is treated as a station when its `stationId` equals its own `id`. POIs linked to a station carry that station's `id` as their `stationId`. Stamp book entries are permanent and unaffected by weekly score resets. On registration, every POI gets a pre-populated unvisited entry in the new user's stamp book.

Migrating to PostgreSQL requires only `application.properties` and dependency changes — no schema rewrites.

## Architecture Notes

- **Geofencing is client-side.** The backend accepts all check-in requests without validating location. The frontend enforces proximity via a Haversine calculation before allowing a check-in. The backend's `GeofencingService` is wired to a test endpoint (`GET /api/test/geofence`) but not the check-in flow.
- **Demo mode.** The frontend includes a built-in demo mode backed by mock data so the app can be explored without a running backend.
- **Hackathon caveats.** Auth tokens are not JWT, all endpoints are publicly accessible, and CORS is fully open. These were intentional shortcuts for the hackathon — harden before any public deployment.

## Roadmap

- [ ] Combo/route point bonuses for chaining nearby POIs
- [ ] Medals and achievements system
- [ ] Friends list and social features
- [ ] Migrate SQLite → PostgreSQL for production
- [ ] Contact form and About/Instructions pages

## Team

Built at DemonHacks 2026 by:

- [Adam Barnett](https://github.com/adam-lev-barnett)
- [Yung Han Jeong](https://github.com/yunghanjeong)
- [Dylan Kapala](https://github.com/DJKapala)
- [Paul Lederer](https://github.com/Metatronius)
- [Peter Panagopoulos](https://github.com/Palexite)
- [Sean Vaysburg](https://github.com/Metatronius)
