import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { paymentService } from '../services/paymentService';
import type { FFLDealer } from '../components/FFLDealerSearch/FFLDealerSearch';
import CheckoutSteps from '../components/Checkout/CheckoutSteps';
import CheckoutSection from '../components/Checkout/CheckoutSection';
import OrderSummary from '../components/Checkout/OrderSummary';
import ContactForm from '../components/Checkout/ContactForm';
import ShippingForm from '../components/Checkout/ShippingForm';
import { FFLDealerSearch } from '../components/FFLDealerSearch/FFLDealerSearch';
import PaymentForm from '../components/Payment/PaymentForm';
import PaymentProcessingModal from '../components/PaymentProcessingModal';

type CheckoutStep = 'contact' | 'shipping' | 'ffl' | 'payment';

// Categories that require FFL transfer
const FFL_REQUIRED_CATEGORIES = ['carnimore-models', 'barreled-actions', 'nfa'];

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, clearCart } = useCartStore();
  const { user } = useAuthStore();

  // State
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('contact');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'failed'>('pending');
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Data
  const [contactInfo, setContactInfo] = useState({
    firstName: user?.user_metadata?.first_name || '',
    lastName: user?.user_metadata?.last_name || '',
    email: user?.email || '',
    phone: ''
  });

  const [shippingAddress, setShippingAddress] = useState({
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const [selectedFFL, setSelectedFFL] = useState<FFLDealer | null>(null);

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  // Check if cart has items requiring FFL
// Update the hasFirearms check to use the category's ffl_required flag
  const hasFirearms = items.some(item => item.category?.ffl_required);

// Update the hasNonFirearms check to use the category's ffl_required flag  
  const hasNonFirearms = items.some(item => !item.category?.ffl_required);

  // Define checkout steps based on cart contents
  const getSteps = () => {
    const steps = [
      { id: 'contact', label: 'Contact', isActive: currentStep === 'contact', isComplete: currentStep !== 'contact' }
    ];

    // For firearm-only orders, go straight to FFL after contact
    if (hasFirearms && !hasNonFirearms) {
      steps.push(
        { id: 'ffl', label: 'FFL Dealer', isActive: currentStep === 'ffl', isComplete: currentStep !== 'ffl' }
      );
    }
    // For mixed orders or non-firearm orders, include shipping
    else if (hasNonFirearms) {
      steps.push(
        { id: 'shipping', label: 'Shipping', isActive: currentStep === 'shipping', isComplete: currentStep !== 'shipping' }
      );
      // Add FFL step for mixed orders
      if (hasFirearms) {
        steps.push(
          { id: 'ffl', label: 'FFL Dealer', isActive: currentStep === 'ffl', isComplete: currentStep !== 'ffl' }
        );
      }
    }

    // Always add payment as the last step
    steps.push(
      { id: 'payment', label: 'Payment', isActive: currentStep === 'payment', isComplete: false }
    );

    return steps;
  };

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      navigate('/shop');
    }
  }, [items, navigate]);

  const handleContactSubmit = () => {
    // For firearm-only orders, go straight to FFL
    if (hasFirearms && !hasNonFirearms) {
      setCurrentStep('ffl');
    }
    // For mixed or non-firearm orders, go to shipping
    else if (hasNonFirearms) {
      setCurrentStep('shipping');
    }
    // If somehow neither (shouldn't happen), go to payment
    else {
      setCurrentStep('payment');
    }
  };

  const handleShippingSubmit = () => {
    // If order has firearms, go to FFL selection
    if (hasFirearms) {
      setCurrentStep('ffl');
    }
    // Otherwise go straight to payment
    else {
      setCurrentStep('payment');
    }
  };

  const handleFFLSelect = (dealer: FFLDealer) => {
    setSelectedFFL(dealer);
    setCurrentStep('payment');
  };

  const handlePaymentSubmit = async (paymentData: any) => {
    setShowProcessingModal(true);
    setLoading(true);
    setError(null);

    try {
      const result = await paymentService.processPayment({
        ...paymentData,
        orderId: crypto.randomUUID(),
        amount: total,
        items,
        email: contactInfo.email,
        phone: contactInfo.phone,
        shippingAddress: hasNonFirearms ? shippingAddress : undefined,
        fflDealerInfo: hasFirearms ? selectedFFL : undefined
      });

      if (result.error) {
        throw result.error;
      }

      setOrderId(result.data?.orderId);
      setPaymentStatus('pending');
      setPaymentMessage(result.data?.message);

    } catch (error: any) {
      console.error('Payment error:', error);
      setError(error.message);
      setPaymentStatus('failed');
      setPaymentMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Checkout Steps */}
          <div className="mb-12">
            <CheckoutSteps steps={getSteps()} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Contact Information */}
              <CheckoutSection 
                title="Contact Information" 
                isActive={currentStep === 'contact'}
              >
                <ContactForm
                  formData={contactInfo}
                  onChange={setContactInfo}
                  onSubmit={handleContactSubmit}
                  loading={loading}
                />
              </CheckoutSection>

              {/* Shipping Information */}
              {hasNonFirearms && (
                <CheckoutSection
                  title="Shipping Information"
                  isActive={currentStep === 'shipping'}
                >
                  <ShippingForm
                    formData={shippingAddress}
                    onChange={setShippingAddress}
                    onSubmit={handleShippingSubmit}
                    loading={loading}
                  />
                </CheckoutSection>
              )}

              {/* FFL Dealer Selection */}
              {hasFirearms && (
                <CheckoutSection
                  title="FFL Dealer Selection"
                  isActive={currentStep === 'ffl'}
                >
                  <FFLDealerSearch
                    onDealerSelect={handleFFLSelect}
                    className="bg-transparent p-0"
                  />
                </CheckoutSection>
              )}

              {/* Payment Information */}
              <CheckoutSection
                title="Payment Information"
                isActive={currentStep === 'payment'}
              >
                <PaymentForm onSubmit={handlePaymentSubmit} />
              </CheckoutSection>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <OrderSummary
                items={items}
                subtotal={subtotal}
                tax={tax}
                total={total}
                className="lg:sticky lg:top-24"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Processing Modal */}
      <PaymentProcessingModal
        isOpen={showProcessingModal}
        orderId={orderId || ''}
        status={paymentStatus}
        message={paymentMessage}
        onRetry={() => {
          setShowProcessingModal(false);
          setError(null);
          setPaymentStatus('pending');
          setPaymentMessage(null);
        }}
      />
    </div>
  );
};

export default CheckoutPage;