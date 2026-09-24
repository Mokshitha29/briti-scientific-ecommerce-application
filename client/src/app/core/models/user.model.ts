export interface User {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  companyName?: string;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}
