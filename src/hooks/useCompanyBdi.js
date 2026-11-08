import {useCallback,useEffect,useRef,useState} from 'react';
import {fetchCompanyBdi,saveCompanyBdi} from '../services/companyBdiService';
export function useCompanyBdi(companyId){
 const [record,setRecord]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState(''),[revision,setRevision]=useState(0),[saving,setSaving]=useState(false),live=useRef(true);
 useEffect(()=>{live.current=true;return()=>{live.current=false;};},[]);
 useEffect(()=>{let active=true;setRecord(null);setError('');setLoading(true);if(!companyId){setError('Empresa indisponível.');setLoading(false);return;}
 fetchCompanyBdi().then(v=>{if(active)setRecord(v);}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[companyId,revision]);
 const save=useCallback(async config=>{if(!record||record.company_id!==companyId)throw new Error('Carregue o padrão da empresa antes de salvar.');setSaving(true);try{const v=await saveCompanyBdi(config,record.version);if(live.current)setRecord(v);return v;}finally{if(live.current)setSaving(false);}},[record,companyId]);
 return {record:record?.company_id===companyId?record:null,loading,error,saving,save,reload:()=>setRevision(v=>v+1)};
}
