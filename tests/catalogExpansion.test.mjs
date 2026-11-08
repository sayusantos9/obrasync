import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const manifest=JSON.parse(fs.readFileSync(new URL('../docs/catalog-expansion-2026-11-05.json',import.meta.url),'utf8'));
test('catálogo ampliado tem 500 ativos, origem rastreável e código/descrição sem repetição exata',()=>{
 assert.equal(manifest.retained+manifest.additions.length,500);
 assert.equal(manifest.before-manifest.archived.length,manifest.retained);
 assert.equal(new Set(manifest.additions.map(i=>i.catalog_code)).size,manifest.additions.length);
 const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/gi,'').toLowerCase();
 assert.equal(new Set(manifest.additions.map(i=>normalize(i.description)+i.unit)).size,manifest.additions.length);
 for(const row of manifest.additions){assert.equal(row.input_type,'MATERIAL');assert(row.reference_unit_price>0);assert.equal(row.reference_date,'2026-11-05');assert.equal(new URL(row.source_url).hostname,'www.telhanorte.com.br');assert(row.description.trim());assert(row.unit);}
 assert(new Set(manifest.additions.map(r=>r.category)).size>=12);
});
