# CTA Scavenger Hunt - Quick Start & API Reference

**Last Updated:** March 1, 2026  
**Version:** 1.0 - Ready for Testing

---

## 🚀 Quick Start

### Prerequisites
- Java 21+
- Node.js 18+
- npm or yarn
- SQLite 3

### Setup & Run

#### 1. Start Backend
```bash
cd /home/paul/Documents/hackathon/CTA_Scavenger_Hunt
./mvnw spring-boot:run -DskipTests
```
✅ Backend runs on `http://localhost:8080`

#### 2. Start Frontend (in new terminal)
```bash
cd /home/paul/Documents/hackathon/CTA_Scavenger_Hunt/frontend
npm run dev
```
✅ Frontend runs on `http://localhost:5173`

#### 3. Open Browser
Navigate to `http://localhost:5173` and start using the app

---

## 📱 User Flow

### 1. Register
- Click "Create one" on login page
- Enter username, email, password
- Automatically creates stampbook with all locations
- Redirects to map after successful registration

### 2. Login
- Enter email and password
- Returns auth token (stored in browser)
- Redirects to map view

### 3. Explore Map
- Displays all CTA stations
- Shows current location (with GPS)
- Tap station to see nearby POIs

### 4. Check-in
- Navigate to a POI location
- Click "Check In" button
- Earns points (first visit = more points)
- Updates stampbook and score

### 5. View Progress
- **Stampbook** - See all visited locations
- **Leaderboard** - See ranking among players
- **Profile** - Check score and user info

---

## 📡 API Reference

### Authentication Endpoints

#### Register User
```
POST /auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "secure_password"
}

Response 201:
{
  "token": "uuid_token_123",
  "userId": 1,
  "username": "john_doe"
}
```

#### Login User
```
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "secure_password"
}

Response 200:
{
  "token": "uuid_token_123",
  "userId": 1,
  "username": "john_doe"
}
```

### User Profile Endpoints

#### Get Profile
```
GET /users/{userId}
Authorization: Bearer {token}

Response 200:
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "hiScore": 2500,
  "weeklyScore": 450,
  "createdAt": "2026-03-01T10:30:00"
}
```

#### Update Username
```
PATCH /users/{userId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "username": "new_username"
}

Response 200:
{
  "id": 1,
  "username": "new_username",
  ...
}
```

#### Get User's Stampbook
```
GET /users/{userId}/stampbook
Authorization: Bearer {token}

Response 200:
[
  {
    "id": 1,
    "pointOfInterest": {
      "id": 10,
      "poiName": "Willis Tower",
      "latitude": 41.8789,
      "longitude": -87.6359
    },
    "visited": true,
    "visitedAt": "2026-03-01T15:30:00"
  },
  ...
]
```

### Location Endpoints

#### Get All Stations
```
GET /api/test/stations
Authorization: Bearer {token}

Response 200:
[
  {
    "id": 1,
    "poiName": "Clark/Lake Station",
    "latitude": 41.8858,
    "longitude": -87.6281,
    "stationId": 1,
    "points": 100
  },
  ...
]
```

#### Get Nearby POIs
```
GET /poi/{stationId}/nearby
Authorization: Bearer {token}

Response 200:
[
  {
    "id": 45,
    "poiName": "Willis Tower",
    "latitude": 41.8789,
    "longitude": -87.6359,
    "stationId": 1,
    "points": 50
  },
  ...
]
```

#### Check-in at Location
```
POST /checkin
Authorization: Bearer {token}
Content-Type: application/json

{
  "userId": 1,
  "locationId": 45,
  "userLat": 41.8789,
  "userLng": -87.6359
}

Response 200:
{
  "pointsEarned": 50,
  "totalScore": 500,
  "isFirstVisit": true
}
```

### Leaderboard Endpoints

#### Get Global Leaderboard
```
GET /leaderboard
Authorization: Bearer {token}

Response 200:
[
  {
    "userId": 1,
    "username": "top_player",
    "hiScore": 5000,
    "weeklyScore": 800,
    "rank": 1
  },
  {
    "userId": 2,
    "username": "second_place",
    "hiScore": 4500,
    "weeklyScore": 750,
    "rank": 2
  },
  ...
]
```

#### Get Weekly Leaderboard
```
GET /leaderboard/weekly
Authorization: Bearer {token}

Response 200:
[
  {
    "userId": 3,
    "username": "weekly_winner",
    "hiScore": 3000,
    "weeklyScore": 900,
    "rank": 1
  },
  ...
]
```

### Debug Endpoints

#### Check API Key Status
```
GET /api/test/api-keys/status

Response 200:
{
  "google_maps_loaded": true,
  "google_maps_key_preview": "AIzaSyC...",
  "message": "API keys successfully loaded"
}
```

#### Test Geofencing
```
GET /api/test/geofence?userLat=41.88574&userLng=-87.62773&targetLat=41.88574&targetLng=-87.62773

Response 200:
{
  "distance_meters": 0.0,
  "within_geofence": true,
  "geofence_radius_meters": 150
}
```

---

## 🔐 Authentication

### Token Storage
- Token is stored in browser's localStorage
- Key: `auth_token`
- Automatically included in all requests

### Using Tokens
```typescript
// Frontend automatically adds this header:
Authorization: Bearer {token}
```

### Demo Mode
- Click "Use Demo User (Offline)" on login page
- Uses pre-populated demo data
- No backend connection needed
- Useful for testing UI offline

---

## 🗄️ Database Schema

### profiles
```
id (PK)
username (UNIQUE)
email (UNIQUE)
password_hash
hi_score
weekly_score
created_at
```

### point_of_interests
```
id (PK)
poi_name
longitude
latitude
station_id (FK, self-referencing)
points
```

### stamp_books
```
id (PK)
profile_id (FK, UNIQUE)
```

### stamp_book_entries
```
id (PK)
stamp_book_id (FK)
location_id (FK)
visited (0/1)
visited_at
```

---

## 🐛 Troubleshooting

### Backend won't start
```
Error: Database file not found
Solution: Check if src/SQL/chica_go.db exists
Location: /home/paul/Documents/hackathon/CTA_Scavenger_Hunt/src/SQL/chica_go.db
```

### Frontend can't connect to backend
```
Error: Failed to fetch from http://localhost:8080
Solution: 
1. Verify backend is running on port 8080
2. Check VITE_API_BASE_URL in frontend
3. Check browser console for CORS errors
```

### API key not loaded
```
Error: API keys not found at src/api-keys/google-maps
Solution: 
1. Check if file exists: src/api-keys/google-maps
2. File should contain valid Google Maps API key
3. Restart backend after adding key
```

### Location permission denied
```
Error: GPS is not available / Unable to read current location
Solution:
1. Allow browser to access location
2. May not work on http://localhost (some browsers)
3. Use HTTPS in production
4. Try different browser
```

### Login fails with valid credentials
```
Error: Invalid email or password
Solution:
1. Verify email is correct (case-sensitive in check)
2. Verify password wasn't changed
3. Check browser console for exact error
4. Try registering new account
```

---

## 📊 Example Workflows

### Workflow 1: Register & Check-in
```bash
# 1. Register
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "explorer",
    "email": "explorer@example.com",
    "password": "password123"
  }'
# Response: { "token": "...", "userId": 1, "username": "explorer" }

# 2. Get nearby locations
curl http://localhost:8080/poi/1/nearby \
  -H "Authorization: Bearer {token}"
# Response: [{ "id": 45, "poiName": "Willis Tower", ... }]

# 3. Check-in
curl -X POST http://localhost:8080/checkin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "userId": 1,
    "locationId": 45,
    "userLat": 41.8789,
    "userLng": -87.6359
  }'
# Response: { "pointsEarned": 50, "totalScore": 50, "isFirstVisit": true }
```

### Workflow 2: View Progress
```bash
# 1. Get profile
curl http://localhost:8080/users/1 \
  -H "Authorization: Bearer {token}"

# 2. Get stampbook
curl http://localhost:8080/users/1/stampbook \
  -H "Authorization: Bearer {token}"

# 3. Get leaderboard
curl http://localhost:8080/leaderboard \
  -H "Authorization: Bearer {token}"
```

---

## 🎯 Performance Tips

### Frontend
- Uses React hooks for state management
- Lazy loads map tiles with Leaflet
- Falls back to demo data if backend unavailable
- Caches API responses in context

### Backend
- SQLite with single connection pool (no locking)
- Eager loading for relationships where needed
- Transactional boundaries for data consistency
- JPA query optimization with proper indices

### Database
- Foreign key constraints enforced
- Cascading deletes for data integrity
- Self-referencing table for stations/POIs
- Proper indexing on common queries

---

## 📚 Documentation Files

- **CODE_REVIEW.md** - Detailed code review and architecture analysis
- **INTEGRATION_TESTING.md** - Complete testing checklist and data flows
- **CHANGES_SUMMARY.md** - Summary of all code changes and fixes
- **QUICK_START.md** - This file (quick reference)

---

## 🔗 Important URLs

| Component | URL | Port |
|-----------|-----|------|
| Frontend | http://localhost:5173 | 5173 |
| Backend | http://localhost:8080 | 8080 |
| Database | src/SQL/chica_go.db | N/A |
| API Base | http://localhost:8080 | 8080 |

---

## ✅ Status

**Last Verified:** March 1, 2026  
**Backend:** ✅ Compiles (41 files)  
**Frontend:** ✅ Builds (48 modules)  
**Database:** ✅ Ready  
**API:** ✅ Complete  
**Integration:** ✅ Ready for Testing  

---

**Ready to start? Run the quick start commands above!** 🚀

