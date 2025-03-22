import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Phone, Store, AlertCircle, ChevronDown } from 'lucide-react';
import { fflService } from '../../services/fflService';
import type { FFLDealer } from '../../types/payment';

interface FFLDealerSearchProps {
  onDealerSelect: (dealer: FFLDealer) => void;
  className?: string;
}

export function FFLDealerSearch({ onDealerSelect, className = '' }: FFLDealerSearchProps) {
  const [zipCode, setZipCode] = useState('');
  const [searchResults, setSearchResults] = useState<FFLDealer[]>([]);
  const [displayedResults, setDisplayedResults] = useState<FFLDealer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDealer, setSelectedDealer] = useState<FFLDealer | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  const RESULTS_PER_PAGE = 5;
  const CARNIMORE_NAME = 'CARNIMORE LLC';

  useEffect(() => {
    // Sort and paginate results when searchResults changes
    const sortedResults = [...searchResults].sort((a, b) => {
      // Always put Carnimore LLC first
      if (a.business_name?.toUpperCase() === CARNIMORE_NAME) return -1;
      if (b.business_name?.toUpperCase() === CARNIMORE_NAME) return 1;
      return 0;
    });

    setDisplayedResults(sortedResults.slice(0, RESULTS_PER_PAGE));
    setHasMore(sortedResults.length > RESULTS_PER_PAGE);
  }, [searchResults]);

  const searchDealers = async (zip: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fflService.searchDealers(zip);

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

  const loadMore = () => {
    const currentLength = displayedResults.length;
    const nextResults = searchResults.slice(
      currentLength,
      currentLength + RESULTS_PER_PAGE
    );
    setDisplayedResults([...displayedResults, ...nextResults]);
    setHasMore(currentLength + RESULTS_PER_PAGE < searchResults.length);
  };

  const getDealerName = (dealer: FFLDealer): string => {
    return dealer.business_name?.trim() || dealer.license_name?.trim() || 'Unknown Dealer';
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
        <div 
          ref={resultsContainerRef}
          className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar"
        >
          {displayedResults.map((dealer) => (
            <div
              key={dealer.lic_seqn}
              className={`border rounded-sm p-4 cursor-pointer transition-all duration-300 ${
                selectedDealer?.lic_seqn === dealer.lic_seqn
                  ? 'border-tan bg-tan/5'
                  : 'border-gunmetal-light bg-dark-gray hover:border-tan/50'
              } ${dealer.business_name?.toUpperCase() === CARNIMORE_NAME ? 'border-tan/50' : ''}`}
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
                    {dealer.premise_street}, {dealer.premise_city}, {dealer.premise_state} {dealer.premise_zip_code}
                  </p>
                  <p className="text-gray-400 flex items-center gap-2">
                    <Phone size={16} className="text-tan" />
                    {formatPhoneNumber(dealer.voice_phone)}
                  </p>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                {formatLicenseNumber(dealer.lic_seqn)}
              </div>
            </div>
          ))}

          {/* Load More Button */}
          {hasMore && (
            <button
              onClick={loadMore}
              className="w-full py-2 px-4 text-tan hover:text-tan/80 transition-colors flex items-center justify-center gap-2"
            >
              Load More
              <ChevronDown size={16} />
            </button>
          )}

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

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1E2529;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #BEA987;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #8C7A5B;
        }
      `}</style>
    </div>
  );
}

export type { FFLDealer };