
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy } from "lucide-react";

type Props = {
  questionType: string;
  currentQuestion: string;
  startNewQuestion: () => void;
  onCopy: (text: string) => void;
};

const PracticeQuestion = ({ questionType, currentQuestion, startNewQuestion, onCopy }: Props) => {
  return (
    <Card>
      <CardHeader>
        <Badge className="w-fit mb-2">
          {questionType === 'technical' ? 'Technical' : 
           questionType === 'behavioral' ? 'Behavioral' : 'Resume-Based'}
        </Badge>
        <CardTitle className="text-xl">Question</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg">{currentQuestion}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" onClick={startNewQuestion}>
          New Question
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onCopy(currentQuestion)}
        >
          <Copy className="h-4 w-4 mr-1" /> Copy
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PracticeQuestion;
