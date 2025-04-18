import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, BookOpen, GraduationCap, Code, ArrowRight, Clock, ExternalLink, FileText, Award } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from "@/components/ui/sonner";
import ProgressTracker from '@/components/ProgressTracker';
import LearningContextNote from '@/components/LearningContextNote';

const LEARNING_RESOURCES = [
  {
    id: 1,
    title: "SQL Fundamentals",
    provider: "DataCamp",
    category: "technical",
    skillLevel: "beginner",
    estimatedHours: 6,
    url: "https://www.datacamp.com/courses/introduction-to-sql",
    description: "Learn the basics of SQL querying with hands-on exercises",
    image: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=600",
    completed: false
  },
  {
    id: 2,
    title: "Introduction to Python Programming",
    provider: "Coursera",
    category: "technical",
    skillLevel: "beginner",
    estimatedHours: 15,
    url: "https://www.coursera.org/learn/python",
    description: "A comprehensive introduction to Python programming for beginners",
    image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=600",
    completed: false
  },
  {
    id: 3,
    title: "UX Design Fundamentals",
    provider: "Google",
    category: "design",
    skillLevel: "beginner",
    estimatedHours: 20,
    url: "https://www.coursera.org/professional-certificates/google-ux-design",
    description: "Learn the basics of UX design from industry professionals",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=600",
    completed: false
  },
  {
    id: 4,
    title: "React for Beginners",
    provider: "Frontend Masters",
    category: "technical",
    skillLevel: "intermediate",
    estimatedHours: 10,
    url: "https://frontendmasters.com/courses/react-v7/",
    description: "Build interactive UIs with the React JavaScript library",
    image: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?auto=format&fit=crop&w=600",
    completed: false
  },
  {
    id: 5,
    title: "Business Communication Skills",
    provider: "LinkedIn Learning",
    category: "soft-skills",
    skillLevel: "beginner",
    estimatedHours: 4,
    url: "https://www.linkedin.com/learning/topics/business-communication",
    description: "Improve your communication skills for the workplace",
    image: "https://images.unsplash.com/photo-1573497491208-6b1acb260507?auto=format&fit=crop&w=600",
    completed: false
  },
  {
    id: 6,
    title: "Data Analysis with Excel",
    provider: "Microsoft Learn",
    category: "technical",
    skillLevel: "beginner",
    estimatedHours: 8,
    url: "https://docs.microsoft.com/en-us/learn/modules/analyze-data-with-excel/",
    description: "Learn to analyze and visualize data using Microsoft Excel",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600",
    completed: false
  }
];

const PROJECT_IDEAS = [
  {
    id: 1,
    title: "Personal Portfolio Website",
    category: "web-development",
    difficulty: "beginner",
    estimatedHours: 10,
    skills: ["HTML", "CSS", "JavaScript"],
    description: "Create a responsive portfolio website to showcase your projects and skills",
  },
  {
    id: 2,
    title: "E-commerce Product Page UI",
    category: "design",
    difficulty: "intermediate",
    estimatedHours: 8,
    skills: ["UI Design", "UX Design", "Figma"],
    description: "Design a user-friendly e-commerce product page with a shopping cart feature",
  },
  {
    id: 3,
    title: "Data Analysis Dashboard",
    category: "data",
    difficulty: "intermediate",
    estimatedHours: 15,
    skills: ["Python", "Pandas", "Data Visualization"],
    description: "Create a dashboard to visualize and analyze a dataset of your choice",
  }
];

const Learn = () => {
  const [resources, setResources] = useState(LEARNING_RESOURCES);
  const [filter, setFilter] = useState('all');
  const [progress, setProgress] = useState(0);
  const { user } = useAuth();
  const subscription = useSubscription();
  
  useEffect(() => {
    const completedCount = resources.filter(r => r.completed).length;
    const totalCount = resources.length;
    setProgress(totalCount > 0 ? (completedCount / totalCount) * 100 : 0);
  }, [resources]);
  
  const toggleResourceCompletion = (id) => {
    setResources(prevResources => 
      prevResources.map(resource => 
        resource.id === id 
          ? { ...resource, completed: !resource.completed } 
          : resource
      )
    );
    
    const resource = resources.find(r => r.id === id);
    if (!resource.completed) {
      toast.success(`${resource.title} marked as completed!`, {
        description: "Great job! Keep up the momentum.",
      });
    }
  };
  
  const filteredResources = filter === 'all' 
    ? resources 
    : resources.filter(r => r.category === filter);
  
  const canAccessPersonalizedLearning = subscription?.tier !== 'free';
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-grow py-12">
        <div className="container-custom">
          <ProgressTracker currentStep="learn" className="mb-12" />
          
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold">Level Up Your Skills</h1>
            <p className="text-gray-600 mt-2">Build the exact skills employers want to see</p>
          </div>

          <LearningContextNote 
            jobTitle={sessionStorage.getItem('jobTitle') || undefined}
            keywordsMissing={JSON.parse(sessionStorage.getItem('keywordsMissing') || '[]')}
          />
          
          <div className="mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">Learn + Grow</h1>
                <p className="text-gray-600 mt-2">Fill your experience gaps and strengthen your story</p>
              </div>
              
              {user ? (
                <div className="bg-scanmatch-50 rounded-lg px-4 py-3 border border-scanmatch-100">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">Your Learning Progress</span>
                    <Badge variant="outline" className="bg-scanmatch-100 text-scanmatch-800">
                      {Math.round(progress)}% Complete
                    </Badge>
                  </div>
                  <Progress value={progress} className="w-56 h-2" />
                </div>
              ) : (
                <Button className="bg-scanmatch-600 hover:bg-scanmatch-700" asChild>
                  <Link to="/signup">
                    Sign Up to Track Progress
                  </Link>
                </Button>
              )}
            </div>
            
            {!canAccessPersonalizedLearning && (
              <Card className="mb-6 bg-gradient-to-r from-scanmatch-50 to-blue-50 border-scanmatch-100">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <GraduationCap className="h-10 w-10 text-scanmatch-600 flex-shrink-0" />
                      <div>
                        <h3 className="text-lg font-semibold">Upgrade for Personalized Learning Path</h3>
                        <p className="text-gray-600">Get a tailored learning roadmap based on your resume and career goals</p>
                      </div>
                    </div>
                    <Button className="bg-scanmatch-600 hover:bg-scanmatch-700" asChild>
                      <Link to="/pricing">Upgrade Now</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Tabs defaultValue="resources" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="resources">Learning Resources</TabsTrigger>
                <TabsTrigger value="projects">Starter Projects</TabsTrigger>
              </TabsList>
              
              <TabsContent value="resources">
                <div className="mb-6">
                  <div className="flex gap-2 mb-4 flex-wrap">
                    <Button 
                      variant={filter === 'all' ? "default" : "outline"} 
                      onClick={() => setFilter('all')}
                      size="sm"
                    >
                      All
                    </Button>
                    <Button 
                      variant={filter === 'technical' ? "default" : "outline"} 
                      onClick={() => setFilter('technical')}
                      size="sm"
                    >
                      Technical
                    </Button>
                    <Button 
                      variant={filter === 'design' ? "default" : "outline"} 
                      onClick={() => setFilter('design')}
                      size="sm"
                    >
                      Design
                    </Button>
                    <Button 
                      variant={filter === 'soft-skills' ? "default" : "outline"} 
                      onClick={() => setFilter('soft-skills')}
                      size="sm"
                    >
                      Soft Skills
                    </Button>
                  </div>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredResources.map(resource => (
                      <Card key={resource.id} className={`hover:shadow-md transition-shadow ${resource.completed ? 'border-green-200 bg-green-50' : ''}`}>
                        <div className="relative h-40 w-full overflow-hidden rounded-t-lg">
                          <img 
                            src={resource.image} 
                            alt={resource.title} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600";
                            }}
                          />
                          <Badge className="absolute top-2 right-2 bg-white text-scanmatch-800">
                            {resource.category}
                          </Badge>
                        </div>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{resource.title}</CardTitle>
                          <CardDescription>{resource.provider}</CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <p className="text-sm text-gray-600 mb-2">{resource.description}</p>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock size={16} className="mr-1" />
                            <span>{resource.estimatedHours} hours</span>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between pt-2">
                          <Button variant="outline" size="sm" asChild>
                            <a href={resource.url} target="_blank" rel="noopener noreferrer">
                              View Course <ExternalLink size={14} className="ml-1" />
                            </a>
                          </Button>
                          
                          <Button 
                            variant={resource.completed ? "default" : "outline"} 
                            size="sm"
                            className={resource.completed ? "bg-green-600 hover:bg-green-700" : ""}
                            onClick={() => toggleResourceCompletion(resource.id)}
                          >
                            {resource.completed ? (
                              <>
                                <CheckCircle size={16} className="mr-1" /> Completed
                              </>
                            ) : "Mark Complete"}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="projects">
                <div className="mb-6">
                  <p className="text-gray-600 mb-4">
                    Build these starter projects to showcase your skills and add to your resume or portfolio.
                  </p>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {PROJECT_IDEAS.map(project => (
                      <Card key={project.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{project.title}</CardTitle>
                            <Badge variant="outline" className="bg-scanmatch-50 text-scanmatch-800">
                              {project.difficulty}
                            </Badge>
                          </div>
                          <CardDescription>
                            <div className="flex items-center">
                              <Code size={16} className="mr-1 text-scanmatch-600" />
                              {project.skills.join(" • ")}
                            </div>
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock size={16} className="mr-1" />
                            <span>Est. {project.estimatedHours} hours</span>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between pt-0">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                          <Button size="sm" className="bg-scanmatch-600 hover:bg-scanmatch-700">
                            Start Project
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="mt-12 text-center">
            <h2 className="text-2xl font-bold mb-3">Ready to Practice for Interviews?</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Apply what you've learned in mock interviews tailored to your resume and target job.
            </p>
            <Button className="bg-scanmatch-600 hover:bg-scanmatch-700" size="lg" asChild>
              <Link to="/interview">
                Start Interview Practice <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Learn;
