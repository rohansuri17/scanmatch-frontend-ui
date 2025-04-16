
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";

type ImprovementSuggestionsCardProps = {
  suggestions: string[];
  redirectToAICoach: () => void;
  canAccess: boolean;
};

const ImprovementSuggestionsCard = ({ suggestions, redirectToAICoach, canAccess }: ImprovementSuggestionsCardProps) => {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Improvement Suggestions</CardTitle>
        <CardDescription>
          Actionable steps to enhance your resume for this job
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {suggestions && suggestions.length > 0 ? (
            suggestions.map((suggestion: string, index: number) => (
              <div key={index} className="p-3 border rounded bg-scanmatch-50">
                <p className="text-gray-700">{suggestion}</p>
                <div className="mt-2 flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs"
                    onClick={() => redirectToAICoach()}
                  >
                    {canAccess ? (
                      "Rewrite for me"
                    ) : (
                      <>
                        <Lock className="h-3 w-3 mr-1" /> Upgrade to Rewrite
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No specific improvement suggestions available.</p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <div className="text-center">
          <p className="text-sm font-medium mb-2">📤 Want a rewritten resume?</p>
          <Button variant="outline" size="sm" asChild>
            <Link to="/ai-coach">Try our rewrite assistant</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ImprovementSuggestionsCard;
