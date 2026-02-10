create table if not exists files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  object_key text not null unique,
  bucket text not null,
  filename text not null,
  content_type text,
  size_bytes bigint,
  created_at timestamptz not null default now()
);

create index if not exists idx_files_user_id on files (user_id);
create index if not exists idx_files_object_key on files (object_key);
