export interface OrderItem {
  _id?: string;
  productId: any;
  productName: string;
  packingSize: string;
  quantity: number;
  price: number;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
export type PaymentStatus = 'Pending' | 'Paid' | 'Failed';

export interface Order {
  _id: string;
  orderNumber: string;
  userId: any;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  gstAmount: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paymentMethod: string;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}
