import React from 'react';
import { Check } from 'lucide-react';

interface CheckoutStep {
  id: string;
  label: string;
  isActive: boolean;
  isComplete: boolean;
}

interface CheckoutStepsProps {
  steps: CheckoutStep[];
}

const CheckoutSteps: React.FC<CheckoutStepsProps> = ({ steps }) => {
  return (
    <div className="relative">
      {/* Progress Bar */}
      <div className="absolute top-5 left-0 right-0 h-0.5 bg-gunmetal-light">
        <div 
          className="h-full bg-tan transition-all duration-300"
          style={{
            width: `${(steps.filter(step => step.isComplete).length / (steps.length - 1)) * 100}%`
          }}
        />
      </div>

      {/* Steps */}
      <div className="relative flex justify-between">
        {steps.map((step, index) => (
          <div 
            key={step.id}
            className={`flex flex-col items-center ${index === steps.length - 1 ? '' : 'flex-1'}`}
          >
            {/* Step Circle */}
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                step.isComplete
                  ? 'bg-tan border-tan text-black'
                  : step.isActive
                  ? 'bg-gunmetal border-tan text-tan'
                  : 'bg-gunmetal border-gunmetal-light text-gray-400'
              }`}
            >
              {step.isComplete ? (
                <Check size={20} />
              ) : (
                <span className="font-medium">{index + 1}</span>
              )}
            </div>

            {/* Step Label */}
            <span 
              className={`mt-2 text-sm font-medium transition-colors duration-300 ${
                step.isActive || step.isComplete ? 'text-white' : 'text-gray-400'
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

export default CheckoutSteps;