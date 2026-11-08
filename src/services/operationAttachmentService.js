import * as DocumentPicker from 'expo-document-picker';
import {File} from 'expo-file-system';
import {Linking} from 'react-native';
import {supabase} from '../lib/supabase';
import {operationId} from './requestQueue';
import {attachmentType,MAX_ATTACHMENT_BYTES} from '../utils/operationAttachments';
const bucket='operation-attachments';
export async function listOperationAttachments(kind,entityId){
 const {data,error}=await supabase.from('operation_attachments').select('*').eq('kind',kind).eq('entity_id',entityId).order('created_at');
 if(error)throw error;return data||[];
}
export async function pickOperationAttachment({companyId,projectId,kind,entityId}){
 const result=await DocumentPicker.getDocumentAsync({type:['application/pdf','image/jpeg','image/png'],copyToCacheDirectory:true});
 if(result.canceled)return null;
 const asset=result.assets[0];
 if(asset.size>MAX_ATTACHMENT_BYTES)throw new Error('O limite por arquivo é 10 MB.');
 const bytes=await new File(asset.uri).bytes(),mime=attachmentType(asset.name,bytes);
 const path=`${companyId}/${projectId}/${kind}/${entityId}/${operationId()}.${asset.name.split('.').pop().toLowerCase()}`;
 const {error}=await supabase.storage.from(bucket).upload(path,bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),{contentType:mime,upsert:false});
 if(error)throw error;
 const {error:registrationError}=await supabase.rpc('register_operation_attachment',{p_path:path,p_filename:asset.name});
 if(registrationError){
  // A timeout may mean the RPC committed. Check before retry/cleanup, preserving registered evidence.
  const check=await supabase.from('operation_attachments').select('id').eq('object_path',path).maybeSingle();
  if(!check.data){if(!check.error)await supabase.storage.from(bucket).remove([path]);throw registrationError;}
 }
 return path;
}
export async function openOperationAttachment(item){
 const {data,error}=await supabase.storage.from(bucket).createSignedUrl(item.object_path,60);
 if(error)throw error;
 await Linking.openURL(data.signedUrl);
}
