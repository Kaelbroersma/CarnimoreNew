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
          message: order?.response_message
        });
        
        const status = order?.payment_status as 'pending' | 'paid' | 'failed';
        const message = order?.response_message;
        
        onStatusChange?.(status, message);

        if (status === 'paid') {
          clearCart();
          setTimeout(() => {
            if (isSubscribed) {
              navigate('/payment/success', { 
                state: { 
                  orderId,
                  message: 'Your payment has been processed successfully.'
                }
              });
            }
          }, 2000);
        } else if (status === 'failed') {
          setTimeout(() => {
            if (isSubscribed) {
              navigate('/payment/error', { 
                state: { 
                  orderId,
                  message: message || 'There was an error processing your payment.'
                }
              });
            }
          }, 2000);
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

        // Wait 2 seconds before first check
        await new Promise(resolve => setTimeout(resolve, 4000));
        
        if (!isSubscribed) return;
        
        // Initial check
        await checkOrderStatus();
        
        // Poll every 3 seconds
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
              }
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