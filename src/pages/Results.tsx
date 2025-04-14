
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Check, ChevronDown, ChevronUp, File, Star, XCircle, Zap, Search, LayoutTemplate, Sparkles, Lock, Save } from "lucide-react";
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';

// Simulated data (would normally come from API)
const matchData = {
  score: 78,
  keywords: {
    found: [
      "project management",
      "team leadership",
      "stakeholder communication",
      "agile methodology",
      "budget management",
      "presentation skills"
    ],
    missing: [
      "data analysis",
      "SQL",
      "Power BI",
      "risk management",
      "PMP certification"
    ]
  },
  structure: {
    strengths: [
      "Appropriate resume length (1 page)",
      "Clear contact information",
      "Well-organized education section",
      "Good use of action verbs"
    ],
    improvements: [
      "Add a dedicated skills section",
      "More quantifiable achievements needed",
      "Consider adding certifications section",
      "Work experience bullet points are too long"
    ]
  }
};

// Chat component
const AIResumeCoach = () => {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "Hi there! I'm your AI Resume Coach. How can I help improve your resume today?", 
      sender: "ai" 
    },
    {
      id: 2,
      text: "Can you make my summary more results-driven?",
      sender: "user"
    },
    {
      id: 3,
      text: "Sure! Here's a more results-driven summary: 'Results-focused Project Manager who delivered 15+ projects under budget while increasing team productivity by 22%. Proven track record of streamlining processes and exceeding client expectations across diverse industries.'",
      sender: "ai"
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    const userMessage = {
      id: messages.length + 1,
      text: newMessage,
      sender: "user"
    };
    
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsSending(true);
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        text: "Based on your resume and the job description, I'd recommend highlighting more quantifiable achievements. For example, instead of 'Led a team', try 'Led a team of 5 developers that delivered a project 10% under budget'.",
        sender: "ai"
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsSending(false);
    }, 1500);
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-xl font-semibold flex items-center">
          <Zap className="h-5 w-5 mr-2 text-yellow-500" /> 
          AI Resume Coach
        </CardTitle>
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          Coming Soon
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border rounded-lg h-[300px] overflow-y-auto p-4 bg-gray-50">
          <div className="space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.sender === 'user' 
                      ? 'bg-scanmatch-600 text-white' 
                      : 'bg-white border border-gray-200 text-gray-800'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg px-4 py-2 bg-white border border-gray-200">
                  <div className="flex space-x-2">
                    <div className="h-2 w-2 bg-gray-300 rounded-full animate-bounce"></div>
                    <div className="h-2 w-2 bg-gray-300 rounded-full animate-bounce delay-100"></div>
                    <div className="h-2 w-2 bg-gray-300 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-scanmatch-500"
            placeholder="Ask for resume improvement advice..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <Button type="submit" className="bg-scanmatch-600 hover:bg-scanmatch-700">
            Send
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

// Collapsible section component
const CollapsibleSection = ({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <h3 className="font-semibold text-lg flex items-center">
          {icon}
          <span className="ml-2">{title}</span>
        </h3>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {isOpen && <div className="p-4">{children}</div>}
    </div>
  );
};

const Results = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow py-12">
        <div className="container-custom">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">✨ ScanMatch: Get Your Resume Interview-Ready in 60 Seconds</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Upload your resume, paste the job description, and get AI-powered feedback + rewriting suggestions.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Score Card */}
              <Card className="shadow-md border-scanmatch-100">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-semibold">Your Match Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                    <div className="mb-4 md:mb-0 relative">
                      <div className="text-6xl font-bold text-scanmatch-600 flex items-center">
                        {matchData.score}
                        <span className="text-2xl ml-1">%</span>
                      </div>
                      <p className="text-gray-600 mt-1 font-medium">
                        {matchData.score >= 80 
                          ? "Excellent match!" 
                          : matchData.score >= 60 
                            ? "Good match with room for improvement"
                            : "Needs significant improvements"}
                      </p>
                    </div>
                    <div className="w-full md:w-2/3">
                      <Progress value={matchData.score} className="h-4" />
                      <div className="flex justify-between mt-2 text-sm text-gray-500">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <p className="text-gray-800 bg-green-50 p-3 rounded-md border border-green-100">
                      {
                        matchData.score >= 80 
                          ? "Great match! Just a few keywords missing to make your resume perfect."
                          : matchData.score >= 60
                            ? "Good match. With some targeted adjustments, your resume could be a great fit."
                            : "Your resume needs significant improvements to match this job description."
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Keywords Section */}
              <CollapsibleSection 
                title="Keyword Analysis" 
                icon={<Search className="h-5 w-5 text-scanmatch-600" />}
              >
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-medium flex items-center text-green-600 mb-3">
                      <Check className="mr-2" size={20} />
                      Keywords Found ({matchData.keywords.found.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {matchData.keywords.found.map((keyword, index) => (
                        <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
                          ✅ {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="text-lg font-medium flex items-center text-red-600 mb-3">
                      <XCircle className="mr-2" size={20} />
                      Keywords Missing ({matchData.keywords.missing.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {matchData.keywords.missing.map((keyword, index) => (
                        <Badge key={index} variant="outline" className="border-red-200 text-red-700 hover:bg-red-50">
                          ❌ {keyword}
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-4">
                      <p className="text-gray-600 text-sm">
                        <AlertCircle className="inline-block mr-1" size={16} />
                        Including these missing keywords can significantly improve your match score.
                      </p>
                    </div>
                  </div>
                </div>
              </CollapsibleSection>
              
              {/* Structure Section */}
              <CollapsibleSection 
                title="Formatting Suggestions" 
                icon={<LayoutTemplate className="h-5 w-5 text-scanmatch-600" />}
              >
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-medium flex items-center text-green-600 mb-3">
                      <Check className="mr-2" size={20} />
                      Structure Strengths
                    </h4>
                    <ul className="space-y-2">
                      {matchData.structure.strengths.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="text-lg font-medium flex items-center text-amber-600 mb-3">
                      <AlertCircle className="mr-2" size={20} />
                      Suggested Improvements
                    </h4>
                    <ul className="space-y-2">
                      {matchData.structure.improvements.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <File className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CollapsibleSection>
              
              {/* Improvement Opportunities */}
              <CollapsibleSection 
                title="Improvement Opportunities" 
                icon={<Sparkles className="h-5 w-5 text-scanmatch-600" />}
              >
                <div className="space-y-4">
                  <p className="text-gray-700">
                    Based on our analysis, here are personalized improvement opportunities for your resume:
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start p-2 bg-blue-50 rounded-md">
                      <span className="font-medium mr-2">1.</span>
                      <span>Add a dedicated Skills section that includes the missing keywords we identified.</span>
                    </li>
                    <li className="flex items-start p-2 bg-blue-50 rounded-md">
                      <span className="font-medium mr-2">2.</span>
                      <span>Include more quantifiable achievements in your work experience section.</span>
                    </li>
                    <li className="flex items-start p-2 bg-blue-50 rounded-md">
                      <span className="font-medium mr-2">3.</span>
                      <span>Shorten your work experience bullet points - aim for 1-2 lines each.</span>
                    </li>
                    <li className="flex items-start p-2 bg-blue-50 rounded-md">
                      <span className="font-medium mr-2">4.</span>
                      <span>Add any relevant certifications to strengthen your qualifications.</span>
                    </li>
                  </ul>
                </div>
              </CollapsibleSection>
              
              {/* CTA */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-scanmatch-50 border-scanmatch-200 shadow-md">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                      <div className="flex justify-center">
                        <Lock className="h-8 w-8 text-scanmatch-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-scanmatch-800">Unlock Full Resume Rewrite</h3>
                      <p className="text-scanmatch-700">
                        Get a complete professional resume rewrite tailored specifically for this job for just $7
                      </p>
                      <Button className="bg-scanmatch-600 hover:bg-scanmatch-700 w-full">
                        <Link to="/pricing">Upgrade Now</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-50 border-gray-200 shadow-md">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                      <div className="flex justify-center">
                        <Save className="h-8 w-8 text-gray-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800">Save This Analysis</h3>
                      <p className="text-gray-700">
                        Create a free account to save this analysis and track your progress
                      </p>
                      <Button variant="outline" className="w-full border-scanmatch-200 text-scanmatch-700 hover:bg-scanmatch-50">
                        <Link to="/signup">Save Analysis</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Resume Coach */}
            <div className="lg:col-span-1">
              <AIResumeCoach />
              
              {/* Testimonial */}
              <Card className="mt-8 bg-gray-50 border-gray-200 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <div className="mr-4">
                      <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center text-gray-600 font-medium border">
                        MM
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold">Michael Martinez</h4>
                      <p className="text-sm text-gray-500">Data Scientist</p>
                    </div>
                  </div>
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm italic">
                    "The AI Coach helped me completely transform my resume. It suggested specific improvements that helped me land interviews at top tech companies."
                  </p>
                </CardContent>
              </Card>
              
              {/* Usage Stats */}
              <Card className="mt-4 border border-scanmatch-100 bg-white shadow-sm">
                <CardContent className="pt-6">
                  <h4 className="font-semibold text-center mb-4">Trusted by Job Seekers</h4>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-scanmatch-50 p-3 rounded-lg">
                      <div className="text-xl font-bold text-scanmatch-700">100+</div>
                      <div className="text-xs text-gray-600">Job Seekers</div>
                    </div>
                    <div className="bg-scanmatch-50 p-3 rounded-lg">
                      <div className="text-xl font-bold text-scanmatch-700">82%</div>
                      <div className="text-xs text-gray-600">Interview Rate</div>
                    </div>
                  </div>
                  <p className="text-xs text-center text-gray-500 mt-4">
                    "Helped me land 4 interviews in 2 weeks!"
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Results;
