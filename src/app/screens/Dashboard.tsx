import { Home, Calendar, MessageCircle, Trophy, User } from 'lucide-react';
import { useNavigate } from 'react-router';
import BottomNav from '../components/BottomNav';

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: '#0A0A0C' }}>
      <div className="px-6 py-8">
        {/* Top bar */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div 
              className="mb-1"
              style={{
                fontFamily: 'var(--font-jetbrains)',
                fontSize: '10px',
                color: '#8A8A92',
                letterSpacing: '0.1em',
              }}
            >
              GOOD MORNING
            </div>
            <div 
              style={{
                fontFamily: 'var(--font-bebas)',
                fontSize: '26px',
                color: '#FFFFFF',
                letterSpacing: '0.02em',
              }}
            >
              Rahul 👋
            </div>
          </div>
          <div className="relative">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #3CF5D8 0%, #C8F53C 100%)',
                padding: '2px',
              }}
            >
              <div 
                className="w-full h-full rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#18181D' }}
              >
                <span className="text-lg">👤</span>
              </div>
            </div>
            <div 
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: '#F5C03C',
                fontFamily: 'var(--font-bebas)',
                fontSize: '11px',
                color: '#0A0A0C',
              }}
            >
              24
            </div>
          </div>
        </div>

        {/* Fitness score section */}
        <div 
          className="p-5 rounded-xl mb-6"
          style={{ backgroundColor: '#111114' }}
        >
          <div className="flex items-center gap-5">
            {/* Ring chart */}
            <div className="relative" style={{ width: '100px', height: '100px' }}>
              <svg width="100" height="100" className="transform -rotate-90">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="#1F1F26"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="#C8F53C"
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 42 * 0.76} ${2 * Math.PI * 42}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div 
                  style={{
                    fontFamily: 'var(--font-bebas)',
                    fontSize: '30px',
                    color: '#C8F53C',
                    lineHeight: '1',
                  }}
                >
                  76
                </div>
                <div 
                  style={{
                    fontFamily: 'var(--font-jetbrains)',
                    fontSize: '9px',
                    color: '#5A5A62',
                    letterSpacing: '0.05em',
                  }}
                >
                  FITNESS
                </div>
              </div>
            </div>

            {/* Progress details */}
            <div className="flex-1">
              <div 
                className="mb-1"
                style={{
                  fontFamily: 'var(--font-bebas)',
                  fontSize: '22px',
                  color: '#FFFFFF',
                  letterSpacing: '0.02em',
                }}
              >
                Strong Progress
              </div>
              <div 
                className="mb-3"
                style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '12px',
                  color: '#8A8A92',
                }}
              >
                +4 pts from yesterday
              </div>
              
              {/* Mini progress bars */}
              <div className="space-y-2">
                {[
                  { label: 'STEPS', color: '#C8F53C', progress: 0.72 },
                  { label: 'SLEEP', color: '#A078F5', progress: 0.85 },
                  { label: 'WATER', color: '#3CF5D8', progress: 0.60 },
                  { label: 'SCREEN', color: '#F5C03C', progress: 0.45 },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span 
                        style={{
                          fontFamily: 'var(--font-jetbrains)',
                          fontSize: '9px',
                          color: '#5A5A62',
                          letterSpacing: '0.05em',
                        }}
                      >
                        {item.label}
                      </span>
                    </div>
                    <div 
                      className="h-1 rounded-full"
                      style={{ backgroundColor: '#1F1F26' }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${item.progress * 100}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Activity cards - horizontal scroll */}
        <div className="flex gap-3 overflow-x-auto mb-6 pb-2 -mx-6 px-6 scrollbar-hide">
          {[
            { label: 'STEPS', value: '7,240', total: '10,000', trend: '+12%', trendUp: true, color: '#C8F53C' },
            { label: 'DISTANCE', value: '4.3', unit: 'km', trend: '+0.8', trendUp: true, color: '#3CF5D8' },
            { label: 'CALORIES', value: '387', unit: 'kcal', trend: '-23', trendUp: false, color: '#F5603C' },
            { label: 'ACTIVE TIME', value: '1h 24m', trend: '+18m', trendUp: true, color: '#C8F53C' },
          ].map((activity, idx) => (
            <div
              key={idx}
              className="flex-shrink-0 p-4 rounded-2xl relative"
              style={{
                backgroundColor: '#18181D',
                minWidth: '130px',
              }}
            >
              {/* Trend indicator */}
              <div 
                className="absolute top-3 right-3 px-2 py-0.5 rounded text-xs"
                style={{
                  backgroundColor: activity.trendUp ? 'rgba(60, 245, 216, 0.15)' : 'rgba(245, 96, 60, 0.15)',
                  fontFamily: 'var(--font-jetbrains)',
                  fontSize: '9px',
                  color: activity.trendUp ? '#3CF5D8' : '#F5603C',
                }}
              >
                {activity.trendUp ? '▲' : '▼'} {activity.trend}
              </div>

              <div className="mt-6">
                <div 
                  className="mb-1"
                  style={{
                    fontFamily: 'var(--font-bebas)',
                    fontSize: '28px',
                    color: activity.color,
                    lineHeight: '1',
                  }}
                >
                  {activity.value}
                </div>
                {activity.total && (
                  <div 
                    style={{
                      fontFamily: 'var(--font-dm-sans)',
                      fontSize: '11px',
                      color: '#5A5A62',
                    }}
                  >
                    / {activity.total}
                  </div>
                )}
                {activity.unit && (
                  <div 
                    style={{
                      fontFamily: 'var(--font-jetbrains)',
                      fontSize: '10px',
                      color: '#5A5A62',
                    }}
                  >
                    {activity.unit}
                  </div>
                )}
              </div>
              
              <div 
                className="mt-3"
                style={{
                  fontFamily: 'var(--font-jetbrains)',
                  fontSize: '9px',
                  color: '#5A5A62',
                  letterSpacing: '0.05em',
                }}
              >
                {activity.label}
              </div>
            </div>
          ))}
        </div>

        {/* Health conditions grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'BMI', value: '23.5', status: 'Normal', statusColor: '#3CF5D8', borderColor: '#3CF5D8', emoji: '📊' },
            { label: 'Heart Rate', value: '72', unit: 'bpm', status: 'Optimal', statusColor: '#C8F53C', borderColor: '#F5603C', emoji: '❤️' },
            { label: 'Sleep', value: '7h 12m', status: 'Good', statusColor: '#A078F5', borderColor: '#A078F5', emoji: '😴' },
            { label: 'Screen Time', value: '4h 38m', status: 'High', statusColor: '#F5C03C', borderColor: '#F5C03C', emoji: '📱' },
          ].map((health, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl"
              style={{
                backgroundColor: '#18181D',
                borderTop: `2px solid ${health.borderColor}`,
              }}
            >
              <div className="text-2xl mb-2">{health.emoji}</div>
              <div 
                className="mb-1"
                style={{
                  fontFamily: 'var(--font-bebas)',
                  fontSize: '24px',
                  color: '#FFFFFF',
                  lineHeight: '1',
                }}
              >
                {health.value}
              </div>
              {health.unit && (
                <div 
                  className="mb-2"
                  style={{
                    fontFamily: 'var(--font-jetbrains)',
                    fontSize: '10px',
                    color: '#5A5A62',
                  }}
                >
                  {health.unit}
                </div>
              )}
              <div className="flex items-center justify-between mt-2">
                <div 
                  style={{
                    fontFamily: 'var(--font-jetbrains)',
                    fontSize: '10px',
                    color: '#8A8A92',
                    letterSpacing: '0.05em',
                  }}
                >
                  {health.label.toUpperCase()}
                </div>
                <div 
                  className="px-2 py-0.5 rounded-full text-xs"
                  style={{
                    backgroundColor: `${health.statusColor}20`,
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '10px',
                    color: health.statusColor,
                  }}
                >
                  {health.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav currentPage="home" />
    </div>
  );
}
