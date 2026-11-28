import { test } from 'node:test';
import { createRequire } from 'node:module';
const loadPackage = createRequire(import.meta.url);
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import ts from 'typescript';

function runtime(overrides = {}) {
 const cache = new Map();
 const memory = new Map();
 const storage = { getItem: key => memory.get(key) ?? null, setItem: (key,value) => memory.set(key,value), removeItem:key=>memory.delete(key) };
 const load = file => {
  file = path.resolve(file);
  if(cache.has(file))return cache.get(file).exports;
  const cachedModule={exports:{}};cache.set(file,cachedModule);
  const source=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true,target:ts.ScriptTarget.ES2022}}).outputText;
  const localRequire=name=>{
   if(Object.hasOwn(overrides,name))return overrides[name];
   if(name==='zustand/middleware'){const real=loadPackage(name);return {...real,persist:(config,options)=>real.persist(config,{...options,storage:real.createJSONStorage(()=>storage)})};}
   if(name.startsWith('@/'))return load('src/'+name.slice(2)+'.ts');
   if(name.startsWith('.'))return load(path.resolve(path.dirname(file),name+'.ts'));
   return loadPackage(name);
  };
  vm.runInNewContext(source,{module:cachedModule,exports:cachedModule.exports,require:localRequire,console,process:{env:{GEMINI_API_KEY:'test',GEMINI_MODEL:'test'}},localStorage:storage,window:overrides.window || {},setTimeout,clearTimeout,fetch:overrides.fetch||fetch,Request,Response,Headers,TextDecoder,Uint8Array,AbortSignal,URL,URLSearchParams,Date}, {filename:file});
  return cachedModule.exports;
 };
 return {load,memory};
}
function deferred(){let resolve,reject;const promise=new Promise((res,rej)=>{resolve=res;reject=rej;});return {promise,resolve,reject};}
function transport(){
 const requests=[];const instance={interceptors:{request:{use(){}},response:{use(){}}}};
 for(const method of ['get','post','patch','delete'])instance[method]=(url,body)=>{const pending=deferred();requests.push({method,url,body,...pending});return pending.promise;};
 return {requests,axios:{create:()=>instance,isAxiosError:e=>!!e.isAxiosError}};
}
test('late account response cannot restore a logged-out session',async()=>{
 const t=transport(),r=runtime({axios:t.axios});const store=r.load('src/store/useAuthStore.ts').useAuthStore;
 store.setState({token:'A',isAuthenticated:true});const pending=store.getState().loadUser();store.getState().logout();t.requests[0].resolve({data:{user:{_id:'A'}}});await pending;
 assert.equal(store.getState().token,null);assert.equal(store.getState().user,null);assert.equal(store.getState().isAuthenticated,false);
});
test('temporary account failure preserves token; unauthorized account clears it',async()=>{
 const t=transport(),store=runtime({axios:t.axios}).load('src/store/useAuthStore.ts').useAuthStore;
 store.setState({token:'A'});let pending=store.getState().loadUser();t.requests[0].reject(new Error('offline'));await pending;assert.equal(store.getState().token,'A');assert.equal(store.getState().isLoading,false);
 pending=store.getState().loadUser();t.requests[1].reject({isAxiosError:true,response:{status:401}});await pending;assert.equal(store.getState().token,null);
});
test('login rejects a token without a user',async()=>{
 const t=transport(),store=runtime({axios:t.axios}).load('src/store/useAuthStore.ts').useAuthStore;
 const pending=store.getState().login({email:'test@example.com',password:'password'});t.requests[0].resolve({data:{token:'A'}});await assert.rejects(pending,/Invalid login response/);assert.equal(store.getState().isAuthenticated,false);
});
test('cart discards previous account response and blocks concurrent writes',async()=>{
 const t=transport(),r=runtime({axios:t.axios});const auth=r.load('src/store/useAuthStore.ts').useAuthStore,cart=r.load('src/store/useCartStore.ts').useCartStore;
 auth.setState({token:'A',isAuthenticated:true});const pending=cart.getState().addItem('listing');await assert.rejects(cart.getState().updateQuantity('listing',2));auth.getState().logout();t.requests[0].resolve({data:{cart:{items:[{quantity:2}]}}});await pending;assert.equal(cart.getState().items.length,0);
});
test('cart badge counts quantities rather than distinct listings',()=>{
 const t=transport(),r=runtime({axios:t.axios});const cart=r.load('src/store/useCartStore.ts').useCartStore;cart.setState({items:[{quantity:2,listing:{price:3}},{quantity:4,listing:{price:2}}]});assert.equal(cart.getState().getTotalItems(),6);assert.equal(cart.getState().getTotalPrice(),14);
});
test('notification delete waits for backend and leaves data on failure',async()=>{
 const t=transport(),r=runtime({axios:t.axios});const auth=r.load('src/store/useAuthStore.ts').useAuthStore,store=r.load('src/store/useNotificationStore.ts').useNotificationStore;
 auth.setState({token:'A',isAuthenticated:true});store.setState({notifications:[{id:'n',title:'private'}]});const pending=store.getState().deleteNotification('n');assert.equal(store.getState().notifications.length,1);t.requests[0].reject(new Error('offline'));await assert.rejects(pending);assert.equal(store.getState().notifications.length,1);auth.getState().logout();assert.equal(store.getState().notifications.length,0);
});
test('reading all notifications uses PATCH and refreshes the badge independently of the preview', async () => {
 const t = transport(), r = runtime({axios:t.axios});
 r.load('src/store/useAuthStore.ts').useAuthStore.setState({token:'A',isAuthenticated:true});
 const store = r.load('src/store/useNotificationStore.ts').useNotificationStore;
 const pending = store.getState().markAllAsRead();
 assert.equal(t.requests[0].method,'patch');
 assert.equal(t.requests[0].url,'/notifications/read-all');
 t.requests[0].resolve({data:{updated:1}});
 await new Promise(resolve => setImmediate(resolve));
 const count = t.requests.find(req => req.url === '/notifications/unread-count');
 const preview = t.requests.find(req => req.url === '/notifications');
 count.resolve({data:{count:102}});
 preview.resolve({data:{notifications:[]}});
 await pending;
 assert.equal(store.getState().unreadCount,102);
 assert.equal(store.getState().notifications.length,0);
});
test('order transitions respect terminal states and pickup versus delivery',()=>{
 const {nextStatuses}=runtime().load('src/lib/orders.ts');assert.deepEqual(Array.from(nextStatuses('completed',true)),[]);assert.deepEqual(Array.from(nextStatuses('cancelled',true)),[]);assert.deepEqual(Array.from(nextStatuses('ready',false)),['completed','cancelled']);assert.deepEqual(Array.from(nextStatuses('ready',true)),['delivering','cancelled']);
});
test('customer tracking follows the permitted fulfillment path for delivery and pickup',()=>{
 const {orderSteps,nextStatuses}=runtime().load('src/lib/orders.ts');
 for(const delivery of [true,false]){
   const steps=Array.from(orderSteps(delivery));
   assert.equal(steps[0],'pending');
   assert.equal(steps.at(-1),'completed');
   assert.equal(steps.includes('delivering'),delivery);
   assert.equal(steps.includes('cancelled'),false);
   for(let i=1;i<steps.length;i++)assert.ok(nextStatuses(steps[i-1],delivery).includes(steps[i]));
 }
});
test('chat rejects anonymous, malformed, oversized, and cross-origin requests before provider calls',async()=>{
 let calls=0;const {POST}=runtime({fetch:async()=>{calls++;throw new Error('unexpected');}}).load('src/app/api/chat/route.ts');
 const req=(body,headers={})=>new Request('http://localhost/api/chat',{method:'POST',body,headers});
 assert.equal((await POST(req('{}'))).status,401);
 const headers={authorization:'Bearer A'};
 assert.equal((await POST(req('invalid',headers))).status,400);
 assert.equal((await POST(req(JSON.stringify({message:42}),headers))).status,400);
 assert.equal((await POST(req(JSON.stringify({message:'x'.repeat(3000)}),headers))).status,400);
 assert.equal((await POST(req('x'.repeat(9000),headers))).status,413);
 assert.equal((await POST(req('{"message":"hi"}',{...headers,origin:'https://other.invalid'}))).status,403);
 assert.equal(calls,0);
});
test('chat validates account and rate-limits each authenticated user',async()=>{
 let generated=0;const {POST}=runtime({fetch:async()=>Response.json({user:{_id:'test'}}),'@google/generative-ai':{GoogleGenerativeAI:class {getGenerativeModel(){return {generateContent:async()=>{generated++;return {response:{text:()=> 'reply'}};}};}}}}).load('src/app/api/chat/route.ts');
 for(let i=0;i<10;i++){const result=await POST(new Request('http://localhost/api/chat',{method:'POST',headers:{authorization:'Bearer A'},body:'{"message":"hello"}'}));assert.equal(result.status,200);assert.equal((await result.json()).text,'reply');}
 const limited=await POST(new Request('http://localhost/api/chat',{method:'POST',headers:{authorization:'Bearer A'},body:'{"message":"hello"}'}));assert.equal(limited.status,429);assert.equal(generated,10);
});

test('product image paths use the backend root and preserve the backend default image',()=>{
 const {productImageSrc}=runtime().load('src/lib/product-images.ts');
 assert.equal(productImageSrc({imageUrl:'/images/products/item.webp'},'https://backend.example/api'),'https://backend.example/images/products/item.webp');
 assert.equal(productImageSrc({imageUrl:'/images/products/default.jpg'},'https://backend.example/api'),'https://backend.example/images/products/default.jpg');
 assert.equal(productImageSrc({imageUrl:'/images/products/new-file.webp'},'https://backend.example/api'),'https://backend.example/images/products/new-file.webp');
});
test('local backend images follow the configured origin and port',()=>{
 const {productImageSrc}=runtime().load('src/lib/product-images.ts');
 assert.equal(productImageSrc({imageUrl:'/images/products/item.webp'},'http://localhost:4000/api/'),'http://localhost:4000/images/products/item.webp');
});
test('missing or malformed product images use the bundled safety fallback',()=>{
 const {productImageSrc,LOCAL_PRODUCT_PLACEHOLDER}=runtime().load('src/lib/product-images.ts');
 for(const product of [null,undefined,{}, {imageUrl:''},{imageUrl:'//other.example/file.jpg'},{imageUrl:'https://other.example/file.jpg'}])assert.equal(productImageSrc(product),LOCAL_PRODUCT_PLACEHOLDER);
});

test('wishlist survives sign-out and token rotation while isolating customer and guest selections',()=>{
 const t=transport(),r=runtime({axios:t.axios});
 const auth=r.load('src/store/useAuthStore.ts').useAuthStore;
 const store=r.load('src/store/useWishlistStore.ts').useWishlistStore;
 const signIn=(id,token)=>auth.setState({user:{id},token,isAuthenticated:true});
 store.getState().toggleWishlist({_id:'guest-product'});
 signIn('a','1');assert.equal(store.getState().items.length,0);
 store.getState().toggleWishlist({_id:'a-product'});
 signIn('a','2');assert.equal(store.getState().items[0]._id,'a-product');
 signIn('b','3');assert.equal(store.getState().items.length,0);
 auth.getState().logout();assert.equal(store.getState().items[0]._id,'guest-product');
 signIn('a','4');assert.equal(store.getState().items[0]._id,'a-product');
});
test('customer login returns to the chosen listing and accepts only product and listing IDs',()=>{
 const {shoppingLogin,afterCustomerLogin}=runtime().load('src/lib/shopping-login.ts');
 const product='a'.repeat(24),listing='b'.repeat(24);
 for(const lang of ['ar','en']){
   const url=new URL(shoppingLogin(lang,product,listing),'http://localhost');
   assert.equal(afterCustomerLogin(lang,url.search),'/'+lang+'/products/'+product+'?listing='+listing+'#listing-'+listing);
   assert.equal(afterCustomerLogin(lang,'?product=https://elsewhere.test&listing='+listing),'/'+lang);
   assert.equal(afterCustomerLogin(lang,''),'/'+lang);
 }
});

test('checkout recovery distinguishes duplicate confirmation, lost reply and fixable refusals', () => {
 const {checkoutRecovery,orderStatusConflict}=runtime().load('src/lib/orders.ts');
 const refusal=(status,code)=>({isAxiosError:true,response:{status,data:{code}}});
 assert.equal(checkoutRecovery(refusal(400,'cart_empty')),'cart_empty');
 assert.equal(checkoutRecovery(refusal(409,'cart_changed')),'cart_changed');
 for(const code of ['item_unavailable','out_of_stock','shop_closed','no_delivery_to_area'])
   assert.equal(checkoutRecovery(refusal(409,code)),'refresh-cart');
 assert.equal(checkoutRecovery({isAxiosError:true}),'check-orders');
 assert.equal(checkoutRecovery(refusal(400)),'review-input');
 assert.equal(orderStatusConflict(refusal(409,'order_changed')),true);
 assert.equal(orderStatusConflict(refusal(409)),true);
 assert.equal(orderStatusConflict(refusal(403)),false);
});

test('checkout messages use the route language and never display backend error text', () => {
 const codes=['cart_empty','cart_changed','item_unavailable','out_of_stock','shop_closed','no_delivery_to_area','order_changed'];
 for(const lang of ['ar','en']){
   const {errorMessage}=runtime({window:{location:{pathname:'/'+lang+'/checkout'}}}).load('src/lib/errors.ts');
   const text=code=>errorMessage({isAxiosError:true,response:{status:409,data:{code,error:'internal message'}}});
   const messages=codes.map(text);
   assert.equal(new Set(messages).size,codes.length);
   for(const message of [...messages,text(undefined),text('unknown')]){
     assert.notEqual(message,'internal message');
     assert.equal(/[\u0600-\u06ff]/u.test(message),lang==='ar');
   }
 }
});

test('cart reload keeps deleted and inactive lines visible and preserves them on a network failure', async () => {
 const t=transport(),r=runtime({axios:t.axios});
 r.load('src/store/useAuthStore.ts').useAuthStore.setState({token:'A',isAuthenticated:true});
 const {useCartStore:cart,hasCartListing}=r.load('src/store/useCartStore.ts');
 const pending=cart.getState().fetchCart();
 t.requests[0].resolve({data:{cart:{items:[{quantity:1,listing:null},{quantity:2,listing:{_id:'l',price:4,product:{isActive:false},shop:{_id:'s'}}}]}}});
 await pending;
 assert.equal(cart.getState().items.length,2);
 assert.equal(hasCartListing(cart.getState().items[0]),false);
 assert.equal(cart.getState().getTotalPrice(),8);
 const retry=cart.getState().fetchCart();
 t.requests[1].reject({isAxiosError:true});await retry;
 assert.equal(cart.getState().items.length,2);
 assert.ok(cart.getState().error);
});

test('shop search requests the selected server page with the original query', async () => {
 const t=transport();
 const {searchGroup}=runtime({axios:t.axios}).load('src/lib/api.ts');
 const result=searchGroup('shops','حَقِيبَة',2);
 assert.equal(t.requests[0].url,'/search');
 assert.deepEqual({...t.requests[0].body.params},{type:'shops',q:'حَقِيبَة',page:2,limit:20});
 t.requests[0].resolve({data:{results:[{_id:'store'}],total:21}});
 assert.equal((await result).results[0]._id,'store');
});
