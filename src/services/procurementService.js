import {rpcWithReauthentication} from './recentAuth';
import { supabase } from '../lib/supabase';

export async function procurementAction(action, projectId, data) {
  if (!supabase || !projectId) throw new Error('Selecione uma obra e conecte ao Supabase.');
  const { data: result, error } = await rpcWithReauthentication(supabase,'procurement_action', { p_action: action, p_project_id: projectId, p_data: data });
  if (error) throw error;
  return result;
}
export async function fetchOperations() {
  async function pages(table, columns) {
    const data=[];
    for(let start=0;;start+=500) {
      const page=await supabase.from(table).select(columns).order('id').range(start,start+499);
      if(page.error) return page;
      data.push(...page.data);
      if(page.data.length<500) return {data,error:null};
    }
  }
  const [requests, orders, receipts, stock, expenses] = await Promise.all([
    pages('material_requests','*,material_request_items(*)'),
    pages('purchase_orders','*,purchase_order_items(*),suppliers(name)'),
    pages('receipts','*,receipt_items(*,supplier_returns(*)),receipt_quality(*)'),
    pages('stock_items','*,materials(*)'),
    pages('expenses','*'),
  ]);
  for (const result of [requests, orders, receipts, stock, expenses]) if (result.error) throw result.error;
  return {
    requests: requests.data.map(row => ({ ...row, projectId: row.project_id, material: row.material_request_items[0]?.material_name, quantity: row.material_request_items[0]?.quantity, unit: row.material_request_items[0]?.unit })),
    orders: orders.data.map(row => ({ ...row, projectId: row.project_id, supplier: row.suppliers?.name, items: row.purchase_order_items.map(i => ({ ...i, name: i.description, code: i.catalog_input_id, unitPrice: Number(i.unit_price) })) })),
    receipts: receipts.data.map(row => ({ ...row, supplier:orders.data.find(o=>o.id===row.order_id)?.suppliers?.name, projectId: row.project_id, receivedAt: row.received_at, items: row.receipt_items })),
    expenses: expenses.data.map(row=>({...row,projectId:row.project_id,name:row.description,amount:Number(row.amount)})),
    stock: stock.data.map(row => ({ ...row, projectId: row.project_id, materialId: row.material_id, code: row.materials?.sku, name: row.materials?.name, unit: row.materials?.unit, quantity: Number(row.quantity) })),
  };
}
