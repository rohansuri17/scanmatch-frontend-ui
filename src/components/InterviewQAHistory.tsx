
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare, Smile, Star, ArrowRight } from 'lucide-react';

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
          <p className="text-xs mt-2">Answer the question to receive AI feedback and track your progress!</p>
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="space-y-4 animate-fade-in">
      {attempts.map((attempt, i) => (
        <Card key={attempt.id} className="shadow-sm border rounded-md hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center gap-3 pb-2">
            <Avatar className="h-8 w-8 bg-scanmatch-100">
              <AvatarFallback className="bg-scanmatch-100 text-scanmatch-700">A{i+1}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-base font-medium">
              Attempt {i + 1} <span className="text-xs font-normal text-muted-foreground">
                · {new Date(attempt.created_at).toLocaleDateString()}
              </span>
            </CardTitle>
            {onRetry && (
              <Button size="sm" variant="ghost" className="ml-auto group hover:bg-scanmatch-50" onClick={() => onRetry(attempt)}>
                Try Again <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex flex-col items-center mr-1">
                <Avatar className="h-10 w-10 ring-2 ring-scanmatch-50">
                  <AvatarFallback className="bg-scanmatch-100 text-scanmatch-700">U</AvatarFallback>
                  <AvatarImage src="/images/user-avatar.png" />
                </Avatar>
                <span className="text-xs text-muted-foreground mt-1">You</span>
              </div>
              <div className="flex-1">
                <div className="mb-2 bg-gray-50 rounded-lg p-3 shadow-sm">
                  <span className="font-medium text-scanmatch-700">Your Answer:</span>
                  <p className="whitespace-pre-line text-sm text-gray-800 mt-1">{attempt.user_answer}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-4 mt-3">
              <div className="flex flex-col items-center mr-1">
                <Avatar className="h-10 w-10 ring-2 ring-scanmatch-50">
                  <AvatarFallback className="bg-scanmatch-600 text-white">AI</AvatarFallback>
                  <AvatarImage src="/images/ai-coach-avatar.png" />
                </Avatar>
                <span className="text-xs text-muted-foreground mt-1">AI Coach</span>
              </div>
              <div className="flex-1">
                <div className="bg-scanmatch-50 rounded-lg p-3 shadow-sm">
                  <div className="flex items-center mb-1">
                    <span className="font-medium text-scanmatch-700">Feedback:</span>
                    <div className="flex ml-auto">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    </div>
                  </div>
                  <p className="whitespace-pre-line text-sm text-gray-800 mt-1">{attempt.ai_feedback}</p>
                  
                  <div className="mt-3 pt-2 border-t border-scanmatch-100 flex items-center">
                    <Smile className="h-4 w-4 text-scanmatch-600 mr-2" />
                    <span className="text-xs text-scanmatch-600 italic">Keep practicing! Each attempt makes you better prepared.</span>
                  </div>
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
