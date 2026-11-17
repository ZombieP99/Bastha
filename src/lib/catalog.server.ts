import 'server-only';
import { cache } from 'react';
import { getProductListings, getShopById } from './api';
export const readProduct = cache(getProductListings);
export const readShop = cache(getShopById);
