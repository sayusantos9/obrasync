import {supabase} from '../lib/supabase';
export async function fetchFinancialComparison(projectId,budgetId){const {data,error}=await supabase.rpc('financial_comparison_snapshot',{p_project_id:projectId,p_budget_id:budgetId||null});if(error)throw error;return data;}
export async function reserveBudgetStock(projectId,materialId,quantity,reason,budgetId){const {error}=await supabase.rpc('reserve_budget_stock',{p_project_id:projectId,p_material_id:materialId,p_quantity:quantity,p_reason:reason,p_budget_id:budgetId});if(error)throw error;}
