create table if not exists extension_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  code text not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used_at timestamptz
);

create index if not exists idx_extension_codes_code on extension_codes (code);
create index if not exists idx_extension_codes_user_id on extension_codes (user_id);
