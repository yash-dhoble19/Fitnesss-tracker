-- ═══════════════════════════════════════════════════════════════════
--  FITNESS TRACKING APP — Row Level Security Policies
--  Ensures users can only access their own data
--  Updated: 2026-03-24
-- ═══════════════════════════════════════════════════════════════════

-- Session context function
CREATE OR REPLACE FUNCTION current_user_id() RETURNS UUID AS $$
  SELECT NULLIF(current_setting('app.user_id', true), '')::uuid;
$$ LANGUAGE sql STABLE;

-- Helper to set user context (called by backend on each request)
CREATE OR REPLACE FUNCTION set_app_context(p_user_id UUID) RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.user_id', p_user_id::text, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ═══════════════════════════════════════════════════════
--  Enable RLS on all user-owned tables
-- ═══════════════════════════════════════════════════════

ALTER TABLE user_profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_health_conditions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_sessions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_metrics           ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_snapshots           ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_logs                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_intake_logs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE screen_time_logs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_activities          ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_items             ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications              ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries        ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitness_scores             ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations           ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages                ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights                ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_items                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_logs                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE meditation_sessions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE disease_risk_assessments   ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_anomalies           ENABLE ROW LEVEL SECURITY;
ALTER TABLE mediapipe_sessions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE pose_frame_data            ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_devices               ENABLE ROW LEVEL SECURITY;


-- ═══════════════════════════════════════════════════════
--  Owner-based policies (user_id = current_user_id())
-- ═══════════════════════════════════════════════════════

-- Core
CREATE POLICY user_profiles_owner        ON user_profiles              FOR ALL USING (user_id = current_user_id()) WITH CHECK (user_id = current_user_id());
CREATE POLICY health_conditions_owner    ON user_health_conditions     FOR ALL USING (user_id = current_user_id()) WITH CHECK (user_id = current_user_id());

-- Activity Tracking
CREATE POLICY activity_sessions_owner    ON activity_sessions          FOR ALL USING (user_id = current_user_id()) WITH CHECK (user_id = current_user_id());
CREATE POLICY activity_metrics_owner     ON activity_metrics           FOR ALL USING (user_id = current_user_id()) WITH CHECK (user_id = current_user_id());

-- Health Metrics
CREATE POLICY health_snapshots_owner     ON health_snapshots           FOR ALL USING (user_id = current_user_id()) WITH CHECK (user_id = current_user_id());
CREATE POLICY sleep_logs_owner           ON sleep_logs                 FOR ALL USING (user_id = current_user_id()) WITH CHECK (user_id = current_user_id());
CREATE POLICY water_intake_owner         ON water_intake_logs          FOR ALL USING (user_id = current_user_id()) WITH CHECK (user_id = current_user_id());
CREATE POLICY screen_time_owner          ON screen_time_logs           FOR ALL USING (user_id = current_user_id()) WITH CHECK (user_id = current_user_id());

-- Habits & Social
CREATE POLICY habits_owner               ON habits                     FOR ALL USING (user_id = current_user_id()) WITH CHECK (user_id = current_user_id());
CREATE POLICY habit_logs_owner           ON habit_logs                 FOR ALL USING (user_id = current_user_id()) WITH CHECK (user_id = current_user_id());
CREATE POLICY social_activities_owner    ON social_activities          FOR ALL USING (user_id = current_user_id()) WITH CHECK (user_id = current_user_id());

-- Schedules & Notifications
CREATE POLICY schedules_owner            ON schedules                  FOR ALL USING (user_id = current_user_id()) WITH CHECK (user_id = current_user_id());
CREATE POLICY notifications_owner        ON notifications              FOR ALL USING (user_id = current_user_id()) WITH CHECK (user_id = current_user_id());

-- Community
CREATE POLICY leaderboard_owner          ON leaderboard_entries        FOR ALL USING (user_id = current_user_id()) WITH CHECK (user_id = current_user_id());

-- Fitness Score
CREATE POLICY fitness_scores_owner       ON fitness_scores             FOR ALL USING (user_id = current_user_id()) WITH CHECK (user_id = current_user_id());

-- AI
CREATE POLICY ai_conversations_owner     ON ai_conversations          FOR ALL USING (user_id = current_user_id()) WITH CHECK (user_id = current_user_id());
CREATE POLICY ai_insights_owner          ON ai_insights               FOR ALL USING (user_id = current_user_id()) WITH CHECK (user_id = current_user_id());

-- Nutrition
CREATE POLICY meals_owner                ON meals                      FOR ALL USING (user_id = current_user_id()) WITH CHECK (user_id = current_user_id());

-- Mental Health
CREATE POLICY mood_logs_owner            ON mood_logs                  FOR ALL USING (user_id = current_user_id()) WITH CHECK (user_id = current_user_id());
CREATE POLICY meditation_owner           ON meditation_sessions        FOR ALL USING (user_id = current_user_id()) WITH CHECK (user_id = current_user_id());

-- Disease Detection
CREATE POLICY disease_risk_owner         ON disease_risk_assessments   FOR ALL USING (user_id = current_user_id()) WITH CHECK (user_id = current_user_id());
CREATE POLICY health_anomalies_owner     ON health_anomalies           FOR ALL USING (user_id = current_user_id()) WITH CHECK (user_id = current_user_id());

-- MediaPipe
CREATE POLICY mediapipe_sessions_owner   ON mediapipe_sessions         FOR ALL USING (user_id = current_user_id()) WITH CHECK (user_id = current_user_id());

-- Devices
CREATE POLICY user_devices_owner         ON user_devices               FOR ALL USING (user_id = current_user_id()) WITH CHECK (user_id = current_user_id());


-- ═══════════════════════════════════════════════════════
--  Cascaded policies (via parent foreign key)
-- ═══════════════════════════════════════════════════════

-- GPS points: accessible if user owns the parent activity_session
CREATE POLICY gps_route_points_owner ON gps_route_points FOR ALL
  USING (session_id IN (SELECT id FROM activity_sessions WHERE user_id = current_user_id()))
  WITH CHECK (session_id IN (SELECT id FROM activity_sessions WHERE user_id = current_user_id()));

-- Workout sets: accessible if user owns the parent activity_session
CREATE POLICY workout_sets_owner ON workout_sets FOR ALL
  USING (session_id IN (SELECT id FROM activity_sessions WHERE user_id = current_user_id()))
  WITH CHECK (session_id IN (SELECT id FROM activity_sessions WHERE user_id = current_user_id()));

-- Schedule items: accessible if user owns the parent schedule
CREATE POLICY schedule_items_owner ON schedule_items FOR ALL
  USING (schedule_id IN (SELECT id FROM schedules WHERE user_id = current_user_id()))
  WITH CHECK (schedule_id IN (SELECT id FROM schedules WHERE user_id = current_user_id()));

-- AI messages: accessible if user owns the parent conversation
CREATE POLICY ai_messages_owner ON ai_messages FOR ALL
  USING (conversation_id IN (SELECT id FROM ai_conversations WHERE user_id = current_user_id()))
  WITH CHECK (conversation_id IN (SELECT id FROM ai_conversations WHERE user_id = current_user_id()));

-- Meal items: accessible if user owns the parent meal
CREATE POLICY meal_items_owner ON meal_items FOR ALL
  USING (meal_id IN (SELECT id FROM meals WHERE user_id = current_user_id()))
  WITH CHECK (meal_id IN (SELECT id FROM meals WHERE user_id = current_user_id()));

-- Pose frame data: accessible if user owns the parent mediapipe session
CREATE POLICY pose_frame_data_owner ON pose_frame_data FOR ALL
  USING (mediapipe_session_id IN (SELECT id FROM mediapipe_sessions WHERE user_id = current_user_id()))
  WITH CHECK (mediapipe_session_id IN (SELECT id FROM mediapipe_sessions WHERE user_id = current_user_id()));


-- ═══════════════════════════════════════════════════════
--  Community policies (shared access)
-- ═══════════════════════════════════════════════════════

-- Friendships: accessible by either party
CREATE POLICY friendships_owner ON friendships FOR ALL
  USING (requester_id = current_user_id() OR addressee_id = current_user_id())
  WITH CHECK (requester_id = current_user_id());

-- Challenges: readable by all participants, writable by creator
CREATE POLICY challenges_read ON challenges FOR SELECT USING (
  id IN (SELECT challenge_id FROM challenge_participants WHERE user_id = current_user_id())
  OR creator_id = current_user_id()
);
CREATE POLICY challenges_write ON challenges FOR ALL
  USING (creator_id = current_user_id())
  WITH CHECK (creator_id = current_user_id());

-- Challenge participants: users can see all participants in their challenges
CREATE POLICY challenge_participants_read ON challenge_participants FOR SELECT USING (
  challenge_id IN (SELECT challenge_id FROM challenge_participants WHERE user_id = current_user_id())
);
CREATE POLICY challenge_participants_write ON challenge_participants FOR ALL
  USING (user_id = current_user_id())
  WITH CHECK (user_id = current_user_id());

-- Leaderboard: public read for community ranking
CREATE POLICY leaderboard_read ON leaderboard_entries FOR SELECT USING (true);

-- YouTube cache: public read (shared resource)
CREATE POLICY youtube_cache_read ON youtube_video_cache FOR SELECT USING (true);
