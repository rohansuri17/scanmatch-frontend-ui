
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KeywordItem } from '@/lib/supabaseClient';

interface ResumeViewerProps {
  resumeText: string;
  jobDescription: string;
  keywordsFound: KeywordItem[];
  keywordsMissing: KeywordItem[];
}

const ResumeViewer: React.FC<ResumeViewerProps> = ({ 
  resumeText, 
  jobDescription, 
  keywordsFound, 
  keywordsMissing 
}) => {
  const [activeTab, setActiveTab] = useState('resume');

  // Helper function to normalize keywords for consistent matching
  const normalizeText = (text: string) => text.toLowerCase().trim();
  
  // Extract simple strings from keyword items
  const foundKeywords = Array.isArray(keywordsFound) 
    ? keywordsFound.map(kw => typeof kw === 'string' ? normalizeText(kw) : normalizeText(kw.word))
    : [];
    
  const missingKeywords = Array.isArray(keywordsMissing)
    ? keywordsMissing.map(kw => typeof kw === 'string' ? normalizeText(kw) : normalizeText(kw.word))
    : [];
  
  // Function to highlight keywords in text
  const highlightKeywords = (text: string) => {
    if (!text) return <p>No text available</p>;
    
    // Split text into words or phrases
    const words = text.split(/\b/);
    
    return (
      <div className="whitespace-pre-wrap">
        {words.map((word, index) => {
          const normalizedWord = normalizeText(word);
          
          // Check if word matches any found keyword
          const isFoundKeyword = foundKeywords.some(keyword => 
            normalizedWord.includes(keyword) || keyword.includes(normalizedWord)
          );
          
          // Check if word matches any missing keyword
          const isMissingKeyword = missingKeywords.some(keyword => 
            normalizedWord.includes(keyword) || keyword.includes(normalizedWord)
          );
          
          if (isFoundKeyword) {
            return <span key={index} className="bg-green-200 text-green-800 px-0.5 rounded">{word}</span>;
          } else if (isMissingKeyword) {
            return <span key={index} className="bg-red-200 text-red-800 px-0.5 rounded">{word}</span>;
          } else {
            return <span key={index}>{word}</span>;
          }
        })}
      </div>
    );
  };
  
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Document Viewer</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="resume" onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-2 mb-4">
            <TabsTrigger value="resume">Resume</TabsTrigger>
            <TabsTrigger value="job">Job Description</TabsTrigger>
          </TabsList>
          <TabsContent value="resume" className="border rounded-md p-4 min-h-[400px] max-h-[600px] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-medium">Your Resume</h3>
              <div className="flex gap-2">
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                  Found Keywords
                </span>
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                  Missing Keywords
                </span>
              </div>
            </div>
            {highlightKeywords(resumeText)}
          </TabsContent>
          <TabsContent value="job" className="border rounded-md p-4 min-h-[400px] max-h-[600px] overflow-y-auto">
            <h3 className="font-medium mb-4">Job Description</h3>
            <div className="whitespace-pre-wrap">{jobDescription}</div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ResumeViewer;
