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
  const [errors, setErrors] = useState<Partial<Record<keyof ShippingAddress, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const US_STATES = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  const validateField = (name: keyof ShippingAddress, value: string): string | null => {
    switch (name) {
      case 'address':
        return !value.trim() ? 'Street address is required' : null;
      case 'city':
        return !value.trim() ? 'City is required' : null;
      case 'state':
        return !value.trim() 
          ? 'State is required'
          : !US_STATES.includes(value.toUpperCase())
          ? 'Please enter a valid 2-letter state code'
          : null;
      case 'zipCode':
        return !value.trim()
          ? 'ZIP code is required'
          : !/^\d{5}$/.test(value)
          ? 'Please enter a valid 5-digit ZIP code'
          : null;
      default:
        return null;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ShippingAddress, string>> = {};
    let isValid = true;

    // Validate each field
    (Object.keys(formData) as Array<keyof ShippingAddress>).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (field: keyof ShippingAddress, value: string) => {
    // Clear error when field is modified
    setErrors(prev => ({ ...prev, [field]: null }));

    // Handle special case for state field
    if (field === 'state') {
      value = value.toUpperCase().slice(0, 2);
    }
    
    // Handle special case for ZIP code
    if (field === 'zipCode') {
      value = value.replace(/\D/g, '').slice(0, 5);
    }

    onChange({ [field]: value });

    // Validate field immediately if there was a previous error
    if (errors[field]) {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (validateForm()) {
        // Ensure all fields are trimmed
        const trimmedData = {
          address: formData.address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim().toUpperCase(),
          zipCode: formData.zipCode.trim()
        };

        // Update form data with trimmed values
        onChange(trimmedData);

        // Call onSubmit
        onSubmit();
      }
    } catch (error) {
      console.error('Error submitting shipping form:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'An error occurred. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Street Address */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Street Address <span className="text-tan">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            className={`w-full bg-dark-gray border ${
              errors.address ? 'border-red-500' : 'border-gunmetal-light'
            } rounded-sm pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent`}
            placeholder="123 Main St"
            required
          />
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        </div>
        {errors.address && (
          <p className="text-red-500 text-xs mt-1">{errors.address}</p>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {/* City */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            City <span className="text-tan">*</span>
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
            className={`w-full bg-dark-gray border ${
              errors.city ? 'border-red-500' : 'border-gunmetal-light'
            } rounded-sm px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent`}
            placeholder="City"
            required
          />
          {errors.city && (
            <p className="text-red-500 text-xs mt-1">{errors.city}</p>
          )}
        </div>

        {/* State */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            State <span className="text-tan">*</span>
          </label>
          <input
            type="text"
            value={formData.state}
            onChange={(e) => handleChange('state', e.target.value)}
            className={`w-full bg-dark-gray border ${
              errors.state ? 'border-red-500' : 'border-gunmetal-light'
            } rounded-sm px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent uppercase`}
            placeholder="AZ"
            maxLength={2}
            required
          />
          {errors.state && (
            <p className="text-red-500 text-xs mt-1">{errors.state}</p>
          )}
        </div>

        {/* ZIP Code */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            ZIP <span className="text-tan">*</span>
          </label>
          <input
            type="text"
            value={formData.zipCode}
            onChange={(e) => handleChange('zipCode', e.target.value)}
            className={`w-full bg-dark-gray border ${
              errors.zipCode ? 'border-red-500' : 'border-gunmetal-light'
            } rounded-sm px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent`}
            placeholder="12345"
            required
          />
          {errors.zipCode && (
            <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>
          )}
        </div>
      </div>

      {/* Submit Error */}
      {errors.submit && (
        <div className="bg-red-900/30 border border-red-700 rounded-sm p-3">
          <p className="text-red-400 text-sm">{errors.submit}</p>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          disabled={loading || isSubmitting}
        >
          {loading || isSubmitting ? 'Saving...' : 'Continue'}
        </Button>
      </div>
    </form>
  );
};

export default ShippingForm;