
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Trophy } from "lucide-react";

interface MatchScoreCardProps {
  score: number;
}

const MatchScoreCard: React.FC<MatchScoreCardProps> = ({ score }) => {
  const percentScore = Math.round(score);
  
  let scoreMessage = '';
  let scoreColorClass = '';
  
  if (percentScore >= 80) {
    scoreMessage = "Excellent! Your resume is well-matched for this job.";
    scoreColorClass = "text-green-600";
  } else if (percentScore >= 60) {
    scoreMessage = "Good! With a few adjustments, your resume will be even better.";
    scoreColorClass = "text-amber-600";
  } else {
    scoreMessage = "You're off to a good start! Here's how to make it stronger for this role.";
    scoreColorClass = "text-blue-600";
  }
  
  const encouragementMessage = percentScore >= 80 
    ? "You're in great shape! Just polish a few areas for maximum impact." 
    : percentScore >= 60 
    ? "Nice job! With some tuning, this could really shine." 
    : "You're on the right track — let's level this up together!";
    
  return (
    <Card className="shadow-md flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Trophy className="h-5 w-5 text-scanmatch-600 mr-2" />
          Match Score
        </CardTitle>
        <CardDescription>How well your resume matches the job</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex items-center justify-center">
        <div className="flex flex-col items-center justify-center py-4">
          <div className="mb-4">
            <svg className="w-32 h-32" viewBox="0 0 36 36">
              <path
                d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#e6e6e6"
                strokeWidth="3"
                strokeDasharray="100, 100"
              />
              <path
                d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={percentScore >= 80 ? "#4ade80" : percentScore >= 60 ? "#fbbf24" : "#60a5fa"}
                strokeWidth="3"
                strokeDasharray={`${percentScore}, 100`}
                className="animate-scoreCircle"
              />
              <text x="18" y="20.5" textAnchor="middle" className="font-bold text-3xl">{percentScore}</text>
            </svg>
          </div>
          <p className={`mt-2 text-center font-medium ${scoreColorClass}`}>{scoreMessage}</p>
          <p className="mt-2 text-sm text-center text-gray-600">{encouragementMessage}</p>
        </div>
      </CardContent>
      <CardFooter className="pt-0 text-center text-sm text-gray-500">
        We know job hunting is tough when you don't have years of experience. That's why we built this.
      </CardFooter>
    </Card>
  );
};

export default MatchScoreCard;
