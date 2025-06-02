
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Award } from "lucide-react";

interface ResumeStructureCardProps {
  structureStrengths: string[];
  structureImprovements: string[];
}

const ResumeStructureCard: React.FC<ResumeStructureCardProps> = ({ 
  structureStrengths, 
  structureImprovements
}) => {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Resume Structure</CardTitle>
        <CardDescription>Strengths and areas for improvement</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2 flex items-center">
              <Award className="h-4 w-4 text-green-600 mr-1" />
              Structure Strengths
            </h3>
            <ul className="list-disc list-inside space-y-2 text-sm">
              {structureStrengths && structureStrengths.length > 0 ? (
                structureStrengths.map((strength: string, index: number) => (
                  <li key={index} className="text-gray-700">{strength}</li>
                ))
              ) : (
                <li className="text-gray-500">No specific strengths detected</li>
              )}
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2 flex items-center">
              <Award className="h-4 w-4 text-amber-500 mr-1" />
              Structure Weaknesses
            </h3>
            <ul className="list-disc list-inside space-y-2 text-sm">
              {structureImprovements && structureImprovements.length > 0 ? (
                structureImprovements.map((improvement: string, index: number) => (
                  <li key={index} className="text-gray-700">
                    {improvement}
                    <button className="ml-2 text-xs text-blue-600 hover:underline">Fix for me</button>
                  </li>
                ))
              ) : (
                <li className="text-gray-500">No specific weaknesses detected</li>
              )}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResumeStructureCard;
