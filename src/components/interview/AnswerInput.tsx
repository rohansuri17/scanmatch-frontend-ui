
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send } from "lucide-react";

type Props = {
  answer: string;
  setAnswer: (value: string) => void;
  handleSubmitAnswer: () => void;
  isLoading: boolean;
};

const AnswerInput = ({ answer, setAnswer, handleSubmitAnswer, isLoading }: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Your Answer</CardTitle>
        <CardDescription>Type your response as if you were in an interview</CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Enter your answer here..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="min-h-[200px]"
        />
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSubmitAnswer} 
          disabled={isLoading || !answer.trim()} 
          className="w-full bg-scanmatch-600 hover:bg-scanmatch-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Getting Feedback...
            </>
          ) : (
            <>
              Submit Answer <Send className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AnswerInput;
