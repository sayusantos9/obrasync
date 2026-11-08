import {supabase} from '../lib/supabase';
import {prepareSupplier} from '../utils/suppliers';
export async function fetchSuppliers(){const {data,error}=await supabase.rpc('list_suppliers');if(error)throw error;return data||[];}
export async function saveSupplier(values){const {data,error}=await supabase.rpc('save_supplier',{p_data:prepareSupplier(values)});if(error)throw error;return data;}
