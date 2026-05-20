-- ════════════════════════════════════════════
-- D30 — Supabase schema setup
-- Rodar no SQL Editor do Supabase
-- ════════════════════════════════════════════

-- 1. PROFILES
create table if not exists profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  username     text unique not null,
  full_name    text,
  bio          text,
  avatar_url   text,
  github_url   text,
  linkedin_url text,
  twitter_url  text,
  website_url  text,
  created_at   timestamptz default now()
);
alter table profiles enable row level security;
create policy "Perfil público legível" on profiles for select using (true);
create policy "Usuário edita próprio perfil" on profiles for update using (auth.uid() = id);
create policy "Usuário insere próprio perfil" on profiles for insert with check (auth.uid() = id);

-- 2. STUDY SESSIONS
create table if not exists study_sessions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete cascade not null,
  date            date not null,
  duration        integer not null, -- segundos
  period          text not null,    -- Manhã/Tarde/Noite/Madrugada
  subject         text not null,
  study_type      text not null,    -- Vídeo/Leitura/Prática/Exercícios
  energy          text not null,
  performance     text not null,
  mood            text not null,
  focus           text not null,
  subject_feeling text not null,
  goal_status     text not null,
  sleep           text not null,
  hydration       text not null,
  nutrition       text not null,
  activity        text not null,
  caffeine        text not null,
  created_at      timestamptz default now()
);
alter table study_sessions enable row level security;
create policy "Sessões públicas legíveis" on study_sessions for select using (true);
create policy "Usuário insere própria sessão" on study_sessions for insert with check (auth.uid() = user_id);
create policy "Usuário deleta própria sessão" on study_sessions for delete using (auth.uid() = user_id);

-- 3. BADGES (catálogo)
create table if not exists badges (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  name            text not null,
  description     text not null,
  icon            text not null,
  condition_type  text not null,
  condition_value integer not null
);
alter table badges enable row level security;
create policy "Badges públicas legíveis" on badges for select using (true);

-- 4. USER BADGES
create table if not exists user_badges (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  badge_id   uuid references badges(id) on delete cascade not null,
  earned_at  timestamptz default now(),
  unique (user_id, badge_id)
);
alter table user_badges enable row level security;
create policy "User badges públicas legíveis" on user_badges for select using (true);
create policy "Usuário insere própria badge" on user_badges for insert with check (auth.uid() = user_id);

-- 5. FORUM ACTIVITY
create table if not exists forum_activity (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  type       text not null, -- 'topic' | 'reply'
  title      text not null,
  created_at timestamptz default now()
);
alter table forum_activity enable row level security;
create policy "Forum activity pública legível" on forum_activity for select using (true);
create policy "Usuário insere própria activity" on forum_activity for insert with check (auth.uid() = user_id);

-- 6. PALESTRA ATTENDANCE
create table if not exists palestra_attendance (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete cascade not null,
  palestra_title text not null,
  attended_at    timestamptz default now(),
  unique (user_id, palestra_title)
);
alter table palestra_attendance enable row level security;
create policy "Attendance pública legível" on palestra_attendance for select using (true);
create policy "Usuário insere própria attendance" on palestra_attendance for insert with check (auth.uid() = user_id);

-- 7. BADGES — seed (catálogo inicial)
insert into badges (slug, name, description, icon, condition_type, condition_value) values
  ('primeira_chama',   'Primeira Chama',    '3 dias seguidos',           '🔥', 'streak',   3),
  ('em_chamas',        'Em Chamas',         '7 dias seguidos',           '⚡', 'streak',   7),
  ('imparavel',        'Imparável',         '15 dias seguidos',          '💪', 'streak',   15),
  ('lendario',         'Lendário',          '30 dias seguidos',          '🏆', 'streak',   30),
  ('primeiros_passos', 'Primeiros Passos',  '10h estudadas',             '⏱️', 'hours',    10),
  ('dedicado',         'Dedicado',          '50h estudadas',             '📚', 'hours',    50),
  ('dev_formacao',     'Dev em Formação',   '100h estudadas',            '🚀', 'hours',    100),
  ('dev_serio',        'Dev Sério',         '200h estudadas',            '💎', 'hours',    200),
  ('primeira_sessao',  'Primeira Sessão',   '1ª sessão registrada',      '🎯', 'sessions', 1),
  ('consistente',      'Consistente',       '10 sessões registradas',    '📅', 'sessions', 10),
  ('maratonista',      'Maratonista',       '50 sessões registradas',    '🔁', 'sessions', 50),
  ('quebrou_gelo',     'Quebrou o Gelo',    '1ª mensagem no fórum',      '💬', 'forum',    1),
  ('participativo',    'Participativo',     '10 respostas no fórum',     '🗣️', 'forum',    10),
  ('voz_comunidade',   'Voz da Comunidade', '5 tópicos iniciados',       '📢', 'topics',   5),
  ('presente',         'Presente',          '1ª palestra participada',   '🎤', 'palestras',1),
  ('palestrante_fiel', 'Palestrante Fiel',  '5 palestras participadas',  '🌟', 'palestras',5)
on conflict (slug) do nothing;
