// Add FFL dealer type
export interface FFLDealer {
  lic_regn: string;
  lic_dist: string;
  lic_cnty: string;
  lic_type: string;
  lic_xprdte: string;
  lic_seqn: string;
  license_name: string;
  business_name: string;
  premise_street: string;
  premise_city: string;
  premise_state: string;
  premise_zip_code: string;
  mail_street?: string;
  mail_city?: string;
  mail_state?: string;
  mail_zip_code?: string;
  voice_phone: string;
  distance?: number;
}

// Payment form data
export interface PaymentFormData {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  nameOnCard: string;
  billingAddress: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

// Full payment data including shipping and FFL info
export interface PaymentData extends PaymentFormData {
  orderId: string;
  amount: number;
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    options?: Record<string, any>;
  }>;
  email: string;
  phone: string;
  shippingAddress?: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  fflDealerInfo?: FFLDealer;
}

export interface PaymentResult {
  success: boolean;
  orderId: string;
  message?: string;
  transactionId?: string;
  authCode?: string;
}