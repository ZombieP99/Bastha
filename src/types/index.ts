export interface User {
  _id: string;
  id?: string; // some endpoints return 'id' instead of '_id' for user
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'seller' | 'admin';
  createdAt?: string;
}

export interface Category {
  _id: string;
  name: string;
  nameAr: string;
  slug: string;
  icon?: string;
  parent?: string | null;
  isActive: boolean;
}

export interface Shop {
  _id: string;
  owner?: User | string;
  name: string;
  phone: string;
  area?: string;
  address?: string;
  description?: string;
  logoUrl?: string;
  category?: Category | string | null;
  isActive: boolean;
  isVerified: boolean;
  ratingAvg: number;
  ratingCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Product {
  _id: string;
  name: string;
  nameAr: string;
  description?: string;
  category?: Category | string;
  unit?: string;
  imageUrl?: string;
  isFeatured: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Listing {
  _id: string;
  price: number;
  inStock: boolean;
  shop: Shop;
}

export interface PaginatedResponse<T> {
  page: number;
  limit: number;
  total: number;
  data: T[]; // Helper field, actual response keys vary (e.g., 'products')
}
