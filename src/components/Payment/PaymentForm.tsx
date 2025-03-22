import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Calendar as CalendarIcon, Lock, AlertCircle, MapPin } from 'lucide-react';
import Button from '../Button';
import type { PaymentFormData } from '../../types/payment';

interface PaymentFormProps {
  onSubmit: (paymentData: PaymentFormData) => Promise<void>;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<PaymentFormData>({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    nameOnCard: '',
    billingAddress: {
      address: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stateError, setStateError] = useState<string | null>(null);
  const [zipError, setZipError] = useState<string | null>(null);

  // Generate month options
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = (i + 1).toString().padStart(2, '0');
    return { value: month, label: month };
  });

  // Generate year options (current year + 10 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => {
    const year = (currentYear + i).toString();
    return { value: year, label: year };
  });

  const US_STATES = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  const validateState = (state: string): boolean => {
    if (!state) return false;
    const upperState = state.toUpperCase();
    if (!US_STATES.includes(upperState)) {
      setStateError('Please enter a valid 2-letter state abbreviation (e.g., AZ for Arizona)');
      return false;
    }
    setStateError(null);
    return true;
  };

  const validateZipCode = (zip: string): boolean => {
    if (!zip || !/^\d{5}$/.test(zip)) {
      setZipError('Please enter a valid 5-digit ZIP code');
      return false;
    }
    setZipError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate billing address
      if (!formData.billingAddress.address?.trim()) {
        throw new Error('Billing address is required');
      }
      if (!formData.billingAddress.city?.trim()) {
        throw new Error('City is required');
      }
      if (!validateState(formData.billingAddress.state)) {
        throw new Error('Valid state is required');
      }
      if (!validateZipCode(formData.billingAddress.zipCode)) {
        throw new Error('Valid ZIP code is required');
      }

      // Format card number by removing spaces
      const cardNumber = formData.cardNumber.replace(/\s+/g, '');
      
      // Validate card number
      if (!/^\d{15,16}$/.test(cardNumber)) {
        throw new Error('Invalid card number');
      }
      
      // Validate expiry date
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const expMonth = parseInt(formData.expiryMonth);
      const expYear = parseInt(formData.expiryYear);
      
      if (expYear < currentYear || 
          (expYear === currentYear && expMonth < currentMonth)) {
        throw new Error('Card has expired');
      }
      
      // Validate CVV
      if (!/^\d{3,4}$/.test(formData.cvv)) {
        throw new Error('Invalid CVV');
      }

      // Submit payment data
      await onSubmit({
        ...formData,
        cardNumber,
        billingAddress: {
          ...formData.billingAddress,
          state: formData.billingAddress.state.toUpperCase()
        }
      });
    } catch (error: any) {
      setError(error.message || 'Failed to process payment');
      setLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-sm p-4 flex items-start">
          <AlertCircle className="text-red-400 mr-2 flex-shrink-0 mt-0.5" size={16} />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Name on Card <span className="text-tan">*</span>
        </label>
        <input
          type="text"
          required
          value={formData.nameOnCard}
          onChange={(e) => setFormData(prev => ({ ...prev, nameOnCard: e.target.value }))}
          className="w-full bg-dark-gray border border-gunmetal-light rounded-sm px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent"
        />
      </div>

      <div>
        <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
          <CreditCard size={16} className="mr-2 text-tan" />
          Card Number <span className="text-tan ml-1">*</span>
        </label>
        <input
          type="text"
          required
          maxLength={19}
          placeholder="1234 5678 9012 3456"
          value={formData.cardNumber}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            cardNumber: formatCardNumber(e.target.value)
          }))}
          className="w-full bg-dark-gray border border-gunmetal-light rounded-sm px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
            <CalendarIcon size={16} className="mr-2 text-tan" />
            Expiry Date <span className="text-tan ml-1">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={formData.expiryMonth}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                expiryMonth: e.target.value
              }))}
              className="bg-dark-gray border border-gunmetal-light rounded-sm px-2 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent"
              required
            >
              <option value="">MM</option>
              {months.map(month => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
            <select
              value={formData.expiryYear}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                expiryYear: e.target.value
              }))}
              className="bg-dark-gray border border-gunmetal-light rounded-sm px-2 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent"
              required
            >
              <option value="">YYYY</option>
              {years.map(year => (
                <option key={year.value} value={year.value}>
                  {year.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
            <Lock size={16} className="mr-2 text-tan" />
            CVV <span className="text-tan ml-1">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={4}
            placeholder="123"
            value={formData.cvv}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              cvv: e.target.value.replace(/\D/g, '')
            }))}
            className="w-full bg-dark-gray border border-gunmetal-light rounded-sm px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent"
          />
        </div>
      </div>

      {/* Billing Address Section */}
      <div className="border-t border-gunmetal-light pt-6">
        <h3 className="font-heading text-lg font-bold mb-4">Billing Address</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Street Address <span className="text-tan">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={formData.billingAddress.address}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  billingAddress: {
                    ...prev.billingAddress,
                    address: e.target.value
                  }
                }))}
                className="w-full bg-dark-gray border border-gunmetal-light rounded-sm pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent"
                autoComplete="billing street-address"
              />
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                City <span className="text-tan">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.billingAddress.city}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  billingAddress: {
                    ...prev.billingAddress,
                    city: e.target.value
                  }
                }))}
                className="w-full bg-dark-gray border border-gunmetal-light rounded-sm px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent"
                autoComplete="billing address-level2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                State <span className="text-tan">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={2}
                placeholder="AZ"
                value={formData.billingAddress.state}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  setFormData(prev => ({
                    ...prev,
                    billingAddress: {
                      ...prev.billingAddress,
                      state: value
                    }
                  }));
                  if (value.length === 2) {
                    validateState(value);
                  }
                }}
                className={`w-full bg-dark-gray border ${stateError ? 'border-red-500' : 'border-gunmetal-light'} rounded-sm px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent uppercase`}
                autoComplete="billing address-level1"
              />
              {stateError && (
                <p className="text-red-500 text-xs mt-1">{stateError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                ZIP <span className="text-tan">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={5}
                pattern="[0-9]{5}"
                value={formData.billingAddress.zipCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                  setFormData(prev => ({
                    ...prev,
                    billingAddress: {
                      ...prev.billingAddress,
                      zipCode: value
                    }
                  }));
                  if (value.length === 5) {
                    validateZipCode(value);
                  }
                }}
                className={`w-full bg-dark-gray border ${zipError ? 'border-red-500' : 'border-gunmetal-light'} rounded-sm px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent`}
                autoComplete="billing postal-code"
              />
              {zipError && (
                <p className="text-red-500 text-xs mt-1">{zipError}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Complete Payment'}
        </Button>
      </div>

      <p className="mt-4 text-sm text-gray-400 text-center">
        Your payment information is securely processed.<br />
        We do not store your card details.
      </p>
    </motion.form>
  );
};

export default PaymentForm;