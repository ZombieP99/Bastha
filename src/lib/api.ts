import axios from 'axios';
import { Category, Product, Shop, Listing, User } from '@/types';

const API_BASE_URL = 'https://bastah-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor for auth token if available in localStorage
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Categories
export const getCategories = async (): Promise<Category[]> => {
  const { data } = await api.get('/categories');
  return data.categories || [];
};

// Shops
export const getShops = async (): Promise<Shop[]> => {
  const { data } = await api.get('/shops');
  return data.shops || [];
};

export const getTopShops = async (limit: number = 10): Promise<Shop[]> => {
  const { data } = await api.get(`/shops/top?limit=${limit}`);
  return data.shops || [];
};

export const getShopById = async (id: string): Promise<Shop> => {
  const { data } = await api.get(`/shops/${id}`);
  return data.shop;
};

export const getShopProducts = async (shopId: string) => {
  const { data } = await api.get(`/shops/${shopId}/products`);
  return data.listings || [];
};

// Products
export const getProducts = async (page: number = 1, limit: number = 20) => {
  const { data } = await api.get(`/products?page=${page}&limit=${limit}`);
  return data; // { products, page, limit, total }
};

export const getFeaturedProducts = async (limit: number = 10): Promise<Product[]> => {
  const { data } = await api.get(`/products/featured?limit=${limit}`);
  return data.products || [];
};

export const getNewProducts = async (page: number = 1, limit: number = 20) => {
  const { data } = await api.get(`/products/new?page=${page}&limit=${limit}`);
  return data;
};

export const searchProducts = async (query: string, category?: string, sort?: string, page: number = 1, limit: number = 20) => {
  const params = new URLSearchParams();
  if (query) params.append('q', query);
  if (category) params.append('category', category);
  if (sort) params.append('sort', sort);
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  
  const { data } = await api.get(`/products/search?${params.toString()}`);
  return data;
};

export const getProductListings = async (productId: string) => {
  const { data } = await api.get(`/products/${productId}/listings`);
  return data; // { product, listings }
};

export default api;
