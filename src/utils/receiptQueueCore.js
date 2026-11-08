export const isConnectionFailure=error=>!error?.code&&/network|fetch|connection|timeout|timed out|abort|internet|offline/i.test(String(error?.message||error));
export function receiptPayload(order,quantities,reference='',quality={}){
 if(!order?.id||order.approval_status!=='APPROVED'||!order.purchased_at||!['SENT','PARTIALLY_RECEIVED'].includes(order.status))throw new Error('Selecione um pedido comprado com saldo a receber.');
 const items=[];
 for(const i of order.items||[]){const remaining=Number(i.quantity)-Number(i.received_quantity||0),raw=quantities[i.id]??remaining,q=Number(String(raw).trim().replace(',','.'));
  if(String(raw).trim()===''||!Number.isFinite(q)||q<0||q>remaining+1e-8)throw new Error(`Revise a quantidade de ${i.name||i.description}: saldo ${remaining} ${i.unit}.`);
  const rejected=Number(String(quality[i.id]?.rejectedQuantity??0).trim().replace(',','.'));
  const reason=String(quality[i.id]?.reason||'').trim(),nonconformity=String(quality[i.id]?.nonconformity||'').trim();
  if(!Number.isFinite(rejected)||rejected<0||q+rejected>remaining+1e-8)throw new Error(`Revise a quantidade aceita e rejeitada de ${i.name||i.description}.`);
  if(rejected>0&&reason.length<5)throw new Error('Informe o motivo da rejeição com ao menos 5 caracteres.');
  if(q>0||rejected>0)items.push({id:i.id,quantity:q,...(rejected>0?{rejectedQuantity:rejected,reason,nonconformity}:{})});
 }
 if(!items.length)throw new Error('Informe ao menos uma quantidade maior que zero.');
 return {orderId:order.id,reference:reference.trim()||order.number,invoiceNumber:reference.trim(),items};
}

// Persist before sending. An ambiguous response never creates a new operation key.
export function createReceiptQueue(storage,send){
 const locks=new Map(),syncs=new Map();
 const key=u=>{if(!u?.id||!u.companyId)throw new Error('Sessão indisponível.');return `@obrasync:receipts:v1:${u.companyId}:${u.id}`;};
 async function readRaw(u){const raw=await storage.getItem(key(u));const rows=raw?JSON.parse(raw):[];if(!Array.isArray(rows)||rows.some(r=>r.userId!==u.id||r.companyId!==u.companyId))throw new Error('Fila de recebimentos inválida. Preserve os dados e contate o suporte.');return rows;}
 function change(u,fn){const k=key(u),p=(locks.get(k)||Promise.resolve()).catch(()=>{}).then(async()=>{const rows=await readRaw(u),next=fn(rows);await storage.setItem(k,JSON.stringify(next));return next;});locks.set(k,p);return p;}
 async function read(u){await (locks.get(key(u))||Promise.resolve()).catch(()=>{});return readRaw(u);}
 async function enqueue(u,projectId,order,data,id,action='RECEIVE'){
  if(!['RECEIVE','RETURN'].includes(action))throw new Error('Operação inválida.');
  if(!projectId||order.projectId!==projectId||!id)throw new Error('Pedido e obra incompatíveis.');
  const createdAt=new Date().toISOString();
  const record={id,userId:u.id,companyId:u.companyId,projectId,orderNumber:order.number,createdAt,action,state:'PENDING',attempts:0,data:{...data,clientRequestId:id,recordedAt:createdAt}};
  await change(u,rows=>{if(rows.some(r=>r.data.orderId===order.id))throw new Error('Este pedido já tem um recebimento na fila. Resolva-o antes de registrar outro.');return [...rows,record];});return record;
 }
 function sync(u,{retryConflicts=false,onChange=()=>{}}={}){
  const k=key(u);if(syncs.has(k))return syncs.get(k);
  const promise=(async()=>{const batch=await read(u);let completed=0;
   for(const record of batch){if(record.state==='CONFLICT'&&!retryConflicts)continue;
    // Re-read under the storage lock: discard and sync cannot race a deleted draft.
    let sending=false;await change(u,rows=>rows.map(r=>{if(r.id!==record.id)return r;sending=true;return {...r,attempts:r.attempts+1,state:'PENDING',uncertain:true,lastAttempt:new Date().toISOString()};}));if(!sending)continue;
    let result;
    try{result=await send(record.action||'RECEIVE',record.projectId,record.data,u);}catch(error){const state=isConnectionFailure(error)||!error.code||error.status>=500?'PENDING':'CONFLICT';await change(u,rows=>rows.map(r=>r.id===record.id?{...r,state,uncertain:!!record.uncertain||state==='PENDING',error:error.message||'Não foi possível enviar.'}:r));await onChange(await read(u));if(state==='PENDING')break;continue;}
    // If local deletion fails after a successful server commit, retry the SAME key later.
    await change(u,rows=>rows.filter(r=>r.id!==record.id));completed++;await onChange(await read(u),result);
   }return {completed,rows:await read(u)};
  })().finally(()=>syncs.delete(k));syncs.set(k,promise);return promise;
 }
 async function discard(u,id){return change(u,rows=>{const row=rows.find(r=>r.id===id);if(row&&(row.uncertain||(row.attempts>0&&row.state!=='CONFLICT')))throw new Error('O servidor pode ter registrado este envio. Sincronize com a mesma chave antes de removê-lo.');return rows.filter(r=>r.id!==id);});}
 return {read,enqueue,sync,discard};
}
