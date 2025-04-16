-- Create resume_scan_data table
CREATE TABLE IF NOT EXISTS resume_scan_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    resume_text TEXT NOT NULL,
    job_description TEXT NOT NULL,
    job_title TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups by user_id
CREATE INDEX IF NOT EXISTS idx_resume_scan_data_user_id ON resume_scan_data(user_id);

-- Create index for faster lookups by created_at
CREATE INDEX IF NOT EXISTS idx_resume_scan_data_created_at ON resume_scan_data(created_at);

-- Add RLS policies
ALTER TABLE resume_scan_data ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read their own scan data
CREATE POLICY "Users can read their own scan data"
    ON resume_scan_data
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy to allow users to insert their own scan data
CREATE POLICY "Users can insert their own scan data"
    ON resume_scan_data
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own scan data
CREATE POLICY "Users can update their own scan data"
    ON resume_scan_data
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to delete their own scan data
CREATE POLICY "Users can delete their own scan data"
    ON resume_scan_data
    FOR DELETE
    USING (auth.uid() = user_id); 