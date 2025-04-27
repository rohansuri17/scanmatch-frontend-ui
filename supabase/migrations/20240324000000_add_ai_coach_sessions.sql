-- Create enum for session types
DO $$ BEGIN
    CREATE TYPE session_type AS ENUM ('resume', 'interview', 'career');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create the ai_coach_sessions table
CREATE TABLE IF NOT EXISTS ai_coach_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_type session_type NOT NULL,
    content JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS ai_coach_sessions_user_id_idx ON ai_coach_sessions(user_id);
CREATE INDEX IF NOT EXISTS ai_coach_sessions_session_type_idx ON ai_coach_sessions(session_type);

-- Enable Row Level Security
ALTER TABLE ai_coach_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own sessions"
    ON ai_coach_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
    ON ai_coach_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ai_coach_sessions_updated_at
    BEFORE UPDATE ON ai_coach_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 