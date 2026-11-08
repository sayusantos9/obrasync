const n=v=>Number.isFinite(Number(v))?Number(v):0;
const money=v=>Math.round((v+Number.EPSILON)*100)/100;
const unit=v=>String(v||'').trim().toLowerCase();
const key=(i,fallback)=>`${i.catalog_input_id?'shared':i.cost_input_id||i.input_id?'company':'unlinked'}:${i.catalog_input_id||i.cost_input_id||i.input_id||fallback}|${unit(i.unit)}`;
export const PROJECTION_MODES={average:'Média ponderada',last:'Última compra',moving:'Últimas 3 compras',baseline:'Preço orçamentário',scenario:'Cenário manual'};
export function buildFinancialComparison(snapshot,{tolerance=5,mode='average',scenarios={}}={}){
 if(!snapshot?.project?.id)throw new Error('Atualize os dados da obra.');
 if(!Number.isFinite(tolerance)||tolerance<0||tolerance>100||!PROJECTION_MODES[mode])throw new Error('Revise a tolerância e o critério de projeção.');
 const pid=snapshot.project.id,base=snapshot.baseline?.project_id===pid?snapshot.baseline:null,map=new Map(),warnings=new Set(),purchases=[];
 function row(i,fallback){const k=key(i,fallback);if(!map.has(k))map.set(k,{key:k,description:i.description||i.name||'Insumo',unit:i.unit,plannedQuantity:0,plannedValue:0,purchasedQuantity:0,actualValue:0,committedQuantity:0,committedValue:0,history:[],stock:[],reserved:0,consumed:0});return map.get(k);}
 if(!base)warnings.add('Sem orçamento selecionado: valores comprados não têm referência comparável.');
 for(const i of base?.items||[]){const r=row(i,`budget:${i.id}`);r.plannedQuantity+=n(i.quantity);r.plannedValue+=money(n(i.quantity)*n(i.unit_price));}
 const orders=(snapshot.orders||[]).filter(o=>o.project_id===pid&&o.approval_status==='APPROVED'&&o.status!=='CANCELLED').sort((a,b)=>String(a.purchased_at||a.created_at||'').localeCompare(String(b.purchased_at||b.created_at||''))||String(a.id).localeCompare(String(b.id)));
 for(const o of orders){const items=o.items||[],subtotal=items.reduce((s,i)=>s+money(n(i.quantity)*n(i.unit_price)),0),total=n(o.total);let allocated=0;
  if(!items.length){const r=row({description:`Pedido sem itens: ${o.number}`,unit:'—'},`order:${o.id}`);if(o.purchased_at)r.actualValue+=total;else r.committedValue+=total;warnings.add('Pedido sem itens: valor preservado, comparação e projeção incompletas.');continue;}
  if(Math.abs(subtotal+n(o.freight)+n(o.taxes)-n(o.discount)-total)>.02)warnings.add('Há total de pedido divergente dos itens/adicionais. Foi preservado o total registrado.');
  if(subtotal===0&&total!==0)warnings.add('Adicionais de pedido sem preço de itens foram divididos igualmente entre linhas; unidades distintas não são somadas.');
  const byOrder=new Map();
  items.forEach((i,index)=>{const value=index===items.length-1?money(total-allocated):money(total*(subtotal>0?money(n(i.quantity)*n(i.unit_price))/subtotal:1/items.length));allocated+=value;
   const r=row(i,`order:${o.id}:${i.id}`),quantity=n(i.quantity);
   if(o.purchased_at){r.purchasedQuantity+=quantity;r.actualValue+=value;const h=byOrder.get(r.key)||{quantity:0,value:0,at:o.purchased_at,orderId:o.id,number:o.number};h.quantity+=quantity;h.value+=value;byOrder.set(r.key,h);purchases.push({orderId:o.id,number:o.number,supplier:o.supplier_name||'',key:r.key,description:r.description,unit:r.unit,quantity,value,unitPrice:quantity>0?value/quantity:null});}
   else {r.committedQuantity+=quantity;r.committedValue+=value;}
  });
  for(const [k,h] of byOrder)map.get(k).history.push(h);
 }
 if((snapshot.returns||[]).some(r=>r.project_id===pid))warnings.add('Há devoluções com reposição pendente. Valores e quantidades compradas permanecem brutos; não há crédito financeiro automático. Consulte recebimentos e relatório executivo.');
 const received=new Map();for(const r of snapshot.receipts||[])if(r.project_id===pid)for(const i of r.items||[])received.set(i.material_id,(received.get(i.material_id)||0)+n(i.quantity));
 const reservations=new Map((snapshot.reservations||[]).filter(r=>r.project_id===pid&&r.budget_id===base?.id).map(r=>[r.material_id,r]));
 const materials=new Map();
 for(const s of snapshot.stock||[]){if(s.project_id!==pid||!s.material)continue;const m=s.material;materials.set(s.material_id,m);const r=row(m,`material:${s.material_id}`),external=Math.max(0,n(s.quantity)-(received.get(s.material_id)||0)),saved=n(reservations.get(s.material_id)?.quantity),reserved=Math.min(saved,external);
  if(saved>external)warnings.add('Uma reserva supera o estoque externo comprovável atual; a projeção usa somente a cobertura comprovada. Revise a reserva.');
  r.stock.push({materialId:s.material_id,quantity:n(s.quantity),external,reserved,savedReservation:saved});r.reserved+=reserved;
 }
 for(const m of snapshot.movements||[]){if(m.project_id!==pid||m.movement_type!=='OUT'||m.supplier_return_id)continue;const material=materials.get(m.material_id);if(material)row(material,`material:${m.material_id}`).consumed+=n(m.quantity);}
 const rows=[...map.values()].map(r=>{
  const pp=r.plannedQuantity>0?r.plannedValue/r.plannedQuantity:null,pr=r.purchasedQuantity>0?r.actualValue/r.purchasedQuantity:null,comparable=pp!==null&&pp>0&&pr!==null;
  const delta=comparable?pr-pp:null,percent=comparable?delta/pp*100:null;
  // Exact three-term decomposition: (Q1P1-Q0P0)=Q0*dP+P0*dQ+dP*dQ.
  // With no purchase, dP=0; an unspent balance is NOT final savings.
  const validBase=pp!==null&&pp>0,dp=comparable?delta:0,dq=r.purchasedQuantity-r.plannedQuantity;
  const priceEffect=validBase?r.plannedQuantity*dp:0,quantityEffect=validBase?pp*dq:0,combinedEffect=validBase?dp*dq:0;
  const unmatched=validBase?0:r.actualValue-r.plannedValue;
  const reserved=Math.min(r.reserved,Math.max(0,r.plannedQuantity-r.purchasedQuantity)),remaining=Math.max(0,r.plannedQuantity-r.purchasedQuantity-reserved),uncommitted=Math.max(0,remaining-r.committedQuantity);
  const h=r.history.at(-1),last=h?.quantity>0?h.value/h.quantity:null,recent=r.history.slice(-3),recentQty=recent.reduce((s,v)=>s+v.quantity,0),moving=recentQty>0?recent.reduce((s,v)=>s+v.value,0)/recentQty:null;
  const scenario=scenarios[r.key]||{};
  if((scenario.price!=null&&(!Number.isFinite(scenario.price)||scenario.price<0))||(scenario.quantity!=null&&(!Number.isFinite(scenario.quantity)||scenario.quantity<0)))throw new Error(`Cenário inválido: ${r.description}.`);
  let projectionPrice=({average:pr,last,moving,baseline:pp,scenario:scenario.price??pr})[mode];
  let fallback=false;if(projectionPrice==null){projectionPrice=pp;fallback=true;}
  const projectedQuantity=mode==='scenario'&&scenario.quantity!=null?scenario.quantity:uncommitted;
  const projectedSpend=projectionPrice==null&&(projectedQuantity>0||reserved>0)?null:r.actualValue+r.committedValue+projectedQuantity*(projectionPrice??0);
  const reservedEstimate=projectionPrice==null&&reserved>0?null:reserved*(projectionPrice??0);
  const projection=projectedSpend==null||reservedEstimate==null?null:projectedSpend+reservedEstimate;
  if(projection===null)warnings.add('Há insumo sem preço para projetar; o total projetado está incompleto.');
  return {...r,pp,pr,percent,comparable,priceEffect,quantityEffect,combinedEffect,unmatched,priceImpact:comparable?delta*r.purchasedQuantity:null,remaining,reserved,uncommitted,projectionPrice,projectedQuantity,projectedSpend,reservedEstimate,projection,fallback,last,moving,scenario,
   status:!validBase?'Sem referência':pr===null?'Sem compra':percent<=0?'Dentro/abaixo':percent<=tolerance?'Atenção':'Acima'};
 });
 const byKey=new Map(rows.map(r=>[r.key,r]));
 let adherent=0,comparableValue=0;
 for(const p of purchases){const r=byKey.get(p.key);p.pp=r.pp;p.percent=p.unitPrice!==null&&r.pp>0?(p.unitPrice/r.pp-1)*100:null;if(p.percent!==null){comparableValue+=p.value;if(p.percent<=tolerance+1e-8)adherent+=p.value;}}
 const sum=field=>money(rows.reduce((s,r)=>s+n(r[field]),0)),actual=sum('actualValue'),planned=sum('plannedValue');
 return {generatedAt:snapshot.generatedAt,project:snapshot.project,baseline:base,mode,tolerance,rows,purchases,warnings:[...warnings],summary:{planned,actual,committed:sum('committedValue'),priceEffect:sum('priceEffect'),quantityEffect:sum('quantityEffect'),combinedEffect:sum('combinedEffect'),unmatched:sum('unmatched'),difference:money(actual-planned),projection:rows.some(r=>r.projection===null)?null:sum('projection'),projectedSpend:rows.some(r=>r.projectedSpend===null)?null:sum('projectedSpend'),reservedEstimate:sum('reservedEstimate'),adherence:actual>0?100*adherent/actual:null,coverage:actual>0?100*comparableValue/actual:null,adherentValue:money(adherent),comparableValue:money(comparableValue)}};
}

export function financialComparisonSheets(report){
 const s=report.summary;
 return [{name:'Resumo',rows:[['Obra',report.project.name],['Orçamento',report.baseline?.number||'Sem base'],['Data-base',report.baseline?.base_date||''],['Revisão',report.baseline?.revision_number||''],['Dados atualizados em',report.generatedAt],['Projeção',PROJECTION_MODES[report.mode]],['Tolerância superior (%)',report.tolerance],['Previsto sem BDI',s.planned],['Comprado confirmado',s.actual],['Comprometido ainda não comprado',s.committed],['Efeito preço',s.priceEffect],['Efeito quantidade',s.quantityEffect],['Efeito combinado',s.combinedEffect],['Diferença sem referência',s.unmatched],['Diferença comprado - previsto',s.difference],['Aderência por valor (%)',s.adherence??'Sem compra'],['Cobertura comparável (%)',s.coverage??'Sem compra'],['Desembolso projetado',s.projectedSpend??'Incompleto'],['Estoque externo: valor estimado',s.reservedEstimate],['Custo projetado com estoque externo',s.projection??'Incompleto'],['Nota','Diferença negativa durante execução não significa economia final. Não inclui BDI ou despesas sem vínculo ao insumo.'],['Nota','Reserva desconta apenas estoque externo comprovável, sem contar novamente compras desta obra.'],...report.warnings.map(w=>['Atenção',w])]},
 {name:'Insumos',rows:[['Insumo','Unidade','Qtd prevista','Qtd comprada','PP','PR','Desvio %','Efeito preço','Efeito quantidade','Efeito combinado','Sem referência','Impacto preço realizado','Reservado externo','Saldo a contratar','Já comprometido (qtd)','Compra adicional projetada','Preço da projeção','Desembolso projetado','Custo projetado','Critério','Fornecedor cenário','Condição cenário'],...report.rows.map(r=>[r.description,r.unit,r.plannedQuantity,r.purchasedQuantity,r.pp??'',r.pr??'',r.percent??'',r.priceEffect,r.quantityEffect,r.combinedEffect,r.unmatched,r.priceImpact??'',r.reserved,r.remaining,r.committedQuantity,r.projectedQuantity,r.projectionPrice??'',r.projectedSpend??'',r.projection??'',r.fallback?'Referência orçamentária (sem histórico)':PROJECTION_MODES[report.mode],r.scenario.supplier||'',r.scenario.terms||''])]},
 {name:'Compras e aderência',rows:[['Pedido','Fornecedor','Insumo','Unidade','Quantidade','Valor líquido rateado','PR','PP','Desvio %','Dentro da tolerância'],...report.purchases.map(p=>[p.number,p.supplier,p.description,p.unit,p.quantity,p.value,p.unitPrice??'',p.pp??'',p.percent??'',p.percent===null?'Sem referência':p.percent<=report.tolerance+1e-8?'Sim':'Não'])]}];
}
