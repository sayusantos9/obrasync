import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=path=>fs.readFileSync(new URL(path,import.meta.url),'utf8').replace(/^\uFEFF/,'').replace(/^import .*;\r?\n/gm,'').replace(/export /g,'');
test('voltar restaura tela e aba de origem do catálogo, inclusive estoque e atalhos',()=>{
 let state;
 const hook=vm.runInNewContext(source('../src/hooks/useAppNavigation.js')+';useAppNavigation',{Keyboard:{dismiss(){}},SCREENS:{TABS:'tabs'},TABS:{HOME:'home'},useRef:value=>({current:value}),useState:value=>{state=value;return [value,next=>{state=next;}];}});
 const nav=hook();nav.openScreen('settings');nav.selectTab('materials');nav.goBack();assert.equal(state.screen,'settings');assert.equal(state.tab,'home');
 nav.selectTab('materials');nav.openScreen('stock');nav.goBack();assert.equal(state.screen,'tabs');assert.equal(state.tab,'materials');nav.goBack();assert.equal(state.screen,'settings');
 nav.resetNavigation();nav.selectTab('materials');nav.goBack();assert.equal(state.tab,'home');nav.goBack();assert.equal(state.tab,'home');
});
test('PDF compartilha apenas cache próprio depois da escrita base64 concluir',async()=>{
 let written=false,shared,printOptions;
 class File{constructor(base,name){this.uri=base+name;}create(){}async write(bytes,options){assert.equal(bytes,'JVBERi0=');assert.equal(options.encoding,'base64');await new Promise(r=>setTimeout(r,10));written=true;}}
 const generate=vm.runInNewContext(source('../src/services/pdfSharingService.js')+';generateAndSharePdf',{Print:{printToFileAsync:async options=>{printOptions=options;return {uri:'file:///forbidden/print.pdf',base64:'JVBERi0='};}},Sharing:{isAvailableAsync:async()=>true,shareAsync:async uri=>{assert(written);shared=uri;}},File,Paths:{cache:'file:///scoped-cache/'}});
 const result=await generate('<html/>','Relatório da obra');assert(printOptions.base64);assert(shared.startsWith('file:///scoped-cache/'));assert.equal(result.uri,shared);assert(result.wasShared);
});
