import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { callNetlifyFunction } from '../lib/supabase';

interface UseOrderPollingProps {
  orderId: string | null;
  onStatusChange?: (status: 'pending' | 'paid' | 'failed', message?: string) => void;
}

export const useOrderPolling = ({ orderId, onStatusChange }: UseOrderPollingProps) => {
  const navigate = useNavigate();
  const clearCart = useCartStore(state => state.clearCart);
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isSubscribed = true;

    const checkOrderStatus = async () => {
      try {
        console.log('Checking order status:', {
          timestamp: new Date().toISOString(),
          orderId
        });

        // Query Supabase directly through our client function
        const result = await callNetlifyFunction('getOrder', { orderId });
        
        if (!isSubscribed) return;

        if (result.error) {
          throw new Error(result.error.message);
        }

        const order = result.data;
        
        console.log('Order status update received:', {
          timestamp: new Date().toISOString(),
          orderId,
          status: order?.payment_status,
          message: order?.response_message,
          processorResponse: order?.payment_processor_response
        });
        
        const status = order?.payment_status as 'pending' | 'paid' | 'failed';
        const message = order?.response_message;
        const processorResponse = order?.payment_processor_response;
        
        onStatusChange?.(status, message);

        if (status === 'paid') {
          // Navigate first, then clear cart
          navigate('/payment/success', { 
            state: { 
              orderId,
              message: message || 'Your payment has been processed successfully.',
              transactionId: processorResponse?.transactionId,
              authCode: processorResponse?.authCode,
              orderTotal: order?.total_amount
            },
            replace: true // Use replace to prevent back navigation to checkout
          });
          
          // Clear cart after navigation
          setTimeout(() => {
            if (isSubscribed) {
              clearCart();
            }
          }, 100);
        } else if (status === 'failed') {
          navigate('/payment/error', { 
            state: { 
              orderId,
              message: message || 'There was an error processing your payment.'
            },
            replace: true
          });
        }
      } catch (error) {
        console.error('Failed to check order status:', {
          timestamp: new Date().toISOString(),
          orderId,
          error
        });
      }
    };

    if (orderId) {
      // Initial delay before starting to poll
      const startPolling = async () => {
        console.log('Starting order status polling:', {
          timestamp: new Date().toISOString(),
          orderId
        });

        // Wait 4 seconds before first check
        await new Promise(resolve => setTimeout(resolve, 4000));
        
        if (!isSubscribed) return;
        
        // Initial check
        await checkOrderStatus();
        
        // Poll every 4 seconds
        const interval = setInterval(checkOrderStatus, 4000);
        setPollInterval(interval);
        
        // Set timeout to stop polling after 5 minutes
        const timeout = setTimeout(() => {
          clearInterval(interval);
          setPollInterval(null);
          if (isSubscribed) {
            onStatusChange?.('failed', 'Payment processing timeout');
            navigate('/payment/error', {
              state: {
                orderId,
                message: 'Payment processing timed out. Please try again.'
              },
              replace: true
            });
          }
        }, 5 * 60 * 1000);
        setTimeoutId(timeout);
      };

      startPolling();
    }

    return () => {
      isSubscribed = false;
      if (pollInterval) clearInterval(pollInterval);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [orderId, navigate, clearCart, onStatusChange]);
};