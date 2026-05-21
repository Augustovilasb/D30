-- D30 Migration v3: forum, talks, roadmap, speaker suggestions, admin role
-- Run this in the Supabase SQL Editor

-- ── Profiles: admin flag ────────────────────────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

UPDATE profiles SET is_admin = true
WHERE id IN (SELECT id FROM auth.users WHERE email = 'augustovilasb@hotmail.com');

-- ── Forum ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS forum_topics (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title       TEXT NOT NULL,
  author_id   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  tag         TEXT NOT NULL DEFAULT 'duvida',
  hot         BOOLEAN DEFAULT false,
  closed      BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS forum_messages (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  topic_id    UUID REFERENCES forum_topics(id) ON DELETE CASCADE,
  author_id   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  text        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS forum_votes (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message_id  UUID REFERENCES forum_messages(id) ON DELETE CASCADE,
  vote_type   TEXT CHECK (vote_type IN ('up','down')) NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, message_id)
);

-- ── Talks ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS talks (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  when_text   TEXT,
  guest_name  TEXT NOT NULL,
  guest_role  TEXT,
  title       TEXT NOT NULL,
  blurb       TEXT,
  tag         TEXT,
  is_past     BOOLEAN DEFAULT false,
  duration    TEXT,
  video_url   TEXT,
  rsvp_count  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS talk_rsvp (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  talk_id    UUID REFERENCES talks(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (talk_id, user_id)
);

CREATE TABLE IF NOT EXISTS speaker_suggestions (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name         TEXT NOT NULL,
  why          TEXT,
  user_id      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  suggested_by TEXT NOT NULL,
  status       TEXT DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── Roadmap progress ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS roadmap_progress (
  user_id   UUID REFERENCES profiles(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  done_at   TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, course_id)
);

-- ── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE forum_topics        ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_messages      ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_votes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE talks               ENABLE ROW LEVEL SECURITY;
ALTER TABLE talk_rsvp           ENABLE ROW LEVEL SECURITY;
ALTER TABLE speaker_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_progress    ENABLE ROW LEVEL SECURITY;

-- forum_topics
CREATE POLICY "ft_read"   ON forum_topics FOR SELECT USING (true);
CREATE POLICY "ft_insert" ON forum_topics FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "ft_update" ON forum_topics FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "ft_delete" ON forum_topics FOR DELETE USING (
  auth.uid() = author_id OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- forum_messages
CREATE POLICY "fm_read"   ON forum_messages FOR SELECT USING (true);
CREATE POLICY "fm_insert" ON forum_messages FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "fm_delete" ON forum_messages FOR DELETE USING (
  auth.uid() = author_id OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- forum_votes
CREATE POLICY "fv_read"   ON forum_votes FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "fv_insert" ON forum_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "fv_delete" ON forum_votes FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "fv_update" ON forum_votes FOR UPDATE USING (auth.uid() = user_id);

-- talks
CREATE POLICY "tk_read"   ON talks FOR SELECT USING (true);
CREATE POLICY "tk_insert" ON talks FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "tk_update" ON talks FOR UPDATE USING (true);

-- talk_rsvp
CREATE POLICY "tr_read"   ON talk_rsvp FOR SELECT USING (true);
CREATE POLICY "tr_insert" ON talk_rsvp FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tr_delete" ON talk_rsvp FOR DELETE USING (auth.uid() = user_id);

-- speaker_suggestions
CREATE POLICY "ss_read"   ON speaker_suggestions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "ss_insert" ON speaker_suggestions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "ss_update" ON speaker_suggestions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "ss_delete" ON speaker_suggestions FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- roadmap_progress
CREATE POLICY "rp_read"   ON roadmap_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "rp_insert" ON roadmap_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "rp_delete" ON roadmap_progress FOR DELETE USING (auth.uid() = user_id);

-- Seed removido — fórum e palestras começam do zero.
-- Para criar um usuário de teste antes do lançamento, use o script supabase-seed-testuser.sql
