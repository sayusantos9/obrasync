import test from 'node:test';
import assert from 'node:assert/strict';
import {marketComparison} from '../src/utils/marketPrices.js';
import {canAccessRoute,requiresProject} from '../src/utils/permissions.js';
const now=new Date('2026-11-04T15:00:00Z');
const offer={id:'1',supplier:'Loja',product:'Cabo',url:'',pack_quantity:100,price:200,freight:30,surveyed_quantity:150,postal_code:'65000000',payment:'À vista',in_stock:true,verified_spec:true,observed_on:'2026-11-04',created_at:'2026-11-04T12:00:00Z'};
test('compara embalagens inteiras com frete e preço por unidade',()=>{
 const [o]=marketComparison([offer],150,'65000000','À vista',now);
 assert.equal(o.packs,2);assert.equal(o.total,430);assert.equal(o.unitPrice,2);assert(o.eligible);
});
test('não recomenda preço antigo, incompleto ou de outra condição',()=>{
 for(const patch of [{freight:null},{verified_spec:false},{in_stock:false},{postal_code:'11111111'},{payment:'Parcelado'},{surveyed_quantity:100},{observed_on:'2026-10-01'}]) {
  const [o]=marketComparison([{...offer,...patch}],150,'65000000','À vista',now);assert(!o.eligible);assert(o.reasons.length);
 }
});
test('última consulta substitui oferta anterior sem apagar histórico',()=>{
 const old={...offer,id:'old',price:1,observed_on:'2026-11-03'};
 const rows=[old,offer];const result=marketComparison(rows,150,'65000000','À vista',now);
 assert.equal(result.length,1);assert.equal(result[0].id,'1');assert.equal(rows.length,2);
});
test('preço baixo não conferido não vence uma oferta elegível',()=>{
 const rows=marketComparison([offer,{...offer,id:'2',supplier:'Outra',price:1,verified_spec:false}],150,'65000000','À vista',now);
 assert.equal(rows[0].id,'1');
});
test('pesquisa exige obra e perfis de gestão, engenharia ou compras',()=>{
 for(const role of ['MASTER','ENGINEERING','PURCHASING'])assert(canAccessRoute(role,'market-prices'));
 for(const role of ['CLIENT','REQUESTER'])assert(!canAccessRoute(role,'market-prices'));
 assert(requiresProject('market-prices'));
});
