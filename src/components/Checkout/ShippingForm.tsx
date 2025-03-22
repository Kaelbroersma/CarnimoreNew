import React, { useState } from 'react';
import { MapPin } from 'lucide-react';
import Button from '../Button';

interface ShippingAddress {
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

interface ShippingFormProps {
  formData: ShippingAddress;
  onChange: (data: Partial<ShippingAddress>) => void;
  onSubmit: () => void;
  loading?: boolean;
}

const ShippingForm: React.FC<ShippingFormProps> = ({
  formData,
  onChange,
  onSubmit,
  loading = false
}) => {
  const [stateError, setStateError] = useState<string | null>(null);
  const [zipError, setZipError] = useState<string | null>(null);

  const US_STATES = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Only validate state and ZIP
    const upperState = formData.state.toUpperCase();
    if (!US_STATES.includes(upperState)) {
      setStateError('Please enter a valid 2-letter state abbreviation (e.g., AZ for Arizona)');
      return;
    }

    if (!/^\d{5}$/.test(formData.zipCode)) {
      setZipError('Please enter a valid 5-digit ZIP code');
      return;
    }

    // If we get here, validation passed
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Street Address <span className="text-tan">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            required
            value={formData.address}
            onChange={(e) => onChange({ address: e.target.value })}
            className="w-full bg-dark-gray border border-gunmetal-light rounded-sm pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent"
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
            value={formData.city}
            onChange={(e) => onChange({ city: e.target.value })}
            className="w-full bg-dark-gray border border-gunmetal-light rounded-sm px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent"
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
            value={formData.state}
            onChange={(e) => {
              const value = e.target.value.toUpperCase();
              onChange({ state: value });
              setStateError(null);
            }}
            className={`w-full bg-dark-gray border ${stateError ? 'border-red-500' : 'border-gunmetal-light'} rounded-sm px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent uppercase`}
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
            value={formData.zipCode}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 5);
              onChange({ zipCode: value });
              setZipError(null);
            }}
            className={`w-full bg-dark-gray border ${zipError ? 'border-red-500' : 'border-gunmetal-light'} rounded-sm px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent`}
          />
          {zipError && (
            <p className="text-red-500 text-xs mt-1">{zipError}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Continue'}
        </Button>
      </div>
    </form>
  );
};

export default ShippingForm;