// User types
export interface User {
  id: number;
  username: string;
  email: string;
  hiScore: number;
  weeklyScore: number;
  createdAt: string;
}

// Point of Interest types
export interface PointOfInterest {
  id: number;
  name: string;
  pointValue: number;
  latitude: number;
  longitude: number;
  description: string;
  nearbyLocations: number[];
}

// Train Station (extends Point of Interest)
export interface TrainStation extends PointOfInterest {
  lineColor: CTALineColor;
  isHub: boolean;
}

// CTA Line Colors
export type CTALineColor = 
  | 'red' 
  | 'blue' 
  | 'brown' 
  | 'green' 
  | 'orange' 
  | 'purple' 
  | 'pink' 
  | 'yellow';

// Stamp Book types
export interface StampBookEntry {
  id: number;
  locationId: number;
  locationName: string;
  visited: boolean;
  visitedAt: string | null;
  lineColor?: CTALineColor;
  pointValue: number;
}

export interface StampBook {
  userId: number;
  entries: StampBookEntry[];
  totalVisited: number;
  totalLocations: number;
}

// Leaderboard types
export interface LeaderboardEntry {
  rank: number;
  userId: number;
  username: string;
  weeklyScore: number;
  hiScore: number;
}

// Check-in types
export interface CheckInRequest {
  userId: number;
  locationId: number;
  userLat: number;
  userLng: number;
}

export interface CheckInResponse {
  pointsEarned: number;
  totalScore: number;
  isFirstVisit: boolean;
  locationName: string;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
