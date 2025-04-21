-- Create enum if it doesn't exist
DO $$
BEGIN
    CREATE TYPE question_type AS ENUM ('technical', 'behavioral', 'resume_based');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END;
$$;

-- Drop existing table if it exists
DROP TABLE IF EXISTS interview_qa;

-- Create interview_qa table
CREATE TABLE interview_qa (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    analysis_id TEXT NOT NULL,
    question TEXT NOT NULL,
    context TEXT,
    user_answer TEXT NOT NULL,
    ai_feedback TEXT NOT NULL,
    question_type question_type NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for analysis_id
CREATE INDEX IF NOT EXISTS idx_interview_qa_analysis_id ON interview_qa(analysis_id);

-- Enable RLS
ALTER TABLE interview_qa ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own interview QAs" ON interview_qa;
DROP POLICY IF EXISTS "Users can view their own interview QAs" ON interview_qa;

-- Create policies
CREATE POLICY "Users can insert their own interview QAs" ON interview_qa
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM resume_analyses
            WHERE id = interview_qa.analysis_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view their own interview QAs" ON interview_qa
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM resume_analyses
            WHERE id = interview_qa.analysis_id
            AND user_id = auth.uid()
        )
    );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_interview_qa_updated_at
    BEFORE UPDATE ON interview_qa
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 