import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import PaymentSignInForm from './PaymentSignInForm';
import PaymentSignUpForm from './PaymentSignUpForm';
import { useMobileDetection } from '../MobileDetection';

interface PaymentAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  orderId: string;
}

const PaymentAuthModal: React.FC<PaymentAuthModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  orderId 
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const isMobile = useMobileDetection();

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const modalVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.95,
      y: 20
    },
    visible: { 
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: isMobile ? 0.2 : 0.3,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: {
        duration: isMobile ? 0.15 : 0.2,
        ease: "easeIn"
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] overflow-hidden">
          <motion.div
            className="fixed inset-0 bg-black/50"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: isMobile ? 0.2 : 0.3 }}
            onClick={onClose}
          />

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <motion.div
              className="w-full max-w-[440px] bg-gunmetal rounded-sm shadow-luxury"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ willChange: 'transform, opacity' }}
            >
              <div className="flex justify-between items-center p-6 border-b border-gunmetal-light">
                <h2 className="font-heading text-2xl font-bold">
                  {mode === 'signin' ? 'Sign In to Link Order' : 'Create Account to Link Order'}
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6">
                <AnimatePresence mode="wait">
                  {mode === 'signin' ? (
                    <PaymentSignInForm
                      key="signin"
                      onSuccess={onSuccess}
                      onSwitchMode={() => setMode('signup')}
                      orderId={orderId}
                    />
                  ) : (
                    <PaymentSignUpForm
                      key="signup"
                      onSuccess={onSuccess}
                      onSwitchMode={() => setMode('signin')}
                      orderId={orderId}
                    />
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PaymentAuthModal;