import {rpcWithReauthentication} from './recentAuth';
import {supabase} from '../lib/supabase';
async function rpc(name,args){if(!supabase)throw new Error('Conecte ao Supabase.');const {data,error}=await rpcWithReauthentication(supabase,name,args);if(error)throw error;return data;}
export const fetchCompanyUsers=projectId=>rpc('list_company_users',{p_project_id:projectId||null});
export const saveCompanyUser=(user,values)=>rpc('save_company_user',{p_user_id:user.id,p_name:values.name.trim(),p_role:values.role,p_active:values.active,p_expected:user.updated_at});
export const fetchPurchasePlanning=projectId=>rpc('purchase_planning_snapshot',{p_project_id:projectId});
export const saveProjectDimension=(projectId,data)=>rpc('save_project_dimension',{p_project_id:projectId,p_data:data});
export const savePurchasePlan=(projectId,data)=>rpc('save_purchase_plan',{p_project_id:projectId,p_data:data});
export const purchasePlanAction=(plan,action)=>rpc('purchase_plan_action',{p_plan_id:plan.id,p_action:action,p_expected:plan.updated_at});
