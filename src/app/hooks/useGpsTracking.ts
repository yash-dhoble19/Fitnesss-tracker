import { useState, useRef, useCallback, useEffect } from 'react';
import type { UserProfile } from '../context/UserContext';

// ─── Types ───────────────────────────────────────────────────────
export interface GpsPoint {
  lat: number;
  lng: number;
  altitude: number | null;
  speed: number | null; // m/s
  accuracy: number;
  timestamp: number;
}

export interface GpsTrackingState {
  isTracking: boolean;
  isPaused: boolean;
  gpsPermission: 'prompt' | 'granted' | 'denied' | 'unavailable';
  currentSpeed: number; // m/s
  totalDistanceM: number;
  caloriesBurned: number;
  activeSeconds: number;
  currentPace: string; // min/km
  avgSpeedKmh: number;
  activityType: ActivityType;
  gpsPoints: GpsPoint[];
  lastPosition: GpsPoint | null;
  error: string | null;
}

export type ActivityType = 'walking' | 'running' | 'cycling' | 'hiking' | 'auto';

// ─── MET Values (Compendium of Physical Activities) ─────────────
const MET_VALUES: Record<string, number> = {
  walking_slow: 2.0,       // < 3 km/h
  walking_normal: 3.5,     // 3–5 km/h
  walking_brisk: 4.3,      // 5–6.5 km/h
  running_light: 7.0,      // 6.5–8 km/h
  running_moderate: 9.8,   // 8–10 km/h
  running_fast: 11.5,      // 10–12 km/h
  running_sprint: 14.5,    // > 12 km/h
  cycling_slow: 4.0,       // < 16 km/h
  cycling_moderate: 6.8,   // 16–20 km/h
  cycling_fast: 10.0,      // > 20 km/h
  hiking: 5.3,
  rest: 1.0,
};

// ─── Haversine Distance (meters) ────────────────────────────────
function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Get MET from speed + activity ──────────────────────────────
function getMetValue(activity: ActivityType, speedKmh: number): number {
  const detected =
    activity === 'auto'
      ? speedKmh < 6.5 ? 'walking' : speedKmh < 15 ? 'running' : 'cycling'
      : activity;

  switch (detected) {
    case 'walking':
      if (speedKmh < 3) return MET_VALUES.walking_slow;
      if (speedKmh < 5) return MET_VALUES.walking_normal;
      return MET_VALUES.walking_brisk;
    case 'running':
      if (speedKmh < 8) return MET_VALUES.running_light;
      if (speedKmh < 10) return MET_VALUES.running_moderate;
      if (speedKmh < 12) return MET_VALUES.running_fast;
      return MET_VALUES.running_sprint;
    case 'cycling':
      if (speedKmh < 16) return MET_VALUES.cycling_slow;
      if (speedKmh < 20) return MET_VALUES.cycling_moderate;
      return MET_VALUES.cycling_fast;
    case 'hiking':
      return MET_VALUES.hiking;
    default:
      return MET_VALUES.walking_normal;
  }
}

function formatPace(speedKmh: number): string {
  if (speedKmh <= 0) return '--:--';
  const pace = 60 / speedKmh;
  const mins = Math.floor(pace);
  const secs = Math.round((pace - mins) * 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ─── Hook ────────────────────────────────────────────────────────
export function useGpsTracking(userProfile: UserProfile | null) {
  const [state, setState] = useState<GpsTrackingState>({
    isTracking: false,
    isPaused: false,
    gpsPermission: 'prompt',
    currentSpeed: 0,
    totalDistanceM: 0,
    caloriesBurned: 0,
    activeSeconds: 0,
    currentPace: '--:--',
    avgSpeedKmh: 0,
    activityType: 'auto',
    gpsPoints: [],
    lastPosition: null,
    error: null,
  });

  const watchIdRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastCalcTimeRef = useRef(0);

  const userWeight = userProfile?.weightKg || 70;

  // ── Check GPS ─────────────────────────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) {
      setState(p => ({ ...p, gpsPermission: 'unavailable' }));
      return;
    }
    if (navigator.permissions) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((r) => {
          setState(p => ({ ...p, gpsPermission: r.state as any }));
          r.onchange = () => setState(p => ({ ...p, gpsPermission: r.state as any }));
        })
        .catch(() => {});
    }
  }, []);

  // ── Position handler ──────────────────────────────────────────
  const handlePosition = useCallback(
    (pos: GeolocationPosition) => {
      const pt: GpsPoint = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        altitude: pos.coords.altitude,
        speed: pos.coords.speed,
        accuracy: pos.coords.accuracy,
        timestamp: pos.timestamp,
      };

      setState((prev) => {
        if (pt.accuracy > 30) return { ...prev, lastPosition: pt, gpsPermission: 'granted' };

        let dist = prev.totalDistanceM;
        let delta = 0;

        if (prev.lastPosition && prev.lastPosition.accuracy <= 30) {
          delta = haversineDistance(
            prev.lastPosition.lat, prev.lastPosition.lng,
            pt.lat, pt.lng
          );
          if (delta < 2 || delta > 100) delta = 0; // jitter / teleport filter
          dist += delta;
        }

        const speedMs =
          pt.speed !== null && pt.speed >= 0
            ? pt.speed
            : prev.lastPosition
            ? delta / Math.max((pt.timestamp - prev.lastPosition.timestamp) / 1000, 1)
            : 0;
        const speedKmh = speedMs * 3.6;

        // Calorie calculation: MET × weight × hours
        const now = Date.now();
        const intervalSec = lastCalcTimeRef.current > 0
          ? (now - lastCalcTimeRef.current) / 1000
          : 1;
        lastCalcTimeRef.current = now;

        const met = speedKmh > 0.5 ? getMetValue(prev.activityType, speedKmh) : MET_VALUES.rest;
        const cal = prev.caloriesBurned + met * userWeight * (intervalSec / 3600);

        const elapsed = prev.activeSeconds / 3600;
        const avgKmh = elapsed > 0 ? (dist / 1000) / elapsed : 0;

        return {
          ...prev,
          gpsPermission: 'granted',
          lastPosition: pt,
          gpsPoints: [...prev.gpsPoints, pt],
          totalDistanceM: dist,
          caloriesBurned: cal,
          currentSpeed: speedMs,
          currentPace: formatPace(speedKmh),
          avgSpeedKmh: avgKmh,
          error: null,
        };
      });
    },
    [userWeight]
  );

  // ── Error handler ─────────────────────────────────────────────
  const handleError = useCallback((err: GeolocationPositionError) => {
    const msg =
      err.code === err.PERMISSION_DENIED
        ? 'Location permission denied. Enable GPS in browser settings.'
        : err.code === err.POSITION_UNAVAILABLE
        ? 'GPS unavailable. Make sure location is enabled on your device.'
        : 'Location request timed out. Retrying…';
    setState(p => ({
      ...p,
      error: msg,
      ...(err.code === err.PERMISSION_DENIED ? { gpsPermission: 'denied' as const } : {}),
    }));
  }, []);

  // ── Start ─────────────────────────────────────────────────────
  const startTracking = useCallback(
    (activity: ActivityType = 'auto') => {
      if (!navigator.geolocation) {
        setState(p => ({ ...p, error: 'Geolocation not supported.' }));
        return;
      }
      lastCalcTimeRef.current = Date.now();
      setState(p => ({
        ...p,
        isTracking: true,
        isPaused: false,
        activityType: activity,
        totalDistanceM: 0,
        caloriesBurned: 0,
        activeSeconds: 0,
        currentSpeed: 0,
        currentPace: '--:--',
        avgSpeedKmh: 0,
        gpsPoints: [],
        lastPosition: null,
        error: null,
      }));
      watchIdRef.current = navigator.geolocation.watchPosition(
        handlePosition,
        handleError,
        { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
      );
      timerRef.current = setInterval(() => {
        setState(p => ({ ...p, activeSeconds: p.activeSeconds + 1 }));
      }, 1000);
    },
    [handlePosition, handleError]
  );

  // ── Stop ──────────────────────────────────────────────────────
  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    if (timerRef.current !== null) clearInterval(timerRef.current);
    watchIdRef.current = null;
    timerRef.current = null;
    setState(p => ({ ...p, isTracking: false, isPaused: false }));
  }, []);

  // ── Pause / Resume ────────────────────────────────────────────
  const pauseTracking = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setState(p => ({ ...p, isPaused: true }));
  }, []);

  const resumeTracking = useCallback(() => {
    lastCalcTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setState(p => ({ ...p, activeSeconds: p.activeSeconds + 1 }));
    }, 1000);
    setState(p => ({ ...p, isPaused: false }));
  }, []);

  const setActivityType = useCallback((type: ActivityType) => {
    setState(p => ({ ...p, activityType: type }));
  }, []);

  // cleanup
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      if (timerRef.current !== null) clearInterval(timerRef.current);
    };
  }, []);

  return { ...state, startTracking, stopTracking, pauseTracking, resumeTracking, setActivityType };
}
