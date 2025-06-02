import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link, useNavigate } from "react-router-dom";
import { File, Upload, Loader2, GraduationCap, BookOpen } from "lucide-react";
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { saveResumeAnalysis, saveResumeScanData, checkIPScanLimit, incrementIPScanCount } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from '@/hooks/useSubscription';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import AICoachAvatar from "@/components/AICoachAvatar";
import ProgressTracker from "@/components/ProgressTracker";
import ResumeAnalysisHistory from "@/components/ResumeAnalysisHistory";
import FreeScanCounter from '@/components/FreeScanCounter';

GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.min.mjs';

const Scan = () => {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { checkCanScan, incrementScan } = useSubscription();
  const [ipAddress, setIPAddress] = useState<string>('');

  const clearAnalysisData = () => {
    localStorage.removeItem('resumeAnalysisData');
    sessionStorage.removeItem('resumeText');
    sessionStorage.removeItem('jobDescription');
  };

  useEffect(() => {
    clearAnalysisData();
  }, []);

  useEffect(() => {
    const getIP = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        setIPAddress(data.ip);
      } catch (error) {
        console.error('Error getting IP:', error);
      }
    };

    if (!user) {
      getIP();
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
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
        reader.onload = e => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
        return;
      }
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const typedArray = new Uint8Array(e.target?.result as ArrayBuffer);
          const pdf = await getDocument({ data: typedArray }).promise;
  
          let text = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map((item: any) => item.str).join(' ') + '\n';
          }
  
          resolve(text.trim());
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
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
    
    // Check scan limits
    try {
      if (user) {
        const canScan = await checkCanScan();
        if (!canScan) {
          toast.error("Scan limit reached", {
            description: "Please upgrade your plan to continue scanning resumes",
          });
          navigate('/pricing');
          return;
        }
      } else if (ipAddress) {
        const canScan = await checkIPScanLimit(ipAddress);
        if (!canScan) {
          toast.error("Free scan limit reached", {
            description: "Sign up for a free account to get more scans, or upgrade to Pro for unlimited scans",
          });
          navigate('/pricing');
          return;
        }
      }
    } catch (err) {
      console.error("Error checking scan capability:", err);
    }
    
    setIsLoading(true);
    setError('');
    clearAnalysisData();

    try {
      const resumeText = await readFileAsText(resumeFile);
      
      sessionStorage.setItem('resumeText', resumeText);
      sessionStorage.setItem('jobDescription', jobDescription);
      
      const { data, error: functionError } = await supabase.functions.invoke('resume-scan', {
        body: { resumeText, jobDescription },
      });

      if (functionError || !data) {
        throw new Error(functionError?.message || 'Error analyzing resume');
      }

      console.log('Resume scan response:', data);

      // Increment scan count based on user status
      if (user) {
        await incrementScan();
        
        try {
          await saveResumeScanData({
            user_id: user.id,
            resume_text: resumeText,
            job_description: jobDescription,
            job_title: data.job_title
          });
        } catch (error) {
          console.error("Error saving scan data:", error);
        }
        
        const analysisData = {
          user_id: user.id,
          resume_text: resumeText,
          score: data.score,
          keywords_found: JSON.stringify(data.keywords.found.map(k => k.word)),
          keywords_missing: JSON.stringify(data.keywords.missing.map(k => k.word)),
          structure_strengths: JSON.stringify(data.structure.strengths),
          structure_improvements: JSON.stringify(data.structure.improvements),
          job_title: data.job_title,
          improvement_suggestions: data.improvement_suggestions,
          interview_questions: data.interview_questions
        };
        console.log('Analysis data to save:', analysisData);
        const savedAnalysis = await saveResumeAnalysis(analysisData);
        navigate(`/results?id=${savedAnalysis.id}`);
      } else {
        // For non-authenticated users, increment IP-based scan count
        if (ipAddress) {
          await incrementIPScanCount(ipAddress);
        }
        
        const analysisData = {
          score: data.score,
          keywords_found: JSON.stringify(data.keywords.found.map(k => k.word)),
          keywords_missing: JSON.stringify(data.keywords.missing.map(k => k.word)),
          structure_strengths: JSON.stringify(data.structure.strengths),
          structure_improvements: JSON.stringify(data.structure.improvements),
          job_title: data.job_title,
          improvement_suggestions: data.improvement_suggestions,
          interview_questions: data.interview_questions,
          resume_text: resumeText,
          job_description: jobDescription
        };
        console.log('Analysis data for localStorage:', analysisData);
        localStorage.setItem('resumeAnalysis', JSON.stringify(analysisData));
        navigate('/results');
      }
    } catch (err) {
      console.error('Error in resume scan:', err);
      setError(err.message || 'An error occurred while analyzing your resume');
      toast.error('Analysis failed', {
        description: err.message || 'Please try again later',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Used to toggle display of resume analysis history dropdown
  const [showResumeHistory, setShowResumeHistory] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-grow py-12">
        <div className="container-custom">
          {!user && ipAddress && (
            <FreeScanCounter ipAddress={ipAddress} />
          )}
          {/* Resume Analysis History Dropdown */}
          <div className="mb-6">
            <button
              className="text-scanmatch-600 underline hover:text-scanmatch-700 transition font-medium"
              onClick={() => setShowResumeHistory(!showResumeHistory)}
            >
              {showResumeHistory ? "Hide" : "Show"} Resume Analysis History
            </button>
            {showResumeHistory && (
              <div className="mt-4 animate-fade-in">
                <ResumeAnalysisHistory />
              </div>
            )}
          </div>

          {/* AI Avatar */}
          <div className="mb-8">
            <AICoachAvatar message="Upload your resume and paste a job description below. Need help? I'll cheer you on each step!" />
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
                <CardDescription>Upload your resume in PDF or text format</CardDescription>
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
                
                <div className="mt-4 text-center">
                  <Button variant="link" size="sm" className="text-scanmatch-600" asChild>
                    <a href="#" target="_blank" rel="noopener noreferrer">
                      Don't have a resume yet? Download a template
                    </a>
                  </Button>
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
              <Button variant="outline" type="button" asChild>
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
      </main>
      <Footer />
    </div>
  );
};

export default Scan;
