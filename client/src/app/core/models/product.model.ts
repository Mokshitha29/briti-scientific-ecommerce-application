import { Category } from './category.model';

export interface Packing {
  _id?: string;
  size: string;
  price: number;
  stock: number;
}

export interface Product {
  _id: string;
  productCode: string;
  name: string;
  casNumber: string;
  category: Category | string;
  description: string;
  purity: string;
  hsnCode: string;
  gst: number;
  image: string;
  packings: Packing[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductListResponse {
  success: boolean;
  message: string;
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
