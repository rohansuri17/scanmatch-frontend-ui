import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { toast } from "@/components/ui/sonner";
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const paymentIntent = searchParams.get('payment_intent');
    const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret');
    const redirectStatus = searchParams.get('redirect_status');

    if (redirectStatus === 'succeeded') {
      toast.success('Payment successful!');
      // Redirect back to results page after 3 seconds
      const timer = setTimeout(() => {
        navigate('/results');
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      toast.error('Payment failed');
      navigate('/results');
    }
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-grow py-12">
        <div className="container-custom">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
              <CardTitle className="text-center">Payment Successful!</CardTitle>
              <CardDescription className="text-center">
                Your resume is being rewritten. You'll be redirected back to the results page shortly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-sm text-gray-500">
                <p>Thank you for your purchase!</p>
                <p className="mt-2">Your improved resume will be downloaded automatically.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentSuccess; 