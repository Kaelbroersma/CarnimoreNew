import React, { useState } from 'react';
import { Search, MapPin, Phone, Store, AlertCircle } from 'lucide-react';
import { fflService } from '../../services/fflService';
import type { FFLDealer } from '../../types/payment';

interface FFLDealerSearchProps {
  onDealerSelect: (dealer: FFLDealer) => void;
  className?: string;
}

export function FFLDealerSearch({ onDealerSelect, className = '' }: FFLDealerSearchProps) {
  const [zipCode, setZipCode] = useState('');
  const [searchResults, setSearchResults] = useState<FFLDealer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDealer, setSelectedDealer] = useState<FFLDealer | null>(null);

  const searchDealers = async (zip: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fflService.searchDealers(zip);

      if (result.error) {
        throw new Error(result.error.message);
      }

      // Log raw response data
      console.log('Raw FFL search results:', {
        timestamp: new Date().toISOString(),
        results: result.data,
        count: result.data?.length || 0
      });

      // Validate and clean data before setting
      const cleanedResults = (result.data || []).map(dealer => ({
        ...dealer,
        BUSINESS_NAME: dealer.BUSINESS_NAME?.trim() || '',
        LICENSE_NAME: dealer.LICENSE_NAME?.trim() || '',
        PREMISE_STREET: dealer.PREMISE_STREET?.trim() || '',
        PREMISE_CITY: dealer.PREMISE_CITY?.trim() || '',
        PREMISE_STATE: dealer.PREMISE_STATE?.trim() || '',
        PREMISE_ZIP_CODE: dealer.PREMISE_ZIP_CODE?.trim() || '',
        VOICE_PHONE: dealer.VOICE_PHONE?.trim() || ''
      }));

      console.log('Cleaned FFL search results:', {
        timestamp: new Date().toISOString(),
        results: cleanedResults,
        count: cleanedResults.length
      });

      setSearchResults(cleanedResults);
    } catch (err) {
      console.error('FFL search error:', {
        timestamp: new Date().toISOString(),
        error: err instanceof Error ? err.message : 'Unknown error',
        zipCode
      });
      setError(err instanceof Error ? err.message : 'An error occurred');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (zipCode.length === 5) {
      searchDealers(zipCode);
    }
  };

  const handleDealerSelect = (dealer: FFLDealer) => {
    // Log dealer selection
    console.log('Selected dealer details:', {
      timestamp: new Date().toISOString(),
      dealer: {
        businessName: dealer.BUSINESS_NAME,
        licenseName: dealer.LICENSE_NAME,
        licenseNumber: dealer.LIC_SEQN,
        address: {
          street: dealer.PREMISE_STREET,
          city: dealer.PREMISE_CITY,
          state: dealer.PREMISE_STATE,
          zip: dealer.PREMISE_ZIP_CODE
        },
        phone: dealer.VOICE_PHONE
      }
    });

    setSelectedDealer(dealer);
    onDealerSelect(dealer);
  };

  const formatPhoneNumber = (phone: string): string => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
  };

  const getDealerName = (dealer: FFLDealer): string => {
    // Log raw name data for debugging
    console.log('Raw dealer name data:', {
      timestamp: new Date().toISOString(),
      businessName: dealer.BUSINESS_NAME,
      licenseName: dealer.LICENSE_NAME,
      licenseNumber: dealer.LIC_SEQN
    });

    // Clean and validate business name
    const businessName = dealer.BUSINESS_NAME?.trim().replace(/\s+/g, ' ') || '';
    const licenseName = dealer.LICENSE_NAME?.trim().replace(/\s+/g, ' ') || '';

    // Log cleaned names
    console.log('Cleaned dealer names:', {
      timestamp: new Date().toISOString(),
      businessName,
      licenseName
    });

    // Return the first non-empty name
    if (businessName) return businessName;
    if (licenseName) return licenseName;
    
    return 'Unknown Dealer';
  };

  const formatAddress = (dealer: FFLDealer): string => {
    // Log raw address data
    console.log('Raw address data:', {
      timestamp: new Date().toISOString(),
      street: dealer.PREMISE_STREET,
      city: dealer.PREMISE_CITY,
      state: dealer.PREMISE_STATE,
      zip: dealer.PREMISE_ZIP_CODE
    });

    const parts = [];

    // Clean and add each address component
    if (dealer.PREMISE_STREET?.trim()) {
      parts.push(dealer.PREMISE_STREET.trim().replace(/\s+/g, ' '));
    }
    if (dealer.PREMISE_CITY?.trim()) {
      parts.push(dealer.PREMISE_CITY.trim().replace(/\s+/g, ' '));
    }
    if (dealer.PREMISE_STATE?.trim()) {
      parts.push(dealer.PREMISE_STATE.trim());
    }
    if (dealer.PREMISE_ZIP_CODE?.trim()) {
      parts.push(dealer.PREMISE_ZIP_CODE.trim());
    }

    const formattedAddress = parts.join(', ');

    // Log formatted address
    console.log('Formatted address:', {
      timestamp: new Date().toISOString(),
      parts,
      formattedAddress
    });

    return formattedAddress || 'No address provided';
  };

  const formatLicenseNumber = (license: string): string => {
    return license ? `FFL #${license}` : '';
  };

  return (
    <div className={`bg-gunmetal rounded-sm shadow-luxury ${className}`}>
      <div className="p-6">
        {/* Info Alert */}
        <div className="bg-gunmetal-dark border border-gunmetal-light rounded-sm p-4 mb-6">
          <div className="flex gap-4 items-start">
            <AlertCircle className="text-tan flex-shrink-0 mt-1" size={20} />
            <div className="space-y-2">
              <p className="text-white">
                Since you have a firearm in your cart, we must send this to an authorized FFL.
              </p>
              <p className="text-gray-400 text-sm">
                If you are an authorized FFL, please select yourself. Don't see your FFL listed? Please call us at{' '}
                <a href="tel:+16233887069" className="text-tan hover:text-tan/80 transition-colors">
                  (623) 388-7069
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
              placeholder="Enter ZIP Code"
              pattern="[0-9]{5}"
              className="w-full bg-dark-gray border border-gunmetal-light rounded-sm pl-4 pr-12 py-2 text-white placeholder-gray-500 focus:border-tan focus:outline-none focus:ring-2 focus:ring-tan focus:ring-opacity-50 transition duration-300"
              required
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-tan transition-colors p-1"
              disabled={loading}
            >
              <Search size={20} />
            </button>
          </div>
        </form>

        {/* Error State */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-sm p-4 mb-6 flex items-start">
            <AlertCircle className="text-red-400 mr-2 flex-shrink-0 mt-0.5" size={16} />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-tan border-t-transparent mx-auto"></div>
            <p className="text-gray-400 mt-4">Searching for FFL dealers...</p>
          </div>
        )}

        {/* Results List */}
        <div className="space-y-4">
          {searchResults.map((dealer) => (
            <div
              key={dealer.lic_seqn}
              className={`border rounded-sm p-4 cursor-pointer transition-all duration-300 ${
                selectedDealer?.lic_seqn === dealer.lic_seqn
                  ? 'border-tan bg-tan/5'
                  : 'border-gunmetal-light bg-dark-gray hover:border-tan/50'
              }`}
              onClick={() => handleDealerSelect(dealer)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium flex items-center gap-2 mb-3">
                    <Store size={18} className="text-tan" />
                    {getDealerName(dealer)}
                  </h3>
                  <p className="text-gray-400 flex items-center gap-2 mb-2">
                    <MapPin size={16} className="text-tan" />
                    {formatAddress(dealer)}
                  </p>
                  {dealer.voice_phone && (
                    <p className="text-gray-400 flex items-center gap-2">
                      <Phone size={16} className="text-tan" />
                      {formatPhoneNumber(dealer.voice_phone)}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                {formatLicenseNumber(dealer.lic_seqn)}
              </div>
            </div>
          ))}

          {/* Empty State */}
          {searchResults.length === 0 && !loading && zipCode && !error && (
            <div className="text-center py-8">
              <Store className="text-tan mx-auto mb-4" size={32} />
              <p className="text-gray-400">
                No FFL dealers found in your area.<br />
                Please try a different ZIP code.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export type { FFLDealer };