import React from 'react';
import { Check, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  title: string;
  completed: boolean;
  current: boolean;
}

interface ProgressStepperProps {
  steps: Step[];
  onStepClick?: (stepIndex: number) => void;
  allowStepNavigation?: boolean;
}

export const ProgressStepper: React.FC<ProgressStepperProps> = ({ 
  steps, 
  onStepClick, 
  allowStepNavigation = false 
}) => {
  const handleStepClick = (stepIndex: number) => {
    if (allowStepNavigation && onStepClick) {
      onStepClick(stepIndex);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 transform hover:scale-110 cursor-pointer",
                  step.completed
                    ? "bg-green-500 border-green-500 text-white shadow-lg"
                    : step.current
                    ? "bg-purple-600 border-purple-600 text-white shadow-lg animate-pulse"
                    : "bg-background border-border text-gray-400 hover:border-gray-400",
                  allowStepNavigation && (step.completed || step.current) && "cursor-pointer"
                )}
                onClick={() => handleStepClick(index)}
              >
                {step.completed ? (
                  <Check className="w-6 h-6" />
                ) : step.current ? (
                  <Clock className="w-6 h-6 animate-spin" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              <span className={cn(
                "mt-3 text-sm font-medium text-center max-w-24",
                step.completed
                  ? "text-green-600"
                  : step.current
                  ? "text-purple-600"
                  : "text-gray-500"
              )}>
                {step.title}
              </span>
              
              {/* Progress indicator */}
              {step.current && (
                <div className="mt-2 w-2 h-2 bg-purple-600 rounded-full animate-bounce" />
              )}
            </div>
            
            {/* Connection line */}
            {index < steps.length - 1 && (
              <div className={cn(
                "flex-1 h-0.5 mx-4 mt-6 transition-all duration-500",
                step.completed
                  ? "bg-green-500"
                  : "bg-gray-300"
              )}>
                <div className={cn(
                  "h-full transition-all duration-1000",
                  step.completed ? "bg-green-500" : "bg-gray-300"
                )} />
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div 
          className="bg-gradient-to-r from-green-500 to-purple-600 h-2 rounded-full transition-all duration-1000 ease-out"
          style={{ 
            width: `${(steps.filter(s => s.completed).length / steps.length) * 100}%` 
          }}
        />
      </div>
      
      {/* Step counter */}
      <div className="text-center text-sm text-text-secondary">
        Step {steps.findIndex(s => s.current) + 1} of {steps.length}
      </div>
    </div>
  );
};
