import OrdersView from '@/components/orders/OrdersView';
export default async function SuccessPage({params,searchParams}:{params:Promise<{lang:string}>;searchParams:Promise<{orders?:string}>}) {const {lang}=await params;const {orders}=await searchParams;return <OrdersView lang={lang} ids={orders||''}/>;}
