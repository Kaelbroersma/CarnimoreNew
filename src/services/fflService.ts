import { callNetlifyFunction } from '../lib/supabase';
import type { FFLDealer } from '../types/payment';
import type { Result } from '../types/database';

export const fflService = {
  async searchDealers(zipCode: string): Promise<Result<FFLDealer[]>> {
    try {
      if (!zipCode?.trim() || !/^\d{5}$/.test(zipCode)) {
        throw new Error('Invalid ZIP code');
      }

      console.log('Searching FFL dealers:', {
        timestamp: new Date().toISOString(),
        zipCode
      });

      const result = await callNetlifyFunction('searchFFLDealers', { zipCode });

      if (result.error) {
        throw new Error(result.error.message);
      }

      return { data: result.data, error: null };
    } catch (error: any) {
      console.error('Failed to search FFL dealers:', error);
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