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
  const foundKeywordsList = Array.isArray(keywordsFound) 
    ? keywordsFound.map(kw => typeof kw === 'string' ? normalizeText(kw) : normalizeText(kw.word))
    : [];
    
  const missingKeywordsList = Array.isArray(keywordsMissing)
    ? keywordsMissing.map(kw => typeof kw === 'string' ? normalizeText(kw) : normalizeText(kw.word))
    : [];
  
  // Function to highlight keywords in resume text - only found keywords should be highlighted
  const highlightResumeKeywords = (text: string) => {
    if (!text) return <p>No text available</p>;
    
    // Split text into paragraphs
    const paragraphs = text.split(/\n+/);
    
    return (
      <div className="whitespace-pre-wrap">
        {paragraphs.map((paragraph, pIndex) => {
          if (!paragraph.trim()) return <br key={`p-${pIndex}`} />;
          
          // Split paragraph into words or phrases
          const words = paragraph.split(/\b/);
          
          return (
            <p key={`p-${pIndex}`} className="mb-4">
              {words.map((word, index) => {
                const normalizedWord = normalizeText(word);
                
                // Only check for found keywords in resume view
                const isFoundKeyword = foundKeywordsList.some(keyword => 
                  normalizedWord.includes(keyword) || keyword.includes(normalizedWord)
                );
                
                if (isFoundKeyword) {
                  return <span key={`w-${pIndex}-${index}`} className="bg-green-200 text-green-800 px-0.5 rounded">{word}</span>;
                } else {
                  return <span key={`w-${pIndex}-${index}`}>{word}</span>;
                }
              })}
            </p>
          );
        })}
      </div>
    );
  };
  
  // Function to highlight keywords in job description - only missing keywords should be highlighted
  const highlightJobKeywords = (text: string) => {
    if (!text) return <p>No text available</p>;
    
    // Split text into paragraphs
    const paragraphs = text.split(/\n+/);
    
    return (
      <div className="whitespace-pre-wrap">
        {paragraphs.map((paragraph, pIndex) => {
          if (!paragraph.trim()) return <br key={`p-${pIndex}`} />;
          
          // Split paragraph into words or phrases
          const words = paragraph.split(/\b/);
          
          return (
            <p key={`p-${pIndex}`} className="mb-4">
              {words.map((word, index) => {
                const normalizedWord = normalizeText(word);
                
                // Only check for missing keywords in job description view
                const isMissingKeyword = missingKeywordsList.some(keyword => 
                  normalizedWord.includes(keyword) || keyword.includes(normalizedWord)
                );
                
                if (isMissingKeyword) {
                  return <span key={`w-${pIndex}-${index}`} className="bg-red-200 text-red-800 px-0.5 rounded">{word}</span>;
                } else {
                  return <span key={`w-${pIndex}-${index}`}>{word}</span>;
                }
              })}
            </p>
          );
        })}
      </div>
    );
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Resume & Job Description</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="resume">Resume</TabsTrigger>
            <TabsTrigger value="job">Job Description</TabsTrigger>
          </TabsList>
          <TabsContent value="resume" className="mt-4">
            {highlightResumeKeywords(resumeText)}
          </TabsContent>
          <TabsContent value="job" className="mt-4">
            {highlightJobKeywords(jobDescription)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ResumeViewer;
