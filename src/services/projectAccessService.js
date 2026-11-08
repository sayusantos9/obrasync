import {rpcWithReauthentication} from './recentAuth';
import {supabase} from '../lib/supabase';
async function rpc(name,args){if(!supabase)throw new Error('Conecte ao Supabase.');const {data,error}=await rpcWithReauthentication(supabase,name,args);if(error)throw error;return data;}
export const fetchProjectAccess=projectId=>rpc('project_access_settings',{p_project_id:projectId});
export const saveProjectAccess=(projectId,userId,access,rule)=>rpc('save_project_access',{p_project_id:projectId,p_user_id:userId,p_access:access,p_rule:rule});
export const evaluateOrderApproval=id=>rpc('evaluate_order_approval',{p_order_id:id});
