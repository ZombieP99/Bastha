import CreateProduct from '@/components/seller/CreateProduct';
export default async function Page({params}:{params:Promise<{lang:string}>}) {const {lang}=await params;return <CreateProduct lang={lang}/>;}
