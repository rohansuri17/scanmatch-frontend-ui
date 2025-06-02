
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

const AICoachPreview = () => {
  const { user } = useAuth();
  const { tier } = useSubscription();
  const canAccess = user && (tier === 'pro' || tier === 'premium');
  
  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-lg p-3 border">
        <div className="flex items-start gap-3 mb-3">
          <div className="bg-scanmatch-100 rounded-full p-2 h-8 w-8 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="h-4 w-4 text-scanmatch-600" />
          </div>
          <div className="text-sm text-gray-700">
            <p className="font-medium text-gray-900 mb-1">AI Coach</p>
            <p>How can I improve my resume to highlight my transferable skills from my retail experience?</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 rounded-full p-2 h-8 w-8 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-sm text-gray-700">
            <p className="font-medium text-gray-900 mb-1">AI Coach</p>
            <p>Great question! Retail experience provides valuable transferable skills. Focus on:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Customer service → client relationship management</li>
              <li>Sales targets → results-oriented achievements</li>
              <li>Team coordination → collaborative project skills</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="relative">
        <Input 
          placeholder="Ask about improving your resume..." 
          disabled={!canAccess}
          className="pr-10"
        />
        <Button 
          size="sm" 
          variant="ghost" 
          className="absolute right-1 top-1/2 -translate-y-1/2" 
          disabled={!canAccess}
        >
          <Send className="h-4 w-4" />
        </Button>
        
        {!canAccess && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-md z-10">
            <div className="text-center p-2">
              <Lock className="h-5 w-5 mx-auto mb-1 text-scanmatch-600" />
              <p className="text-sm font-medium text-gray-800 mb-1">Pro Feature</p>
              <Button size="sm" variant="default" className="bg-scanmatch-600" asChild>
                <Link to="/pricing">Upgrade Now</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <p className="text-xs text-gray-500">
        Our AI coach can help you optimize your experience, highlight relevant skills, and address gaps.
      </p>
    </div>
  );
};

export default AICoachPreview;
