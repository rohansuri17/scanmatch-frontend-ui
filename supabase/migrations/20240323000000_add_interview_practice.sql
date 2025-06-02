-- Create enum for interview question types
CREATE TYPE interview_question_type AS ENUM ('technical', 'behavioral', 'resume_based');

-- Add interview_questions column to resume_analyses table
ALTER TABLE resume_analyses ADD COLUMN interview_questions JSONB;

-- Create table for interview practice sessions
CREATE TABLE interview_practice_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false
);

-- Create table for interview questions and answers
CREATE TABLE interview_qa (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES interview_practice_sessions(id) ON DELETE CASCADE,
    question_type interview_question_type NOT NULL,
    question TEXT NOT NULL,
    context TEXT,
    user_answer TEXT,
    ai_feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_interview_practice_sessions_user_id ON interview_practice_sessions(user_id);
CREATE INDEX idx_interview_qa_session_id ON interview_qa(session_id);

-- Add RLS policies
ALTER TABLE interview_practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_qa ENABLE ROW LEVEL SECURITY;

-- Policies for interview_practice_sessions
CREATE POLICY "Users can view their own practice sessions"
    ON interview_practice_sessions
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create practice sessions"
    ON interview_practice_sessions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own practice sessions"
    ON interview_practice_sessions
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own practice sessions"
    ON interview_practice_sessions
    FOR DELETE
    USING (auth.uid() = user_id);

-- Policies for interview_qa
CREATE POLICY "Users can view their own Q&A"
    ON interview_qa
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM interview_practice_sessions
            WHERE interview_practice_sessions.id = interview_qa.session_id
            AND interview_practice_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create Q&A"
    ON interview_qa
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM interview_practice_sessions
            WHERE interview_practice_sessions.id = interview_qa.session_id
            AND interview_practice_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own Q&A"
    ON interview_qa
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM interview_practice_sessions
            WHERE interview_practice_sessions.id = interview_qa.session_id
            AND interview_practice_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own Q&A"
    ON interview_qa
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM interview_practice_sessions
            WHERE interview_practice_sessions.id = interview_qa.session_id
            AND interview_practice_sessions.user_id = auth.uid()
        )
    ); 