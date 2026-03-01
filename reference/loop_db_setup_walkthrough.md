**NOTE**: This file was generated via Claud with following prompt as a part of the conversation in generating the database.
```
A database needs to be built using postgres using the schema. The database will be populated by some mock data using python sqlite3. The populated database needs to be connected to a java spring as mentioned in this conversation. Provide a markdown file of an outline of commands and process to run as an outline/walkthrough file
```

And then updated with:

```
update the walkthrough to reflect that the database needs to be built inside a git repo that development will occur
```
# The Loop Scavenger Hunt — Database Setup Walkthrough
> Stack: Git · PostgreSQL · Python (mock data) · Java Spring Boot

---

## Overview

This walkthrough covers four phases:

```
Phase 0 — Initialize the Git repository and project structure
Phase 1 — Build the Postgres database and apply the schema
Phase 2 — Populate the database with mock data via Python
Phase 3 — Connect the database to Java Spring Boot
```

Think of it like prepping an RPG campaign: Phase 0 is creating your save file and party roster, Phase 1 builds the world map, Phase 2 populates it with NPCs and loot, and Phase 3 hands the keys to the game engine.

---

## Prerequisites

Make sure the following are installed before starting:

| Tool | Version | Check Command |
|---|---|---|
| Git | 2.x+ | `git --version` |
| PostgreSQL | 14+ | `psql --version` |
| Python | 3.9+ | `python3 --version` |
| pip | latest | `pip --version` |
| Java | 17+ | `java --version` |
| Maven or Gradle | latest | `mvn --version` or `gradle --version` |

---

## Phase 0 — Initialize the Git Repository

> Do this first, before touching Postgres or writing any code. Every file created in subsequent phases should live inside this repo. Git is your party's shared inventory — everyone pulls from the same chest.

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
# Backend (Spring Boot will scaffold into /backend)
mkdir backend

# Database scripts — schema and seed files live here, tracked by git
mkdir -p database/migrations
mkdir -p database/seeds

# Copy your schema and seed files into the database folder
cp loop_schema_corrected.sql database/migrations/V1__initial_schema.sql
cp seed_mock_data.py database/seeds/seed_mock_data.py
```

The `V1__` prefix follows Flyway migration naming convention — useful if the team adopts Flyway later to manage schema changes automatically.

Your structure should look like:

```
loop-scavenger-hunt/
├── backend/                  ← Spring Boot project goes here (Phase 3)
├── database/
│   ├── migrations/
│   │   └── V1__initial_schema.sql
│   └── seeds/
│       └── seed_mock_data.py
├── .env.example              ← safe template for credentials (never .env itself)
├── .gitignore                ← created next
└── README.md
```

### 0.4 — Create the `.gitignore`

This is critical before your first commit. It prevents credentials, compiled output, and local config from ever reaching GitHub.

Create `.gitignore` in the project root:

```bash
# macOS / Linux
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
# Postgres local data (if running Postgres in a local data dir)
# -------------------------------------------------------
pgdata/
```

### 0.5 — Create a `.env.example` Template

This is the safe, committed version of your credentials file — values are placeholders, not real secrets. Teammates clone this and fill in their own values as `.env`.

```bash
# .env.example — commit this
DB_URL=jdbc:postgresql://localhost:5432/loop_scavenger_hunt
DB_USER=loop_app
DB_PASSWORD=changeme

PYTHON_DB_HOST=localhost
PYTHON_DB_PORT=5432
PYTHON_DB_NAME=loop_scavenger_hunt
PYTHON_DB_USER=loop_app
PYTHON_DB_PASSWORD=changeme
```

### 0.6 — Make the First Commit

```bash
# Stage all files
git add .

# Initial commit
git commit -m "chore: initial project structure, schema, and gitignore"

# Push to GitHub — sets upstream tracking on main
git push -u origin main
```

### 0.7 — Set Up Branch Strategy

The team should never develop directly on `main`. Create a `dev` branch as the shared integration target, and each developer works on their own feature branch off `dev`.

```bash
# Create and switch to the dev branch
git checkout -b dev
git push -u origin dev

# Example: a developer starting work on the database schema
git checkout -b feature/database-schema
# ... do work ...
git push -u origin feature/database-schema
# Open a Pull Request → dev on GitHub when ready
```

Recommended branch naming:

| Branch | Purpose |
|---|---|
| `main` | Stable, demo-ready code only |
| `dev` | Active integration branch — PRs merge here |
| `feature/database-schema` | Schema and migration files |
| `feature/auth` | JWT auth endpoints |
| `feature/checkin-api` | Check-in endpoint and scoring logic |
| `feature/map-view` | Frontend map component |

---

## Phase 1 — Build the PostgreSQL Database

### 1.1 — Start PostgreSQL

```bash
# macOS (Homebrew)
brew services start postgresql

# Ubuntu / Debian
sudo systemctl start postgresql

# Windows (run in PowerShell as Admin)
net start postgresql-x64-14
```

### 1.2 — Create the Database and User

```bash
# Open the Postgres shell as the superuser
psql -U postgres
```

```sql
-- Inside psql shell:

-- Create a dedicated database for the app
CREATE DATABASE loop_scavenger_hunt;

-- Create an app-specific user (never use superuser in your app)
CREATE USER loop_app WITH PASSWORD 'yourpassword';

-- Grant the user full access to the database
GRANT ALL PRIVILEGES ON DATABASE loop_scavenger_hunt TO loop_app;

-- Exit psql
\q
```

### 1.3 — Apply the Schema

The schema file is tracked in the repo at `database/migrations/V1__initial_schema.sql`.

```bash
# From the repo root
psql -U loop_app -d loop_scavenger_hunt -f database/migrations/V1__initial_schema.sql
```

Expected output — you should see one line per table with no errors:

```
CREATE TABLE   ← users
CREATE TABLE   ← stations
CREATE TABLE   ← point_of_interests
CREATE TABLE   ← stamp_books
CREATE TABLE   ← stamp_book_entries
```

### 1.4 — Verify Tables Exist

```bash
# Connect to the database
psql -U loop_app -d loop_scavenger_hunt
```

```sql
-- Inside psql: list all tables
\dt

-- Should output:
--  Schema |        Name         | Type  |   Owner
-- --------+---------------------+-------+----------
--  public | point_of_interests  | table | loop_app
--  public | stamp_book_entries  | table | loop_app
--  public | stamp_books         | table | loop_app
--  public | stations            | table | loop_app
--  public | users               | table | loop_app

-- Exit
\q
```

---

## Phase 2 — Populate with Mock Data (Python)

> Note: The mock data script uses `psycopg2` (the Postgres adapter for Python).
> `sqlite3` is Python's built-in SQLite driver — for Postgres you need `psycopg2`.
> The usage is nearly identical; just swap the connection string.

### 2.1 — Install the Postgres Python Driver

```bash
pip install psycopg2-binary
```

### 2.2 — Create the Mock Data Script

The seed script lives at `database/seeds/seed_mock_data.py` in the repo.
Update the connection block at the top to use your local credentials (pull values from your `.env`):

```python
import psycopg2
from datetime import datetime, timedelta

# -------------------------------------------------------
# CONNECTION — update credentials to match your setup
# -------------------------------------------------------
conn = psycopg2.connect(
    dbname="loop_scavenger_hunt",
    user="loop_app",
    password="yourpassword",
    host="localhost",
    port="5432"
)
cursor = conn.cursor()

# -------------------------------------------------------
# SEED: stations
# CTA L stations — real Chicago coordinates
# These are inserted first because point_of_interests.station_id references them
# -------------------------------------------------------
stations = [
    ("Harold Washington Library Station", -87.627800, 41.876200),
    ("Millennium Station",                -87.624500, 41.884400),
    ("Chicago/State Station",             -87.627900, 41.896900),
    ("Clark/Lake Station",                -87.631700, 41.885700),
    ("Adams/Wabash Station",              -87.626300, 41.879700),
]

cursor.executemany(
    "INSERT INTO stations (station_name, longitude, latitude) VALUES (%s, %s, %s)",
    stations
)
print(f"Inserted {len(stations)} stations")

# -------------------------------------------------------
# SEED: point_of_interests
# Mix of station-adjacent POIs and standalone POIs (station_id = NULL)
# station_id references the stations rows just inserted above
# -------------------------------------------------------
# Fetch station IDs so we can reference them correctly
cursor.execute("SELECT id, station_name FROM stations ORDER BY id")
station_rows = cursor.fetchall()
station_map = {name: sid for sid, name in station_rows}

points_of_interest = [
    # (poi_name, longitude, latitude, station_id, points)
    ("Harold Washington Library",     -87.627200, 41.876100, station_map["Harold Washington Library Station"], 100),
    ("Grant Park",                    -87.619000, 41.876400, station_map["Millennium Station"],                 80),
    ("Art Institute of Chicago",      -87.623600, 41.879400, station_map["Adams/Wabash Station"],              120),
    ("Millennium Park",               -87.622700, 41.882600, station_map["Millennium Station"],                 90),
    ("Chicago Riverwalk",             -87.630700, 41.888500, station_map["Clark/Lake Station"],                 75),
    ("Cloud Gate (The Bean)",         -87.623300, 41.882700, None,  60),   # standalone — no specific station
    ("Chicago Cultural Center",       -87.624600, 41.883100, None,  70),   # standalone
]

cursor.executemany(
    """
    INSERT INTO point_of_interests (poi_name, longitude, latitude, station_id, points)
    VALUES (%s, %s, %s, %s, %s)
    """,
    points_of_interest
)
print(f"Inserted {len(points_of_interest)} points of interest")

# -------------------------------------------------------
# SEED: users
# Mock players with varying scores
# -------------------------------------------------------
users = [
    ("LoopRunner99",  "runner99@example.com",  "hashed_pw_1", 340, 120),
    ("BeanSeeker",    "bean@example.com",       "hashed_pw_2", 210,  90),
    ("CTAChaser",     "cta@example.com",        "hashed_pw_3", 580, 200),
    ("WabashWalker",  "wabash@example.com",     "hashed_pw_4",  75,  75),
    ("LoopNewbie",    "newbie@example.com",      "hashed_pw_5",   0,   0),
]

cursor.executemany(
    """
    INSERT INTO users (username, email, password_hash, hi_score, weekly_score)
    VALUES (%s, %s, %s, %s, %s)
    """,
    users
)
print(f"Inserted {len(users)} users")

# -------------------------------------------------------
# SEED: stamp_books
# One stamp book per user — auto-linked by user_id
# stamp_book_entries are pre-populated for each user x each POI
# -------------------------------------------------------
cursor.execute("SELECT id FROM users ORDER BY id")
user_ids = [row[0] for row in cursor.fetchall()]

cursor.execute("SELECT id FROM point_of_interests ORDER BY id")
poi_ids = [row[0] for row in cursor.fetchall()]

for user_id in user_ids:
    # Create the stamp book for this user
    cursor.execute(
        "INSERT INTO stamp_books (user_id) VALUES (%s) RETURNING id",
        (user_id,)
    )
    book_id = cursor.fetchone()[0]

    # Pre-populate one entry per POI — all unvisited by default
    for poi_id in poi_ids:
        cursor.execute(
            """
            INSERT INTO stamp_book_entries (stamp_book_id, location_id, visited, visited_at)
            VALUES (%s, %s, FALSE, NULL)
            """,
            (book_id, poi_id)
        )

print(f"Created {len(user_ids)} stamp books with {len(poi_ids)} entries each")

# -------------------------------------------------------
# SEED: mark some stamps as visited for LoopRunner99
# Simulates a player mid-game
# -------------------------------------------------------
cursor.execute("SELECT id FROM users WHERE username = 'LoopRunner99'")
runner_id = cursor.fetchone()[0]

cursor.execute("SELECT id FROM stamp_books WHERE user_id = %s", (runner_id,))
runner_book_id = cursor.fetchone()[0]

# Grab first 3 POI IDs to mark as visited
visited_poi_ids = poi_ids[:3]
for i, poi_id in enumerate(visited_poi_ids):
    visit_time = datetime.now() - timedelta(hours=3 - i)  # staggered visit times
    cursor.execute(
        """
        UPDATE stamp_book_entries
        SET visited = TRUE, visited_at = %s
        WHERE stamp_book_id = %s AND location_id = %s
        """,
        (visit_time, runner_book_id, poi_id)
    )

print(f"Marked {len(visited_poi_ids)} stamps as visited for LoopRunner99")

# -------------------------------------------------------
# COMMIT and CLOSE
# -------------------------------------------------------
conn.commit()
cursor.close()
conn.close()
print("Mock data seeding complete.")
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
Mock data seeding complete.
```

### 2.4 — Verify Mock Data in Postgres

```bash
psql -U loop_app -d loop_scavenger_hunt
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
    JOIN stamp_books sb       ON sb.user_id = u.id
    JOIN stamp_book_entries sbe ON sbe.stamp_book_id = sb.id
    JOIN point_of_interests poi ON poi.id = sbe.location_id
WHERE u.username = 'LoopRunner99'
ORDER BY sbe.visited DESC, sbe.visited_at ASC;

\q
```

---

## Phase 3 — Connect Spring Boot to PostgreSQL

### 3.1 — Add Dependencies

In your `pom.xml` (Maven):

```xml
<!-- PostgreSQL JDBC Driver -->
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>

<!-- Spring Data JPA -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
```

Or in `build.gradle` (Gradle):

```groovy
runtimeOnly 'org.postgresql:postgresql'
implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
```

### 3.2 — Configure `application.properties`

Located at `src/main/resources/application.properties`:

```properties
# -------------------------------------------------------
# DATABASE CONNECTION
# -------------------------------------------------------
spring.datasource.url=jdbc:postgresql://localhost:5432/loop_scavenger_hunt
spring.datasource.username=loop_app
spring.datasource.password=yourpassword
spring.datasource.driver-class-name=org.postgresql.Driver

# -------------------------------------------------------
# JPA / HIBERNATE
# validate  → checks schema matches entities, does NOT alter tables (use in production)
# update    → auto-alters tables to match entities (use during development only)
# create    → drops and recreates tables on every start (dangerous — wipes data)
# none      → hands-off, use when Flyway/Liquibase manages schema (recommended for teams)
# -------------------------------------------------------
spring.jpa.hibernate.ddl-auto=validate

# Logs SQL queries to console — helpful for debugging, disable in production
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# Tells Hibernate we're speaking Postgres
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
```

> **Important:** `ddl-auto=validate` is safest here because the schema already exists from Phase 1.
> It confirms your Java entities match the DB structure without touching any data.

### 3.3 — Verify the Connection

Start the Spring Boot app:

```bash
# Maven
mvn spring-boot:run

# Gradle
./gradlew bootRun
```

Look for this line in startup logs — it confirms Postgres is connected:

```
HikariPool-1 - Start completed.
```

If you see this instead, double-check your credentials and that Postgres is running:

```
Connection to localhost:5432 refused. Check that the hostname and port are correct
```

### 3.4 — Use Environment Variables for Credentials

Credentials must never be hardcoded in `application.properties` since this file is committed to the repo. Use environment variables sourced from your local `.env` (which is gitignored).

Your teammates copy `.env.example` → `.env` and fill in their own local values:

```bash
# Each developer runs this once after cloning
cp .env.example .env
# Then edit .env with their actual local Postgres credentials
```

Update `application.properties` to read from environment variables — this file is safe to commit:

```properties
# application.properties — committed to repo, no secrets here
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USER}
spring.datasource.password=${DB_PASSWORD}
```

Export your `.env` variables before running the app:

```bash
# macOS / Linux: export from your .env file
export $(grep -v '^#' .env | xargs)
mvn spring-boot:run

# Windows PowerShell
Get-Content .env | ForEach-Object { $k,$v = $_ -split '='; [System.Environment]::SetEnvironmentVariable($k, $v) }
mvn spring-boot:run
```

> **Rule:** If it's a secret, it lives in `.env`. If it's config, it lives in `application.properties`. The `.env` file never touches GitHub.

---

## Quick Troubleshooting Reference

| Symptom | Likely Cause | Fix |
|---|---|---|
| `psql: error: connection refused` | Postgres not running | `brew services start postgresql` or `sudo systemctl start postgresql` |
| `FATAL: role "loop_app" does not exist` | User not created | Re-run Step 1.2 |
| `ERROR: relation "point_of_interest" does not exist` | Table name mismatch | Confirm schema uses `point_of_interests` (plural) |
| `psycopg2.OperationalError: could not connect` | Wrong host/port in Python script | Confirm `host="localhost"` and `port="5432"` match your Postgres config |
| `SchemaManagementException: Schema-validation failed` | JPA entity doesn't match DB column | Check `@Column` names in Java entities against actual table columns |
| `HikariPool: Connection is not available` | DB is down or credentials wrong | Verify `application.properties` values, confirm Postgres is running |
| `.env` credentials visible on GitHub | `.env` not in `.gitignore` before first commit | Run `git rm --cached .env`, confirm `.gitignore` has `.env`, re-commit |
| `error: src refspec main does not match any` | No commits made yet | Run `git add . && git commit -m "init"` before pushing |
| Teammate can't connect to DB after cloning | They haven't set up their local `.env` | Have them run `cp .env.example .env` and fill in their credentials |

---

## Summary — Phase Checklist

```
Phase 0 — Git Repository
  [ ] Repo created on GitHub (private)
  [ ] git init + remote origin set
  [ ] Folder structure created (backend/, database/migrations/, database/seeds/)
  [ ] Schema file copied to database/migrations/V1__initial_schema.sql
  [ ] Seed script copied to database/seeds/seed_mock_data.py
  [ ] .gitignore created with secrets, build output, and IDE files excluded
  [ ] .env.example created and committed (placeholder values only)
  [ ] Initial commit pushed to main
  [ ] dev branch created and pushed
  [ ] Team feature branches established off dev

Phase 1 — PostgreSQL
  [ ] Postgres installed and running
  [ ] Database loop_scavenger_hunt created
  [ ] User loop_app created with privileges
  [ ] Schema applied via database/migrations/V1__initial_schema.sql
  [ ] Tables verified with \dt

Phase 2 — Python Mock Data
  [ ] psycopg2-binary installed
  [ ] .env created locally from .env.example with real credentials
  [ ] seed_mock_data.py runs without errors from database/seeds/
  [ ] Data verified in psql with spot-check queries

Phase 3 — Spring Boot
  [ ] PostgreSQL + JPA dependencies added to pom.xml / build.gradle
  [ ] application.properties uses ${DB_URL}, ${DB_USER}, ${DB_PASSWORD} — no hardcoded values
  [ ] ddl-auto=validate confirmed (schema-safe)
  [ ] .env variables exported before running the app
  [ ] App starts and HikariPool reports successful connection
  [ ] Confirmed .env is gitignored — run: git status | grep .env (should not appear)
```

---

*Schema built, data seeded —*
*Spring shakes hands with Postgres.*
*The Loop comes alive.* 🚆