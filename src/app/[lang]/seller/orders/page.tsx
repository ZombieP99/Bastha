import OrdersView from '@/components/orders/OrdersView';

export default async function OrdersPage({ params, searchParams }: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ id?: string }>;
}) {
  const [{ lang }, { id }] = await Promise.all([params, searchParams]);
  return <OrdersView lang={lang} ids={typeof id === 'string' ? id : undefined} seller/>;
}

