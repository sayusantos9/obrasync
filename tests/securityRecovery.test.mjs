import test from 'node:test';
import assert from 'node:assert/strict';
import {createSecureSessionStorage} from '../src/utils/secureSessionStorage.js';
import {setReauthenticationListener,finishReauthentication,rpcWithReauthentication,requestReauthentication} from '../src/services/recentAuth.js';
function memory(){const secureValues=new Map(),legacyValues=new Map();return {secureValues,legacyValues,secure:{getItemAsync:async k=>secureValues.get(k)??null,setItemAsync:async(k,v)=>{assert.ok(Buffer.byteLength(v)<=2000);secureValues.set(k,Buffer.from(v,'utf8').toString('utf8'));},deleteItemAsync:async k=>secureValues.delete(k)},legacy:{getItem:async k=>legacyValues.get(k)??null,setItem:async(k,v)=>legacyValues.set(k,v),removeItem:async k=>legacyValues.delete(k)}};}
test('Sessão longa com Unicode migra para armazenamento protegido e remove cópia legada',async()=>{
 const m=memory(),storage=createSecureSessionStorage(m.secure,m.legacy),value=JSON.stringify({refresh_token:'secret',user:{name:'🛠️José'.repeat(2000)}});m.legacyValues.set('sb-auth',value);
 assert.equal(await storage.getItem('sb-auth'),value);assert.equal(m.legacyValues.size,0);assert.ok(m.secureValues.size>2);await storage.removeItem('sb-auth');assert.equal(m.secureValues.size,0);
});
test('Falha no meio da gravação preserva sessão anterior; operações concorrentes são serializadas',async()=>{
 const m=memory(),storage=createSecureSessionStorage(m.secure,m.legacy);await storage.setItem('auth','old');const set=m.secure.setItemAsync;let n=0;m.secure.setItemAsync=async(k,v)=>{if(++n===2)throw Error('Keychain unavailable');return set(k,v);};
 await assert.rejects(storage.setItem('auth','x'.repeat(2000)));m.secure.setItemAsync=set;assert.equal(await storage.getItem('auth'),'old');await Promise.all([storage.setItem('auth','first'),storage.setItem('auth','second')]);assert.equal(await storage.getItem('auth'),'second');
});
test('Sessão corrompida não recai silenciosamente para token antigo; novo login e remoção recuperam o armazenamento',async()=>{
 const m=memory(),storage=createSecureSessionStorage(m.secure,m.legacy);await storage.setItem('auth','old');const base=[...m.secureValues.keys()].find(k=>k.split('.').length===6);const manifestKey=[...m.secureValues.keys()].find(k=>{try{return JSON.parse(m.secureValues.get(k)).v===1;}catch{return false;}});m.secureValues.set(manifestKey,'broken');m.legacyValues.set('auth','obsolete');await assert.rejects(storage.getItem('auth'));await storage.setItem('auth','new');assert.equal(await storage.getItem('auth'),'new');await storage.removeItem('auth');assert.equal(await storage.getItem('auth'),null);
});
test('RPC só repete após rejeição explícita de autenticação, com os mesmos dados e a mesma conta',async()=>{
 let calls=0,who='u';const args={id:'order',clientRequestId:'stable'},client={auth:{getSession:async()=>({data:{session:{user:{id:who}}}})},rpc:async(name,payload)=>{assert.equal(payload,args);return ++calls===1?{error:{message:'REAUTH_REQUIRED'}}:{data:'ok'};}};
 const off=setReauthenticationListener(()=>queueMicrotask(()=>finishReauthentication()));assert.equal((await rpcWithReauthentication(client,'action',args)).data,'ok');assert.equal(calls,2);off();
 calls=0;const off2=setReauthenticationListener(()=>queueMicrotask(()=>{who='other';finishReauthentication();}));await assert.rejects(rpcWithReauthentication(client,'action',args),/conta mudou/);assert.equal(calls,1);off2();
});
test('Cancelamento não repete ação; erro de rede não abre confirmação nem repete mutação',async()=>{
 let calls=0;const client={auth:{getSession:async()=>({data:{session:{user:{id:'u'}}}})},rpc:async()=>{calls++;return {error:{message:'MFA_REQUIRED'}};}};
 const off=setReauthenticationListener(()=>queueMicrotask(()=>finishReauthentication(new Error('Cancelada'))));await assert.rejects(rpcWithReauthentication(client,'action',{}),/Cancelada/);assert.equal(calls,1);off();
 client.rpc=async()=>{calls++;throw Error('fetch failed');};await assert.rejects(rpcWithReauthentication(client,'action',{}),/fetch/);assert.equal(calls,2);await assert.rejects(requestReauthentication(),/Segurança/);
});
