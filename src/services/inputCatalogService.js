import { supabase } from '../lib/supabase';

const PAGE_SIZE = 500;
const COLUMNS = 'id,catalog_code,source_file,source_row,source_bank,source_code,description,category,unit,reference_quantity,reference_unit_price,reference_value,reference_date';

export async function fetchInputCatalog() {
  if (!supabase) throw new Error('Supabase não configurado.');
  const items = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data, error } = await supabase.from('input_catalog')
      .select(COLUMNS).eq('is_material', true).order('catalog_code').range(offset, offset + PAGE_SIZE - 1);
    if (error) throw error;
    items.push(...(data || []));
    if (!data || data.length < PAGE_SIZE) return items;
  }
}
