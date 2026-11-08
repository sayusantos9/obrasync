import {TRACE_HEADERS,procurementTraceRows} from './procurementTrace.js';
const num=v=>Number.isFinite(Number(v))?Number(v):0;
const money=v=>Math.round((v+Number.EPSILON)*100)/100;
const unit=v=>String(v||'').trim().toLowerCase();
const identity=(i,fallback)=>`${i.catalog_input_id?'shared':i.cost_input_id||i.input_id?'company':'unlinked'}:${i.catalog_input_id||i.cost_input_id||i.input_id||fallback}|${unit(i.unit)}`;

// A single server snapshot feeds both the screen and exported files.
// Stock/consumption valuation is an estimate, not an inventory accounting ledger.
export function buildExecutiveReport(snapshot){
 if(!snapshot?.project?.id)throw new Error('Selecione uma obra e atualize o relatório.');
 const projectId=snapshot.project.id,warnings=new Set(),rows=new Map(),orderLines=new Map(),materialCosts=new Map();
 const base=snapshot.baseline?.project_id===projectId&&!snapshot.baseline.deleted_at?snapshot.baseline:null;
 function rowFor(i,fallback){const key=identity(i,fallback);if(!rows.has(key))rows.set(key,{key,description:i.description||i.name||'Insumo',unit:i.unit,plannedQuantity:0,plannedValue:0,committedQuantity:0,committed:0,purchasedQuantity:0,purchased:0,receivedQuantity:0,received:0});return rows.get(key);}
 for(const i of base?.items||[]){const r=rowFor(i,`budget:${i.id}`);r.plannedQuantity+=num(i.quantity);r.plannedValue+=money(num(i.quantity)*num(i.unit_price));if(!i.catalog_input_id&&!i.input_id)warnings.add('Há itens do orçamento sem identidade de catálogo; a projeção desses itens não pode ser conciliada automaticamente com compras.');}
 const allOrders=(snapshot.orders||[]).filter(o=>o.project_id===projectId&&!o.deleted_at);
 const approved=allOrders.filter(o=>o.approval_status==='APPROVED'&&o.status!=='CANCELLED');
 let committed=0,purchased=0,received=0;
 const orderDetails=[];
 for(const o of approved){
  committed+=num(o.total);if(o.purchased_at)purchased+=num(o.total);
  const lines=o.items||[],subtotal=lines.reduce((s,i)=>s+money(num(i.quantity)*num(i.unit_price)),0),extras=num(o.freight)+num(o.taxes)-num(o.discount);
  if(Math.abs(money(subtotal+extras)-num(o.total))>.02)warnings.add('Há pedido cujo total difere dos itens e adicionais. O rateio usa o total registrado; revise o documento.');
  if(!lines.length){warnings.add('Há pedido sem itens; sua distribuição e projeção estão incompletas.');continue;}
  let allocated=0;
  lines.forEach((i,index)=>{
   // Residual cents go to the last item; heterogeneous units are never summed for allocation.
   const value=index===lines.length-1?money(num(o.total)-allocated):money(num(o.total)*(subtotal>0?money(num(i.quantity)*num(i.unit_price))/subtotal:1/lines.length));
   if(subtotal===0&&num(o.total)!==0)warnings.add('Pedido com itens de preço zero: adicionais rateados igualmente entre linhas.');
   allocated+=value;const r=rowFor(i,`order:${i.id}`);r.committedQuantity+=num(i.quantity);r.committed+=value;
   if(o.purchased_at){r.purchasedQuantity+=num(i.quantity);r.purchased+=value;}
   orderLines.set(i.id,{item:i,row:r,order:o,unitValue:num(i.quantity)>0?value/num(i.quantity):0});
   orderDetails.push([o.number||o.id,o.supplier_name||'',o.purchased_at?'Compra confirmada':'Aprovado, não comprado',i.description,i.unit,num(i.quantity),num(i.unit_price),value]);
  });
 }
 const receiptDetails=[],returned=new Map();
 for(const ret of snapshot.returns||[])if(ret.project_id===projectId)returned.set(ret.receipt_item_id,(returned.get(ret.receipt_item_id)||0)+num(ret.quantity));
 if(returned.size)warnings.add('Devoluções reabrem a reposição e reduzem o recebido líquido. Comprado permanece bruto: não há crédito/reembolso financeiro automático.');
 const qualityDetails=(snapshot.quality||[]).filter(q=>q.project_id===projectId).map(q=>[q.receipt_id,q.order_item_id,num(q.accepted_quantity),num(q.rejected_quantity),q.reason||'',q.nonconformity||'']);
 const returnDetails=(snapshot.returns||[]).filter(q=>q.project_id===projectId).map(q=>[q.created_at,q.receipt_item_id,num(q.quantity),q.reason,q.nonconformity||'',q.reference||'']);
 for(const receipt of (snapshot.receipts||[]).filter(r=>r.project_id===projectId))for(const i of receipt.items||[]){
  const line=orderLines.get(i.order_item_id);
  if(!line||line.order.id!==receipt.order_id||!line.order.purchased_at||unit(i.unit)!==unit(line.item.unit)){
   warnings.add('Há recebimento sem compra/unidade conciliável; seu valor não foi incluído.');
   receiptDetails.push([receipt.reference||receipt.id,receipt.invoice_number||'',i.description,i.unit,num(i.quantity),'Sem valor conciliável']);continue;
  }
  const netQuantity=Math.max(0,num(i.quantity)-(returned.get(i.id)||0)),value=netQuantity*line.unitValue;received+=value;line.row.receivedQuantity+=netQuantity;line.row.received+=value;
  const materialKey=`${i.material_id}|${unit(i.unit)}`,cost=materialCosts.get(materialKey)||{quantity:0,value:0};cost.quantity+=num(i.quantity);cost.value+=num(i.quantity)*line.unitValue;materialCosts.set(materialKey,cost);
  if(line.row.receivedQuantity>line.row.purchasedQuantity+1e-8)warnings.add('Quantidade recebida supera a comprada em um insumo; revise os lançamentos.');
  receiptDetails.push([receipt.reference||receipt.id,receipt.invoice_number||'',i.description,i.unit,netQuantity,money(value)]);
 }
 const stock=(snapshot.stock||[]).filter(s=>s.project_id===projectId),materials=new Map(stock.map(s=>[s.material_id,s.material]));
 // Material names/units can also be recovered from receipts when stock is absent.
 for(const r of snapshot.receipts||[])if(r.project_id===projectId)for(const i of r.items||[])if(!materials.has(i.material_id))materials.set(i.material_id,{name:i.description,unit:i.unit});
 let consumed=0,stockValue=0,unknownConsumed=0,unknownStock=0;
 const stockDetails=[],movementDetails=[];
 const estimated=(materialId,u,q)=>{const c=materialCosts.get(`${materialId}|${unit(u)}`);return c?.quantity>0?q*c.value/c.quantity:null;};
 for(const s of stock){const m=s.material||{},value=estimated(s.material_id,m.unit,num(s.quantity));if(value===null&&num(s.quantity)!==0)unknownStock++;else stockValue+=value||0;stockDetails.push([m.name||s.material_id,m.unit||'',num(s.quantity),value===null?'Sem custo de referência':money(value)]);}
 for(const m of snapshot.movements||[]){
  if(m.project_id!==projectId&&m.destination_project_id!==projectId)continue;
  const material=materials.get(m.material_id)||{},isConsumption=m.project_id===projectId&&m.movement_type==='OUT'&&!m.supplier_return_id;
  const value=isConsumption?estimated(m.material_id,material.unit,num(m.quantity)):null;
  if(isConsumption){if(value===null)unknownConsumed++;else consumed+=value;}
  movementDetails.push([m.created_at,material.name||m.material_id,material.unit||'',m.supplier_return_id?'Devolução ao fornecedor':m.movement_type==='TRANSFER'?(m.project_id===projectId?'Transferência de saída':'Transferência de entrada'):isConsumption?'Consumo / saída':'Entrada',num(m.quantity),isConsumption?(value===null?'Sem custo de referência':money(value)):'Não compõe consumo',m.reason||'']);
 }
 if(unknownStock||unknownConsumed)warnings.add('Saldo/saídas sem preço de recebimento nesta obra não foram valorizados. Consulte as linhas sem custo de referência.');
 if((snapshot.movements||[]).some(m=>m.movement_type==='TRANSFER'))warnings.add('Transferências não são consumo. Valores estimados usam recebimentos da própria obra; custo transferido não é transportado contabilmente.');
 const items=[...rows.values()].map(r=>{
  const plannedPrice=r.plannedQuantity>0?r.plannedValue/r.plannedQuantity:null,actualPrice=r.purchasedQuantity>0?r.purchased/r.purchasedQuantity:null;
  const remaining=Math.max(0,r.plannedQuantity-r.committedQuantity),projection=r.committed+remaining*(actualPrice??plannedPrice??0);
  return {...r,plannedPrice,actualPrice,remaining,projection:money(projection),priceImpact:plannedPrice!==null&&actualPrice!==null?money((actualPrice-plannedPrice)*r.purchasedQuantity):null};
 });
 const direct=base?money(items.reduce((s,r)=>s+r.plannedValue,0)):null;
 if(!base)warnings.add('Nenhum orçamento-base oficial definido. Previsão, saldo orçamentário e projeção não estão disponíveis.');
 const expenses=(snapshot.expenses||[]).filter(e=>e.project_id===projectId);
 const metrics={baselineDirect:direct,baselineWithBdi:base?num(base.total):null,committed:money(committed),approvedNotPurchased:money(committed-purchased),purchased:money(purchased),received:money(received),toReceive:money(purchased-received),consumedEstimate:money(consumed),stockEstimate:money(stockValue),budgetBalance:base?money(direct-committed):null,projection:base?money(items.reduce((s,r)=>s+r.projection,0)):null,expenses:money(expenses.reduce((s,e)=>s+num(e.amount),0))};
 const definitions=[
  ['Orçamento-base dos insumos (sem BDI)',metrics.baselineDirect,'Soma dos itens exclusivamente da versão oficial.'],
  ['Orçamento-base com BDI',metrics.baselineWithBdi,'Referência comercial; não comparar diretamente com custos de insumos sem BDI.'],
  ['Comprometido',metrics.committed,'Pedidos aprovados, incluindo os já comprados; exclui cancelados e arquivados.'],
  ['Aprovado ainda não comprado',metrics.approvedNotPurchased,'Parte do comprometido ainda sem confirmação da compra.'],
  ['Comprado',metrics.purchased,'Pedidos aprovados com compra confirmada, incluindo frete, tributos e desconto.'],
  ['Recebido',metrics.received,'Quantidades aceitas menos devolvidas × custo unitário do pedido com adicionais rateados.'],
  ['Comprado a receber',metrics.toReceive,'Comprado menos recebido.'],
  ['Consumido / saídas (estimado)',metrics.consumedEstimate,`Saídas OUT × preço médio dos recebimentos da obra. Transferências excluídas. ${unknownConsumed} saída(s) sem valor.`],
  ['Estoque atual (estimado)',metrics.stockEstimate,`Saldo físico × preço médio dos recebimentos da obra. ${unknownStock} saldo(s) sem valor.`],
  ['Saldo orçamentário dos insumos',metrics.budgetBalance,'Orçamento-base sem BDI menos comprometido; pode ser negativo.'],
  ['Projeção dos insumos',metrics.projection,'Comprometido + quantidade prevista ainda não contratada × preço médio comprado (ou previsto, se sem compra). Sem reservas e sem BDI.'],
  ['Despesas adicionais registradas',metrics.expenses,'Exibidas separadamente: não somadas automaticamente, pois podem repetir custos já incluídos nos pedidos.'],
 ];
 const report={title:'Executivo',headers:['Indicador','Valor (R$)','Critério'],rows:definitions.map(([label,value,rule])=>[label,value===null?'Não disponível':value,rule])};
 const traceSheet={name:'Rastreabilidade',rows:[TRACE_HEADERS,...approved.flatMap(procurementTraceRows)]};
 return {project:snapshot.project,generatedAt:snapshot.generatedAt,baseline:base?{id:base.id,number:base.number,revision:base.revision_number,baseDate:base.base_date}:null,metrics,definitions,items,warnings:[...warnings],unknownConsumed,unknownStock,report,
  sheets:[{name:'Qualidade do recebimento',rows:[['Recebimento','Item do pedido','Aceita','Rejeitada','Motivo','Não conformidade'],...qualityDetails]},{name:'Devoluções',rows:[['Data','Item do recebimento','Quantidade','Motivo','Não conformidade','Documento'],...returnDetails]},traceSheet,{name:'Executivo',rows:[report.headers,...report.rows]},{name:'Previsto e contratado',rows:[['Insumo','Unidade','Qtd prevista','Previsto sem BDI','Qtd contratada','Comprometido','Qtd comprada','Comprado','Qtd recebida','Recebido','Qtd ainda não contratada','Projeção'],...items.map(r=>[r.description,r.unit,r.plannedQuantity,money(r.plannedValue),r.committedQuantity,money(r.committed),r.purchasedQuantity,money(r.purchased),r.receivedQuantity,money(r.received),r.remaining,r.projection])]},{name:'Pedidos considerados',rows:[['Pedido','Fornecedor','Etapa','Insumo','Unidade','Quantidade','Preço sem adicionais','Valor com adicionais'],...orderDetails]},{name:'Recebimentos',rows:[['Referência','Nota fiscal','Insumo','Unidade','Quantidade','Valor com adicionais'],...receiptDetails]},{name:'Estoque',rows:[['Insumo','Unidade','Saldo físico','Valor estimado'],...stockDetails]},{name:'Movimentações',rows:[['Data','Insumo','Unidade','Tipo','Quantidade','Consumo estimado','Motivo'],...movementDetails]},{name:'Despesas separadas',rows:[['Data','Descrição','Categoria','Valor'],...expenses.map(e=>[e.expense_date,e.description,e.category,num(e.amount)])]}]};
}
