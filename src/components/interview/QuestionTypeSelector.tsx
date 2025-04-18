
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Code, User, FileText, Lightbulb } from "lucide-react";

type Props = {
  questionType: string;
  setQuestionType: (type: string) => void;
  generateQuestion: () => void;
};

const QuestionTypeSelector = ({ questionType, setQuestionType, generateQuestion }: Props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Question Type</CardTitle>
        <CardDescription>Choose the type of interview questions you want to practice</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={questionType} onValueChange={setQuestionType} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="technical">Technical</TabsTrigger>
            <TabsTrigger value="behavioral">Behavioral</TabsTrigger>
            <TabsTrigger value="resumeBased">Resume-Based</TabsTrigger>
          </TabsList>
          
          <TabsContent value="technical">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-scanmatch-100 p-2 rounded-full">
                  <Code className="h-5 w-5 text-scanmatch-700" />
                </div>
                <div>
                  <h3 className="font-medium">Technical Questions</h3>
                  <p className="text-gray-600 text-sm">Practice answering questions about programming, algorithms, and technical concepts relevant to your field.</p>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium mb-2">Example Questions:</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  {[
                    "Explain the concept of Object-Oriented Programming",
                    "What's the difference between HTTP and HTTPS?",
                    "Describe your experience with SQL databases"
                  ].map((q, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 mt-0.5 text-scanmatch-600 flex-shrink-0" />
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="behavioral">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-scanmatch-100 p-2 rounded-full">
                  <User className="h-5 w-5 text-scanmatch-700" />
                </div>
                <div>
                  <h3 className="font-medium">Behavioral Questions</h3>
                  <p className="text-gray-600 text-sm">Practice answering questions about your past experiences, teamwork, conflict resolution, and other soft skills.</p>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium mb-2">Example Questions:</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  {[
                    "Tell me about a time you faced a challenge at work",
                    "How do you handle tight deadlines?",
                    "Describe a situation where you showed leadership"
                  ].map((q, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 mt-0.5 text-scanmatch-600 flex-shrink-0" />
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="resumeBased">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-scanmatch-100 p-2 rounded-full">
                  <FileText className="h-5 w-5 text-scanmatch-700" />
                </div>
                <div>
                  <h3 className="font-medium">Resume-Based Questions</h3>
                  <p className="text-gray-600 text-sm">Practice answering questions specifically about your resume, past experience, and qualifications.</p>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium mb-2">Example Questions:</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  {[
                    "Tell me more about your role at [Company X]",
                    "I see you have experience with [Skill Y]. Can you elaborate?",
                    "Why did you transition from [Previous Role] to [Current Role]?"
                  ].map((q, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 mt-0.5 text-scanmatch-600 flex-shrink-0" />
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={generateQuestion} 
          className="bg-scanmatch-600 hover:bg-scanmatch-700 w-full md:w-auto"
        >
          Generate Question <Lightbulb className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QuestionTypeSelector;
