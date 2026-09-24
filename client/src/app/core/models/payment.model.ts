export interface Payment {
  _id: string;
  orderId: string;
  userId: string;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  paymentStatus: 'SUCCESS' | 'FAILED';
  createdAt: string;
}

export interface CardDetails {
  cardNumber: string;
  expiry: string;
  cvv: string;
  cardHolder: string;
}

export interface PaymentProcessPayload {
  orderId: string;
  paymentMethod: 'Card' | 'UPI' | 'Net Banking';
  cardDetails?: CardDetails;
  upiId?: string;
  bankName?: string;
}
