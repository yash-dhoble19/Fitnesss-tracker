import { useNavigate } from 'react-router';

export default function Onboarding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A0A0C' }}>
      {/* Radial glow background */}
      <div 
        className="absolute top-0 right-0 w-96 h-96 opacity-30 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, #C8F53C 0%, transparent 70%)',
        }}
      />
      
      <div className="relative px-6 py-10 min-h-screen flex flex-col">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className="rounded-full transition-all"
              style={{
                width: step === 2 ? '36px' : '8px',
                height: '8px',
                backgroundColor: step <= 2 ? '#C8F53C' : '#2A2A2E',
              }}
            />
          ))}
        </div>

        {/* Step label */}
        <div 
          className="mb-2 tracking-wider"
          style={{
            fontFamily: 'var(--font-jetbrains)',
            fontSize: '10px',
            color: '#C8F53C',
            letterSpacing: '0.1em',
          }}
        >
          STEP 2 OF 5 — BODY METRICS
        </div>

        {/* Headline */}
        <h1 
          className="mb-8"
          style={{
            fontFamily: 'var(--font-bebas)',
            fontSize: '42px',
            color: '#FFFFFF',
            letterSpacing: '0.02em',
            lineHeight: '1',
          }}
        >
          Your body data
        </h1>

        {/* Body metric fields */}
        <div className="mb-8 space-y-3">
          {[
            { label: 'Age', value: '28', unit: 'years' },
            { label: 'Height', value: '175', unit: 'cm' },
            { label: 'Weight', value: '72', unit: 'kg' },
          ].map((field) => (
            <div
              key={field.label}
              className="p-4 rounded-xl flex items-center justify-between"
              style={{ backgroundColor: '#18181D' }}
            >
              <div>
                <div 
                  className="mb-1"
                  style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '12px',
                    color: '#8A8A92',
                  }}
                >
                  {field.label}
                </div>
                <div className="flex items-baseline gap-2">
                  <span 
                    style={{
                      fontFamily: 'var(--font-dm-sans)',
                      fontSize: '20px',
                      color: '#FFFFFF',
                      fontWeight: 300,
                    }}
                  >
                    {field.value}
                  </span>
                  <span 
                    style={{
                      fontFamily: 'var(--font-jetbrains)',
                      fontSize: '11px',
                      color: '#5A5A62',
                    }}
                  >
                    {field.unit}
                  </span>
                </div>
              </div>
              <button 
                className="px-3 py-1"
                style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '13px',
                  color: '#C8F53C',
                }}
              >
                Edit
              </button>
            </div>
          ))}
        </div>

        {/* Goal selection grid */}
        <div className="mb-8">
          <div 
            className="mb-4"
            style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '14px',
              color: '#8A8A92',
            }}
          >
            Select your primary goal
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { emoji: '🔥', name: 'Lose Weight', subtitle: 'Fat loss & cardio', selected: false },
              { emoji: '💪', name: 'Build Muscle', subtitle: 'Strength & size', selected: true },
              { emoji: '🧘', name: 'Mental Health', subtitle: 'Stress & balance', selected: false },
              { emoji: '⚡', name: 'Stamina', subtitle: 'Endurance boost', selected: false },
            ].map((goal) => (
              <div
                key={goal.name}
                className="p-4 rounded-xl"
                style={{
                  backgroundColor: goal.selected ? 'rgba(200, 245, 60, 0.12)' : '#18181D',
                  border: goal.selected ? '2px solid #C8F53C' : '2px solid transparent',
                }}
              >
                <div className="text-2xl mb-2">{goal.emoji}</div>
                <div 
                  className="mb-1"
                  style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '15px',
                    fontWeight: 700,
                    color: '#FFFFFF',
                  }}
                >
                  {goal.name}
                </div>
                <div 
                  style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '11px',
                    color: '#8A8A92',
                  }}
                >
                  {goal.subtitle}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-auto">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-4 rounded-3xl"
            style={{
              backgroundColor: '#C8F53C',
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '16px',
              fontWeight: 700,
              color: '#0A0A0C',
            }}
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}
