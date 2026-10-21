-- Preserve the source category; define which imported rows belong to the app's material scope.
alter table public.input_catalog add column is_material boolean not null default false;
comment on column public.input_catalog.is_material is 'Material do escopo do app. Exclui mao de obra, servicos, encargos e equipamentos permanentes; classificacao da fonte preservada.';
update public.input_catalog set is_material = true
where source_file = 'insumos_turiacu.xlsx'
  and (category = 'Material' or catalog_code in (
    'TUR-0023','TUR-0029','TUR-0080','TUR-0081','TUR-0082',
    'TUR-0086','TUR-0093','TUR-0100','TUR-0104'
  ));
