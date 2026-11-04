import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
test('fila persiste, serializa gravações e isola empresa/usuário',async()=>{
 const storage=new Map();
 globalThis.__queueStorage={getItem:async k=>storage.get(k)||null,setItem:async(k,v)=>storage.set(k,v)};
 const source=fs.readFileSync(new URL('../src/services/requestQueue.js',import.meta.url),'utf8').replace("import AsyncStorage from '@react-native-async-storage/async-storage';",'const AsyncStorage=globalThis.__queueStorage;');
 const queue=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
 const user={id:'u',companyId:'c'};
 const record=id=>({id,userId:'u',companyId:'c',projectId:'p',data:{material:'Cabo'}});
 await Promise.all([queue.updateRequestQueue(user,r=>[...r,record('a')]),queue.updateRequestQueue(user,r=>[...r,record('b')])]);
 assert.equal((await queue.readRequestQueue(user)).length,2);
 assert.deepEqual(await queue.readRequestQueue({id:'other',companyId:'c'}),[]);
 assert.deepEqual(await queue.readRequestQueue({id:'u',companyId:'other'}),[]);
 await queue.updateRequestQueue(user,r=>r.filter(i=>i.id!=='a'));
 assert.equal((await queue.readRequestQueue(user))[0].id,'b');
 delete globalThis.__queueStorage;
});
