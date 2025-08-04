export interface User {
  id: number;
  email: string;
  name?: string;
  username?: string;
  phone?: string;
  imageUrl?: string;
  googleId?: string;
  createdAt: string;
  paidMiTienda?: boolean;
  paidMiTiendaDate?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface StoreData {
  storeName: string;
  storeLogo?: string;
  phoneNumber: string;
  countryCode: string;
}

export interface GeneratedImage {
  id: number;
  originalUrl: string;
  generatedUrl: string;
  createdAt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface ApiError {
  message: string;
  error?: string;
} 