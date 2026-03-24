import { Home, Calendar, MessageCircle, Trophy, User } from 'lucide-react';
import { useNavigate } from 'react-router';

interface BottomNavProps {
  currentPage: 'home' | 'schedule' | 'coach' | 'rank' | 'profile';
}

export default function BottomNav({ currentPage }: BottomNavProps) {
  const navigate = useNavigate();

  const navItems = [
    { id: 'home', icon: Home, label: 'Home', path: '/dashboard' },
    { id: 'schedule', icon: Calendar, label: 'Schedule', path: '/schedule' },
    { id: 'coach', icon: MessageCircle, label: 'Coach', path: '/coach' },
    { id: 'rank', icon: Trophy, label: 'Rank', path: '/leaderboard' },
    { id: 'profile', icon: User, label: 'Profile', path: '/dashboard' },
  ];

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 px-6 py-4"
      style={{
        backgroundColor: '#111114',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      <div className="flex items-center justify-between max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center gap-1"
            >
              <Icon 
                size={22} 
                color={isActive ? '#C8F53C' : '#5A5A62'}
                strokeWidth={2}
              />
              <span 
                style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '11px',
                  color: isActive ? '#C8F53C' : '#5A5A62',
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
