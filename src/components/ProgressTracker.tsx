
import React from 'react';
import { FileText, GraduationCap, Mic } from "lucide-react";

type Step = {
  id: string;
  label: string;
  icon: React.ElementType;
  isCompleted?: boolean;
  isCurrent?: boolean;
};

type Props = {
  currentStep: 'resume' | 'learn' | 'interview';
};

const ProgressTracker = ({ currentStep }: Props) => {
  const steps: Step[] = [
    {
      id: 'resume',
      label: 'Resume',
      icon: FileText,
      isCompleted: true,
      isCurrent: currentStep === 'resume'
    },
    {
      id: 'learn',
      label: 'Learn',
      icon: GraduationCap,
      isCompleted: currentStep === 'interview',
      isCurrent: currentStep === 'learn'
    },
    {
      id: 'interview',
      label: 'Interview',
      icon: Mic,
      isCompleted: false,
      isCurrent: currentStep === 'interview'
    }
  ];

  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      <div className="relative flex justify-between">
        {/* Progress Line */}
        <div className="absolute inset-0 flex items-center">
          <div className="h-0.5 w-full bg-gray-200">
            <div 
              className="h-0.5 bg-scanmatch-600 transition-all duration-500"
              style={{
                width: currentStep === 'resume' ? '0%' :
                       currentStep === 'learn' ? '50%' :
                       '100%'
              }}
            />
          </div>
        </div>
        
        {/* Steps */}
        {steps.map((step) => (
          <div key={step.id} className="relative flex flex-col items-center">
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                step.isCompleted ? 'bg-scanmatch-600 border-scanmatch-600' :
                step.isCurrent ? 'bg-white border-scanmatch-600' :
                'bg-white border-gray-300'
              }`}
            >
              <step.icon 
                className={`h-5 w-5 ${
                  step.isCompleted ? 'text-white' :
                  step.isCurrent ? 'text-scanmatch-600' :
                  'text-gray-400'
                }`}
              />
            </div>
            <span 
              className={`mt-2 text-sm font-medium ${
                step.isCompleted || step.isCurrent ? 'text-scanmatch-600' : 'text-gray-500'
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressTracker;
