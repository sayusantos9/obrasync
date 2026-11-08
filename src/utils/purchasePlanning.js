export const PLAN_PRIORITIES={LOW:'Baixa',NORMAL:'Normal',HIGH:'Alta',URGENT:'Urgente'};
export const PLAN_STATUSES={PLANNED:'Planejado',REQUESTED:'Solicitação gerada',CANCELLED:'Cancelado'};
export function acquisitionDeadline(neededBy,leadDays){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(neededBy||''))return null;
 const date=new Date(neededBy+'T12:00:00Z'),days=Number(leadDays);
 if(!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==neededBy||!Number.isInteger(days)||days<0||days>3650)return null;
 date.setUTCDate(date.getUTCDate()-days);return date.toISOString().slice(0,10);
}
export function planningRows(snapshot){return [['Obra',snapshot.project.name],['Data do relatório',snapshot.today],['Insumo','Unidade','Quantidade','Frente','Centro de custo','Responsável','Prioridade','Necessidade','Antecedência (dias)','Adquirir até','Situação','Solicitação','Situação da solicitação','Orçamento de origem','Revisão','Estimativa unitária','Estimativa total','Observações'],...snapshot.plans.map(p=>[p.description,p.unit,Number(p.quantity),p.front_name,p.cost_center_name,p.responsible_name,PLAN_PRIORITIES[p.priority],p.needed_by,p.lead_days,p.acquisition_deadline,PLAN_STATUSES[p.status],p.request_number||'',p.request_status||'',p.origin_snapshot?.budget?.number||'Sem referência',p.origin_snapshot?.budget?.revision||'',p.estimated_unit_price??'',p.estimated_unit_price==null?'':Number(p.quantity)*Number(p.estimated_unit_price),p.notes||''])];}
