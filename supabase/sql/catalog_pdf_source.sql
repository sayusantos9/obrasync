alter table public.input_catalog add column if not exists source_page integer;
alter table public.input_catalog add column if not exists source_sha256 text;
