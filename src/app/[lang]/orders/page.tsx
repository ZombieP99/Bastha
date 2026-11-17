import OrdersView from '@/components/orders/OrdersView';
export default async function OrdersPage({params}:{params:Promise<{lang:string}>}) {const {lang}=await params;return <OrdersView lang={lang}/>;}
