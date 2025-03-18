import React, { useEffect } from 'react';
import { useLocation, Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Package, ArrowRight, Calendar, Clock } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import Button from '../components/Button';

const PaymentSuccessPage: React.FC = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  const state = location.state as { 
    orderId: string;
    transactionId?: string;
    authCode?: string;
    orderTotal?: number;
    message?: string;
  } | null;

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  // Redirect if accessed directly without state
  if (!state) {
    return <Navigate to="/shop" replace />;
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Calculate estimated delivery date (14 business days from now)
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 14);

  return (
    <div className="pt-24 pb-16 min-h-screen bg-primary">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Success Animation */}
          <motion.div 
            className="text-center mb-12"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="inline-block p-4 bg-green-500/10 rounded-full mb-6">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <motion.h1 
              className="font-heading text-4xl md:text-5xl font-bold mb-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Thank You{user ? `, ${user.user_metadata.first_name}` : ''}!
            </motion.h1>
            <motion.p
              className="text-xl text-gray-300 mb-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Your order has been successfully placed
            </motion.p>
            <motion.p
              className="text-gray-400"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {state.message || "We'll start processing your order right away."}
            </motion.p>
          </motion.div>

          {/* Order Details Card */}
          <motion.div
            className="bg-gunmetal rounded-sm shadow-luxury overflow-hidden mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="p-6 border-b border-gunmetal-light">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-heading text-xl font-bold">Order Details</h2>
                <span className="text-tan">#{state.orderId.slice(0, 8)}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Calendar className="text-tan mr-2" size={18} />
                    <div>
                      <p className="text-sm text-gray-400">Order Date</p>
                      <p className="font-medium">{formatDate(new Date())}</p>
                    </div>
                  </div>
                  {state.transactionId && (
                    <div>
                      <p className="text-sm text-gray-400">Transaction ID</p>
                      <p className="font-medium font-mono">{state.transactionId}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Clock className="text-tan mr-2" size={18} />
                    <div>
                      <p className="text-sm text-gray-400">Estimated Delivery</p>
                      <p className="font-medium">{formatDate(estimatedDelivery)}</p>
                    </div>
                  </div>
                  {state.authCode && (
                    <div>
                      <p className="text-sm text-gray-400">Authorization Code</p>
                      <p className="font-medium font-mono">{state.authCode}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Status */}
            <div className="p-6 bg-gunmetal-dark">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Package className="text-tan mr-2" size={20} />
                  <span className="font-medium">Order Status</span>
                </div>
                <span className="text-green-400">Processing</span>
              </div>
            </div>
          </motion.div>

          {/* Next Steps */}
          <motion.div
            className="text-center space-y-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-gray-300">
              We'll send you an email confirmation with your order details and tracking information once your order ships.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {user ? (
                <Button to="/account/orders" variant="primary">
                  View Order Status
                </Button>
              ) : (
                <Button to="/account" variant="primary">
                  Create Account to Track Orders
                </Button>
              )}
              <Button to="/shop" variant="outline">
                Continue Shopping
              </Button>
            </div>
          </motion.div>

          {/* Help Section */}
          <motion.div
            className="mt-12 text-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <p className="text-gray-400 mb-2">Need help with your order?</p>
            <Link 
              to="/contact" 
              className="text-tan hover:text-tan/80 transition-colors inline-flex items-center"
            >
              Contact Support
              <ArrowRight size={16} className="ml-1" />
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;