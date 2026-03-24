import BottomNav from '../components/BottomNav';

export default function Leaderboard() {
  const podium = [
    { rank: 2, name: 'Sarah K.', score: 94, medal: '🥈', color: '#C8F53C', avatar: '👩' },
    { rank: 1, name: 'Alex M.', score: 98, medal: '🥇', color: '#F5C03C', avatar: '👨' },
    { rank: 3, name: 'Mike T.', score: 91, medal: '🥉', color: '#8A8A92', avatar: '👨' },
  ];

  const leaderboard = [
    { rank: 4, name: 'Emma W.', streak: '12🔥', score: 88, change: '+2', changeUp: true },
    { rank: 5, name: 'David L.', streak: '8🔥', score: 86, change: '-1', changeUp: false },
    { rank: 6, name: 'Sophie R.', streak: '15🔥', score: 85, change: '+3', changeUp: true },
    { rank: 7, name: 'James P.', streak: '5🔥', score: 83, change: '0', changeUp: null },
    { rank: 24, name: 'Rahul (You)', streak: '7🔥', score: 76, change: '+4', changeUp: true, isUser: true },
    { rank: 25, name: 'Lisa M.', streak: '3🔥', score: 75, change: '-2', changeUp: false },
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
            Leaderboard
          </div>
        </div>
        
        <div 
          className="mb-8"
          style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '12px',
            color: '#8A8A92',
          }}
        >
          Weekly fitness score ranking
        </div>

        {/* Podium */}
        <div className="flex items-end justify-center gap-4 mb-8">
          {podium.map((person) => (
            <div 
              key={person.rank} 
              className="flex flex-col items-center"
              style={{ width: '100px' }}
            >
              {/* Name */}
              <div 
                className="mb-2"
                style={{
                  fontFamily: 'var(--font-jetbrains)',
                  fontSize: '9px',
                  color: '#8A8A92',
                  letterSpacing: '0.05em',
                }}
              >
                {person.name.toUpperCase()}
              </div>

              {/* Avatar with ring */}
              <div 
                className="relative mb-3"
                style={{
                  padding: '3px',
                  borderRadius: '50%',
                  background: person.rank === 1 
                    ? 'linear-gradient(135deg, #F5C03C 0%, #F5A03C 100%)'
                    : person.rank === 2
                    ? 'linear-gradient(135deg, #C8F53C 0%, #A8D53C 100%)'
                    : '#8A8A92',
                }}
              >
                <div 
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#18181D' }}
                >
                  <span className="text-2xl">{person.avatar}</span>
                </div>
                {/* Medal badge */}
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-xl">
                  {person.medal}
                </div>
              </div>

              {/* Score */}
              <div 
                className="mb-3"
                style={{
                  fontFamily: 'var(--font-jetbrains)',
                  fontSize: '10px',
                  color: person.color,
                }}
              >
                {person.score} pts
              </div>

              {/* Podium block */}
              <div 
                className="w-full rounded-t-lg"
                style={{
                  height: person.rank === 1 ? '80px' : person.rank === 2 ? '60px' : '40px',
                  background: person.rank === 1
                    ? 'linear-gradient(to bottom, rgba(245, 192, 60, 0.3), rgba(245, 192, 60, 0.1))'
                    : person.rank === 2
                    ? 'linear-gradient(to bottom, rgba(200, 245, 60, 0.3), rgba(200, 245, 60, 0.1))'
                    : 'linear-gradient(to bottom, rgba(138, 138, 146, 0.2), rgba(138, 138, 146, 0.05))',
                }}
              />
            </div>
          ))}
        </div>

        {/* Leaderboard list */}
        <div className="space-y-2">
          {leaderboard.map((person) => (
            <div
              key={person.rank}
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{
                backgroundColor: person.isUser ? 'rgba(200, 245, 60, 0.12)' : '#18181D',
              }}
            >
              {/* Rank */}
              <div 
                className="min-w-[32px] text-center"
                style={{
                  fontFamily: 'var(--font-bebas)',
                  fontSize: '18px',
                  color: person.isUser ? '#C8F53C' : '#8A8A92',
                }}
              >
                {person.rank}
              </div>

              {/* Avatar */}
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: person.isUser 
                    ? 'linear-gradient(135deg, #C8F53C 0%, #A8D53C 100%)'
                    : '#2A2A2E',
                  padding: person.isUser ? '2px' : '0',
                }}
              >
                <div 
                  className="w-full h-full rounded-full flex items-center justify-center text-lg"
                  style={{ backgroundColor: person.isUser ? '#18181D' : 'transparent' }}
                >
                  {person.isUser ? '👤' : '👤'}
                </div>
              </div>

              {/* Name and streak */}
              <div className="flex-1">
                <div 
                  className="mb-0.5"
                  style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#FFFFFF',
                  }}
                >
                  {person.name}
                </div>
                <div 
                  style={{
                    fontFamily: 'var(--font-jetbrains)',
                    fontSize: '10px',
                    color: '#8A8A92',
                  }}
                >
                  {person.streak} day streak
                </div>
              </div>

              {/* Score */}
              <div 
                style={{
                  fontFamily: 'var(--font-bebas)',
                  fontSize: '22px',
                  color: person.isUser ? '#C8F53C' : '#FFFFFF',
                }}
              >
                {person.score}
              </div>

              {/* Change */}
              <div 
                className="min-w-[40px] text-right"
                style={{
                  fontFamily: 'var(--font-jetbrains)',
                  fontSize: '9px',
                  color: person.changeUp === null ? '#8A8A92' : person.changeUp ? '#C8F53C' : '#F5603C',
                }}
              >
                {person.changeUp === true && '▲ '}
                {person.changeUp === false && '▼ '}
                {person.change}
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav currentPage="rank" />
    </div>
  );
}
