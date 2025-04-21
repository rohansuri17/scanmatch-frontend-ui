
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserResumeAnalyses, ResumeAnalysis } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Clock, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ResumeAnalysisHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const { data: analyses, isLoading, error } = useQuery({
    queryKey: ['resumeAnalyses', user?.id],
    queryFn: () => user ? getUserResumeAnalyses(user.id) : Promise.resolve([]),
    enabled: !!user,
  });
  
  const handleViewAnalysis = (analysisId: string) => {
    navigate(`/results?id=${analysisId}`);
  };
  
  // Helper function to ensure keywords_found is an array of the correct format..
  const parseKeywords = (keywords: unknown): Array<string | { word: string; category?: string }> => {
    if (Array.isArray(keywords)) {
      return keywords;
    }
    
    if (typeof keywords === 'string') {
      try {
        const parsed = JSON.parse(keywords);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    
    return [];
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Resume Analysis History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Resume Analysis History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Error loading analysis history. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }
  
  if (!analyses || analyses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Resume Analysis History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">You haven't saved any resume analyses yet.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Resume Analysis History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {analyses.map((analysis: ResumeAnalysis) => {
            const keywordsFound = parseKeywords(analysis.keywords_found);
            
            return (
              <div key={analysis.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">{analysis.job_title || 'Resume Analysis'}</h3>
                    <p className="text-sm text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {analysis.created_at && formatDistanceToNow(new Date(analysis.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-scanmatch-50 text-scanmatch-700">
                    {analysis.score}%
                  </Badge>
                </div>
                <div className="flex space-x-2 mb-3">
                  {keywordsFound.slice(0, 3).map((keyword, i) => (
                    <Badge key={i} variant="secondary" className="bg-green-100 text-green-800">
                      {typeof keyword === 'string' ? keyword : keyword.word}
                    </Badge>
                  ))}
                  {keywordsFound.length > 3 && (
                    <Badge variant="secondary" className="bg-green-50 text-green-800">
                      +{keywordsFound.length - 3} more
                    </Badge>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full" 
                  onClick={() => analysis.id && handleViewAnalysis(analysis.id)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ResumeAnalysisHistory;
