import AsyncStorage from '@react-native-async-storage/async-storage';
import {supabase} from '../lib/supabase';
import {createReceiptQueue} from '../utils/receiptQueueCore';
async function sendReceipt(action,projectId,payload,user){
 const {data,error}=await supabase.auth.getSession();if(error)throw error;
 const session=data.session;
 if(session?.user?.id!==user.id)throw {code:'AUTH_CHANGED',message:'Entre novamente com a conta que registrou este recebimento.'};
 // Freeze the actor for this request, even if the user logs out while it is in flight.
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
 try{const response=await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/rest/v1/rpc/procurement_action`,{method:'POST',signal:controller.signal,headers:{apikey:process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,Authorization:`Bearer ${session.access_token}`,'Content-Type':'application/json'},body:JSON.stringify({p_action:action,p_project_id:projectId,p_data:payload})});
  const result=await response.json();if(!response.ok)throw {...result,status:response.status};return result;
 }finally{clearTimeout(timer);}
}
export const receiptQueue=createReceiptQueue(AsyncStorage,sendReceipt);
const cacheKey=id=>`@obrasync:receipt-cache:v1:${id}`;
export async function saveReceiptCache(profile,projects,orders,receipts){
 if(!['MASTER','PURCHASING','REQUESTER'].includes(profile?.role))return;
 await AsyncStorage.setItem(cacheKey(profile.id),JSON.stringify({profile,projects,orders,receipts,savedAt:new Date().toISOString()}));
}
export async function readReceiptCache(authUser){
 if(!authUser?.id)return null;
 const raw=await AsyncStorage.getItem(cacheKey(authUser.id));if(!raw)return null;const c=JSON.parse(raw);
 if(!Number.isFinite(Date.parse(c.savedAt))||Date.now()-Date.parse(c.savedAt)>7*86400000){await AsyncStorage.removeItem(cacheKey(authUser.id));return null;}
 if(c.profile?.id!==authUser.id||!c.profile.active||!c.profile.companyId||!Array.isArray(c.projects)||!Array.isArray(c.orders)||!Array.isArray(c.receipts))return null;
 return c;
}
