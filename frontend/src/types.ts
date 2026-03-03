export interface AuthResponse {
  token: string;
  userId?: number;
  username?: string;
}

export interface Profile {
  id: number;
  username: string;
  email?: string;
  hiScore: number;
  weeklyScore: number;
}

export interface Station {
  id: number;
  stationName?: string;
  poiName?: string;
  name?: string;
  latitude: number;
  longitude: number;
  stationId?: number | null;
  points?: number;
}

export interface PointOfInterest {
  id: number;
  poiName?: string;
  stationName?: string;
  name?: string;
  latitude: number;
  longitude: number;
  stationId?: number | null;
  points?: number;
}

export interface CheckInResponse {
  pointsEarned: number;
  totalScore: number;
  isFirstVisit: boolean;
}

export interface StampBookEntry {
  id: number;
  pointOfInterest?: {
    id: number;
    poiName?: string;
  };
  visited?: boolean;
  visitedAt?: string | null;
}

export interface LeaderboardEntry {
  rank?: number;
  username: string;
  weeklyScore: number;
}
