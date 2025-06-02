-- Add interview_questions column to resume_analyses table
ALTER TABLE resume_analyses
ADD COLUMN interview_questions JSONB;

-- Add comment to explain the column
COMMENT ON COLUMN resume_analyses.interview_questions IS 'Stores interview questions generated from resume analysis, including technical, behavioral, and resume-based questions with context'; 