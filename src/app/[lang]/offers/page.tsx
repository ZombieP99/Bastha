import OfferList from '@/components/offers/OfferList';
export default async function OffersPage({params}:{params:Promise<{lang:string}>}) {
  const {lang}=await params;
  return <main className="mx-auto max-w-5xl px-4 py-8"><OfferList lang={lang}/></main>;
}