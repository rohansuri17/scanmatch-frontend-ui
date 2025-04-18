
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, ThumbsUp, ThumbsDown, Copy } from "lucide-react";

type Props = {
  feedback: string;
  onCopy: (text: string) => void;
};

const FeedbackDisplay = ({ feedback, onCopy }: Props) => {
  return (
    <Card className={feedback ? "bg-scanmatch-50 border-scanmatch-100" : ""}>
      <CardHeader>
        <CardTitle className="text-xl">AI Feedback</CardTitle>
        <CardDescription>
          {feedback ? "Here's what our AI coach thinks of your answer" : "Submit your answer to get feedback"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {feedback ? (
          <div className="whitespace-pre-line text-gray-800">
            {feedback}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Brain className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p>AI feedback will appear here after you submit your answer</p>
          </div>
        )}
      </CardContent>
      {feedback && (
        <CardFooter className="flex justify-between">
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <ThumbsUp className="h-4 w-4 mr-1" /> Helpful
            </Button>
            <Button variant="outline" size="sm">
              <ThumbsDown className="h-4 w-4 mr-1" /> Not Helpful
            </Button>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onCopy(feedback)}
          >
            <Copy className="h-4 w-4 mr-1" /> Copy
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default FeedbackDisplay;
