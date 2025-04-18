
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Brain, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

type Props = {
  score: number;
};

const MatchScoreCard = ({ score }: Props) => {
  // Determine color and message based on score
  let scoreColor = "text-red-500";
  let progressColor = "bg-red-500";
  let bgColor = "bg-red-50";
  let message = "Let's work on improving this!";
  let icon = Brain;
  
  if (score >= 70) {
    scoreColor = "text-green-500";
    progressColor = "bg-green-500";
    bgColor = "bg-green-50";
    message = "Great job! You're almost there!";
    icon = Sparkles;
  } else if (score >= 50) {
    scoreColor = "text-amber-500";
    progressColor = "bg-amber-500";
    bgColor = "bg-amber-50";
    message = "Good start! Let's keep improving!";
    icon = GraduationCap;
  }

  const Icon = icon;

  return (
    <Card className="shadow-md h-full relative overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-scanmatch-600" />
          Your Coach's Verdict
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-40 h-40 mb-4">
            {/* Outer circle (background) */}
            <div className={`w-full h-full rounded-full ${bgColor} flex items-center justify-center animate-in fade-in-50 duration-500`}>
              {/* Score text */}
              <div className="text-center">
                <span className={`text-5xl font-bold ${scoreColor} animate-in zoom-in-50 duration-700 delay-300`}>
                  {score}%
                </span>
                <p className="text-sm text-gray-500 mt-1">Match</p>
              </div>
            </div>
            
            {/* Progress circle (border) */}
            <div 
              className="absolute top-0 left-0 w-full h-full animate-in spin-in-90 duration-1000"
              style={{
                background: `conic-gradient(${progressColor} ${score}%, transparent ${score}%)`,
                borderRadius: '100%',
                zIndex: -1,
              }}
            ></div>
          </div>
          
          <div className="w-full mt-2">
            <div className="flex justify-between text-sm text-gray-500 mb-1">
              <span>Needs Work</span>
              <span>Getting There</span>
              <span>Interview Ready</span>
            </div>
            <Progress value={score} className="h-2" />
          </div>
          
          <div className="mt-6 text-center space-y-4">
            <p className="text-gray-600">
              {message}
            </p>
            
            <Button 
              variant="outline" 
              className="w-full border-scanmatch-200 hover:bg-scanmatch-50"
              asChild
            >
              <Link to="/learn">
                <GraduationCap className="mr-2 h-4 w-4" />
                Level Up Your Skills
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchScoreCard;
