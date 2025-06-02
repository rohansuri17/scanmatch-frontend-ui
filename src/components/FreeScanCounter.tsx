import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface FreeScanCounterProps {
  ipAddress: string;
}

const FreeScanCounter: React.FC<FreeScanCounterProps> = ({ ipAddress }) => {
  const [scanCount, setScanCount] = useState<number>(0);
  const remainingScans = 5 - scanCount;

  useEffect(() => {
    const fetchScanCount = async () => {
      if (!ipAddress) return;

      try {
        const { data, error } = await supabase
          .from('ip_scan_tracking')
          .select('scan_count')
          .eq('ip_address', ipAddress)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching scan count:', error);
          return;
        }

        if (data) {
          setScanCount(data.scan_count);
        }
      } catch (error) {
        console.error('Error fetching scan count:', error);
      }
    };

    fetchScanCount();
  }, [ipAddress]);

  if (!ipAddress || remainingScans >= 5) return null;

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium mb-1">Free Scans Remaining</h3>
            <p className="text-sm text-gray-600">
              You have {remainingScans} out of 5 free scans remaining this month
            </p>
          </div>
          <Button className="bg-scanmatch-600 hover:bg-scanmatch-700" asChild>
            <Link to="/signup">
              <Sparkles className="h-4 w-4 mr-2" />
              Get More Scans
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FreeScanCounter; 