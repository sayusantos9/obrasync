import {AccessibleTouchableOpacity as TouchableOpacity,AccessibleView as View} from '../components/accessibility/AccessibleNative';
import {ReadableText as Text} from '../components/accessibility/ReadableText';
import {useEffect,useState} from 'react';

import {PlanengenScreen,usePlanengenStyle} from '../components/layout/PlanengenScreen';
import {supabase} from '../lib/supabase';
import {useApp} from '../contexts/AppContext';
const labels={REQUEST:'Solicitação criada',ORDER:'Pedido criado',APPROVE:'Pedido aprovado',REJECT:'Pedido rejeitado',PURCHASE:'Compra confirmada',RECEIVE:'Recebimento',STOCK:'Movimentação de estoque',EXPENSE:'Despesa registrada',ARCHIVE_BUDGET:'Orçamento arquivado',ARCHIVE_QUOTE:'Cotação arquivada',SUPPLIER_CREATED:'Fornecedor cadastrado',SUPPLIER_UPDATED:'Fornecedor atualizado',QUOTE_ORIGIN_LINKED:'Origem da rodada vinculada',QUOTE_CREATED:'Proposta cadastrada',QUOTE_AWARDED:'Fornecedor escolhido e pedido gerado',ATTACHMENT_ADDED:'Anexo incluído',BUDGET_VERSION:'Versão de orçamento criada',BUDGET_BASELINE:'Orçamento-base definido'};
export function AuditScreen() {
 const {colors}=usePlanengenStyle();
 const {currentUser}=useApp();
 const [rows,setRows]=useState([]);const [error,setError]=useState('');const [loading,setLoading]=useState(false);
 async function load() {
  if(currentUser?.role!=='MASTER')return;
  setLoading(true);setError('');
  try { const {data,error:failure}=await supabase.from('operation_audit').select('*').order('created_at',{ascending:false}).limit(100);if(failure)throw failure;setRows(data); }
  catch(e){setError(e.message);}finally{setLoading(false);}
 }
 useEffect(()=>{load();},[currentUser?.id,currentUser?.companyId]);
 return <PlanengenScreen title="Histórico de operações">
  <Text style={{color:colors.muted}}>Últimos 100 eventos da empresa. Registra as novas operações de compras, estoque, solicitações, despesas e arquivamentos.</Text>
  <TouchableOpacity accessibilityRole="button" disabled={loading} onPress={load} style={{padding:14}}><Text style={{color:colors.blue}}>{loading?'Atualizando...':'Atualizar histórico'}</Text></TouchableOpacity>
  {!!error&&<Text accessibilityRole="alert">{error}</Text>}
  {!loading&&!rows.length&&!error&&<Text>Nenhum evento registrado.</Text>}
  {rows.map(r=><View key={r.id} style={{padding:16,backgroundColor:'white',marginBottom:12,borderRadius:12}}>
   <Text style={{fontWeight:'700',color:colors.text}}>{labels[r.action]||r.action}</Text>
   <Text>{new Date(r.created_at).toLocaleString('pt-BR')}</Text><Text selectable>Responsável: {r.actor_id}</Text><Text selectable>Registro: {r.entity_id}</Text>
   {!!r.details?.reason&&<Text>Motivo: {r.details.reason}</Text>}
  </View>)}
 </PlanengenScreen>;
}
