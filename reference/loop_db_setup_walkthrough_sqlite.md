# The Loop Scavenger Hunt — SQLite Database Setup Walkthrough
> Stack: Git · SQLite · Python (mock data) · Java Spring Boot

---

## Overview

This walkthrough covers four phases:

```
Phase 0 — Initialize the Git repository and project structure
Phase 1 — Build the SQLite database and apply the schema
Phase 2 — Populate the database with mock data via Python
Phase 3 — Connect the database to Java Spring Boot
```

Think of it like prepping an RPG campaign with a portable save file: Phase 0 sets up the party's shared inventory (Git), Phase 1 creates the save file (`.db`), Phase 2 fills it with NPCs and loot, and Phase 3 hands the save file directly to the game engine — no server setup required for any teammate.

---

## Why SQLite for This Project?

SQLite is a serverless, file-based database. The entire database lives in a single `.db` file that can be checked directly into Git. When a teammate clones the repo, they get the pre-populated database instantly — no Postgres install, no `CREATE USER`, no credential setup. For a hackathon MVP, this is a significant friction reduction.

| | SQLite | PostgreSQL |
|---|---|---|
| Setup for teammates | Clone repo → done | Install Postgres, create user, restore dump |
| Database file | Single `.db` file in Git | Server process required |
| Concurrent writes | Single writer | Multiple writers |
| Production-ready | No (demo/dev only) | Yes |
| Spring Boot support | Yes (via `spring-boot-starter-data-jpa`) | Yes |

> **Note:** SQLite is the right call for a hackathon demo. If this project grows past the hackathon, migrating to Postgres is straightforward — the JPA entities don't change, only `application.properties` and the dependency do.

---

## Prerequisites

Make sure the following are installed before starting:

| Tool | Version | Check Command |
|---|---|---|
| Git | 2.x+ | `git --version` |
| Python | 3.9+ | `python3 --version` |
| pip | latest | `pip --version` |
| Java | 17+ | `java --version` |
| Maven or Gradle | latest | `mvn --version` or `gradle --version` |

> No Postgres installation needed. SQLite ships with Python's standard library via `sqlite3` — zero extra installs for database creation.

---

## Phase 0 — Initialize the Git Repository

> Do this first, before writing any code or creating the database. The `.db` file is a repo artifact just like source code — it belongs inside the project from day one.

### 0.1 — Create the Repo on GitHub

Go to [github.com/new](https://github.com/new) and create a new repository:

- **Name:** `loop-scavenger-hunt`
- **Visibility:** Private (for a hackathon team)
- **Do NOT initialize with a README** — we'll push one from local

### 0.2 — Initialize Locally and Connect to GitHub

```bash
# Create and enter the project root directory
mkdir loop-scavenger-hunt
cd loop-scavenger-hunt

# Initialize git
git init

# Connect to the remote repo you just created on GitHub
git remote add origin https://github.com/YOUR_USERNAME/loop-scavenger-hunt.git
```

### 0.3 — Set Up the Project Folder Structure

```bash
# Backend — Spring Boot project scaffolds into here
mkdir backend

# Database folder — schema, seed script, and the .db file all live here
mkdir -p database/migrations
mkdir -p database/seeds

# Copy your schema and seed files into the database folder
cp loop_schema_corrected.sql database/migrations/V1__initial_schema.sql
cp seed_mock_data.py database/seeds/seed_mock_data.py
```

Your structure should look like this after all phases are complete:

```
loop-scavenger-hunt/
├── backend/                         ← Spring Boot project (Phase 3)
├── database/
│   ├── migrations/
│   │   └── V1__initial_schema.sql   ← schema DDL (human-readable, tracked)
│   ├── seeds/
│   │   └── seed_mock_data.py        ← Python seed script (tracked)
│   └── loop_scavenger_hunt.db       ← the static database file (tracked)
├── .gitignore
├── .env.example
└── README.md
```

### 0.4 — Create the `.gitignore`

```bash
touch .gitignore
```

Add the following contents:

```gitignore
# -------------------------------------------------------
# SECRETS — never commit credentials
# -------------------------------------------------------
.env
*.env
application-local.properties

# -------------------------------------------------------
# Java / Spring Boot
# -------------------------------------------------------
backend/target/
backend/.mvn/
*.class
*.jar
*.war
*.log
.DS_Store

# -------------------------------------------------------
# Python
# -------------------------------------------------------
__pycache__/
*.pyc
*.pyo
.venv/
venv/
env/

# -------------------------------------------------------
# IDE / Editor
# -------------------------------------------------------
.idea/
.vscode/
*.iml
*.iws
*.ipr

# -------------------------------------------------------
# NOTE: database/loop_scavenger_hunt.db is intentionally
# NOT listed here — we want it tracked in Git.
# Only ignore a .db file if it is a runtime/test artifact.
# -------------------------------------------------------
```

> The `.db` file is intentionally NOT gitignored. It is the pre-built static database that teammates receive on clone. This is the whole point of the SQLite approach — treat it like a committed asset, the same way you'd commit a seed JSON file.

### 0.5 — Create a `.env.example` Template

SQLite requires no credentials, but the project may still need environment variables for other config (API keys, JWT secret, etc.):

```bash
# .env.example — safe to commit, no real secrets
JWT_SECRET=changeme_replace_with_a_long_random_string
CHECKIN_RADIUS_METERS=150
GOOGLE_MAPS_API_KEY=your_google_maps_key_here
```

### 0.6 — Make the First Commit

```bash
git add .
git commit -m "chore: initial project structure, schema, seed script, and gitignore"
git push -u origin main
```

### 0.7 — Set Up Branch Strategy

```bash
# Create and push the shared integration branch
git checkout -b dev
git push -u origin dev
```

Recommended branch naming:

| Branch | Purpose |
|---|---|
| `main` | Stable, demo-ready code only |
| `dev` | Active integration branch — PRs merge here |
| `feature/database-schema` | Schema and seed script changes |
| `feature/auth` | JWT auth endpoints |
| `feature/checkin-api` | Check-in endpoint and scoring logic |
| `feature/map-view` | Frontend map component |

> **Team note on the `.db` file:** When multiple people modify the seed script and regenerate the `.db` file, Git will flag it as a binary conflict. Decide early who owns re-seeding (typically the backend lead) to avoid merge conflicts on the binary file. Treat the `.db` file like a build artifact that one person regenerates and commits.

---

## Phase 1 — Create the SQLite Database and Apply the Schema

SQLite doesn't require a running server. The database is created the moment Python (or any SQLite client) opens a new `.db` file path.

### 1.1 — Verify Python's Built-in SQLite

```bash
# sqlite3 ships with Python's standard library — no pip install needed
python3 -c "import sqlite3; print(sqlite3.sqlite_version)"
# Expected output: 3.x.x
```

### 1.2 — Create the Database File and Apply the Schema

The schema needs minor adaptation from the Postgres version — SQLite uses different type names and doesn't support all Postgres constraints. The key differences are:

| Postgres | SQLite Equivalent |
|---|---|
| `BIGSERIAL PRIMARY KEY` | `INTEGER PRIMARY KEY AUTOINCREMENT` |
| `DECIMAL(9, 6)` | `REAL` (SQLite has no fixed-point decimal) |
| `BOOLEAN` | `INTEGER` (0 = false, 1 = true) |
| `TIMESTAMP` | `TEXT` (stored as ISO 8601 string) |
| `VARCHAR(n)` | `TEXT` |

Create `database/migrations/V1__initial_schema.sql` with the SQLite-compatible schema:

```sql
-- =============================================================================
-- THE LOOP SCAVENGER HUNT — SQLite Schema
-- =============================================================================
-- SQLite does not require a running server.
-- This schema is applied once to create loop_scavenger_hunt.db.
-- The .db file is then committed to Git and shared across the team.
-- =============================================================================

-- Enforce foreign key support — SQLite disables FK checks by default
PRAGMA foreign_keys = ON;


-- -----------------------------------------------------------------------------
-- TABLE: users
-- Root entity. Deleting a user cascades to stamp_books → stamp_book_entries.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT    NOT NULL UNIQUE,
    email         TEXT    NOT NULL UNIQUE,
    password_hash TEXT    NOT NULL,
    hi_score      INTEGER NOT NULL DEFAULT 0,
    weekly_score  INTEGER NOT NULL DEFAULT 0,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now'))  -- ISO 8601 UTC
);


-- -----------------------------------------------------------------------------
-- TABLE: stations
-- CTA L train stations. Declared before point_of_interests (FK dependency).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stations (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    station_name  TEXT    NOT NULL,
    longitude     REAL    NOT NULL,   -- sufficient precision for city-scale geofencing
    latitude      REAL    NOT NULL
);


-- -----------------------------------------------------------------------------
-- TABLE: point_of_interests
-- All visitable locations. station_id is nullable — NULL = standalone POI.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS point_of_interests (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    poi_name    TEXT    NOT NULL,
    longitude   REAL    NOT NULL,
    latitude    REAL    NOT NULL,
    station_id  INTEGER,              -- NULL = standalone POI, not station-anchored
    points      INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT fk_station FOREIGN KEY (station_id)
        REFERENCES stations(id) ON DELETE SET NULL
);


-- -----------------------------------------------------------------------------
-- TABLE: stamp_books
-- One per user. Deletion cascades from users via ON DELETE CASCADE.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stamp_books (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,  -- UNIQUE: one book per user
    CONSTRAINT fk_stamp_books_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE
);


-- -----------------------------------------------------------------------------
-- TABLE: stamp_book_entries
-- One row per (stamp_book, POI) pair. Pre-populated as visited = 0 on registration.
-- visited flips to 1 on successful check-in. Stamps survive weekly score resets.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stamp_book_entries (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    stamp_book_id INTEGER NOT NULL,
    location_id   INTEGER NOT NULL,
    visited       INTEGER NOT NULL DEFAULT 0,   -- 0 = false, 1 = true
    visited_at    TEXT,                          -- NULL until stamped; ISO 8601 string
    CONSTRAINT fk_entries_stamp_book FOREIGN KEY (stamp_book_id)
        REFERENCES stamp_books(id) ON DELETE CASCADE,
    CONSTRAINT fk_entries_location FOREIGN KEY (location_id)
        REFERENCES point_of_interests(id) ON DELETE CASCADE,
    CONSTRAINT uq_entry UNIQUE (stamp_book_id, location_id)
);
```

Apply the schema to create the `.db` file:

```bash
# From the repo root — SQLite creates the .db file automatically if it doesn't exist
sqlite3 database/loop_scavenger_hunt.db < database/migrations/V1__initial_schema.sql
```

### 1.3 — Verify Tables Exist

```bash
# Open the SQLite shell on the new database
sqlite3 database/loop_scavenger_hunt.db
```

```sql
-- List all tables
.tables

-- Expected output:
-- point_of_interests  stamp_book_entries  stamp_books  stations  users

-- Inspect a table's schema
.schema users

-- Exit
.quit
```

---

## Phase 2 — Populate with Mock Data (Python)

Python's `sqlite3` module is built-in — no pip install required for this phase.

### 2.1 — Confirm sqlite3 is Available

```bash
python3 -c "import sqlite3; print('sqlite3 ready')"
# Expected: sqlite3 ready
```

### 2.2 — The Seed Script

The seed script lives at `database/seeds/seed_mock_data.py`.
It connects directly to the `.db` file — no credentials, no server, no host:

```python
import sqlite3
import os
from datetime import datetime, timedelta

# -------------------------------------------------------
# CONNECTION — path to the .db file relative to repo root
# Run this script from the repo root: python3 database/seeds/seed_mock_data.py
# -------------------------------------------------------
DB_PATH = os.path.join(os.path.dirname(__file__), "..", "loop_scavenger_hunt.db")
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# Enable foreign key enforcement for this session
cursor.execute("PRAGMA foreign_keys = ON")

# -------------------------------------------------------
# SEED: stations
# CTA L stations — real Chicago coordinates
# Inserted first because point_of_interests.station_id references them
# -------------------------------------------------------
stations = [
    ("Harold Washington Library Station", -87.627800, 41.876200),
    ("Millennium Station",                -87.624500, 41.884400),
    ("Chicago/State Station",             -87.627900, 41.896900),
    ("Clark/Lake Station",                -87.631700, 41.885700),
    ("Adams/Wabash Station",              -87.626300, 41.879700),
]

cursor.executemany(
    "INSERT INTO stations (station_name, longitude, latitude) VALUES (?, ?, ?)",
    stations
)
print(f"Inserted {len(stations)} stations")

# -------------------------------------------------------
# SEED: point_of_interests
# Mix of station-adjacent POIs and standalone POIs (station_id = NULL)
# -------------------------------------------------------
cursor.execute("SELECT id, station_name FROM stations ORDER BY id")
station_map = {name: sid for sid, name in cursor.fetchall()}

points_of_interest = [
    # (poi_name, longitude, latitude, station_id, points)
    ("Harold Washington Library",  -87.627200, 41.876100, station_map["Harold Washington Library Station"], 100),
    ("Grant Park",                 -87.619000, 41.876400, station_map["Millennium Station"],                  80),
    ("Art Institute of Chicago",   -87.623600, 41.879400, station_map["Adams/Wabash Station"],               120),
    ("Millennium Park",            -87.622700, 41.882600, station_map["Millennium Station"],                   90),
    ("Chicago Riverwalk",          -87.630700, 41.888500, station_map["Clark/Lake Station"],                   75),
    ("Cloud Gate (The Bean)",      -87.623300, 41.882700, None, 60),   # standalone POI
    ("Chicago Cultural Center",    -87.624600, 41.883100, None, 70),   # standalone POI
]

cursor.executemany(
    "INSERT INTO point_of_interests (poi_name, longitude, latitude, station_id, points) VALUES (?, ?, ?, ?, ?)",
    points_of_interest
)
print(f"Inserted {len(points_of_interest)} points of interest")

# -------------------------------------------------------
# SEED: users
# Mock players with varying scores
# -------------------------------------------------------
users = [
    ("LoopRunner99", "runner99@example.com", "hashed_pw_1", 340, 120),
    ("BeanSeeker",   "bean@example.com",     "hashed_pw_2", 210,  90),
    ("CTAChaser",    "cta@example.com",      "hashed_pw_3", 580, 200),
    ("WabashWalker", "wabash@example.com",   "hashed_pw_4",  75,  75),
    ("LoopNewbie",   "newbie@example.com",   "hashed_pw_5",   0,   0),
]

cursor.executemany(
    "INSERT INTO users (username, email, password_hash, hi_score, weekly_score) VALUES (?, ?, ?, ?, ?)",
    users
)
print(f"Inserted {len(users)} users")

# -------------------------------------------------------
# SEED: stamp_books + stamp_book_entries
# One book per user, one entry per POI — all unvisited by default
# -------------------------------------------------------
cursor.execute("SELECT id FROM users ORDER BY id")
user_ids = [row[0] for row in cursor.fetchall()]

cursor.execute("SELECT id FROM point_of_interests ORDER BY id")
poi_ids = [row[0] for row in cursor.fetchall()]

for user_id in user_ids:
    cursor.execute(
        "INSERT INTO stamp_books (user_id) VALUES (?)",
        (user_id,)
    )
    book_id = cursor.lastrowid   # SQLite equivalent of RETURNING id

    for poi_id in poi_ids:
        cursor.execute(
            "INSERT INTO stamp_book_entries (stamp_book_id, location_id, visited, visited_at) VALUES (?, ?, 0, NULL)",
            (book_id, poi_id)
        )

print(f"Created {len(user_ids)} stamp books with {len(poi_ids)} entries each")

# -------------------------------------------------------
# SEED: mark 3 stamps as visited for LoopRunner99
# Simulates a player mid-game
# -------------------------------------------------------
cursor.execute("SELECT id FROM users WHERE username = 'LoopRunner99'")
runner_id = cursor.fetchone()[0]

cursor.execute("SELECT id FROM stamp_books WHERE user_id = ?", (runner_id,))
runner_book_id = cursor.fetchone()[0]

for i, poi_id in enumerate(poi_ids[:3]):
    visit_time = (datetime.utcnow() - timedelta(hours=3 - i)).isoformat()
    cursor.execute(
        "UPDATE stamp_book_entries SET visited = 1, visited_at = ? WHERE stamp_book_id = ? AND location_id = ?",
        (visit_time, runner_book_id, poi_id)
    )

print(f"Marked 3 stamps as visited for LoopRunner99")

# -------------------------------------------------------
# COMMIT and CLOSE
# -------------------------------------------------------
conn.commit()
cursor.close()
conn.close()
print("Mock data seeding complete — loop_scavenger_hunt.db is ready.")
```

### 2.3 — Run the Seed Script

```bash
# From the repo root
python3 database/seeds/seed_mock_data.py
```

Expected output:

```
Inserted 5 stations
Inserted 7 points of interest
Inserted 5 users
Created 5 stamp books with 7 entries each
Marked 3 stamps as visited for LoopRunner99
Mock data seeding complete — loop_scavenger_hunt.db is ready.
```

### 2.4 — Verify Mock Data

```bash
sqlite3 database/loop_scavenger_hunt.db
```

```sql
-- Spot check: all users
SELECT id, username, hi_score, weekly_score FROM users;

-- Spot check: LoopRunner99's collected stamps
SELECT
    u.username,
    poi.poi_name,
    sbe.visited,
    sbe.visited_at
FROM users u
    JOIN stamp_books sb          ON sb.user_id = u.id
    JOIN stamp_book_entries sbe  ON sbe.stamp_book_id = sb.id
    JOIN point_of_interests poi  ON poi.id = sbe.location_id
WHERE u.username = 'LoopRunner99'
ORDER BY sbe.visited DESC, sbe.visited_at ASC;

.quit
```

### 2.5 — Commit the Populated `.db` File to Git

Once the database looks correct, commit it. This is the artifact teammates will receive on clone:

```bash
git add database/loop_scavenger_hunt.db
git add database/migrations/V1__initial_schema.sql
git add database/seeds/seed_mock_data.py
git commit -m "feat: add seeded SQLite database with mock users, stations, and POIs"
git push origin dev
```

> **Re-seeding rule:** If the schema or seed data changes, one designated person (backend lead) drops the old `.db`, re-runs the seed script, and commits the new binary. Announce in Slack/Discord before doing this so nobody is mid-development on a stale file.

---

## Phase 3 — Connect Spring Boot to SQLite

### 3.1 — Add Dependencies

In your `pom.xml` (Maven):

```xml
<!-- Spring Data JPA -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>

<!-- SQLite JDBC Driver -->
<dependency>
    <groupId>org.xerial</groupId>
    <artifactId>sqlite-jdbc</artifactId>
    <version>3.45.1.0</version>
</dependency>

<!-- Hibernate dialect for SQLite (not bundled with Hibernate by default) -->
<dependency>
    <groupId>org.hibernate.orm</groupId>
    <artifactId>hibernate-community-dialects</artifactId>
</dependency>
```

Or in `build.gradle` (Gradle):

```groovy
implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
implementation 'org.xerial:sqlite-jdbc:3.45.1.0'
implementation 'org.hibernate.orm:hibernate-community-dialects'
```

### 3.2 — Configure `application.properties`

Located at `backend/src/main/resources/application.properties`:

```properties
# -------------------------------------------------------
# DATABASE — SQLite file path
# The path is relative to where the JAR is run from (repo root).
# Teammates get the same .db file on clone — no setup required.
# -------------------------------------------------------
spring.datasource.url=jdbc:sqlite:database/loop_scavenger_hunt.db
spring.datasource.driver-class-name=org.sqlite.JDBC

# -------------------------------------------------------
# JPA / HIBERNATE
# SQLite dialect lives in hibernate-community-dialects
# -------------------------------------------------------
spring.jpa.database-platform=org.hibernate.community.dialect.SQLiteDialect
spring.jpa.hibernate.ddl-auto=validate

# Logs SQL to console — useful during development
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# -------------------------------------------------------
# SQLite is single-writer — disable connection pooling
# HikariCP (Spring Boot default) uses multiple connections;
# this setting keeps it to one to avoid locking errors
# -------------------------------------------------------
spring.datasource.hikari.maximum-pool-size=1
```

> `ddl-auto=validate` is used because the schema already exists in the `.db` file from Phase 1. Hibernate will confirm the JPA entities match the existing tables without touching data. Never use `create` or `create-drop` — that would wipe the committed database on every start.

### 3.3 — Key JPA Entity Adjustments for SQLite

SQLite stores booleans as integers and timestamps as text. Annotate your entities accordingly so Hibernate maps them correctly:

```java
// StampBookEntry.java — handle SQLite's boolean and timestamp types

@Entity
@Table(name = "stamp_book_entries")
public class StampBookEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "stamp_book_id", nullable = false)
    private StampBook stampBook;

    @ManyToOne
    @JoinColumn(name = "location_id", nullable = false)
    private PointOfInterest location;

    // SQLite stores booleans as 0/1 integers
    // @Column alone is sufficient — Hibernate's SQLiteDialect handles the mapping
    @Column(nullable = false)
    private boolean visited = false;

    // SQLite stores timestamps as ISO 8601 TEXT — map to LocalDateTime
    private LocalDateTime visitedAt;
}
```

```java
// User.java — createdAt stored as TEXT in SQLite

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    private int hiScore;
    private int weeklyScore;

    // SQLite stores this as TEXT — Hibernate maps it automatically via SQLiteDialect
    private LocalDateTime createdAt;
}
```

### 3.4 — Verify the Connection

Run the Spring Boot app from the repo root (so the relative path `database/loop_scavenger_hunt.db` resolves correctly):

```bash
# Maven — run from repo root
cd backend
mvn spring-boot:run

# Gradle
cd backend
./gradlew bootRun
```

Look for these lines in startup logs confirming SQLite is connected:

```
HikariPool-1 - Start completed.
Hibernate: select ... from users ...   ← confirms JPA can query the .db file
```

If you see a file path error, confirm you are running from the `backend/` directory and that `database/loop_scavenger_hunt.db` exists one level up at the repo root.

### 3.5 — Teammate Onboarding (The Payoff)

This is why we switched to SQLite. A new teammate joining the project:

```bash
# 1. Clone the repo — database included
git clone https://github.com/YOUR_USERNAME/loop-scavenger-hunt.git
cd loop-scavenger-hunt

# 2. Copy environment template (API keys, JWT secret — not DB credentials)
cp .env.example .env
# Edit .env with real values for external APIs

# 3. Run the backend
cd backend
mvn spring-boot:run

# That's it. No Postgres install. No CREATE USER. No seed script.
# The .db file is already there with data.
```

---

## Quick Troubleshooting Reference

| Symptom | Likely Cause | Fix |
|---|---|---|
| `unable to open database file` | Wrong working directory when running Spring Boot | Run `mvn spring-boot:run` from `backend/` with `.db` at `../database/` |
| `No suitable driver found for jdbc:sqlite` | Missing `sqlite-jdbc` dependency | Confirm `org.xerial:sqlite-jdbc` is in `pom.xml` |
| `SQLiteDialect not found` | Missing `hibernate-community-dialects` | Add `org.hibernate.orm:hibernate-community-dialects` dependency |
| `SQLITE_BUSY: database is locked` | Multiple connections competing | Confirm `maximum-pool-size=1` in `application.properties` |
| `SchemaManagementException: Schema-validation failed` | JPA entity column name doesn't match DB | Check `@Column(name=...)` against `.schema <table>` in sqlite3 shell |
| Teammate has stale data after pull | `.db` file was re-seeded and committed | Run `git pull` — the new `.db` replaces the old one automatically |
| `FOREIGN KEY constraint failed` on seed | `PRAGMA foreign_keys = ON` missing | Confirm the seed script sets this pragma before inserting |
| `.db` file shows as binary conflict in Git | Two people regenerated `.db` simultaneously | Designate one owner for re-seeding; coordinate before regenerating |

---

## Summary — Phase Checklist

```
Phase 0 — Git Repository
  [ ] Repo created on GitHub (private)
  [ ] git init + remote origin connected
  [ ] Folder structure created (backend/, database/migrations/, database/seeds/)
  [ ] .gitignore created — .db file is NOT ignored
  [ ] .env.example committed with non-credential config placeholders
  [ ] Initial commit pushed to main
  [ ] dev branch created and pushed
  [ ] Team agreed on one owner for .db re-seeding

Phase 1 — SQLite Database
  [ ] Python sqlite3 confirmed available (python3 -c "import sqlite3")
  [ ] SQLite-compatible schema written to database/migrations/V1__initial_schema.sql
  [ ] Schema applied: sqlite3 database/loop_scavenger_hunt.db < database/migrations/V1__initial_schema.sql
  [ ] Tables verified with .tables in sqlite3 shell

Phase 2 — Python Mock Data
  [ ] seed_mock_data.py runs without errors from repo root
  [ ] Data spot-checked in sqlite3 shell with JOIN query
  [ ] loop_scavenger_hunt.db committed to Git on dev branch

Phase 3 — Spring Boot
  [ ] sqlite-jdbc and hibernate-community-dialects dependencies added
  [ ] application.properties points to jdbc:sqlite:database/loop_scavenger_hunt.db
  [ ] spring.datasource.hikari.maximum-pool-size=1 set
  [ ] ddl-auto=validate confirmed
  [ ] App starts from backend/ and HikariPool reports success
  [ ] Teammate clone test: clone → cp .env.example .env → mvn spring-boot:run works
```

---

*One file holds all —*
*Clone the repo, game is ready.*
*No server. Just run.* 🚆
