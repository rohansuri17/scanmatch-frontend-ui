-- Add created_at column to resume_analyses table
ALTER TABLE resume_analyses 
ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Create an index on created_at for faster sorting
CREATE INDEX idx_resume_analyses_created_at ON resume_analyses(created_at); 