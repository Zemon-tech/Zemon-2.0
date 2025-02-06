-- Create schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS api;

-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS api.messages;
DROP TABLE IF EXISTS api.chat_members;
DROP TABLE IF EXISTS api.chats;
DROP TYPE IF EXISTS chat_type;

-- Create chat type enum
CREATE TYPE chat_type AS ENUM ('private', 'group');

-- Create chats table first
CREATE TABLE api.chats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type chat_type NOT NULL,
    name TEXT, -- nullable for private chats
    admin_id TEXT, -- MongoDB user ID
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_group_name CHECK (
        (type = 'group' AND name IS NOT NULL) OR 
        (type = 'private' AND name IS NULL)
    ),
    CONSTRAINT valid_group_admin CHECK (
        (type = 'group' AND admin_id IS NOT NULL) OR 
        (type = 'private' AND admin_id IS NULL)
    )
);

-- Create chat_members table second
CREATE TABLE api.chat_members (
    chat_id UUID REFERENCES api.chats(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL, -- MongoDB user ID
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (chat_id, user_id)
);

-- Create messages table last
CREATE TABLE api.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chat_id UUID REFERENCES api.chats(id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL, -- MongoDB user ID
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_by TEXT[] DEFAULT ARRAY[]::TEXT[] -- Array of MongoDB user IDs
);

-- Create indexes
CREATE INDEX idx_chat_members_user_id ON api.chat_members(user_id);
CREATE INDEX idx_messages_chat_id ON api.messages(chat_id);
CREATE INDEX idx_messages_created_at ON api.messages(created_at);

-- Enable RLS on all tables
ALTER TABLE api.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chats
CREATE POLICY "Users can view their chats"
    ON api.chats
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM api.chat_members
            WHERE chat_members.chat_id = chats.id
            AND chat_members.user_id = auth.uid()::text
        )
    );

CREATE POLICY "Group admins can update their groups"
    ON api.chats
    FOR UPDATE
    USING (
        type = 'group' 
        AND admin_id = auth.uid()::text
    );

CREATE POLICY "Users can create chats"
    ON api.chats
    FOR INSERT
    WITH CHECK (true);

-- RLS Policies for chat_members
CREATE POLICY "Users can view chat members"
    ON api.chat_members
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM api.chat_members as cm
            WHERE cm.chat_id = chat_members.chat_id
            AND cm.user_id = auth.uid()::text
        )
    );

CREATE POLICY "Group admins can manage members"
    ON api.chat_members
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM api.chats
            WHERE chats.id = chat_members.chat_id
            AND chats.admin_id = auth.uid()::text
        )
    );

-- RLS Policies for messages
CREATE POLICY "Chat members can view messages"
    ON api.messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM api.chat_members
            WHERE chat_members.chat_id = messages.chat_id
            AND chat_members.user_id = auth.uid()::text
        )
    );

CREATE POLICY "Chat members can send messages"
    ON api.messages
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM api.chat_members
            WHERE chat_members.chat_id = messages.chat_id
            AND chat_members.user_id = auth.uid()::text
        )
        AND sender_id = auth.uid()::text
    );

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE api.chats;
ALTER PUBLICATION supabase_realtime ADD TABLE api.chat_members;
ALTER PUBLICATION supabase_realtime ADD TABLE api.messages;

-- Functions for managing read status
CREATE OR REPLACE FUNCTION api.mark_messages_as_read(
    p_chat_id UUID,
    p_user_id TEXT
)
RETURNS VOID AS $$
BEGIN
    UPDATE api.messages
    SET read_by = array_append(read_by, p_user_id)
    WHERE chat_id = p_chat_id
    AND NOT (read_by @> ARRAY[p_user_id]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 