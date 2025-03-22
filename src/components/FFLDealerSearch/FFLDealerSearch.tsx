import React, { useState } from 'react';
import { Search, MapPin, Phone, Store, AlertCircle } from 'lucide-react';
import { callNetlifyFunction } from '../../lib/supabase';
import Button from '../Button';

export interface FFLDealer {
  LIC_REGN: string;
  LIC_DIST: string;
  LIC_CNTY: string;
  LIC_TYPE: string;
  LIC_XPRDTE: string;
  LIC_SEQN: string;
  LICENSE_NAME: string;
  BUSINESS_NAME: string;
  PREMISE_STREET: string;
  PREMISE_CITY: string;
  PREMISE_STATE: string;
  PREMISE_ZIP_CODE: string;
  MAIL_STREET: string;
  MAIL_CITY: string;
  MAIL_STATE: string;
  MAIL_ZIP_CODE: string;
  VOICE_PHONE: string;
  distance?: number;
}

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
      const result = await callNetlifyFunction('searchFFLDealers', { zipCode: zip });

      if (result.error) {
        throw new Error(result.error.message);
      }

      setSearchResults(result.data || []);
    } catch (err) {
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
    setSelectedDealer(dealer);
    onDealerSelect(dealer);
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
              onChange={(e) => setZipCode(e.target.value.slice(0, 5))}
              placeholder="Enter ZIP Code"
              pattern="[0-9]{5}"
              className="w-full bg-dark-gray border border-gunmetal-light rounded-sm pl-4 pr-12 py-2 text-white placeholder-gray-500
                focus:border-tan focus:outline-none focus:ring-2 focus:ring-tan focus:ring-opacity-50
                transition duration-300"
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

        {/* Error Message */}
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
              key={dealer.LIC_SEQN}
              className={`border rounded-sm p-4 cursor-pointer transition-all duration-300 ${
                selectedDealer?.LIC_SEQN === dealer.LIC_SEQN
                  ? 'border-tan bg-tan/5'
                  : 'border-gunmetal-light bg-dark-gray hover:border-tan/50'
              }`}
              onClick={() => handleDealerSelect(dealer)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium flex items-center gap-2 mb-3">
                    <Store size={18} className="text-tan" />
                    {dealer.BUSINESS_NAME}
                  </h3>
                  <p className="text-gray-400 flex items-center gap-2 mb-2">
                    <MapPin size={16} className="text-tan" />
                    {dealer.PREMISE_STREET}, {dealer.PREMISE_CITY}, {dealer.PREMISE_STATE} {dealer.PREMISE_ZIP_CODE}
                  </p>
                  <p className="text-gray-400 flex items-center gap-2">
                    <Phone size={16} className="text-tan" />
                    {dealer.VOICE_PHONE}
                  </p>
                </div>
                {dealer.distance && (
                  <span className="text-tan font-medium">
                    {dealer.distance.toFixed(1)} miles
                  </span>
                )}
              </div>
              <div className="mt-2 text-sm text-gray-500">
                License: {dealer.LIC_SEQN}
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