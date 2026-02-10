create table if not exists focus_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  status text not null default 'active' check (status in ('active', 'completed', 'canceled')),
  created_at timestamptz not null default now()
);

create index if not exists idx_focus_sessions_user_id on focus_sessions (user_id);
create index if not exists idx_focus_sessions_status on focus_sessions (user_id, status);
