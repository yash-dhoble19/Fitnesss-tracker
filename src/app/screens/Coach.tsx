import { Send } from 'lucide-react';
import BottomNav from '../components/BottomNav';

export default function Coach() {
  const messages = [
    {
      type: 'ai',
      text: "Hey Rahul! Your fitness score is at 76 — that's solid progress! I noticed your sleep quality could use some improvement though. Getting consistent 8-hour nights would boost your recovery.",
    },
    {
      type: 'user',
      text: "What's affecting my score the most?",
    },
    {
      type: 'ai',
      text: "Right now, your step count is strong at 72% of target, but your screen time is a bit high. Reducing blue light exposure before bed could improve both your sleep quality and overall score by an estimated 6-8 points.",
    },
    {
      type: 'user',
      text: "Got it. What should I focus on today?",
    },
  ];

  const quickReplies = [
    'Adjust my schedule',
    'Why is my score 76?',
    'Best workout today?',
  ];

  return (
    <div className="min-h-screen pb-40" style={{ backgroundColor: '#0A0A0C' }}>
      <div className="px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          {/* Pulsing dot */}
          <div className="relative">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: '#C8F53C' }}
            />
            <div 
              className="absolute inset-0 w-3 h-3 rounded-full animate-ping"
              style={{ backgroundColor: '#C8F53C', opacity: 0.4 }}
            />
          </div>
          
          <div className="flex-1">
            <div 
              style={{
                fontFamily: 'var(--font-bebas)',
                fontSize: '24px',
                color: '#FFFFFF',
                letterSpacing: '0.02em',
                lineHeight: '1',
              }}
            >
              FitPulse AI
            </div>
            <div 
              className="mt-1"
              style={{
                fontFamily: 'var(--font-jetbrains)',
                fontSize: '10px',
                color: '#8A8A92',
                letterSpacing: '0.05em',
              }}
            >
              PERSONALISED HEALTH COACH · ONLINE
            </div>
          </div>
        </div>

        {/* Chat messages */}
        <div className="space-y-4 mb-6">
          {messages.map((message, idx) => (
            <div
              key={idx}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.type === 'ai' && (
                <div className="mr-2 text-xl flex-shrink-0">🤖</div>
              )}
              
              <div
                className="max-w-[80%] px-4 py-3"
                style={{
                  backgroundColor: message.type === 'user' ? 'rgba(200, 245, 60, 0.12)' : '#18181D',
                  borderRadius: message.type === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '14px',
                  color: '#FFFFFF',
                  lineHeight: '1.5',
                }}
              >
                {message.type === 'ai' ? (
                  <span>
                    {message.text.split(/(\bfitness score\b|\bsleep quality\b|\bstep count\b|\bscreen time\b)/).map((part, i) => {
                      if (['fitness score', 'sleep quality', 'step count', 'screen time'].includes(part)) {
                        return (
                          <strong key={i} style={{ color: '#C8F53C', fontWeight: 700 }}>
                            {part}
                          </strong>
                        );
                      }
                      return part;
                    })}
                  </span>
                ) : (
                  message.text
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Quick reply suggestions */}
        <div className="mb-6">
          <div 
            className="mb-3"
            style={{
              fontFamily: 'var(--font-jetbrains)',
              fontSize: '10px',
              color: '#5A5A62',
              letterSpacing: '0.05em',
            }}
          >
            SUGGESTED QUESTIONS
          </div>
          <div className="flex flex-wrap gap-2">
            {quickReplies.map((reply, idx) => (
              <button
                key={idx}
                className="px-4 py-2 rounded-full"
                style={{
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backgroundColor: 'transparent',
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '13px',
                  color: '#8A8A92',
                }}
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input bar - fixed at bottom */}
      <div 
        className="fixed bottom-20 left-0 right-0 px-6 py-4"
        style={{
          backgroundColor: '#0A0A0C',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Ask your coach anything..."
            className="flex-1 px-4 py-3 rounded-2xl outline-none"
            style={{
              backgroundColor: '#18181D',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '14px',
              color: '#FFFFFF',
            }}
          />
          <button
            className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: '#C8F53C' }}
          >
            <Send size={18} color="#0A0A0C" />
          </button>
        </div>
      </div>

      <BottomNav currentPage="coach" />
    </div>
  );
}
