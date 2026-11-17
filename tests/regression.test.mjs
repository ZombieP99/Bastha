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
  vm.runInNewContext(source,{module:cachedModule,exports:cachedModule.exports,require:localRequire,console,process:{env:{GEMINI_API_KEY:'test',GEMINI_MODEL:'test'}},localStorage:storage,window:{},setTimeout,clearTimeout,fetch:overrides.fetch||fetch,Request,Response,Headers,TextDecoder,Uint8Array,AbortSignal,URL,Date}, {filename:file});
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
test('login does not report success if loading the account fails',async()=>{
 const t=transport(),store=runtime({axios:t.axios}).load('src/store/useAuthStore.ts').useAuthStore;
 const pending=store.getState().login({email:'test@example.com',password:'password'});t.requests[0].resolve({data:{token:'A'}});await new Promise(setImmediate);t.requests[1].reject(new Error('offline'));await assert.rejects(pending);assert.equal(store.getState().isAuthenticated,false);
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
test('order transitions respect terminal states and pickup versus delivery',()=>{
 const {nextStatuses}=runtime().load('src/lib/orders.ts');assert.deepEqual(Array.from(nextStatuses('completed',true)),[]);assert.deepEqual(Array.from(nextStatuses('cancelled',true)),[]);assert.deepEqual(Array.from(nextStatuses('ready',false)),['completed','cancelled']);assert.deepEqual(Array.from(nextStatuses('ready',true)),['delivering','cancelled']);
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
