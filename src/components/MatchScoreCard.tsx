
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type Props = {
  score: number;
};

const MatchScoreCard = ({ score }: Props) => {
  // Determine color based on score
  let scoreColor = "text-red-500";
  let progressColor = "bg-red-500";
  let bgColor = "bg-red-50";
  
  if (score >= 70) {
    scoreColor = "text-green-500";
    progressColor = "bg-green-500";
    bgColor = "bg-green-50";
  } else if (score >= 50) {
    scoreColor = "text-amber-500";
    progressColor = "bg-amber-500";
    bgColor = "bg-amber-50";
  }

  return (
    <Card className="shadow-md h-full">
      <CardHeader>
        <CardTitle>Match Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-40 h-40 mb-4">
            {/* Outer circle (background) */}
            <div className={`w-full h-full rounded-full ${bgColor} flex items-center justify-center`}>
              {/* Score text */}
              <div className="text-center">
                <span className={`text-5xl font-bold ${scoreColor}`}>{score}%</span>
                <p className="text-sm text-gray-500 mt-1">Match</p>
              </div>
            </div>
            
            {/* Progress circle (border) */}
            <div 
              className="absolute top-0 left-0 w-full h-full"
              style={{
                background: `conic-gradient(${progressColor} ${score}%, transparent ${score}%)`,
                borderRadius: '100%',
                zIndex: -1,
              }}
            ></div>
          </div>
          
          <div className="w-full mt-2">
            <div className="flex justify-between text-sm text-gray-500 mb-1">
              <span>Poor</span>
              <span>Good</span>
              <span>Excellent</span>
            </div>
            <Progress value={score} className="h-2" />
          </div>
          
          <p className="mt-4 text-center text-sm text-gray-600">
            {score >= 80 ? (
              "Excellent match! Your resume is well-aligned with this job."
            ) : score >= 60 ? (
              "Good match. Some improvements could strengthen your application."
            ) : (
              "Your resume needs work to better match this job description."
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchScoreCard;
