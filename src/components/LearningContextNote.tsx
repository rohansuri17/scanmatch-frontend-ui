
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Target } from "lucide-react";

type Props = {
  jobTitle?: string;
  keywordsMissing?: string[];
};

const LearningContextNote = ({ jobTitle, keywordsMissing = [] }: Props) => {
  return (
    <Card className="mb-8 bg-gradient-to-r from-scanmatch-50 to-blue-50 border-scanmatch-100">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="bg-white p-2 rounded-lg">
            <GraduationCap className="h-6 w-6 text-scanmatch-600" />
          </div>
          <div>
            <h3 className="font-medium text-lg mb-2">
              Curated Learning Path {jobTitle && `for ${jobTitle}`}
            </h3>
            <p className="text-gray-600">
              We've analyzed your resume and found specific skills that could make you stand out. 
              These courses are hand-picked to help you develop the exact skills employers are looking for.
            </p>
            {keywordsMissing && keywordsMissing.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center gap-2 text-sm text-scanmatch-700 mb-2">
                  <Target className="h-4 w-4" />
                  <span>Focus Areas:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {keywordsMissing.map((keyword, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-white rounded text-sm text-scanmatch-600 border border-scanmatch-200"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LearningContextNote;
