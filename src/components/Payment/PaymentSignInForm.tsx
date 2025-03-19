import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { authService } from '../../services/authService';
import { orderService } from '../../services/orderService';
import { useAuthStore } from '../../store/authStore';
import Button from '../Button';
import { useMobileDetection } from '../MobileDetection';

interface PaymentSignInFormProps {
  onSuccess: () => void;
  onSwitchMode: () => void;
  orderId: string;
}

const PaymentSignInForm: React.FC<PaymentSignInFormProps> = ({ 
  onSuccess, 
  onSwitchMode,
  orderId 
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useMobileDetection();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Sign in the user
      const signInResult = await authService.signIn({
        email: formData.email,
        password: formData.password
      });

      if (signInResult.error) {
        throw signInResult.error;
      }

      // Link the order to the user
      const user = useAuthStore.getState().user;
      if (user) {
        console.log('Attempting to link order:', {
          timestamp: new Date().toISOString(),
          orderId,
          userId: user.id
        });

        const linkResult = await orderService.linkOrderToUser({
          orderId,
          userId: user.id
        });

        if (linkResult.error) {
          throw linkResult.error;
        }
      }

      onSuccess();
    } catch (error: any) {
      console.error('Payment sign in error:', {
        timestamp: new Date().toISOString(),
        error: error.message
      });
      setError(error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const formVariants = {
    hidden: { 
      opacity: 0,
      y: 20
    },
    visible: { 
      opacity: 1,
      y: 0,
      transition: {
        duration: isMobile ? 0.2 : 0.3,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0,
      y: -20,
      transition: {
        duration: isMobile ? 0.15 : 0.2,
        ease: "easeIn"
      }
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      variants={formVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
      style={{ willChange: 'transform, opacity' }}
    >
      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-sm p-3 flex items-start">
          <AlertCircle className="text-red-400 mr-2 flex-shrink-0 mt-0.5" size={16} />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Email Address
        </label>
        <div className="relative">
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full bg-dark-gray border border-gunmetal-light rounded-sm pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent"
          />
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Password
        </label>
        <div className="relative">
          <input
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            className="w-full bg-dark-gray border border-gunmetal-light rounded-sm pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent"
          />
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        fullWidth
        disabled={loading}
      >
        {loading ? 'Signing in...' : 'Sign In & Link Order'}
      </Button>

      <p className="text-center text-sm text-gray-400">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={onSwitchMode}
          className="text-tan hover:underline focus:outline-none"
        >
          Create one
        </button>
      </p>
    </motion.form>
  );
};

export default PaymentSignInForm;