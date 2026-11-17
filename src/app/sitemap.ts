import type { MetadataRoute } from 'next';
export default function sitemap(): MetadataRoute.Sitemap {
 const origin=process.env.NEXT_PUBLIC_SITE_URL;
 if(!origin)return [];
 return ['ar','en'].flatMap(lang=>['','/products','/shops','/support'].map(route=>({url:new URL('/'+lang+route,origin).href,alternates:{languages:{ar:new URL('/ar'+route,origin).href,en:new URL('/en'+route,origin).href}}})));
}
