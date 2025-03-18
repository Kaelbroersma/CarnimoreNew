import { Handler } from '@netlify/functions';
import https from 'https';
import { createClient } from '@supabase/supabase-js';

// Environment variables
const EPN_ACCOUNT = process.env.EPN_ACCOUNT_NUMBER;
const EPN_RESTRICT_KEY = process.env.EPN_X_TRAN;
const EPN_API_URL = 'https://www.eprocessingnetwork.com/cgi-bin/epn/secure/tdbe/transact.pl';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  try {
    if (!event.body) {
      throw new Error('Missing request body');
    }
    
    console.log('Payment processing started:', {
      timestamp: new Date().toISOString(),
      method: event.httpMethod,
      headers: event.headers,
      body: event.body
    });

    const paymentData = JSON.parse(event.body);
    const { 
      orderId, 
      cardNumber, 
      expiryMonth, 
      expiryYear, 
      cvv, 
      amount, 
      shippingAddress,
      billingAddress,
      items
    } = paymentData;

    console.log('Payment data received:', {
      timestamp: new Date().toISOString(),
      orderId,
      amount,
      itemCount: items?.length,
      hasShippingAddress: !!shippingAddress,
      hasBillingAddress: !!billingAddress
    });

    // Get user ID from auth context if available
    const userId = event.headers.authorization?.split('Bearer ')[1] || null;

    // Format addresses for database
    const formattedShippingAddress = [
      shippingAddress.address,
      shippingAddress.city,
      shippingAddress.state,
      shippingAddress.zipCode
    ].filter(Boolean).join(', ');

    const formattedBillingAddress = billingAddress ? [
      billingAddress.address,
      billingAddress.city,
      billingAddress.state,
      billingAddress.zipCode
    ].filter(Boolean).join(', ') : formattedShippingAddress;

    // Validate environment variables
    if (!EPN_ACCOUNT || !EPN_RESTRICT_KEY) {
      throw new Error('Missing required environment variables');
    }

    // Validate required fields
    if (!cardNumber?.trim() || !expiryMonth?.trim() || !expiryYear?.trim() || 
        !cvv?.trim() || !amount || !orderId || 
        !shippingAddress?.address?.trim() || !shippingAddress?.zipCode?.trim()) {
      throw new Error('Missing required fields');
    }

    // Create initial order record in Supabase
    console.log('Creating order record:', { 
      timestamp: new Date().toISOString(), 
      orderId,
      userId,
      amount 
    });

    const { error: orderError } = await supabase
      .from('orders')
      .insert({
        order_id: orderId,
        user_id: userId,
        payment_status: 'pending',
        total_amount: amount,
        shipping_address: formattedShippingAddress,
        billing_address: formattedBillingAddress,
        order_date: new Date().toISOString(),
        payment_method: 'credit_card',
        shipping_method: 'standard',
        order_status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (orderError) {
      console.error('Failed to create order:', {
        timestamp: new Date().toISOString(),
        error: orderError,
        orderId,
        userId
      });
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    console.log('Order created successfully:', { timestamp: new Date().toISOString(), orderId });

    // Create order items
    console.log('Creating order items:', {
      timestamp: new Date().toISOString(),
      orderId,
      itemCount: items.length,
      items: items.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price
      }))
    });

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(items.map(item => ({
        order_id: orderId,
        product_id: item.id,
        quantity: item.quantity,
        price_at_time_of_order: item.price,
        total_price: item.price * item.quantity,
        options: item.options
      })))
      .select();

    if (itemsError) {
      console.error('Failed to create order items:', {
        timestamp: new Date().toISOString(),
        error: itemsError,
        orderId
      });
      throw new Error(`Failed to create order items: ${itemsError.message}`);
    }

    console.log('Order items created successfully:', { timestamp: new Date().toISOString(), orderId });

    // Build payment processor request payload
    const params = new URLSearchParams({
      ePNAccount: EPN_ACCOUNT,
      RestrictKey: EPN_RESTRICT_KEY,
      RequestType: 'transaction',
      TranType: 'Sale',
      IndustryType: 'E',
      Total: amount,
      Address: (billingAddress?.address || shippingAddress.address || '').trim(),
      City: (billingAddress?.city || shippingAddress.city || '').trim(),
      State: (billingAddress?.state || shippingAddress.state || '').trim(),
      Zip: (billingAddress?.zipCode || shippingAddress.zipCode || '').trim(),
      CardNo: cardNumber.replace(/\s+/g, ''),
      ExpMonth: expiryMonth.padStart(2, '0'),
      ExpYear: expiryYear.slice(-2),
      CVV2Type: '1',
      CVV2: cvv,
      'Postback.OrderID': orderId,
      'Postback.Description': `Order ${orderId}`,
      'Postback.Total': amount,
      'Postback.RestrictKey': EPN_RESTRICT_KEY,
      PostbackID: orderId,
      COMBINE_PB_RESPONSE: '1',
      NOMAIL_CARDHOLDER: '1',
      NOMAIL_MERCHANT: '1'
    });

    console.log('Sending payment request to processor:', {
      timestamp: new Date().toISOString(),
      orderId,
      amount,
      requestParams: Object.fromEntries(params)
    });

    // Create HTTPS request with proper TLS settings
    const makeRequest = async () => {
      const response = await fetch(EPN_API_URL, {
        method: 'POST',
        agent: new https.Agent({
          minVersion: 'TLSv1.2'
        }),
        body: params.toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': '*/*', 
          'User-Agent': 'Carnimore/1.0'
        }
      });

      console.log('Payment request sent to processor:', { 
        timestamp: new Date().toISOString(),
        orderId,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers)
      });

      return response;
    };

    // Send the request
    const response = await makeRequest();
    
    // Log raw response
    console.log('Raw processor response:', {
      timestamp: new Date().toISOString(),
      orderId,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers)
    });
    
    // Handle processor response
    if (response.ok) {
      const responseText = await response.text();
      console.log('Processor response body:', {
        timestamp: new Date().toISOString(),
        orderId,
        responseText,
        contentType: response.headers.get('content-type')
      });

      // Parse response based on content type
      let processorResponse;
      try {
        // Check if response is HTML error message
        if (responseText.includes('<html>')) {
          // Extract error message from HTML
          const errorMatch = responseText.match(/"([^"]+)"/);
          const errorMessage = errorMatch ? errorMatch[1] : 'Unknown error';
          
          console.log('Parsed HTML error response:', {
            timestamp: new Date().toISOString(),
            orderId,
            errorMessage
          });

          // Update order with error status
          const { error: updateError } = await supabase
            .from('orders')
            .update({
              payment_status: 'failed',
              payment_processor_response: {
                error: errorMessage,
                raw_response: responseText
              }
            })
            .eq('order_id', orderId);

          if (updateError) {
            console.error('Failed to update order with error status:', {
              timestamp: new Date().toISOString(),
              orderId,
              error: updateError
            });
          }

          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              success: false,
              message: errorMessage,
              orderId
            })
          };
        }

        // Try parsing as JSON first
        try {
          processorResponse = JSON.parse(responseText);
          console.log('Parsed JSON response:', {
            timestamp: new Date().toISOString(),
            orderId,
            response: processorResponse
          });
        } catch {
          // If not JSON, try parsing as key-value pairs
          const separator = responseText.includes(';') ? ';' : ',';
          console.log('Attempting to parse as key-value pairs:', {
            timestamp: new Date().toISOString(),
            orderId,
            separator,
            pairs: responseText.split(separator)
          });
          
          processorResponse = Object.fromEntries(
            responseText.split(separator).map(pair => {
              const [key, value] = pair.split('=').map(s => decodeURIComponent(s.trim()));
              console.log('Parsed key-value pair:', {
                timestamp: new Date().toISOString(),
                orderId,
                key,
                value
              });
              return [key, value];
            })
          );
          
          console.log('Parsed key-value response:', {
            timestamp: new Date().toISOString(),
            orderId,
            response: processorResponse
          });
        }

        // Validate response
        if (processorResponse['Postback.OrderID'] !== orderId) {
          console.error('Order ID mismatch in processor response:', {
            timestamp: new Date().toISOString(),
            orderId,
            responseOrderId: processorResponse['Postback.OrderID'],
            fullResponse: processorResponse
          });
          throw new Error('Order ID mismatch in processor response');
        }

        // Update order with processor response
        console.log('Updating order with processor response:', {
          timestamp: new Date().toISOString(),
          orderId,
          status: processorResponse.Success === 'Y' ? 'paid' : 'failed',
          response: processorResponse
        });

        const { error: updateError } = await supabase
          .from('orders')
          .update({
            payment_processor_response: processorResponse,
            payment_status: processorResponse.Success === 'Y' ? 'paid' : 'failed'
          })
          .eq('order_id', orderId);

        if (updateError) {
          console.error('Failed to update order with processor response:', {
            timestamp: new Date().toISOString(),
            orderId,
            error: updateError,
            response: processorResponse
          });
        } else {
          console.log('Order successfully updated with processor response:', {
            timestamp: new Date().toISOString(),
            orderId,
            status: processorResponse.Success === 'Y' ? 'paid' : 'failed',
            response: processorResponse
          });
        }
      } catch (error) {
        console.error('Failed to parse processor response:', {
          timestamp: new Date().toISOString(),
          orderId,
          error,
          responseText,
          errorStack: error.stack
        });
        throw new Error('Invalid processor response format');
      }
    } else {
      console.error('Processor request failed:', {
        timestamp: new Date().toISOString(),
        orderId,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers)
      });
    }

    // Return success response immediately
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        orderId,
        message: 'Payment processing initiated'
      })
    };

  } catch (error: any) {
    console.error('Payment processing error:', {
      timestamp: new Date().toISOString(),
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: error.message || 'Failed to process payment'
      })
    };
  }
};