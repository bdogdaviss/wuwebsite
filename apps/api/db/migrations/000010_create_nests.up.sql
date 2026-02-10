CREATE TABLE nests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    icon_url TEXT,
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE nest_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nest_id UUID NOT NULL REFERENCES nests(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('text', 'voice')) DEFAULT 'text',
    category TEXT NOT NULL DEFAULT 'General',
    position INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE nest_members (
    nest_id UUID NOT NULL REFERENCES nests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')) DEFAULT 'member',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY(nest_id, user_id)
);

CREATE TABLE channel_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL REFERENCES nest_channels(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_nest_channels_nest ON nest_channels(nest_id);
CREATE INDEX idx_nest_members_user ON nest_members(user_id);
CREATE INDEX idx_channel_messages ON channel_messages(channel_id, created_at DESC);
CREATE INDEX idx_channel_messages_sender ON channel_messages(sender_id);
