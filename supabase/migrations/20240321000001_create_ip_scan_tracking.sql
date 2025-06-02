-- Create ip_scan_tracking table
CREATE TABLE IF NOT EXISTS ip_scan_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_address TEXT NOT NULL,
    scan_count INTEGER DEFAULT 1,
    last_reset_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique index on ip_address
CREATE UNIQUE INDEX IF NOT EXISTS idx_ip_scan_tracking_ip_address ON ip_scan_tracking(ip_address);

-- Create index for faster lookups by last_reset_at
CREATE INDEX IF NOT EXISTS idx_ip_scan_tracking_last_reset_at ON ip_scan_tracking(last_reset_at);

-- Add RLS policies
ALTER TABLE ip_scan_tracking ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to read IP scan data
CREATE POLICY "Authenticated users can read IP scan data"
    ON ip_scan_tracking
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy to allow the service role to manage IP scan data
CREATE POLICY "Service role can manage IP scan data"
    ON ip_scan_tracking
    USING (true)
    WITH CHECK (true);

-- Function to check if an IP can perform a scan
CREATE OR REPLACE FUNCTION public.can_ip_scan(check_ip TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_count INTEGER;
    last_reset TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get current scan count and last reset time
    SELECT scan_count, last_reset_at
    INTO current_count, last_reset
    FROM ip_scan_tracking
    WHERE ip_address = check_ip;

    -- If no record exists, they can scan
    IF current_count IS NULL THEN
        RETURN TRUE;
    END IF;

    -- Check if we should reset the counter (new month)
    IF EXTRACT(MONTH FROM last_reset) != EXTRACT(MONTH FROM NOW()) OR
       EXTRACT(YEAR FROM last_reset) != EXTRACT(YEAR FROM NOW()) THEN
        -- Reset counter
        UPDATE ip_scan_tracking
        SET scan_count = 1,
            last_reset_at = NOW(),
            updated_at = NOW()
        WHERE ip_address = check_ip;
        RETURN TRUE;
    END IF;

    -- Check if under monthly limit
    RETURN current_count < 5;
END;
$$; 