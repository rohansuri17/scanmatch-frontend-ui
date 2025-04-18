
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, User, ChevronDown, LogOut, Settings, FileText, BookOpen, MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/supabaseClient";
import { toast } from "@/components/ui/sonner";

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  
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
            <Link to="/scan">
              <Button 
                variant={isActive('/scan') ? "default" : "ghost"}
                className={isActive('/scan') ? "bg-scanmatch-100 text-scanmatch-800 hover:bg-scanmatch-200 hover:text-scanmatch-800" : ""}
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
            <Link to="/pricing">
              <Button 
                variant={isActive('/pricing') ? "default" : "ghost"}
                className={isActive('/pricing') ? "bg-scanmatch-100 text-scanmatch-800 hover:bg-scanmatch-200 hover:text-scanmatch-800" : ""}
              >
                Pricing
              </Button>
            </Link>
          </nav>

          {/* User Menu (Desktop) */}
          <div className="hidden md:flex items-center space-x-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <User size={16} />
                    <span className="max-w-[100px] truncate">{user.email}</span>
                    <ChevronDown size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer w-full">
                      <Settings size={16} className="mr-2" /> Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <LogOut size={16} className="mr-2" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link to="/login">Log In</Link>
                </Button>
                <Button className="bg-scanmatch-600 hover:bg-scanmatch-700" asChild>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pt-4 pb-2">
            <nav className="flex flex-col space-y-2">
              <Link to="/" onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  Home
                </Button>
              </Link>
              <Link to="/scan" onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" /> Resume Scan
                </Button>
              </Link>
              <Link to="/learn" onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <BookOpen className="h-4 w-4 mr-2" /> Learn + Grow
                </Button>
              </Link>
              <Link to="/interview" onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" /> Interview Practice
                </Button>
              </Link>
              <Link to="/pricing" onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  Pricing
                </Button>
              </Link>
              
              <div className="pt-2 border-t border-gray-100">
                {user ? (
                  <>
                    <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <Settings className="h-4 w-4 mr-2" /> Profile
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        handleSignOut();
                        setIsMenuOpen(false);
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" /> Sign Out
                    </Button>
                  </>
                ) : (
                  <div className="flex flex-col space-y-2 pt-2">
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                        Log In
                      </Link>
                    </Button>
                    <Button className="w-full bg-scanmatch-600 hover:bg-scanmatch-700" asChild>
                      <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                        Sign Up
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default NavBar;
