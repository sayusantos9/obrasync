import {rpcWithReauthentication} from './recentAuth';
import {supabase} from '../lib/supabase';
import {calculateBdi} from '../utils/bdi';
export async function fetchCompanyBdi(){if(!supabase)throw new Error('Conecte ao Supabase.');const {data,error}=await rpcWithReauthentication(supabase,'get_company_bdi');if(error)throw error;return data;}
export async function saveCompanyBdi(config,version){const canonical=calculateBdi(config).config;const {data,error}=await rpcWithReauthentication(supabase,'save_company_bdi',{p_config:canonical,p_expected_version:version});if(error)throw error;return data;}
