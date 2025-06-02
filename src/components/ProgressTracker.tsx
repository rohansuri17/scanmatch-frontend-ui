import React from 'react';
import { FileText, GraduationCap, Mic, LucideIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type Step = {
  id: 'resume' | 'learn' | 'interview';
  label: string;
  icon: LucideIcon;
  description: string;
  isCompleted?: boolean;
  isCurrent?: boolean;
};

type Props = {
  currentStep: 'resume' | 'learn' | 'interview';
  className?: string;
};

const ProgressTracker = ({ currentStep, className }: Props) => {
  const steps: Step[] = [
    {
      id: 'resume',
      label: 'Resume',
      description: 'Scan & optimize your resume',
      icon: FileText,
      isCompleted: true,
      isCurrent: currentStep === 'resume'
    },
    {
      id: 'learn',
      label: 'Learn',
      description: 'Build missing skills',
      icon: GraduationCap,
      isCompleted: currentStep === 'interview',
      isCurrent: currentStep === 'learn'
    },
    {
      id: 'interview',
      label: 'Interview',
      description: 'Practice with AI coach',
      icon: Mic,
      isCompleted: false,
      isCurrent: currentStep === 'interview'
    }
  ];

  return (
    <div className={cn("w-full max-w-3xl mx-auto mb-8", className)}>
      <div className="relative flex justify-between">
        {/* Progress Line */}
        <div className="absolute inset-0 flex items-center">
          <div className="h-0.5 w-full bg-gray-200">
            <div 
              className="h-0.5 bg-scanmatch-600 transition-all duration-1000"
              style={{
                width: currentStep === 'resume' ? '0%' :
                       currentStep === 'learn' ? '50%' :
                       '100%'
              }}
            />
          </div>
        </div>
        
        {/* Steps */}
        <TooltipProvider>
          {steps.map((step) => (
            <Tooltip key={step.id}>
              <TooltipTrigger>
                <div className="relative flex flex-col items-center group">
                  <div 
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                      step.isCompleted ? 'bg-scanmatch-600 border-scanmatch-600' :
                      step.isCurrent ? 'bg-white border-scanmatch-600' :
                      'bg-white border-gray-300'
                    )}
                  >
                    <step.icon 
                      className={cn(
                        "h-5 w-5",
                        step.isCompleted ? 'text-white' :
                        step.isCurrent ? 'text-scanmatch-600' :
                        'text-gray-400'
                      )}
                    />
                  </div>
                  <span 
                    className={cn(
                      "mt-2 text-sm font-medium transition-colors duration-300",
                      step.isCompleted || step.isCurrent ? 'text-scanmatch-600' : 'text-gray-500'
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{step.description}</p>
                {step.isCurrent && (
                  <p className="text-xs text-scanmatch-500 mt-1">Current step</p>
                )}
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>
    </div>
  );
};

export default ProgressTracker;
