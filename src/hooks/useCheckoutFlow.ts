import { useState, useEffect } from 'react';
import { useCartStore } from '../store/cartStore';

export type CheckoutStep = 'contact' | 'shipping' | 'ffl' | 'payment';

export interface CheckoutData {
  contact: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  shipping?: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  ffl?: any; // FFL dealer info
}

export const useCheckoutFlow = () => {
  const { items } = useCartStore();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('contact');
  const [completedSteps, setCompletedSteps] = useState<Set<CheckoutStep>>(new Set());
  const [availableSteps, setAvailableSteps] = useState<CheckoutStep[]>(['contact']);
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    contact: {
      firstName: '',
      lastName: '',
      email: '',
      phone: ''
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeFlow = async () => {
      try {
        setLoading(true);
        const { requiresFFL, hasNonFFLItems } = useCartStore.getState();
        
        const needsFFL = await requiresFFL();
        const needsShipping = await hasNonFFLItems();

        console.log('Initializing checkout flow:', {
          timestamp: new Date().toISOString(),
          needsFFL,
          needsShipping,
          items
        });

        // Define steps based on cart contents
        let steps: CheckoutStep[] = ['contact'];
        
        // For firearm-only orders: contact -> ffl -> payment
        if (needsFFL && !needsShipping) {
          steps = ['contact', 'ffl', 'payment'];
        }
        // For mixed orders: contact -> shipping -> ffl -> payment
        else if (needsFFL && needsShipping) {
          steps = ['contact', 'shipping', 'ffl', 'payment'];
        }
        // For non-firearm orders: contact -> shipping -> payment
        else if (!needsFFL && needsShipping) {
          steps = ['contact', 'shipping', 'payment'];
        }
        // For edge cases: contact -> payment
        else {
          steps = ['contact', 'payment'];
        }

        console.log('Checkout flow determined:', {
          timestamp: new Date().toISOString(),
          steps
        });

        setAvailableSteps(steps);
        setCurrentStep('contact');
        setCompletedSteps(new Set());
        setError(null);
      } catch (error: any) {
        console.error('Error initializing checkout flow:', {
          timestamp: new Date().toISOString(),
          error: error.message
        });
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
      console.log('Moving to next step:', {
        timestamp: new Date().toISOString(),
        currentStep,
        nextStep,
        checkoutData
      });
      markStepComplete(currentStep);
      setCurrentStep(nextStep);
    }
  };

  const updateCheckoutData = (step: CheckoutStep, data: any) => {
    setCheckoutData(prev => ({
      ...prev,
      [step]: data
    }));
  };

  const validateStep = (step: CheckoutStep): boolean => {
    switch (step) {
      case 'contact':
        const { firstName, lastName, email, phone } = checkoutData.contact;
        return !!(firstName && lastName && email && phone);
      
      case 'shipping':
        if (!checkoutData.shipping) return false;
        const { address, city, state, zipCode } = checkoutData.shipping;
        return !!(address && city && state && zipCode);
      
      case 'ffl':
        return !!checkoutData.ffl;
      
      case 'payment':
        return true; // Payment validation handled by PaymentForm
      
      default:
        return false;
    }
  };

  return {
    currentStep,
    completedSteps,
    availableSteps,
    checkoutData,
    loading,
    error,
    markStepComplete,
    goToNextStep,
    setCurrentStep,
    updateCheckoutData,
    validateStep
  };
};