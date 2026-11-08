import {createClient} from 'npm:@supabase/supabase-js@2';
import {searchStores} from './stores.mjs';
const headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS'};
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{...headers,'Content-Type':'application/json'}});
Deno.serve(async(req)=>{
 if(req.method==='OPTIONS')return new Response('ok',{headers});
 if(req.method!=='POST')return json({error:'Método inválido.'},405);
 try {
  const auth=req.headers.get('Authorization')||'';
  const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_ANON_KEY')!,{global:{headers:{Authorization:auth}}});
  const {data:{user},error:authError}=await db.auth.getUser();
  if(authError||!user)return json({error:'Entre novamente para pesquisar.'},401);
  const b=await req.json();
  if(typeof b.query!=='string'||b.query.trim().length<3||b.query.length>500||typeof b.unit!=='string'||!b.unit.trim()||b.unit.length>30||typeof b.store!=='string'||b.store.length>150||typeof b.postalCode!=='string'||!/^\d{8}$/.test(b.postalCode)||typeof b.payment!=='string'||b.payment.length<2||b.payment.length>150||!Number.isFinite(b.quantity)||b.quantity<=0)return json({error:'Informe insumo, unidade, quantidade, CEP e pagamento válidos.'},400);
  // Invoker RPC checks role, active profile, tenant and project, and applies an atomic daily quota.
  const {error}=await db.rpc('consume_market_search',{p_project_id:b.projectId});
  if(error)return json({error:'Pesquisa não autorizada ou limite diário atingido (20 consultas por usuário).'},403);
  const data=await searchStores(b.query.trim(),b.store.trim(),b.unit);
  return json({...data,searchedAt:new Date().toISOString()});
 }catch(e){return json({error:e instanceof Error&&e.name==='TimeoutError'?'A pesquisa demorou demais. Tente novamente.':'Não foi possível concluir a pesquisa. Tente novamente.'},502);}
});
