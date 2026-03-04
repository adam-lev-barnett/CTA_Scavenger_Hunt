# CTA Scavenger Hunt — Claude Reference

## Project Overview
Full-stack Chicago CTA scavenger hunt app. Users explore CTA stations and nearby points of interest, check in at locations to earn points, compete on leaderboards, and collect digital stamps.

- **Backend**: Spring Boot 4.0.3 (Java 21) at `http://localhost:8080`
- **Frontend**: React 18 + TypeScript + Vite at `http://localhost:5173`
- **Database**: SQLite (`src/SQL/chica_go.db`)

## Running the App

```bash
# Install all dependencies
./install.sh

# Start backend + frontend together
./start.sh
# Backend logs: /tmp/chicago-backend.log
# Frontend logs: /tmp/chicago-frontend.log

# Or run separately:
./mvnw spring-boot:run
npm --prefix frontend run dev
```

---

## Backend (Spring Boot)

### Package Structure
```
src/main/java/com/hackathon/chica_go/
├── ChicaGoApplication.java
├── config/
│   ├── ApiKeyConfiguration.java       (loads API keys from src/api-keys/)
│   ├── GlobalExceptionHandler.java    (centralized error handling)
│   └── SecurityConfig.java            (CORS all origins, CSRF disabled, all permitAll)
├── controller/
│   ├── AuthController.java            (/auth/login, /auth/register)
│   ├── CheckInController.java         (/checkin)
│   ├── LeaderboardController.java     (/leaderboard, /leaderboard/weekly)
│   ├── PointOfInterestController.java (/pois/*)
│   ├── ProfileController.java         (/users/*)
│   ├── StampBookController.java       (/stamp-books/*)
│   ├── StampBookEntryController.java
│   └── TestApiController.java         (/api/test/* — debug only)
├── dto/                               (request/response shapes)
├── model/                             (JPA entities + scoring logic)
├── repository/                        (Spring Data JPA repositories)
└── service/                           (business logic)
```

### API Endpoints

| Method | Endpoint | Auth | Body / Notes |
|--------|----------|------|------|
| POST | `/auth/login` | No | `{email, password}` → `{token, userId, username}` |
| POST | `/auth/register` | No | `{username, email, password}` → `{token, userId, username}` |
| GET | `/api/test/stations` | Yes | All stations from DB |
| GET | `/pois/{stationId}/nearby` | Yes | POIs linked to a station |
| POST | `/pois/check-in` | Yes | `{userId, poiId}` → `{pointsEarned, totalScore, isFirstVisit}` |
| GET | `/users/{userId}` | Yes | Profile |
| PATCH | `/users/{userId}` | Yes | `{username}` → updated Profile |
| GET | `/users/{userId}/stampbook` | Yes | `List<StampBookEntry>` |
| GET | `/leaderboard` | Yes | Sorted by `hiScore` desc |
| GET | `/leaderboard/weekly` | Yes | Sorted by `weeklyScore` desc |
| POST | `/checkin` | Yes | Same as `/pois/check-in` |

All protected endpoints require: `Authorization: Bearer {token}`

Token format: `{UUID}_{userId}` — not JWT. Production should migrate to JWT.

### Database Schema (SQLite)

**profiles**
- `id`, `username` (UNIQUE), `email` (UNIQUE), `password_hash` (BCrypt)
- `hi_score` (all-time), `weekly_score` (resets weekly), `created_at`

**point_of_interests**
- `id`, `poi_name`, `latitude`, `longitude`, `points`
- `station_id` — self-referencing: NULL = plain POI, `= id` = this IS a station, `!= id` = POI linked to that station

**stamp_books** — one per user (`profile_id` UNIQUE FK)

**stamp_book_entries**
- `stamp_book_id` (FK), `location_id` (FK to point_of_interests)
- `visited` (0/1), `visited_at` (ISO 8601, null until checked in)
- UNIQUE on `(stamp_book_id, location_id)`

### Key Business Logic

**Registration flow**: Creates Profile → Creates StampBook → Seeds one unvisited entry per existing POI.

**Check-in flow** (`PointOfInterestService.checkInProfile`):
1. Fetch POI, Profile, StampBook
2. Find/create StampBookEntry; set `visited=true`, `visitedAt=now`
3. Calculate points: first visit = 100% of POI points, repeat = 50%
4. Update `weeklyScore` and `hiScore` on Profile

**Geofencing**: `GeofencingService` uses Haversine (default 150m radius). Used informational/test only — actual geofence enforcement is client-side (6km in MapPage).

**Security**: All endpoints are `permitAll()` — token is validated manually by services, not Spring Security.

### Configuration (`application.properties`)
```properties
spring.datasource.url=jdbc:sqlite:src/SQL/chica_go.db
spring.jpa.hibernate.ddl-auto=update
spring.datasource.hikari.maximum-pool-size=1   # SQLite is single-writer
geofence.radius.meters=150
overpass.api.url=https://overpass-api.de/api/interpreter
```

---

## Frontend (React + TypeScript + Vite)

### Structure
```
frontend/src/
├── main.tsx                  (entry point — imports global.css)
├── App.tsx                   (router setup)
├── global.css                (CSS custom properties, keyframes)
├── types.ts
├── components/
│   ├── NavBar.tsx
│   └── ProtectedRoute.tsx
├── hooks/
│   └── useAuth.tsx           (AuthContext + localStorage)
├── pages/
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── MapPage.tsx           (Leaflet map, GPS, check-ins)
│   ├── StampBookPage.tsx
│   ├── LeaderboardPage.tsx
│   ├── ProfilePage.tsx
│   ├── AboutPage.tsx
│   └── ContactPage.tsx
└── services/
    ├── api.ts                (all API calls + demo mode detection)
    └── demoData.ts           (hardcoded mock data for demo token)
```

### Routes
- Public: `/login`, `/register`
- Protected: `/map`, `/stampbook`, `/leaderboard`, `/profile`, `/about`, `/contact`
- Fallback `*` → `/map`; unauthorized → `/login`

### Auth (`useAuth.tsx`)
- Context provides: `token`, `userId`, `login(token, userId?)`, `logout()`
- Persisted in `localStorage` under key `cta-auth`

### API Service (`api.ts`)
```typescript
api.login(email, password)
api.register(username, email, password)
api.getStations(token)
api.getNearbyPois(stationId, token)           // tries 3 endpoint fallbacks
api.checkIn(userId, locationId, _userLat, _userLng, token)  // lat/lng unused, backend ignores them
api.getStampBook(userId, token)
api.getLeaderboard(token)
api.getProfile(userId, token)
api.updateUsername(userId, username, token)
```

Demo mode: if `token === 'demo-local-token'` (DEMO_TOKEN), returns data from `demoData.ts` without hitting the backend. Demo user ID = 999.

### Key Types (`types.ts`)
```typescript
AuthResponse  { token, userId?, username? }
Profile       { id, username, email?, hiScore, weeklyScore }
Station / PointOfInterest  { id, poiName?, stationName?, name?, latitude, longitude, stationId?, points? }
CheckInResponse  { pointsEarned, totalScore, isFirstVisit }
StampBookEntry   { id, pointOfInterest?: { id, poiName? }, visited?, visitedAt? }
LeaderboardEntry { rank?, username, weeklyScore }
```

### Styling (CSS Modules — no Tailwind)
- `src/global.css` — imported once in `main.tsx`; defines CSS custom properties and keyframes
- One `*.module.css` per page/component; fully self-contained
- CSS custom properties: `--cta-blue: #00a1de`, `--cta-red`, `--cta-green`, `--cta-purple`, `--cta-orange`, `--cta-yellow`, `--cta-pink`, `--cta-brown`
- Keyframes: `fade-up`, `fade-in`, `pulse-ring`, `spin`
- Colors: background `#09090b`, surfaces `#18181b`, borders `#27272a`
- Map tiles: CartoDB Dark Matter (`https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`)

### MapPage Details
- Leaflet map centered on Chicago `[41.883, -87.629]`, zoom 15
- GPS via browser Geolocation API
- Client-side geofence: 6km Haversine — user must be within 6km of a POI to check in
- Click station marker → panel shows nearby POIs
- Click POI → triggers check-in if within range

---

## Known Issues / Gotchas

- `_userLat`/`_userLng` in `api.checkIn()` are intentionally unused (backend doesn't accept them)
- `index.css` exists but is unused — only `global.css` and CSS modules are loaded
- Token format `{UUID}_{userId}` is not JWT; userId is extractable from the token string
- SQLite `maximum-pool-size=1` — concurrent writes will queue
- All Spring Security auth is disabled (`permitAll`); auth is enforced only by manual token checks in services
- `Station.java` entity may be legacy/unused; actual data is in `PointOfInterest`
