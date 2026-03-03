import { ChevronDown, ChevronUp, Filter, MapPin, Navigation, Train } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import type { CheckInResponse, PointOfInterest, Station } from '../types';
import styles from './mappage.module.css';

const CENTER: [number, number] = [41.883, -87.629];
const RADIUS_M = 6000;

type GeoPoint = { lat: number; lng: number };
type NearestInfo = { station: Station; distance: number; inRange: boolean };

function stationIcon(color: string, active: boolean) {
  const s = active ? 14 : 10;
  const glow = active ? `box-shadow:0 0 0 3px ${color}33,0 0 12px ${color}66;` : '';
  return L.divIcon({
    className: '',
    html: `<div style="width:${s}px;height:${s}px;border-radius:50%;background:${color};border:2px solid rgba(255,255,255,0.85);${glow}"></div>`,
    iconSize: [s, s], iconAnchor: [s / 2, s / 2],
  });
}

function poiIcon(visited: boolean) {
  const c = visited ? '#009b3a' : '#f9461c';
  return L.divIcon({
    className: '',
    html: `<div style="width:8px;height:8px;border-radius:2px;transform:rotate(45deg);background:${c};border:2px solid rgba(255,255,255,0.8)"></div>`,
    iconSize: [8, 8], iconAnchor: [4, 4],
  });
}

function haversine(a: GeoPoint, b: GeoPoint) {
  const R = 6371000, lat1 = a.lat * Math.PI / 180, lat2 = b.lat * Math.PI / 180;
  const dLat = (b.lat - a.lat) * Math.PI / 180, dLng = (b.lng - a.lng) * Math.PI / 180;
  const h = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLng/2)**2;
  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1-h));
}

function fmtDist(m: number | null) {
  if (m === null) return '—';
  return m >= 1000 ? `${(m/1000).toFixed(1)} km` : `${Math.round(m)} m`;
}

export default function MapPage() {
  const { token, userId } = useAuth();

  const mapRef    = useRef<L.Map | null>(null);
  const userLyr   = useRef<L.LayerGroup | null>(null);
  const stLyr     = useRef<L.LayerGroup | null>(null);
  const poiLyr    = useRef<L.LayerGroup | null>(null);
  const centered  = useRef(false);

  const [stations,          setStations]          = useState<Station[]>([]);
  const [showClosest,       setShowClosest]        = useState(false);
  const [nearbyMap,         setNearbyMap]          = useState<Record<number, PointOfInterest[]>>({});
  const [unlocked,          setUnlocked]           = useState<Record<number, true>>({});
  const [visited,           setVisited]            = useState<Record<number, true>>({});
  const [activeStation,     setActiveStation]      = useState<number | null>(null);
  const [expandedStation,   setExpandedStation]    = useState<number | null>(null);
  const [pos,               setPos]                = useState<GeoPoint | null>(null);
  const [gpsErr,            setGpsErr]             = useState<string | null>(null);
  const [msg,               setMsg]                = useState<string | null>(null);
  const [loadingId,         setLoadingId]          = useState<number | null>(null);
  const [err,               setErr]                = useState<string | null>(null);

  // Init map
  useEffect(() => {
    const map = L.map('live-map', { zoomControl: false }).setView(CENTER, 15);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd', maxZoom: 20,
    }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    mapRef.current = map;
    userLyr.current = L.layerGroup().addTo(map);
    stLyr.current   = L.layerGroup().addTo(map);
    poiLyr.current  = L.layerGroup().addTo(map);
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // GPS
  useEffect(() => {
    if (!navigator.geolocation) { setGpsErr('GPS unavailable'); return; }
    const id = navigator.geolocation.watchPosition(
      p => { setPos({ lat: p.coords.latitude, lng: p.coords.longitude }); setGpsErr(null); },
      e => setGpsErr(e.message || 'Location unavailable'),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 8000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  // Stations load
  useEffect(() => {
    api.getStations(token ?? undefined)
      .then(setStations)
      .catch(e => setErr(e instanceof Error ? e.message : 'Failed to load stations'));
  }, [token]);

  // User marker
  useEffect(() => {
    if (!mapRef.current || !userLyr.current) return;
    userLyr.current.clearLayers();
    if (!pos) return;
    L.marker([pos.lat, pos.lng], {
      icon: L.divIcon({
        className: '',
        html: `<div style="width:12px;height:12px;border-radius:50%;background:#00a1de;border:2px solid white;box-shadow:0 0 0 3px rgba(0,161,222,.25)"></div>`,
        iconSize: [12, 12], iconAnchor: [6, 6],
      }),
    }).bindPopup('<b>You are here</b>').addTo(userLyr.current);
    L.circle([pos.lat, pos.lng], {
      radius: RADIUS_M, color: '#00a1de', fillColor: '#00a1de',
      fillOpacity: 0.04, weight: 1, dashArray: '5 5',
    }).addTo(userLyr.current);
    if (!centered.current) {
      mapRef.current.setView([pos.lat, pos.lng], 15);
      centered.current = true;
    }
  }, [pos]);

  const distFrom = (s: Station) => pos ? haversine(pos, { lat: s.latitude, lng: s.longitude }) : null;
  const inRange  = (s: Station) => { const d = distFrom(s); return d !== null && d <= RADIUS_M; };

  const displayed = useMemo(() => {
    if (!showClosest || !pos) return stations;
    return [...stations]
      .map(s => ({ s, d: haversine(pos, { lat: s.latitude, lng: s.longitude }) }))
      .sort((a, b) => a.d - b.d).slice(0, 5).map(x => x.s);
  }, [stations, pos, showClosest]);

  // Station markers
  useEffect(() => {
    if (!stLyr.current) return;
    stLyr.current.clearLayers();
    displayed.forEach(s => {
      const active = activeStation === s.id;
      const color  = active ? '#009b3a' : inRange(s) ? '#00a1de' : '#52525b';
      L.marker([s.latitude, s.longitude], { icon: stationIcon(color, active) })
        .bindPopup(`<b style="color:${color}">${s.stationName ?? s.name ?? `Station ${s.id}`}</b><br/>${fmtDist(distFrom(s))}`)
        .on('click', () => setExpandedStation(s.id))
        .addTo(stLyr.current!);
    });
  }, [displayed, activeStation, pos]);

  // POI markers
  useEffect(() => {
    if (!poiLyr.current) return;
    poiLyr.current.clearLayers();
    Object.values(nearbyMap).flat().forEach(poi => {
      L.marker([poi.latitude, poi.longitude], { icon: poiIcon(!!visited[poi.id]) })
        .bindPopup(`<b>${poi.poiName ?? poi.name ?? `POI ${poi.id}`}</b><br/>${visited[poi.id] ? '✓ Visited' : 'Not visited'}`)
        .addTo(poiLyr.current!);
    });
  }, [nearbyMap, visited]);

  // Stamp book sync
  useEffect(() => {
    if (!userId) return;
    api.getStampBook(userId, token ?? undefined).then(entries => {
      const v: Record<number, true> = {};
      entries.forEach(e => { if (e.visited && e.pointOfInterest?.id) v[e.pointOfInterest.id] = true; });
      setVisited(v);
      setUnlocked(cur => {
        const next = { ...cur };
        stations.forEach(s => { if (v[s.id]) next[s.id] = true; });
        return next;
      });
    }).catch(() => {});
  }, [token, userId, stations]);

  const nearest = useMemo<NearestInfo | null>(() => {
    if (!pos || !stations.length) return null;
    let best: Station | null = null, bestD = Infinity;
    stations.forEach(s => { const d = haversine(pos, { lat: s.latitude, lng: s.longitude }); if (d < bestD) { best = s; bestD = d; } });
    if (!best || !isFinite(bestD)) return null;
    return { station: best, distance: bestD, inRange: bestD <= RADIUS_M };
  }, [pos, stations]);

  async function fetchPois(id: number) {
    if (nearbyMap[id]) return;
    const pois = await api.getNearbyPois(id, token ?? undefined);
    setNearbyMap(c => ({ ...c, [id]: pois }));
  }

  async function checkInStation(s: Station) {
    if (!userId) { setErr('No user ID'); return; }
    if (!pos)    { setErr('GPS required'); return; }
    if (!inRange(s)) { setErr('Move closer to this station'); return; }
    setLoadingId(s.id); setErr(null); setMsg(null);
    try {
      const res: CheckInResponse = await api.checkIn(userId, s.id, pos.lat, pos.lng, token ?? undefined);
      setUnlocked(c => ({ ...c, [s.id]: true }));
      setVisited(c => ({ ...c, [s.id]: true }));
      setActiveStation(s.id); setExpandedStation(s.id);
      await fetchPois(s.id);
      setMsg(`Checked in to ${s.stationName ?? s.name ?? 'station'} · +${res.pointsEarned} pts · Nearby spots unlocked`);
    } catch (e) { setErr(e instanceof Error ? e.message : 'Check-in failed'); }
    finally { setLoadingId(null); }
  }

  async function checkInPoi(stationId: number, poi: PointOfInterest) {
    if (!userId) { setErr('No user ID'); return; }
    if (activeStation !== stationId) { setErr('Check in to the station first'); return; }
    setLoadingId(poi.id); setErr(null); setMsg(null);
    try {
      const res = await api.checkIn(userId, poi.id, pos?.lat ?? poi.latitude, pos?.lng ?? poi.longitude, token ?? undefined);
      setVisited(c => ({ ...c, [poi.id]: true }));
      setMsg(`${poi.poiName ?? poi.name ?? 'Location'} · +${res.pointsEarned} pts (total ${res.totalScore})`);
    } catch (e) { setErr(e instanceof Error ? e.message : 'Check-in failed'); }
    finally { setLoadingId(null); }
  }

  const geoState = !pos ? 'unknown' : nearest?.inRange ? 'inside' : 'outside';

  return (
    <div className={styles.container}>

      {/* Map — top half */}
      <div className={styles.mapContainer} style={{ height: '52%' }}>
        <div id="live-map" className={styles.mapEl} />

        {/* Floating overlays */}
        <div className={styles.overlayLeft}>
          {/* Geofence pill */}
          <div className={`${styles.geoPill} ${
            geoState === 'inside'  ? styles.geoPillInside  :
            geoState === 'outside' ? styles.geoPillOutside :
                                     styles.geoPillUnknown
          }`}>
            <span className={`${styles.geoDot} ${
              geoState === 'inside'  ? styles.geoDotInside  :
              geoState === 'outside' ? styles.geoDotOutside :
                                       styles.geoDotUnknown
            }`} />
            {!pos ? 'Locating…' :
             nearest ? `${nearest.inRange ? 'In range' : 'Out of range'} · ${fmtDist(nearest.distance)} from ${nearest.station.stationName ?? nearest.station.name ?? 'station'}` :
             'No stations'}
          </div>

          {gpsErr && (
            <div className={styles.gpsErrPill}>
              <Navigation size={11} /> {gpsErr}
            </div>
          )}
        </div>

        {activeStation && (
          <button
            onClick={() => { setActiveStation(null); setExpandedStation(null); setMsg('Left station area.'); }}
            className={styles.leaveBtn}
          >
            ✕ Leave station
          </button>
        )}
      </div>

      {/* Station panel — bottom half, scrollable */}
      <div className={styles.panel}>

        {/* Feedback */}
        {(err || msg) && (
          <div className={`${styles.feedback} ${err ? styles.feedbackErr : styles.feedbackOk}`}>
            {err ?? msg}
          </div>
        )}

        {/* Header row */}
        <div className={styles.panelHeader}>
          <div className={styles.panelHeaderLeft}>
            <Train size={14} className={styles.trainIcon} />
            <span className={styles.panelTitle}>
              Stations
              <span className={styles.panelCount}>{displayed.length}</span>
            </span>
          </div>
          <button
            disabled={!pos}
            onClick={() => setShowClosest(v => !v)}
            className={`${styles.filterBtn} ${showClosest ? styles.filterBtnActive : styles.filterBtnInactive}`}
          >
            <Filter size={11} />
            {showClosest ? '5 Closest' : 'All'}
          </button>
        </div>

        {/* Station list */}
        <div className={styles.stationList}>
          {displayed.map(s => {
            const name     = s.stationName ?? s.poiName ?? `Station ${s.id}`;
            const isActive = activeStation === s.id;
            const canCheck = inRange(s);
            const expanded = expandedStation === s.id;
            const loading  = loadingId === s.id;

            return (
              <div key={s.id} className={`${styles.stationRow} ${isActive ? styles.stationRowActive : ''}`}>

                <div className={styles.stationMain}>
                  {/* Color dot */}
                  <div className={`${styles.stationDot} ${
                    isActive  ? styles.stationDotActive :
                    canCheck  ? styles.stationDotNear   :
                                styles.stationDotFar
                  }`} />

                  <div className={styles.stationInfo}>
                    <div className={styles.stationNameRow}>
                      <span className={styles.stationName}>{name}</span>
                      {isActive && <span className={styles.badgeActive}>Active</span>}
                      {visited[s.id] && !isActive && <span className={styles.badgeVisited}>Visited</span>}
                    </div>
                    <p className={styles.stationDist}>{fmtDist(distFrom(s))}</p>
                  </div>

                  <div className={styles.stationActions}>
                    <button
                      disabled={loading || !canCheck}
                      onClick={() => checkInStation(s)}
                      className={`${styles.checkInBtn} ${canCheck ? styles.checkInBtnEnabled : styles.checkInBtnDisabled}`}
                    >
                      {loading ? '…' : canCheck ? 'Check In' : 'Too far'}
                    </button>

                    {unlocked[s.id] && isActive && (
                      <button
                        onClick={async () => {
                          try { await fetchPois(s.id); setExpandedStation(expanded ? null : s.id); }
                          catch (e) { setErr(e instanceof Error ? e.message : 'Failed'); }
                        }}
                        className={styles.expandBtn}
                      >
                        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    )}
                  </div>
                </div>

                {/* POI list */}
                {expanded && unlocked[s.id] && (
                  <div className={styles.poiList}>
                    {!(nearbyMap[s.id]?.length) ? (
                      <p className={styles.poiNone}>No nearby spots found.</p>
                    ) : nearbyMap[s.id].map(poi => {
                      const v = !!visited[poi.id];
                      return (
                        <div key={poi.id} className={styles.poiRow}>
                          <div className={styles.poiLeft}>
                            <MapPin size={11} className={v ? styles.poiIconVisited : styles.poiIconUnvisited} />
                            <span className={styles.poiName}>{poi.poiName ?? poi.name ?? `POI ${poi.id}`}</span>
                            {v && <span className={styles.poiCheck}>✓</span>}
                          </div>
                          <button
                            disabled={!!loadingId || v}
                            onClick={() => checkInPoi(s.id, poi)}
                            className={`${styles.poiBtn} ${v ? styles.poiBtnDone : styles.poiBtnActive}`}
                          >
                            {loadingId === poi.id ? '…' : v ? 'Done' : 'Check In'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
