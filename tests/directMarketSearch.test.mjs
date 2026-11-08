import test from 'node:test';
import assert from 'node:assert/strict';
import {parsePotiguar,parseVtex,packaging,searchStores} from '../supabase/functions/market-search/stores.mjs';
const card=(price='6,90',link='/produto/cimento-branco-1kg')=>`<div spot-container><a href=${link}><img/></a><span class="font-semibold">Cimento Branco 1kg Plastimassa</span><div class="font-extrabold">R$ ${price}<span>a vista</span></div><input value='{"value":999}'/>`;
test('preço visível da loja com revisão obrigatória, rejeitando URL externa',()=>{
 const [o]=parsePotiguar(card(),'cimento branco','kg');assert.equal(o.price,6.9);assert.equal(o.packQuantity,1);assert(o.unitKnown);assert.equal(o.comparable,false);
 assert.equal(parsePotiguar(card(),'cabo cobre','m').length,0);
 assert.equal(parsePotiguar(card('0,00'),'cimento','kg').length,0);
 assert.equal(parsePotiguar(card('6,90','https://malicioso.example/x'),'cimento','kg').length,0);
 assert.equal(parsePotiguar('<div spot-container><input value=999>','cimento','kg').length,0);
});
test('não converte massa/volume nem comprimento ambíguo',()=>{
 assert.equal(packaging('Cimento 50kg','kg').packQuantity,50);
 assert.equal(packaging('Tinta 18L','kg').unitKnown,false);
 assert.equal(packaging('Tubo 6m 25mm','m').packQuantity,6);
 assert.equal(packaging('Placa 2m x 3m','m').unitKnown,false);
 assert.equal(packaging('Saco cimento 50kg','saco').unitKnown,false);
 assert.equal(packaging('Caixa de 100 parafusos','un').unitKnown,false);
});
const product={productName:'Cimento Cinza 50kg',link:'https://www.telhanorte.com.br/cimento/p',items:[{nameComplete:'Cimento Cinza 50kg',measurementUnit:'un',unitMultiplier:1,sellers:[{sellerDefault:true,commertialOffer:{Price:36.9,AvailableQuantity:5}}]}]};
test('Telhanorte exclui indisponíveis, alheios e preço não numérico',()=>{
 assert.equal(parseVtex([product],'cimento','kg')[0].packQuantity,50);
 assert.equal(parseVtex([product],'areia','kg').length,0);
 for(const patch of [{Price:0},{Price:'36.90'},{AvailableQuantity:0}]){const p=structuredClone(product);Object.assign(p.items[0].sellers[0].commertialOffer,patch);assert.equal(parseVtex([p],'cimento','kg').length,0);}
 assert.throws(()=>parseVtex({},'cimento','kg'));
});
test('falha parcial não interrompe busca geral, loja arbitrária não causa fetch',async()=>{
 const calls=[];const fetcher=async(url,options)=>{calls.push(url);assert.equal(options.redirect,'error');if(url.includes('telhanorte'))throw Error('blocked');return new Response(card());};
 const result=await searchStores('cimento','', 'kg',fetcher);assert.equal(result.offers.length,1);assert.equal(result.stores[1].status,'unavailable');assert.equal(calls.length,2);
 const invalid=await searchStores('cimento','http://localhost','kg',fetcher);assert.equal(calls.length,2);assert.equal(invalid.offers.length,0);
});
test('bloqueio não é resultado de catálogo',async()=>{
 const r=await searchStores('cimento','potiguar','kg',async()=>new Response('captcha enable javascript'));assert.equal(r.offers.length,0);assert.equal(r.stores[0].status,'unavailable');
});
