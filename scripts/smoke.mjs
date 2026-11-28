const base = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:3100';
const routes = [
 ['/',307],['/ar',200],['/en',200],['/ar/auth',200],['/en/auth',200],
 ['/ar/search?q=test&page=2',200],['/ar/orders',200],['/ar/profile',200],
 ['/ar/checkout/success?orders=bad',200],['/ar/seller/dashboard',200],
 ['/ar/offers',200],['/en/offers',200],['/ar/admin/dashboard',200],['/ar/profile/edit',200],['/ar/seller/profile',200],['/ar/seller/products/new',200],['/ar/support',200],['/robots.txt',200],['/sitemap.xml',200],
 ['/ar/products?page=abc',200],['/ar/shops',200],['/ar/not-a-page',404]
];
let failed = false;
const results = await Promise.all(routes.map(async ([path,expected]) => {
 try {
  const response = await fetch(base+path,{redirect:'manual',signal:AbortSignal.timeout(30000)});
  const html = await response.text();
  const ok = response.status===expected;
  if(!ok)failed=true;
  if(path==='/ar' && !html.includes('dir="rtl"'))failed=true;
  if(path==='/en' && !html.includes('dir="ltr"'))failed=true;
  return {path,status:response.status,expected,ok};
 } catch(error) {failed=true;return {path,error:error.message,ok:false};}
}));
try {
 const response=await fetch(base+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:'{"message":"test"}',signal:AbortSignal.timeout(10000)});
 const ok=response.status===401;if(!ok)failed=true;results.push({path:'POST /api/chat (anonymous)',status:response.status,expected:401,ok});
}catch(error){failed=true;results.push({path:'/api/chat',error:error.message,ok:false});}
console.log(JSON.stringify(results,null,2));
if(failed)process.exitCode=1;
