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

  const validateForm = (): boolean => {
    let isValid = true;

    // Validate address
    if (!formData.address?.trim()) {
      isValid = false;
    }

    // Validate city
    if (!formData.city?.trim()) {
      isValid = false;
    }

    // Validate state
    if (!validateState(formData.state)) {
      isValid = false;
    }

    // Validate ZIP code
    if (!formData.zipCode?.trim() || !/^\d{5}$/.test(formData.zipCode)) {
      setZipError('Please enter a valid 5-digit ZIP code');
      isValid = false;
    } else {
      setZipError(null);
    }

    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Normalize data before submitting
    const normalizedData = {
      address: formData.address.trim(),
      city: formData.city.trim(),
      state: formData.state.toUpperCase(),
      zipCode: formData.zipCode.trim()
    };

    onChange(normalizedData);
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
            autoComplete="street-address"
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
            autoComplete="address-level2"
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
              if (value.length === 2) {
                validateState(value);
              }
            }}
            className={`w-full bg-dark-gray border ${stateError ? 'border-red-500' : 'border-gunmetal-light'} rounded-sm px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent uppercase`}
            autoComplete="address-level1"
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
            value={formData.zipCode}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 5);
              onChange({ zipCode: value });
            }}
            className={`w-full bg-dark-gray border ${zipError ? 'border-red-500' : 'border-gunmetal-light'} rounded-sm px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent`}
            autoComplete="postal-code"
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