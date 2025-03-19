import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, AlertCircle } from 'lucide-react';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import Button from '../Button';
import { useMobileDetection } from '../MobileDetection';
import { useLocation } from 'react-router-dom';

interface SignUpFormProps {
  onSuccess: () => void;
  onSwitchMode: () => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onSuccess, onSwitchMode }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    acceptedTerms: false,
    acceptMarketing: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useMobileDetection();
  const location = useLocation();

  // Get orderId from location state if we're on payment success page
  const orderId = location.pathname === '/payment/success' ? 
    (location.state as any)?.orderId : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.acceptedTerms) {
      setError('You must accept the Terms of Service to continue');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First sign up the user
      const signUpResult = await authService.signUp({
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        acceptedTerms: formData.acceptedTerms,
        acceptMarketing: formData.acceptMarketing
      });

      if (signUpResult.error) {
        throw signUpResult.error;
      }

      // If we have an orderId and we're on the success page, link the order
      if (orderId && location.pathname === '/payment/success') {
        const user = useAuthStore.getState().user;
        if (user) {
          const linkResult = await authService.linkOrderToUser({
            orderId,
            userId: user.id
          });
          if (linkResult.error) {
            console.error('Failed to link order:', linkResult.error);
            // Don't throw - we still want the sign up to be considered successful
          }
        }
      }

      onSuccess();
    } catch (error: any) {
      console.error('Sign up error:', error);
      setError(error.message || 'Failed to create account');
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            First Name <span className="text-tan">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={formData.first_name}
              onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
              className="w-full bg-dark-gray border border-gunmetal-light rounded-sm pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent"
            />
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Last Name <span className="text-tan">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={formData.last_name}
              onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
              className="w-full bg-dark-gray border border-gunmetal-light rounded-sm pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent"
            />
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Email Address <span className="text-tan">*</span>
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
          Password <span className="text-tan">*</span>
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

      {/* Terms and Marketing Checkboxes */}
      <div className="space-y-3">
        <label className="flex items-start space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.acceptedTerms}
            onChange={(e) => setFormData(prev => ({ ...prev, acceptedTerms: e.target.checked }))}
            className="mt-1 form-checkbox text-tan rounded-sm focus:ring-tan focus:ring-offset-0"
          />
          <span className="text-sm text-gray-300">
            I agree to the <a href="/legal" className="text-tan hover:underline">Terms of Service</a> and{' '}
            <a href="/legal" className="text-tan hover:underline">Privacy Policy</a> <span className="text-tan">*</span>
          </span>
        </label>

        <label className="flex items-start space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.acceptMarketing}
            onChange={(e) => setFormData(prev => ({ ...prev, acceptMarketing: e.target.checked }))}
            className="mt-1 form-checkbox text-tan rounded-sm focus:ring-tan focus:ring-offset-0"
          />
          <span className="text-sm text-gray-300">
            I would like to receive marketing communications about products, services, and events.
          </span>
        </label>
      </div>

      <Button
        type="submit"
        variant="primary"
        fullWidth
        disabled={loading}
      >
        {loading ? 'Creating account...' : 'Create Account'}
      </Button>

      <p className="text-center text-sm text-gray-400">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchMode}
          className="text-tan hover:underline focus:outline-none"
        >
          Sign in
        </button>
      </p>
    </motion.form>
  );
};

export default SignUpForm;