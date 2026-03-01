# External API Integration Setup Guide

## What I've Created For You

I've implemented **Milestone 3 (External API Integration)** with the following components:

### 1. **Dependencies Added** (`pom.xml`)
- ✅ `spring-boot-starter-webflux` - For WebClient to make HTTP requests to external APIs

### 2. **Configuration** (`application.properties`)
- Database connection settings
- Overpass API URL for CTA station data
- Geofence radius (150 meters by default)
- Google Maps API configuration (you'll need to add your API key later)

### 3. **DTOs Created**
- `OverpassStationDTO` - Represents station data from Overpass API
- `OverpassResponse` - Maps the JSON response structure from Overpass API

### 4. **Core Services**

#### `OverpassApiService`
- Fetches CTA L station data from OpenStreetMap via Overpass API
- Two methods:
  - `fetchCTAStations()` - Targeted query for CTA stations
  - `fetchCTAStationsSimple()` - Broader query (more reliable)

#### `StationDataSeeder` (CommandLineRunner)
- **Runs automatically on app startup**
- Checks if stations table is empty
- If empty, fetches stations from Overpass API and seeds the database
- Falls back to 10 hardcoded Loop stations if API fails
- Only runs once - skips if data already exists

#### `GeofencingService`
- Validates user proximity to locations
- Uses Haversine formula for accurate distance calculation
- Configurable radius (default: 150m)
- Returns distance in meters

### 5. **Test Controller** (`TestApiController`)
Test endpoints to verify everything works:
- `GET /api/test/overpass/fetch` - Test Overpass API connection
- `GET /api/test/stations` - View all seeded stations
- `GET /api/test/geofence?userLat=X&userLng=Y&targetLat=X&targetLng=Y` - Test geofencing
- `POST /api/test/geofence/radius?radiusMeters=X` - Adjust geofence for demos

---

## How to Get Started

### Step 1: Database Setup

Make sure PostgreSQL is running with a database called `chica_go`:

```bash
# If using Docker:
docker run --name postgres-chica-go -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=chica_go -p 5432:5432 -d postgres

# Or create database manually:
psql -U postgres
CREATE DATABASE chica_go;
\q
```

Update `application.properties` with your database credentials if different.

### Step 2: Build and Run

```bash
# From project root
./mvnw clean install -DskipTests
./mvnw spring-boot:run
```

**What happens on startup:**
1. Spring Boot starts
2. JPA creates/updates database tables
3. `StationDataSeeder` runs automatically
4. If stations table is empty, it fetches CTA stations from Overpass API
5. Fallback to 10 hardcoded stations if API fails

### Step 3: Test the Integration

Once the app is running, open a browser or use curl:

```bash
# 1. Check seeded stations
curl http://localhost:8080/api/test/stations

# 2. Test Overpass API (may be slow, ~10-30 seconds)
curl http://localhost:8080/api/test/overpass/fetch

# 3. Test geofencing - Example: user at State/Lake station
curl "http://localhost:8080/api/test/geofence?userLat=41.88574&userLng=-87.62773&targetLat=41.88574&targetLng=-87.62773"

# 4. Test geofencing - User too far away
curl "http://localhost:8080/api/test/geofence?userLat=41.89000&userLng=-87.62773&targetLat=41.88574&targetLng=-87.62773"

# 5. Adjust geofence radius for demo (make it 500m instead of 150m)
curl -X POST "http://localhost:8080/api/test/geofence/radius?radiusMeters=500"
```

---

## Next Steps (Task 3.3 - POI Nearby Relationships)

After testing the basics, you should:

1. **Create a service to compute nearby relationships** between stations and POIs
2. **Add an endpoint** `GET /stations/{id}/nearby` 
3. **Populate POI data** (you'll need to either:
   - Query Overpass for points of interest near each station
   - Manually seed interesting locations
   - Use Google Places API)

---

## Troubleshooting

### "Cannot resolve symbol 'WebClient'"
- Your IDE needs to refresh Maven dependencies
- In IntelliJ: Right-click `pom.xml` → Maven → Reload Project
- In VS Code: Reload window or run the build command

### "No stations seeded"
- Check the logs - `StationDataSeeder` will show what happened
- If Overpass API times out, it will use the 10 fallback stations
- Verify database connection in `application.properties`

### "Overpass API returns no results"
- The API can be slow or overloaded
- The `fetchCTAStationsSimple()` method has a broader query
- Fallback stations will be used automatically

### Spring Security blocking requests
- If you've implemented auth (Milestone 1.4), the test endpoints may be blocked
- Either add them to permitAll() in SecurityConfig or use authenticated requests

---

## Key Files Created

```
src/main/java/com/hackathon/chica_go/
├── controller/
│   └── TestApiController.java         # Test endpoints
├── dto/
│   ├── OverpassStationDTO.java        # Station data transfer object
│   └── OverpassResponse.java          # Overpass API response mapping
├── service/
│   ├── OverpassApiService.java        # Fetch CTA stations from Overpass
│   ├── StationDataSeeder.java         # Auto-seed on startup
│   └── GeofencingService.java         # Distance/proximity validation
└── src/main/resources/
    └── application.properties          # Configuration
```

---

## Time Saved ✅

- ✅ **Task 3.1 (Overpass API Integration)** - DONE
- ✅ **Task 3.2 (Geofencing)** - DONE (no Google API needed, using Haversine formula)
- ⏳ **Task 3.3 (POI Nearby)** - Ready to implement

**Estimated time:** This would have taken ~3.5 hours per the MVP plan. You're ready to move forward!

---

## Demo Mode Tips

For your hackathon demo, you can:
1. **Increase geofence radius** via the test endpoint so you don't have to be right at the station
2. **Pre-seed interesting POIs** manually with descriptions
3. **Use fallback stations** (no external API dependency during demo)

Good luck! 🚆

