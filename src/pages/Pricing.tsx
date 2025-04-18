
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import PricingPlan from '@/components/PricingPlan';
import PricingFAQ from '@/components/PricingFAQ';
import EnterprisePricing from '@/components/EnterprisePricing';

// Pricing plan data
const pricingPlans = [
  {
    name: "Free",
    price: "0",
    description: "Basic resume matching for job seekers",
    features: [
      "Resume to job description matching",
      "Basic keyword analysis",
      "Structure suggestions",
      "Limited to 5 scans per month"
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
      "Detailed keyword analysis",
      "In-depth structure feedback",
      "Save analyses to your account",
      "1 professional resume rewrite",
      "Cover letter suggestions",
      "Basic interview practice",
      "Learning path suggestions"
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
      "3 professional resume rewrites",
      "3 custom cover letters",
      "Human Recruiter Revision",
      "LinkedIn profile optimization",
      "Priority support",
      "Advanced interview practice",
      "Full learning resources access"
    ],
    buttonText: "Upgrade to Premium",
    buttonLink: "/signup",
    tier: "premium",
    highlighted: false
  }
];

const Pricing = () => {
  const { user, isLoading } = useAuth();
  const { tier: currentTier } = useSubscription();
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubscribe = async (tier: string) => {
    if (!user) {
      // Redirect to signup
      navigate('/signup?redirect=pricing&plan=' + tier);
      return;
    }

    if (tier === 'free') {
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
                {...plan}
                currentTier={currentTier}
                handleSubscribe={handleSubscribe}
                isProcessing={isProcessing}
              />
            ))}
          </div>
          
          <EnterprisePricing />
          <PricingFAQ />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Pricing;
