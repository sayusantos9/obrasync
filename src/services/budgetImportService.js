import {File,Paths} from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import {supabase} from '../lib/supabase';
export async function downloadBudgetOriginal(budgetId){
 const {data,error}=await supabase.from('budget_import_files').select('filename,content_base64').eq('budget_id',budgetId).maybeSingle();
 if(error)throw error;
 if(!data)throw new Error('Esta versão não possui planilha importada. Se for uma revisão, consulte também a versão de origem.');
 const filename=data.filename.replace(/[^a-zA-Z0-9_.-]/g,'_');
 const file=new File(Paths.cache,`${Date.now()}_${filename}`);
 file.create({overwrite:true});await file.write(data.content_base64,{encoding:'base64'});
 if(!await Sharing.isAvailableAsync())throw new Error('Compartilhamento indisponível neste dispositivo.');
 await Sharing.shareAsync(file.uri,{mimeType:filename.toLowerCase().endsWith('.csv')?'text/csv':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
}
