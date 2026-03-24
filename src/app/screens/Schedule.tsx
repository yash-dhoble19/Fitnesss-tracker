import BottomNav from '../components/BottomNav';

export default function Schedule() {
  const days = [
    { label: 'Mon', date: 20, active: false },
    { label: 'Tue', date: 21, active: true },
    { label: 'Wed', date: 22, active: false },
    { label: 'Thu', date: 23, active: false },
    { label: 'Fri', date: 24, active: false },
  ];

  const activities = [
    { time: '6:00', emoji: '💧', name: 'Wake & hydrate', detail: '15 min • Drink 500ml water', status: 'completed' },
    { time: '7:00', emoji: '🧘', name: 'Morning yoga', detail: '20 min • Stretching & breathing', status: 'completed' },
    { time: '8:30', emoji: '💪', name: 'Strength workout', detail: '45 min • Upper body focus', status: 'active' },
    { time: '13:00', emoji: '🥗', name: 'Lunch', detail: '30 min • High protein meal', status: 'upcoming' },
    { time: '16:00', emoji: '🚶', name: 'Evening walk', detail: '30 min • Light cardio', status: 'upcoming' },
    { time: '22:00', emoji: '😴', name: 'Sleep wind-down', detail: '15 min • Meditation & stretch', status: 'upcoming' },
  ];

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: '#0A0A0C' }}>
      <div className="px-6 py-8">
        {/* Header */}
        <div className="mb-2">
          <div 
            style={{
              fontFamily: 'var(--font-bebas)',
              fontSize: '32px',
              color: '#FFFFFF',
              letterSpacing: '0.02em',
              lineHeight: '1.1',
            }}
          >
            Today's
          </div>
          <div 
            style={{
              fontFamily: 'var(--font-bebas)',
              fontSize: '32px',
              color: '#FFFFFF',
              letterSpacing: '0.02em',
              lineHeight: '1.1',
            }}
          >
            Schedule
          </div>
        </div>
        
        <div 
          className="mb-6"
          style={{
            fontFamily: 'var(--font-jetbrains)',
            fontSize: '10px',
            color: '#8A8A92',
            letterSpacing: '0.1em',
          }}
        >
          TUESDAY, MARCH 21, 2026
        </div>

        {/* Day selector */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {days.map((day) => (
            <div
              key={day.label}
              className="flex-shrink-0 px-4 py-3 rounded-xl flex flex-col items-center min-w-[70px] relative"
              style={{
                backgroundColor: day.active ? 'rgba(200, 245, 60, 0.12)' : '#18181D',
                border: day.active ? '1px solid #C8F53C' : '1px solid transparent',
              }}
            >
              <div 
                style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '12px',
                  color: day.active ? '#C8F53C' : '#8A8A92',
                  marginBottom: '4px',
                }}
              >
                {day.label}
              </div>
              <div 
                style={{
                  fontFamily: 'var(--font-bebas)',
                  fontSize: '20px',
                  color: day.active ? '#C8F53C' : '#FFFFFF',
                  lineHeight: '1',
                }}
              >
                {day.date}
              </div>
              {day.active && (
                <div 
                  className="absolute -bottom-1 w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: '#C8F53C' }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div className="space-y-0">
          {activities.map((activity, idx) => (
            <div key={idx} className="flex gap-4">
              {/* Time column */}
              <div 
                className="pt-1"
                style={{
                  fontFamily: 'var(--font-jetbrains)',
                  fontSize: '10px',
                  color: '#5A5A62',
                  minWidth: '48px',
                }}
              >
                {activity.time}
              </div>

              {/* Timeline connector */}
              <div className="flex flex-col items-center">
                {/* Dot */}
                <div 
                  className="rounded-full flex-shrink-0 relative"
                  style={{
                    width: activity.status === 'active' ? '12px' : '8px',
                    height: activity.status === 'active' ? '12px' : '8px',
                    backgroundColor: 
                      activity.status === 'completed' ? '#C8F53C' :
                      activity.status === 'active' ? '#3CF5D8' :
                      'transparent',
                    border: activity.status === 'upcoming' ? '2px solid #2A2A2E' : 'none',
                    boxShadow: activity.status === 'active' ? '0 0 12px rgba(60, 245, 216, 0.6)' : 'none',
                  }}
                />
                {/* Line */}
                {idx < activities.length - 1 && (
                  <div 
                    className="flex-1"
                    style={{
                      width: '1px',
                      minHeight: '70px',
                      backgroundColor: '#2A2A2E',
                    }}
                  />
                )}
              </div>

              {/* Activity card */}
              <div 
                className="flex-1 mb-4 p-4 rounded-xl"
                style={{
                  backgroundColor: activity.status === 'active' ? 'rgba(60, 245, 216, 0.08)' : '#18181D',
                  border: activity.status === 'active' ? '1px solid rgba(60, 245, 216, 0.3)' : '1px solid transparent',
                  opacity: activity.status === 'completed' ? 0.5 : 1,
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="text-2xl">{activity.emoji}</div>
                    <div className="flex-1">
                      <div 
                        className="mb-1"
                        style={{
                          fontFamily: 'var(--font-dm-sans)',
                          fontSize: '13px',
                          fontWeight: 500,
                          color: '#FFFFFF',
                        }}
                      >
                        {activity.name}
                      </div>
                      <div 
                        style={{
                          fontFamily: 'var(--font-dm-sans)',
                          fontSize: '11px',
                          color: '#8A8A92',
                        }}
                      >
                        {activity.detail}
                      </div>
                    </div>
                  </div>
                  
                  {activity.status === 'active' && (
                    <button 
                      className="px-3 py-1.5 rounded-full flex items-center gap-1"
                      style={{
                        border: '1px solid #3CF5D8',
                        fontFamily: 'var(--font-dm-sans)',
                        fontSize: '11px',
                        color: '#3CF5D8',
                      }}
                    >
                      Start ▶
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav currentPage="schedule" />
    </div>
  );
}
