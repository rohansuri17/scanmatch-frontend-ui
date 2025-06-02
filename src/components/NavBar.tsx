import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, User, ChevronDown, LogOut, Settings, FileText, BookOpen, MessageSquare, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { signOut, supabase } from "@/lib/supabaseClient";
import { toast } from "@/components/ui/sonner";

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasRecentAnalysis, setHasRecentAnalysis] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkRecentAnalysis = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('resume_analyses')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (error) {
          console.error('Error fetching resume analysis:', error);
          return;
        }
        
        setHasRecentAnalysis(data && data.length > 0);
      }
    };
    
    checkRecentAnalysis();
  }, [user]);
  
  const handleResumeClick = async (e) => {
    if (user && hasRecentAnalysis) {
      e.preventDefault();
      navigate('/results');
    } else {
      // Check localStorage for non-logged-in users
      const cachedAnalysis = localStorage.getItem('resumeAnalysis');
      if (cachedAnalysis) {
        e.preventDefault();
        navigate('/results');
      }
    }
  };
  
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="font-bold text-xl text-scanmatch-600">JobCoach.AI</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link to="/">
              <Button 
                variant={isActive('/') ? "default" : "ghost"} 
                className={isActive('/') ? "bg-scanmatch-100 text-scanmatch-800 hover:bg-scanmatch-200 hover:text-scanmatch-800" : ""}
              >
                Home
              </Button>
            </Link>
            <Link to={hasRecentAnalysis ? "/results" : "/scan"} onClick={handleResumeClick}>
              <Button 
                variant={isActive('/scan') || isActive('/results') ? "default" : "ghost"}
                className={(isActive('/scan') || isActive('/results')) ? "bg-scanmatch-100 text-scanmatch-800 hover:bg-scanmatch-200 hover:text-scanmatch-800" : ""}
              >
                <FileText className="h-4 w-4 mr-1" /> Resume
              </Button>
            </Link>
            <Link to="/learn">
              <Button 
                variant={isActive('/learn') ? "default" : "ghost"}
                className={isActive('/learn') ? "bg-scanmatch-100 text-scanmatch-800 hover:bg-scanmatch-200 hover:text-scanmatch-800" : ""}
              >
                <BookOpen className="h-4 w-4 mr-1" /> Learn
              </Button>
            </Link>
            <Link to="/interview">
              <Button 
                variant={isActive('/interview') ? "default" : "ghost"}
                className={isActive('/interview') ? "bg-scanmatch-100 text-scanmatch-800 hover:bg-scanmatch-200 hover:text-scanmatch-800" : ""}
              >
                <MessageSquare className="h-4 w-4 mr-1" /> Interview
              </Button>
            </Link>
            <Link to="/ai-coach">
              <Button 
                variant={isActive('/ai-coach') ? "default" : "ghost"}
                className={isActive('/ai-coach') ? "bg-scanmatch-100 text-scanmatch-800 hover:bg-scanmatch-200 hover:text-scanmatch-800" : ""}
              >
                <Sparkles className="h-4 w-4 mr-1" /> AI Coach
              </Button>
            </Link>
            <Link to="/pricing">
              <Button 
                variant={isActive('/pricing') ? "default" : "ghost"}
                className={isActive('/pricing') ? "bg-scanmatch-100 text-scanmatch-800 hover:bg-scanmatch-200 hover:text-scanmatch-800" : ""}
              >
                Pricing
              </Button>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-gray-100"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Account</span>
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/signup">
                  <Button>Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 space-y-2">
            <Link to="/" className="block py-2">
              <Button variant="ghost" className="w-full justify-start">
                Home
              </Button>
            </Link>
            <Link to={hasRecentAnalysis ? "/results" : "/scan"} onClick={handleResumeClick} className="block py-2">
              <Button variant="ghost" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" /> Resume
              </Button>
            </Link>
            <Link to="/learn" className="block py-2">
              <Button variant="ghost" className="w-full justify-start">
                <BookOpen className="h-4 w-4 mr-2" /> Learn
              </Button>
            </Link>
            <Link to="/interview" className="block py-2">
              <Button variant="ghost" className="w-full justify-start">
                <MessageSquare className="h-4 w-4 mr-2" /> Interview
              </Button>
            </Link>
            <Link to="/ai-coach" className="block py-2">
              <Button variant="ghost" className="w-full justify-start">
                <Sparkles className="h-4 w-4 mr-2" /> AI Coach
              </Button>
            </Link>
            <Link to="/pricing" className="block py-2">
              <Button variant="ghost" className="w-full justify-start">
                Pricing
              </Button>
            </Link>
            {user ? (
              <>
                <Link to="/profile" className="block py-2">
                  <Button variant="ghost" className="w-full justify-start">
                    <User className="h-4 w-4 mr-2" /> Profile
                  </Button>
                </Link>
                <Link to="/settings" className="block py-2">
                  <Button variant="ghost" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" /> Settings
                  </Button>
                </Link>
                <Button variant="ghost" className="w-full justify-start text-red-600" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" /> Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2">
                  <Button variant="ghost" className="w-full justify-start">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup" className="block py-2">
                  <Button className="w-full justify-start">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default NavBar;
