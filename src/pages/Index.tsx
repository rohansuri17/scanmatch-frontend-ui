
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check, File, FileText, Star, Upload } from "lucide-react";
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <NavBar />
      
      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4 overflow-hidden">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-8 text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Match Your Resume to <span className="text-scanmatch-600">Any Job Description</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600">
                Get instant feedback on how your resume matches the job requirements with our AI-powered scanner and coach.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center lg:justify-start">
                <Button asChild size="lg" className="text-lg bg-scanmatch-600 hover:bg-scanmatch-700">
                  <Link to="/scan">Try For Free</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-lg">
                  <Link to="/pricing">View Pricing</Link>
                </Button>
              </div>
            </div>
            <div className="lg:col-span-6">
              <div className="bg-white rounded-2xl shadow-xl p-6 max-w-lg mx-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Resume Scanner</h3>
                  <div className="bg-scanmatch-100 text-scanmatch-800 rounded-full px-3 py-1 text-sm font-medium">
                    Free Scan
                  </div>
                </div>
                <div className="p-4 border-2 border-dashed border-gray-200 rounded-lg mb-6 flex flex-col items-center justify-center">
                  <Upload className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Upload your resume (PDF or text)</p>
                  <Button variant="ghost" size="sm" className="mt-2">
                    Select File
                  </Button>
                </div>
                <div className="space-y-3 mb-6">
                  <label className="block text-sm font-medium text-gray-700">
                    Job Description
                  </label>
                  <textarea 
                    className="w-full h-32 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-scanmatch-500"
                    placeholder="Paste job description here..."
                  />
                </div>
                <Button className="w-full bg-scanmatch-600 hover:bg-scanmatch-700">
                  Scan My Resume
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How ScanMatch Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Get your resume matched to job descriptions in three simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm flex flex-col items-center text-center card-hover">
              <div className="bg-scanmatch-100 p-4 rounded-full mb-6">
                <Upload className="h-6 w-6 text-scanmatch-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Upload Resume</h3>
              <p className="text-gray-600">
                Upload your resume in PDF format or paste the text directly into the system.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm flex flex-col items-center text-center card-hover">
              <div className="bg-scanmatch-100 p-4 rounded-full mb-6">
                <FileText className="h-6 w-6 text-scanmatch-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Add Job Description</h3>
              <p className="text-gray-600">
                Paste the job description you're interested in applying for.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm flex flex-col items-center text-center card-hover">
              <div className="bg-scanmatch-100 p-4 rounded-full mb-6">
                <Check className="h-6 w-6 text-scanmatch-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Get Results</h3>
              <p className="text-gray-600">
                Receive instant feedback on your match score, missing keywords, and formatting suggestions.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Resume Analysis</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our AI-powered scanner gives you comprehensive insights to improve your chances
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    <div className="bg-scanmatch-100 p-2 rounded-full">
                      <Check className="h-5 w-5 text-scanmatch-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Match Score Analysis</h3>
                    <p className="text-gray-600">
                      Get a percentage score showing how well your resume matches the job requirements.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    <div className="bg-scanmatch-100 p-2 rounded-full">
                      <Check className="h-5 w-5 text-scanmatch-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Keyword Optimization</h3>
                    <p className="text-gray-600">
                      Identify missing keywords and phrases that are important for Applicant Tracking Systems.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    <div className="bg-scanmatch-100 p-2 rounded-full">
                      <Check className="h-5 w-5 text-scanmatch-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Structure Analysis</h3>
                    <p className="text-gray-600">
                      Get feedback on section ordering, content length, and missing resume components.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    <div className="bg-scanmatch-100 p-2 rounded-full">
                      <Check className="h-5 w-5 text-scanmatch-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">AI Resume Coach</h3>
                    <p className="text-gray-600">
                      Chat with our AI assistant to get personalized advice on improving your resume.
                    </p>
                    <div className="inline-flex items-center mt-1 bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      Coming Soon
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8">
              <div className="bg-scanmatch-600 text-white rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-semibold">Match Score</h3>
                  <div className="text-3xl font-bold">78%</div>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2.5">
                  <div className="bg-white h-2.5 rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold mb-3">Keyword Matches</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Project Management</span>
                    <span className="text-sm text-green-600 font-medium">Found</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Agile Methodology</span>
                    <span className="text-sm text-green-600 font-medium">Found</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Data Analysis</span>
                    <span className="text-sm text-red-600 font-medium">Missing</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Team Leadership</span>
                    <span className="text-sm text-green-600 font-medium">Found</span>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3">Structure Feedback</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    Resume length is appropriate (1 page)
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    Contact information complete
                  </li>
                  <li className="flex items-start">
                    <File className="h-4 w-4 text-amber-500 mr-2 mt-0.5" />
                    Consider adding a skills section
                  </li>
                  <li className="flex items-start">
                    <File className="h-4 w-4 text-amber-500 mr-2 mt-0.5" />
                    Work experience needs more quantifiable results
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Job seekers like you are landing interviews with ScanMatch
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm card-hover">
              <div className="flex items-center mb-4">
                <div className="mr-4">
                  <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center text-gray-500 font-medium">
                    JS
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold">John Smith</h4>
                  <p className="text-sm text-gray-500">Software Engineer</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600">
                "ScanMatch helped me identify key skills missing from my resume. After making the suggested changes, I got interviews from 3 companies that had previously rejected me."
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm card-hover">
              <div className="flex items-center mb-4">
                <div className="mr-4">
                  <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center text-gray-500 font-medium">
                    AW
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold">Alexandra Wilson</h4>
                  <p className="text-sm text-gray-500">Marketing Manager</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600">
                "The keyword matching feature is a game-changer. I was able to customize my resume for each application and saw my callback rate increase by 40%."
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm card-hover">
              <div className="flex items-center mb-4">
                <div className="mr-4">
                  <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center text-gray-500 font-medium">
                    DR
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold">David Rodriguez</h4>
                  <p className="text-sm text-gray-500">Project Manager</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" filled={i < 4} />
                ))}
              </div>
              <p className="text-gray-600">
                "The structure analysis pointed out that my experience section was too verbose. After trimming it down based on the suggestions, my resume became much more impactful."
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 hero-gradient text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Land Your Dream Job?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Start matching your resume to job descriptions and get personalized feedback today.
          </p>
          <Button asChild size="lg" className="bg-white text-scanmatch-700 hover:bg-gray-100 text-lg">
            <Link to="/scan">Try For Free</Link>
          </Button>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
