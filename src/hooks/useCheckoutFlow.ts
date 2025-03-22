import { useState, useEffect } from 'react';
import { useCartStore } from '../store/cartStore';

type CheckoutStep = 'contact' | 'shipping' | 'ffl' | 'payment';

export const useCheckoutFlow = () => {
  const { items } = useCartStore();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('contact');
  const [completedSteps, setCompletedSteps] = useState<Set<CheckoutStep>>(new Set());
  const [availableSteps, setAvailableSteps] = useState<CheckoutStep[]>(['contact']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeFlow = async () => {
      try {
        setLoading(true);
        const { requiresFFL, hasNonFFLItems } = useCartStore.getState();
        
        const needsFFL = await requiresFFL();
        const needsShipping = await hasNonFFLItems();

        // Define steps based on cart contents
        const steps: CheckoutStep[] = ['contact'];
        
        // For firearm-only orders: contact -> ffl -> payment
        if (needsFFL && !needsShipping) {
          steps.push('ffl', 'payment');
        }
        // For mixed orders: contact -> shipping -> ffl -> payment
        else if (needsFFL && needsShipping) {
          steps.push('shipping', 'ffl', 'payment');
        }
        // For non-firearm orders: contact -> shipping -> payment
        else if (!needsFFL && needsShipping) {
          steps.push('shipping', 'payment');
        }
        // For edge cases: contact -> payment
        else {
          steps.push('payment');
        }

        setAvailableSteps(steps);
        setCurrentStep('contact');
        setCompletedSteps(new Set());
        setError(null);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    initializeFlow();
  }, [items]);

  const getNextStep = (current: CheckoutStep): CheckoutStep | null => {
    const currentIndex = availableSteps.indexOf(current);
    if (currentIndex === -1 || currentIndex === availableSteps.length - 1) {
      return null;
    }
    return availableSteps[currentIndex + 1];
  };

  const markStepComplete = (step: CheckoutStep) => {
    setCompletedSteps(prev => new Set([...prev, step]));
  };

  const goToNextStep = () => {
    const nextStep = getNextStep(currentStep);
    if (nextStep) {
      markStepComplete(currentStep);
      setCurrentStep(nextStep);
    }
  };

  return {
    currentStep,
    completedSteps,
    availableSteps,
    loading,
    error,
    markStepComplete,
    goToNextStep,
    setCurrentStep
  };
};