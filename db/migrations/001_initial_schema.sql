-- ═══════════════════════════════════════════════════════════════════
--  FITNESS TRACKING APP — Complete Database Schema
--  Database: PostgreSQL 15+ on Neon
--  Migration: 001_initial_schema
--  Created: 2026-03-24
-- ═══════════════════════════════════════════════════════════════════

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════════════════════════════
--  SECTION 1: CORE — Users & Authentication
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT UNIQUE NOT NULL,
  firebase_uid    TEXT UNIQUE NOT NULL,
  phone           TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  last_login      TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_firebase_uid ON users (firebase_uid);

-- ───────────────────────────────────────────────────────────────────

CREATE TABLE user_profiles (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID REFERENCES users(id) ON DELETE CASCADE,
  full_name             TEXT,
  age                   INT,
  biological_sex        TEXT,                -- male | female | other
  height_cm             FLOAT,
  weight_kg             FLOAT,
  body_type             TEXT,                -- ectomorph | mesomorph | endomorph
  goals                 TEXT[],              -- ['lose_weight','build_muscle',...]
  activity_level        TEXT,                -- sedentary | light | moderate | intense
  daily_calorie_goal    FLOAT,
  daily_water_goal_ml   FLOAT DEFAULT 2500,
  daily_sleep_goal_hrs  FLOAT DEFAULT 8,
  avatar_url            TEXT,
  updated_at            TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles (user_id);

-- ───────────────────────────────────────────────────────────────────

CREATE TABLE user_health_conditions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID REFERENCES users(id) ON DELETE CASCADE,
  has_diabetes        BOOLEAN DEFAULT FALSE,
  has_hypertension    BOOLEAN DEFAULT FALSE,
  has_heart_condition BOOLEAN DEFAULT FALSE,
  has_asthma          BOOLEAN DEFAULT FALSE,
  other_conditions    TEXT[],
  notes               TEXT,
  recorded_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_health_conditions_user_id ON user_health_conditions (user_id);


-- ═══════════════════════════════════════════════════════════════════
--  SECTION 2: ACTIVITY TRACKING
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE activity_sessions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES users(id) ON DELETE CASCADE,
  activity_type    TEXT NOT NULL,            -- running | walking | cycling | workout | yoga | swimming | ...
  started_at       TIMESTAMPTZ NOT NULL,
  ended_at         TIMESTAMPTZ,
  duration_seconds INT,
  distance_meters  FLOAT,
  steps            INT,
  calories_burned  FLOAT,
  avg_heart_rate   FLOAT,
  source           TEXT DEFAULT 'manual',    -- gps | accelerometer | manual | healthkit
  mediapipe_used   BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_activity_sessions_user_id ON activity_sessions (user_id);
CREATE INDEX idx_activity_sessions_started_at ON activity_sessions (user_id, started_at DESC);

-- ───────────────────────────────────────────────────────────────────

CREATE TABLE gps_route_points (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id   UUID REFERENCES activity_sessions(id) ON DELETE CASCADE,
  latitude     DOUBLE PRECISION NOT NULL,
  longitude    DOUBLE PRECISION NOT NULL,
  altitude_m   FLOAT,
  speed_ms     FLOAT,
  recorded_at  TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_gps_route_points_session ON gps_route_points (session_id, recorded_at);

-- ───────────────────────────────────────────────────────────────────
-- Time-series metrics table (5-minute buckets for high-frequency data)
-- NOTE: If using TimescaleDB, uncomment the hypertable creation below

CREATE TABLE activity_metrics (
  id               UUID DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES users(id) ON DELETE CASCADE,
  bucket           TIMESTAMPTZ NOT NULL,     -- 5-min buckets
  steps            INT DEFAULT 0,
  distance_m       FLOAT DEFAULT 0,
  calories         FLOAT DEFAULT 0,
  active_seconds   INT DEFAULT 0,
  screen_seconds   INT DEFAULT 0,
  physical_seconds INT DEFAULT 0,
  PRIMARY KEY (user_id, bucket)
);

-- Uncomment if using TimescaleDB extension:
-- SELECT create_hypertable('activity_metrics', 'bucket');

CREATE INDEX idx_activity_metrics_bucket ON activity_metrics (bucket DESC);

-- ───────────────────────────────────────────────────────────────────

CREATE TABLE workout_sets (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id       UUID REFERENCES activity_sessions(id) ON DELETE CASCADE,
  exercise_name    TEXT NOT NULL,
  set_number       INT,
  reps             INT,
  weight_kg        FLOAT,
  form_feedback    TEXT,                     -- "straighten back" | "perfect form"
  confidence_score FLOAT                     -- MediaPipe confidence 0–1
);

CREATE INDEX idx_workout_sets_session ON workout_sets (session_id);


-- ═══════════════════════════════════════════════════════════════════
--  SECTION 3: HEALTH METRICS
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE health_snapshots (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     UUID REFERENCES users(id) ON DELETE CASCADE,
  snapshot_date               DATE NOT NULL,
  bmi                         FLOAT,
  estimated_hr_bpm            FLOAT,
  hr_source                   TEXT,          -- camera_ppg | manual | healthkit
  sleep_hours                 FLOAT,
  sleep_quality               TEXT,          -- poor | fair | good | excellent
  water_intake_ml             FLOAT DEFAULT 0,
  screen_minutes_total        INT DEFAULT 0,
  screen_minutes_productive   INT DEFAULT 0,
  screen_minutes_distraction  INT DEFAULT 0,
  anomaly_flagged             BOOLEAN DEFAULT FALSE,
  anomaly_reason              TEXT,
  UNIQUE(user_id, snapshot_date)
);

CREATE INDEX idx_health_snapshots_user_date ON health_snapshots (user_id, snapshot_date DESC);

-- ───────────────────────────────────────────────────────────────────

CREATE TABLE sleep_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  sleep_start     TIMESTAMPTZ NOT NULL,
  sleep_end       TIMESTAMPTZ,
  deep_sleep_hrs  FLOAT,
  light_sleep_hrs FLOAT,
  rem_sleep_hrs   FLOAT,
  awakenings      INT DEFAULT 0,
  source          TEXT DEFAULT 'manual'      -- manual | device | healthkit
);

CREATE INDEX idx_sleep_logs_user ON sleep_logs (user_id, sleep_start DESC);

-- ───────────────────────────────────────────────────────────────────

CREATE TABLE water_intake_logs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES users(id) ON DELETE CASCADE,
  amount_ml      FLOAT NOT NULL,
  container_type TEXT,                       -- glass | bottle | cup
  logged_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_water_intake_user ON water_intake_logs (user_id, logged_at DESC);

-- ───────────────────────────────────────────────────────────────────

CREATE TABLE screen_time_logs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES users(id) ON DELETE CASCADE,
  app_name         TEXT NOT NULL,
  category         TEXT,                     -- productive | distraction | social | health
  duration_seconds INT NOT NULL,
  log_date         DATE NOT NULL
);

CREATE INDEX idx_screen_time_user ON screen_time_logs (user_id, log_date DESC);


-- ═══════════════════════════════════════════════════════════════════
--  SECTION 4: HABITS & SOCIAL ACTIVITIES
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE habits (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  habit_name      TEXT NOT NULL,
  category        TEXT,                      -- health | fitness | mindfulness | productivity | social
  target_frequency TEXT DEFAULT 'daily',     -- daily | weekly | custom
  target_count    INT DEFAULT 1,
  reminder_time   TIME,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_habits_user ON habits (user_id);

-- ───────────────────────────────────────────────────────────────────

CREATE TABLE habit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id    UUID REFERENCES habits(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  log_date    DATE NOT NULL,
  completed   BOOLEAN DEFAULT FALSE,
  value       FLOAT,                         -- optional quantitative value
  notes       TEXT,
  logged_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(habit_id, log_date)
);

CREATE INDEX idx_habit_logs_user ON habit_logs (user_id, log_date DESC);

-- ───────────────────────────────────────────────────────────────────

CREATE TABLE social_activities (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  activity_type   TEXT NOT NULL,             -- call | in_person | group_activity | volunteer
  description     TEXT,
  duration_minutes INT,
  people_count    INT DEFAULT 1,
  mood_after      TEXT,                      -- happy | neutral | stressed | energized
  logged_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_social_activities_user ON social_activities (user_id, logged_at DESC);


-- ═══════════════════════════════════════════════════════════════════
--  SECTION 5: SCHEDULE & NOTIFICATIONS
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE schedules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  schedule_date   DATE NOT NULL,
  generated_by    TEXT DEFAULT 'ai',         -- ai | manual
  status          TEXT DEFAULT 'active',     -- active | completed | skipped
  user_note       TEXT,
  generated_at    TIMESTAMPTZ DEFAULT NOW(),
  last_modified   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, schedule_date)
);

CREATE INDEX idx_schedules_user_date ON schedules (user_id, schedule_date DESC);

-- ───────────────────────────────────────────────────────────────────

CREATE TABLE schedule_items (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id      UUID REFERENCES schedules(id) ON DELETE CASCADE,
  category         TEXT NOT NULL,            -- workout | meal | hydration | sleep | mental | meditation | yoga
  start_time       TIME NOT NULL,
  duration_minutes INT NOT NULL,
  title            TEXT NOT NULL,
  description      TEXT,
  youtube_video_id TEXT,
  youtube_title    TEXT,
  youtube_thumbnail_url TEXT,
  is_completed     BOOLEAN DEFAULT FALSE,
  completed_at     TIMESTAMPTZ,
  order_index      INT NOT NULL
);

CREATE INDEX idx_schedule_items_schedule ON schedule_items (schedule_id);

-- ───────────────────────────────────────────────────────────────────

CREATE TABLE notifications (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES users(id) ON DELETE CASCADE,
  schedule_item_id UUID REFERENCES schedule_items(id) ON DELETE SET NULL,
  fcm_token        TEXT NOT NULL,
  title            TEXT NOT NULL,
  body             TEXT,
  scheduled_for    TIMESTAMPTZ NOT NULL,
  sent_at          TIMESTAMPTZ,
  status           TEXT DEFAULT 'pending',   -- pending | sent | failed | cancelled
  error_message    TEXT
);

CREATE INDEX idx_notifications_scheduled ON notifications (scheduled_for, status);
CREATE INDEX idx_notifications_user ON notifications (user_id);


-- ═══════════════════════════════════════════════════════════════════
--  SECTION 6: COMMUNITY & LEADERBOARD
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE leaderboard_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  entry_date      DATE NOT NULL,
  fitness_score   FLOAT NOT NULL,
  global_rank     INT,
  city_rank       INT,
  age_group_rank  INT,
  streak_days     INT DEFAULT 0,
  rank_tier       TEXT,                      -- bronze | silver | gold | platinum | diamond
  UNIQUE(user_id, entry_date)
);

CREATE INDEX idx_leaderboard_date_score ON leaderboard_entries (entry_date, fitness_score DESC);
CREATE INDEX idx_leaderboard_user ON leaderboard_entries (user_id);

-- ───────────────────────────────────────────────────────────────────

CREATE TABLE friendships (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id  UUID REFERENCES users(id) ON DELETE CASCADE,
  addressee_id  UUID REFERENCES users(id) ON DELETE CASCADE,
  status        TEXT DEFAULT 'pending',      -- pending | accepted | blocked
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  accepted_at   TIMESTAMPTZ,
  UNIQUE(requester_id, addressee_id)
);

CREATE INDEX idx_friendships_requester ON friendships (requester_id, status);
CREATE INDEX idx_friendships_addressee ON friendships (addressee_id, status);

-- ───────────────────────────────────────────────────────────────────

CREATE TABLE challenges (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id   UUID REFERENCES users(id),
  title        TEXT NOT NULL,
  description  TEXT,
  metric       TEXT NOT NULL,                -- steps | calories | workout_minutes | score | distance
  target_value FLOAT NOT NULL,
  starts_at    TIMESTAMPTZ NOT NULL,
  ends_at      TIMESTAMPTZ NOT NULL,
  status       TEXT DEFAULT 'upcoming',      -- upcoming | active | completed | cancelled
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_challenges_status ON challenges (status, starts_at);

-- ───────────────────────────────────────────────────────────────────

CREATE TABLE challenge_participants (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id  UUID REFERENCES challenges(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  current_value FLOAT DEFAULT 0,
  completed     BOOLEAN DEFAULT FALSE,
  joined_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(challenge_id, user_id)
);

CREATE INDEX idx_challenge_participants ON challenge_participants (challenge_id, current_value DESC);


-- ═══════════════════════════════════════════════════════════════════
--  SECTION 7: FITNESS SCORE
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE fitness_scores (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  score_date      DATE NOT NULL,
  total_score     FLOAT NOT NULL CHECK (total_score BETWEEN 0 AND 100),
  activity_score  FLOAT,                     -- weight: 35%
  sleep_score     FLOAT,                     -- weight: 20%
  nutrition_score FLOAT,                     -- weight: 15%
  hydration_score FLOAT,                     -- weight: 10%
  mental_score    FLOAT,                     -- weight: 10%
  screen_score    FLOAT,                     -- weight: 10%
  score_trend     TEXT,                      -- up | down | stable
  ai_summary      TEXT,
  UNIQUE(user_id, score_date)
);

CREATE INDEX idx_fitness_scores_user_date ON fitness_scores (user_id, score_date DESC);


-- ═══════════════════════════════════════════════════════════════════
--  SECTION 8: AI GUIDANCE & CONVERSATIONS
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE ai_conversations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES users(id) ON DELETE CASCADE,
  context_type     TEXT,                     -- general | schedule | health | workout | nutrition
  started_at       TIMESTAMPTZ DEFAULT NOW(),
  last_message_at  TIMESTAMPTZ DEFAULT NOW(),
  is_active        BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_ai_conversations_user ON ai_conversations (user_id, last_message_at DESC);

-- ───────────────────────────────────────────────────────────────────

CREATE TABLE ai_messages (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id  UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role             TEXT NOT NULL,            -- user | assistant
  content          TEXT NOT NULL,
  suggested_actions TEXT[],
  metadata         JSONB,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_messages_conversation ON ai_messages (conversation_id, created_at);

-- ───────────────────────────────────────────────────────────────────

CREATE TABLE ai_insights (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  insight_type  TEXT,                        -- anomaly | achievement | suggestion | warning
  title         TEXT NOT NULL,
  body          TEXT,
  priority      TEXT DEFAULT 'normal',       -- low | normal | high | critical
  dismissed     BOOLEAN DEFAULT FALSE,
  generated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_insights_user ON ai_insights (user_id, generated_at DESC);


-- ═══════════════════════════════════════════════════════════════════
--  SECTION 9: DISEASE DETECTION & ANOMALIES
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE disease_risk_assessments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES users(id) ON DELETE CASCADE,
  assessment_date   DATE NOT NULL,
  risk_category     TEXT NOT NULL,           -- cardiovascular | diabetes | obesity | metabolic_syndrome
  risk_level        TEXT NOT NULL,           -- low | moderate | high | critical
  risk_score        FLOAT,                  -- 0–100
  contributing_factors JSONB,               -- {"bmi": 32, "sedentary_hours": 8, ...}
  recommendations   TEXT[],
  model_version     TEXT,                   -- ML model version used
  reviewed_at       TIMESTAMPTZ,
  UNIQUE(user_id, assessment_date, risk_category)
);

CREATE INDEX idx_disease_risk_user ON disease_risk_assessments (user_id, assessment_date DESC);

-- ───────────────────────────────────────────────────────────────────

CREATE TABLE health_anomalies (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  detected_at     TIMESTAMPTZ DEFAULT NOW(),
  anomaly_type    TEXT NOT NULL,             -- heart_rate_spike | sleep_disruption | activity_drop | weight_change
  metric_name     TEXT NOT NULL,
  expected_value  FLOAT,
  actual_value    FLOAT,
  severity        TEXT DEFAULT 'low',        -- low | medium | high
  description     TEXT,
  acknowledged    BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_health_anomalies_user ON health_anomalies (user_id, detected_at DESC);


-- ═══════════════════════════════════════════════════════════════════
--  SECTION 10: MEDIAPIPE WORKOUT MONITORING
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE mediapipe_sessions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id        UUID REFERENCES activity_sessions(id) ON DELETE CASCADE,
  user_id           UUID REFERENCES users(id) ON DELETE CASCADE,
  started_at        TIMESTAMPTZ NOT NULL,
  ended_at          TIMESTAMPTZ,
  exercise_type     TEXT NOT NULL,           -- squat | pushup | plank | deadlift | bicep_curl | ...
  total_reps        INT DEFAULT 0,
  avg_confidence    FLOAT,                   -- 0–1
  form_accuracy_pct FLOAT,                   -- 0–100
  corrections_given TEXT[],                  -- ["keep back straight", "go deeper", ...]
  video_url         TEXT                     -- optional recorded session
);

CREATE INDEX idx_mediapipe_sessions_user ON mediapipe_sessions (user_id, started_at DESC);

-- ───────────────────────────────────────────────────────────────────

CREATE TABLE pose_frame_data (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mediapipe_session_id UUID REFERENCES mediapipe_sessions(id) ON DELETE CASCADE,
  frame_number      INT NOT NULL,
  timestamp_ms      FLOAT NOT NULL,
  landmarks         JSONB NOT NULL,          -- 33 pose landmarks from MediaPipe
  joint_angles      JSONB,                   -- calculated angles { knee: 90, hip: 45, ... }
  form_correct      BOOLEAN,
  correction_note   TEXT
);

CREATE INDEX idx_pose_frame_session ON pose_frame_data (mediapipe_session_id, frame_number);


-- ═══════════════════════════════════════════════════════════════════
--  SECTION 11: YOUTUBE VIDEO CACHE
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE youtube_video_cache (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id        TEXT UNIQUE NOT NULL,
  title           TEXT NOT NULL,
  channel_name    TEXT,
  thumbnail_url   TEXT,
  duration_seconds INT,
  category        TEXT,                      -- workout | yoga | meditation | nutrition | mental_health
  subcategory     TEXT,                      -- HIIT | stretching | vinyasa | guided | ...
  tags            TEXT[],
  view_count      BIGINT,
  fetched_at      TIMESTAMPTZ DEFAULT NOW(),
  expires_at      TIMESTAMPTZ               -- cache expiry
);

CREATE INDEX idx_youtube_cache_category ON youtube_video_cache (category, subcategory);
CREATE INDEX idx_youtube_cache_video_id ON youtube_video_cache (video_id);


-- ═══════════════════════════════════════════════════════════════════
--  SECTION 12: MEAL / NUTRITION TRACKING
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE meals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  meal_type       TEXT NOT NULL,             -- breakfast | lunch | dinner | snack
  meal_date       DATE NOT NULL,
  meal_time       TIME,
  total_calories  FLOAT DEFAULT 0,
  total_protein_g FLOAT DEFAULT 0,
  total_carbs_g   FLOAT DEFAULT 0,
  total_fat_g     FLOAT DEFAULT 0,
  notes           TEXT,
  logged_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_meals_user_date ON meals (user_id, meal_date DESC);

-- ───────────────────────────────────────────────────────────────────

CREATE TABLE meal_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id         UUID REFERENCES meals(id) ON DELETE CASCADE,
  food_name       TEXT NOT NULL,
  quantity        FLOAT DEFAULT 1,
  unit            TEXT DEFAULT 'serving',    -- serving | gram | ml | oz | cup
  calories        FLOAT DEFAULT 0,
  protein_g       FLOAT DEFAULT 0,
  carbs_g         FLOAT DEFAULT 0,
  fat_g           FLOAT DEFAULT 0,
  fiber_g         FLOAT DEFAULT 0
);

CREATE INDEX idx_meal_items_meal ON meal_items (meal_id);


-- ═══════════════════════════════════════════════════════════════════
--  SECTION 13: MENTAL HEALTH TRACKING
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE mood_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  mood_score      INT CHECK (mood_score BETWEEN 1 AND 10),
  mood_label      TEXT,                      -- happy | calm | anxious | sad | stressed | energized | tired
  energy_level    INT CHECK (energy_level BETWEEN 1 AND 10),
  stress_level    INT CHECK (stress_level BETWEEN 1 AND 10),
  notes           TEXT,
  triggers        TEXT[],                    -- ['work', 'exercise', 'sleep_deprivation', ...]
  logged_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mood_logs_user ON mood_logs (user_id, logged_at DESC);

-- ───────────────────────────────────────────────────────────────────

CREATE TABLE meditation_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  duration_minutes INT NOT NULL,
  meditation_type TEXT,                      -- guided | unguided | breathing | body_scan | visualization
  youtube_video_id TEXT,
  calm_score_before INT,
  calm_score_after INT,
  notes           TEXT,
  logged_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_meditation_user ON meditation_sessions (user_id, logged_at DESC);


-- ═══════════════════════════════════════════════════════════════════
--  SECTION 14: DEVICE & FCM TOKEN MANAGEMENT
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE user_devices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  device_name     TEXT,
  device_type     TEXT,                      -- android | ios | web
  fcm_token       TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  last_seen_at    TIMESTAMPTZ DEFAULT NOW(),
  registered_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_devices_user ON user_devices (user_id);


-- ═══════════════════════════════════════════════════════════════════
--  TRIGGERS & FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════

-- Auto-update `updated_at` timestamp
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to user_profiles
CREATE TRIGGER set_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

-- Apply to habits
CREATE TRIGGER set_habits_updated_at
  BEFORE UPDATE ON habits
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

-- Apply to schedules
CREATE TRIGGER set_schedules_last_modified
  BEFORE UPDATE ON schedules
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

-- Auto-update last_message_at on ai_conversations
CREATE OR REPLACE FUNCTION trigger_update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ai_conversations
  SET last_message_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ai_conversation_timestamp
  AFTER INSERT ON ai_messages
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_conversation_timestamp();

-- Auto-compute BMI when health snapshot is inserted
CREATE OR REPLACE FUNCTION trigger_compute_bmi()
RETURNS TRIGGER AS $$
DECLARE
  user_height FLOAT;
  user_weight FLOAT;
BEGIN
  SELECT height_cm, weight_kg INTO user_height, user_weight
  FROM user_profiles
  WHERE user_id = NEW.user_id;

  IF user_height IS NOT NULL AND user_height > 0 AND user_weight IS NOT NULL THEN
    NEW.bmi = user_weight / ((user_height / 100.0) * (user_height / 100.0));
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER compute_bmi_on_snapshot
  BEFORE INSERT ON health_snapshots
  FOR EACH ROW
  WHEN (NEW.bmi IS NULL)
  EXECUTE FUNCTION trigger_compute_bmi();


-- ═══════════════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY POLICIES
-- ═══════════════════════════════════════════════════════════════════

-- Helper function to get current user
CREATE OR REPLACE FUNCTION current_user_id() RETURNS UUID AS $$
  SELECT NULLIF(current_setting('app.user_id', true), '')::uuid;
$$ LANGUAGE sql STABLE;

-- Enable RLS on all user-owned tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_health_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_intake_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE screen_time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitness_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE meditation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE disease_risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE mediapipe_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (users can only access their own data)
CREATE POLICY user_profiles_policy ON user_profiles FOR ALL USING (user_id = current_user_id());
CREATE POLICY user_health_conditions_policy ON user_health_conditions FOR ALL USING (user_id = current_user_id());
CREATE POLICY activity_sessions_policy ON activity_sessions FOR ALL USING (user_id = current_user_id());
CREATE POLICY activity_metrics_policy ON activity_metrics FOR ALL USING (user_id = current_user_id());
CREATE POLICY health_snapshots_policy ON health_snapshots FOR ALL USING (user_id = current_user_id());
CREATE POLICY sleep_logs_policy ON sleep_logs FOR ALL USING (user_id = current_user_id());
CREATE POLICY water_intake_logs_policy ON water_intake_logs FOR ALL USING (user_id = current_user_id());
CREATE POLICY screen_time_logs_policy ON screen_time_logs FOR ALL USING (user_id = current_user_id());
CREATE POLICY habits_policy ON habits FOR ALL USING (user_id = current_user_id());
CREATE POLICY habit_logs_policy ON habit_logs FOR ALL USING (user_id = current_user_id());
CREATE POLICY social_activities_policy ON social_activities FOR ALL USING (user_id = current_user_id());
CREATE POLICY schedules_policy ON schedules FOR ALL USING (user_id = current_user_id());
CREATE POLICY notifications_policy ON notifications FOR ALL USING (user_id = current_user_id());
CREATE POLICY fitness_scores_policy ON fitness_scores FOR ALL USING (user_id = current_user_id());
CREATE POLICY ai_conversations_policy ON ai_conversations FOR ALL USING (user_id = current_user_id());
CREATE POLICY ai_insights_policy ON ai_insights FOR ALL USING (user_id = current_user_id());
CREATE POLICY meals_policy ON meals FOR ALL USING (user_id = current_user_id());
CREATE POLICY mood_logs_policy ON mood_logs FOR ALL USING (user_id = current_user_id());
CREATE POLICY meditation_sessions_policy ON meditation_sessions FOR ALL USING (user_id = current_user_id());
CREATE POLICY user_devices_policy ON user_devices FOR ALL USING (user_id = current_user_id());
CREATE POLICY disease_risk_policy ON disease_risk_assessments FOR ALL USING (user_id = current_user_id());
CREATE POLICY health_anomalies_policy ON health_anomalies FOR ALL USING (user_id = current_user_id());
CREATE POLICY mediapipe_sessions_policy ON mediapipe_sessions FOR ALL USING (user_id = current_user_id());


-- ═══════════════════════════════════════════════════════════════════
--  DATA SEED: Default challenge categories
-- ═══════════════════════════════════════════════════════════════════

-- This migration is complete. Run against your Neon PostgreSQL database.
-- Connection: psql $DATABASE_URL < 001_initial_schema.sql
