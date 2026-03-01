import type {
  CheckInResponse,
  LeaderboardEntry,
  PointOfInterest,
  Profile,
  StampBookEntry,
  Station,
} from '../types';

export const DEMO_TOKEN = 'demo-local-token';
export const DEMO_USER_ID = 999;

type DemoState = {
  username: string;
  weeklyScore: number;
  hiScore: number;
  visitedByLocationId: Record<number, string>;
};

const STORAGE_KEY = 'cta-demo-state';

const DEMO_STATIONS: Station[] = [
  {
    id: 1,
    stationName: 'State/Lake',
    poiName: 'State/Lake',
    latitude: 41.88574,
    longitude: -87.62773,
    stationId: 1,
    points: 100,
  },
  {
    id: 2,
    stationName: 'Clark/Lake',
    poiName: 'Clark/Lake',
    latitude: 41.88583,
    longitude: -87.63094,
    stationId: 2,
    points: 100,
  },
  {
    id: 3,
    stationName: 'Washington/Wabash',
    poiName: 'Washington/Wabash',
    latitude: 41.88322,
    longitude: -87.62617,
    stationId: 3,
    points: 120,
  },
  {
    id: 4,
    stationName: 'Quincy/Wells',
    poiName: 'Quincy/Wells',
    latitude: 41.87886,
    longitude: -87.63378,
    stationId: 4,
    points: 110,
  },
  {
    id: 5,
    stationName: 'Harold Washington Library',
    poiName: 'Harold Washington Library',
    latitude: 41.87615,
    longitude: -87.62859,
    stationId: 5,
    points: 130,
  },
];

const DEMO_POIS: PointOfInterest[] = [
  {
    id: 101,
    poiName: 'Chicago Theatre',
    latitude: 41.88548,
    longitude: -87.6276,
    stationId: 1,
    points: 60,
  },
  {
    id: 102,
    poiName: 'Riverwalk West',
    latitude: 41.8872,
    longitude: -87.6299,
    stationId: 2,
    points: 55,
  },
  {
    id: 103,
    poiName: 'Millennium Park Gate',
    latitude: 41.8829,
    longitude: -87.6226,
    stationId: 3,
    points: 70,
  },
  {
    id: 104,
    poiName: 'Willis Tower Plaza',
    latitude: 41.8787,
    longitude: -87.6359,
    stationId: 4,
    points: 65,
  },
  {
    id: 105,
    poiName: 'Printers Row Corner',
    latitude: 41.8756,
    longitude: -87.6295,
    stationId: 5,
    points: 50,
  },
];

const DEMO_ALL_LOCATIONS: PointOfInterest[] = [...DEMO_STATIONS, ...DEMO_POIS];

function getDefaultState(): DemoState {
  return {
    username: 'demo-rider',
    weeklyScore: 0,
    hiScore: 0,
    visitedByLocationId: {},
  };
}

function loadState(): DemoState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return getDefaultState();
  }

  try {
    const parsed = JSON.parse(raw) as DemoState;
    const migratedVisited =
      parsed.visitedByLocationId ?? (parsed as DemoState & { visitedByStationId?: Record<number, string> }).visitedByStationId ?? {};

    return {
      username: parsed.username ?? 'demo-rider',
      weeklyScore: parsed.weeklyScore ?? 0,
      hiScore: parsed.hiScore ?? 0,
      visitedByLocationId: migratedVisited,
    };
  } catch {
    return getDefaultState();
  }
}

function saveState(state: DemoState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getDemoStations(): Station[] {
  return DEMO_STATIONS;
}

export function getDemoNearbyPois(stationId: number): PointOfInterest[] {
  return DEMO_POIS.filter((poi) => poi.stationId === stationId);
}

export function demoCheckIn(locationId: number): CheckInResponse {
  const state = loadState();
  const location = DEMO_ALL_LOCATIONS.find((item) => item.id === locationId);
  const basePoints = location?.points ?? 50;
  const firstVisit = !state.visitedByLocationId[locationId];
  const pointsEarned = firstVisit ? basePoints : Math.round(basePoints * 0.5);

  if (firstVisit) {
    state.visitedByLocationId[locationId] = new Date().toISOString();
  }

  state.weeklyScore += pointsEarned;
  state.hiScore = Math.max(state.hiScore, state.weeklyScore);
  saveState(state);

  return {
    pointsEarned,
    totalScore: state.weeklyScore,
    isFirstVisit: firstVisit,
  };
}

export function getDemoStampBook(): StampBookEntry[] {
  const state = loadState();
  return DEMO_ALL_LOCATIONS.map((location) => ({
    id: location.id,
    pointOfInterest: {
      id: location.id,
      name: location.poiName ?? location.stationName ?? location.name,
    },
    visited: Boolean(state.visitedByLocationId[location.id]),
    visitedAt: state.visitedByLocationId[location.id] ?? null,
  }));
}

export function getDemoProfile(): Profile {
  const state = loadState();
  return {
    id: DEMO_USER_ID,
    username: state.username,
    email: 'demo@local.test',
    hiScore: state.hiScore,
    weeklyScore: state.weeklyScore,
  };
}

export function updateDemoUsername(username: string): Profile {
  const state = loadState();
  state.username = username;
  saveState(state);
  return getDemoProfile();
}

export function getDemoLeaderboard(): LeaderboardEntry[] {
  const profile = getDemoProfile();
  const entries: LeaderboardEntry[] = [
    { rank: 1, username: 'loop-legend', weeklyScore: Math.max(profile.weeklyScore + 200, 350) },
    { rank: 2, username: 'redline-runner', weeklyScore: Math.max(profile.weeklyScore + 80, 240) },
    { rank: 3, username: profile.username, weeklyScore: profile.weeklyScore },
  ];

  return entries.sort((a, b) => b.weeklyScore - a.weeklyScore).map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
}
