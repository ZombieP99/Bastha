import SellerDashboard from '@/components/seller/SellerDashboard';
export default async function Page({params}:{params:Promise<{lang:string}>}){const {lang}=await params;return <SellerDashboard lang={lang}/>;}
