import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Loader2 } from "lucide-react";
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import ContactSalesForm from '@/components/ContactSalesForm';
import { cn } from '@/lib/utils';

// Pricing plan data
const pricingPlans = [
  {
    name: "Free",
    price: "0",
    description: "Basic resume matching for job seekers",
    features: [
      "5 Resume Scans per month",
      "Basic Keyword Analysis and Match Score",
      "Structure suggestions",
      "Basic Course Recommendations",
      "Pay as you go professional resume rewrite",
      "Pay as you go Human Recruiter Revision"
    ],
    buttonText: "Get Started",
    buttonLink: "/scan",
    tier: "free",
    highlighted: false
  },
  {
    name: "Pro",
    price: "19",
    period: "month",
    description: "Advanced features for serious job seekers",
    features: [
      "Unlimited resume scans",
      "Detailed keyword analysis with Match Score",
      "In-depth Improvement suggestions and Structure Feedback",
      "Save analyses to your account",
      "1 free professional resume rewrite",
      "Pay as you go Human Recruiter Revision"
    ],
    buttonText: "Upgrade to Pro",
    buttonLink: "/signup",
    tier: "pro",
    highlighted: true
  },
  {
    name: "Premium",
    price: "49",
    period: "month",
    description: "Complete package for job search success",
    features: [
      "All Pro features",
      "AI Resume Coach access",
      "Priority support",
      "AI Voice Based Interview preparation",
      "3 professional resume rewrites",
      "1 free Human Recruiter Revision",
    ],
    buttonText: "Upgrade to Premium",
    buttonLink: "/signup",
    tier: "premium",
    highlighted: false
  }
];

const PricingPlan = ({ 
  plan, 
  currentTier, 
  handleSubscribe, 
  isProcessing 
}: { 
  plan: typeof pricingPlans[0], 
  currentTier: string, 
  handleSubscribe: (tier: string) => void,
  isProcessing: boolean
}) => {
  const isCurrentPlan = currentTier === plan.tier;
  
  return (
    <Card 
      className={cn(
        "flex flex-col h-full relative transition-all duration-300 overflow-hidden",
        plan.highlighted ? 'border-scanmatch-500 shadow-lg' : '',
        isCurrentPlan ? 'ring-2 ring-green-500 ring-offset-0 shadow-[0_0_0_2px_rgba(34,197,94,0.1)] scale-[1.02]' : '',
        !isCurrentPlan && !plan.highlighted ? 'hover:border-scanmatch-100 hover:shadow-md' : ''
      )}
    >
      {plan.highlighted && (
        <div className="bg-scanmatch-500 text-white text-center py-1.5 text-sm font-medium -mx-[1px] -mt-[1px]">
          Most Popular
        </div>
      )}
      {isCurrentPlan && (
        <div className="bg-green-500 text-white text-center py-1.5 text-sm font-medium -mx-[1px] -mt-[1px]">
          Current Plan
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
        <div className="flex items-baseline mt-4">
          <span className="text-4xl font-bold tracking-tight">${plan.price}</span>
          {plan.period && (
            <span className="ml-1 text-gray-500 text-lg">/{plan.period}</span>
          )}
        </div>
        <CardDescription className="mt-2 text-gray-600">
          {plan.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex">
              <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        {isCurrentPlan ? (
          <Button 
            className="w-full bg-green-600 hover:bg-green-700" 
            disabled
          >
            Your Current Plan
          </Button>
        ) : (
          <Button 
            className={`w-full ${plan.highlighted ? 'bg-scanmatch-600 hover:bg-scanmatch-700' : ''}`}
            variant={plan.highlighted ? 'default' : 'outline'}
            onClick={() => handleSubscribe(plan.tier)}
            disabled={isProcessing || (plan.tier === 'free' && currentTier === 'free')}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              plan.tier === 'free' ? 'Current Free Plan' : plan.buttonText
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

const Pricing = () => {
  const { user, isLoading } = useAuth(); // Changed 'loading' to 'isLoading' to match useAuth hook
  const { tier: currentTier } = useSubscription();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubscribe = async (tier: string) => {
    if (!user) {
      // Redirect to signup
      navigate('/signup?redirect=pricing&plan=' + tier);
      return;
    }

    if (tier === 'free') {
      // User already on free plan
      toast({
        title: "You're already on the Free plan",
        description: "Enjoy your 5 scans per month",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { tier },
      });

      if (error) throw error;

      if (data?.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Checkout Error",
        description: "There was a problem starting the checkout process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-grow py-16">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the plan that works best for your job search needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <PricingPlan 
                key={index} 
                plan={plan} 
                currentTier={currentTier} 
                handleSubscribe={handleSubscribe}
                isProcessing={isProcessing}
              />
            ))}
          </div>
          
          <div className="mt-16 bg-gray-50 rounded-xl p-8 max-w-3xl mx-auto">
            {!showContactForm ? (
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Enterprise Solutions</h2>
                <p className="text-gray-600 mb-6">
                  Looking for a solution for your recruitment team or career services department?
                  We offer custom enterprise packages with volume discounts.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setShowContactForm(true)}
                >
                  Contact Sales
                </Button>
              </div>
            ) : (
              <ContactSalesForm onCancel={() => setShowContactForm(false)} />
            )}
          </div>
          
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div>
                <h3 className="font-semibold text-lg mb-2">How accurate is the resume matching?</h3>
                <p className="text-gray-600">
                  Our AI-powered system analyzes both your resume and the job description using natural language processing to identify matching keywords, skills, and qualifications with high accuracy.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">What is a professional resume rewrite?</h3>
                <p className="text-gray-600">
                  A professional rewrite includes a complete restructuring of your resume tailored specifically to the job description, enhancing your strengths and addressing any gaps.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Can I cancel my subscription?</h3>
                <p className="text-gray-600">
                  Yes, you can cancel your subscription at any time. You'll continue to have access to your plan features until the end of your billing period.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">How does the AI Resume Coach work?</h3>
                <p className="text-gray-600">
                  The AI Resume Coach is an interactive chat interface that provides personalized advice on improving your resume based on your specific questions and the job requirements.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Pricing;
