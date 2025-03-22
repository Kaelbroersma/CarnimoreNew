import React from 'react';
import { ChevronRight } from 'lucide-react';
import type { CheckoutStep } from '../../hooks/useCheckoutFlow';

interface CheckoutBreadcrumbsProps {
  steps: CheckoutStep[];
  currentStep: CheckoutStep;
  completedSteps: Set<CheckoutStep>;
  onStepClick: (step: CheckoutStep) => void;
}

const CheckoutBreadcrumbs: React.FC<CheckoutBreadcrumbsProps> = ({
  steps,
  currentStep,
  completedSteps,
  onStepClick
}) => {
  const getStepLabel = (step: CheckoutStep): string => {
    switch (step) {
      case 'contact':
        return 'Contact';
      case 'shipping':
        return 'Shipping';
      case 'ffl':
        return 'FFL Dealer';
      case 'payment':
        return 'Payment';
      default:
        return step;
    }
  };

  return (
    <nav className="flex items-center space-x-2 text-sm mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          {index > 0 && (
            <ChevronRight size={16} className="text-gray-600" />
          )}
          <button
            onClick={() => {
              // Only allow clicking on completed steps or the current step
              if (completedSteps.has(step) || step === currentStep) {
                onStepClick(step);
              }
            }}
            className={`transition-colors ${
              step === currentStep
                ? 'text-tan font-medium'
                : completedSteps.has(step)
                ? 'text-gray-400 hover:text-tan cursor-pointer'
                : 'text-gray-600 cursor-not-allowed'
            }`}
            disabled={!completedSteps.has(step) && step !== currentStep}
          >
            {getStepLabel(step)}
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
};

export default CheckoutBreadcrumbs;