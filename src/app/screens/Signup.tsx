import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useUser } from '../context/UserContext';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  ArrowLeft,
  Dumbbell,
  Ruler,
  Weight,
  Calendar,
  Target,
  Heart,
  Check,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────
interface SignupData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  age: string;
  heightCm: string;
  weightKg: string;
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
}

const GOALS = [
  { id: 'lose_weight', emoji: '🔥', name: 'Lose Weight', subtitle: 'Fat loss & cardio', color: '#F5603C' },
  { id: 'build_muscle', emoji: '💪', name: 'Build Muscle', subtitle: 'Strength & size', color: '#C8F53C' },
  { id: 'mental_health', emoji: '🧘', name: 'Mental Health', subtitle: 'Stress & balance', color: '#A078F5' },
  { id: 'stamina', emoji: '⚡', name: 'Stamina', subtitle: 'Endurance boost', color: '#F5C03C' },
  { id: 'flexibility', emoji: '🤸', name: 'Flexibility', subtitle: 'Mobility & stretch', color: '#3CF5D8' },
  { id: 'better_sleep', emoji: '😴', name: 'Better Sleep', subtitle: 'Rest & recovery', color: '#A078F5' },
];

const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: 'Sedentary', description: 'Little to no exercise', icon: '🪑' },
  { id: 'light', label: 'Lightly Active', description: '1-3 days/week', icon: '🚶' },
  { id: 'moderate', label: 'Moderately Active', description: '3-5 days/week', icon: '🏃' },
  { id: 'intense', label: 'Very Active', description: '6-7 days/week', icon: '🏋️' },
];

const BODY_TYPES = [
  { id: 'ectomorph', label: 'Ectomorph', description: 'Lean & long', icon: '🦒' },
  { id: 'mesomorph', label: 'Mesomorph', description: 'Athletic & muscular', icon: '🐆' },
  { id: 'endomorph', label: 'Endomorph', description: 'Wide & solid', icon: '🐻' },
];

// ─── Component ───────────────────────────────────────────────────
export default function Signup() {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<SignupData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    heightCm: '',
    weightKg: '',
    biologicalSex: '',
    bodyType: '',
    activityLevel: '',
    goals: [],
    healthConditions: {
      diabetes: false,
      hypertension: false,
      heartCondition: false,
      asthma: false,
      other: '',
    },
  });

  const totalSteps = 5;

  const updateField = (field: keyof SignupData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleGoal = (goalId: string) => {
    setFormData((prev) => ({
      ...prev,
      goals: prev.goals.includes(goalId)
        ? prev.goals.filter((g) => g !== goalId)
        : [...prev.goals, goalId],
    }));
  };

  const toggleHealthCondition = (condition: keyof SignupData['healthConditions']) => {
    setFormData((prev) => ({
      ...prev,
      healthConditions: {
        ...prev.healthConditions,
        [condition]: !prev.healthConditions[condition],
      },
    }));
  };

  const handleSubmit = () => {
    setIsLoading(true);
    setTimeout(() => {
      setUser({
        fullName: formData.fullName,
        email: formData.email,
        age: parseInt(formData.age) || 0,
        heightCm: parseFloat(formData.heightCm) || 0,
        weightKg: parseFloat(formData.weightKg) || 0,
        biologicalSex: formData.biologicalSex,
        bodyType: formData.bodyType,
        activityLevel: formData.activityLevel,
        goals: formData.goals,
        healthConditions: formData.healthConditions,
      });
      setIsLoading(false);
      navigate('/dashboard');
    }, 1500);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.fullName && formData.email && formData.password && formData.password === formData.confirmPassword;
      case 2:
        return formData.age && formData.heightCm && formData.weightKg;
      case 3:
        return formData.biologicalSex && formData.bodyType && formData.activityLevel;
      case 4:
        return formData.goals.length > 0;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const stepLabels = ['ACCOUNT', 'BODY METRICS', 'PROFILE', 'GOALS', 'HEALTH'];

  // ─── Render Steps ────────────────────────────────────────────
  const renderStep = () => {
    switch (currentStep) {
      // ─── STEP 1: Account Creation ────────────────────────────
      case 1:
        return (
          <div className="space-y-4">
            <h1
              className="mb-2"
              style={{
                fontFamily: 'var(--font-bebas)',
                fontSize: '38px',
                color: '#FFFFFF',
                letterSpacing: '0.02em',
                lineHeight: '1',
              }}
            >
              Create your account
            </h1>
            <p
              className="mb-6"
              style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '14px',
                color: '#8A8A92',
              }}
            >
              Start your transformation journey today
            </p>

            {/* Full name */}
            <InputField
              id="signup-name"
              icon={<User size={18} color="#5A5A62" />}
              placeholder="Full name"
              value={formData.fullName}
              onChange={(v) => updateField('fullName', v)}
            />

            {/* Email */}
            <InputField
              id="signup-email"
              icon={<Mail size={18} color="#5A5A62" />}
              placeholder="Email address"
              type="email"
              value={formData.email}
              onChange={(v) => updateField('email', v)}
            />

            {/* Password */}
            <div
              className="p-4 rounded-2xl flex items-center gap-3 transition-all duration-300"
              style={{
                backgroundColor: '#18181D',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <Lock size={18} color="#5A5A62" />
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => updateField('password', e.target.value)}
                className="flex-1 bg-transparent outline-none"
                style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '15px',
                  color: '#FFFFFF',
                }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} color="#5A5A62" /> : <Eye size={18} color="#5A5A62" />}
              </button>
            </div>

            {/* Password strength */}
            {formData.password && (
              <div className="px-1">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="flex-1 h-1 rounded-full transition-all duration-300"
                      style={{
                        backgroundColor:
                          formData.password.length >= i * 3
                            ? i <= 1 ? '#F5603C' : i <= 2 ? '#F5C03C' : i <= 3 ? '#3CF5D8' : '#C8F53C'
                            : '#2A2A2E',
                      }}
                    />
                  ))}
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-jetbrains)',
                    fontSize: '10px',
                    color:
                      formData.password.length >= 12
                        ? '#C8F53C'
                        : formData.password.length >= 8
                        ? '#3CF5D8'
                        : formData.password.length >= 6
                        ? '#F5C03C'
                        : '#F5603C',
                  }}
                >
                  {formData.password.length >= 12
                    ? 'STRONG'
                    : formData.password.length >= 8
                    ? 'GOOD'
                    : formData.password.length >= 6
                    ? 'FAIR'
                    : 'WEAK'}
                </span>
              </div>
            )}

            {/* Confirm password */}
            <InputField
              id="signup-confirm-password"
              icon={<Lock size={18} color="#5A5A62" />}
              placeholder="Confirm password"
              type="password"
              value={formData.confirmPassword}
              onChange={(v) => updateField('confirmPassword', v)}
            />
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '12px', color: '#F5603C', paddingLeft: '4px' }}>
                Passwords don't match
              </p>
            )}
          </div>
        );

      // ─── STEP 2: Body Metrics ────────────────────────────────
      case 2:
        return (
          <div className="space-y-4">
            <h1
              className="mb-2"
              style={{
                fontFamily: 'var(--font-bebas)',
                fontSize: '38px',
                color: '#FFFFFF',
                letterSpacing: '0.02em',
                lineHeight: '1',
              }}
            >
              Your body data
            </h1>
            <p
              className="mb-6"
              style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '14px',
                color: '#8A8A92',
              }}
            >
              We'll use this to personalize your fitness plan
            </p>

            {/* Age */}
            <MetricInput
              id="signup-age"
              icon={<Calendar size={18} color="#5A5A62" />}
              label="Age"
              placeholder="28"
              unit="years"
              value={formData.age}
              onChange={(v) => updateField('age', v)}
              accentColor="#C8F53C"
            />

            {/* Height */}
            <MetricInput
              id="signup-height"
              icon={<Ruler size={18} color="#5A5A62" />}
              label="Height"
              placeholder="175"
              unit="cm"
              value={formData.heightCm}
              onChange={(v) => updateField('heightCm', v)}
              accentColor="#3CF5D8"
            />

            {/* Weight */}
            <MetricInput
              id="signup-weight"
              icon={<Weight size={18} color="#5A5A62" />}
              label="Weight"
              placeholder="72"
              unit="kg"
              value={formData.weightKg}
              onChange={(v) => updateField('weightKg', v)}
              accentColor="#A078F5"
            />

            {/* BMI Preview */}
            {formData.heightCm && formData.weightKg && (
              <div
                className="p-4 rounded-2xl mt-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(60,245,216,0.08) 0%, rgba(200,245,60,0.08) 100%)',
                  border: '1px solid rgba(60,245,216,0.15)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div
                      style={{
                        fontFamily: 'var(--font-jetbrains)',
                        fontSize: '10px',
                        color: '#5A5A62',
                        letterSpacing: '0.1em',
                      }}
                    >
                      ESTIMATED BMI
                    </div>
                    <div
                      className="mt-1"
                      style={{
                        fontFamily: 'var(--font-bebas)',
                        fontSize: '28px',
                        color: '#3CF5D8',
                        lineHeight: '1',
                      }}
                    >
                      {(
                        parseFloat(formData.weightKg) /
                        Math.pow(parseFloat(formData.heightCm) / 100, 2)
                      ).toFixed(1)}
                    </div>
                  </div>
                  <div
                    className="px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: 'rgba(60,245,216,0.15)',
                      fontFamily: 'var(--font-dm-sans)',
                      fontSize: '12px',
                      color: '#3CF5D8',
                      fontWeight: 600,
                    }}
                  >
                    {getBmiCategory(
                      parseFloat(formData.weightKg) /
                        Math.pow(parseFloat(formData.heightCm) / 100, 2)
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      // ─── STEP 3: Profile ─────────────────────────────────────
      case 3:
        return (
          <div className="space-y-6">
            <h1
              className="mb-2"
              style={{
                fontFamily: 'var(--font-bebas)',
                fontSize: '38px',
                color: '#FFFFFF',
                letterSpacing: '0.02em',
                lineHeight: '1',
              }}
            >
              About you
            </h1>
            <p
              className="mb-4"
              style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '14px',
                color: '#8A8A92',
              }}
            >
              Help us understand your fitness profile
            </p>

            {/* Biological sex */}
            <div>
              <label
                style={{
                  fontFamily: 'var(--font-jetbrains)',
                  fontSize: '10px',
                  color: '#8A8A92',
                  letterSpacing: '0.1em',
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                BIOLOGICAL SEX
              </label>
              <div className="flex gap-3">
                {['Male', 'Female', 'Other'].map((sex) => (
                  <button
                    key={sex}
                    onClick={() => updateField('biologicalSex', sex.toLowerCase())}
                    className="flex-1 py-3 rounded-xl transition-all duration-200"
                    style={{
                      backgroundColor:
                        formData.biologicalSex === sex.toLowerCase()
                          ? 'rgba(200,245,60,0.12)'
                          : '#18181D',
                      border:
                        formData.biologicalSex === sex.toLowerCase()
                          ? '1.5px solid #C8F53C'
                          : '1.5px solid transparent',
                      fontFamily: 'var(--font-dm-sans)',
                      fontSize: '14px',
                      color:
                        formData.biologicalSex === sex.toLowerCase()
                          ? '#C8F53C'
                          : '#8A8A92',
                      fontWeight: formData.biologicalSex === sex.toLowerCase() ? 600 : 400,
                    }}
                  >
                    {sex}
                  </button>
                ))}
              </div>
            </div>

            {/* Body type */}
            <div>
              <label
                style={{
                  fontFamily: 'var(--font-jetbrains)',
                  fontSize: '10px',
                  color: '#8A8A92',
                  letterSpacing: '0.1em',
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                BODY TYPE
              </label>
              <div className="space-y-2">
                {BODY_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => updateField('bodyType', type.id)}
                    className="w-full p-4 rounded-xl flex items-center gap-3 transition-all duration-200"
                    style={{
                      backgroundColor:
                        formData.bodyType === type.id ? 'rgba(200,245,60,0.08)' : '#18181D',
                      border:
                        formData.bodyType === type.id
                          ? '1.5px solid rgba(200,245,60,0.3)'
                          : '1.5px solid transparent',
                    }}
                  >
                    <span className="text-2xl">{type.icon}</span>
                    <div className="text-left">
                      <div
                        style={{
                          fontFamily: 'var(--font-dm-sans)',
                          fontSize: '15px',
                          fontWeight: 600,
                          color:
                            formData.bodyType === type.id ? '#FFFFFF' : '#CCCCCC',
                        }}
                      >
                        {type.label}
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-dm-sans)',
                          fontSize: '12px',
                          color: '#5A5A62',
                        }}
                      >
                        {type.description}
                      </div>
                    </div>
                    {formData.bodyType === type.id && (
                      <div className="ml-auto">
                        <Check size={18} color="#C8F53C" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Activity level */}
            <div>
              <label
                style={{
                  fontFamily: 'var(--font-jetbrains)',
                  fontSize: '10px',
                  color: '#8A8A92',
                  letterSpacing: '0.1em',
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                ACTIVITY LEVEL
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ACTIVITY_LEVELS.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => updateField('activityLevel', level.id)}
                    className="p-3 rounded-xl text-left transition-all duration-200"
                    style={{
                      backgroundColor:
                        formData.activityLevel === level.id
                          ? 'rgba(200,245,60,0.10)'
                          : '#18181D',
                      border:
                        formData.activityLevel === level.id
                          ? '1.5px solid rgba(200,245,60,0.3)'
                          : '1.5px solid transparent',
                    }}
                  >
                    <div className="text-xl mb-1">{level.icon}</div>
                    <div
                      style={{
                        fontFamily: 'var(--font-dm-sans)',
                        fontSize: '13px',
                        fontWeight: 600,
                        color:
                          formData.activityLevel === level.id ? '#FFFFFF' : '#CCCCCC',
                      }}
                    >
                      {level.label}
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-dm-sans)',
                        fontSize: '11px',
                        color: '#5A5A62',
                      }}
                    >
                      {level.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      // ─── STEP 4: Goals ───────────────────────────────────────
      case 4:
        return (
          <div className="space-y-4">
            <h1
              className="mb-2"
              style={{
                fontFamily: 'var(--font-bebas)',
                fontSize: '38px',
                color: '#FFFFFF',
                letterSpacing: '0.02em',
                lineHeight: '1',
              }}
            >
              Select your goals
            </h1>
            <p
              className="mb-6"
              style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '14px',
                color: '#8A8A92',
              }}
            >
              Choose one or more fitness goals
            </p>

            <div className="grid grid-cols-2 gap-3">
              {GOALS.map((goal) => {
                const isSelected = formData.goals.includes(goal.id);
                return (
                  <button
                    key={goal.id}
                    onClick={() => toggleGoal(goal.id)}
                    className="p-4 rounded-xl text-left transition-all duration-200 relative overflow-hidden"
                    style={{
                      backgroundColor: isSelected
                        ? `${goal.color}15`
                        : '#18181D',
                      border: isSelected
                        ? `2px solid ${goal.color}`
                        : '2px solid transparent',
                    }}
                  >
                    {isSelected && (
                      <div
                        className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: goal.color }}
                      >
                        <Check size={12} color="#0A0A0C" strokeWidth={3} />
                      </div>
                    )}
                    <div className="text-2xl mb-2">{goal.emoji}</div>
                    <div
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
                        marginTop: '2px',
                      }}
                    >
                      {goal.subtitle}
                    </div>
                  </button>
                );
              })}
            </div>

            {formData.goals.length > 0 && (
              <div
                className="mt-4 px-4 py-3 rounded-xl"
                style={{
                  backgroundColor: 'rgba(200,245,60,0.06)',
                  border: '1px solid rgba(200,245,60,0.1)',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '13px',
                    color: '#C8F53C',
                  }}
                >
                  {formData.goals.length} goal{formData.goals.length > 1 ? 's' : ''} selected
                </span>
              </div>
            )}
          </div>
        );

      // ─── STEP 5: Health Conditions ───────────────────────────
      case 5:
        return (
          <div className="space-y-4">
            <h1
              className="mb-2"
              style={{
                fontFamily: 'var(--font-bebas)',
                fontSize: '38px',
                color: '#FFFFFF',
                letterSpacing: '0.02em',
                lineHeight: '1',
              }}
            >
              Health conditions
            </h1>
            <p
              className="mb-6"
              style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize: '14px',
                color: '#8A8A92',
              }}
            >
              This helps us create a safe and effective plan for you
            </p>

            <div className="space-y-2">
              {[
                { key: 'diabetes' as const, label: 'Diabetes', icon: '🩸', description: 'Type 1 or Type 2 diabetes' },
                { key: 'hypertension' as const, label: 'Hypertension', icon: '💉', description: 'High blood pressure' },
                { key: 'heartCondition' as const, label: 'Heart Condition', icon: '❤️‍🩹', description: 'Any cardiac condition' },
                { key: 'asthma' as const, label: 'Asthma', icon: '🫁', description: 'Respiratory condition' },
              ].map((condition) => (
                <button
                  key={condition.key}
                  onClick={() => toggleHealthCondition(condition.key)}
                  className="w-full p-4 rounded-xl flex items-center gap-3 transition-all duration-200"
                  style={{
                    backgroundColor: formData.healthConditions[condition.key]
                      ? 'rgba(245,96,60,0.08)'
                      : '#18181D',
                    border: formData.healthConditions[condition.key]
                      ? '1.5px solid rgba(245,96,60,0.3)'
                      : '1.5px solid transparent',
                  }}
                >
                  <span className="text-2xl">{condition.icon}</span>
                  <div className="text-left flex-1">
                    <div
                      style={{
                        fontFamily: 'var(--font-dm-sans)',
                        fontSize: '15px',
                        fontWeight: 600,
                        color: '#FFFFFF',
                      }}
                    >
                      {condition.label}
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-dm-sans)',
                        fontSize: '12px',
                        color: '#5A5A62',
                      }}
                    >
                      {condition.description}
                    </div>
                  </div>
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center transition-all duration-200"
                    style={{
                      backgroundColor: formData.healthConditions[condition.key]
                        ? '#F5603C'
                        : '#2A2A2E',
                      border: formData.healthConditions[condition.key]
                        ? 'none'
                        : '1px solid #3A3A42',
                    }}
                  >
                    {formData.healthConditions[condition.key] && (
                      <Check size={14} color="#FFFFFF" strokeWidth={3} />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Other conditions */}
            <div className="mt-4">
              <label
                style={{
                  fontFamily: 'var(--font-jetbrains)',
                  fontSize: '10px',
                  color: '#8A8A92',
                  letterSpacing: '0.1em',
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                OTHER CONDITIONS (OPTIONAL)
              </label>
              <div
                className="p-4 rounded-2xl transition-all duration-300"
                style={{
                  backgroundColor: '#18181D',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <input
                  id="signup-other-conditions"
                  type="text"
                  placeholder="e.g., Thyroid disorder, Arthritis..."
                  value={formData.healthConditions.other}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      healthConditions: { ...prev.healthConditions, other: e.target.value },
                    }))
                  }
                  className="w-full bg-transparent outline-none"
                  style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: '15px',
                    color: '#FFFFFF',
                  }}
                />
              </div>
            </div>

            {/* Privacy note */}
            <div
              className="mt-4 p-3 rounded-xl flex items-start gap-3"
              style={{
                backgroundColor: 'rgba(160,120,245,0.06)',
                border: '1px solid rgba(160,120,245,0.12)',
              }}
            >
              <Heart size={16} color="#A078F5" className="mt-0.5 shrink-0" />
              <p
                style={{
                  fontFamily: 'var(--font-dm-sans)',
                  fontSize: '12px',
                  color: '#8A8A92',
                  lineHeight: '1.5',
                }}
              >
                Your health data is encrypted and never shared. We use it only to create a safe, personalized fitness plan.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#0A0A0C' }}>
      {/* Background effects */}
      <div
        className="absolute -top-32 -right-32 w-[500px] h-[500px] opacity-15 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${
            currentStep <= 2 ? '#C8F53C' : currentStep <= 3 ? '#3CF5D8' : currentStep <= 4 ? '#F5C03C' : '#A078F5'
          } 0%, transparent 60%)`,
          transition: 'background 0.5s ease',
        }}
      />
      <div
        className="absolute -bottom-40 -left-40 w-[300px] h-[300px] opacity-10 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, #A078F5 0%, transparent 60%)',
        }}
      />

      <div className="relative px-6 py-8 min-h-screen flex flex-col">
        {/* Top bar: back + progress */}
        <div className="flex items-center justify-between mb-6">
          <button
            id="signup-back"
            onClick={() => (currentStep > 1 ? setCurrentStep(currentStep - 1) : navigate('/login'))}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95"
            style={{
              backgroundColor: '#18181D',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <ArrowLeft size={18} color="#FFFFFF" />
          </button>

          {/* Step counter */}
          <div
            className="px-3 py-1 rounded-full"
            style={{
              backgroundColor: '#18181D',
              fontFamily: 'var(--font-jetbrains)',
              fontSize: '11px',
              color: '#8A8A92',
            }}
          >
            {currentStep}/{totalSteps}
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className="h-1 rounded-full flex-1 transition-all duration-500"
              style={{
                backgroundColor:
                  i < currentStep
                    ? '#C8F53C'
                    : i === currentStep
                    ? 'rgba(200,245,60,0.3)'
                    : '#2A2A2E',
              }}
            />
          ))}
        </div>

        {/* Step label */}
        <div
          className="mb-6"
          style={{
            fontFamily: 'var(--font-jetbrains)',
            fontSize: '10px',
            color: '#C8F53C',
            letterSpacing: '0.1em',
          }}
        >
          STEP {currentStep} OF {totalSteps} — {stepLabels[currentStep - 1]}
        </div>

        {/* Step content (scrollable) */}
        <div className="flex-1 overflow-y-auto pb-24">{renderStep()}</div>

        {/* Bottom CTA */}
        <div
          className="fixed bottom-0 left-0 right-0 px-6 py-5"
          style={{
            background: 'linear-gradient(transparent 0%, #0A0A0C 30%)',
          }}
        >
          <button
            id="signup-continue"
            onClick={() => {
              if (currentStep < totalSteps) {
                setCurrentStep(currentStep + 1);
              } else {
                handleSubmit();
              }
            }}
            disabled={!canProceed() || isLoading}
            className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98]"
            style={{
              background:
                canProceed() && !isLoading
                  ? 'linear-gradient(135deg, #C8F53C 0%, #B8E535 100%)'
                  : 'rgba(200,245,60,0.2)',
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '16px',
              fontWeight: 700,
              color: canProceed() ? '#0A0A0C' : '#5A5A62',
              boxShadow: canProceed() ? '0 4px 30px rgba(200,245,60,0.2)' : 'none',
            }}
          >
            {isLoading ? (
              <div
                className="w-5 h-5 border-2 rounded-full animate-spin"
                style={{ borderColor: '#0A0A0C transparent #0A0A0C transparent' }}
              />
            ) : currentStep < totalSteps ? (
              <>
                Continue
                <ArrowRight size={18} />
              </>
            ) : (
              <>
                Create Account
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Reusable Components ─────────────────────────────────────────

function InputField({
  id,
  icon,
  placeholder,
  value,
  onChange,
  type = 'text',
}: {
  id: string;
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div
      className="p-4 rounded-2xl flex items-center gap-3 transition-all duration-300"
      style={{
        backgroundColor: '#18181D',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {icon}
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent outline-none"
        style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '15px',
          color: '#FFFFFF',
        }}
      />
    </div>
  );
}

function MetricInput({
  id,
  icon,
  label,
  placeholder,
  unit,
  value,
  onChange,
  accentColor,
}: {
  id: string;
  icon: React.ReactNode;
  label: string;
  placeholder: string;
  unit: string;
  value: string;
  onChange: (value: string) => void;
  accentColor: string;
}) {
  return (
    <div
      className="p-4 rounded-2xl flex items-center gap-3 transition-all duration-300"
      style={{
        backgroundColor: '#18181D',
        border: value ? `1px solid ${accentColor}30` : '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {icon}
      <div className="flex-1">
        <div
          style={{
            fontFamily: 'var(--font-jetbrains)',
            fontSize: '10px',
            color: '#5A5A62',
            letterSpacing: '0.05em',
            marginBottom: '2px',
          }}
        >
          {label.toUpperCase()}
        </div>
        <input
          id={id}
          type="number"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent outline-none"
          style={{
            fontFamily: 'var(--font-dm-sans)',
            fontSize: '20px',
            color: '#FFFFFF',
            fontWeight: 300,
          }}
        />
      </div>
      <span
        style={{
          fontFamily: 'var(--font-jetbrains)',
          fontSize: '12px',
          color: '#5A5A62',
        }}
      >
        {unit}
      </span>
    </div>
  );
}

function getBmiCategory(bmi: number): string {
  if (isNaN(bmi) || bmi <= 0) return '';
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}
