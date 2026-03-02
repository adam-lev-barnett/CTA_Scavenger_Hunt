import { ChevronDown, ChevronUp, Filter, MapPin, Navigation, Train } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import type { CheckInResponse, PointOfInterest, Station } from '../types';

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
        html: `<div class="relative flex items-center justify-center">
          <div style="width:12px;height:12px;border-radius:50%;background:#00a1de;border:2px solid white;box-shadow:0 0 0 3px rgba(0,161,222,.25)"></div>
        </div>`,
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
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">

      {/* Map — top half */}
      <div className="relative flex-shrink-0" style={{ height: '52%' }}>
        <div id="live-map" className="w-full h-full" />

        {/* Floating overlays */}
        <div className="absolute top-3 left-3 z-[500] flex flex-col gap-2">
          {/* Geofence pill */}
          <div className={[
            'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-md border',
            geoState === 'inside'  ? 'bg-cta-green/15 text-green-400 border-cta-green/30' :
            geoState === 'outside' ? 'bg-cta-red/15 text-red-400 border-cta-red/30' :
                                     'bg-zinc-800/80 text-zinc-400 border-white/10',
          ].join(' ')}>
            <span className={[
              'w-1.5 h-1.5 rounded-full',
              geoState === 'inside' ? 'bg-green-400 shadow-[0_0_6px_#4ade80]' :
              geoState === 'outside' ? 'bg-red-400' : 'bg-zinc-500',
            ].join(' ')} />
            {!pos ? 'Locating…' :
             nearest ? `${nearest.inRange ? 'In range' : 'Out of range'} · ${fmtDist(nearest.distance)} from ${nearest.station.stationName ?? nearest.station.name ?? 'station'}` :
             'No stations'}
          </div>

          {gpsErr && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 backdrop-blur-md">
              <Navigation size={11} /> {gpsErr}
            </div>
          )}
        </div>

        {activeStation && (
          <button
            onClick={() => { setActiveStation(null); setExpandedStation(null); setMsg('Left station area.'); }}
            className="absolute top-3 right-3 z-[500] px-3 py-1.5 rounded-full text-xs font-medium bg-zinc-900/90 text-zinc-300 border border-white/10 hover:border-white/20 backdrop-blur-md transition-all"
          >
            ✕ Leave station
          </button>
        )}
      </div>

      {/* Station panel — bottom half, scrollable */}
      <div className="flex-1 overflow-y-auto bg-zinc-950 border-t border-white/[0.06]">

        {/* Feedback */}
        {(err || msg) && (
          <div className={[
            'mx-4 mt-4 px-4 py-3 rounded-lg text-sm border',
            err ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-cta-blue/10 text-cta-blue border-cta-blue/20',
          ].join(' ')}>
            {err ?? msg}
          </div>
        )}

        {/* Header row */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.04]">
          <div className="flex items-center gap-2">
            <Train size={14} className="text-cta-blue" />
            <span className="font-display font-semibold text-sm text-white">
              Stations
              <span className="ml-1.5 text-zinc-600 font-normal text-xs">{displayed.length}</span>
            </span>
          </div>
          <button
            disabled={!pos}
            onClick={() => setShowClosest(v => !v)}
            className={[
              'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all',
              showClosest
                ? 'bg-cta-blue/15 text-cta-blue border border-cta-blue/30'
                : 'text-zinc-500 hover:text-zinc-300 border border-white/10 hover:border-white/20',
            ].join(' ')}
          >
            <Filter size={11} />
            {showClosest ? '5 Closest' : 'All'}
          </button>
        </div>

        {/* Station list */}
        <div className="divide-y divide-white/[0.04]">
          {displayed.map(s => {
            const name     = s.stationName ?? s.poiName ?? `Station ${s.id}`;
            const isActive = activeStation === s.id;
            const canCheck = inRange(s);
            const expanded = expandedStation === s.id;
            const loading  = loadingId === s.id;

            return (
              <div key={s.id} className={[
                'px-4 py-3 transition-colors',
                isActive ? 'bg-cta-green/5' : '',
              ].join(' ')}>

                <div className="flex items-start gap-3">
                  {/* Color dot */}
                  <div className={[
                    'mt-0.5 w-2 h-2 rounded-full shrink-0',
                    isActive ? 'bg-cta-green shadow-[0_0_8px_#009b3a]' :
                    canCheck ? 'bg-cta-blue' : 'bg-zinc-700',
                  ].join(' ')} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display font-semibold text-sm text-white">{name}</span>
                      {isActive && <span className="text-[10px] px-1.5 py-0.5 rounded bg-cta-green/15 text-green-400 border border-cta-green/25 font-medium">Active</span>}
                      {visited[s.id] && !isActive && <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-white/8 font-medium">Visited</span>}
                    </div>
                    <p className="text-xs text-zinc-600 mt-0.5">{fmtDist(distFrom(s))}</p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      disabled={loading || !canCheck}
                      onClick={() => checkInStation(s)}
                      className={[
                        'px-2.5 py-1 rounded-md text-xs font-medium transition-all',
                        canCheck
                          ? 'bg-cta-blue text-white hover:bg-cta-blue/90'
                          : 'bg-zinc-800 text-zinc-600 cursor-not-allowed',
                      ].join(' ')}
                    >
                      {loading ? '…' : canCheck ? 'Check In' : 'Too far'}
                    </button>

                    {unlocked[s.id] && isActive && (
                      <button
                        onClick={async () => {
                          try { await fetchPois(s.id); setExpandedStation(expanded ? null : s.id); }
                          catch (e) { setErr(e instanceof Error ? e.message : 'Failed'); }
                        }}
                        className="p-1 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-all"
                      >
                        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    )}
                  </div>
                </div>

                {/* POI list */}
                {expanded && unlocked[s.id] && (
                  <div className="mt-3 ml-5 space-y-1">
                    {!(nearbyMap[s.id]?.length) ? (
                      <p className="text-xs text-zinc-600">No nearby spots found.</p>
                    ) : nearbyMap[s.id].map(poi => {
                      const v = !!visited[poi.id];
                      return (
                        <div key={poi.id} className="flex items-center justify-between gap-3 py-1.5 px-2.5 rounded-md hover:bg-white/[0.03] transition-colors">
                          <div className="flex items-center gap-2 min-w-0">
                            <MapPin size={11} className={v ? 'text-cta-green shrink-0' : 'text-zinc-600 shrink-0'} />
                            <span className="text-xs text-zinc-300 truncate">{poi.poiName ?? poi.name ?? `POI ${poi.id}`}</span>
                            {v && <span className="text-[10px] text-cta-green shrink-0">✓</span>}
                          </div>
                          <button
                            disabled={!!loadingId || v}
                            onClick={() => checkInPoi(s.id, poi)}
                            className={[
                              'px-2 py-0.5 rounded text-[11px] font-medium shrink-0 transition-all',
                              v ? 'text-zinc-700 cursor-default' : 'text-cta-blue hover:bg-cta-blue/10',
                            ].join(' ')}
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
