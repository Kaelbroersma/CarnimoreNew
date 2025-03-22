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
      if (!data.cardNumber?.trim() || !data.expiryMonth?.trim() || !data.expiryYear?.trim() || 
          !data.cvv?.trim() || !data.amount || !data.orderId || !data.email || !data.phone) {
        throw new Error('All payment fields are required');
      }

      // Check if order requires FFL using cart store function
      const requiresFFL = await useCartStore.getState().requiresFFL();
      const hasNonFFLItems = await useCartStore.getState().hasNonFFLItems();

      // Validate FFL dealer info if required
      if (requiresFFL && !data.fflDealerInfo) {
        throw new Error('FFL dealer information required for firearm purchases');
      }

      // Validate shipping address if non-firearm items are present
      if (hasNonFFLItems) {
        // Validate shipping address
        if (!data.shippingAddress) {
          throw new Error('Shipping address is required for non-firearm items');
        }

        const { address, city, state, zipCode } = data.shippingAddress;
        
        if (!address?.trim()) {
          throw new Error('Street address is required');
        }
        
        if (!city?.trim()) {
          throw new Error('City is required');
        }
        
        if (!state?.trim() || !/^[A-Z]{2}$/.test(state)) {
          throw new Error('Valid state code is required (e.g., AZ)');
        }
        
        if (!zipCode?.trim() || !/^\d{5}$/.test(zipCode)) {
          throw new Error('Valid ZIP code is required');
        }
      }

      // Format card number by removing spaces
      const cardNumber = data.cardNumber.replace(/\s+/g, '');
      
      // Validate card number
      if (!/^\d{15,16}$/.test(cardNumber)) {
        throw new Error('Invalid card number');
      }
      
      // Validate expiry date
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;
      const expMonth = parseInt(data.expiryMonth);
      const expYear = parseInt(data.expiryYear.slice(-2));
      
      if (expMonth < 1 || expMonth > 12 || 
          expYear < currentYear || 
          (expYear === currentYear && expMonth < currentMonth)) {
        throw new Error('Invalid expiry date');
      }
      
      // Validate CVV
      if (!/^\d{3,4}$/.test(data.cvv)) {
        throw new Error('Invalid CVV');
      }
      
      // Format expiry month to ensure 2 digits
      const expiryMonth = data.expiryMonth.padStart(2, '0');
      
      // Format amount
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

      // Return success response immediately to allow for polling
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