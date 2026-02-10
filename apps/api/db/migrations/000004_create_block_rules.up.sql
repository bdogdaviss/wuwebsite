create table if not exists block_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  pattern text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_block_rules_user_id on block_rules (user_id);
