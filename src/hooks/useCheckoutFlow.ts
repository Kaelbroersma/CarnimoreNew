import { useState, useEffect } from 'react';
import { useCartStore } from '../store/cartStore';

type CheckoutStep = 'contact' | 'shipping' | 'ffl' | 'payment';

export const useCheckoutFlow = () => {
  const { items, requiresFFL, hasNonFFLItems } = useCartStore();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('contact');
  const [completedSteps, setCompletedSteps] = useState<Set<CheckoutStep>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeFlow = async () => {
      try {
        setLoading(true);
        const needsFFL = await requiresFFL();
        const needsShipping = await hasNonFFLItems();

        // Define available steps based on cart contents
        const steps: CheckoutStep[] = ['contact'];
        if (needsFFL) steps.push('ffl');
        if (needsShipping) steps.push('shipping');
        steps.push('payment');

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

  const getNextStep = async (currentStep: CheckoutStep): Promise<CheckoutStep | null> => {
    const needsFFL = await requiresFFL();
    const needsShipping = await hasNonFFLItems();

    switch (currentStep) {
      case 'contact':
        return needsFFL ? 'ffl' : needsShipping ? 'shipping' : 'payment';
      case 'ffl':
        return needsShipping ? 'shipping' : 'payment';
      case 'shipping':
        return 'payment';
      case 'payment':
        return null;
      default:
        return null;
    }
  };

  const markStepComplete = (step: CheckoutStep) => {
    setCompletedSteps(prev => new Set([...prev, step]));
  };

  const goToNextStep = async () => {
    const nextStep = await getNextStep(currentStep);
    if (nextStep) {
      markStepComplete(currentStep);
      setCurrentStep(nextStep);
    }
  };

  return {
    currentStep,
    completedSteps,
    loading,
    error,
    markStepComplete,
    goToNextStep,
    setCurrentStep
  };
};