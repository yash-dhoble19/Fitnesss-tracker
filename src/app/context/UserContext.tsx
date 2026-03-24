import { createContext, useContext, useState, type ReactNode } from 'react';

// ─── Types ───────────────────────────────────────────────────────
export interface UserProfile {
  fullName: string;
  email: string;
  age: number;
  heightCm: number;
  weightKg: number;
  biologicalSex: string;
  bodyType: string;
  activityLevel: string;
  goals: string[];
  healthConditions: {
    diabetes: boolean;
    hypertension: boolean;
    heartCondition: boolean;
    asthma: boolean;
    other: string;
  };
  avatarUrl?: string;
}

export interface ActivityData {
  steps: number;
  stepGoal: number;
  distanceKm: number;
  caloriesBurned: number;
  calorieGoal: number;
  activeMinutes: number;
  activeGoal: number;
  workouts: WorkoutEntry[];
  heartRate: number;
  screenTimeMin: number;
  physicalTimeMin: number;
}

export interface WorkoutEntry {
  id: string;
  type: string;
  duration: number; // minutes
  calories: number;
  timestamp: Date;
  isActive: boolean;
}

interface UserContextType {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  activityData: ActivityData;
  setActivityData: (data: ActivityData) => void;
  isLoggedIn: boolean;
}

// ─── Defaults ────────────────────────────────────────────────────
const defaultActivityData: ActivityData = {
  steps: 0,
  stepGoal: 10000,
  distanceKm: 0,
  caloriesBurned: 0,
  calorieGoal: 500,
  activeMinutes: 0,
  activeGoal: 60,
  workouts: [],
  heartRate: 0,
  screenTimeMin: 0,
  physicalTimeMin: 0,
};

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  activityData: defaultActivityData,
  setActivityData: () => {},
  isLoggedIn: false,
});

// ─── Provider ────────────────────────────────────────────────────
export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activityData, setActivityData] = useState<ActivityData>(defaultActivityData);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        activityData,
        setActivityData,
        isLoggedIn: user !== null,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────
export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

// ─── Helpers ─────────────────────────────────────────────────────
export function getFirstName(fullName: string): string {
  return fullName.split(' ')[0] || 'User';
}

export function getBmi(weightKg: number, heightCm: number): number {
  if (!heightCm || !weightKg) return 0;
  return weightKg / Math.pow(heightCm / 100, 2);
}

export function getBmiCategory(bmi: number): { label: string; color: string } {
  if (bmi <= 0) return { label: '—', color: '#5A5A62' };
  if (bmi < 18.5) return { label: 'Underweight', color: '#F5C03C' };
  if (bmi < 25) return { label: 'Normal', color: '#3CF5D8' };
  if (bmi < 30) return { label: 'Overweight', color: '#F5C03C' };
  return { label: 'Obese', color: '#F5603C' };
}

export function getCalorieGoalFromProfile(profile: UserProfile): number {
  // Basic estimate based on activity level and goals
  const base = profile.biologicalSex === 'female' ? 1800 : 2200;
  const activityMultiplier =
    profile.activityLevel === 'sedentary' ? 0.8 :
    profile.activityLevel === 'light' ? 0.9 :
    profile.activityLevel === 'moderate' ? 1.0 :
    1.1;
  const goalAdjustment = profile.goals.includes('lose_weight') ? -300 :
    profile.goals.includes('build_muscle') ? 200 : 0;
  return Math.round(base * activityMultiplier + goalAdjustment);
}

export function getStepGoalFromProfile(profile: UserProfile): number {
  if (profile.activityLevel === 'sedentary') return 6000;
  if (profile.activityLevel === 'light') return 8000;
  if (profile.activityLevel === 'moderate') return 10000;
  return 12000;
}

export function getGoalLabel(goalId: string): string {
  const labels: Record<string, string> = {
    lose_weight: '🔥 Lose Weight',
    build_muscle: '💪 Build Muscle',
    mental_health: '🧘 Mental Health',
    stamina: '⚡ Stamina',
    flexibility: '🤸 Flexibility',
    better_sleep: '😴 Better Sleep',
  };
  return labels[goalId] || goalId;
}
