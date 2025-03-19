import { callNetlifyFunction } from '../lib/supabase';
import type { Result } from '../types/database';

interface OrderLinkData {
  orderId: string;
  userId: string;
}

export const orderService = {
  async linkOrderToUser({ orderId, userId }: OrderLinkData): Promise<Result<void>> {
    try {
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      
      if (!uuidRegex.test(orderId)) {
        throw new Error('Invalid order ID format');
      }
      
      if (!uuidRegex.test(userId)) {
        throw new Error('Invalid user ID format');
      }

      console.log('Linking order to user:', {
        timestamp: new Date().toISOString(),
        orderId,
        userId
      });

      const result = await callNetlifyFunction('supabase-client', {
        action: 'updateOrder',
        payload: { orderId, userId }
      });

      if (result.error) {
        console.error('Failed to link order:', {
          timestamp: new Date().toISOString(),
          error: result.error,
          orderId,
          userId
        });
        throw new Error(result.error.message || 'Failed to link order');
      }

      console.log('Order linked successfully:', {
        timestamp: new Date().toISOString(),
        orderId,
        userId,
        data: result.data
      });

      return { data: null, error: null };
    } catch (error: any) {
      console.error('Order linking error:', {
        timestamp: new Date().toISOString(),
        error: error.message,
        orderId,
        userId
      });
      
      return {
        data: null,
        error: {
          message: error.message || 'Failed to link order to user',
          details: error.details || error.message
        }
      };
    }
  }
};