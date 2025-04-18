
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, GraduationCap, Mic } from "lucide-react";

type Props = {
  currentStep: 'resume' | 'learn' | 'interview';
  score?: number;
};

const NextStepCard = ({ currentStep, score }: Props) => {
  const getNextStepContent = () => {
    switch (currentStep) {
      case 'resume':
        return {
          title: "Ready to Level Up? 🚀",
          description: "Your resume scan is complete. Let's work on building the skills employers want!",
          buttonText: "Start Learning",
          buttonLink: "/learn",
          icon: GraduationCap
        };
      case 'learn':
        return {
          title: "Time to Practice! 🎯",
          description: "You've got the skills, now let's nail that interview!",
          buttonText: "Practice Interview",
          buttonLink: "/interview",
          icon: Mic
        };
      default:
        return {
          title: "Keep Going! 💪",
          description: "Practice makes perfect. Try another interview session.",
          buttonText: "New Interview",
          buttonLink: "/interview",
          icon: Mic
        };
    }
  };

  const content = getNextStepContent();
  const Icon = content.icon;

  return (
    <Card className="bg-scanmatch-50 border-scanmatch-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-scanmatch-800">
          <Icon className="h-5 w-5" />
          {content.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4">{content.description}</p>
        {score && (
          <div className="text-sm text-gray-500 mb-4">
            Current Match Score: <span className="font-semibold">{score}%</span>
          </div>
        )}
        <Button className="w-full bg-scanmatch-600 hover:bg-scanmatch-700" asChild>
          <Link to={content.buttonLink}>
            {content.buttonText} <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default NextStepCard;
