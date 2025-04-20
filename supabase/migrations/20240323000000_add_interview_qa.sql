-- Create enum if it doesn't exist
DO $$
BEGIN
    CREATE TYPE question_type AS ENUM ('technical', 'behavioral', 'resume_based');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END;
$$;

-- Check the type of id column in resume_analyses and create appropriate column
DO $$
DECLARE
    id_type text;
BEGIN
    -- Get the data type of the id column
    SELECT data_type INTO id_type
    FROM information_schema.columns
    WHERE table_name = 'resume_analyses'
    AND column_name = 'id';

    -- Create the appropriate column type
    IF id_type = 'uuid' THEN
        ALTER TABLE interview_qa ADD COLUMN analysis_id UUID REFERENCES resume_analyses(id) ON DELETE CASCADE;
    ELSE
        ALTER TABLE interview_qa ADD COLUMN analysis_id TEXT REFERENCES resume_analyses(id) ON DELETE CASCADE;
    END IF;
EXCEPTION
    WHEN duplicate_column THEN NULL;
END;
$$;

-- Add context column if it doesn't exist
DO $$
BEGIN
    ALTER TABLE interview_qa ADD COLUMN context TEXT;
EXCEPTION
    WHEN duplicate_column THEN NULL;
END;
$$;

-- Add question_type column if it doesn't exist
DO $$
BEGIN
    ALTER TABLE interview_qa ADD COLUMN question_type question_type;
EXCEPTION
    WHEN duplicate_column THEN NULL;
END;
$$;

-- Add updated_at column if it doesn't exist
DO $$
BEGIN
    ALTER TABLE interview_qa ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
EXCEPTION
    WHEN duplicate_column THEN NULL;
END;
$$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_interview_qa_analysis_id ON interview_qa(analysis_id);
CREATE INDEX IF NOT EXISTS idx_interview_qa_question_type ON interview_qa(question_type);

-- Enable RLS
ALTER TABLE interview_qa ENABLE ROW LEVEL SECURITY;

-- Update policies
DROP POLICY IF EXISTS "Users can insert their own Q&A" ON interview_qa;
DROP POLICY IF EXISTS "Users can view their own Q&A" ON interview_qa;

CREATE POLICY "Users can insert their own Q&A" ON interview_qa
    FOR INSERT
    WITH CHECK (
        analysis_id IN (
            SELECT id FROM resume_analyses
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view their own Q&A" ON interview_qa
    FOR SELECT
    USING (
        analysis_id IN (
            SELECT id FROM resume_analyses
            WHERE user_id = auth.uid()
        )
    );

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_interview_qa_updated_at ON interview_qa;

CREATE TRIGGER update_interview_qa_updated_at
    BEFORE UPDATE ON interview_qa
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 