
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { KeywordItem } from '@/lib/supabaseClient';

interface KeywordAnalysisCardProps {
  keywordsFound: KeywordItem[];
  keywordsMissing: KeywordItem[];
  score: number;
}

const KeywordAnalysisCard: React.FC<KeywordAnalysisCardProps> = ({ 
  keywordsFound, 
  keywordsMissing,
  score
}) => {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Keywords Analysis</CardTitle>
        <CardDescription>Important terms found in your resume</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Found Keywords</span>
              <span className="text-xs text-gray-500">{Array.isArray(keywordsFound) ? keywordsFound.length : 0} found</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {keywordsFound && keywordsFound.length > 0 ? (
                keywordsFound.slice(0, 8).map((keyword, index) => (
                  <span 
                    key={index} 
                    className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded"
                  >
                    {typeof keyword === 'string' ? keyword : keyword.word}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-500">No keywords found</span>
              )}
              {keywordsFound && keywordsFound.length > 8 && (
                <span className="text-xs text-scanmatch-600">+{keywordsFound.length - 8} more</span>
              )}
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Missing Keywords</span>
              <span className="text-xs text-gray-500">{Array.isArray(keywordsMissing) ? keywordsMissing.length : 0} missing</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {keywordsMissing && keywordsMissing.length > 0 ? (
                keywordsMissing.slice(0, 8).map((keyword, index) => (
                  <span 
                    key={index} 
                    className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded"
                  >
                    {typeof keyword === 'string' ? keyword : keyword.word}
                    <button className="ml-2 text-xs underline hover:text-red-600" title="Add to resume">+Add</button>
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-500">No missing keywords</span>
              )}
              {keywordsMissing && keywordsMissing.length > 8 && (
                <span className="text-xs text-scanmatch-600">+{keywordsMissing.length - 8} more</span>
              )}
            </div>
          </div>
          
          {score < 80 && keywordsMissing && keywordsMissing.length > 0 && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded p-3">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
                  Adding these {keywordsMissing.length} keywords could significantly improve your match!
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default KeywordAnalysisCard;
