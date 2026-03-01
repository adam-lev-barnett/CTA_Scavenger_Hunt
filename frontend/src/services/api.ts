import type {
  AuthResponse,
  CheckInResponse,
  LeaderboardEntry,
  PointOfInterest,
  Profile,
  StampBookEntry,
  Station,
} from '../types';
import {
  demoCheckIn,
  DEMO_TOKEN,
  getDemoLeaderboard,
  getDemoNearbyPois,
  getDemoProfile,
  getDemoStampBook,
  getDemoStations,
  updateDemoUsername,
} from './demoData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

type Method = 'GET' | 'POST' | 'PATCH';

function isDemoToken(token?: string): boolean {
  return token === DEMO_TOKEN;
}

async function request<T>(
  path: string,
  method: Method,
  body?: unknown,
  token?: string
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  async getMe(token: string): Promise<Profile> {
    if (isDemoToken(token)) {
      return getDemoProfile();
    }

    return request<Profile>('/auth/me', 'GET', undefined, token);
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    return request<AuthResponse>('/auth/login', 'POST', { email, password });
  },

  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    return request<AuthResponse>('/auth/register', 'POST', { username, email, password });
  },

  async getStations(token?: string): Promise<Station[]> {
    if (isDemoToken(token)) {
      return getDemoStations();
    }
    return request<Station[]>('/api/test/stations', 'GET', undefined, token);
  },

  async getNearbyPois(stationId: number, token?: string): Promise<PointOfInterest[]> {
    if (isDemoToken(token)) {
      return getDemoNearbyPois(stationId);
    }

    const endpoints = [
      `/stations/${stationId}/nearby`,
      `/point-of-interest/station/${stationId}`,
      `/point-of-interests/station/${stationId}`,
      `/pois/station/${stationId}`,
      `/point-of-interests?stationId=${stationId}`,
      `/point-of-interest?stationId=${stationId}`,
    ];

    let lastError: Error | null = null;
    for (const endpoint of endpoints) {
      try {
        const result = await request<PointOfInterest[]>(endpoint, 'GET', undefined, token);
        return result.filter((poi) => poi.id !== stationId);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Failed to fetch nearby POIs');
      }
    }

    throw lastError ?? new Error('No nearby POI endpoint available');
  },

  async checkIn(
    userId: number,
    locationId: number,
    userLat: number,
    userLng: number,
    token?: string
  ): Promise<CheckInResponse> {
    if (isDemoToken(token)) {
      return demoCheckIn(locationId);
    }

    return request<CheckInResponse>(
      '/checkin',
      'POST',
      { userId, locationId, userLat, userLng },
      token
    );
  },

  async getStampBook(userId: number, token?: string): Promise<StampBookEntry[]> {
    if (isDemoToken(token)) {
      return getDemoStampBook();
    }

    return request<StampBookEntry[]>(`/users/${userId}/stampbook`, 'GET', undefined, token);
  },

  async getLeaderboard(token?: string): Promise<LeaderboardEntry[]> {
    if (isDemoToken(token)) {
      return getDemoLeaderboard();
    }

    return request<LeaderboardEntry[]>('/leaderboard', 'GET', undefined, token);
  },

  async getProfile(userId: number, token?: string): Promise<Profile> {
    if (isDemoToken(token)) {
      return getDemoProfile();
    }

    return request<Profile>(`/users/${userId}`, 'GET', undefined, token);
  },

  async updateUsername(userId: number, username: string, token?: string): Promise<Profile> {
    if (isDemoToken(token)) {
      return updateDemoUsername(username);
    }

    return request<Profile>(`/users/${userId}`, 'PATCH', { username }, token);
  },
};
