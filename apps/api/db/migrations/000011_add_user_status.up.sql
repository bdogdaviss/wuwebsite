ALTER TABLE profiles ADD COLUMN status TEXT NOT NULL DEFAULT 'online' CHECK (status IN ('online', 'idle', 'dnd', 'offline'));
ALTER TABLE profiles ADD COLUMN custom_status TEXT;
