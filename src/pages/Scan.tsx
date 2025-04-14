
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link, useNavigate } from "react-router-dom";
import { File, Upload } from "lucide-react";
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { toast } from "@/components/ui/sonner";

const Scan = () => {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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

  const handleSubmit = (e: React.FormEvent) => {
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
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // In a real application, we would submit the resume and job description to an API,
      // but for now we'll just navigate to the results page
      navigate('/results');
    }, 2000);
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
                  {isLoading ? 'Analyzing...' : 'Analyze & Score Resume'}
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
