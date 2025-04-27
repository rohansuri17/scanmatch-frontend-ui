
-- Add proper RLS policies for interview_qa table
CREATE POLICY "Users can only access their own interview responses"
  ON public.interview_qa
  FOR ALL
  USING (auth.uid() = user_id);

-- Add proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_interview_qa_user_id ON public.interview_qa(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_qa_analysis_id ON public.interview_qa(analysis_id);

-- Add proper timestamp handling for all tables
ALTER TABLE public.interview_qa
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET DEFAULT now();

-- Add missing RLS policies on resume analyses
CREATE POLICY "Users can only view their own resume analyses" 
  ON public.resume_analyses 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Add validation constraints
ALTER TABLE public.user_subscriptions
  ADD CONSTRAINT check_valid_tier CHECK (subscription_tier IN ('free', 'pro', 'premium'));
