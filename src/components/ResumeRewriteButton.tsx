import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, FileText, Sparkles } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/lib/supabaseClient";
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface ResumeRewriteButtonProps {
  resumeText: string;
  jobDescription: string;
  analysisData: any;
}

const PaymentForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success`,
      },
    });

    if (error) {
      toast.error('Payment failed', {
        description: error.message,
      });
    } else {
      onSuccess();
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <Button
        type="submit"
        className="w-full mt-4 bg-scanmatch-600 hover:bg-scanmatch-700"
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          'Pay $7'
        )}
      </Button>
    </form>
  );
};

const ResumeRewriteButton: React.FC<ResumeRewriteButtonProps> = ({ resumeText, jobDescription, analysisData }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const handlePaymentSuccess = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('rewrite-resume', {
        body: {
          resumeText,
          jobDescription,
          analysisData
        }
      });

      if (error) throw error;

      // Create a blob from the PDF data
      const blob = new Blob([data.pdf], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = 'improved-resume.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Resume rewritten successfully!');
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error rewriting resume:', error);
      toast.error('Failed to rewrite resume', {
        description: 'Please try again later'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-payment-intent');
      if (error) throw error;
      setClientSecret(data.clientSecret);
      setIsDialogOpen(true);
    } catch (error) {
      console.error('Error creating payment intent:', error);
      toast.error('Failed to initialize payment', {
        description: 'Please try again later'
      });
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-scanmatch-600 hover:bg-scanmatch-700 text-white shadow-sm hover:shadow-md transition-all whitespace-nowrap"
          onClick={handleOpenDialog}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Rewrite for $7
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Improve Your Resume</DialogTitle>
          <DialogDescription>
            Get an AI-powered rewrite of your resume based on the job description and analysis.
          </DialogDescription>
        </DialogHeader>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-lg">Premium Feature</CardTitle>
            <CardDescription>
              Get your resume professionally rewritten with AI for just $7
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <Sparkles className="h-4 w-4 mr-2 text-scanmatch-600" />
                Incorporates missing keywords
              </li>
              <li className="flex items-center">
                <Sparkles className="h-4 w-4 mr-2 text-scanmatch-600" />
                Improves structure and formatting
              </li>
              <li className="flex items-center">
                <Sparkles className="h-4 w-4 mr-2 text-scanmatch-600" />
                Optimizes for ATS systems
              </li>
              <li className="flex items-center">
                <Sparkles className="h-4 w-4 mr-2 text-scanmatch-600" />
                Delivered as a professional PDF
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            {clientSecret && (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentForm onSuccess={handlePaymentSuccess} />
              </Elements>
            )}
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default ResumeRewriteButton; 