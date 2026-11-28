'use client';

import Image from 'next/image';
import { useState } from 'react';
import { LOCAL_PRODUCT_PLACEHOLDER, productImageSrc } from '@/lib/product-images';

export default function ProductImage({ product, alt, sizes, className = '', priority = false }: {
  product: { imageUrl?: string | null };
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
}) {
  const source = productImageSrc(product);
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const fallback = failedSource === source || source === LOCAL_PRODUCT_PLACEHOLDER;
  return <Image
    src={fallback ? LOCAL_PRODUCT_PLACEHOLDER : source}
    alt={alt}
    fill
    sizes={sizes}
    unoptimized
    loading={priority ? 'eager' : 'lazy'}
    className={`object-cover ${className}`}
    onError={() => { if (!fallback) setFailedSource(source); }}
  />;
}
