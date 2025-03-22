import React from 'react';
import { motion } from 'framer-motion';

interface CheckoutSectionProps {
  title: string;
  children: React.ReactNode;
  isActive: boolean;
}

const CheckoutSection: React.FC<CheckoutSectionProps> = ({ title, children, isActive }) => {
  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-gunmetal p-6 rounded-sm shadow-luxury"
    >
      <h2 className="font-heading text-2xl font-bold mb-6">{title}</h2>
      {children}
    </motion.div>
  );
};

export default CheckoutSection;