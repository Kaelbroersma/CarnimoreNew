import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Calendar as CalendarIcon, Lock, AlertCircle } from 'lucide-react';
import Button from '../Button';

interface PaymentFormProps {
  onSubmit: (paymentData: any) => Promise<void>;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    nameOnCard: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await onSubmit(formData);
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

      <div className="mt-8">
        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Complete Order'}
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