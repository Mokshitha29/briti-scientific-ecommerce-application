import { Product } from './product.model';

export interface CartItem {
  _id: string;
  productId: Product | string;
  productName: string;
  packingSize: string;
  price: number;
  quantity: number;
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  gstAmount: number;
  totalAmount: number;
  itemCount: number;
}
