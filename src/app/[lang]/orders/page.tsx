import Link from 'next/link';
import OrdersView from '@/components/orders/OrdersView';

export default async function OrdersPage({ params, searchParams }: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ id?: string; checkout?: string }>;
}) {
  const [{ lang }, { id, checkout }] = await Promise.all([params, searchParams]);
  return <>{(checkout === 'cart_changed' || checkout === 'cart_empty') && <p role="status" className="mx-auto mt-4 max-w-5xl rounded-xl bg-amber-50 p-4">{lang === 'ar' ? 'راجع أحدث طلباتك. إذا لم تجد طلبك، ارجع إلى السلة.' : 'Check your latest orders. If your order is missing, review your cart.'} <Link className="underline" href={'/'+lang+'/cart'}>{lang === 'ar' ? 'مراجعة السلة' : 'Review cart'}</Link></p>}<OrdersView lang={lang} ids={typeof id === 'string' ? id : undefined}/></>;
}

