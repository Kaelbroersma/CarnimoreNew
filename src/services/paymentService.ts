import type { Result } from '../types/database';
import type { PaymentData, PaymentResult } from '../types/payment';
import { callNetlifyFunction } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';

export const paymentService = {
  async processPayment(data: PaymentData): Promise<Result<PaymentResult>> {
    const user = useAuthStore.getState().user;

    try {
      // Validate required fields
      if (!data.cardNumber?.trim()) throw new Error('Card number is required');
      if (!data.expiryMonth?.trim()) throw new Error('Expiry month is required');
      if (!data.expiryYear?.trim()) throw new Error('Expiry year is required');
      if (!data.cvv?.trim()) throw new Error('CVV is required');
      if (!data.nameOnCard?.trim()) throw new Error('Name on card is required');
      if (!data.orderId) throw new Error('Order ID is required');
      if (!data.amount) throw new Error('Amount is required');
      if (!data.email?.trim()) throw new Error('Email is required');
      if (!data.phone?.trim()) throw new Error('Phone number is required');

      // Validate billing address
      if (!data.billingAddress?.address?.trim()) throw new Error('Billing address is required');
      if (!data.billingAddress?.city?.trim()) throw new Error('Billing city is required');
      if (!data.billingAddress?.state?.trim()) throw new Error('Billing state is required');
      if (!data.billingAddress?.zipCode?.trim()) throw new Error('Billing ZIP code is required');

      // Check if order requires FFL using cart store function
      const requiresFFL = await useCartStore.getState().requiresFFL();
      const hasNonFFLItems = await useCartStore.getState().hasNonFFLItems();

      // Validate FFL dealer info if required
      if (requiresFFL && !data.fflDealerInfo) {
        throw new Error('FFL dealer information required for firearm purchases');
      }

      // Validate shipping address if non-firearm items are present
      if (hasNonFFLItems) {
        if (!data.shippingAddress) {
          throw new Error('Shipping address is required for non-firearm items');
        }

        const { address, city, state, zipCode } = data.shippingAddress;
        
        if (!address?.trim()) throw new Error('Shipping address is required');
        if (!city?.trim()) throw new Error('Shipping city is required');
        if (!state?.trim() || !/^[A-Z]{2}$/.test(state)) throw new Error('Valid shipping state is required (e.g., AZ)');
        if (!zipCode?.trim() || !/^\d{5}$/.test(zipCode)) throw new Error('Valid shipping ZIP code is required');
      }

      // Format card number by removing spaces
      const cardNumber = data.cardNumber.replace(/\s+/g, '');
      
      // Validate card number
      if (!/^\d{15,16}$/.test(cardNumber)) {
        throw new Error('Invalid card number');
      }
      
      // Validate expiry date
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      const expMonth = parseInt(data.expiryMonth);
      const expYear = parseInt(data.expiryYear);
      
      if (expYear < currentYear || 
          (expYear === currentYear && expMonth < currentMonth)) {
        throw new Error('Card has expired');
      }
      
      // Validate CVV
      if (!/^\d{3,4}$/.test(data.cvv)) {
        throw new Error('Invalid CVV');
      }

      // Format expiry month to ensure 2 digits
      const expiryMonth = data.expiryMonth.padStart(2, '0');

      // Format amount to 2 decimal places
      const formattedAmount = data.amount.toFixed(2);

      // Log payment request preparation
      console.log('Preparing payment request:', {
        timestamp: new Date().toISOString(),
        orderId: data.orderId,
        requiresFFL,
        hasNonFFLItems,
        hasFFLInfo: !!data.fflDealerInfo,
        hasShippingAddress: !!data.shippingAddress
      });

      // Prepare payment request data
      const paymentRequest = {
        cardNumber,
        expiryMonth,
        expiryYear: expYear.toString(),
        cvv: data.cvv,
        nameOnCard: data.nameOnCard,
        billingAddress: data.billingAddress,
        amount: formattedAmount,
        shippingAddress: data.shippingAddress,
        fflDealerInfo: data.fflDealerInfo,
        orderId: data.orderId,
        items: data.items,
        phone: data.phone,
        email: data.email
      };

      // Add authorization header if user is logged in
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (user) {
        headers['Authorization'] = `Bearer ${user.id}`;
      }

      // Send payment request to process-payment function
      const response = await fetch('/.netlify/functions/process-payment', {
        method: 'POST',
        headers,
        body: JSON.stringify(paymentRequest)
      });
      
      // Parse initial response
      const result = await response.json();

      // Log any initial errors but don't throw yet
      if (!response.ok || result.error) {
        console.warn('Initial payment response indicates potential issue:', {
          timestamp: new Date().toISOString(),
          ok: response.ok,
          error: result.error,
          status: response.status
        });
      }

      // Add delay before returning to allow order creation
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Return success response to allow for polling
      return {
        data: {
          orderId: data.orderId,
          status: 'pending',
          message: 'Payment processing initiated'
        },
        error: null
      };

    } catch (error: any) {
      console.error('Payment error:', {
        timestamp: new Date().toISOString(),
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      return {
        data: null,
        error: {
          message: error.message || 'Failed to process payment',
          details: error.stack
        }
      };
    }
  }
};