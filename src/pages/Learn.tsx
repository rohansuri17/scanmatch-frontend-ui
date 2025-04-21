import React, { useState, useEffect } from "react";
import AICoachAvatar from "@/components/AICoachAvatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, BookOpen, GraduationCap, Code, ArrowRight, Clock, ExternalLink, FileText, Award, Sparkles, AlertTriangle, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from "@/components/ui/sonner";
import ProgressTracker from '@/components/ProgressTracker';
import LearningContextNote from '@/components/LearningContextNote';
import { generateLearningPath, supabase } from '@/lib/supabaseClient';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

interface AnalysisData {
  keywords_missing?: string[];
  structure_improvements?: string[];
  score?: number;
  job_title?: string;
}

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

const RESOURCES = [
  // Add your resources here
];

const Learn = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { tier: currentTier, canAccessAICoach } = useSubscription();
  const [filter, setFilter] = useState('all');
  const [personalizedResources, setPersonalizedResources] = useState<any[]>([]);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [progress, setProgress] = useState(0);
  const [completedResources, setCompletedResources] = useState(new Set());
  const [isLoadingLearningPath, setIsLoadingLearningPath] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecentAnalysis = async () => {
      if (!user) {
        const cachedAnalysis = localStorage.getItem('resumeAnalysis');
        if (cachedAnalysis) {
          try {
            const parsedAnalysis = JSON.parse(cachedAnalysis);
            console.log('Cached analysis:', parsedAnalysis);
            const keywords_missing = typeof parsedAnalysis.keywords_missing === 'string' 
              ? JSON.parse(parsedAnalysis.keywords_missing)
              : parsedAnalysis.keywords_missing;
            const structure_improvements = typeof parsedAnalysis.structure_improvements === 'string'
              ? JSON.parse(parsedAnalysis.structure_improvements)
              : parsedAnalysis.structure_improvements;
            const formattedData: AnalysisData = {
              keywords_missing: Array.isArray(keywords_missing) 
                ? keywords_missing
                : [],
              structure_improvements: Array.isArray(structure_improvements)
                ? structure_improvements
                : [],
              score: parsedAnalysis.score,
              job_title: parsedAnalysis.job_title
            };
            console.log('Formatted data:', formattedData);
            setAnalysisData(formattedData);
            const cachedLearningPath = localStorage.getItem('learningPath');
            if (cachedLearningPath) {
              console.log('Using cached learning path');
              setPersonalizedResources(JSON.parse(cachedLearningPath));
            } else {
              console.log('Generating new learning path from cached analysis');
              try {
                const { data: learningPathData, error: learningPathError } = await supabase.functions.invoke('generate-learning-path', {
                  body: {
                    missingSkills: formattedData.keywords_missing,
                    improvements: formattedData.structure_improvements,
                    userId: 'anonymous'
                  }
                });

                if (learningPathError) {
                  throw learningPathError;
                }

                if (learningPathData && Array.isArray(learningPathData)) {
                  console.log('Generated learning path:', learningPathData);
                  setPersonalizedResources(learningPathData);
                  localStorage.setItem('learningPath', JSON.stringify(learningPathData));
                }
              } catch (error) {
                console.error('Error generating learning path:', error);
                toast.error('Failed to generate learning path');
              }
            }
          } catch (error) {
            console.error('Error parsing cached analysis:', error);
            toast.error('Failed to load cached analysis');
          }
        }
        return;
      }

      const { data, error } = await supabase
        .from('resume_analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching analysis:', error);
        return;
      }

      if (data) {
        const keywords_missing = typeof data.keywords_missing === 'string' 
          ? JSON.parse(data.keywords_missing)
          : data.keywords_missing;
        
        const structure_improvements = typeof data.structure_improvements === 'string'
          ? JSON.parse(data.structure_improvements)
          : data.structure_improvements;

        const formattedData: AnalysisData = {
          keywords_missing: Array.isArray(keywords_missing) 
            ? keywords_missing
            : [],
          structure_improvements: Array.isArray(structure_improvements)
            ? structure_improvements
            : [],
          score: data.score,
          job_title: data.job_title
        };
        setAnalysisData(formattedData);

        const cacheKey = `learningPath-${user.id}`;
        const cachedLearningPath = localStorage.getItem(cacheKey);
        if (cachedLearningPath) {
          console.log('Using cached learning path for user:', user.id);
          setPersonalizedResources(JSON.parse(cachedLearningPath));
        } else {
          console.log('Generating new learning path for user:', user.id);
          try {
            const { data: learningPathData, error: learningPathError } = await supabase.functions.invoke('generate-learning-path', {
              body: {
                missingSkills: formattedData.keywords_missing,
                improvements: formattedData.structure_improvements,
                userId: user.id
              }
            });

            if (learningPathError) {
              throw learningPathError;
            }

            if (learningPathData && Array.isArray(learningPathData)) {
              console.log('Generated learning path for user:', learningPathData);
              setPersonalizedResources(learningPathData);
              localStorage.setItem(cacheKey, JSON.stringify(learningPathData));
            }
          } catch (error) {
            console.error('Error generating learning path:', error);
            toast.error('Failed to generate learning path');
          }
        }
      }
    };

    fetchRecentAnalysis();
  }, [user]);

  useEffect(() => {
    if (personalizedResources && personalizedResources.length > 0) {
      setIsLoadingLearningPath(false);
    }
  }, [personalizedResources]);

  useEffect(() => {
    if (personalizedResources) {
      const completedCount = personalizedResources.filter((r: any) => r.completed).length;
      const totalCount = personalizedResources.length;
      setProgress(totalCount > 0 ? (completedCount / totalCount) * 100 : 0);
    }
  }, [personalizedResources]);

  const renderResourceCard = (resource: any) => (
    <Card key={resource.id} className="flex flex-col group hover:shadow-md transition-all">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {resource.provider}
            </Badge>
            <Badge variant="secondary" className="text-xs bg-scanmatch-50 text-scanmatch-700">
              <Sparkles className="h-3 w-3 mr-1" />
              Recommended
            </Badge>
          </div>
          {resource.completed && (
            <Badge variant="default" className="bg-green-500">
              <CheckCircle className="h-3 w-3 mr-1" />
              Completed
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg group-hover:text-scanmatch-600 transition-colors">
          {resource.title}
        </CardTitle>
        <CardDescription>{resource.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge 
            variant="secondary" 
            className={`text-xs ${
              resource.skillLevel === "beginner" ? "bg-green-50 text-green-700" :
              resource.skillLevel === "intermediate" ? "bg-blue-50 text-blue-700" :
              "bg-purple-50 text-purple-700"
            }`}
          >
            {resource.skillLevel}
          </Badge>
          <Badge variant="secondary" className="text-xs flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {resource.estimatedHours}h
          </Badge>
        </div>
        {resource.relatedSkills && (
          <div className="flex flex-wrap gap-1">
            {resource.relatedSkills.map((skill: string, index: number) => (
              <Badge key={`${resource.id}-skill-${index}`} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" asChild>
          <a href={resource.url} target="_blank" rel="noopener noreferrer">
            Start Learning
            <ExternalLink className="h-4 w-4 ml-2" />
          </a>
        </Button>
        {user && (
          <Button
            variant={resource.completed ? "default" : "secondary"}
            size="sm"
            className={resource.completed ? "bg-green-500 hover:bg-green-600" : ""}
            onClick={() => toggleResourceCompletion(resource.id)}
          >
            {resource.completed ? <CheckCircle className="h-4 w-4" /> : "Mark Done"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );

  const toggleResourceCompletion = (id: string) => {
    toast.success("Progress saved!", {
      description: "Your learning progress has been updated.",
    });
  };

  const filteredResources = personalizedResources.filter(resource => {
    if (filter === 'all') return true;
    return resource.category === filter;
  });

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-grow py-12">
          <div className="container-custom">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
              <div className="h-64 w-full max-w-3xl bg-gray-200 rounded"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavBar />
      <main className="flex-grow container-custom py-8">
        <ProgressTracker currentStep="learn" className="mb-6" />
        <div className="mb-8">
          <AICoachAvatar message="Here's your personalized learning path! Level up your skills—I'm cheering for you every step." />
        </div>
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="outline" size="sm" asChild>
              <Link to="/results">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Results
              </Link>
            </Button>
            
            <Button variant="outline" size="sm" asChild>
              <Link to="/scan">
                <FileText className="h-4 w-4 mr-1" />
                Analyze New Resume
              </Link>
            </Button>
            
            <div className="text-xs text-gray-500 flex items-center">
              <span className="bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center mr-1">1</span>
              Upload
              <ChevronRight className="h-4 w-4 mx-1" />
              <span className="bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center mr-1">2</span>
              Results
              <ChevronRight className="h-4 w-4 mx-1" />
              <span className="bg-scanmatch-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-1">3</span>
              Learn
            </div>
          </div>
          
          <h1 className="text-3xl font-bold mb-1">Personalized Learning Path</h1>
          <p className="text-gray-600">Resources tailored to help you improve your resume</p>
        </div>

        {analysisData && (
          <Card className="mb-8 bg-scanmatch-50 border-scanmatch-100">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="font-medium text-scanmatch-800 mb-2">Missing Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysisData.keywords_missing?.slice(0, 5).map((skill: any, index: number) => (
                      <Badge key={`missing-skill-${index}`} variant="secondary" className="bg-white">
                        {typeof skill === 'object' ? skill.word : skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-scanmatch-800 mb-2">Areas to Improve</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysisData.structure_improvements?.slice(0, 3).map((improvement: any, index: number) => (
                      <Badge key={`improvement-${index}`} variant="secondary" className="bg-white">
                        {typeof improvement === 'object' ? improvement.word : improvement}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-scanmatch-800 mb-2">Match Score</h3>
                  <div className="text-3xl font-bold text-scanmatch-600">
                    {analysisData.score}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {user ? (
          <>
            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">{Math.round(progress)}%</CardTitle>
                  <CardDescription>Learning Progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={progress} className="h-2" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">
                    {personalizedResources?.filter((r: any) => r.completed).length || 0}
                  </CardTitle>
                  <CardDescription>Courses Completed</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">
                    {personalizedResources?.length || 0}
                  </CardTitle>
                  <CardDescription>Personalized Recommendations</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">
                    {PROJECT_IDEAS.length}
                  </CardTitle>
                  <CardDescription>Practice Projects</CardDescription>
                </CardHeader>
              </Card>
            </div>

            {!canAccessAICoach && (
              <Card className="mb-8 bg-gradient-to-r from-scanmatch-50 to-blue-50 border-scanmatch-100">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Sparkles className="h-10 w-10 text-scanmatch-600 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold">Unlock AI-Powered Learning Paths</h3>
                      <p className="text-gray-600 mb-4">
                        Upgrade to get personalized course recommendations based on your resume analysis.
                      </p>
                      <Button className="bg-scanmatch-600 hover:bg-scanmatch-700" asChild>
                        <Link to="/pricing">Upgrade Now</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {canAccessAICoach && (
              <Card className="mb-8">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="animate-spin">
                      <Sparkles className="h-6 w-6 text-scanmatch-600" />
                    </div>
                    <p>Generating personalized learning recommendations...</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card className="mb-8 bg-gradient-to-r from-scanmatch-50 to-blue-50 border-scanmatch-100">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <GraduationCap className="h-10 w-10 text-scanmatch-600 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold">Track Your Learning Progress</h3>
                  <p className="text-gray-600 mb-4">
                    Sign up to track your progress, get personalized recommendations, and unlock more features.
                  </p>
                  <Button className="bg-scanmatch-600 hover:bg-scanmatch-700" asChild>
                    <Link to="/signup">Get Started</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <LearningContextNote 
          jobTitle={analysisData?.job_title}
          keywordsMissing={analysisData?.keywords_missing || []}
        />
        
        <Tabs defaultValue="resources" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="resources">Learning Resources</TabsTrigger>
            <TabsTrigger value="projects">Practice Projects</TabsTrigger>
          </TabsList>
          
          <TabsContent value="resources">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex gap-2 flex-wrap">
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
                
                {canAccessAICoach && (
                  <div className="text-sm text-scanmatch-600 animate-pulse flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Generating recommendations...
                  </div>
                )}
              </div>

              {personalizedResources?.length === 0 ? (
                <Card className="text-center py-8">
                  <CardContent>
                    <GraduationCap className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Learning Resources Yet</h3>
                    <p className="text-gray-600 mb-4">
                      Complete a resume analysis to get personalized learning recommendations.
                    </p>
                    <Button asChild>
                      <Link to="/scan">Analyze Your Resume</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredResources.map((resource) => renderResourceCard(resource))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="projects">
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Build these starter projects to showcase your skills and add to your portfolio.
              </p>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {PROJECT_IDEAS.map(project => (
                  <Card key={project.id} className="hover:shadow-md transition-all">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{project.title}</CardTitle>
                        <Badge 
                          variant="outline" 
                          className={
                            project.difficulty === "beginner" ? "bg-green-50 text-green-700" :
                            project.difficulty === "intermediate" ? "bg-blue-50 text-blue-700" :
                            "bg-purple-50 text-purple-700"
                          }
                        >
                          {project.difficulty}
                        </Badge>
                      </div>
                      <CardDescription>
                        <div className="flex items-center">
                          <Code className="h-4 w-4 mr-1 text-scanmatch-600" />
                          {project.skills.join(" • ")}
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Est. {project.estimatedHours} hours</span>
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        View Details
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 bg-scanmatch-600 hover:bg-scanmatch-700"
                      >
                        Start Project
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold mb-3">Ready to Practice for Interviews?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Apply what you've learned in mock interviews tailored to your resume and target job.
          </p>
          <Button className="bg-scanmatch-600 hover:bg-scanmatch-700" size="lg" asChild>
            <Link to="/interview">
              Start Interview Practice
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Learn;
