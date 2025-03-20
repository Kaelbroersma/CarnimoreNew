interface Address {
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface PaymentData {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  amount: number;
  shippingAddress: Address;
  billingAddress?: Address | null;
  orderId: string;
  email: string;
  phone: string;
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    options: Record<string, any>;
  }>;
}

export interface PaymentResult {
  orderId: string;
  status: 'pending' | 'paid' | 'failed';
  message: string;
  transactionId?: string;
  authCode?: string;
  responseMessage?: string;
}

export interface EPNResponse {
  Success: 'Y' | 'N' | 'U'; // Y = Approved, N = Declined, U = Unable to process
  RespText: string;
  XactID?: string;
  AuthCode?: string;
  AVSResp?: string; // Address verification response
  CVV2Resp?: string; // CVV verification response
  Response?: string; // Added Response field for processor message
}