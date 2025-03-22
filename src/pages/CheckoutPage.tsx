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

  // Check if cart has firearms
  const hasFirearms = items.some(item => 
    item.id.startsWith('CM') || // Carnimore Models
    item.id.startsWith('BA')    // Barreled Actions
  );

  // Check if cart has non-firearm items
  const hasNonFirearms = items.some(item => 
    !item.id.startsWith('CM') && 
    !item.id.startsWith('BA')
  );

  // Define checkout steps based on cart contents
  const steps = [
    { id: 'contact', label: 'Contact', isActive: currentStep === 'contact', isComplete: currentStep !== 'contact' },
    ...(hasNonFirearms ? [{ id: 'shipping', label: 'Shipping', isActive: currentStep === 'shipping', isComplete: currentStep !== 'shipping' }] : []),
    ...(hasFirearms ? [{ id: 'ffl', label: 'FFL Dealer', isActive: currentStep === 'ffl', isComplete: currentStep !== 'ffl' }] : []),
    { id: 'payment', label: 'Payment', isActive: currentStep === 'payment', isComplete: false }
  ];

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      navigate('/shop');
    }
  }, [items, navigate]);

  const handleContactSubmit = () => {
    if (hasNonFirearms) {
      setCurrentStep('shipping');
    } else if (hasFirearms) {
      setCurrentStep('ffl');
    } else {
      setCurrentStep('payment');
    }
  };

  const handleShippingSubmit = () => {
    if (hasFirearms) {
      setCurrentStep('ffl');
    } else {
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
            <CheckoutSteps steps={steps} />
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