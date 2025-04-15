
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Save, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface SaveResumeCardProps {
  analysisId?: string;
}

const SaveResumeCard: React.FC<SaveResumeCardProps> = ({ analysisId }) => {
  const { user } = useAuth();
  
  return (
    <Card className="shadow-md mb-8">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Save className="h-5 w-5 text-scanmatch-600 mr-2" />
          {user ? "Resume Saved" : "Save Your Progress"}
        </CardTitle>
        <CardDescription>
          {user 
            ? "Your analysis has been saved to your account" 
            : "Create an account to save this analysis and track your progress"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {user ? (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 text-center">
            <p className="text-green-800 font-medium">
              This analysis is saved to your account
            </p>
            <p className="text-sm text-green-700 mt-1">
              You can view it anytime in your profile
            </p>
          </div>
        ) : (
          <div className="bg-scanmatch-50 border border-scanmatch-200 rounded-md p-4">
            <p className="text-sm text-gray-700 mb-3">
              Creating an account allows you to:
            </p>
            <ul className="text-sm text-gray-700 space-y-2 mb-4 list-disc pl-5">
              <li>Save all your resume analyses</li>
              <li>Track your progress over time</li>
              <li>Get personalized AI coaching on your resume</li>
              <li>Compare scores across different job postings</li>
            </ul>
          </div>
        )}
      </CardContent>
      {!user && (
        <CardFooter className="flex justify-between gap-3">
          <Button variant="outline" className="w-1/2" asChild>
            <Link to="/login">
              Log In
            </Link>
          </Button>
          <Button className="w-1/2 bg-scanmatch-600 hover:bg-scanmatch-700" asChild>
            <Link to="/signup">
              <UserPlus className="h-4 w-4 mr-2" />
              Sign Up Free
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default SaveResumeCard;
