// Add FFL dealer type
export interface FFLDealer {
  LIC_REGN: string;
  LIC_DIST: string;
  LIC_CNTY: string;
  LIC_TYPE: string;
  LIC_XPRDTE: string;
  LIC_SEQN: string;
  LICENSE_NAME: string;
  BUSINESS_NAME: string;
  PREMISE_STREET: string;
  PREMISE_CITY: string;
  PREMISE_STATE: string;
  PREMISE_ZIP_CODE: string;
  MAIL_STREET: string;
  MAIL_CITY: string;
  MAIL_STATE: string;
  MAIL_ZIP_CODE: string;
  VOICE_PHONE: string;
  distance?: number;
}

// Payment form data
export interface PaymentFormData {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  nameOnCard: string;
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