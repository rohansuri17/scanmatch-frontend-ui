
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link, useNavigate } from "react-router-dom";
import { File, Upload, Loader2 } from "lucide-react";
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { saveResumeAnalysis } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";

const Scan = () => {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Check if file is PDF or text
      if (file.type === 'application/pdf' || file.type === 'text/plain') {
        setResumeFile(file);
        setError('');
        toast.success(`Resume "${file.name}" uploaded successfully`);
      } else {
        setError('Please upload a PDF or text file');
        setResumeFile(null);
      }
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve(e.target?.result as string);
        };
        reader.onerror = reject;
        reader.readAsText(file);
      } else if (file.type === 'application/pdf') {
        // For simplicity, we'll return the filename for PDF files
        // In a production app, you would use a PDF parsing library
        resolve(`Resume file: ${file.name} (PDF content would be extracted)`);
      } else {
        reject(new Error('Unsupported file type'));
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resumeFile) {
      setError('Please upload your resume');
      return;
    }
    
    if (!jobDescription.trim()) {
      setError('Please enter a job description');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Read the file content
      const resumeText = await readFileAsText(resumeFile);
      
      // Call the Supabase edge function to analyze the resume
      const { data, error: functionError } = await supabase.functions.invoke('resume-scan', {
        body: { resumeText, jobDescription },
      });
      
      if (functionError) {
        throw new Error(functionError.message || 'Error analyzing resume');
      }
      
      if (!data) {
        throw new Error('No data returned from analysis');
      }
      
      // Save the analysis if user is logged in
      if (user) {
        const analysisData = {
          user_id: user.id,
          score: data.score,
          keywords_found: data.keywords.found.map(k => k.word),
          keywords_missing: data.keywords.missing.map(k => k.word),
          structure_strengths: data.structure.strengths,
          structure_improvements: data.structure.improvements,
          job_title: data.job_title
        };
        
        const savedAnalysis = await saveResumeAnalysis(analysisData);
        navigate(`/results?id=${savedAnalysis.id}`);
      } else {
        // Store in session storage for anonymous users
        sessionStorage.setItem('resumeAnalysis', JSON.stringify(data));
        navigate('/results');
      }
    } catch (err: any) {
      console.error('Error in resume scan:', err);
      setError(err.message || 'An error occurred while analyzing your resume');
      toast.error('Analysis failed', {
        description: err.message || 'Please try again later',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow py-12">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Match Your Resume</h1>
              <p className="text-gray-600">
                Upload your resume and paste the job description to get a detailed match analysis
              </p>
            </div>
            
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit}>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Upload Resume</CardTitle>
                  <CardDescription>
                    Upload your resume in PDF or text format
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div 
                    className={`p-6 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer
                      ${resumeFile ? 'border-scanmatch-500 bg-scanmatch-50' : 'border-gray-200 hover:border-scanmatch-500 hover:bg-gray-50'}`}
                    onClick={() => document.getElementById('resume-upload')?.click()}
                  >
                    {resumeFile ? (
                      <>
                        <File className="h-8 w-8 text-scanmatch-500 mb-3" />
                        <p className="font-medium text-gray-800">{resumeFile.name}</p>
                        <p className="text-sm text-gray-500 mt-1">Click to change file</p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-10 w-10 text-gray-400 mb-3" />
                        <p className="text-center text-gray-500">
                          <span className="font-medium text-scanmatch-600">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-sm text-gray-400 mt-1">PDF or text files only</p>
                      </>
                    )}
                    <input 
                      id="resume-upload"
                      type="file" 
                      accept=".pdf,.txt" 
                      className="hidden" 
                      onChange={handleFileChange}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Job Description</CardTitle>
                  <CardDescription>
                    Paste the job description you want to match against
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea 
                    placeholder="Paste job description here..." 
                    className="min-h-[200px]"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                </CardContent>
              </Card>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <Button 
                  variant="outline" 
                  type="button"
                  asChild
                >
                  <Link to="/">Cancel</Link>
                </Button>
                <Button 
                  type="submit" 
                  className="bg-scanmatch-600 hover:bg-scanmatch-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze & Score Resume'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Scan;
