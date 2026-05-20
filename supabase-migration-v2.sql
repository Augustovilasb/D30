-- Run this in Supabase SQL Editor

-- 1. Fix study_sessions privacy (was publicly readable)
DROP POLICY IF EXISTS "Sessões públicas legíveis" ON study_sessions;
CREATE POLICY "Usuário lê próprias sessões" ON study_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- 2. Add public aggregate columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profession text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_hours float DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_streak int DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS best_streak int DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_sessions int DEFAULT 0;
