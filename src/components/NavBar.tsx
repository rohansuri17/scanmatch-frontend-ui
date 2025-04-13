
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const NavBar = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav className="py-4 border-b border-gray-100 bg-white/90 backdrop-blur-md sticky top-0 z-50">
      <div className="container-custom flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-scanmatch-700 font-display font-bold text-2xl">ScanMatch</span>
        </Link>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-gray-700 hover:text-scanmatch-600 font-medium transition-colors">
            Home
          </Link>
          <Link to="/pricing" className="text-gray-700 hover:text-scanmatch-600 font-medium transition-colors">
            Pricing
          </Link>
          <Button variant="outline" className="ml-4">
            <Link to="/login">Login</Link>
          </Button>
          <Button className="bg-scanmatch-600 hover:bg-scanmatch-700">
            <Link to="/signup">Sign Up</Link>
          </Button>
        </div>
        
        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-16 inset-x-0 bg-white shadow-lg z-50 animate-fade-in">
          <div className="container-custom py-4 flex flex-col space-y-4">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-scanmatch-600 font-medium py-2 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/pricing" 
              className="text-gray-700 hover:text-scanmatch-600 font-medium py-2 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Pricing
            </Link>
            <Link 
              to="/login" 
              className="text-gray-700 hover:text-scanmatch-600 font-medium py-2 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Login
            </Link>
            <Button className="bg-scanmatch-600 hover:bg-scanmatch-700 w-full" onClick={() => setIsOpen(false)}>
              <Link to="/signup" className="w-full">Sign Up</Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
