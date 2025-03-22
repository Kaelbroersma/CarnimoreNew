import { callNetlifyFunction } from '../lib/supabase';
import type { FFLDealer } from '../types/payment';
import type { Result } from '../types/database';

export const fflService = {
  async searchDealers(zipCode: string): Promise<Result<FFLDealer[]>> {
    try {
      // Validate ZIP code format
      if (!zipCode?.trim() || !/^\d{5}$/.test(zipCode)) {
        throw new Error('Invalid ZIP code');
      }

      console.log('Initiating FFL dealer search:', {
        timestamp: new Date().toISOString(),
        zipCode
      });

      const result = await callNetlifyFunction('searchFFLDealers', { zipCode });

      if (result.error) {
        console.error('FFL search error from server:', {
          timestamp: new Date().toISOString(),
          error: result.error,
          zipCode
        });
        throw new Error(result.error.message);
      }

      // Validate response data
      if (!Array.isArray(result.data)) {
        console.error('Invalid response format:', {
          timestamp: new Date().toISOString(),
          response: result.data
        });
        throw new Error('Invalid response format from server');
      }

      // Clean and validate each dealer record
      const cleanedDealers = result.data.map(dealer => {
        if (!dealer) return null;

        // Ensure all required fields exist
        const cleanedDealer = {
          ...dealer,
          BUSINESS_NAME: dealer.BUSINESS_NAME?.trim() || '',
          LICENSE_NAME: dealer.LICENSE_NAME?.trim() || '',
          PREMISE_STREET: dealer.PREMISE_STREET?.trim() || '',
          PREMISE_CITY: dealer.PREMISE_CITY?.trim() || '',
          PREMISE_STATE: dealer.PREMISE_STATE?.trim() || '',
          PREMISE_ZIP_CODE: dealer.PREMISE_ZIP_CODE?.trim() || '',
          VOICE_PHONE: dealer.VOICE_PHONE?.trim() || '',
          LIC_SEQN: dealer.LIC_SEQN?.trim() || ''
        };

        // Log cleaned dealer data
        console.log('Cleaned dealer data:', {
          timestamp: new Date().toISOString(),
          original: dealer,
          cleaned: cleanedDealer
        });

        return cleanedDealer;
      }).filter((dealer): dealer is FFLDealer => dealer !== null);

      console.log('FFL search completed successfully:', {
        timestamp: new Date().toISOString(),
        zipCode,
        dealersFound: cleanedDealers.length
      });

      return { data: cleanedDealers, error: null };
    } catch (error: any) {
      console.error('FFL search service error:', {
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.stack : error,
        zipCode
      });

      return {
        data: null,
        error: {
          message: error.message || 'Failed to search FFL dealers',
          details: error.details || error.message
        }
      };
    }
  }
};