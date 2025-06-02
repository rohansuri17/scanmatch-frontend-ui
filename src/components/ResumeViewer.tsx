import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KeywordItem } from '@/lib/supabaseClient';
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// Common words to exclude from keyword highlighting
const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
  'in', 'is', 'it', 'its', 'of', 'on', 'or', 'that', 'the', 'to', 'was', 'were',
  'will', 'with', 'the', 'this', 'but', 'they', 'have', 'had', 'what', 'when',
  'where', 'who', 'which', 'why', 'how', 'all', 'any', 'both', 'each', 'few',
  'more', 'most', 'other', 'some', 'such', 'than', 'too', 'very', 'can', 'cannot',
  'could', 'may', 'might', 'must', 'need', 'ought', 'shall', 'should', 'would'
]);

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

  // Function to check if a word should be highlighted
  const shouldHighlightWord = (word: string, keywordList: string[]) => {
    const normalizedWord = normalizeText(word);
    
    // Skip stop words
    if (STOP_WORDS.has(normalizedWord)) {
      return false;
    }

    // Skip if word is too short (likely not meaningful)
    if (normalizedWord.length < 2) {
      return false;
    }

    return keywordList.some(keyword => 
      normalizedWord.includes(keyword) || keyword.includes(normalizedWord)
    );
  };

  // Function to format sections in resume text
  const formatResumeText = (text: string) => {
    if (!text) return <p className="text-gray-500 italic">No resume text available</p>;

    // Split text into sections (assuming sections are separated by multiple newlines)
    const sections = text.split(/\n{2,}/);

    return sections.map((section, sIndex) => {
      const lines = section.split(/\n/);
      
      // Check if this section appears to be a header
      const isHeader = lines[0]?.trim().toUpperCase() === lines[0]?.trim();

      return (
        <div key={`section-${sIndex}`} className="mb-6 last:mb-0">
          {lines.map((line, lIndex) => {
            const words = line.split(/\b/);
            
            return (
              <p 
                key={`line-${sIndex}-${lIndex}`} 
                className={cn(
                  "mb-1 last:mb-0",
                  lIndex === 0 && isHeader ? "font-semibold text-lg text-gray-900" : "text-gray-700"
                )}
              >
                {words.map((word, wIndex) => {
                  // Only check for keywords if the word contains actual letters or numbers
                  if (!word.match(/[a-zA-Z0-9]/)) {
                    return <span key={`word-${sIndex}-${lIndex}-${wIndex}`}>{word}</span>;
                  }

                  const isFoundKeyword = shouldHighlightWord(word, foundKeywordsList);
                  
                  return (
                    <span 
                      key={`word-${sIndex}-${lIndex}-${wIndex}`}
                      className={isFoundKeyword ? "bg-green-100 text-green-800 px-0.5 rounded" : ""}
                    >
                      {word}
                    </span>
                  );
                })}
              </p>
            );
          })}
        </div>
      );
    });
  };

  // Function to format job description with sections
  const formatJobDescription = (text: string) => {
    if (!text) return <p className="text-gray-500 italic">No job description available</p>;

    // Split text into sections (assuming sections are separated by multiple newlines)
    const sections = text.split(/\n{2,}/);

    return sections.map((section, sIndex) => {
      const lines = section.split(/\n/);
      
      // Check if this section appears to be a header
      const isHeader = lines[0]?.match(/^[A-Z\s]+:?$/) || 
                      lines[0]?.includes(':') ||
                      lines[0]?.length < 30;

      return (
        <div key={`section-${sIndex}`} className="mb-6 last:mb-0">
          {lines.map((line, lIndex) => {
            const words = line.split(/\b/);
            
            return (
              <p 
                key={`line-${sIndex}-${lIndex}`} 
                className={cn(
                  "mb-1 last:mb-0",
                  lIndex === 0 && isHeader ? "font-semibold text-lg text-gray-900" : "text-gray-700",
                  line.trim().startsWith('•') ? "pl-2" : "" // Add indent for bullet points
                )}
              >
                {words.map((word, wIndex) => {
                  // Only check for keywords if the word contains actual letters or numbers
                  if (!word.match(/[a-zA-Z0-9]/)) {
                    return <span key={`word-${sIndex}-${lIndex}-${wIndex}`}>{word}</span>;
                  }

                  const isMissingKeyword = shouldHighlightWord(word, missingKeywordsList);
                  
                  return (
                    <span 
                      key={`word-${sIndex}-${lIndex}-${wIndex}`}
                      className={isMissingKeyword ? "bg-red-100 text-red-800 px-0.5 rounded" : ""}
                    >
                      {word}
                    </span>
                  );
                })}
              </p>
            );
          })}
        </div>
      );
    });
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Resume & Job Description</span>
          <div className="text-sm font-normal text-gray-500">
            {activeTab === 'resume' ? 'Green highlights show matching keywords' : 'Red highlights show missing keywords'}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="resume">Resume</TabsTrigger>
            <TabsTrigger value="job">Job Description</TabsTrigger>
          </TabsList>
          <ScrollArea className="h-[600px] rounded-md border p-4">
            <TabsContent value="resume" className="mt-0 data-[state=active]:mt-0">
              {formatResumeText(resumeText)}
            </TabsContent>
            <TabsContent value="job" className="mt-0 data-[state=active]:mt-0">
              {formatJobDescription(jobDescription)}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ResumeViewer;
