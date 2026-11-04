import { supabase } from '../lib/supabase';
import { fetchInputCatalog } from './inputCatalogService';

const toCompanyInput = row => ({
  id: row.id, source: 'company', code: row.code, description: row.description,
  unit: row.unit, unitPrice: Number(row.unit_price), inputType: row.input_type || 'OTHER',
});

export async function fetchCostInputs() {
  const shared = await fetchInputCatalog();
  const own = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await supabase.from('cost_inputs').select('*')
      .order('id').range(offset, offset + 499);
    if (error) throw error;
    own.push(...(data || []).map(toCompanyInput));
    if (!data || data.length < 500) break;
  }
  return [...shared.map(row => ({
    id: row.id, source: 'shared', code: row.catalog_code, description: row.description,
    unit: row.unit, unitPrice: Number(row.reference_unit_price), inputType: row.input_type || 'OTHER',
  })), ...own];
}

export async function saveCompanyInput(draft, user) {
  if (!user?.companyId || !['MASTER', 'ENGINEERING'].includes(user.role)) {
    throw new Error('Somente o Gestor e a Engenharia podem cadastrar insumos.');
  }
  const price = Number(draft.unitPrice);
  if (!['MATERIAL','LABOR','EQUIPMENT','COMPLEMENTARY','SERVICE_INPUT','OTHER'].includes(draft.inputType) || !draft.description?.trim() || !draft.unit?.trim()
      || !Number.isFinite(price) || price < 0) throw new Error('Informe um insumo, unidade e preço válido.');
  // A data é a data real do cadastro manual, não uma data inventada para a planilha.
  const reference = { company_id: user.companyId, source_code: 'CADASTRO_MANUAL',
    reference_date: new Date().toISOString().slice(0, 10), region_code: 'NAO_INFORMADA',
    pricing_regime: 'NAO_INFORMADO', description: 'Preços informados manualmente pela empresa na data do cadastro' };
  const { data: ref, error: refError } = await supabase.from('cost_references')
    .upsert(reference, { onConflict: 'company_id,source_code,reference_date,region_code,pricing_regime' })
    .select('id').single();
  if (refError) throw refError;
  const { data, error } = await supabase.from('cost_inputs').insert({
    company_id: user.companyId, cost_reference_id: ref.id, description: draft.description.trim(),
    unit: draft.unit.trim(), unit_price: price, input_type: draft.inputType,
  }).select('*').single();
  if (error) throw error;
  return toCompanyInput(data);
}
