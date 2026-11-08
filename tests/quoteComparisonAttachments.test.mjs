import test from 'node:test';
import assert from 'node:assert/strict';
import {prepareComparableQuote,basketSignature,compareQuoteRound} from '../src/utils/quoteComparison.js';
import {attachmentType,MAX_ATTACHMENT_BYTES,canUploadAttachment} from '../src/utils/operationAttachments.js';
const item={inputId:'i1',source:'shared',code:'CIM-1',description:'Cimento',inputType:'MATERIAL',unit:'sc',quantity:2,unitPrice:'10,50'};
const draft={title:'Proposta',roundTitle:'Materiais',supplierName:'Fornecedor',validUntil:'20/11/2026',expectedAt:'15/11/2026',items:[item],freight:'10,00',taxes:2,discount:3};
test('Cotação recalcula itens e adicionais sem confiar no total informado',()=>{
 const q=prepareComparableQuote({...draft,total:1},'p');assert.equal(q.total,30);assert.equal(q.items[0].unitPrice,10.5);assert.equal(q.expectedAt,'2026-11-15');
 for(const patch of [{items:[item,item]},{items:[{...item,unitPrice:''}]},{discount:100},{freight:'x'},{expectedAt:''},{items:[{...item,inputType:'LABOR'}]}])assert.throws(()=>prepareComparableQuote({...draft,...patch},'p'));
});
test('Mapa compara identidade e quantidade, exclui vencidas do menor preço e preserva empate',()=>{
 const q={...prepareComparableQuote(draft,'p'),id:'q1',roundId:'r'};
 const map=compareQuoteRound([q,{...q,id:'q2'},{...q,id:'q3',validUntil:'2026-10-01',total:1}],'2026-11-06');
 assert.equal(map.rows.filter(r=>r.lowest).length,2);assert.equal(map.rows[2].lowest,false);assert.equal(map.rows[2].expired,true);
 assert.equal(compareQuoteRound([q,{...q,items:[{...item,quantity:3}]}],'2026-11-06').sameBasket,false);
 assert.equal(basketSignature([{...item,inputId:null}]),null);
});
test('Anexo valida limite, assinatura do conteúdo e permissão por operação',()=>{
 assert.equal(attachmentType('nota.pdf',new Uint8Array([37,80,68,70,45])),'application/pdf');
 assert.equal(attachmentType('foto.jpg',new Uint8Array([255,216,255,0])),'image/jpeg');
 assert.throws(()=>attachmentType('falso.pdf',new Uint8Array([1,2,3])));
 assert.throws(()=>attachmentType('grande.pdf',new Uint8Array(MAX_ATTACHMENT_BYTES+1)));
 assert.equal(canUploadAttachment('ENGINEERING','quote'),true);assert.equal(canUploadAttachment('ENGINEERING','order'),false);assert.equal(canUploadAttachment('CLIENT','receipt'),false);
});
