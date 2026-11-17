'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCategories } from '@/lib/api';
import type { Category } from '@/types';
import type { Dictionary } from '@/types/dictionary';
export default function Categories({dict,lang}:{dict:Dictionary;lang:string}) {
 const [categories,setCategories]=useState<Category[]>([]);
 useEffect(()=>{let active=true;getCategories().then(data=>{if(active)setCategories(data);}).catch(()=>{});return()=>{active=false;};},[]);
 if(!categories.length)return null;
 return <section className="container mx-auto px-4 py-8"><h2 className="text-2xl font-bold mb-5">{dict.categories.title}</h2><div className="flex flex-wrap gap-3">{categories.map(category=><Link key={category._id} className="bg-white border rounded-xl p-4" href={'/'+lang+'/search?category='+encodeURIComponent(category._id)}>{lang==='ar'?category.nameAr:category.name}</Link>)}</div></section>;
}
