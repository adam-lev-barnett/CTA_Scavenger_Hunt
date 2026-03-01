# CTA Scavenger Hunt - Code Review Report

**Date:** March 1, 2026  
**Status:** ⚠️ **ISSUES FOUND - See Critical Issues Below**

---

## Executive Summary

The CTA Scavenger Hunt application has a **Spring Boot backend**, **React/TypeScript frontend**, and **SQLite database**. The project structure is well-organized, but there are **critical issues preventing full integration**, specifically the **missing authentication endpoints**.

---

## 🔴 CRITICAL ISSUES

### 1. **Missing Authentication Controller** ❌
**Severity:** CRITICAL  
**Location:** Backend - Missing `/src/main/java/com/hackathon/chica_go/controller/AuthController.java`

**Problem:**
- Frontend expects `/auth/login` and `/auth/register` endpoints (see `frontend/src/services/api.ts` lines 58, 62)
- Backend has **NO authentication controller** implemented
- `ProfileController` has `/users/register` but frontend calls `/auth/register`
- Users cannot log in or register via the real API

**Impact:**
- User authentication flow is broken
- Frontend demo mode works, but real API integration fails
- Application cannot authenticate users

**Required Endpoints:**
```
POST /auth/login      → { email, password } → { token, userId, username }
POST /auth/register   → { username, email, password } → { token, userId, username }
```

**Solution:**
- Create `AuthController` with JWT or token-based authentication
- Implement login endpoint that validates credentials and returns auth token
- Implement register endpoint that creates profile and returns auth token
- Update `ProfileController` to match frontend expectations or redirect from auth

---

### 2. **Missing Checkpoints for Frontend API Routes** ⚠️
**Severity:** HIGH  
**Affected Endpoints:**

| Frontend Call | Expected Backend | Status |
|---|---|---|
| `GET /api/test/stations` | Get all stations | ✅ Exists |
| `GET /stations/{id}/nearby` | Get nearby POIs | ❌ NOT FOUND |
| `GET /point-of-interest/station/{id}` | Get nearby POIs | ❌ NOT FOUND |
| `POST /checkin` | Check in at location | ❌ NOT FOUND |
| `GET /users/{userId}/stampbook` | Get user's stampbook | ❌ NOT FOUND |
| `GET /leaderboard` | Get leaderboard | ❌ NOT FOUND |
| `PATCH /users/{userId}` | Update username | ✅ Exists |
| `GET /users/{userId}` | Get profile | ✅ Exists |

**Problem:**
- Frontend has fallback logic trying multiple endpoints (api.ts lines 74-85)
- But many critical endpoints are not implemented
- Application relies on demo data when real API fails

**Solution:**
- Create missing controllers and endpoints
- Ensure endpoint paths match frontend expectations exactly

---

## ✅ Architecture Analysis

### Backend Structure ✓
```
src/main/java/com/hackathon/chica_go/
├── ChicaGoApplication.java          ✓ Main Spring Boot app
├── config/
│   ├── ApiKeyConfiguration.java     ✓ API key loading
│   └── SecurityConfig.java          ⚠️ Security disabled (permitAll)
├── controller/
│   ├── PointOfInterestController    ✓ POI endpoints
│   ├── ProfileController            ✓ Profile endpoints
│   ├── StampBookController          ✓ Stampbook endpoints
│   ├── StampBookEntryController     ✓ Stampbook entry endpoints
│   ├── TestApiController            ✓ Test endpoints
│   └── AuthController               ❌ MISSING
├── service/
│   ├── ApiKeyService                ✓ API key management
│   ├── GeofencingService            ✓ Distance calculation
│   ├── OverpassApiService           ✓ External API integration
│   ├── PointOfInterestService       ✓ POI business logic
│   ├── ProfileService               ✓ User business logic
│   └── StampBookService             ✓ Stampbook business logic
├── model/
│   ├── Profile                      ✓ User entity
│   ├── PointOfInterest              ✓ Location entity
│   ├── StampBook                    ✓ Stampbook entity
│   ├── StampBookEntry               ✓ Stampbook entry entity
│   └── Other entities               ✓
└── repository/
    └── All repositories             ✓ JPA repositories
```

### Frontend Structure ✓
```
frontend/src/
├── App.tsx                          ✓ Main routing
├── pages/
│   ├── LoginPage.tsx                ✓ Auth page
│   ├── RegisterPage.tsx             ✓ Auth page
│   ├── MapPage.tsx                  ✓ Main map interface
│   ├── StampBookPage.tsx            ✓ Stampbook view
│   ├── LeaderboardPage.tsx          ✓ Leaderboard view
│   └── ProfilePage.tsx              ✓ User profile
├── services/
│   ├── api.ts                       ✓ API client
│   └── demoData.ts                  ✓ Demo fallback data
├── hooks/
│   └── useAuth.tsx                  ✓ Auth context hook
└── components/
    ├── NavBar.tsx                   ✓ Navigation
    ├── ProtectedRoute.tsx           ✓ Auth guard
    └── Other components             ✓
```

### Database ✓
```
src/SQL/
├── chica_go.db                      ✓ SQLite database
└── schema/
    └── db_schema.sql                ✓ Schema defined

Tables:
- profiles                           ✓ User accounts
- point_of_interests                 ✓ Locations
- stamp_books                        ✓ User stampbooks
- stamp_book_entries                 ✓ Location visits
```

---

## 📋 Integration Analysis

### 1. Database to Backend Integration
**Status:** ✅ **GOOD**

✓ Hibernate/JPA properly configured  
✓ SQLite JDBC driver included in pom.xml  
✓ DDL auto-update enabled  
✓ Foreign key constraints defined  
✓ Repositories properly implement JPA methods  

**Configuration (application.properties):**
```properties
spring.datasource.url=jdbc:sqlite:src/SQL/chica_go.db
spring.datasource.driver-class-name=org.sqlite.JDBC
spring.jpa.database-platform=org.hibernate.community.dialect.SQLiteDialect
spring.jpa.hibernate.ddl-auto=update
```

---

### 2. Backend to Frontend API Integration
**Status:** ⚠️ **PARTIAL - CRITICAL GAPS**

**Working Endpoints:**
- ✅ `GET /poi` - Get all POIs
- ✅ `GET /poi/{id}` - Get POI by ID
- ✅ `GET /users/{userId}` - Get user profile
- ✅ `PATCH /users/{userId}` - Update username
- ✅ `GET /api/test/stations` - Get all stations
- ✅ `GET /stamp-books/user/{userId}` - Get stampbook
- ✅ `GET /stamp-books/{stampBookId}/entries` - Get stampbook entries
- ✅ `GET /api/test/api-keys/status` - Check API key status

**Missing Endpoints:**
- ❌ `POST /auth/login` - User login
- ❌ `POST /auth/register` - User registration
- ❌ `POST /checkin` - Check in at location
- ❌ `GET /leaderboard` - Get leaderboard
- ❌ Multiple `/stations/{id}/nearby` variations

**Frontend API Client (api.ts):**
```typescript
async login(email: string, password: string): Promise<AuthResponse>
async register(username: string, email: string, password: string): Promise<AuthResponse>
async getNearbyPois(stationId: number, token?: string): Promise<PointOfInterest[]>
async checkIn(userId: number, locationId: number, userLat: number, userLng: number, token?: string): Promise<CheckInResponse>
async getStampBook(userId: number, token?: string): Promise<StampBookEntry[]>
async getLeaderboard(token?: string): Promise<LeaderboardEntry[]>
async getProfile(userId: number, token?: string): Promise<Profile>
async updateUsername(userId: number, username: string, token?: string): Promise<Profile>
```

**How it Works:**
1. Frontend tries real API endpoint
2. If real API fails, falls back to demo data
3. Demo mode works, but real API integration is incomplete

---

### 3. External API Integration
**Status:** ✅ **GOOD**

**Google Maps API:**
- ✅ Configuration in `ApiKeyConfiguration.java`
- ✅ Key loaded from `src/api-keys/google-maps` file
- ✅ Status check endpoint: `GET /api/test/api-keys/status`
- ✅ Key is properly injected as a Spring bean

**Overpass API (CTA Stations):**
- ✅ `OverpassApiService` fetches CTA stations
- ✅ Test endpoint: `GET /api/test/overpass/fetch`
- ✅ GeofencingService calculates distance

---

## 🔍 Code Quality Observations

### Good Practices ✅
1. **Proper Use of Spring Boot:**
   - `@Service`, `@Repository`, `@Controller` annotations used correctly
   - Dependency injection with `@RequiredArgsConstructor`
   - Exception handling with Spring exceptions

2. **Database Design:**
   - Foreign key constraints with cascading deletes
   - Self-referencing table for stations/POIs
   - Proper normalization

3. **Frontend Architecture:**
   - React hooks and context API for state management
   - Protected routes with authentication guard
   - Fallback demo data for offline use

4. **API Design:**
   - RESTful endpoints
   - Proper HTTP status codes (201 for created, 204 for no content)
   - Request/response DTOs

### Areas for Improvement ⚠️
1. **Security:**
   - `SecurityConfig` has `permitAll()` - no real security
   - No JWT or token validation
   - No CORS configuration
   - No rate limiting

2. **Error Handling:**
   - Generic error messages could be more specific
   - Some endpoints throw `ResponseStatusException` inconsistently

3. **API Documentation:**
   - No Swagger/OpenAPI documentation
   - Endpoint contracts not well documented

4. **Testing:**
   - Frontend has no unit tests
   - Backend has minimal test coverage

---

## 🎯 Endpoint Mapping

### Implemented Endpoints ✅

| Method | Path | Status | Controller |
|---|---|---|---|
| POST | `/auth/login` | ❌ MISSING | - |
| POST | `/auth/register` | ❌ MISSING | - |
| GET | `/api/test/stations` | ✅ | TestApiController |
| GET | `/api/test/overpass/fetch` | ✅ | TestApiController |
| GET | `/api/test/api-keys/status` | ✅ | TestApiController |
| POST | `/poi/check-in` | ✅ | PointOfInterestController |
| GET | `/poi` | ✅ | PointOfInterestController |
| GET | `/poi/{id}` | ✅ | PointOfInterestController |
| POST | `/poi` | ✅ | PointOfInterestController |
| POST | `/users/register` | ✅ | ProfileController |
| GET | `/users/{userId}` | ✅ | ProfileController |
| PATCH | `/users/{userId}` | ✅ | ProfileController |
| GET | `/stamp-books/user/{userId}` | ✅ | StampBookController |
| GET | `/stamp-books/{stampBookId}/entries` | ✅ | StampBookController |
| POST | `/stamp-books/entries` | ✅ | StampBookController |

---

## 🚀 Recommendations

### Priority 1: Critical (Blocking)
1. **Create AuthController** with `/auth/login` and `/auth/register` endpoints
2. **Implement JWT or token-based authentication**
3. **Add missing `/leaderboard` endpoint**
4. **Add missing `/checkin` endpoint** (or route POST /poi/check-in correctly)
5. **Add missing `/stations/{id}/nearby` endpoints**

### Priority 2: High (Important)
1. Implement proper security in `SecurityConfig` (JWT validation, CORS)
2. Add request validation to DTOs
3. Add error response DTOs for consistent error handling
4. Add API documentation (Swagger)

### Priority 3: Medium (Nice to Have)
1. Add comprehensive unit tests (backend)
2. Add integration tests
3. Add logging and monitoring
4. Implement rate limiting

---

## 📊 Data Flow Diagrams

### User Login Flow
```
Frontend (LoginPage.tsx)
    ↓ POST /auth/login { email, password }
Backend (AuthController - MISSING)
    ↓ Validate credentials
Database (profiles table)
    ↓ Return token, userId
Frontend → Store in Auth Context
    ↓ Redirect to /map
```

### Check-in Flow
```
Frontend (MapPage.tsx)
    ↓ POST /checkin { userId, locationId, userLat, userLng }
Backend (PointOfInterestController or dedicated endpoint)
    ↓ Verify location is within geofence
    ↓ Update stampbook entry (visited=true)
    ↓ Calculate points
Database (stamp_book_entries, profiles)
    ↓ Return CheckInResponse { pointsEarned, totalScore, isFirstVisit }
```

### View Leaderboard Flow
```
Frontend (LeaderboardPage.tsx)
    ↓ GET /leaderboard
Backend (LeaderboardController - MISSING)
    ↓ Query profiles ordered by hiScore
Database (profiles table)
    ↓ Return LeaderboardEntry[]
```

---

## ✅ Testing Checklist

- [ ] **Backend Compilation:** ✅ PASSES
- [ ] **Frontend Dependencies:** ✅ INSTALLED
- [ ] **Database:** ✅ SQLite ready
- [ ] **API Key Loading:** ✅ WORKS (check `/api/test/api-keys/status`)
- [ ] **User Registration:** ⚠️ PARTIAL (endpoint exists but not authenticated)
- [ ] **User Login:** ❌ MISSING
- [ ] **Map Display:** ✅ WORKS (with demo data)
- [ ] **Check-in:** ⚠️ MISSING proper endpoint
- [ ] **Stampbook:** ⚠️ PARTIALLY WORKS
- [ ] **Leaderboard:** ❌ MISSING endpoint

---

## 📝 Summary

**Status:** ⚠️ **In Progress - Requires Auth Implementation**

The application has a solid foundation with:
- ✅ Well-structured backend and frontend
- ✅ Working database integration
- ✅ External API integration
- ✅ Most business logic implemented

However, it **cannot run in production** until:
- ❌ Authentication endpoints are created
- ❌ Missing API endpoints are implemented
- ❌ Security configuration is enabled

**Estimated Fix Time:** 2-4 hours for a complete working implementation

---

## Next Steps

1. **Create AuthController** (highest priority)
2. **Implement missing endpoint routes**
3. **Add security configuration and JWT**
4. **Test the complete flow end-to-end**
5. **Add comprehensive error handling**

