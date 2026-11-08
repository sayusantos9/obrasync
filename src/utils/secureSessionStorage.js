// Native secrets use the OS keychain. Chunks stay below SecureStore value limits,
// including Unicode. Publish the manifest only after all chunks are durable.
export function createSecureSessionStorage(secure,legacy){
 const locks=new Map(),base=k=>'obs.session.'+Array.from(k).map(c=>c.codePointAt(0).toString(16)).join('.');
 function run(k,fn){const p=(locks.get(k)||Promise.resolve()).catch(()=>{}).then(fn);locks.set(k,p);return p;}
 async function manifest(k){const raw=await secure.getItemAsync(base(k));if(!raw)return null;const m=JSON.parse(raw);if(m.v!==1||!/^[-\w]+$/.test(m.g)||!Number.isInteger(m.n)||m.n<1||m.n>1024)throw new Error('Sessão protegida inválida. Entre novamente.');return m;}
 const part=(k,m,i)=>`${base(k)}.${m.g}.${i}`;
 async function cleanup(k,m){if(m)await Promise.all(Array.from({length:m.n},(_,i)=>secure.deleteItemAsync(part(k,m,i)).catch(()=>{})));}
 async function write(k,value){
  const old=await manifest(k).catch(()=>null),characters=Array.from(String(value)),chunks=[];
  for(let i=0;i<characters.length;i+=350)chunks.push(characters.slice(i,i+350).join(''));
  if(!chunks.length)chunks.push('');
  const m={v:1,g:Date.now().toString(36)+'-'+Math.random().toString(36).slice(2),n:chunks.length};
  if(m.n>1024)throw new Error('Sessão excedeu o limite de armazenamento protegido.');
  try{for(let i=0;i<chunks.length;i++)await secure.setItemAsync(part(k,m,i),chunks[i]);await secure.setItemAsync(base(k),JSON.stringify(m));}catch(e){await cleanup(k,m);throw e;}
  await legacy.removeItem(k);await cleanup(k,old);
 }
 return {
  getItem:k=>run(k,async()=>{const m=await manifest(k);if(m){let value='';for(let i=0;i<m.n;i++){const p=await secure.getItemAsync(part(k,m,i));if(p==null)throw new Error('Sessão protegida incompleta. Entre novamente.');value+=p;}await legacy.removeItem(k);return value;}
   const old=await legacy.getItem(k);if(old!=null)await write(k,old);return old;
  }),
  setItem:(k,v)=>run(k,()=>write(k,v)),
  removeItem:k=>run(k,async()=>{await legacy.removeItem(k);const m=await manifest(k).catch(()=>null);await secure.deleteItemAsync(base(k));await cleanup(k,m);}),
 };
}
