import React from 'react';
import NavBar from '@/components/NavBar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, Star, GraduationCap, BookOpen, Briefcase, FileText, MessageSquare, BarChart, Brain, Rocket } from "lucide-react";
import Footer from '@/components/Footer';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

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
                  Get Job Ready with <span className="text-scanmatch-600">AI Career Mentor</span>
                </h1>
                <p className="text-xl text-gray-600">
                  Your AI Career Mentor — From Resume to Hired. JobCoach.AI guides new grads and career changers through every step of the job hunt.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button className="bg-scanmatch-600 hover:bg-scanmatch-700 text-lg py-6" size="lg" asChild>
                    <Link to="/scan">
                      Try Free Resume Scan <ArrowRight className="ml-2" />
                    </Link>
                  </Button>
                  <Button variant="outline" className="bg-white text-scanmatch-700 hover:bg-gray-100 text-lg py-6" size="lg" asChild>
                    <Link to="/pricing">View Pricing</Link>
                  </Button>
                </div>
                
                {/* Progress Cards */}
                <div className="flex flex-wrap gap-4 pt-2">
                  <div className="bg-white rounded-lg px-3 py-2 shadow-sm border borde-gray-100 flex items-center">
                    <GraduationCap className="h-5 w-5 text-scanmatch-600 mr-2" />
                    <span className="text-sm font-medium">New Graduate?</span>
                  </div>
                  
                  <div className="bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-100 flex items-center">
                    <Briefcase className="h-5 w-5 text-scanmatch-600 mr-2" />
                    <span className="text-sm font-medium">Changing Careers?</span>
                  </div>
                  
                  <div className="bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-100 flex items-center">
                    <Rocket className="h-5 w-5 text-scanmatch-600 mr-2" />
                    <span className="text-sm font-medium">Early-Career Boost</span>
                  </div>
                </div>
                
                {/* Trust Markers */}
                <div className="flex items-center space-x-2 text-gray-600">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <span className="text-sm">Trusted by 1000+ job seekers to land interviews at top companies</span>
                </div>
              </div>
              
              <div className="md:w-1/2">
                <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-6 relative">
                  <img 
                    src="/images/resume-analysis.png" 
                    alt="JobCoach.AI Dashboard" 
                    className="rounded-lg w-full"
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=600";
                    }}
                  />
                  <div className="absolute -bottom-4 -right-4 bg-scanmatch-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                    AI-Powered Career Coach
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Step-by-Step UI Flow */}
        <section className="py-16 bg-white">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">How JobCoach.AI Works</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We guide you through a proven 3-step process to go from resume to hired.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1: Resume Readiness */}
              <div className="bg-scanmatch-50 rounded-xl p-6 border border-scanmatch-100 relative hover:shadow-md transition-all group">
                <div className="bg-scanmatch-600 text-white rounded-full w-10 h-10 flex items-center justify-center mb-6 absolute -top-4 -left-4">
                  <span className="font-bold text-lg">1</span>
                </div>
                <div className="pt-4">
                  <FileText className="h-10 w-10 text-scanmatch-600 mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Resume Readiness</h3>
                  <p className="text-gray-600 mb-4">
                    Upload your resume and job description. Get an AI analysis with keyword matching and personalized improvement suggestions.
                  </p>
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      className="group-hover:bg-scanmatch-600 group-hover:text-white transition-colors" 
                      size="sm"
                      asChild
                    >
                      <Link to="/scan">Start Resume Scan</Link>
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Step 2: Learn & Grow */}
              <div className="bg-scanmatch-50 rounded-xl p-6 border border-scanmatch-100 relative hover:shadow-md transition-all group">
                <div className="bg-scanmatch-600 text-white rounded-full w-10 h-10 flex items-center justify-center mb-6 absolute -top-4 -left-4">
                  <span className="font-bold text-lg">2</span>
                </div>
                <div className="pt-4">
                  <BookOpen className="h-10 w-10 text-scanmatch-600 mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Learn & Grow</h3>
                  <p className="text-gray-600 mb-4">
                    Get a personalized learning roadmap based on your skill gaps. Curated courses and resources to boost your qualifications.
                  </p>
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      className="group-hover:bg-scanmatch-600 group-hover:text-white transition-colors" 
                      size="sm"
                      asChild
                    >
                      <Link to="/learn">Explore Learning Path</Link>
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Step 3: Interview Practice */}
              <div className="bg-scanmatch-50 rounded-xl p-6 border border-scanmatch-100 relative hover:shadow-md transition-all group">
                <div className="bg-scanmatch-600 text-white rounded-full w-10 h-10 flex items-center justify-center mb-6 absolute -top-4 -left-4">
                  <span className="font-bold text-lg">3</span>
                </div>
                <div className="pt-4">
                  <MessageSquare className="h-10 w-10 text-scanmatch-600 mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Interview Practice</h3>
                  <p className="text-gray-600 mb-4">
                    Practice with AI-generated interview questions tailored to your resume and target job. Get feedback to improve your answers.
                  </p>
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      className="group-hover:bg-scanmatch-600 group-hover:text-white transition-colors" 
                      size="sm"
                      asChild
                    >
                      <Link to="/interview">Practice Interviews</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center mt-10">
              <Button className="bg-scanmatch-600 hover:bg-scanmatch-700" size="lg" asChild>
                <Link to="/scan">
                  Start Your Journey <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
        
        {/* Testimonials */}
        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Built for Career Starters</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                See how JobCoach.AI has helped job seekers like you land their dream roles.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "As a new CS grad with no internships, JobCoach.AI helped me understand exactly what I was missing. After following the learning roadmap, I landed 3 interviews in my first week of applying!"
                </p>
                <div className="flex items-center">
                  <div className="bg-scanmatch-100 w-10 h-10 rounded-full flex items-center justify-center text-scanmatch-700 font-medium mr-3">
                    JD
                  </div>
                  <div>
                    <h4 className="font-semibold">Jessica D.</h4>
                    <p className="text-sm text-gray-500">New Graduate, Software Engineer</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "Switching from teaching to UX design felt impossible until I found JobCoach.AI. The personalized learning plan and interview practice were game changers. Just accepted my first UX role!"
                </p>
                <div className="flex items-center">
                  <div className="bg-scanmatch-100 w-10 h-10 rounded-full flex items-center justify-center text-scanmatch-700 font-medium mr-3">
                    MT
                  </div>
                  <div>
                    <h4 className="font-semibold">Michael T.</h4>
                    <p className="text-sm text-gray-500">Career Changer, UX Designer</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "The AI interview coach helped me overcome my nervousness. After practicing the generated questions, I felt so much more confident and it showed in my real interview. Got the job!"
                </p>
                <div className="flex items-center">
                  <div className="bg-scanmatch-100 w-10 h-10 rounded-full flex items-center justify-center text-scanmatch-700 font-medium mr-3">
                    AL
                  </div>
                  <div>
                    <h4 className="font-semibold">Aisha L.</h4>
                    <p className="text-sm text-gray-500">Marketing Associate</p>
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
              <h2 className="text-3xl font-bold mb-4">Ready to Jumpstart Your Career?</h2>
              <p className="text-xl mb-8">
                We know job hunting is tough when you're just starting out. That's why we built this AI career mentor to guide you every step of the way.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button className="bg-white text-scanmatch-600 hover:bg-gray-100 text-lg py-6" size="lg" asChild>
                  <Link to="/scan">
                    Start Free <ArrowRight className="ml-2" />
                  </Link>
                </Button>
                <Button variant="outline" className="bg-white text-scanmatch-600 hover:bg-gray-100 text-lg py-6" size="lg" asChild>
                  <Link to="/pricing">View Pricing</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Why Choose JobCoach.AI</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our platform offers unique advantages to help you stand out in the job market.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="p-6 hover:bg-gray-50 rounded-lg transition-colors">
                <Brain className="h-10 w-10 text-scanmatch-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">AI-Powered Analysis</h3>
                <p className="text-gray-600">
                  Advanced AI analyzes your resume against job descriptions to identify matches and skill gaps.
                </p>
              </div>
              
              <div className="p-6 hover:bg-gray-50 rounded-lg transition-colors">
                <CheckCircle className="h-10 w-10 text-scanmatch-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Personalized Learning</h3>
                <p className="text-gray-600">
                  Custom learning paths based on your specific skill gaps and career goals.
                </p>
              </div>
              
              <div className="p-6 hover:bg-gray-50 rounded-lg transition-colors">
                <MessageSquare className="h-10 w-10 text-scanmatch-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Interview Practice</h3>
                <p className="text-gray-600">
                  Practice with AI-generated interview questions tailored to your resume and target role.
                </p>
              </div>
              
              <div className="p-6 hover:bg-gray-50 rounded-lg transition-colors">
                <BarChart className="h-10 w-10 text-scanmatch-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Progress Tracking</h3>
                <p className="text-gray-600">
                  Track your job readiness progress with interactive dashboards and checklists.
                </p>
              </div>
              
              <div className="p-6 hover:bg-gray-50 rounded-lg transition-colors">
                <FileText className="h-10 w-10 text-scanmatch-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Resume Enhancement</h3>
                <p className="text-gray-600">
                  Get targeted suggestions to improve your resume and stand out to employers.
                </p>
              </div>
              
              <div className="p-6 hover:bg-gray-50 rounded-lg transition-colors">
                <GraduationCap className="h-10 w-10 text-scanmatch-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Career Acceleration</h3>
                <p className="text-gray-600">
                  Specifically designed for new graduates and career changers to accelerate your job search.
                </p>
              </div>
            </div>
            
            <div className="flex justify-center mt-12">
              <Button className="bg-scanmatch-600 hover:bg-scanmatch-700" size="lg" asChild>
                <Link to="/scan">
                  Try Free Resume Scan <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
        
        {/* Pricing Preview */}
        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Choose the plan that fits your career stage and needs.
              </p>
            </div>
            
            <div className="flex justify-center">
              <div className="grid md:grid-cols-3 gap-8 max-w-5xl">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex flex-col">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold">Free</h3>
                    <div className="mt-4 flex items-baseline">
                      <span className="text-3xl font-bold">$0</span>
                      <span className="text-gray-500 ml-1">/month</span>
                    </div>
                    <p className="text-gray-600 mt-3">Perfect for getting started</p>
                  </div>
                  
                  <ul className="space-y-3 mb-8 flex-grow">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-scanmatch-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span>3 resume scans/month</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-scanmatch-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Basic improvement suggestions</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-scanmatch-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Limited learning resources</span>
                    </li>
                  </ul>
                  
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/signup">Sign Up Free</Link>
                  </Button>
                </div>
                
                <div className="bg-white rounded-xl p-6 border border-scanmatch-200 shadow-md relative flex flex-col transform scale-105">
                  <div className="absolute top-0 right-0 bg-scanmatch-600 text-white px-3 py-1 text-sm font-medium rounded-bl-lg rounded-tr-lg">
                    Popular
                  </div>
                  <div className="mb-6">
                    <h3 className="text-xl font-bold">Pro</h3>
                    <div className="mt-4 flex items-baseline">
                      <span className="text-3xl font-bold">$9</span>
                      <span className="text-gray-500 ml-1">/month</span>
                    </div>
                    <p className="text-gray-600 mt-3">For serious job seekers</p>
                  </div>
                  
                  <ul className="space-y-3 mb-8 flex-grow">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-scanmatch-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Unlimited resume scans</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-scanmatch-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Personalized learning roadmap</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-scanmatch-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Advanced suggestions</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-scanmatch-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Save and track progress</span>
                    </li>
                  </ul>
                  
                  <Button className="w-full bg-scanmatch-600 hover:bg-scanmatch-700" asChild>
                    <Link to="/pricing">Get Pro</Link>
                  </Button>
                </div>
                
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex flex-col">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold">Premium</h3>
                    <div className="mt-4 flex items-baseline">
                      <span className="text-3xl font-bold">$19</span>
                      <span className="text-gray-500 ml-1">/month</span>
                    </div>
                    <p className="text-gray-600 mt-3">Complete career preparation</p>
                  </div>
                  
                  <ul className="space-y-3 mb-8 flex-grow">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-scanmatch-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Everything in Pro, plus:</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-scanmatch-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span>AI interview coach</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-scanmatch-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Resume rewrite AI</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-scanmatch-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Portfolio export</span>
                    </li>
                  </ul>
                  
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/pricing">Get Premium</Link>
                  </Button>
                </div>
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
