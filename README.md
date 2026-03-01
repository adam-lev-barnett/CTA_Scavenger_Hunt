# 🚆 Chica-Go! — CTA L Scavenger Hunt

![CTA L Official Logo](https://www.transitchicago.com/assets/1/6/pageheader_ctatrademarks.png)

> *One stamp at a time —*
> *Chicago unfolds its secrets.*
> *All aboard the L.* 🗺️

Explore Chicago's neighborhoods, culture, and hidden gems one CTA L station at a time. **Chica-Go!** is a location-based scavenger hunt game where players check in at train stations, discover nearby points of interest, and compete on weekly leaderboards — all while building a personal stamp book of everywhere they've been.

### Built for DePaul University DemonHacks Hackathon 2026

---

## 🎮 How It Works

Think of it like Pokémon GO meets a Chicago architecture tour:

1. **Register and log in**
2. **Navigate to a CTA L station** — check in to earn points
3. **Discover nearby points of interest** surfaced from the station hub
4. **Visit POIs for bonus points** and learn about local history (built-in tour guide flavor text)
5. **Collect stamps** in your personal stamp book — stamps persist forever, even after weekly resets
6. **Climb the leaderboard** — scores reset weekly, but your exploration history never does

> First-visit points > repeat-visit points. Explore new ground to maximize your score.

---

## 👥 Project Members

| Name | GitHub |
|---|---|
| Adam Barnett | [@adam-lev-barnett](https://github.com/adam-lev-barnett) |
| Yung Han Jeong | [@yunghanjeong](https://github.com/yunghanjeong) |
| Dylan Kapala | [@DJKapala](https://github.com/DJKapala) |
| Paul Lederer | [@Metatronius](https://github.com/Metatronius) |
| Peter Panagopoulos | [@Palexite](https://github.com/Palexite) |
| Sean Vaysburg | [@Metatronius](https://github.com/Metatronius) |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React + TypeScript |
| **Backend** | Java 17 + Spring Boot |
| **Database** | SQLite (file-based, Git-committed) |
| **ETL / Seeding** | Python 3 + `sqlite3` stdlib |
| **Maps & Location** | Google Maps API + Geofencing |
| **POI Data Source** | Overpass / OpenStreetMap API |

---

## 🗄️ Database Overview

The database is a single SQLite `.db` file committed directly to this repository. No Postgres install, no `CREATE USER`, no credential setup — teammates clone the repo and get a fully seeded database instantly.

### Schema Summary

| Table | Description |
|---|---|
| `users` | Player accounts with `hi_score`, `weekly_score`, and auth credentials |
| `stations` | CTA L train stations with GPS coordinates |
| `point_of_interests` | All visitable locations; optionally anchored to a station |
| `stamp_books` | One per user — the player's personal collection record |
| `stamp_book_entries` | One row per (user × POI); tracks `visited` status and timestamp |

### Key Design Decisions

- **SQLite over PostgreSQL** — chosen for hackathon friction reduction. Schema migrates to Postgres with only `application.properties` and dependency changes.
- **Stamp books are permanent** — weekly score resets zero `weekly_score` on `users`; stamp entries are never touched.
- **Inventory bag model** — on registration, every POI gets a pre-populated unvisited entry in the user's stamp book.

---

## 🏗️ Project Structure

```
CTA_SCAVENGER_HUNT/
├── frontend/                        ← React/TypeScript application
├── src/
│   ├── SQL/                         ← Database scripts, schemas, etl
│   │   ├── etl/                     ← ETL scripts and database 
│   │   └── schema/                  ← SQL schema for database
│   ├── main/                        ← Java spring-boot
│   └── schema/                      ← Java resources
├── frontend/                        ← React/TypeScript application
├── reference/                       ← Planning docs and walkthroughs
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version |
|---|---|
| Java | 17+ |
| Maven or Gradle | Latest |
| Python | 3.9+ |
| Node.js | 18+ |

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | Log in, receive JWT |
| `POST` | `/checkin` | Check in at a location, earn points |
| `GET` | `/users/{id}` | Get user profile |
| `GET` | `/users/{id}/stampbook` | Get full stamp book with visited flags |
| `GET` | `/leaderboard` | Top players by weekly score |
| `GET` | `/stations/{id}/nearby` | Nearby POIs for a given station |

Check-in request shape:
```json
{
  "userId": 1,
  "locationId": 3,
  "userLat": 41.8761,
  "userLng": -87.6244
}
```

Check-in response shape:
```json
{
  "pointsEarned": 100,
  "totalScore": 340,
  "isFirstVisit": true
}
```

---

## 🗓️ Development Milestones

| Milestone | Description | Time Block |
|---|---|---|
| **M1** | Foundation & Data Layer | Hours 0–3 |
| **M2** | Core Backend Logic (scoring, leaderboard, stamp book) | Hours 3–7 |
| **M3** | External API Integration (Overpass, Google Geofencing) | Hours 5–9 |
| **M4** | Frontend Core Screens (map, check-in, stamp book, leaderboard) | Hours 6–13 |
| **M5** | Integration & MVP Polish | Hours 12–18 |

M2/M3 and M3/M4 overlap intentionally — frontend and backend run in parallel after the M1 API contract sync.

---

## 🤖 AI Usage

**Models used:** GitHub Copilot, ChatGPT, Claude

- Project MVP definition and milestone planning from planning discussion documents
- Database setup walkthrough generated from SQL schema files
- Boilerplate code generation following human-defined patterns
- General documentation and README updates
- Troubleshooting and debugging assistance

---

## 🗺️ Post-Hackathon Backlog

- Combo/route point bonuses for chaining nearby POIs
- Medals and achievements system
- Friends list and social features
- Migrate SQLite → PostgreSQL for production
- Contact form and About/Instructions pages

---