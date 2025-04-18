
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check, Loader2 } from "lucide-react";

type PlanFeature = string;

type PricingPlanProps = {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: PlanFeature[];
  buttonText: string;
  buttonLink: string;
  tier: string;
  highlighted?: boolean;
  currentTier: string;
  handleSubscribe: (tier: string) => void;
  isProcessing: boolean;
};

const PricingPlan = ({
  name,
  price,
  period,
  description,
  features,
  buttonText,
  tier,
  highlighted,
  currentTier,
  handleSubscribe,
  isProcessing
}: PricingPlanProps) => {
  const isCurrentPlan = currentTier === tier;

  return (
    <Card className={`flex flex-col h-full ${highlighted ? 'border-scanmatch-500 shadow-lg' : ''} ${isCurrentPlan ? 'ring-2 ring-scanmatch-500' : ''}`}>
      {highlighted && (
        <div className="bg-scanmatch-500 text-white text-center py-1 text-sm font-medium">
          Most Popular
        </div>
      )}
      {isCurrentPlan && (
        <div className="bg-green-500 text-white text-center py-1 text-sm font-medium">
          Current Plan
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-2xl">{name}</CardTitle>
        <div className="flex items-baseline mt-4">
          <span className="text-3xl font-bold">${price}</span>
          {period && (
            <span className="ml-1 text-gray-500">/{period}</span>
          )}
        </div>
        <CardDescription className="mt-2">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-3">
          {features.map((feature, index) => (
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
            className={`w-full ${highlighted ? 'bg-scanmatch-600 hover:bg-scanmatch-700' : ''}`}
            variant={highlighted ? 'default' : 'outline'}
            onClick={() => handleSubscribe(tier)}
            disabled={isProcessing || (tier === 'free' && currentTier === 'free')}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              tier === 'free' ? 'Current Free Plan' : buttonText
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default PricingPlan;
