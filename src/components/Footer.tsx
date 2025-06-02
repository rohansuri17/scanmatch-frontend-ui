
import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <span className="font-bold text-xl text-scanmatch-600">JobCoach.AI</span>
            </Link>
            <p className="text-gray-600 text-sm">
              Your AI Career Mentor — From Resume to Hired.
            </p>
            <div className="text-sm text-gray-500">
              © {new Date().getFullYear()} JobCoach.AI. All rights reserved.
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-4 text-gray-800">Features</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/scan" className="text-gray-600 hover:text-scanmatch-600">
                  Resume Analysis
                </Link>
              </li>
              <li>
                <Link to="/learn" className="text-gray-600 hover:text-scanmatch-600">
                  Learning Path
                </Link>
              </li>
              <li>
                <Link to="/interview" className="text-gray-600 hover:text-scanmatch-600">
                  Interview Practice
                </Link>
              </li>
              <li>
                <Link to="/ai-coach" className="text-gray-600 hover:text-scanmatch-600">
                  AI Career Coach
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-4 text-gray-800">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/pricing" className="text-gray-600 hover:text-scanmatch-600">
                  Pricing
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-scanmatch-600">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-scanmatch-600">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-scanmatch-600">
                  Careers
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-4 text-gray-800">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-600 hover:text-scanmatch-600">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-scanmatch-600">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-scanmatch-600">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-scanmatch-600">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Made for job seekers at all stages. Helping new graduates, career changers, and professionals level up.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
