import SellerDashboard from '@/components/seller/SellerDashboard';
export default async function Page({params,searchParams}:{params:Promise<{lang:string}>;searchParams:Promise<{tab?:string;shop?:string}>}){const {lang}=await params;const {tab,shop}=await searchParams;return <SellerDashboard key={[tab,shop].join("-")} catalog={tab==="catalog"} lang={lang}/>;}
