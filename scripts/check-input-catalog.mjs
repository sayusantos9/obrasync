import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const root = new URL('../', import.meta.url);
const read = (path) => fs.readFileSync(new URL(path, root), 'utf8');
const moduleFrom = (source) => import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
const rows = JSON.parse(read('supabase/seeds/insumos_turiacu.json'));
const { filterInputCatalog } = await moduleFrom(read('src/utils/inputCatalog.js'));

assert.equal(rows.length, 134);
assert.equal(new Set(rows.map((row) => row.catalog_code)).size, 134);
assert.equal(rows.filter((row) => row.source_code === null).length, 2);
assert.equal(rows.filter((row) => row.category === null).length, 11);
assert.equal(rows.find((row) => row.catalog_code === 'TUR-0001').reference_quantity, 0.000144);
assert.equal(filterInputCatalog(rows, '', 'Todas', 'ORSE').length, 52);
assert.equal(filterInputCatalog(rows, '', 'Sem categoria').length, 11);
assert.ok(filterInputCatalog(rows, 'mao').some((row) => row.description.includes('mão') || row.category === 'Mão de Obra'));
assert.equal(filterInputCatalog(rows, '00000868/SIN')[0].reference_unit_price, 31.43);
assert.equal(filterInputCatalog(rows, 'TUR-0001').length, 1);
assert.equal(filterInputCatalog(rows, 'inexistente-xyz').length, 0);

// Exercise pagination and failure handling without network or privileged credentials.
let calls = [];
let failure = false;
globalThis.__catalogTestClient = {
  from(table) {
    assert.equal(table, 'input_catalog');
    return { select() { return this; }, eq(field, value) {
      assert.equal(field, 'is_material'); assert.equal(value, true); return this;
    }, order(field) {
      assert.equal(field, 'catalog_code'); return this;
    }, async range(start, end) {
      calls.push([start, end]);
      if (failure) return { data: null, error: new Error('Network unavailable') };
      return { data: start === 0 ? Array.from({ length: 500 }, (_, id) => ({ id })) : [{ id: 500 }], error: null };
    } };
  },
};
const service = await moduleFrom(read('src/services/inputCatalogService.js')
  .replace("import { supabase } from '../lib/supabase';", 'const supabase = globalThis.__catalogTestClient;'));
assert.equal((await service.fetchInputCatalog()).length, 501);
assert.deepEqual(calls, [[0, 499], [500, 999]]);
failure = true;
await assert.rejects(service.fetchInputCatalog, /Network unavailable/);
delete globalThis.__catalogTestClient;

const parser = require('@babel/parser');
for (const path of ['src/screens/MaterialsScreen.js', 'src/screens/MasterPanelScreen.js', 'src/screens/StockScreen.js', 'src/services/inputCatalogService.js', 'src/utils/inputCatalog.js']) {
  parser.parse(read(path), { sourceType: 'module', plugins: ['jsx'] });
}
console.log('PASS: 134 registros, integridade, busca, filtros, paginação, erros e sintaxe JSX.');
