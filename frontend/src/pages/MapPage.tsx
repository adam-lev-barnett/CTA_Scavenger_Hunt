import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import type { CheckInResponse, PointOfInterest, Station } from '../types';

const DEFAULT_LOOP_CENTER: [number, number] = [41.883, -87.629];
//!! Need to update this when adjusting all radii
const STATION_CHECKIN_RADIUS_METERS = 600;

type GeoPoint = {
  lat: number;
  lng: number;
};

type NearestStationInfo = {
  station: Station;
  distance: number;
  inRange: boolean;
};

export default function MapPage() {
  const { token, userId } = useAuth();
  const mapRef = useRef<L.Map | null>(null);
  const userLayerRef = useRef<L.LayerGroup | null>(null);
  const stationsLayerRef = useRef<L.LayerGroup | null>(null);
  const hasAutoCenteredRef = useRef(false);

  const [stations, setStations] = useState<Station[]>([]);
  const [nearbyByStationId, setNearbyByStationId] = useState<Record<number, PointOfInterest[]>>({});
  const [unlockedStations, setUnlockedStations] = useState<Record<number, true>>({});
  const [visitedLocationIds, setVisitedLocationIds] = useState<Record<number, true>>({});
  const [activeStationId, setActiveStationId] = useState<number | null>(null);
  const [expandedStationId, setExpandedStationId] = useState<number | null>(null);
  const [currentPosition, setCurrentPosition] = useState<GeoPoint | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loadingLocationId, setLoadingLocationId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const map = L.map('live-map', {
      zoomControl: true,
    }).setView(DEFAULT_LOOP_CENTER, 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    mapRef.current = map;
    userLayerRef.current = L.layerGroup().addTo(map);
    stationsLayerRef.current = L.layerGroup().addTo(map);

    return () => {
      userLayerRef.current?.clearLayers();
      stationsLayerRef.current?.clearLayers();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsError('GPS is not available on this device/browser.');
      return;
    }

    const watcherId = navigator.geolocation.watchPosition(
      (position) => {
        setCurrentPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setGpsError(null);
      },
      (positionError) => {
        setGpsError(positionError.message || 'Unable to read current location.');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 8000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watcherId);
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    api
      .getStations(token ?? undefined)
      .then((data) => {
        if (mounted) {
          setStations(data);
        }
      })
      .catch((loadError) => {
        if (mounted) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load stations');
        }
      });

    return () => {
      mounted = false;
    };
  }, [token]);

  useEffect(() => {
    if (!mapRef.current || !userLayerRef.current) {
      return;
    }

    const layer = userLayerRef.current;
    layer.clearLayers();

    if (!currentPosition) {
      return;
    }

    L.circleMarker([currentPosition.lat, currentPosition.lng], {
      radius: 8,
      color: '#2563eb',
    })
      .bindPopup('You are here')
      .addTo(layer);

    L.circle([currentPosition.lat, currentPosition.lng], {
      radius: STATION_CHECKIN_RADIUS_METERS,
      color: '#93c5fd',
      fillColor: '#bfdbfe',
      fillOpacity: 0.2,
    }).addTo(layer);

    if (!hasAutoCenteredRef.current) {
      mapRef.current.setView([currentPosition.lat, currentPosition.lng], 16);
      hasAutoCenteredRef.current = true;
    }
  }, [currentPosition]);

  useEffect(() => {
    if (!stationsLayerRef.current) {
      return;
    }

    const layer = stationsLayerRef.current;
    layer.clearLayers();

    stations.forEach((station) => {
      const atStation = isAtStation(station);
      const isActive = activeStationId === station.id;
      const color = isActive ? '#16a34a' : atStation ? '#ca8a04' : '#374151';

      L.circleMarker([station.latitude, station.longitude], {
        radius: 7,
        color,
      })
        .bindPopup(
          `${station.stationName ?? station.poiName ?? station.name ?? `Station ${station.id}`}<br/>${formatDistance(stationDistance(station))}`
        )
        .on('click', () => {
          setExpandedStationId(station.id);
        })
        .addTo(layer);
    });
  }, [stations, activeStationId, currentPosition]);

  useEffect(() => {
    let mounted = true;
    if (!userId) {
      return () => {
        mounted = false;
      };
    }

    api
      .getStampBook(userId, token ?? undefined)
      .then((entries) => {
        if (!mounted) {
          return;
        }

        const visitedMap: Record<number, true> = {};
        entries.forEach((entry) => {
          const locationId = entry.pointOfInterest?.id;
          if (entry.visited && locationId) {
            visitedMap[locationId] = true;
          }
        });

        setVisitedLocationIds(visitedMap);

        setUnlockedStations((current) => {
          const next = { ...current };
          stations.forEach((station) => {
            if (visitedMap[station.id]) {
              next[station.id] = true;
            }
          });
          return next;
        });
      })
      .catch(() => {
      });

    return () => {
      mounted = false;
    };
  }, [token, userId, stations]);

  function markLocationVisited(locationId: number) {
    setVisitedLocationIds((current) => ({
      ...current,
      [locationId]: true,
    }));
  }

  function isVisited(locationId: number) {
    return Boolean(visitedLocationIds[locationId]);
  }

  function distanceMeters(a: GeoPoint, b: GeoPoint) {
    const earthRadius = 6371000;
    const lat1 = (a.lat * Math.PI) / 180;
    const lat2 = (b.lat * Math.PI) / 180;
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLng = ((b.lng - a.lng) * Math.PI) / 180;

    const haversine =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

    return 2 * earthRadius * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
  }

  function stationDistance(station: Station): number | null {
    if (!currentPosition) {
      return null;
    }

    return distanceMeters(currentPosition, { lat: station.latitude, lng: station.longitude });
  }

  function isAtStation(station: Station) {
    const meters = stationDistance(station);
    return meters !== null && meters <= STATION_CHECKIN_RADIUS_METERS;
  }

  function formatDistance(meters: number | null): string {
    if (meters === null) {
      return 'GPS unavailable';
    }
    return `${Math.round(meters)}m away`;
  }

  const nearestStationInfo = useMemo<NearestStationInfo | null>(() => {
    if (!currentPosition || stations.length === 0) {
      return null;
    }

    let nearest: Station | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    stations.forEach((station) => {
      const meters = stationDistance(station);
      if (meters !== null && meters < nearestDistance) {
        nearest = station;
        nearestDistance = meters;
      }
    });

    if (!nearest || !Number.isFinite(nearestDistance)) {
      return null;
    }

    return {
      station: nearest,
      distance: nearestDistance,
      inRange: nearestDistance <= STATION_CHECKIN_RADIUS_METERS,
    };
  }, [currentPosition, stations]);

  const nearestFiveStations = useMemo<Station[]>(() => {
    const sorted = [...stations].sort((a, b) => {
      const da = stationDistance(a) ?? Number.POSITIVE_INFINITY;
      const db = stationDistance(b) ?? Number.POSITIVE_INFINITY;
      return da - db;
    });
    return sorted.slice(0, 5);
  }, [currentPosition, stations]);

  async function fetchNearbyPois(stationId: number) {
    if (nearbyByStationId[stationId]) {
      return;
    }

    const nearby = await api.getNearbyPois(stationId, token ?? undefined);
    setNearbyByStationId((current) => ({
      ...current,
      [stationId]: nearby,
    }));
  }

  async function handleStationCheckIn(station: Station) {
    if (!userId) {
      setError('User ID missing from auth context.');
      return;
    }

    if (!currentPosition) {
      setError('Current GPS location is required to check in to a station.');
      return;
    }

    if (!isAtStation(station)) {
      setError('Move closer to this station to check in.');
      return;
    }

    setLoadingLocationId(station.id);
    setError(null);
    setMessage(null);

    try {
      const response: CheckInResponse = await api.checkIn(
        userId,
        station.id,
        currentPosition.lat,
        currentPosition.lng,
        token ?? undefined
      );

      setUnlockedStations((current) => ({
        ...current,
        [station.id]: true,
      }));
      markLocationVisited(station.id);
      setActiveStationId(station.id);
      setExpandedStationId(station.id);
      await fetchNearbyPois(station.id);

      setMessage(
        `${station.stationName ?? station.poiName ?? station.name ?? 'Station'} checked in: +${response.pointsEarned} points (total ${response.totalScore}). Nearby POIs unlocked.`
      );
    } catch (checkInError) {
      setError(checkInError instanceof Error ? checkInError.message : 'Check-in failed');
    } finally {
      setLoadingLocationId(null);
    }
  }

  async function handlePoiCheckIn(stationId: number, poi: PointOfInterest) {
    if (!userId) {
      setError('User ID missing from auth context.');
      return;
    }

    if (activeStationId !== stationId) {
      setError('Check in to this station first before checking in nearby POIs.');
      return;
    }

    setLoadingLocationId(poi.id);
    setError(null);
    setMessage(null);

    try {
      const response = await api.checkIn(
        userId,
        poi.id,
        currentPosition?.lat ?? poi.latitude,
        currentPosition?.lng ?? poi.longitude,
        token ?? undefined
      );

      markLocationVisited(poi.id);
      setExpandedStationId(stationId);
      setMessage(
        `${poi.poiName ?? poi.name ?? 'POI'} check-in successful: +${response.pointsEarned} points (total ${response.totalScore}).`
      );
    } catch (checkInError) {
      setError(checkInError instanceof Error ? checkInError.message : 'POI check-in failed');
    } finally {
      setLoadingLocationId(null);
    }
  }

  function leaveActiveStation() {
    setActiveStationId(null);
    setExpandedStationId(null);
    setMessage('You left the station area. Check in to a station to unlock nearby POIs again.');
  }

  return (
    <section>
      <h2>Map / Stations</h2>
      <p className="hint">
        Station check-in is only available when you are within {STATION_CHECKIN_RADIUS_METERS}m of the station.
      </p>
      <div
        className={`geofence-chip ${
          !currentPosition
            ? 'unknown'
            : nearestStationInfo?.inRange
              ? 'inside'
              : 'outside'
        }`}
      >
        {!currentPosition
          ? 'Geofence: waiting for GPS…'
          : nearestStationInfo
            ? `Geofence: ${nearestStationInfo.inRange ? 'Inside' : 'Outside'} (${Math.round(nearestStationInfo.distance)}m from ${nearestStationInfo.station.stationName ?? nearestStationInfo.station.poiName ?? nearestStationInfo.station.name ?? `Station ${nearestStationInfo.station.id}`})`
            : 'Geofence: no station data'}
      </div>
      {gpsError && <p className="error">GPS: {gpsError}</p>}
      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      <div className="card map-panel">
        <div className="map-header">
          <h3>Live Map</h3>
          {activeStationId ? (
            <button className="ghost" onClick={leaveActiveStation}>
              Leave Area
            </button>
          ) : (
            <span className="hint">No active station</span>
          )}
        </div>

        <div id="live-map" className="map-container" />
      </div>

      <div className="card">
        <h3>CTA Stations</h3>
        {stations.length === 0 ? (
          <p>No stations loaded yet.</p>
        ) : (
          <ul className="list">
            {nearestFiveStations.map((station) => (
              <li key={station.id} className="station-item">
                <div className="station-row">
                  <div>
                    <div className="title-row">
                      <strong>{station.stationName ?? station.poiName ?? station.name ?? `Station ${station.id}`}</strong>
                      {activeStationId === station.id && <span className="badge active">Checked In</span>}
                      {isVisited(station.id) && <span className="badge visited">Visited</span>}
                    </div>
                    <small>
                      {station.latitude}, {station.longitude}
                    </small>
                    <small>{formatDistance(stationDistance(station))}</small>
                  </div>
                  <div className="row-actions">
                    <button
                      disabled={loadingLocationId !== null || !isAtStation(station) || isVisited(station.id)}
                      onClick={() => handleStationCheckIn(station)}
                    >
                      {loadingLocationId === station.id
                        ? 'Checking in...'
                        : isVisited(station.id)
                          ? 'Already Checked In'
                          : isAtStation(station)
                          ? 'Check In Station'
                          : 'Move Closer'}
                    </button>
                    <button
                      className="ghost"
                      disabled={
                        !unlockedStations[station.id] ||
                        loadingLocationId !== null ||
                        activeStationId !== station.id
                      }
                      onClick={async () => {
                        try {
                          setError(null);
                          await fetchNearbyPois(station.id);
                          setExpandedStationId((current) =>
                            current === station.id ? null : station.id
                          );
                        } catch (nearbyError) {
                          setError(
                            nearbyError instanceof Error
                              ? nearbyError.message
                              : 'Failed to load nearby POIs'
                          );
                        }
                      }}
                    >
                      {activeStationId !== station.id
                        ? 'Check in to unlock POIs'
                        : expandedStationId === station.id
                          ? 'Hide Nearby POIs'
                          : 'View Nearby POIs'}
                    </button>
                  </div>
                </div>

                {expandedStationId === station.id && unlockedStations[station.id] && (
                  <div className="nearby-wrap">
                    <h4>Nearby POIs</h4>
                    {(nearbyByStationId[station.id] ?? []).length === 0 ? (
                      <p>No nearby POIs found for this station.</p>
                    ) : (
                      <ul className="nearby-list">
                        {(nearbyByStationId[station.id] ?? []).map((poi) => (
                          <li key={poi.id}>
                            <div>
                              <div className="title-row">
                                <strong>{poi.poiName ?? poi.name ?? `POI ${poi.id}`}</strong>
                                {isVisited(poi.id) && <span className="badge visited">Visited</span>}
                              </div>
                              <small>
                                {poi.latitude}, {poi.longitude}
                              </small>
                            </div>
                            <button
                              disabled={loadingLocationId !== null}
                              onClick={() => handlePoiCheckIn(station.id, poi)}
                            >
                              {loadingLocationId === poi.id ? 'Checking in...' : 'Check In POI'}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
