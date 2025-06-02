-- Create learning path cache table
CREATE TABLE IF NOT EXISTS learning_path_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  learning_path JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  CONSTRAINT unique_cache_key UNIQUE (cache_key)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_learning_path_cache_user_id ON learning_path_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_path_cache_expires_at ON learning_path_cache(expires_at);

-- Add RLS policies
ALTER TABLE learning_path_cache ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own cached results
CREATE POLICY "Users can read their own cached results" ON learning_path_cache
  FOR SELECT USING (auth.uid() = user_id);

-- Only allow service role to insert/update/delete
CREATE POLICY "Only service role can modify cache" ON learning_path_cache
  FOR ALL USING (auth.role() = 'service_role');

-- Create function to clean up expired cache entries
CREATE OR REPLACE FUNCTION clean_expired_learning_path_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM learning_path_cache WHERE expires_at < NOW();
END;
$$;

-- Create a trigger to clean up expired entries on insert
CREATE OR REPLACE FUNCTION trigger_clean_expired_learning_path_cache()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM clean_expired_learning_path_cache();
  RETURN NEW;
END;
$$;

CREATE TRIGGER clean_expired_learning_path_cache_trigger
  AFTER INSERT ON learning_path_cache
  EXECUTE FUNCTION trigger_clean_expired_learning_path_cache(); 