import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { paymentService } from '../services/paymentService';
import { useCheckoutFlow } from '../hooks/useCheckoutFlow';
import PaymentProcessingModal from '../components/PaymentProcessingModal';
import PaymentAuthModal from '../components/Payment/PaymentAuthModal';
import { useOrderPolling } from '../hooks/useOrderPolling';
import Button from '../components/Button';
import CheckoutSteps from '../components/Checkout/CheckoutSteps';
import CheckoutSection from '../components/Checkout/CheckoutSection';
import OrderSummary from '../components/Checkout/OrderSummary';
import ContactForm from '../components/Checkout/ContactForm';
import ShippingForm from '../components/Checkout/ShippingForm';
import { FFLDealerSearch, type FFLDealer } from '../components/FFLDealerSearch/FFLDealerSearch';
import PaymentForm from '../components/Payment/PaymentForm';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { 
    currentStep, 
    completedSteps,
    availableSteps, 
    checkoutData,
    loading: flowLoading, 
    error: flowError,
    goToNextStep,
    updateCheckoutData,
    validateStep
  } = useCheckoutFlow();

  // Initialize all form states
  const [contactData, setContactData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  const [shippingData, setShippingData] = useState({
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const [fflData, setFflData] = useState<FFLDealer | null>(null);

  const [paymentFormData, setPaymentFormData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    nameOnCard: ''
  });

  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'failed'>('pending');
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<any>(null);

  // Initialize user data if available
  useEffect(() => {
    if (user) {
      setContactData({
        firstName: user.user_metadata?.first_name || '',
        lastName: user.user_metadata?.last_name || '',
        email: user.email || '',
        phone: ''
      });
      updateCheckoutData('contact', {
        firstName: user.user_metadata?.first_name || '',
        lastName: user.user_metadata?.last_name || '',
        email: user.email || '',
        phone: ''
      });
    }
  }, [user]);

  useOrderPolling({
    orderId,
    onStatusChange: (status, message) => {
      setPaymentStatus(status);
      if (message) {
        setPaymentMessage(message);
      }
    }
  });

  if (items.length === 0) {
    return (
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-6">Your Cart is Empty</h1>
            <p className="text-gray-400 mb-8">Add some items to your cart before proceeding to checkout.</p>
            <Button to="/shop" variant="primary">
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleContactSubmit = () => {
    console.log('Contact form submitted:', {
      timestamp: new Date().toISOString(),
      data: contactData
    });
    updateCheckoutData('contact', contactData);
    goToNextStep();
  };

  const handleShippingSubmit = () => {
    console.log('Shipping form submitted:', {
      timestamp: new Date().toISOString(),
      data: shippingData
    });
    updateCheckoutData('shipping', shippingData);
    goToNextStep();
  };

  const handleFFLSelect = (dealer: FFLDealer) => {
    console.log('FFL dealer selected:', {
      timestamp: new Date().toISOString(),
      dealer
    });
    setFflData(dealer);
    updateCheckoutData('ffl', dealer);
    goToNextStep();
  };

  const handlePaymentSubmit = async (formData: any) => {
    setLoading(true);
    setError(null);
    const newOrderId = crypto.randomUUID();
    setOrderId(newOrderId);

    try {
      if (!user) {
        setPaymentData(formData);
        setShowAuthModal(true);
        return;
      }

      const result = await paymentService.processPayment({
        ...formData,
        orderId: newOrderId,
        amount: total,
        items,
        email: contactData.email,
        phone: contactData.phone,
        shippingAddress: shippingData,
        fflDealerInfo: fflData
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      setShowProcessingModal(true);
    } catch (error: any) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    handlePaymentSubmit(paymentData);
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return (
    <div className="pt-24 pb-16">
      <PaymentProcessingModal
        isOpen={showProcessingModal}
        orderId={orderId || ''}
        status={paymentStatus}
        message={paymentMessage || undefined}
        onRetry={() => {
          setShowProcessingModal(false);
          setError(null);
          setPaymentStatus('pending');
          setPaymentMessage(null);
        }}
      />

      <PaymentAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        orderId={orderId || ''}
      />

      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {(error || flowError) && (
            <div className="bg-red-900/30 border border-red-700 rounded-sm p-4 mb-6 flex items-start">
              <AlertCircle className="text-red-400 mr-2 flex-shrink-0 mt-0.5" size={16} />
              <p className="text-red-300">{error || flowError}</p>
            </div>
          )}

          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-400 hover:text-tan transition-colors mb-8"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back
          </button>

          <div className="mb-12">
            <CheckoutSteps
              steps={availableSteps.map(step => ({
                id: step,
                label: step === 'ffl' ? 'FFL Dealer' : step.charAt(0).toUpperCase() + step.slice(1),
                isActive: currentStep === step,
                isComplete: completedSteps.has(step)
              }))}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <CheckoutSection
                title="Contact Information"
                isActive={currentStep === 'contact'}
              >
                <ContactForm
                  formData={contactData}
                  onChange={setContactData}
                  onSubmit={handleContactSubmit}
                  loading={loading}
                />
              </CheckoutSection>

              {availableSteps.includes('shipping') && (
                <CheckoutSection
                  title="Shipping Information"
                  isActive={currentStep === 'shipping'}
                >
                  <ShippingForm
                    formData={shippingData}
                    onChange={setShippingData}
                    onSubmit={handleShippingSubmit}
                    loading={loading}
                  />
                </CheckoutSection>
              )}

              {availableSteps.includes('ffl') && (
                <CheckoutSection
                  title="FFL Dealer Selection"
                  isActive={currentStep === 'ffl'}
                >
                  <FFLDealerSearch
                    onDealerSelect={handleFFLSelect}
                    className="bg-transparent p-0 shadow-none"
                  />
                </CheckoutSection>
              )}

              <CheckoutSection
                title="Payment Information"
                isActive={currentStep === 'payment'}
              >
                <PaymentForm onSubmit={handlePaymentSubmit} />
              </CheckoutSection>
            </div>

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
    </div>
  );
};

export default CheckoutPage;