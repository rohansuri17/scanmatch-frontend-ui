import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';

interface ImprovementSuggestionsCardProps {
  suggestions: string[];
  redirectToAICoach: (suggestion?: string) => void;
}

const ImprovementSuggestionsCard: React.FC<ImprovementSuggestionsCardProps> = ({
  suggestions,
  redirectToAICoach,
}) => {
  const { user } = useAuth();
  const { canAccessAICoach } = useSubscription();

  const handleRewrite = (suggestion: string) => {
    if (canAccessAICoach) {
      redirectToAICoach(suggestion);
    } else {
      redirectToAICoach();
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Improvement Suggestions</CardTitle>
        <CardDescription>
          Get personalized help improving your resume
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {suggestions.map((suggestion, index) => (
            <li key={index} className="flex items-center justify-between">
              <span className="text-sm">{suggestion}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRewrite(suggestion)}
              >
                {canAccessAICoach ? 'Rewrite for me' : 'Upgrade to Pro'}
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default ImprovementSuggestionsCard;
