import React from 'react';
import { Mail, Phone, User } from 'lucide-react';
import Button from '../Button';

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface ContactFormProps {
  formData: ContactFormData;
  onChange: (data: Partial<ContactFormData>) => void;
  onSubmit: () => void;
  loading?: boolean;
}

const ContactForm: React.FC<ContactFormProps> = ({
  formData,
  onChange,
  onSubmit,
  loading = false
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            First Name <span className="text-tan">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={formData.firstName}
              onChange={(e) => onChange({ firstName: e.target.value })}
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
              value={formData.lastName}
              onChange={(e) => onChange({ lastName: e.target.value })}
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
            onChange={(e) => onChange({ email: e.target.value })}
            className="w-full bg-dark-gray border border-gunmetal-light rounded-sm pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent"
          />
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Phone Number <span className="text-tan">*</span>
        </label>
        <div className="relative">
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            className="w-full bg-dark-gray border border-gunmetal-light rounded-sm pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-tan focus:border-transparent"
          />
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
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

export default ContactForm;