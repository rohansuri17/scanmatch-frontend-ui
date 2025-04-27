-- Drop existing table if it exists
DROP TABLE IF EXISTS ai_coach_sessions;

-- Create the ai_coach_sessions table
CREATE TABLE ai_coach_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    messages JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index
CREATE INDEX ai_coach_sessions_user_id_idx ON ai_coach_sessions(user_id);

-- Enable Row Level Security
ALTER TABLE ai_coach_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own sessions"
    ON ai_coach_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
    ON ai_coach_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
    ON ai_coach_sessions FOR UPDATE
    USING (auth.uid() = user_id);

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