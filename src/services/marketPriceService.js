import {supabase} from '../lib/supabase';
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
