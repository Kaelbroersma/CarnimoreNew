import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Truck } from 'lucide-react';
import type { CartItem } from '../../store/cartStore';

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  className?: string;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  items,
  subtotal,
  tax,
  total,
  className = ''
}) => {
  const formatOptionLabel = (key: string, value: any): string => {
    switch (key) {
      case 'caliber':
        return `Caliber: ${value}`;
      case 'colors':
        return `Colors: ${value}`;
      case 'longAction':
        return 'Long Action';
      case 'deluxeVersion':
        return 'Deluxe Version';
      case 'isDirty':
        return 'Extra Cleaning Required';
      case 'size':
        return `Size: ${value}`;
      case 'color':
        return `Color: ${value}`;
      default:
        return '';
    }
  };

  return (
    <motion.div 
      className={`bg-gunmetal p-6 rounded-sm shadow-luxury ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="font-heading text-2xl font-bold mb-6">Order Summary</h2>
      
      <div className="space-y-4 mb-6">
        {items.map((item) => (
          <div key={item.id} className="space-y-2">
            <div className="flex items-start">
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 object-cover rounded-sm"
              />
              <div className="ml-4 flex-1">
                <p className="text-base font-medium">{item.name}</p>
                <p className="text-gray-400">Qty: {item.quantity}</p>
                {item.options && Object.entries(item.options).map(([key, value]) => {
                  if (!value) return null;
                  const label = formatOptionLabel(key, value);
                  if (!label) return null;
                  return (
                    <p key={key} className="text-sm text-gray-400">
                      {label}
                    </p>
                  );
                })}
              </div>
              <p className="text-tan">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gunmetal-light pt-4 space-y-2">
        <div className="flex justify-between text-gray-400">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-400">
          <span>Tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg pt-2 border-t border-gunmetal-light">
          <span>Total</span>
          <span className="text-tan">${total.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-6 space-y-4 text-sm text-gray-400">
        <div className="flex items-center">
          <Shield size={16} className="mr-2 text-tan" />
          <span>Secure checkout</span>
        </div>
        <div className="flex items-center">
          <Truck size={16} className="mr-2 text-tan" />
          <span>Free shipping on all orders</span>
        </div>
      </div>
    </motion.div>
  );
};

export default OrderSummary;