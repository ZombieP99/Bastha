import { API_BASE_URL } from '@/lib/config';

export const LOCAL_PRODUCT_PLACEHOLDER = '/images/product-placeholder.svg';

/** Product photos live at the backend root, never under /api or the frontend origin. */
export function productImageSrc(product: { imageUrl?: string | null } | null | undefined, apiBaseUrl = API_BASE_URL): string {
  const path = product?.imageUrl;
  if (!path || !path.startsWith('/images/')) return LOCAL_PRODUCT_PLACEHOLDER;
  return new URL(apiBaseUrl).origin + path;
}
