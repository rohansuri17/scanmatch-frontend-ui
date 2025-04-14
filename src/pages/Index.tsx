import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, Star } from "lucide-react";
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-white to-scanmatch-50">
          <div className="container-custom">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-1/2 space-y-6">
                <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                  Match Your Resume to <span className="text-scanmatch-600">Any Job</span> with AI
                </h1>
                <p className="text-xl text-gray-600">
                  Upload your resume and a job description to get instant feedback, keyword matching, and personalized improvement suggestions.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button className="bg-scanmatch-600 hover:bg-scanmatch-700 text-lg py-6" size="lg" asChild>
                    <Link to="/scan">
                      Try It Free <ArrowRight className="ml-2" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" className="text-lg py-6" asChild>
                    <Link to="/pricing">View Pricing</Link>
                  </Button>
                </div>
                
                {/* Trust Markers */}
                <div className="flex items-center space-x-2 text-gray-600">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <span className="text-sm">Used by 1000+ job seekers to land interviews at top companies</span>
                </div>
              </div>
              
              <div className="md:w-1/2">
                <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-6 relative">
                  <img 
                    src="/images/resume-analysis.png" 
                    alt="Resume Analysis Dashboard" 
                    className="rounded-lg w-full"
                    onError={(e) => {
                      e.currentTarget.src = "https://placehold.co/600x400/e0ebff/2464ff?text=Resume+Analysis+Dashboard";
                    }}
                  />
                  <div className="absolute -bottom-4 -right-4 bg-scanmatch-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                    AI-Powered Analysis
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">How ScanMatch Works</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our AI-powered platform analyzes your resume against job descriptions to maximize your chances of getting interviews.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-scanmatch-50 rounded-xl p-6 border border-scanmatch-100">
                <div className="bg-scanmatch-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <span className="text-scanmatch-700 font-bold text-xl">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Upload & Scan</h3>
                <p className="text-gray-600">
                  Upload your resume and paste the job description you're interested in.
                </p>
              </div>
              
              <div className="bg-scanmatch-50 rounded-xl p-6 border border-scanmatch-100">
                <div className="bg-scanmatch-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <span className="text-scanmatch-700 font-bold text-xl">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Get Detailed Analysis</h3>
                <p className="text-gray-600">
                  Receive a comprehensive report with match score, keyword analysis, and structure feedback.
                </p>
              </div>
              
              <div className="bg-scanmatch-50 rounded-xl p-6 border border-scanmatch-100">
                <div className="bg-scanmatch-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <span className="text-scanmatch-700 font-bold text-xl">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Optimize & Apply</h3>
                <p className="text-gray-600">
                  Use our AI suggestions to improve your resume and increase your chances of getting interviews.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Testimonials */}
        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">What Our Users Say</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Join thousands of job seekers who have improved their resumes with ScanMatch.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "ScanMatch helped me understand why I wasn't getting callbacks. After optimizing my resume based on their suggestions, I landed 4 interviews in 2 weeks!"
                </p>
                <div className="flex items-center">
                  <div className="bg-scanmatch-100 w-10 h-10 rounded-full flex items-center justify-center text-scanmatch-700 font-medium mr-3">
                    JD
                  </div>
                  <div>
                    <h4 className="font-semibold">Jessica D.</h4>
                    <p className="text-sm text-gray-500">Marketing Specialist</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "The keyword analysis was eye-opening. I was missing critical terms that recruiters were looking for. ScanMatch helped me tailor my resume perfectly."
                </p>
                <div className="flex items-center">
                  <div className="bg-scanmatch-100 w-10 h-10 rounded-full flex items-center justify-center text-scanmatch-700 font-medium mr-3">
                    MT
                  </div>
                  <div>
                    <h4 className="font-semibold">Michael T.</h4>
                    <p className="text-sm text-gray-500">Software Engineer</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "As a career changer, I struggled to highlight transferable skills. The AI coach gave me specific suggestions that made my resume much stronger."
                </p>
                <div className="flex items-center">
                  <div className="bg-scanmatch-100 w-10 h-10 rounded-full flex items-center justify-center text-scanmatch-700 font-medium mr-3">
                    AL
                  </div>
                  <div>
                    <h4 className="font-semibold">Aisha L.</h4>
                    <p className="text-sm text-gray-500">Project Manager</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-scanmatch-600 text-white">
          <div className="container-custom">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-4">Ready to Optimize Your Resume?</h2>
              <p className="text-xl mb-8">
                Get started for free and see how your resume matches up to your dream job.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button className="bg-white text-scanmatch-600 hover:bg-gray-100 text-lg py-6" size="lg" asChild>
                  <Link to="/scan">
                    Try It Free <ArrowRight className="ml-2" />
                  </Link>
                </Button>
                <Button variant="outline" className="border-white text-white hover:bg-scanmatch-500 text-lg py-6" size="lg" asChild>
                  <Link to="/pricing">View Pricing</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Benefits Section */}
        <section className="py-16 bg-white">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Why Choose ScanMatch</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our platform offers unique advantages to help you stand out in the job market.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="p-6">
                <CheckCircle className="h-10 w-10 text-scanmatch-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">AI-Powered Analysis</h3>
                <p className="text-gray-600">
                  Our advanced AI analyzes your resume against job descriptions to identify matches and gaps.
                </p>
              </div>
              
              <div className="p-6">
                <CheckCircle className="h-10 w-10 text-scanmatch-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Keyword Optimization</h3>
                <p className="text-gray-600">
                  Identify missing keywords that recruiters and ATS systems are looking for.
                </p>
              </div>
              
              <div className="p-6">
                <CheckCircle className="h-10 w-10 text-scanmatch-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Structure Feedback</h3>
                <p className="text-gray-600">
                  Get recommendations on resume structure, formatting, and content organization.
                </p>
              </div>
              
              <div className="p-6">
                <CheckCircle className="h-10 w-10 text-scanmatch-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Personalized Coaching</h3>
                <p className="text-gray-600">
                  Our AI Resume Coach provides tailored advice to improve your specific resume.
                </p>
              </div>
              
              <div className="p-6">
                <CheckCircle className="h-10 w-10 text-scanmatch-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">ATS Compatibility</h3>
                <p className="text-gray-600">
                  Ensure your resume passes through Applicant Tracking Systems with our optimization tips.
                </p>
              </div>
              
              <div className="p-6">
                <CheckCircle className="h-10 w-10 text-scanmatch-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Quick Results</h3>
                <p className="text-gray-600">
                  Get instant feedback and start improving your resume in minutes, not days.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
