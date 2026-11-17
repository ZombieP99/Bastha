import type { MetadataRoute } from 'next';
export default function robots(): MetadataRoute.Robots {
 const origin=process.env.NEXT_PUBLIC_SITE_URL;
 return {rules:{userAgent:'*',allow:['/ar','/en'],disallow:['/api/','/ar/auth','/en/auth','/ar/profile','/en/profile','/ar/cart','/en/cart','/ar/checkout','/en/checkout','/ar/orders','/en/orders','/ar/notifications','/en/notifications','/ar/seller','/en/seller']},...(origin?{sitemap:new URL('/sitemap.xml',origin).href}:{})};
}
