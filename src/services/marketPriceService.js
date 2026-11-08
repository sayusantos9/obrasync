import {supabase} from '../lib/supabase';
export async function searchMarketPrices(payload) {
 const {data,error}=await supabase.functions.invoke('market-search',{body:payload});
 if(error){let message='Não foi possível pesquisar. Confira a conexão e a configuração do serviço.';try{const body=await error.context?.json();if(body?.error)message=body.error;}catch{}throw new Error(message);}
 if(data?.error)throw new Error(data.error);
 if(!data||!Array.isArray(data.offers))throw new Error('Resposta inválida da pesquisa.');
 return data;
}
export async function fetchMarketPrices(projectId) {
 const all=[];
 for(let offset=0;;offset+=500) {
  const {data,error}=await supabase.from('market_prices').select('*').eq('project_id',projectId).order('id').range(offset,offset+499);
  if(error)throw error;all.push(...data);if(data.length<500)return all;
 }
}
export async function saveMarketPrice(payload) {
 const {data,error}=await supabase.from('market_prices').insert(payload).select().single();
 if(error)throw error;return data;
}
