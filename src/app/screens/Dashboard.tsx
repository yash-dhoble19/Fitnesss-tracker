import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  Footprints,
  MapPin,
  Flame,
  Timer,
  Smartphone,
  Activity,
  Play,
  Pause,
  Plus,
  ChevronRight,
  Target,
  Brain,
  Moon,
  Droplets,
  Smile,
  BarChart3,
  Zap,
  Navigation,
  Gauge,
  AlertCircle,
  RotateCcw,
  Vibrate,
} from 'lucide-react';
import BottomNav from '../components/BottomNav';
import {
  useUser,
  getFirstName,
  getBmi,
  getBmiCategory,
  getGoalLabel,
  getStepGoalFromProfile,
  getCalorieGoalFromProfile,
} from '../context/UserContext';
import { useStepCounter } from '../hooks/useStepCounter';
import { useGpsTracking, type ActivityType } from '../hooks/useGpsTracking';

// ─── Helpers ─────────────────────────────────────────────────────
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'GOOD MORNING';
  if (h < 17) return 'GOOD AFTERNOON';
  return 'GOOD EVENING';
}

function fmtDuration(s: number): string {
  if (s < 60) return `${s}s`;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function fmtMin(min: number): string {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// Estimate calories from steps (MET formula for walking at ~3.5 MET)
function caloriesFromSteps(steps: number, weightKg: number, heightCm: number): number {
  const strideLenM = (heightCm / 100) * 0.415;
  const distKm = (steps * strideLenM) / 1000;
  const timeHrs = distKm / 4.5; // assume ~4.5 km/h walking speed
  return 3.5 * weightKg * timeHrs;
}

// ─── Circular Progress ──────────────────────────────────────────
function Ring({
  value, max, size = 90, sw = 7, color, children,
}: {
  value: number; max: number; size?: number; sw?: number; color: string; children: React.ReactNode;
}) {
  const r = (size - sw) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.min(value / Math.max(max, 1), 1);
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1F1F26" strokeWidth={sw} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={sw}
          strokeDasharray={c} strokeDashoffset={c * (1 - p)}
          strokeLinecap="round" className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}

// ─── Activity Picker ────────────────────────────────────────────
const ACTIVITIES: { id: ActivityType; emoji: string; label: string }[] = [
  { id: 'auto', emoji: '🔄', label: 'Auto' },
  { id: 'walking', emoji: '🚶', label: 'Walk' },
  { id: 'running', emoji: '🏃', label: 'Run' },
  { id: 'cycling', emoji: '🚴', label: 'Cycle' },
  { id: 'hiking', emoji: '🥾', label: 'Hike' },
];

// ─── Main Component ─────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'physical' | 'mental'>('physical');
  const [animateIn, setAnimateIn] = useState(false);
  const [showActivityPicker, setShowActivityPicker] = useState(false);

  // Two separate sensors
  const stepper = useStepCounter();   // accelerometer — for STEPS
  const gps = useGpsTracking(user);   // GPS — for DISTANCE, SPEED, ROUTE

  useEffect(() => { setTimeout(() => setAnimateIn(true), 100); }, []);

  const firstName = user ? getFirstName(user.fullName) : 'User';
  const stepGoal = user ? getStepGoalFromProfile(user) : 10000;
  const calorieGoal = user ? getCalorieGoalFromProfile(user) : 500;
  const bmi = user ? getBmi(user.weightKg, user.heightCm) : 0;
  const bmiInfo = getBmiCategory(bmi);
  const distKm = gps.totalDistanceM / 1000;

  // Total calories: GPS MET-based when tracking, step-based when just walking
  const totalCalories = useMemo(() => {
    if (gps.isTracking) {
      return gps.caloriesBurned;
    }
    return caloriesFromSteps(stepper.steps, user?.weightKg || 70, user?.heightCm || 170);
  }, [gps.isTracking, gps.caloriesBurned, stepper.steps, user]);

  // Any sensor running
  const anySensorActive = stepper.isActive || gps.isTracking;

  // Personalized workout suggestions using real MET × weight
  const weight = user?.weightKg || 70;
  const suggestedWorkouts = useMemo(() => {
    const goals = user?.goals || [];
    const workouts: { type: string; emoji: string; duration: string; cal: string }[] = [];
    const add = (t: string, e: string, d: string, met: number, hrs: number) => {
      workouts.push({ type: t, emoji: e, duration: d, cal: `~${Math.round(met * weight * hrs)} kcal` });
    };
    if (!goals.length || goals.includes('lose_weight')) {
      add('Running', '🏃', '30 min', 9.8, 0.5);
      add('HIIT', '🔥', '20 min', 12, 0.33);
    }
    if (goals.includes('build_muscle')) {
      add('Weight Training', '🏋️', '45 min', 6, 0.75);
      add('Push-ups', '💪', '15 min', 8, 0.25);
    }
    if (goals.includes('stamina')) {
      add('Cycling', '🚴', '40 min', 6.8, 0.67);
      add('Swimming', '🏊', '30 min', 8, 0.5);
    }
    if (goals.includes('flexibility') || goals.includes('mental_health')) {
      add('Yoga', '🧘', '30 min', 3, 0.5);
    }
    if (goals.includes('better_sleep')) {
      add('Stretching', '🤸', '15 min', 2.5, 0.25);
    }
    if (!workouts.length) {
      add('Walking', '🚶', '30 min', 3.5, 0.5);
      add('Running', '🏃', '20 min', 9.8, 0.33);
    }
    return workouts.filter((w, i, a) => a.findIndex(x => x.type === w.type) === i);
  }, [user, weight]);

  // ─── Metric Cards ─────────────────────────────────────────────
  const metricCards = [
    {
      id: 'steps', label: 'STEPS', icon: Footprints, color: '#C8F53C',
      value: stepper.steps.toLocaleString(),
      target: `/ ${stepGoal.toLocaleString()}`,
      progress: stepper.steps / stepGoal,
      detail: stepper.isActive ? `${stepper.cadence} spm` : 'Sensor off',
      sensor: 'Accelerometer',
    },
    {
      id: 'distance', label: 'DISTANCE', icon: MapPin, color: '#3CF5D8',
      value: distKm.toFixed(2), unit: 'km',
      progress: distKm / 5,
      detail: `${gps.totalDistanceM.toFixed(0)} m`,
      sensor: 'GPS',
    },
    {
      id: 'calories', label: 'CALORIES', icon: Flame, color: '#F5603C',
      value: Math.round(totalCalories).toString(), unit: 'kcal',
      target: `/ ${calorieGoal}`,
      progress: totalCalories / calorieGoal,
      detail: gps.isTracking ? 'MET × speed' : 'From steps',
      sensor: gps.isTracking ? 'GPS+MET' : 'Accel',
    },
    {
      id: 'active-time', label: 'ACTIVE TIME', icon: Timer, color: '#F5C03C',
      value: fmtDuration(gps.activeSeconds),
      progress: gps.activeSeconds / 3600,
      detail: null,
      sensor: 'Timer',
    },
    {
      id: 'speed', label: 'SPEED', icon: Gauge, color: '#C8F53C',
      value: (gps.currentSpeed * 3.6).toFixed(1), unit: 'km/h',
      progress: (gps.currentSpeed * 3.6) / 15,
      detail: `Avg: ${gps.avgSpeedKmh.toFixed(1)} km/h`,
      sensor: 'GPS',
    },
    {
      id: 'cadence', label: 'CADENCE', icon: Vibrate, color: '#A078F5',
      value: stepper.cadence ? `${stepper.cadence}` : '—',
      unit: stepper.cadence ? 'spm' : '',
      progress: stepper.cadence / 180,
      detail: 'Steps/min',
      sensor: 'Accelerometer',
    },
  ];

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: '#0A0A0C' }}>
      <div className="px-6 py-8">

        {/* ── Top bar ────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-6"
          style={{ opacity: animateIn ? 1 : 0, transform: animateIn ? 'none' : 'translateY(-10px)', transition: 'all 0.7s' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', color: '#8A8A92', letterSpacing: '0.1em' }}>
              {getGreeting()}
            </div>
            <div className="mt-1" style={{ fontFamily: 'var(--font-bebas)', fontSize: '28px', color: '#FFF', letterSpacing: '0.02em' }}>
              {firstName} 👋
            </div>
          </div>
          <button onClick={() => navigate('/profile')}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #3CF5D8, #C8F53C)', padding: '2px' }}>
              <div className="w-full h-full rounded-full flex items-center justify-center" style={{ backgroundColor: '#18181D' }}>
                <span className="text-lg">{firstName.charAt(0).toUpperCase()}</span>
              </div>
            </div>
          </button>
        </div>

        {/* ── Profile chips ──────────────────────────────────── */}
        {user && (user.heightCm > 0 || user.goals.length > 0) && (
          <div className="flex gap-3 mb-6 overflow-x-auto scrollbar-hide pb-1 -mx-6 px-6"
            style={{ opacity: animateIn ? 1 : 0, transition: 'all 0.7s 0.1s' }}>
            {user.heightCm > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg shrink-0" style={{ backgroundColor: '#18181D' }}>
                <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', color: '#5A5A62' }}>BMI</span>
                <span style={{ fontFamily: 'var(--font-bebas)', fontSize: '16px', color: bmiInfo.color }}>{bmi.toFixed(1)}</span>
                <span className="px-1.5 py-0.5 rounded text-[9px]"
                  style={{ backgroundColor: `${bmiInfo.color}20`, color: bmiInfo.color, fontFamily: 'var(--font-dm-sans)' }}>{bmiInfo.label}</span>
              </div>
            )}
            {user.goals.slice(0, 3).map(g => (
              <div key={g} className="px-3 py-2 rounded-lg shrink-0"
                style={{ backgroundColor: '#18181D', fontFamily: 'var(--font-dm-sans)', fontSize: '12px', color: '#8A8A92' }}>
                {getGoalLabel(g)}
              </div>
            ))}
          </div>
        )}

        {/* ── Tab slider ─────────────────────────────────────── */}
        <div className="flex p-1 rounded-2xl mb-6"
          style={{ backgroundColor: '#111114', opacity: animateIn ? 1 : 0, transition: 'all 0.7s 0.2s' }}>
          {([
            { id: 'physical' as const, label: 'Physical Health', icon: Activity, color: '#C8F53C' },
            { id: 'mental' as const, label: 'Mental Health', icon: Brain, color: '#A078F5' },
          ]).map(tab => {
            const I = tab.icon;
            const on = activeTab === tab.id;
            return (
              <button key={tab.id} id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-300"
                style={{ backgroundColor: on ? '#18181D' : 'transparent', boxShadow: on ? '0 2px 8px rgba(0,0,0,.3)' : 'none' }}>
                <I size={16} color={on ? tab.color : '#5A5A62'} />
                <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', fontWeight: on ? 700 : 400, color: on ? '#FFF' : '#5A5A62' }}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* ════════════════════════════════════════════════════════ */}
        {/* ── PHYSICAL HEALTH ────────────────────────────────── */}
        {/* ════════════════════════════════════════════════════════ */}
        {activeTab === 'physical' && (
          <div style={{ opacity: animateIn ? 1 : 0, transition: 'all 0.5s 0.3s' }}>

            {/* Errors */}
            {(stepper.error || gps.error) && (
              <div className="flex items-start gap-3 p-4 rounded-xl mb-4"
                style={{ backgroundColor: 'rgba(245,96,60,.08)', border: '1px solid rgba(245,96,60,.2)' }}>
                <AlertCircle size={16} color="#F5603C" className="mt-0.5 shrink-0" />
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '12px', color: '#8A8A92', lineHeight: 1.5 }}>
                  {stepper.error || gps.error}
                </p>
              </div>
            )}

            {/* ─── Step Counter Card (Accelerometer) ─────────── */}
            <div className="p-5 rounded-2xl mb-4 relative overflow-hidden"
              style={{
                background: stepper.isActive
                  ? 'linear-gradient(135deg, rgba(200,245,60,.06) 0%, rgba(60,245,216,.04) 100%)'
                  : '#111114',
                border: stepper.isActive ? '1px solid rgba(200,245,60,.12)' : '1px solid rgba(255,255,255,.04)',
              }}>

              {/* Sensor badge + status */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Vibrate size={14} color="#C8F53C" />
                  <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', color: '#C8F53C', letterSpacing: '0.05em' }}>
                    ACCELEROMETER
                  </span>
                </div>
                {stepper.isActive && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{
                      backgroundColor:
                        stepper.sensorStatus === 'receiving' ? '#C8F53C' :
                        stepper.sensorStatus === 'no-data' ? '#F5603C' :
                        '#F5C03C',
                      animation: stepper.sensorStatus === 'receiving' ? 'pulse-dot 1.5s ease-in-out infinite' : 'none',
                    }} />
                    <span style={{
                      fontFamily: 'var(--font-jetbrains)', fontSize: '9px',
                      color: stepper.sensorStatus === 'receiving' ? '#C8F53C' :
                        stepper.sensorStatus === 'no-data' ? '#F5603C' : '#F5C03C',
                    }}>
                      {stepper.sensorStatus === 'receiving' ? 'ACTIVE' :
                       stepper.sensorStatus === 'no-data' ? 'NO DATA' :
                       stepper.sensorStatus === 'listening' ? 'WAITING…' :
                       stepper.sensorStatus === 'requesting' ? 'STARTING…' : 'COUNTING'}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-5">
                <Ring value={stepper.steps} max={stepGoal} color="#C8F53C" size={110}>
                  <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '24px', color: '#C8F53C', lineHeight: 1 }}>
                    {stepper.steps.toLocaleString()}
                  </div>
                  <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '8px', color: '#5A5A62', letterSpacing: '0.05em' }}>STEPS</div>
                  <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '7px', color: '#3A3A42', marginTop: 1 }}>
                    /{stepGoal.toLocaleString()}
                  </div>
                </Ring>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Flame size={14} color="#F5603C" />
                    <span style={{ fontFamily: 'var(--font-bebas)', fontSize: '18px', color: '#FFF', lineHeight: 1 }}>
                      {Math.round(totalCalories)} <span style={{ fontSize: '11px', color: '#5A5A62' }}>kcal</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity size={14} color="#F5C03C" />
                    <span style={{ fontFamily: 'var(--font-bebas)', fontSize: '18px', color: '#FFF', lineHeight: 1 }}>
                      {stepper.cadence || '—'} <span style={{ fontSize: '11px', color: '#5A5A62' }}>spm</span>
                    </span>
                  </div>
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '11px', color: '#3A3A42', lineHeight: 1.4 }}>
                    Detects walking vibration patterns from your device's motion sensor
                  </p>
                </div>
              </div>

              {/* ── Sensor Diagnostic Panel ───────────────────── */}
              {stepper.isActive && (
                <div className="mt-4 p-3 rounded-xl" style={{ backgroundColor: '#0D0D10', border: '1px solid rgba(255,255,255,.04)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{
                      backgroundColor: stepper.debug.eventsReceived > 0 ? '#C8F53C' : '#F5603C',
                    }} />
                    <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '9px', color: '#5A5A62', letterSpacing: '0.05em' }}>
                      SENSOR DIAGNOSTICS • {stepper.debug.sensorType}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {[
                      { label: 'X', value: stepper.debug.rawX.toFixed(2), color: '#F5603C' },
                      { label: 'Y', value: stepper.debug.rawY.toFixed(2), color: '#C8F53C' },
                      { label: 'Z', value: stepper.debug.rawZ.toFixed(2), color: '#3CF5D8' },
                    ].map(axis => (
                      <div key={axis.label} className="text-center p-1.5 rounded-lg" style={{ backgroundColor: '#18181D' }}>
                        <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '8px', color: '#5A5A62' }}>{axis.label}</div>
                        <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '14px', color: axis.color, lineHeight: 1 }}>
                          {axis.value}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-1.5 rounded-lg" style={{ backgroundColor: '#18181D' }}>
                      <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '8px', color: '#5A5A62' }}>MAG</div>
                      <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '14px', color: '#FFF', lineHeight: 1 }}>
                        {stepper.debug.magnitude.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-center p-1.5 rounded-lg" style={{ backgroundColor: '#18181D' }}>
                      <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '8px', color: '#5A5A62' }}>DEV</div>
                      <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '14px',
                        color: stepper.debug.deviation > 0.8 ? '#C8F53C' : '#5A5A62', lineHeight: 1 }}>
                        {stepper.debug.deviation.toFixed(3)}
                      </div>
                    </div>
                    <div className="text-center p-1.5 rounded-lg" style={{ backgroundColor: '#18181D' }}>
                      <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '8px', color: '#5A5A62' }}>EVENTS</div>
                      <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '14px',
                        color: stepper.debug.eventsReceived > 0 ? '#3CF5D8' : '#F5603C', lineHeight: 1 }}>
                        {stepper.debug.eventsReceived}
                      </div>
                    </div>
                  </div>

                  {/* Status message */}
                  {stepper.sensorStatus === 'no-data' && (
                    <p className="mt-2" style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '11px', color: '#F5603C', lineHeight: 1.4 }}>
                      ⚠️ No accelerometer data received. Most laptops don't expose motion sensors to browsers.
                      Open this page on your <strong>mobile phone</strong> for real step tracking.
                    </p>
                  )}
                  {stepper.sensorStatus === 'listening' && (
                    <p className="mt-2" style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '11px', color: '#F5C03C', lineHeight: 1.4 }}>
                      ⏳ Waiting for sensor data… If you're on a laptop, the sensor may not be available.
                    </p>
                  )}
                  {stepper.sensorStatus === 'receiving' && stepper.debug.eventsReceived > 0 && (
                    <p className="mt-2" style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '11px', color: '#C8F53C', lineHeight: 1.4 }}>
                      ✅ Sensor active! Walk with your device to count steps. DEV value spikes above 0.8 = step detected.
                    </p>
                  )}
                </div>
              )}

              <button
                id="step-toggle"
                onClick={() => stepper.isActive ? stepper.stopCounting() : stepper.startCounting()}
                className="w-full mt-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98]"
                style={{
                  background: stepper.isActive
                    ? 'rgba(245,96,60,.12)' : 'linear-gradient(135deg, #C8F53C, #B8E535)',
                  border: stepper.isActive ? '1px solid rgba(245,96,60,.25)' : 'none',
                  fontFamily: 'var(--font-dm-sans)', fontSize: '14px', fontWeight: 700,
                  color: stepper.isActive ? '#F5603C' : '#0A0A0C',
                  boxShadow: stepper.isActive ? 'none' : '0 4px 20px rgba(200,245,60,.2)',
                }}>
                {stepper.isActive ? <><Pause size={16} /> Stop Step Counter</> : <><Footprints size={16} /> Start Step Counter</>}
              </button>

              {stepper.sensorStatus === 'unavailable' && (
                <p className="mt-2 text-center" style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '11px', color: '#F5C03C' }}>
                  Motion sensors not available — use a mobile device for real step tracking
                </p>
              )}
            </div>

            {/* ─── GPS Distance Tracking Card ────────────────── */}
            <div className="p-5 rounded-2xl mb-6 relative overflow-hidden"
              style={{
                background: gps.isTracking
                  ? 'linear-gradient(135deg, rgba(60,245,216,.06) 0%, rgba(160,120,245,.04) 100%)'
                  : '#111114',
                border: gps.isTracking ? '1px solid rgba(60,245,216,.12)' : '1px solid rgba(255,255,255,.04)',
              }}>

              {/* Sensor badge */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Navigation size={14} color="#3CF5D8" />
                  <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', color: '#3CF5D8', letterSpacing: '0.05em' }}>
                    GPS TRACKING
                  </span>
                </div>
                {gps.isTracking && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: gps.isPaused ? '#F5C03C' : '#3CF5D8', animation: gps.isPaused ? 'none' : 'pulse-dot 1.5s ease-in-out infinite' }} />
                    <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '9px', color: gps.isPaused ? '#F5C03C' : '#3CF5D8' }}>
                      {gps.isPaused ? 'PAUSED' : 'LIVE'}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-5">
                <Ring value={distKm} max={5} color="#3CF5D8" size={100}>
                  <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '22px', color: '#3CF5D8', lineHeight: 1 }}>
                    {distKm.toFixed(2)}
                  </div>
                  <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '8px', color: '#5A5A62' }}>KM</div>
                </Ring>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Gauge size={14} color="#F5C03C" />
                    <span style={{ fontFamily: 'var(--font-bebas)', fontSize: '18px', color: '#FFF', lineHeight: 1 }}>
                      {(gps.currentSpeed * 3.6).toFixed(1)} <span style={{ fontSize: '11px', color: '#5A5A62' }}>km/h</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target size={14} color="#A078F5" />
                    <span style={{ fontFamily: 'var(--font-bebas)', fontSize: '18px', color: '#FFF', lineHeight: 1 }}>
                      {gps.currentPace} <span style={{ fontSize: '11px', color: '#5A5A62' }}>/km</span>
                    </span>
                  </div>
                  {gps.isTracking && (
                    <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '24px', color: gps.isPaused ? '#F5C03C' : '#3CF5D8', letterSpacing: '0.03em' }}>
                      {fmtDuration(gps.activeSeconds)}
                    </div>
                  )}
                </div>
              </div>

              {/* Activity picker */}
              {!gps.isTracking && showActivityPicker && (
                <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide pb-1">
                  {ACTIVITIES.map(a => (
                    <button key={a.id} onClick={() => { gps.setActivityType(a.id); setShowActivityPicker(false); }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg shrink-0"
                      style={{
                        backgroundColor: gps.activityType === a.id ? 'rgba(60,245,216,.1)' : '#1F1F26',
                        border: gps.activityType === a.id ? '1px solid rgba(60,245,216,.3)' : '1px solid transparent',
                      }}>
                      <span>{a.emoji}</span>
                      <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '12px', color: gps.activityType === a.id ? '#3CF5D8' : '#8A8A92' }}>{a.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Controls */}
              <div className="flex gap-3 mt-4">
                {!gps.isTracking ? (
                  <>
                    <button onClick={() => setShowActivityPicker(!showActivityPicker)}
                      className="px-4 py-3 rounded-xl active:scale-[0.97]"
                      style={{ backgroundColor: '#1F1F26', fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: '#8A8A92', border: '1px solid rgba(255,255,255,.06)' }}>
                      {ACTIVITIES.find(a => a.id === gps.activityType)?.emoji} Activity
                    </button>
                    <button id="start-gps" onClick={() => gps.startTracking(gps.activityType)}
                      className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98]"
                      style={{
                        background: 'linear-gradient(135deg, #3CF5D8, #2AE0C0)',
                        fontFamily: 'var(--font-dm-sans)', fontSize: '14px', fontWeight: 700, color: '#0A0A0C',
                        boxShadow: '0 4px 20px rgba(60,245,216,.2)',
                      }}>
                      <Navigation size={16} /> Start GPS
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => gps.isPaused ? gps.resumeTracking() : gps.pauseTracking()}
                      className="px-4 py-3 rounded-xl flex items-center gap-2 active:scale-[0.97]"
                      style={{ backgroundColor: 'rgba(245,192,60,.12)', border: '1px solid rgba(245,192,60,.2)', fontFamily: 'var(--font-dm-sans)', fontSize: '13px', fontWeight: 600, color: '#F5C03C' }}>
                      {gps.isPaused ? <Play size={14} /> : <Pause size={14} />}
                      {gps.isPaused ? 'Resume' : 'Pause'}
                    </button>
                    <button id="stop-gps" onClick={() => gps.stopTracking()}
                      className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98]"
                      style={{ backgroundColor: 'rgba(245,96,60,.12)', border: '1px solid rgba(245,96,60,.25)', fontFamily: 'var(--font-dm-sans)', fontSize: '14px', fontWeight: 700, color: '#F5603C' }}>
                      <RotateCcw size={16} /> Stop & Save
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* ── How it works ───────────────────────────────── */}
            <div className="flex items-start gap-2 p-3 rounded-xl mb-6"
              style={{ backgroundColor: 'rgba(200,245,60,.04)', border: '1px solid rgba(200,245,60,.06)' }}>
              <Target size={14} color="#C8F53C" className="mt-0.5 shrink-0" />
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '11px', color: '#5A5A62', lineHeight: 1.5 }}>
                <strong style={{ color: '#8A8A92' }}>Steps:</strong> Accelerometer detects walking vibration peaks.{' '}
                <strong style={{ color: '#8A8A92' }}>Distance:</strong> GPS coordinates + Haversine formula.{' '}
                <strong style={{ color: '#8A8A92' }}>Calories:</strong> MET × {user?.weightKg || 70}kg × time (speed-adjusted).
              </p>
            </div>

            {/* ── Metric grid ────────────────────────────────── */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', color: '#8A8A92', letterSpacing: '0.1em' }}>LIVE METRICS</span>
                <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '11px', color: '#5A5A62' }}>
                  {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {metricCards.map(c => {
                  const I = c.icon;
                  return (
                    <div key={c.id} className="p-4 rounded-xl relative overflow-hidden" style={{ backgroundColor: '#18181D', borderTop: `2px solid ${c.color}` }}>
                      <div className="absolute bottom-0 left-0 right-0 transition-all duration-1000"
                        style={{ height: `${Math.min(c.progress, 1) * 100}%`, backgroundColor: `${c.color}08` }} />
                      <div className="relative">
                        <div className="flex items-center justify-between mb-2">
                          <I size={16} color={c.color} />
                          <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '9px', color: '#5A5A62', letterSpacing: '0.05em' }}>{c.label}</span>
                        </div>
                        <div style={{ fontFamily: 'var(--font-bebas)', fontSize: '28px', color: '#FFF', lineHeight: 1 }}>{c.value}</div>
                        {c.unit && <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', color: '#5A5A62' }}>{c.unit}</span>}
                        {c.target && <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '11px', color: '#5A5A62', marginLeft: 4 }}>{c.target}</span>}
                        {c.detail && <div className="mt-1" style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '9px', color: '#3A3A42' }}>{c.detail}</div>}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex-1 h-1 rounded-full mr-2" style={{ backgroundColor: '#2A2A2E' }}>
                            <div className="h-full rounded-full transition-all duration-1000"
                              style={{ width: `${Math.min(c.progress, 1) * 100}%`, backgroundColor: c.color }} />
                          </div>
                          <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '7px', color: '#3A3A42' }}>{c.sensor}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Suggested workouts ─────────────────────────── */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', color: '#8A8A92', letterSpacing: '0.1em' }}>SUGGESTED FOR YOU</span>
                <button className="flex items-center gap-1" style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '12px', color: '#C8F53C' }}>
                  See all <ChevronRight size={14} />
                </button>
              </div>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-6 px-6 pb-2">
                {suggestedWorkouts.map((w, i) => (
                  <button key={i} className="flex-shrink-0 p-4 rounded-xl active:scale-[0.97]"
                    style={{ backgroundColor: '#18181D', minWidth: 150, border: '1px solid rgba(255,255,255,.04)', textAlign: 'left' }}>
                    <div className="text-2xl mb-2">{w.emoji}</div>
                    <div style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '14px', fontWeight: 700, color: '#FFF', marginBottom: 4 }}>{w.type}</div>
                    <div className="flex items-center gap-2">
                      <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', color: '#5A5A62' }}>{w.duration}</span>
                      <span style={{ color: '#2A2A2E' }}>·</span>
                      <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', color: '#F5603C' }}>{w.cal}</span>
                    </div>
                  </button>
                ))}
                <button className="flex-shrink-0 p-4 rounded-xl flex flex-col items-center justify-center"
                  style={{ minWidth: 100, border: '1px dashed #2A2A2E' }}>
                  <Plus size={20} color="#5A5A62" />
                  <span className="mt-1" style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '11px', color: '#5A5A62' }}>Custom</span>
                </button>
              </div>
            </div>

            {/* ── Profile card ───────────────────────────────── */}
            {user && user.heightCm > 0 && (
              <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(60,245,216,.06), rgba(200,245,60,.04))', border: '1px solid rgba(60,245,216,.08)' }}>
                <div className="mb-3" style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', color: '#8A8A92', letterSpacing: '0.1em' }}>YOUR PROFILE</div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { l: 'HEIGHT', v: `${user.heightCm}`, u: 'cm', c: '#3CF5D8' },
                    { l: 'WEIGHT', v: `${user.weightKg}`, u: 'kg', c: '#C8F53C' },
                    { l: 'AGE', v: `${user.age}`, u: 'yrs', c: '#F5C03C' },
                  ].map(s => (
                    <div key={s.l} className="text-center">
                      <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '9px', color: '#5A5A62', letterSpacing: '0.05em' }}>{s.l}</div>
                      <div className="mt-1">
                        <span style={{ fontFamily: 'var(--font-bebas)', fontSize: '22px', color: s.c, lineHeight: 1 }}>{s.v}</span>
                        <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', color: '#5A5A62', marginLeft: 2 }}>{s.u}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════ */}
        {/* ── MENTAL HEALTH ──────────────────────────────────── */}
        {/* ════════════════════════════════════════════════════════ */}
        {activeTab === 'mental' && (
          <div style={{ opacity: animateIn ? 1 : 0, transition: 'all 0.5s' }}>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { label: 'Sleep', icon: Moon, color: '#A078F5', value: '—', desc: 'Track tonight' },
                { label: 'Mood', icon: Smile, color: '#F5C03C', value: '—', desc: 'Log your mood' },
                { label: 'Stress', icon: Zap, color: '#F5603C', value: '—', desc: 'Check in' },
                { label: 'Hydration', icon: Droplets, color: '#3CF5D8', value: '—', desc: 'Log water' },
              ].map(c => {
                const I = c.icon;
                return (
                  <button key={c.label} className="p-4 rounded-xl text-left active:scale-[0.97]"
                    style={{ backgroundColor: '#18181D', borderTop: `2px solid ${c.color}` }}>
                    <I size={20} color={c.color} />
                    <div className="mt-3" style={{ fontFamily: 'var(--font-bebas)', fontSize: '24px', color: '#FFF', lineHeight: 1 }}>{c.value}</div>
                    <div className="mt-1" style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '9px', color: '#5A5A62', letterSpacing: '0.05em' }}>{c.label.toUpperCase()}</div>
                    <div className="mt-2 px-2 py-1 rounded-md inline-block"
                      style={{ backgroundColor: `${c.color}15`, fontFamily: 'var(--font-dm-sans)', fontSize: '11px', color: c.color }}>{c.desc}</div>
                  </button>
                );
              })}
            </div>
            <div className="p-5 rounded-xl mb-6" style={{ background: 'linear-gradient(135deg, rgba(160,120,245,.08), rgba(60,245,216,.04))', border: '1px solid rgba(160,120,245,.12)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(160,120,245,.15)' }}><span className="text-xl">🧘</span></div>
                <div>
                  <div style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '15px', fontWeight: 700, color: '#FFF' }}>Evening Meditation</div>
                  <div style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '12px', color: '#8A8A92' }}>10 min guided session</div>
                </div>
              </div>
              <button className="w-full py-3 rounded-xl flex items-center justify-center gap-2"
                style={{ backgroundColor: 'rgba(160,120,245,.15)', border: '1px solid rgba(160,120,245,.2)', fontFamily: 'var(--font-dm-sans)', fontSize: '14px', fontWeight: 600, color: '#A078F5' }}>
                <Play size={16} /> Begin Session
              </button>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: '#111114' }}>
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 size={14} color="#F5C03C" />
                <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', color: '#8A8A92', letterSpacing: '0.1em' }}>SCREEN WELLNESS</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: '#8A8A92' }}>Productive</span>
                  <span style={{ fontFamily: 'var(--font-bebas)', fontSize: '16px', color: '#C8F53C' }}>—</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '13px', color: '#8A8A92' }}>Distraction</span>
                  <span style={{ fontFamily: 'var(--font-bebas)', fontSize: '16px', color: '#F5603C' }}>—</span>
                </div>
              </div>
              <p className="mt-3" style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '12px', color: '#5A5A62', lineHeight: 1.5 }}>
                Track screen habits for personalized digital wellness insights.
              </p>
            </div>
          </div>
        )}
      </div>
      <BottomNav currentPage="home" />
      <style>{`@keyframes pulse-dot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.5)}}`}</style>
    </div>
  );
}
