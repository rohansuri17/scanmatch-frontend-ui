
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare } from 'lucide-react';

interface Attempt {
  id: string;
  user_answer: string;
  ai_feedback: string;
  created_at: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

interface Props {
  attempts: Attempt[];
  onRetry?: (attempt: Attempt) => void;
}

const InterviewQAHistory: React.FC<Props> = ({ attempts, onRetry }) => {
  if (!attempts || attempts.length === 0) {
    return (
      <Card className="bg-muted/30 my-2">
        <CardContent className="py-8 flex flex-col items-center text-muted-foreground">
          <MessageSquare className="mb-2" />
          <span>No previous attempts found for this question yet.</span>
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="space-y-4 animate-fade-in">
      {attempts.map((attempt, i) => (
        <Card key={attempt.id} className="shadow-none border rounded-md">
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <Avatar>
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <CardTitle className="text-base font-medium">
              Attempt {i + 1} <span className="text-xs font-normal text-muted-foreground">
                · {new Date(attempt.created_at).toLocaleDateString()}
              </span>
            </CardTitle>
            {onRetry && (
              <Button size="sm" variant="ghost" className="ml-auto" onClick={() => onRetry(attempt)}>
                Try Again
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex flex-col items-center mr-1">
                <Avatar>
                  <AvatarFallback>U</AvatarFallback>
                  <AvatarImage />
                </Avatar>
                <span className="text-xs text-muted-foreground mt-1">You</span>
              </div>
              <div className="flex-1">
                <div className="mb-2 bg-card rounded p-2">
                  <span className="font-medium text-muted-foreground">Your Answer:</span>
                  <p className="whitespace-pre-line text-sm text-gray-900 pl-2">{attempt.user_answer}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-4 mt-3">
              <div className="flex flex-col items-center mr-1">
                <Avatar>
                  <AvatarFallback>AI</AvatarFallback>
                  <AvatarImage />
                </Avatar>
                <span className="text-xs text-muted-foreground mt-1">AI Feedback</span>
              </div>
              <div className="flex-1">
                <div className="bg-scanmatch-50 rounded p-2">
                  <span className="font-medium text-scanmatch-700">Feedback:</span>
                  <p className="whitespace-pre-line text-sm text-gray-900 pl-2">{attempt.ai_feedback}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default InterviewQAHistory;
