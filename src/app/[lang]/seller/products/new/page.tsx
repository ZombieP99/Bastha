import CreateProduct from '@/components/seller/CreateProduct';
export default async function Page({params,searchParams}:{params:Promise<{lang:string}>;searchParams:Promise<{shop?:string}>}) {const {lang}=await params;return <CreateProduct lang={lang} shop={(await searchParams).shop}/>;}
