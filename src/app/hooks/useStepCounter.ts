import { useState, useRef, useCallback, useEffect } from 'react';

// ─── Types ───────────────────────────────────────────────────────
export interface StepCounterState {
  steps: number;
  isActive: boolean;
  sensorStatus: 'idle' | 'requesting' | 'listening' | 'receiving' | 'no-data' | 'unavailable';
  permissionState: 'prompt' | 'granted' | 'denied' | 'unavailable';
  cadence: number;
  lastStepTimestamp: number;
  error: string | null;
  // Debug / diagnostic info
  debug: {
    rawX: number;
    rawY: number;
    rawZ: number;
    magnitude: number;
    smoothed: number;
    deviation: number;
    eventsReceived: number;
    sensorType: string; // 'DeviceMotion' | 'Accelerometer API' | 'none'
  };
}

// ─── Step Detection Algorithm ────────────────────────────────────
// Uses accelerometer peak detection. During walking, your body
// creates a rhythmic bounce: the acceleration magnitude oscillates
// around 9.81 (gravity). We detect when the deviation crosses the
// threshold on the RISING edge = 1 step.
//
// Sensitivity is adjustable because laptop accelerometers are
// weaker/less sensitive than phone sensors.
// ──────────────────────────────────────────────────────────────────

const DEFAULT_THRESHOLD = 0.8;    // Lower than before (was 1.2) for laptop sensitivity
const MIN_STEP_INTERVAL_MS = 250; // Max ~4 steps/sec (fast run)
const MAX_STEP_INTERVAL_MS = 2000;
const SMOOTHING_FACTOR = 0.2;
const CADENCE_WINDOW = 10;
const DATA_CHECK_TIMEOUT = 3000;  // If no events after 3s, sensor is "no-data"

export function useStepCounter(sensitivityOverride?: number) {
  const threshold = sensitivityOverride ?? DEFAULT_THRESHOLD;

  const [state, setState] = useState<StepCounterState>({
    steps: 0,
    isActive: false,
    sensorStatus: 'idle',
    permissionState: 'prompt',
    cadence: 0,
    lastStepTimestamp: 0,
    error: null,
    debug: {
      rawX: 0, rawY: 0, rawZ: 0,
      magnitude: 0, smoothed: 9.81, deviation: 0,
      eventsReceived: 0, sensorType: 'none',
    },
  });

  // Internal refs
  const smoothedRef = useRef(9.81);
  const lastPeakRef = useRef(0);
  const wasAboveRef = useRef(false);
  const stepTimesRef = useRef<number[]>([]);
  const stepsRef = useRef(0);
  const activeRef = useRef(false);
  const eventsRef = useRef(0);
  const dataCheckTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sensorRef = useRef<any>(null); // For Accelerometer API
  const debugIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const latestDebugRef = useRef(state.debug);

  // ─── Process acceleration data (shared by both APIs) ──────────
  const processAcceleration = useCallback((x: number, y: number, z: number) => {
    if (!activeRef.current) return;

    eventsRef.current++;

    // 1. Magnitude
    const mag = Math.sqrt(x * x + y * y + z * z);

    // 2. Low-pass filter
    const prev = smoothedRef.current;
    const smoothed = prev + SMOOTHING_FACTOR * (mag - prev);
    smoothedRef.current = smoothed;

    // 3. Deviation from gravity baseline
    const deviation = Math.abs(smoothed - 9.81);

    // Update debug values (stored in ref, flushed periodically)
    latestDebugRef.current = {
      rawX: x, rawY: y, rawZ: z,
      magnitude: mag, smoothed, deviation,
      eventsReceived: eventsRef.current,
      sensorType: latestDebugRef.current.sensorType,
    };

    // 4. Step detection: rising edge above threshold
    const now = Date.now();
    const isAbove = deviation > threshold;

    if (isAbove && !wasAboveRef.current) {
      const elapsed = now - lastPeakRef.current;
      if (elapsed >= MIN_STEP_INTERVAL_MS) {
        lastPeakRef.current = now;
        stepsRef.current++;

        stepTimesRef.current.push(now);
        if (stepTimesRef.current.length > CADENCE_WINDOW + 1) {
          stepTimesRef.current.shift();
        }

        // Cadence
        let cadence = 0;
        const ts = stepTimesRef.current;
        if (ts.length >= 2) {
          const span = ts[ts.length - 1] - ts[0];
          if (span > 0) cadence = Math.round(((ts.length - 1) / span) * 60000);
        }

        setState(prev => ({
          ...prev,
          steps: stepsRef.current,
          lastStepTimestamp: now,
          cadence,
          sensorStatus: 'receiving',
        }));
      }
    }
    wasAboveRef.current = isAbove;
  }, [threshold]);

  // ─── DeviceMotion handler ─────────────────────────────────────
  const handleDeviceMotion = useCallback((event: DeviceMotionEvent) => {
    const acc = event.accelerationIncludingGravity;
    if (!acc) return;

    const x = acc.x ?? 0;
    const y = acc.y ?? 0;
    const z = acc.z ?? 0;

    // Check if sensor actually provides data (not all zeros)
    if (x === 0 && y === 0 && z === 0) return;

    processAcceleration(x, y, z);
  }, [processAcceleration]);

  // ─── Try Generic Sensor API (Accelerometer) ───────────────────
  const tryGenericSensorAPI = useCallback((): boolean => {
    if (typeof (window as any).Accelerometer === 'undefined') return false;

    try {
      const sensor = new (window as any).Accelerometer({ frequency: 30 });
      sensor.addEventListener('reading', () => {
        // Generic Sensor API gives acceleration WITHOUT gravity
        // We need to add gravity back (~9.81 on the z-axis when flat)
        const x = sensor.x ?? 0;
        const y = sensor.y ?? 0;
        const z = (sensor.z ?? 0) + 9.81; // approximate gravity
        processAcceleration(x, y, z);
      });
      sensor.addEventListener('error', (e: any) => {
        console.warn('Accelerometer API error:', e.error?.message);
      });
      sensor.start();
      sensorRef.current = sensor;
      latestDebugRef.current = { ...latestDebugRef.current, sensorType: 'Accelerometer API' };
      return true;
    } catch (err) {
      console.warn('Accelerometer API not available:', err);
      return false;
    }
  }, [processAcceleration]);

  // ─── Check sensor availability ────────────────────────────────
  useEffect(() => {
    const hasDeviceMotion = typeof DeviceMotionEvent !== 'undefined';
    const hasAccelAPI = typeof (window as any).Accelerometer !== 'undefined';

    if (!hasDeviceMotion && !hasAccelAPI) {
      setState(prev => ({
        ...prev,
        sensorStatus: 'unavailable',
        permissionState: 'unavailable',
        error: 'No motion sensor available. Use a mobile device for step tracking.',
      }));
      return;
    }

    // iOS permission check
    if (hasDeviceMotion && typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      setState(prev => ({ ...prev, permissionState: 'prompt' }));
    } else {
      setState(prev => ({ ...prev, permissionState: 'granted' }));
    }
  }, []);

  // ─── Start counting ──────────────────────────────────────────
  const startCounting = useCallback(async () => {
    // Request iOS permission if needed
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const result = await (DeviceMotionEvent as any).requestPermission();
        if (result !== 'granted') {
          setState(prev => ({
            ...prev,
            permissionState: 'denied',
            error: 'Motion sensor permission denied.',
          }));
          return;
        }
        setState(prev => ({ ...prev, permissionState: 'granted' }));
      } catch {
        setState(prev => ({
          ...prev,
          permissionState: 'denied',
          error: 'Failed to request motion permission.',
        }));
        return;
      }
    }

    // Reset
    stepsRef.current = 0;
    smoothedRef.current = 9.81;
    lastPeakRef.current = 0;
    wasAboveRef.current = false;
    stepTimesRef.current = [];
    eventsRef.current = 0;
    activeRef.current = true;
    latestDebugRef.current = {
      rawX: 0, rawY: 0, rawZ: 0,
      magnitude: 0, smoothed: 9.81, deviation: 0,
      eventsReceived: 0, sensorType: 'none',
    };

    setState(prev => ({
      ...prev,
      steps: 0,
      isActive: true,
      sensorStatus: 'requesting',
      cadence: 0,
      lastStepTimestamp: 0,
      error: null,
    }));

    // Try DeviceMotion first
    window.addEventListener('devicemotion', handleDeviceMotion, true);
    latestDebugRef.current.sensorType = 'DeviceMotion';

    // Also try Accelerometer API as backup
    const accelStarted = tryGenericSensorAPI();
    if (accelStarted) {
      latestDebugRef.current.sensorType = 'Accelerometer API + DeviceMotion';
    }

    // Update status to 'listening' after brief delay
    setTimeout(() => {
      setState(prev => {
        if (prev.sensorStatus === 'requesting') {
          return { ...prev, sensorStatus: 'listening' };
        }
        return prev;
      });
    }, 500);

    // Check if we actually get data after timeout
    dataCheckTimerRef.current = setTimeout(() => {
      if (eventsRef.current === 0) {
        setState(prev => ({
          ...prev,
          sensorStatus: 'no-data',
          error: 'No motion sensor data received. Your device may not have an accelerometer, or the browser is blocking sensor access. Try on a mobile phone.',
        }));
      } else {
        setState(prev => ({ ...prev, sensorStatus: 'receiving' }));
      }
    }, DATA_CHECK_TIMEOUT);

    // Periodic debug state flush (every 200ms to avoid excessive re-renders)
    debugIntervalRef.current = setInterval(() => {
      setState(prev => ({
        ...prev,
        debug: { ...latestDebugRef.current },
      }));
    }, 200);
  }, [handleDeviceMotion, tryGenericSensorAPI]);

  // ─── Stop counting ───────────────────────────────────────────
  const stopCounting = useCallback(() => {
    activeRef.current = false;
    window.removeEventListener('devicemotion', handleDeviceMotion, true);

    if (sensorRef.current) {
      try { sensorRef.current.stop(); } catch {}
      sensorRef.current = null;
    }
    if (dataCheckTimerRef.current) clearTimeout(dataCheckTimerRef.current);
    if (debugIntervalRef.current) clearInterval(debugIntervalRef.current);

    setState(prev => ({ ...prev, isActive: false, sensorStatus: 'idle' }));
  }, [handleDeviceMotion]);

  // ─── Reset ────────────────────────────────────────────────────
  const resetSteps = useCallback(() => {
    stepsRef.current = 0;
    stepTimesRef.current = [];
    setState(prev => ({ ...prev, steps: 0, cadence: 0, lastStepTimestamp: 0 }));
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion, true);
      if (sensorRef.current) try { sensorRef.current.stop(); } catch {}
      if (dataCheckTimerRef.current) clearTimeout(dataCheckTimerRef.current);
      if (debugIntervalRef.current) clearInterval(debugIntervalRef.current);
    };
  }, [handleDeviceMotion]);

  return {
    ...state,
    startCounting,
    stopCounting,
    resetSteps,
  };
}
