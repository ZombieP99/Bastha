import { readProduct } from '@/lib/catalog.server';
import { notFound } from 'next/navigation';
import axios from 'axios';
import type { Metadata } from 'next';
import ProductDetails from '@/components/products/ProductDetails';
import { getDictionary } from '@/i18n/dictionaries';

export default async function ProductPage({
  params,
}: {
  params: Promise<{ lang: string; productId: string }>;
}) {
  const resolvedParams = await params;
  const lang = resolvedParams.lang as 'en' | 'ar';
  const productId = resolvedParams.productId;
  const dict = await getDictionary(lang);
  let initialData;
  try { initialData=await readProduct(productId); }
  catch(error) { if(axios.isAxiosError(error)&&[400,404].includes(error.response?.status||0))notFound();throw error; }


  return (
    <div className="bg-white min-h-screen">
      <ProductDetails key={productId} dict={dict} lang={lang} productId={productId} initialData={initialData} />
    </div>
  );
}

export async function generateMetadata({params}:{params:Promise<{lang:string;productId:string}>}):Promise<Metadata> {
 const {lang,productId}=await params;
 try {const {product}=await readProduct(productId);const title=(lang==='ar'?product.nameAr:product.name)+' | Bastha';return {title,description:product.description,alternates:{languages:{ar:'/ar/products/'+productId,en:'/en/products/'+productId}}};}
 catch {return {title:lang==='ar'?'المنتج | بسطة':'Product | Bastha'};}
}
